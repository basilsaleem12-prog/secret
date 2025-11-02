import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface FillJobBody {
  isFilled: boolean
}

// POST /api/jobs/[id]/fill - Mark job as filled/unfilled
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
    const body: FillJobBody = await request.json()

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

    // Update filled status
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        isFilled: body.isFilled,
      }
    })

    return NextResponse.json({ 
      job: updatedJob,
      message: body.isFilled 
        ? 'Job marked as filled. It will no longer appear in job listings.' 
        : 'Job reopened for applications.'
    })
  } catch (error) {
    console.error('Error updating job filled status:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

