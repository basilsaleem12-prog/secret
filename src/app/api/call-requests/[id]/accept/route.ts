import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createHMSRoom } from '@/lib/100ms/service'
import { sendVideoCallAcceptedEmail } from '@/lib/email/service'

/**
 * POST /api/call-requests/[id]/accept - Accept a video call request
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
    
    // Parse body safely (may be empty)
    let scheduledTime = null
    try {
      const body = await request.json()
      scheduledTime = body.scheduledTime || null
    } catch (e) {
      // No body or invalid JSON, that's okay
      scheduledTime = null
    }

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
        },
        receiver: {
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
        { error: 'Only the job poster can accept this request' },
        { status: 403 }
      )
    }

    // Check if already accepted/rejected
    if (callRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${callRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Check if 100ms is properly configured
    const hmsAccessKey = process.env.HMS_APP_ACCESS_KEY
    const hmsSecret = process.env.HMS_APP_SECRET
    
    if (!hmsAccessKey || !hmsSecret) {
      return NextResponse.json(
        { 
          error: '100ms video calling is not configured on this server. Please ask the administrator to set up the HMS_APP_ACCESS_KEY and HMS_APP_SECRET environment variables. See 100MS_SETUP_GUIDE.md for instructions.',
          code: 'HMS_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

    // Create 100ms room
    let roomId: string
    let roomName: string
    
    try {
      const roomResult = await createHMSRoom(
        callRequest.jobId,
        callRequest.requesterId,
        callRequest.receiverId
      )
      roomId = roomResult.roomId
      roomName = roomResult.roomName
      
      console.log('✅ Room created successfully:', { roomId, roomName })
    } catch (error) {
      console.error('❌ Failed to create 100ms room:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create video call room. Please check 100ms configuration and try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Update call request
    const updatedRequest = await prisma.callRequest.update({
      where: { id: callRequestId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        roomId,
        roomName,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
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
    const { getAppUrl } = await import('@/lib/utils/url')
    const appUrl = getAppUrl(request)
    await prisma.notification.create({
      data: {
        userId: callRequest.requesterId,
        type: 'CALL_REQUEST_ACCEPTED',
        title: 'Video Call Accepted',
        content: `${profile.fullName || 'The job poster'} accepted your video call request for: ${callRequest.job.title}`,
        link: `/video-call/${callRequestId}`,
        metadata: JSON.stringify({
          callRequestId,
          jobId: callRequest.jobId,
          jobTitle: callRequest.job.title
        })
      }
    })
    
    // Generate video call link
    const videoCallLink = `${appUrl}/video-call/${callRequestId}`

    // Send video call accepted email (non-blocking)
    if (callRequest.requester.email) {
      sendVideoCallAcceptedEmail(
        callRequest.requester.email,
        callRequest.requester.fullName || 'User',
        profile.fullName || 'User',
        callRequest.job.title,
        callRequestId,
        scheduledTime,
        request
      ).catch(err => console.error('Failed to send video call accepted email:', err))
    }

    return NextResponse.json({
      callRequest: updatedRequest,
      message: 'Call request accepted successfully',
      roomId,
      roomName,
      videoCallLink
    })

  } catch (error) {
    console.error('Error accepting call request:', error)
    return NextResponse.json(
      { error: 'Failed to accept call request' },
      { status: 500 }
    )
  }
}

