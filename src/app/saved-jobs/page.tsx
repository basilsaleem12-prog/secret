import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { SavedJobsClient } from './SavedJobsClient'

export default async function SavedJobsPage() {
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

  // Get all bookmarked jobs
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: profile.id },
    include: {
      job: {
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              department: true,
              year: true,
              role: true,
            }
          },
          _count: {
            select: {
              applications: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SavedJobsClient bookmarks={bookmarks} currentUserId={profile.id} />
      </main>
    </div>
  )
}

