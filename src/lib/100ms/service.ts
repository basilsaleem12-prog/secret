import { HMS_CONFIG, HMS_ROLES, generateRoomName, generateRoomId } from './config'
import * as jwt from 'jsonwebtoken'

// Dynamic import for 100ms SDK to avoid build issues
async function getSDK() {
  const { SDK } = await import('@100mslive/server-sdk')
  return SDK
}

export interface CreateRoomResult {
  roomId: string
  roomName: string
  roomCode?: string // Room code for Prebuilt UI
}

export interface GenerateTokenParams {
  roomId: string
  userId: string
  role: 'host' | 'guest'
  userName: string
}

/**
 * Create a new 100ms room for video call
 */
export async function createHMSRoom(
  jobId: string,
  requesterId: string,
  receiverId: string
): Promise<CreateRoomResult> {
  const roomName = generateRoomName(jobId, requesterId)

  // Check if 100ms credentials are configured - REQUIRED, no mock rooms
  if (!HMS_CONFIG.appAccessKey || !HMS_CONFIG.appSecret) {
    const errorMsg = '100ms credentials not configured. Please set HMS_APP_ACCESS_KEY and HMS_APP_SECRET environment variables.'
    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }

  try {
    // Initialize 100ms SDK - handles authentication automatically
    const SDK = await getSDK()
    const sdk = new SDK(HMS_CONFIG.appAccessKey, HMS_CONFIG.appSecret)
    
    // Create room using SDK (as per 100ms guide)
    const room = await sdk.rooms.create({
      name: roomName,
      description: `Video call room for job interview`,
      template_id: HMS_CONFIG.templateId,
    })
    
    console.log('✅ Successfully created 100ms room:', room)
    
    const roomId = room.id
    const roomNameResult = room.name || roomName
  
    // Generate room code for Prebuilt UI - REQUIRED
    let roomCode: string | undefined
    try {
      roomCode = await create100msRoomCode(roomId)
      if (roomCode) {
        console.log('✅ Successfully created room code:', roomCode)
      } else {
        console.warn('⚠️  Room code creation returned undefined. Room created but code not available.')
      }
    } catch (codeError) {
      console.error('❌ Failed to create room code:', codeError)
      // Room was created but code failed - we can still use token-based approach
      console.warn('⚠️  Room created but room code failed. Token-based approach will be used as fallback.')
    }
    
    if (!roomCode) {
      console.warn('⚠️  No room code available. Users will need to use token-based authentication.')
    }
    
    return {
      roomId,
      roomName: roomNameResult,
      roomCode,
    }
  } catch (error) {
    console.error('❌ Error creating 100ms room:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide helpful error messages
    if (errorMessage.includes('Token') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
      throw new Error('100ms authentication failed. Please check HMS_APP_ACCESS_KEY and HMS_APP_SECRET. Make sure they are correct and your 100ms account is active.')
    }
    
    if (errorMessage.includes('template')) {
      throw new Error(`100ms template error: ${errorMessage}. Please check HMS_TEMPLATE_ID and ensure the template exists in your 100ms dashboard.`)
    }
    
    throw new Error(`Failed to create 100ms room: ${errorMessage}`)
  }
}

/**
 * Verify if a room exists in 100ms
 * @param {string} roomId - The room ID to verify
 * @returns {Promise<boolean>} True if room exists
 */
async function verifyRoomExists(roomId: string): Promise<boolean> {
  if (!HMS_CONFIG.managementToken) {
    return false
  }

  try {
    const response = await fetch(
      `https://api.100ms.live/v2/rooms/${roomId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${HMS_CONFIG.managementToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.ok
  } catch {
    return false
  }
}

/**
 * Create a room code for Prebuilt UI
 * Room codes allow users to join via iframe without tokens
 * @param {string} roomId - The room ID from createHMSRoom
 * @returns {Promise<string|undefined>} Room code (guest code)
 */
export async function create100msRoomCode(roomId: string): Promise<string | undefined> {
  // Check if management token is configured
  if (!HMS_CONFIG.managementToken) {
    console.warn('⚠️  HMS_MANAGEMENT_TOKEN not configured, cannot create room code')
    console.warn('⚠️  Set HMS_MANAGEMENT_TOKEN environment variable to enable Prebuilt UI (iframe) video calls')
    return undefined
  }

  try {
    // First verify the room exists
    const roomExists = await verifyRoomExists(roomId)
    if (!roomExists) {
      console.error('❌ Room does not exist in 100ms:', roomId)
      throw new Error(`Room not found: The room ID "${roomId}" does not exist in your 100ms account. Please verify the room ID or create a new room.`)
    }

    console.log('✅ Room verified to exist, creating room code...')
    console.log('📞 Calling 100ms API to create room code:', {
      url: `https://api.100ms.live/v2/room-codes/room/${roomId}`,
      roomId,
      hasManagementToken: !!HMS_CONFIG.managementToken
    })

    const response = await fetch(
      `https://api.100ms.live/v2/room-codes/room/${roomId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HMS_CONFIG.managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'guest',
          enabled: true,
        }),
      }
    )

    console.log('📥 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Unknown error' }
      }
      console.error('❌ Failed to create room code:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Room code creation failed: ${errorData.message || errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log('📋 Room code API response:', data)

    // Extract guest code from response
    let guestCode: string | undefined
    
    if (data && Array.isArray(data.data)) {
      // Response format: { data: [{ role: 'guest', code: '...' }] }
      const guestCodeObj = data.data.find((c: any) => c.role === 'guest')
      guestCode = guestCodeObj?.code
    } else if (data?.data && typeof data.data === 'object') {
      // Response format: { data: { code: '...' } }
      guestCode = data.data.code
    } else if (data?.code) {
      // Direct code in response
      guestCode = data.code
    }

    if (!guestCode) {
      console.error('❌ No guest code found in response:', data)
      throw new Error('Room code API returned no guest code')
    }

    console.log('✅ Extracted room code:', guestCode)
    return guestCode
  } catch (err) {
    console.error('❌ Error creating room code:', err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Unknown error creating room code')
  }
}

/**
 * Generate auth token for user to join 100ms room
 * This creates a JWT token that grants access to the room
 */
export function generateHMSToken(params: GenerateTokenParams): string {
  const { roomId, userId, role, userName } = params

  // Check if 100ms credentials are configured
  if (!HMS_CONFIG.appAccessKey || !HMS_CONFIG.appSecret) {
    console.warn('⚠️  100ms credentials not configured, generating mock token')
    // Generate a mock token for development
    return `mock-token-${userId}-${roomId}-${Date.now()}`
  }

  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    access_key: HMS_CONFIG.appAccessKey,
    room_id: roomId,
    user_id: userId,
    role: role === 'host' ? HMS_ROLES.HOST : HMS_ROLES.GUEST,
    type: 'app',
    version: 2,
    jti: `${userId}-${now}`, // JWT ID - unique identifier for this token
    iat: now,
    nbf: now,
    exp: now + 24 * 3600, // 24 hours validity
  }

  try {
    // Sign the JWT with the app secret
    const token = jwt.sign(payload, HMS_CONFIG.appSecret, {
      algorithm: 'HS256',
    })

    console.log('✅ Generated 100ms token for user:', { userId, role, roomId })
    return token
  } catch (error) {
    console.error('❌ Error generating HMS token:', error)
    throw new Error('Failed to generate authentication token')
  }
}

/**
 * Generate token for job poster (host)
 */
export function generateHostToken(
  roomId: string,
  userId: string,
  userName: string
): string {
  return generateHMSToken({
    roomId,
    userId,
    role: 'host',
    userName,
  })
}

/**
 * Generate token for job seeker (guest)
 */
export function generateGuestToken(
  roomId: string,
  userId: string,
  userName: string
): string {
  return generateHMSToken({
    roomId,
    userId,
    role: 'guest',
    userName,
  })
}

/**
 * End a 100ms room (optional - rooms auto-expire)
 * In production, this would call 100ms API to end the room
 */
export async function endHMSRoom(roomId: string): Promise<void> {
  console.log('🔚 Ending 100ms room:', roomId)
  
  // In production:
  // await fetch(`https://api.100ms.live/v2/rooms/${roomId}/end`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${HMS_CONFIG.appAccessKey}:${HMS_CONFIG.appSecret}`,
  //   },
  // })
}

/**
 * Get active sessions in a room
 * Useful for checking if anyone is still in the call
 */
export async function getActiveRoomSessions(roomId: string): Promise<number> {
  // In production, call 100ms API to get active sessions
  // For now, return mock data
  console.log('📊 Getting active sessions for room:', roomId)
  return 0
}

