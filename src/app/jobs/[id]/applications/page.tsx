import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { ApplicationsPageClient } from './ApplicationsPageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id: jobId } = await params

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Get the job and verify ownership
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true
        }
      }
    }
  })

  if (!job) {
    redirect('/jobs')
  }

  // Verify the user owns this job
  if (job.createdById !== profile.id) {
    redirect(`/jobs/${jobId}`)
  }

  // Fetch all applications
  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      applicant: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          bio: true,
          skills: true,
          department: true,
          year: true,
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
    where: { jobId },
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
        <ApplicationsPageClient 
          job={job}
          initialApplications={applications}
          initialCounts={counts}
        />
      </main>
    </div>
  )
}

