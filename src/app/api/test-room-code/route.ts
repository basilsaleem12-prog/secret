import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { create100msRoomCode, createHMSRoom } from '@/lib/100ms/service'

/**
 * POST /api/test-room-code - Test room code generation
 * Body: { roomId?: string, createNewRoom?: boolean, jobId?: string, requesterId?: string, receiverId?: string }
 * 
 * If roomId is provided, tests room code generation for that room
 * If createNewRoom is true, creates a new room and generates its room code
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const { roomId, createNewRoom, jobId, requesterId, receiverId } = body

    // Check if management token is configured
    const managementToken = process.env.HMS_MANAGEMENT_TOKEN
    if (!managementToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'HMS_MANAGEMENT_TOKEN is not configured',
          message: 'Please set HMS_MANAGEMENT_TOKEN in your .env file'
        },
        { status: 503 }
      )
    }

    // Check if access key and secret are configured
    const accessKey = process.env.HMS_APP_ACCESS_KEY
    const secret = process.env.HMS_APP_SECRET
    if (!accessKey || !secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'HMS_APP_ACCESS_KEY or HMS_APP_SECRET is not configured',
          message: 'Please set both HMS_APP_ACCESS_KEY and HMS_APP_SECRET in your .env file'
        },
        { status: 503 }
      )
    }

    let testRoomId = roomId
    let roomCreated = false

    // Option 1: Create a new room and generate code for it
    if (createNewRoom) {
      try {
        console.log('🧪 Creating new room for testing...')
        const roomResult = await createHMSRoom(
          jobId || 'test-job',
          requesterId || profile.id,
          receiverId || profile.id
        )
        
        testRoomId = roomResult.roomId
        roomCreated = true
        
        console.log('✅ Test room created:', {
          roomId: testRoomId,
          roomName: roomResult.roomName,
          hasRoomCode: !!roomResult.roomCode
        })

        // If room code was already created, return it
        if (roomResult.roomCode) {
          return NextResponse.json({
            success: true,
            roomId: testRoomId,
            roomName: roomResult.roomName,
            roomCode: roomResult.roomCode,
            message: 'Room created and room code generated successfully!',
            iframeUrl: `https://${process.env.NEXT_PUBLIC_HMS_SUBDOMAIN || 'your-subdomain'}.app.100ms.live/preview/${roomResult.roomCode}`,
            created: true
          })
        }
      } catch (roomError) {
        console.error('❌ Failed to create test room:', roomError)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create room',
            details: roomError instanceof Error ? roomError.message : 'Unknown error',
            troubleshooting: {
              checkCredentials: 'Verify HMS_APP_ACCESS_KEY and HMS_APP_SECRET are correct',
              checkTemplate: 'Verify HMS_TEMPLATE_ID exists in your 100ms dashboard',
              checkAccount: 'Ensure your 100ms account is active and has room creation permissions'
            }
          },
          { status: 500 }
        )
      }
    }

    // Option 2: Test with provided room ID
    if (!testRoomId || typeof testRoomId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'roomId is required or createNewRoom must be true',
          message: 'Provide either a roomId to test, or set createNewRoom: true to create a new room',
          exampleRequest: {
            testExistingRoom: { roomId: 'your-room-id-from-100ms-dashboard' },
            createNewRoom: { createNewRoom: true, jobId: 'test-job', requesterId: profile.id, receiverId: profile.id }
          }
        },
        { status: 400 }
      )
    }

    console.log('🧪 Testing room code generation for room ID:', testRoomId)

    // Try to generate room code for the room
    try {
      const roomCode = await create100msRoomCode(testRoomId)

      if (roomCode) {
        return NextResponse.json({
          success: true,
          roomId: testRoomId,
          roomCode,
          message: 'Room code generated successfully!',
          iframeUrl: `https://${process.env.NEXT_PUBLIC_HMS_SUBDOMAIN || 'your-subdomain'}.app.100ms.live/preview/${roomCode}`,
          created: roomCreated
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Room code generation returned undefined',
            roomId: testRoomId,
            details: 'Check HMS_MANAGEMENT_TOKEN and ensure the room exists in 100ms'
          },
          { status: 500 }
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Room code generation error:', error)

      // Provide specific troubleshooting based on error
      let troubleshooting: Record<string, string> = {
        checkManagementToken: 'Verify HMS_MANAGEMENT_TOKEN is correct and has room code creation permissions',
        checkRoomExists: 'Ensure the room ID exists in your 100ms dashboard',
        checkRoomFormat: 'Verify the room ID format is correct (not a UUID, should be a 100ms room ID)',
        checkTemplate: 'Ensure the room uses a template with a "guest" role enabled'
      }

      if (errorMessage.includes('room not found') || errorMessage.includes('404')) {
        troubleshooting.verifyRoomId = 'The room ID may not exist. Check your 100ms dashboard or create a new room using createNewRoom: true'
        troubleshooting.getRoomId = 'Get the room ID from: https://dashboard.100ms.live/rooms'
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate room code',
          roomId: testRoomId,
          details: errorMessage,
          troubleshooting,
          suggestion: roomCreated 
            ? 'The room was just created but room code generation failed. This might be a timing issue - try again in a few seconds.'
            : 'Try creating a new room by sending createNewRoom: true, or verify your room ID is correct.'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in test-room-code endpoint:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test room code generation', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
