import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@prisma/client'
import { notifyApplicationStatusChange } from '@/lib/notifications/service'
import { sendApplicationStatusEmail } from '@/lib/email/service'

interface UpdateStatusBody {
  status: ApplicationStatus // PENDING, SHORTLISTED, ACCEPTED, REJECTED
}

/**
 * PATCH /api/applications/[id]/status - Update application status (Job owner only)
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
    const body: UpdateStatusBody = await request.json()
    const { status } = body

    // Validate status
    if (!['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be PENDING, SHORTLISTED, ACCEPTED, or REJECTED' 
      }, { status: 400 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get application with job details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            createdById: true
          }
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user owns the job
    if (application.job.createdById !== profile.id) {
      return NextResponse.json({ 
        error: 'Only the job owner can update application status' 
      }, { status: 403 })
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            department: true,
            year: true,
          }
        }
      }
    })

    // Create notification for applicant (except for PENDING status)
    if (status !== 'PENDING') {
      await notifyApplicationStatusChange(
        application.applicant.id,
        application.job.id,
        application.job.title,
        status as 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
      );

      // Send status update email (non-blocking)
      if (application.applicant.email) {
        sendApplicationStatusEmail(
          application.applicant.email,
          application.applicant.fullName || 'User',
          status,
          application.job.title,
          application.job.id,
          request
        ).catch(err => console.error('Failed to send application status email:', err))
      }
    }

    return NextResponse.json({
      application: updatedApplication,
      message: `Application ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}

