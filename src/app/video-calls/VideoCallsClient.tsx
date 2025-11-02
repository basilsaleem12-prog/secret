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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
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

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to accept request')
    } finally {
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

          <Badge className={STATUS_COLORS[request.status]}>
            {request.status}
          </Badge>
        </div>

        {/* Job Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">{request.job.title}</span>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
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
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">
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
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Call Ready
              </h4>
              <p className="text-xs text-green-700 mb-3">
                Share this link or click the button below to join:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/video-call/${request.id}`}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded font-mono"
                  onClick={(e) => e.currentTarget.select()}
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
              onClick={() => router.push(`/video-call/${request.id}`)}
              className="w-full btn-gradient"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call Now
            </Button>
          </div>
        )}

        {request.status === 'REJECTED' && request.rejectReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">
            Received ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
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

