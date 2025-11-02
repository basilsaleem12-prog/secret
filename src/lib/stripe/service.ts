import { stripe } from './config'
import { prisma } from '../prisma'
import Stripe from 'stripe'

export class StripeService {
  /**
   * Create or retrieve a Stripe customer
   */
  static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // Save customer ID to database
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    })

    return customer.id
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(params: {
    userId: string
    email: string
    priceId: string
    successUrl: string
    cancelUrl: string
  }): Promise<Stripe.Checkout.Session> {
    const customerId = await this.getOrCreateCustomer(params.userId, params.email)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
        },
      },
    })

    return session
  }

  /**
   * Create a one-time payment checkout session
   */
  static async createPaymentSession(params: {
    userId: string
    email: string
    amount: number
    description: string
    successUrl: string
    cancelUrl: string
  }): Promise<Stripe.Checkout.Session> {
    const customerId = await this.getOrCreateCustomer(params.userId, params.email)

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: params.description,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
      },
    })

    return session
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    return subscription
  }

  /**
   * Resume a canceled subscription
   */
  static async resumeSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return subscription
  }

  /**
   * Create a billing portal session
   */
  static async createPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  }

  /**
   * List customer invoices
   */
  static async listInvoices(customerId: string, limit = 10) {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })

    return invoices.data
  }

  /**
   * Get invoice details
   */
  static async getInvoice(invoiceId: string) {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    return invoice
  }

  /**
   * Update customer payment method
   */
  static async updatePaymentMethod(customerId: string, paymentMethodId: string) {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  /**
   * Get usage stats for billing
   */
  static async getUsageStats(userId: string) {
    const [fileCount, totalStorage] = await Promise.all([
      prisma.file.count({
        where: { userId, deletedAt: null },
      }),
      prisma.file.aggregate({
        where: { userId, deletedAt: null },
        _sum: { size: true },
      }),
    ])

    return {
      fileCount,
      totalStorage: totalStorage._sum.size || 0,
      totalStorageGB: ((totalStorage._sum.size || 0) / (1024 * 1024 * 1024)).toFixed(2),
    }
  }
}





