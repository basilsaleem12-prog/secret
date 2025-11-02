'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Video, X, Calendar, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RequestVideoCallButtonProps {
  jobId: string
  jobTitle: string
  jobPosterId: string
  applicationId?: string | null
  currentUserId: string
  existingRequest?: any // If user already has a request
  className?: string
}

export function RequestVideoCallButton({
  jobId,
  jobTitle,
  jobPosterId,
  applicationId,
  currentUserId,
  existingRequest,
  className = ''
}: RequestVideoCallButtonProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [requestedTime, setRequestedTime] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

    // If there's already a request, show status
    if (existingRequest) {
      const getStatusStyle = (status: string) => {
        const styles: Record<string, { bg: string; text: string; border: string }> = {
          PENDING: { bg: 'rgba(251, 191, 36, 0.2)', text: '#F59E0B', border: '#F59E0B' },
          ACCEPTED: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E', border: '#22C55E' },
          REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444', border: '#EF4444' },
          COMPLETED: { bg: 'rgba(107, 114, 128, 0.2)', text: '#6B7280', border: '#6B7280' },
          CANCELLED: { bg: 'rgba(107, 114, 128, 0.2)', text: '#6B7280', border: '#6B7280' },
        }
        return styles[status] || styles.PENDING
      }

    // Special display for accepted calls
    if (existingRequest.status === 'ACCEPTED' && existingRequest.roomId) {
      return (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#22C55E' }}>Video Call Scheduled</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Your interview request has been accepted!</p>
            </div>
          </div>

          {/* Video Call Link */}
          <div 
            className="p-4 rounded-lg border-2"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderColor: '#22C55E',
            }}
          >
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#22C55E' }}>
              <Video className="w-4 h-4" />
              Video Call Link
            </h4>
            <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>
              Share this link or click the button below to join:
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={(() => {
                  if (typeof window === 'undefined') return `/video-call/${existingRequest.id}`
                  return `${window.location.origin}/video-call/${existingRequest.id}`
                })()}
                readOnly
                className="flex-1 px-3 py-2 text-sm rounded font-mono"
                onClick={(e) => e.currentTarget.select()}
                suppressHydrationWarning
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/video-call/${existingRequest.id}`)
                  alert('Link copied to clipboard!')
                }}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
            <Button
              onClick={() => {
                const url = `/video-call/${existingRequest.id}`
                window.open(url, '_blank', 'noopener,noreferrer')
              }}
              className="w-full btn-gradient"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call Now
            </Button>
          </div>

          {existingRequest.scheduledTime && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              <Calendar className="w-4 h-4" style={{ color: '#22C55E' }} />
              <span>Scheduled: {new Date(existingRequest.scheduledTime).toLocaleString()}</span>
            </div>
          )}
        </div>
      )
    }

    // Default status display for other states
    const statusStyle = getStatusStyle(existingRequest.status)
    return (
      <div 
        className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg"
        style={{
          background: statusStyle.bg,
          borderColor: statusStyle.border,
          color: statusStyle.text,
        }}
      >
        <Video className="w-4 h-4" />
        <div>
          <p className="font-medium text-sm">Video Call {existingRequest.status}</p>
          {existingRequest.status === 'PENDING' && (
            <p className="text-xs">Waiting for response...</p>
          )}
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/call-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          receiverId: jobPosterId,
          applicationId,
          message,
          requestedTime: requestedTime || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request')
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setShowForm(false)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Request Sent!
        </h3>
        <p style={{ color: 'var(--foreground-muted)' }}>
          The job poster will be notified and can accept or decline your request.
        </p>
      </div>
    )
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className={`btn-gradient ${className}`}
      >
        <Video className="w-4 h-4 mr-2" />
        Request Video Interview
      </Button>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          Request Video Interview
        </h3>
        <button
          onClick={() => setShowForm(false)}
          className="p-1 rounded transition-colors"
          disabled={loading}
          style={{
            color: 'var(--foreground-muted)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
        Request a video call with the job poster for <strong>{jobTitle}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            <MessageSquare className="w-4 h-4" />
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="glass-input w-full min-h-[100px]"
            placeholder="Introduce yourself and explain why you'd like to have a video interview..."
            disabled={loading}
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Preferred Time */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            <Calendar className="w-4 h-4" />
            Preferred Date & Time (Optional)
          </label>
          <Input
            type="datetime-local"
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            className="glass-input"
            min={new Date().toISOString().slice(0, 16)}
            disabled={loading}
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Suggest a time that works for you. The job poster will confirm or propose another time.
          </p>
        </div>

        {error && (
          <div 
            className="rounded-lg p-3 text-sm border"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#EF4444',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => setShowForm(false)}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

