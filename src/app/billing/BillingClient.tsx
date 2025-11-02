'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Receipt,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

interface BillingClientProps {
  userId: string
  email: string
  subscription: any
  invoices: any[]
  stripeCustomerId: string | null
}

export function BillingClient({
  userId,
  email,
  subscription,
  invoices,
  stripeCustomerId,
}: BillingClientProps) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'trialing':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    {subscription ? 'Your active subscription' : 'No active subscription'}
                  </CardDescription>
                </div>
                {subscription && (
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan.name}</h3>
                    <p className="text-gray-600">{subscription.plan.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold">
                        ${(subscription.plan.amount / 100).toFixed(2)}/{subscription.plan.interval}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Renewal Date</p>
                      <p className="font-semibold">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Your subscription will cancel at the end of the billing period.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleManageBilling}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
                  <Link href="/pricing">
                    <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                      View Pricing Plans
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            ${(invoice.amount / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {invoice.invoiceNumber || 'Invoice'} •{' '}
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.hostedInvoiceUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No invoices yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {stripeCustomerId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Card on file</p>
                      <p className="text-xs text-gray-600">•••• •••• •••• ••••</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Update Payment Method
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No payment method on file</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/pricing" className="block">
                <Button variant="outline" className="w-full justify-start">
                  Change Plan
                </Button>
              </Link>
              {stripeCustomerId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleManageBilling}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoices
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about billing? Our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}





