import { prisma } from './prisma'
import { createClient } from './supabase/server'

/**
 * Sync Supabase Auth user to local database Profile
 * This ensures OAuth users (Google, etc.) have a profile in our local DB
 */
export async function syncUserToDB(): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('No authenticated user found for sync')
      return
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (existingProfile) {
      // Profile exists, just update email if it changed
      if (user.email && existingProfile.email !== user.email) {
        await prisma.profile.update({
          where: { userId: user.id },
          data: { email: user.email }
        })
      }
      return
    }

    // Create profile for OAuth user
    // Extract name from user metadata or email
    const fullName = user.user_metadata?.full_name || 
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] || 
                    'User'

    await prisma.profile.create({
      data: {
        userId: user.id,
        email: user.email || null,
        fullName: fullName,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      }
    })

    console.log('✅ Synced OAuth user to database:', { userId: user.id, email: user.email })
  } catch (error) {
    console.error('❌ Error syncing user to database:', error)
    // Don't throw - this is a background sync operation
  }
}
