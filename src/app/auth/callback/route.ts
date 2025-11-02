import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/admin/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      try {
        // Check if user has a profile in local database
        let profile = await prisma.profile.findUnique({
          where: { userId: data.user.id }
        })

        // If no profile exists, create one from OAuth user data
        if (!profile && data.user) {
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name ||
                          data.user.email?.split('@')[0] || 
                          'User'

          profile = await prisma.profile.create({
            data: {
              userId: data.user.id,
              email: data.user.email || null,
              fullName: fullName,
              avatarUrl: data.user.user_metadata?.avatar_url || 
                        data.user.user_metadata?.picture || 
                        null,
            }
          })

          console.log('✅ Created profile for OAuth user:', { 
            userId: data.user.id, 
            email: data.user.email 
          })
        }

        // Determine redirect based on profile completeness and user type
        let redirectPath = next
        
        if (!profile) {
          // This shouldn't happen, but fallback
          redirectPath = '/create-profile'
        } else if (isAdminEmail(data.user.email)) {
          // Admin user - go to admin dashboard
          redirectPath = '/admin'
        } else if (!profile.fullName || !profile.skills || profile.skills.length === 0) {
          // Profile exists but incomplete - redirect to profile creation/editing
          redirectPath = '/create-profile'
        } else {
          // Profile is complete - go to dashboard
          redirectPath = '/dashboard'
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      } catch (dbError) {
        console.error('❌ Database error in OAuth callback:', dbError)
        // Still redirect even if profile creation fails
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/create-profile`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/create-profile`)
        } else {
          return NextResponse.redirect(`${origin}/create-profile`)
        }
      }
    } else {
      console.error('❌ OAuth error:', error)
    }
  }

  // Return the user to login with error message
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}


