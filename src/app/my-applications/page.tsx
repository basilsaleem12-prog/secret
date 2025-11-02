import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { MyApplicationsClient } from './MyApplicationsClient'

export default async function MyApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Fetch all applications submitted by this user
  const applications = await prisma.application.findMany({
    where: { applicantId: profile.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          location: true,
          compensation: true,
          isPublished: true,
          isFilled: true,
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              department: true,
            }
          }
        }
      }
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  // Get status counts
  const statusCounts = await prisma.application.groupBy({
    by: ['status'],
    where: { applicantId: profile.id },
    _count: true
  })

  const counts = {
    ALL: applications.length,
    PENDING: statusCounts.find(s => s.status === 'PENDING')?._count || 0,
    SHORTLISTED: statusCounts.find(s => s.status === 'SHORTLISTED')?._count || 0,
    ACCEPTED: statusCounts.find(s => s.status === 'ACCEPTED')?._count || 0,
    REJECTED: statusCounts.find(s => s.status === 'REJECTED')?._count || 0,
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MyApplicationsClient applications={applications} counts={counts} />
      </main>
    </div>
  )
}

