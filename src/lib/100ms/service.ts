import { HMS_CONFIG, HMS_ROLES, generateRoomName, generateRoomId } from './config'
import jwt from 'jsonwebtoken'

export interface CreateRoomResult {
  roomId: string
  roomName: string
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

  // Check if 100ms credentials are configured
  if (!HMS_CONFIG.appAccessKey || !HMS_CONFIG.appSecret) {
    console.warn('⚠️  100ms credentials not configured, using mock room')
    const mockRoomId = generateRoomId()
    return {
      roomId: mockRoomId,
      roomName,
    }
  }

  try {
    // Create Management Token for API calls
    const managementToken = Buffer.from(
      `${HMS_CONFIG.appAccessKey}:${HMS_CONFIG.appSecret}`
    ).toString('base64')

    // Call 100ms API to create a room
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${managementToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        template_id: HMS_CONFIG.templateId,
        region: HMS_CONFIG.region,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('❌ Failed to create 100ms room:', errorData)
      throw new Error(`100ms API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Successfully created 100ms room:', data)
    
    return {
      roomId: data.id,
      roomName: data.name,
    }
  } catch (error) {
    console.error('❌ Error creating 100ms room:', error)
    // Fallback to mock room if API call fails
    const mockRoomId = generateRoomId()
    console.warn('⚠️  Using mock room as fallback')
    return {
      roomId: mockRoomId,
      roomName,
    }
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

