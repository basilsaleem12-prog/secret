import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './DashboardClient'
import { isAdminEmail } from '@/lib/admin/config'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin - redirect to admin dashboard
  if (isAdminEmail(user.email)) {
    redirect('/admin')
  }

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Get active role from cookie
  const cookieStore = await cookies()
  const activeRole = cookieStore.get('campusconnect_active_role')?.value as 'SEEKER' | 'FINDER' | undefined

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DashboardClient profile={profile} serverActiveRole={activeRole} />
      </main>
    </div>
  )
}

