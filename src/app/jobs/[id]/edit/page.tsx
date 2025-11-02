import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { EditJobForm } from './EditJobForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  // Get the job
  const job = await prisma.job.findUnique({
    where: { id }
  })

  if (!job) {
    redirect('/jobs')
  }

  // Verify ownership
  if (job.createdById !== profile.id) {
    redirect(`/jobs/${id}`)
  }

  // Only allow editing of pending, draft, or rejected jobs
  if (!['PENDING', 'REJECTED'].includes(job.status) && !job.isDraft) {
    redirect(`/jobs/${id}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EditJobForm job={job} />
      </main>
    </div>
  )
}

