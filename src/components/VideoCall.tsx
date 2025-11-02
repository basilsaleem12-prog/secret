'use client'

import React, { useState, useEffect } from 'react'

interface VideoCallProps {
  roomCode: string
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomCode }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get subdomain from environment
  const subdomain = process.env.NEXT_PUBLIC_HMS_SUBDOMAIN || ''

  // Validate room code
  useEffect(() => {
    if (!roomCode || typeof roomCode !== 'string' || roomCode.trim() === '') {
      setError('No room code provided.')
      setLoading(false)
    } else {
      setError(null)
      setLoading(true)
    }
  }, [roomCode])

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load video call. Please check your connection and try again.')
    setLoading(false)
  }

  if (!subdomain) {
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
          color: '#fff',
          fontSize: 20,
        }}
      >
        <div>
          <p>Video calling is not configured.</p>
          <p style={{ fontSize: 14, marginTop: 10, opacity: 0.8 }}>
            Please set NEXT_PUBLIC_HMS_SUBDOMAIN environment variable.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#111',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
        }}
      >
        {loading && !error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2,
            }}
          >
            <div style={{ color: '#fff', fontSize: 20 }}>Loading video call...</div>
          </div>
        )}
        {error ? (
          <div
            style={{
              color: '#fff',
              textAlign: 'center',
              margin: '40px auto',
              fontSize: 20,
              width: '100%',
            }}
          >
            {error}
          </div>
        ) : (
          <iframe
            src={`https://${subdomain}.app.100ms.live/preview/${roomCode}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#222',
            }}
            allow="camera; microphone; fullscreen; display-capture"
            title="100ms Video Call"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        )}
      </div>
    </div>
  )
}

