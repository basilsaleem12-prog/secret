'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Job, Profile, Application } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MatchScoreBadge from '@/components/MatchScoreBadge'
import CalculateMatchButton from '@/components/CalculateMatchButton'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  FileText,
  Download,
  Mail,
  GraduationCap,
  Briefcase,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ApplicationWithApplicant extends Application {
  applicant: {
    id: string
    fullName: string | null
    email: string | null
    avatarUrl: string | null
    bio: string | null
    skills: string[]
    department: string | null
    year: string | null
  }
}

interface ApplicationsPageClientProps {
  job: Job & {
    createdBy: {
      id: string
      fullName: string | null
      avatarUrl: string | null
    }
  }
  initialApplications: ApplicationWithApplicant[]
  initialCounts: {
    ALL: number
    PENDING: number
    SHORTLISTED: number
    ACCEPTED: number
    REJECTED: number
  }
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    icon: Star,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  ACCEPTED: {
    label: 'Accepted',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
}

export function ApplicationsPageClient({
  job,
  initialApplications,
  initialCounts,
}: ApplicationsPageClientProps) {
  const router = useRouter()
  const toast = useToast()
  const [applications, setApplications] = useState(initialApplications)
  const [counts, setCounts] = useState(initialCounts)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const filteredApplications =
    statusFilter === 'ALL'
      ? applications
      : applications.filter((app) => app.status === statusFilter)

  const toggleExpand = (appId: string) => {
    setExpandedApplications((prev) => {
      const next = new Set(prev)
      if (next.has(appId)) {
        next.delete(appId)
      } else {
        next.add(appId)
      }
      return next
    })
  }

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  ) => {
    setUpdatingStatus(applicationId)

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      // Refresh the page to get updated data
      router.refresh()
      
      // Show toast notification
      const statusLabels: Record<string, string> = {
        SHORTLISTED: 'Shortlisted',
        ACCEPTED: 'Accepted',
        REJECTED: 'Rejected',
        PENDING: 'Moved to Pending'
      }
      toast.success(`${statusLabels[newStatus]}! Email notification sent to applicant.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update application status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDownloadResume = (resumeId: string, fileName: string) => {
    // Open resume in new tab
    window.open(`/api/resumes/${resumeId}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job
        </Button>

        <h1
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Applications for {job.title}
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Review and manage applicants
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            {counts.ALL}
          </div>
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Total
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{counts.PENDING}</div>
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Pending
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{counts.SHORTLISTED}</div>
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Shortlisted
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.ACCEPTED}</div>
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Accepted
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.REJECTED}</div>
          <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Rejected
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'btn-gradient' : ''}
          >
            {status} (
            {status === 'ALL' ? counts.ALL : counts[status as keyof typeof counts]})
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No applications yet
          </h3>
          <p style={{ color: 'var(--foreground-muted)' }}>
            {statusFilter === 'ALL'
              ? 'No one has applied to this job yet'
              : `No ${statusFilter.toLowerCase()} applications`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const isExpanded = expandedApplications.has(application.id)
            const statusConfig = STATUS_CONFIG[application.status]
            const StatusIcon = statusConfig.icon

            return (
              <div key={application.id} className="glass-card p-6">
                {/* Application Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    {application.applicant.avatarUrl ? (
                      <img
                        src={application.applicant.avatarUrl}
                        alt={application.applicant.fullName || 'Applicant'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                        }}
                      >
                        {application.applicant.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}

                    {/* Applicant Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        {application.applicant.fullName || 'Unknown'}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {application.applicant.email}
                        </span>
                        {application.applicant.department && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {application.applicant.department}
                          </span>
                        )}
                        {application.applicant.year && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            Year {application.applicant.year}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <MatchScoreBadge score={application.matchScore} size="sm" showLabel={false} />
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(application.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    {/* Bio */}
                    {application.applicant.bio && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                          Bio
                        </h4>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                          {application.applicant.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {application.applicant.skills && application.applicant.skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {application.applicant.skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proposal */}
                    {application.proposal && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                          <FileText className="w-4 h-4" />
                          Cover Letter / Proposal
                        </h4>
                        <div
                          className="glass-card p-4 whitespace-pre-wrap"
                          style={{
                            color: 'var(--foreground)',
                            maxHeight: '300px',
                            overflowY: 'auto',
                          }}
                        >
                          {application.proposal}
                        </div>
                      </div>
                    )}

                    {/* Resume */}
                    {application.resumeUrl && application.resumeName && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                          Resume
                        </h4>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleDownloadResume(application.resumeUrl!, application.resumeName!)
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download {application.resumeName}
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      {application.status === 'ACCEPTED' ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="w-5 h-5" />
                            <div>
                              <p className="font-semibold">Application Accepted</p>
                              <p className="text-sm mt-1">
                                This candidate has been accepted for the position. Contact them at{' '}
                                <a href={`mailto:${application.applicant.email}`} className="underline">
                                  {application.applicant.email}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                            Actions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <CalculateMatchButton
                              applicationId={application.id}
                              currentScore={application.matchScore}
                              size="sm"
                              onScoreCalculated={(score) => {
                                setApplications(prev =>
                                  prev.map(app =>
                                    app.id === application.id ? { ...app, matchScore: score } : app
                                  )
                                );
                              }}
                            />
                            {application.status !== 'SHORTLISTED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                                disabled={updatingStatus === application.id}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Shortlist
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                              disabled={updatingStatus === application.id}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            {application.status !== 'REJECTED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                                disabled={updatingStatus === application.id}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            )}
                            {application.status !== 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(application.id, 'PENDING')}
                                disabled={updatingStatus === application.id}
                                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Move to Pending
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

