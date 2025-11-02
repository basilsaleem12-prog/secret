import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { JobsListClient } from './JobsListClient'

export default async function JobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile exists and fetch skills/interests for match calculation
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      skills: true,
      interests: true,
    },
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Fetch all published and approved jobs
  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      isFilled: false,
      status: 'APPROVED',
    },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          department: true,
          year: true,
          role: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <JobsListClient 
          jobs={jobs} 
          currentUserId={profile.id}
          userProfile={{
            skills: profile.skills,
            interests: profile.interests,
          }}
        />
      </main>
    </div>
  )
}

