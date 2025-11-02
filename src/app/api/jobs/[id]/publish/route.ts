import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface PublishJobBody {
  isPublished: boolean
}

// POST /api/jobs/[id]/publish - Toggle job published status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body: PublishJobBody = await request.json()

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the job
    const job = await prisma.job.findUnique({
      where: { id }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify ownership
    if (job.createdById !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only approved jobs can be published
    if (job.status !== 'APPROVED' && body.isPublished) {
      return NextResponse.json({ 
        error: 'Only approved jobs can be published' 
      }, { status: 400 })
    }

    // Update publish status
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        isPublished: body.isPublished,
        publishedAt: body.isPublished ? new Date() : null,
      }
    })

    return NextResponse.json({ 
      job: updatedJob,
      message: body.isPublished ? 'Job published successfully' : 'Job unpublished successfully'
    })
  } catch (error) {
    console.error('Error updating job publish status:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

