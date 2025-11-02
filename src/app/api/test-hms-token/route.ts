import { NextRequest, NextResponse } from 'next/server'
import { generateHMSToken } from '@/lib/100ms/service'
import { HMS_CONFIG } from '@/lib/100ms/config'
import jwt from 'jsonwebtoken'

/**
 * GET /api/test-hms-token - Test HMS token generation
 * This is for debugging purposes only - remove in production
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if credentials are set
    const hasCredentials = !!(HMS_CONFIG.appAccessKey && HMS_CONFIG.appSecret)
    
    if (!hasCredentials) {
      return NextResponse.json({
        error: 'HMS credentials not configured',
        message: 'Please set HMS_APP_ACCESS_KEY and HMS_APP_SECRET in .env',
        configured: {
          appAccessKey: !!HMS_CONFIG.appAccessKey,
          appSecret: !!HMS_CONFIG.appSecret,
        }
      }, { status: 400 })
    }

    // Generate a test token
    const testToken = generateHMSToken({
      roomId: 'test-room-123',
      userId: 'test-user-456',
      role: 'guest',
      userName: 'Test User'
    })

    // Decode token to verify structure
    const decoded = jwt.decode(testToken, { complete: true })

    return NextResponse.json({
      success: true,
      message: 'HMS token generated successfully',
      tokenPreview: testToken.substring(0, 50) + '...',
      decodedPayload: decoded?.payload,
      requiredFields: {
        access_key: !!(decoded?.payload as any)?.access_key,
        room_id: !!(decoded?.payload as any)?.room_id,
        user_id: !!(decoded?.payload as any)?.user_id,
        role: !!(decoded?.payload as any)?.role,
        type: !!(decoded?.payload as any)?.type,
        version: !!(decoded?.payload as any)?.version,
        jti: !!(decoded?.payload as any)?.jti,
        iat: !!(decoded?.payload as any)?.iat,
        nbf: !!(decoded?.payload as any)?.nbf,
        exp: !!(decoded?.payload as any)?.exp,
      }
    })

  } catch (error) {
    console.error('HMS token test error:', error)
    return NextResponse.json({
      error: 'Failed to generate test token',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

