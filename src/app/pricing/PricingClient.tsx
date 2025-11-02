'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Check, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface PricingClientProps {
  user: User | null
}

const plans = [
  {
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Perfect for trying out',
    features: [
      '5 GB Storage',
      'Up to 100 files',
      'Basic support',
      'Community access',
    ],
    priceId: null,
    popular: false,
  },
  {
    name: 'Pro',
    price: 19,
    interval: 'month',
    description: 'For professionals',
    features: [
      '100 GB Storage',
      'Unlimited files',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
  },
  {
    name: 'Business',
    price: 49,
    interval: 'month',
    description: 'For growing businesses',
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
    popular: false,
  },
]

export function PricingClient({ user }: PricingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!user) {
      router.push('/login?redirectTo=/pricing')
      return
    }

    if (!priceId) {
      // Free plan
      router.push('/dashboard')
      return
    }

    setLoading(planName)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL returned from checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge className="mb-4">Pricing</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Choose your plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free and scale as you grow. All plans include 14-day free trial.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? 'border-[#1E3A8A] border-2 relative' : ''}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                <Badge className="bg-[#1E3A8A]">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-gray-600">/{plan.interval}</span>
                )}
                {plan.price === 0 && (
                  <span className="text-gray-600"> {plan.interval}</span>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="border-t pt-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-600">
              We accept all major credit cards through Stripe's secure payment processing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-gray-600">
              Yes, all paid plans include a 14-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}





