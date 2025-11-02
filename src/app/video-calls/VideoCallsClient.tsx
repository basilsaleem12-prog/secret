'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CallRequest, Job, Profile, Application } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Briefcase,
  MessageSquare,
} from 'lucide-react'

interface CallRequestWithRelations extends CallRequest {
  job: Job & {
    createdBy: {
      id: string
      fullName: string | null
      avatarUrl: string | null
    }
  }
  requester: Pick<Profile, 'id' | 'fullName' | 'email' | 'avatarUrl' | 'department' | 'year'>
  receiver: Pick<Profile, 'id' | 'fullName' | 'email' | 'avatarUrl' | 'department' | 'year'>
  application: {
    id: string
    status: string
  } | null
}

interface VideoCallsClientProps {
  sentRequests: CallRequestWithRelations[]
  receivedRequests: CallRequestWithRelations[]
  currentUserId: string
}

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'rgba(251, 191, 36, 0.2)', text: '#F59E0B', border: '#F59E0B' },
    ACCEPTED: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E', border: '#22C55E' },
    REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444', border: '#EF4444' },
    COMPLETED: { bg: 'rgba(107, 114, 128, 0.2)', text: '#6B7280', border: '#6B7280' },
    CANCELLED: { bg: 'rgba(107, 114, 128, 0.2)', text: '#6B7280', border: '#6B7280' },
  }
  return styles[status] || styles.PENDING
}

export function VideoCallsClient({
  sentRequests: initialSent,
  receivedRequests: initialReceived,
  currentUserId
}: VideoCallsClientProps) {
  const router = useRouter()
  const [sentRequests, setSentRequests] = useState(initialSent)
  const [receivedRequests, setReceivedRequests] = useState(initialReceived)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null)

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const response = await fetch(`/api/call-requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledTime: scheduledTime || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to accept request')
      }

      // Reload the page to show updated video call status
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to accept request')
      setActionLoading(null)
      setScheduledTime('')
    }
  }

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const response = await fetch(`/api/call-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectReason: rejectReason || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject request')
      }

      router.refresh()
      setShowRejectForm(null)
      setRejectReason('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  const renderCallRequestCard = (request: CallRequestWithRelations, isSent: boolean) => {
    const otherUser = isSent ? request.receiver : request.requester
    const canJoin = request.status === 'ACCEPTED' && request.roomId

    return (
      <div key={request.id} className="glass-card p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {otherUser.avatarUrl ? (
              <img
                src={otherUser.avatarUrl}
                alt={otherUser.fullName || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {otherUser.fullName || 'Anonymous User'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {otherUser.department && otherUser.year
                  ? `${otherUser.department} - ${otherUser.year}`
                  : otherUser.email}
              </p>
            </div>
          </div>

          <Badge 
            style={{
              background: getStatusBadgeStyle(request.status).bg,
              color: getStatusBadgeStyle(request.status).text,
              borderColor: getStatusBadgeStyle(request.status).border,
            }}
          >
            {request.status}
          </Badge>
        </div>

        {/* Job Info */}
        <div 
          className="flex items-center gap-2 mb-4 p-3 rounded-lg border"
          style={{
            background: 'rgba(37, 99, 235, 0.1)',
            borderColor: 'var(--border)',
          }}
        >
          <Briefcase className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{request.job.title}</span>
        </div>

        {/* Message */}
        {request.message && (
          <div 
            className="mb-4 p-3 rounded-lg border"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-1" style={{ color: 'var(--foreground-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {request.message}
              </p>
            </div>
          </div>
        )}

        {/* Time Info */}
        <div className="space-y-2 mb-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {request.requestedTime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Requested: {new Date(request.requestedTime).toLocaleString()}</span>
            </div>
          )}
          {request.scheduledTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#22C55E' }} />
              <span className="font-medium" style={{ color: '#22C55E' }}>
                Scheduled: {new Date(request.scheduledTime).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Requested: {new Date(request.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        {!isSent && request.status === 'PENDING' && (
          <div className="space-y-3">
            {/* Accept with optional scheduled time */}
            <div className="space-y-2">
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="glass-input"
                placeholder="Set scheduled time (optional)"
                style={{
                  background: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <Button
                onClick={() => handleAccept(request.id)}
                disabled={actionLoading === request.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading === request.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept Video Call Request
                  </>
                )}
              </Button>
            </div>

            {/* Reject */}
            {showRejectForm === request.id ? (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="glass-input w-full min-h-[80px]"
                  placeholder="Optional: Reason for declining (will be sent to applicant)"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={actionLoading === request.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    {actionLoading === request.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      'Confirm Decline'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(null)
                      setRejectReason('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowRejectForm(request.id)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline Request
              </Button>
            )}
          </div>
        )}

        {canJoin && (
          <div className="space-y-3">
            {/* Video Call Link Display */}
            <div 
              className="p-4 rounded-lg border-2"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderColor: '#22C55E',
              }}
            >
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#22C55E' }}>
                <Video className="w-4 h-4" />
                Video Call Ready
              </h4>
              <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>
                Share this link or click the button below to join:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(() => {
                    if (typeof window === 'undefined') return `/video-call/${request.id}`
                    return `${window.location.origin}/video-call/${request.id}`
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
                    navigator.clipboard.writeText(`${window.location.origin}/video-call/${request.id}`)
                    alert('Link copied to clipboard!')
                  }}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <Button
              onClick={() => {
                const url = `/video-call/${request.id}`
                window.open(url, '_blank', 'noopener,noreferrer')
              }}
              className="w-full btn-gradient"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call Now
            </Button>
          </div>
        )}

        {request.status === 'REJECTED' && request.rejectReason && (
          <div 
            className="p-3 rounded-lg border text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#EF4444',
              color: '#EF4444',
            }}
          >
            <strong>Decline reason:</strong> {request.rejectReason}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Video Interview Requests
          </h1>
          <p className="mt-2" style={{ color: 'var(--foreground-muted)' }}>
            Manage your video call interview requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList 
          className="grid w-full grid-cols-2"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <TabsTrigger 
            value="received"
            style={{
              color: 'var(--foreground)',
            }}
          >
            Received ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger 
            value="sent"
            style={{
              color: 'var(--foreground)',
            }}
          >
            Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Received Requests */}
        <TabsContent value="received" className="mt-6">
          {receivedRequests.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--foreground-muted)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                No Received Requests
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>
                When candidates request video interviews, they'll appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {receivedRequests.map(request => renderCallRequestCard(request, false))}
            </div>
          )}
        </TabsContent>

        {/* Sent Requests */}
        <TabsContent value="sent" className="mt-6">
          {sentRequests.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--foreground-muted)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                No Sent Requests
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>
                Request video interviews from job detail pages
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {sentRequests.map(request => renderCallRequestCard(request, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

