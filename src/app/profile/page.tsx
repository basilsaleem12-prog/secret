import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Mail, GraduationCap, Briefcase } from 'lucide-react'
import ProfileRatingClient from './ProfileRatingClient'

export default async function ProfilePage() {
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                Profile
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Manage your account information
              </p>
            </div>
            <Link href="/profile/edit">
              <Button className="btn-gradient">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Profile Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || 'User'}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
                >
                  {profile.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {profile.fullName || 'No Name Set'}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  <Mail className="w-4 h-4" />
                  {profile.email || user.email}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4" style={{ borderColor: 'var(--border)' }}>
              {/* Bio */}
              {profile.bio && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Bio
                  </label>
                  <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Department & Year */}
              <div className="grid grid-cols-2 gap-4">
                {profile.department && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                      <GraduationCap className="w-4 h-4" />
                      Department
                    </label>
                    <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {profile.department}
                    </p>
                  </div>
                )}
                {profile.year && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                      <Briefcase className="w-4 h-4" />
                      Year
                    </label>
                    <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {profile.year}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Skills
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        style={{ 
                          backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                          color: '#2563EB',
                          borderColor: 'rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Interests
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        style={{ 
                          backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                          color: '#2563EB',
                          borderColor: 'rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Account Role
                </label>
                <div className="mt-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {profile.role === 'SEEKER' ? 'Talent Seeker' : 'Talent Finder'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* AI Profile Rating Section */}
          <ProfileRatingClient userId={user.id} />
        </div>
      </main>
    </div>
  )
}


