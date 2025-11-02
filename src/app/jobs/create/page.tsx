import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { CreateJobForm } from './CreateJobForm'

export default async function CreateJobPage() {
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Post a New Opportunity
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Create a job posting to find talented collaborators
          </p>
        </div>

        <CreateJobForm profileId={profile.id} />
      </main>
    </div>
  )
}

