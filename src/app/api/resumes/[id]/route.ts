import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { deleteResume } from '@/lib/storage/resumes'

/**
 * GET /api/resumes/[id] - Get resume info or redirect to download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the resume
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Check if user is the owner or is viewing an application
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Allow owner or job creator who received an application
    const isOwner = resume.user.userId === user.id
    
    if (!isOwner) {
      // Check if user has a job where this resume was submitted
      const hasAccess = await prisma.application.findFirst({
        where: {
          resumeUrl: id,
          job: {
            createdById: profile.id
          }
        }
      })

      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Redirect to Supabase Storage public URL
    return NextResponse.redirect(resume.publicUrl)

  } catch (error) {
    console.error('Error accessing resume:', error)
    return NextResponse.json(
      { error: 'Failed to access resume' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/resumes/[id] - Delete a resume
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify ownership
    const resume = await prisma.resume.findUnique({
      where: { id }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (resume.userId !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from Supabase Storage first
    try {
      await deleteResume(resume.storagePath)
    } catch (error) {
      console.error('Error deleting from storage:', error)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete the database record
    await prisma.resume.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Resume deleted successfully from database and storage' 
    })

  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/resumes/[id] - Set resume as default
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify ownership
    const resume = await prisma.resume.findUnique({
      where: { id }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (resume.userId !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Unset all other defaults
    await prisma.resume.updateMany({
      where: { userId: profile.id },
      data: { isDefault: false }
    })

    // Set this one as default
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: { isDefault: true },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        publicUrl: true,
        isDefault: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ 
      resume: updatedResume,
      message: 'Default resume updated' 
    })

  } catch (error) {
    console.error('Error updating resume:', error)
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    )
  }
}

