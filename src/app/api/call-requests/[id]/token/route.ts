import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateHostToken, generateGuestToken } from '@/lib/100ms/service'

/**
 * GET /api/call-requests/[id]/token - Generate HMS token for joining the call
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

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { id: callRequestId } = await params

    // Get call request
    const callRequest = await prisma.callRequest.findUnique({
      where: { id: callRequestId },
      include: {
        job: {
          select: {
            id: true,
            title: true
          }
        },
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

    // Verify user is either requester or receiver
    const isRequester = callRequest.requesterId === profile.id
    const isReceiver = callRequest.receiverId === profile.id

    if (!isRequester && !isReceiver) {
      return NextResponse.json(
        { error: 'You are not authorized to join this call' },
        { status: 403 }
      )
    }

    // Check if call request is accepted
    if (callRequest.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Call request has not been accepted yet' },
        { status: 400 }
      )
    }

    // Check if room exists
    if (!callRequest.roomId) {
      return NextResponse.json(
        { error: 'Room has not been created yet' },
        { status: 400 }
      )
    }

    // Check if 100ms is properly configured
    const hmsAccessKey = process.env.HMS_APP_ACCESS_KEY
    const hmsSecret = process.env.HMS_APP_SECRET
    
    if (!hmsAccessKey || !hmsSecret) {
      return NextResponse.json(
        { 
          error: '100ms video calling is not configured. Please contact the administrator to set up HMS_APP_ACCESS_KEY and HMS_APP_SECRET environment variables.',
          code: 'HMS_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

    // Check if this is a mock room (development mode)
    if (callRequest.roomId.includes('mock') || callRequest.roomId.length === 36) {
      // UUID format suggests it might be a mock room
      console.warn('⚠️  Attempting to join with potentially mock room ID:', callRequest.roomId)
    }

    // Generate token based on user role
    const userName = profile.fullName || profile.email || 'User'
    let token: string

    try {
      if (isReceiver) {
        // Job poster is the host
        token = generateHostToken(callRequest.roomId, profile.id, userName)
      } else {
        // Job seeker is the guest
        token = generateGuestToken(callRequest.roomId, profile.id, userName)
      }
    } catch (error) {
      console.error('❌ Error generating token:', error)
      return NextResponse.json(
        { 
          error: 'Failed to generate authentication token. Please check 100ms configuration.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      token,
      roomId: callRequest.roomId,
      roomName: callRequest.roomName,
      role: isReceiver ? 'host' : 'guest',
      callRequest: {
        id: callRequest.id,
        status: callRequest.status,
        scheduledTime: callRequest.scheduledTime,
        job: callRequest.job,
        requester: callRequest.requester,
        receiver: callRequest.receiver
      }
    })

  } catch (error) {
    console.error('Error generating HMS token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

