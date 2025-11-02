import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendVideoCallRejectedEmail } from '@/lib/email/service'

/**
 * POST /api/call-requests/[id]/reject - Reject a video call request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { id: callRequestId } = await params
    const body = await request.json()
    const { rejectReason } = body

    // Get call request
    const callRequest = await prisma.callRequest.findUnique({
      where: { id: callRequestId },
      include: {
        job: true,
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    if (!callRequest) {
      return NextResponse.json(
        { error: 'Call request not found' },
        { status: 404 }
      )
    }

    // Verify user is the receiver
    if (callRequest.receiverId !== profile.id) {
      return NextResponse.json(
        { error: 'Only the job poster can reject this request' },
        { status: 403 }
      )
    }

    // Check if already processed
    if (callRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${callRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Update call request
    const updatedRequest = await prisma.callRequest.update({
      where: { id: callRequestId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectReason: rejectReason || null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: callRequest.requesterId,
        type: 'CALL_REJECTED',
        content: `Your video call request for "${callRequest.job.title}" was declined`,
      }
    })

    // Send video call rejected email (non-blocking)
    if (callRequest.requester.email) {
      sendVideoCallRejectedEmail(
        callRequest.requester.email,
        callRequest.requester.fullName || 'User',
        profile.fullName || 'User',
        callRequest.job.title,
        rejectReason || '',
        request
      ).catch(err => console.error('Failed to send video call rejected email:', err))
    }

    return NextResponse.json({
      callRequest: updatedRequest,
      message: 'Call request rejected'
    })

  } catch (error) {
    console.error('Error rejecting call request:', error)
    return NextResponse.json(
      { error: 'Failed to reject call request' },
      { status: 500 }
    )
  }
}

