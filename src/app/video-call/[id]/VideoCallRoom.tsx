'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  selectIsConnectedToRoom,
  selectPeers,
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from '@100mslive/react-sdk'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  User,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoCallRoomProps {
  callRequestId: string
  userRole: 'host' | 'guest'
  userName: string
  userId: string
  jobTitle: string
  otherUser: {
    id: string
    fullName: string | null
    email: string | null
    avatarUrl: string | null
    department: string | null
    year: string | null
  }
}

export function VideoCallRoom({
  callRequestId,
  userRole,
  userName,
  userId,
  jobTitle,
  otherUser
}: VideoCallRoomProps) {
  const router = useRouter()
  const hmsActions = useHMSActions()
  const isConnected = useHMSStore(selectIsConnectedToRoom)
  const peers = useHMSStore(selectPeers)
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled)
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)

  // Fetch HMS token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/call-requests/${callRequestId}/token`)
        const data = await response.json()

        if (!response.ok) {
          // Handle specific error codes
          if (data.code === 'HMS_NOT_CONFIGURED') {
            setError('100ms video calling is not configured. Please contact the administrator to set up video calling. See 100MS_SETUP_GUIDE.md for setup instructions.')
          } else {
            setError(data.error || 'Failed to get access token')
          }
          setLoading(false)
          return
        }

        console.log('✅ Received HMS token successfully')
        setToken(data.token)
      } catch (err) {
        console.error('❌ Error fetching token:', err)
        setError(err instanceof Error ? err.message : 'Failed to join call')
        setLoading(false)
      }
    }

    fetchToken()
  }, [callRequestId])

  // Join room when token is available
  useEffect(() => {
    if (!token) return

    const joinRoom = async () => {
      try {
        console.log('🎥 Joining 100ms room with token...')
        await hmsActions.join({
          userName,
          authToken: token,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
        })
        console.log('✅ Successfully joined 100ms room')
        setLoading(false)
      } catch (err: any) {
        console.error('❌ Failed to join 100ms room:', err)
        
        // More specific error messages
        let errorMessage = 'Failed to join the video call'
        
        if (err?.code === 401 || err?.message?.includes('Authentication')) {
          errorMessage = 'Authentication failed. The room link may be invalid or expired.'
        } else if (err?.message?.includes('invalid room id')) {
          errorMessage = '100ms video calling is not properly configured. Please contact support or check the setup guide.'
        } else if (err?.message?.includes('jti')) {
          errorMessage = 'Token generation error. Please refresh the page and try again.'
        } else if (err?.message?.includes('HMS_NOT_CONFIGURED')) {
          errorMessage = '100ms credentials are not configured on the server. Please contact the administrator.'
        } else if (err?.message) {
          errorMessage = `Connection error: ${err.message}`
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    }

    joinRoom()

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        hmsActions.leave()
      }
    }
  }, [token, hmsActions, userName, isConnected])

  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled)
  }

  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled)
  }

  const leaveCall = async () => {
    await hmsActions.leave()
    router.push('/video-calls')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Joining Call...
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Please wait while we connect you
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Unable to Join Call
          </h2>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            {error}
          </p>
          <Button
            onClick={() => router.push('/video-calls')}
            className="btn-gradient"
          >
            Back to Video Calls
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Video Interview</h1>
            <p className="text-sm text-gray-400">{jobTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {otherUser.avatarUrl ? (
              <img
                src={otherUser.avatarUrl}
                alt={otherUser.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {otherUser.fullName || 'Anonymous'}
              </p>
              {otherUser.department && (
                <p className="text-xs text-gray-400">{otherUser.department}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-full">
          {peers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl font-medium text-white mb-2">
                  Waiting for others to join...
                </p>
                <p className="text-gray-400">
                  You're the first one here. The call will begin when {otherUser.fullName || 'the other participant'} joins.
                </p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 h-full ${peers.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {peers.map((peer) => (
                <div
                  key={peer.id}
                  className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {peer.videoTrack ? (
                    <video
                      ref={(videoEl) => {
                        if (videoEl && peer.videoTrack) {
                          hmsActions.attachVideo(peer.videoTrack.id, videoEl)
                        }
                      }}
                      autoPlay
                      muted={peer.isLocal}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white font-medium">{peer.name}</p>
                    </div>
                  )}

                  {/* Peer Info Overlay */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-2 rounded-lg">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      {peer.name}
                      {peer.isLocal && <span className="text-xs text-gray-300">(You)</span>}
                      {!peer.audioEnabled && <MicOff className="w-4 h-4 text-red-400" />}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full ${
              isLocalAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={isLocalAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isLocalAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full ${
              isLocalVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={isLocalVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isLocalVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </Button>

          <Button
            onClick={leaveCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700"
            title="Leave call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          {isConnected ? '● Connected' : 'Connecting...'}
        </p>
      </div>
    </div>
  )
}

