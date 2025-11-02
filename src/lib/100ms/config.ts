import { v4 as uuidv4 } from 'uuid'

// 100ms Configuration
export const HMS_CONFIG = {
  appAccessKey: process.env.HMS_APP_ACCESS_KEY!,
  appSecret: process.env.HMS_APP_SECRET!,
  templateId: process.env.HMS_TEMPLATE_ID || 'default-template', // Video call template
  region: 'in', // 'us', 'eu', 'in' based on your 100ms account region
} as const

// Check for required environment variables
if (!process.env.HMS_APP_ACCESS_KEY || !process.env.HMS_APP_SECRET) {
  console.warn(
    '⚠️  100ms credentials not configured. Set HMS_APP_ACCESS_KEY and HMS_APP_SECRET in .env'
  )
}

/**
 * Generate a unique room name for a job interview
 */
export function generateRoomName(jobId: string, requesterId: string): string {
  const timestamp = Date.now()
  return `interview-${jobId.slice(0, 8)}-${requesterId.slice(0, 8)}-${timestamp}`
}

/**
 * Generate room ID (UUID)
 */
export function generateRoomId(): string {
  return uuidv4()
}

/**
 * User roles in 100ms room
 */
export const HMS_ROLES = {
  HOST: 'host', // Job poster
  GUEST: 'guest', // Job seeker
} as const

/**
 * Room configuration for video calls
 */
export const ROOM_CONFIG = {
  maxDuration: 3600, // 1 hour in seconds
  recordingEnabled: false, // Set to true if you want to record calls
  chatEnabled: true,
  screenShareEnabled: true,
  handRaiseEnabled: true,
  pollsEnabled: false,
  whiteboardEnabled: false,
} as const

