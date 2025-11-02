import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { create100msRoomCode, createHMSRoom } from '@/lib/100ms/service'

/**
 * Check if a room ID is a UUID (mock room from old system)
 */
function isUUID(roomId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(roomId)
}

/**
 * POST /api/call-requests/[id]/generate-room-code - Generate room code for an existing room
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

    // Get call request
    const callRequest = await prisma.callRequest.findUnique({
      where: { id: callRequestId },
      include: {
        requester: { select: { id: true } },
        receiver: { select: { id: true } }
      }
    })

    if (!callRequest) {
      return NextResponse.json(
        { error: 'Call request not found' },
        { status: 404 }
      )
    }

    // Verify user is authorized
    const isRequester = callRequest.requesterId === profile.id
    const isReceiver = callRequest.receiverId === profile.id

    if (!isRequester && !isReceiver) {
      return NextResponse.json(
        { error: 'You are not authorized to access this call' },
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

    // Check if room code already exists
    if (callRequest.roomCode) {
      return NextResponse.json({
        roomCode: callRequest.roomCode,
        message: 'Room code already exists'
      })
    }

    // Check if room ID is a UUID (old mock room) - need to create real room first
    let realRoomId = callRequest.roomId
    let realRoomName = callRequest.roomName

    if (isUUID(callRequest.roomId!)) {
      console.warn('⚠️  Room ID is a UUID (old mock room). Creating new real 100ms room...')
      
      try {
        // Create a new real 100ms room
        const roomResult = await createHMSRoom(
          callRequest.jobId,
          callRequest.requesterId,
          callRequest.receiverId
        )
        
        realRoomId = roomResult.roomId
        realRoomName = roomResult.roomName
        
        console.log('✅ Created new real 100ms room:', { roomId: realRoomId, roomName: realRoomName })
        
        // Update call request with new real room ID
        await prisma.callRequest.update({
          where: { id: callRequestId },
          data: {
            roomId: realRoomId,
            roomName: realRoomName,
          }
        })
      } catch (roomError) {
        console.error('❌ Failed to create new room:', roomError)
        return NextResponse.json(
          {
            error: 'Failed to create video call room. The existing room ID is invalid (old mock room).',
            code: 'INVALID_ROOM_ID',
            details: roomError instanceof Error ? roomError.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    }

    // Generate room code for the real room
    try {
      const roomCode = await create100msRoomCode(realRoomId!)

      if (!roomCode) {
        return NextResponse.json(
          { error: 'Failed to generate room code. Please check HMS_MANAGEMENT_TOKEN configuration.' },
          { status: 500 }
        )
      }

      // Update call request with room code
      await prisma.callRequest.update({
        where: { id: callRequestId },
        data: { roomCode }
      })

      return NextResponse.json({
        roomCode,
        message: 'Room code generated successfully',
        roomCreated: isUUID(callRequest.roomId!)
      })
    } catch (error) {
      console.error('❌ Error generating room code:', error)
      
      // If error is "room not found", it means the room ID is invalid
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('room not found') || errorMessage.includes('404')) {
        return NextResponse.json(
          {
            error: 'The video call room does not exist. This may be from an old mock room system. Please ask the job poster to accept the call request again to create a new room.',
            code: 'ROOM_NOT_FOUND',
            details: errorMessage
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        {
          error: 'Failed to generate room code',
          details: errorMessage
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error generating room code:', error)
    return NextResponse.json(
      { error: 'Failed to generate room code' },
      { status: 500 }
    )
  }
}

