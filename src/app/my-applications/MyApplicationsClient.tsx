'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Application, Job, Profile } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MatchScoreBadge from '@/components/MatchScoreBadge'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  FileText,
  MapPin,
  DollarSign,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react'

interface ApplicationWithJob extends Application {
  job: {
    id: string
    title: string
    type: string
    description: string
    location: string | null
    compensation: string | null
    isPublished: boolean
    isFilled: boolean
    createdBy: {
      id: string
      fullName: string | null
      email: string | null
      avatarUrl: string | null
      department: string | null
    }
  }
}

interface MyApplicationsClientProps {
  applications: ApplicationWithJob[]
  counts: {
    ALL: number
    PENDING: number
    SHORTLISTED: number
    ACCEPTED: number
    REJECTED: number
  }
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Under Review',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Your application is being reviewed'
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    icon: Star,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Congratulations! You\'ve been shortlisted'
  },
  ACCEPTED: {
    label: 'Accepted',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Your application has been accepted!'
  },
  REJECTED: {
    label: 'Not Selected',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300',
    description: 'Thank you for applying'
  },
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_PROJECT: 'Academic Project',
  STARTUP_COLLABORATION: 'Startup/Collaboration',
  PART_TIME_JOB: 'Part-time Job',
  COMPETITION_HACKATHON: 'Competition/Hackathon',
}

export function MyApplicationsClient({ applications, counts }: MyApplicationsClientProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          My Applications
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Track all your job applications and their status
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
            Not Selected
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
            {status} ({counts[status]})
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No applications yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            {statusFilter === 'ALL'
              ? 'Start applying to jobs to see them here'
              : `No ${statusFilter.toLowerCase()} applications`}
          </p>
          <Button onClick={() => router.push('/jobs')} className="btn-gradient">
            Browse Jobs
          </Button>
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
                  <div className="flex-1">
                    {/* Job Title */}
                    <h3
                      className="text-xl font-bold mb-2 hover:underline cursor-pointer"
                      style={{ color: 'var(--foreground)' }}
                      onClick={() => router.push(`/jobs/${application.job.id}`)}
                    >
                      {application.job.title}
                    </h3>

                    {/* Job Type */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">
                        {JOB_TYPE_LABELS[application.job.type] || application.job.type}
                      </Badge>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <MatchScoreBadge score={application.matchScore} size="sm" />
                      {application.job.isFilled && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          Position Filled
                        </Badge>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                      {application.job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.job.location}
                        </span>
                      )}
                      {application.job.compensation && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {application.job.compensation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Posted By */}
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      <User className="w-4 h-4" />
                      <span>Posted by: {application.job.createdBy.fullName || application.job.createdBy.email}</span>
                      {application.job.createdBy.department && (
                        <span>• {application.job.createdBy.department}</span>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
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
                    {/* Status Info */}
                    <div className="p-4 rounded-lg" style={{ backgroundColor: statusConfig.color.includes('yellow') ? '#fef3c7' : statusConfig.color.includes('blue') ? '#dbeafe' : statusConfig.color.includes('green') ? '#d1fae5' : '#fee2e2' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        {statusConfig.description}
                      </p>
                      {application.status === 'ACCEPTED' && (
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                          The job poster will contact you soon with next steps.
                        </p>
                      )}
                      {application.status === 'SHORTLISTED' && (
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                          You're in the final selection. The poster will review your application soon.
                        </p>
                      )}
                    </div>

                    {/* Job Description */}
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                        Job Description
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        {application.job.description}
                      </p>
                    </div>

                    {/* Your Proposal */}
                    {application.proposal && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                          <FileText className="w-4 h-4" />
                          Your Cover Letter
                        </h4>
                        <div
                          className="glass-card p-4 whitespace-pre-wrap text-sm"
                          style={{
                            color: 'var(--foreground)',
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          {application.proposal}
                        </div>
                      </div>
                    )}

                    {/* Your Resume */}
                    {application.resumeName && (
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                          Your Resume
                        </h4>
                        <Badge variant="outline" className="text-sm">
                          {application.resumeName}
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${application.job.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
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

