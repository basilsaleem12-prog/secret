import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { BillingClient } from './BillingClient'
import { prisma } from '@/lib/prisma'

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      subscriptions: {
        where: {
          status: {
            in: ['ACTIVE', 'TRIALING'],
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      invoices: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <BillingClient
        userId={user.id}
        email={user.email!}
        subscription={dbUser?.subscriptions[0] || null}
        invoices={dbUser?.invoices || []}
        stripeCustomerId={dbUser?.stripeCustomerId || null}
      />
    </div>
  )
}





