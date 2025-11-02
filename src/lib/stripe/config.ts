import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'usd',
  successUrl: '/billing/success',
  cancelUrl: '/pricing',
} as const

// Pricing Plans Configuration
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    description: 'Perfect for trying out',
    price: 0,
    interval: 'month',
    features: [
      '5 GB Storage',
      'Up to 100 files',
      'Basic support',
      'Community access',
    ],
    maxFiles: 100,
    maxStorage: 5, // GB
  },
  PRO: {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: 1900, // $19.00 in cents
    interval: 'month',
    features: [
      '100 GB Storage',
      'Unlimited files',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
    maxFiles: null, // unlimited
    maxStorage: 100, // GB
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  BUSINESS: {
    name: 'Business',
    description: 'For growing businesses',
    price: 4900, // $49.00 in cents
    interval: 'month',
    features: [
      '1 TB Storage',
      'Unlimited files',
      '24/7 Premium support',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Team management',
      'SSO integration',
    ],
    maxFiles: null,
    maxStorage: 1000, // GB
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
  },
} as const





