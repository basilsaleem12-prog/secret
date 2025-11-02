import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { JobDetailClient } from './JobDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const jobId = resolvedParams.id

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Fetch job with all details
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          department: true,
          year: true,
          role: true,
        },
      },
      applications: {
        where: {
          applicantId: profile.id
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        }
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  })

  if (!job) {
    notFound()
  }

  // Check if job is accessible (must be published or created by user)
  if (!job.isPublished && job.createdById !== profile.id) {
    notFound()
  }

  // Increment view count (only if not the job creator)
  if (job.createdById !== profile.id) {
    await prisma.job.update({
      where: { id: jobId },
      data: { views: { increment: 1 } },
    })
  }

  // Check if user has bookmarked this job
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_jobId: {
        userId: profile.id,
        jobId: job.id,
      }
    }
  })

  // Check if user has an existing call request for this job
  const existingCallRequest = await prisma.callRequest.findFirst({
    where: {
      jobId: job.id,
      requesterId: profile.id,
      status: {
        in: ['PENDING', 'ACCEPTED']
      }
    },
    select: {
      id: true,
      status: true,
      roomId: true,
      scheduledTime: true,
      createdAt: true
    }
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <JobDetailClient 
          job={job} 
          currentProfile={profile} 
          initialBookmarked={!!bookmark}
          existingCallRequest={existingCallRequest}
        />
      </main>
    </div>
  )
}

