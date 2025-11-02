'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/components/BookmarkButton'
import { JobPaymentButton } from '@/components/JobPaymentButton'
import { RequestVideoCallButton } from '@/components/RequestVideoCallButton'
import { ApplicationForm } from './ApplicationForm'
import AIInterviewTips from '@/components/AIInterviewTips'
import AICoverLetterGenerator from '@/components/AICoverLetterGenerator'
import CalculateMyMatchButton from '@/components/CalculateMyMatchButton'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  Sparkles,
} from 'lucide-react'

interface JobWithRelations {
  id: string
  title: string
  type: string
  description: string
  requirements: string | null
  duration: string | null
  compensation: string | null
  location: string | null
  teamSize: string | null
  tags: string[]
  status: string
  isDraft: boolean
  isFilled: boolean
  isPublished: boolean
  views: number
  applicationsCount: number
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  approvedAt: Date | null
  approvedBy: string | null
  createdById: string
  isPaid: boolean
  paymentAmount: number | null
  paymentCurrency: string
  stripePaymentId: string | null
  paidAt: Date | null
  createdBy: {
    id: string
    fullName: string | null
    email: string | null
    avatarUrl: string | null
    department: string | null
    year: string | null
    role: string
  }
  applications: Array<{
    id: string
    status: string
    createdAt: Date
  }>
  _count: {
    applications: number
  }
}

interface ProfileType {
  id: string
  userId: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  skills: string[]
  interests: string[]
  role: string
  department: string | null
  year: string | null
  createdAt: Date
  updatedAt: Date
}

