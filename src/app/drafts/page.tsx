import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { DraftsClient } from './DraftsClient'

export default async function DraftsPage() {
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

  // Get all draft jobs
  const drafts = await prisma.job.findMany({
    where: {
      createdById: profile.id,
      isDraft: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DraftsClient drafts={drafts} />
      </main>
    </div>
  )
}

