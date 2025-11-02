'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Job } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Eye,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  RefreshCw,
  AlertCircle,
  Plus,
  Send,
  EyeOff,
  CheckCheck,
  Undo2,
} from 'lucide-react'

interface JobWithCount extends Job {
  _count: {
    applications: number
  }
}

interface MyJobsClientProps {
  jobs: JobWithCount[]
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_PROJECT: 'Academic Project',
  STARTUP_COLLABORATION: 'Startup/Collaboration',
  PART_TIME_JOB: 'Part-time Job',
  COMPETITION_HACKATHON: 'Competition/Hackathon',
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300'
  },
}

export function MyJobsClient({ jobs }: MyJobsClientProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resubmittingId, setResubmittingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [fillingId, setFillingId] = useState<string | null>(null)

  const handleDelete = async (jobId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    setDeletingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to delete job. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleResubmit = async (jobId: string): Promise<void> => {
    setResubmittingId(jobId)
    try {
      // Reset job status to PENDING for re-review
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PENDING',
          rejectionReason: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to resubmit job')
      }

      router.refresh()
      alert('Job resubmitted for review!')
    } catch (error) {
      alert('Failed to resubmit job. Please try again.')
    } finally {
      setResubmittingId(null)
    }
  }

  const handleTogglePublish = async (jobId: string, currentlyPublished: boolean): Promise<void> => {
    setPublishingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !currentlyPublished,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update job. Please try again.')
    } finally {
      setPublishingId(null)
    }
  }

  const handleToggleFill = async (jobId: string, currentlyFilled: boolean): Promise<void> => {
    const action = currentlyFilled ? 'reopen' : 'mark as filled'
    if (!confirm(`Are you sure you want to ${action} this job?`)) {
      return
    }

    setFillingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFilled: !currentlyFilled,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job')
      }

      router.refresh()
      alert(data.message)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update job. Please try again.')
    } finally {
      setFillingId(null)
    }
  }

  const pendingJobs = jobs.filter(job => job.status === 'PENDING')
  const approvedJobs = jobs.filter(job => job.status === 'APPROVED')
  const rejectedJobs = jobs.filter(job => job.status === 'REJECTED')
  const draftJobs = jobs.filter(job => job.isDraft)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            My Job Postings
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Manage your job postings and view applications
          </p>
        </div>
        <Button
          onClick={() => router.push('/jobs/create')}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {pendingJobs.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Pending Review
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {approvedJobs.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Approved & Live
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {rejectedJobs.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Rejected
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gray-100">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {draftJobs.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Drafts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-muted)', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No job postings yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            Create your first job posting to start finding talented collaborators
          </p>
          <Button
            onClick={() => router.push('/jobs/create')}
            className="btn-gradient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const StatusIcon = STATUS_CONFIG[job.status]?.icon || AlertCircle
            const statusColor = STATUS_CONFIG[job.status]?.color || 'bg-gray-100 text-gray-800'

            return (
              <div
                key={job.id}
                className="glass-card p-6 hover:scale-[1.01] transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Job Info */}
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <h3 
                        className="text-xl font-bold flex-1 cursor-pointer hover:opacity-80"
                        style={{ color: 'var(--foreground)' }}
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        {job.title}
                      </h3>
                      <Badge className={statusColor}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {STATUS_CONFIG[job.status]?.label || job.status}
                      </Badge>
                      {job.isDraft && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      {job.isFilled && (
                        <Badge className="bg-gray-100 text-gray-800">Position Filled</Badge>
                      )}
                    </div>

                    {/* Type */}
                    <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                      {JOB_TYPE_LABELS[job.type]}
                    </p>

                    {/* Description */}
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                      {job.description}
                    </p>

                    {/* Rejection Reason */}
                    {job.status === 'REJECTED' && job.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-700">
                              {job.rejectionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      {job.isPublished && (
                        <>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job._count.applications} applications
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="flex-1 md:flex-initial"
                        >
                          <Eye className="w-4 h-4 md:mr-2" />
                          <span className="hidden md:inline">View</span>
                        </Button>

                        {(job.status === 'APPROVED' || job._count.applications > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/jobs/${job.id}/applications`)}
                            className="flex-1 md:flex-initial btn-gradient text-white border-none"
                          >
                            <Users className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">
                              Applications ({job._count.applications})
                            </span>
                            <span className="md:hidden">
                              {job._count.applications}
                            </span>
                          </Button>
                        )}

                        {job.status === 'APPROVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(job.id, job.isPublished)}
                        disabled={publishingId === job.id}
                        className="flex-1 md:flex-initial"
                      >
                        {job.isPublished ? (
                          <>
                            <EyeOff className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">
                              {publishingId === job.id ? 'Unpublishing...' : 'Unpublish'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">
                              {publishingId === job.id ? 'Publishing...' : 'Publish'}
                            </span>
                          </>
                        )}
                      </Button>
                    )}

                    {job.status === 'APPROVED' && job.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFill(job.id, job.isFilled)}
                        disabled={fillingId === job.id}
                        className={`flex-1 md:flex-initial ${job.isFilled ? 'text-gray-600' : 'text-green-600'}`}
                      >
                        {job.isFilled ? (
                          <>
                            <Undo2 className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">
                              {fillingId === job.id ? 'Reopening...' : 'Reopen'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCheck className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">
                              {fillingId === job.id ? 'Marking...' : 'Mark Filled'}
                            </span>
                          </>
                        )}
                      </Button>
                    )}

                    {job.status === 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResubmit(job.id)}
                        disabled={resubmittingId === job.id}
                        className="flex-1 md:flex-initial"
                      >
                        <RefreshCw className={`w-4 h-4 md:mr-2 ${resubmittingId === job.id ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">
                          {resubmittingId === job.id ? 'Submitting...' : 'Resubmit'}
                        </span>
                      </Button>
                    )}

                    {(job.status === 'PENDING' || job.isDraft) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}/edit`)}
                        className="flex-1 md:flex-initial"
                      >
                        <Edit className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Edit</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="flex-1 md:flex-initial text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">
                        {deletingId === job.id ? 'Deleting...' : 'Delete'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