interface JobDetailClientProps {
  job: JobWithRelations
  currentProfile: ProfileType
  initialBookmarked: boolean
  existingCallRequest?: {
    id: string
    status: string
    roomId: string | null
    scheduledTime: Date | null
    createdAt: Date
  } | null
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_PROJECT: 'Academic Project',
  STARTUP_COLLABORATION: 'Startup/Collaboration',
  PART_TIME_JOB: 'Part-time Job',
  COMPETITION_HACKATHON: 'Competition/Hackathon',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
}

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export function JobDetailClient({ job, currentProfile, initialBookmarked, existingCallRequest }: JobDetailClientProps) {
  const router = useRouter()

  const isOwner = job.createdById === currentProfile.id
  const userApplication = Array.isArray(job.applications) && job.applications.length > 0 ? job.applications[0] : null
  const hasApplied = !!userApplication

  const handleApplicationSuccess = (): void => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Bookmark */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        {!isOwner && (
          <BookmarkButton 
            jobId={job.id} 
            initialBookmarked={initialBookmarked}
          />
        )}
      </div>

      {/* Main Content Card */}
      <div className="glass-card p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                {job.title}
              </h1>
              <Badge className={STATUS_COLORS[job.status] || ''}>
                {job.status}
              </Badge>
              {job.isDraft && (
                <Badge variant="outline">Draft</Badge>
              )}
              {job.isFilled && (
                <Badge className="bg-gray-100 text-gray-800">Position Filled</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {job.views} views
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job._count.applications} applicants
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge 
              className="text-sm px-4 py-2"
              style={{ 
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: 'white',
                border: 'none'
              }}
            >
              {JOB_TYPE_LABELS[job.type] || job.type}
            </Badge>
            
            {/* Payment Badge */}
            {job.isPaid && job.paymentAmount && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-300 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="text-xs font-medium text-green-600">Compensation</div>
                  <div className="text-lg font-bold text-green-800">
                    ${job.paymentAmount.toFixed(0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            Description
          </h2>
          <p className="whitespace-pre-wrap" style={{ color: 'var(--foreground-muted)' }}>
            {job.description}
          </p>
        </div>

        {/* Job Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Requirements
              </h3>
              <p className="whitespace-pre-wrap" style={{ color: 'var(--foreground-muted)' }}>
                {job.requirements}
              </p>
            </div>
          )}

          {job.duration && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Duration
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>{job.duration}</p>
            </div>
          )}

          {job.compensation && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Compensation
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>{job.compensation}</p>
            </div>
          )}

          {job.location && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Location
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>{job.location}</p>
            </div>
          )}

          {job.teamSize && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Team Size
              </h3>
              <p style={{ color: 'var(--foreground-muted)' }}>{job.teamSize}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(job.tags) && job.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Skills & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Posted By */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            Posted By
          </h3>
          <div className="flex items-center gap-4">
            {job.createdBy.avatarUrl ? (
              <img
                src={job.createdBy.avatarUrl}
                alt={job.createdBy.fullName || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
              >
                {job.createdBy.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                {job.createdBy.fullName || 'Anonymous'}
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {job.createdBy.department && job.createdBy.year
                  ? `${job.createdBy.department} • Year ${job.createdBy.year}`
                  : job.createdBy.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Match Score - PROMINENTLY DISPLAYED */}
      {!isOwner && (
        <div className="glass-card p-8 border-4 border-green-500 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 shadow-xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-5xl">🎯</span>
              <div>
                <h2 className="text-3xl font-bold text-green-900">
                  Calculate Your Match Score
                </h2>
                <Badge className="mt-2 bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 text-lg px-4 py-1">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI-Powered Analysis
                </Badge>
              </div>
            </div>
            <p className="text-lg text-green-800 mb-6">
              See how well YOUR profile matches this specific job using real AI analysis!
            </p>
          </div>
          <CalculateMyMatchButton jobId={job.id} jobTitle={job.title} />
        </div>
      )}

      {/* Application Section */}
      {!isOwner && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            {hasApplied ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Application Submitted
                  </h3>
                </div>
                <p className="mb-4" style={{ color: 'var(--foreground-muted)' }}>
                  {userApplication && (
                    <>You applied on {new Date(userApplication.createdAt).toLocaleDateString()}</>
                  )}
                </p>
                {userApplication && (
                  <Badge className={APPLICATION_STATUS_COLORS[userApplication.status]}>
                    {userApplication.status}
                  </Badge>
                )}
              </div>
            ) : job.isFilled ? (
              <div className="text-center">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Position Filled
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  This opportunity is no longer accepting applications
                </p>
              </div>
            ) : (
              <div className="space-y-6" id="apply-section">
                {/* AI Tools Section */}
                <div className="p-5 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <h3 className="font-bold text-lg text-purple-900">AI Application Tools</h3>
                    <Badge className="bg-purple-600 text-white">
                      New
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-800 mb-4">
                    Use our AI tools to prepare your application and ace the interview!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <AICoverLetterGenerator jobId={job.id} jobTitle={job.title} />
                    <AIInterviewTips jobId={job.id} jobTitle={job.title} />
                  </div>
                </div>

                {/* Application Form */}
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Apply for this Opportunity
                  </h3>
                  
                  <ApplicationForm 
                    jobId={job.id}
                    jobTitle={job.title}
                    onSuccess={handleApplicationSuccess} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Call Request Button */}
          {hasApplied && !job.isFilled && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Schedule a Video Interview
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Request a video call with the job poster to discuss this opportunity
              </p>
              <RequestVideoCallButton
                jobId={job.id}
                jobTitle={job.title}
                jobPosterId={job.createdById}
                applicationId={userApplication?.id}
                currentUserId={currentProfile.id}
                existingRequest={existingCallRequest}
              />
            </div>
          )}
        </div>
      )}

      {/* Owner Actions */}
      {isOwner && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                This is your job posting
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {job.applications.length} {job.applications.length === 1 ? 'application' : 'applications'} received
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => router.push(`/jobs/${job.id}/applications`)}
                className="btn-gradient"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Applications ({job.applications.length})
              </Button>
              <Button
                onClick={() => router.push(`/my-jobs`)}
                variant="outline"
              >
                Manage Job
              </Button>
            </div>
          </div>

          {/* Payment Section */}
          {job.isPublished && !job.isDraft && (
            <JobPaymentButton 
              jobId={job.id}
              currentPaymentAmount={job.paymentAmount}
              isPaid={job.isPaid}
            />
          )}
        </div>
      )}
    </div>
  )
}

