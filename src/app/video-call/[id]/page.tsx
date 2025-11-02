'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VideoCall } from '@/components/VideoCall'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VideoCallContent() {
  const params = useParams()
  const router = useRouter()
  const callRequestId = params?.id as string
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!callRequestId) {
      setError('Invalid call request ID')
      setLoading(false)
      return
    }

    // Fetch video info (room code or token) from API
    const fetchVideoInfo = async () => {
      try {
        const response = await fetch(`/api/call-requests/${callRequestId}/token`)
        
        if (!response.ok) {
          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type')
          let errorMessage = 'Failed to get video call info'
          let errorCode = null
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
              errorCode = errorData.code
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError)
              errorMessage = `Server error (${response.status}): ${response.statusText}`
            }
          } else {
            // Response is not JSON (likely HTML error page)
            const text = await response.text()
            console.error('Non-JSON error response:', text.substring(0, 200))
            errorMessage = `Server error (${response.status}). Please try again later.`
          }
          
          // If it's a configuration error, show helpful message
          if (errorCode === 'HMS_NOT_CONFIGURED') {
            throw new Error('100ms video calling is not configured. Please contact the administrator.')
          }
          
          throw new Error(errorMessage)
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.error('Non-JSON response received:', text.substring(0, 200))
          throw new Error('Invalid response from server. Please try again later.')
        }

        const data = await response.json()
        
        // Priority 1: Use room code if available (Prebuilt UI - simpler)
        if (data.roomCode) {
          console.log('✅ Using room code for Prebuilt UI:', data.roomCode)
          setRoomCode(data.roomCode)
          setLoading(false)
          return
        }

        // Priority 2: If no room code but room exists, we need to regenerate or use token
        if (data.roomId && !data.roomCode) {
          console.warn('⚠️  Room exists but no room code. Attempting to create room code...')
          
          // Try to create room code via API
          try {
            const codeResponse = await fetch(`/api/call-requests/${callRequestId}/generate-room-code`, {
              method: 'POST',
            })
            
            if (codeResponse.ok) {
              // Check content type before parsing
              const contentType = codeResponse.headers.get('content-type')
              if (contentType && contentType.includes('application/json')) {
                try {
                  const codeData = await codeResponse.json()
                  if (codeData.roomCode) {
                    console.log('✅ Room code generated:', codeData.roomCode)
                    setRoomCode(codeData.roomCode)
                    setLoading(false)
                    return
                  }
                } catch (parseError) {
                  console.error('Failed to parse room code response:', parseError)
                }
              } else {
                console.error('Non-JSON response from generate-room-code endpoint')
              }
            }
          } catch (codeErr) {
            console.error('Failed to generate room code:', codeErr)
          }
          
          // If room code generation fails, use token-based approach
          if (data.token) {
            console.log('⚠️  Falling back to token-based approach')
            setError('Room code not available. Please ensure HMS_MANAGEMENT_TOKEN is configured for Prebuilt UI support.')
            setLoading(false)
            return
          }
        }

        // No room code and no token - error
        setError('Video call room code not available. The room may not have been created properly. Please contact support.')
        setLoading(false)
      } catch (err) {
        console.error('Error fetching video info:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load video call'
        
        // Retry logic for transient errors
        if (retryCount < 2 && errorMessage.includes('Failed to get')) {
          console.log(`Retrying... (${retryCount + 1}/2)`)
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 2000)
          return
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    }

    fetchVideoInfo()
  }, [callRequestId, retryCount])

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#111',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#fff' }} />
        <div style={{ color: '#fff', fontSize: 18 }}>Loading video call...</div>
      </div>
    )
  }

  if (error || !roomCode) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#111',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
          padding: 20,
        }}
      >
        <AlertCircle className="w-16 h-16" style={{ color: '#ef4444' }} />
        <div style={{ color: '#fff', fontSize: 20, textAlign: 'center', maxWidth: 500 }}>
          {error || 'Video call room code not available'}
        </div>
        <Button
          onClick={() => router.push('/video-calls')}
          className="btn-gradient"
        >
          Back to Video Calls
        </Button>
      </div>
    )
  }

  return <VideoCall roomCode={roomCode} />
}

export default function VideoCallPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#111',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          Loading...
        </div>
      }
    >
      <VideoCallContent />
    </Suspense>
  )
}

