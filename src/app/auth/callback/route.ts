import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/admin/config'
import { getAppUrl } from '@/lib/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Get the correct app URL for redirects
  // Always prioritize NEXT_PUBLIC_APP_URL environment variable
  const appUrl = getAppUrl(request)
  
  // Log for debugging (remove in production if needed)
  console.log('🔗 OAuth callback - Using app URL:', appUrl)
  console.log('🔗 OAuth callback - Request URL:', request.url)
  console.log('🔗 OAuth callback - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

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

        // Use getAppUrl to ensure correct redirect URL (handles HTTP/HTTPS and environment variables)
        return NextResponse.redirect(`${appUrl}${redirectPath}`)
      } catch (dbError) {
        console.error('❌ Database error in OAuth callback:', dbError)
        // Still redirect even if profile creation fails
        return NextResponse.redirect(`${appUrl}/create-profile`)
      }
    } else {
      console.error('❌ OAuth error:', error)
    }
  }

  // Return the user to login with error message
  return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`)
}


