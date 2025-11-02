import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface UpdateProfileBody {
  fullName?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  department?: string
  year?: string
}

/**
 * PATCH /api/profile/update - Update user profile
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body: UpdateProfileBody = await request.json()
    const { fullName, bio, skills, interests, department, year } = body

    // Validate inputs
    if (fullName !== undefined && (!fullName.trim() || fullName.trim().length < 2)) {
      return NextResponse.json({ 
        error: 'Full name must be at least 2 characters' 
      }, { status: 400 })
    }

    if (bio !== undefined && bio.length > 500) {
      return NextResponse.json({ 
        error: 'Bio must be less than 500 characters' 
      }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (fullName !== undefined) updateData.fullName = fullName.trim()
    if (bio !== undefined) updateData.bio = bio.trim() || null
    if (skills !== undefined) updateData.skills = skills.filter(s => s.trim())
    if (interests !== undefined) updateData.interests = interests.filter(i => i.trim())
    if (department !== undefined) updateData.department = department.trim() || null
    if (year !== undefined) updateData.year = year.trim() || null

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        skills: true,
        interests: true,
        role: true,
        department: true,
        year: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

