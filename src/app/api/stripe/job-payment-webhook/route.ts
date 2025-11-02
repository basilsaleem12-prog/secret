import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const { jobId, userId, paymentAmount } = session.metadata || {}

      if (!jobId || !userId || !paymentAmount) {
        console.error('Missing metadata in session:', session.id)
        return NextResponse.json(
          { error: 'Invalid metadata' },
          { status: 400 }
        )
      }

      // Update job with payment information
      await prisma.job.update({
        where: { id: jobId },
        data: {
          isPaid: true,
          paymentAmount: parseFloat(paymentAmount),
          paymentCurrency: 'USD',
          stripePaymentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      })

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId,
          type: 'JOB_PAYMENT_SUCCESS',
          content: `Payment of $${paymentAmount} received for your job posting!`,
        },
      })

      console.log(`Job ${jobId} marked as paid with amount $${paymentAmount}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

