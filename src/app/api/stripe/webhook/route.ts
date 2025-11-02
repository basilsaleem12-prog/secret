import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId

  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  // Update user with customer and subscription info
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT',
      title: 'Subscription Activated',
      message: 'Your subscription has been successfully activated!',
      actionUrl: '/billing',
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const plan = await prisma.plan.findUnique({
    where: { stripePriceId: subscription.items.data[0].price.id },
  })

  if (!plan) {
    console.error('Plan not found for price:', subscription.items.data[0].price.id)
    return
  }

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
    update: {
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    },
  })

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripePriceId: subscription.items.data[0].price.id,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })

  // Notify user
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    include: { user: true },
  })

  if (sub) {
    await prisma.notification.create({
      data: {
        userId: sub.userId,
        type: 'PAYMENT',
        title: 'Subscription Canceled',
        message: 'Your subscription has been canceled.',
        actionUrl: '/billing',
      },
    })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.userId || invoice.subscription_details?.metadata?.userId

  if (!userId) return

  // Create/update invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer as string,
      amount: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due - invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status!,
      invoiceNumber: invoice.number,
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
    },
    update: {
      status: invoice.status!,
      amountPaid: invoice.amount_paid,
      paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
    },
  })

  // Create payment record
  if (invoice.payment_intent) {
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentId: invoice.payment_intent as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'SUCCEEDED',
        description: `Payment for invoice ${invoice.number}`,
        stripeInvoiceId: invoice.id,
        receiptUrl: invoice.hosted_invoice_url,
      },
    })
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.userId

  if (!userId) return

  // Update invoice
  await prisma.invoice.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: { status: invoice.status! },
  })

  // Notify user
  await prisma.notification.create({
    data: {
      userId,
      type: 'PAYMENT',
      title: 'Payment Failed',
      message: 'Your payment failed. Please update your payment method.',
      actionUrl: '/billing',
    },
  })
}





