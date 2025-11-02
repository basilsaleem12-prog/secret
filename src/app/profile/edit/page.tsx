import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { EditProfileForm } from './EditProfileForm'

export default async function EditProfilePage() {
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <EditProfileForm profile={profile} />
      </main>
    </div>
  )
}

