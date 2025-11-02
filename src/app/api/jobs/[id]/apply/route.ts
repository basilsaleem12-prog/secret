import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notifyApplicationReceived } from '@/lib/notifications/service'
import { calculateMatchScore } from '@/lib/ai/match-scoring'

// POST /api/jobs/[id]/apply - Apply to a job
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

    const { id: jobId } = await params
    const body = await request.json()
    const { message, resumeUrl } = body

    // Get user's profile with full details
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        email: true,
        bio: true,
        skills: true,
        interests: true,
        department: true,
        year: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the job with full details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        tags: true,
        createdById: true,
        isPublished: true,
        isFilled: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // IMPORTANT: Prevent user from applying to their own job
    if (job.createdById === profile.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own job posting' },
        { status: 400 }
      )
    }

    // Check if job is published and not filled
    if (!job.isPublished) {
      return NextResponse.json(
        { error: 'This job is not published yet' },
        { status: 400 }
      )
    }

    if (job.isFilled) {
      return NextResponse.json(
        { error: 'This position has been filled' },
        { status: 400 }
      )
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: profile.id,
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Calculate AI match score
    let matchScore: number | null = null;
    try {
      const matchResult = await calculateMatchScore({
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.requirements,
        jobTags: job.tags,
        applicantSkills: profile.skills,
        applicantInterests: profile.interests,
        applicantBio: profile.bio,
        applicantProposal: message,
        applicantDepartment: profile.department,
        applicantYear: profile.year,
      });
      matchScore = matchResult.score;
    } catch (error) {
      console.error('Error calculating match score:', error);
      // Continue without match score if AI fails
    }

    // Create the application with match score
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: profile.id,
        proposal: message,
        resumeUrl,
        status: 'PENDING',
        matchScore,
      },
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
            department: true,
            skills: true,
          }
        },
        job: {
          select: {
            title: true,
            type: true,
          }
        }
      }
    })

    // Increment applications count
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } }
    })

    // Notify job owner about new application
    await notifyApplicationReceived(
      job.createdById,
      jobId,
      job.title,
      profile.fullName || 'A user'
    );

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

// GET /api/jobs/[id]/apply - Check if user has applied
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ hasApplied: false })
    }

    const application = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: profile.id,
        }
      }
    })

    return NextResponse.json({ 
      hasApplied: !!application,
      application: application || null 
    })
  } catch (error) {
    console.error('Error checking application:', error)
    return NextResponse.json(
      { error: 'Failed to check application' },
      { status: 500 }
    )
  }
}

