'use client'

import { useActiveRole } from '@/hooks/useActiveRole'
import { Search, Briefcase, Plus, Users, BookmarkIcon, TrendingUp, Clock, CheckCircle, XCircle, Sparkles, Eye, MousePointerClick, Percent, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AIJobRecommendations from '@/components/AIJobRecommendations'

interface AnalyticsData {
  seeker: {
    applicationsSent: number;
    savedJobs: number;
    profileViews: number;
    applicationsByStatus: {
      pending: number;
      reviewing: number;
      accepted: number;
      rejected: number;
    };
  };
  finder: {
    activeJobs: number;
    draftJobs: number;
    pendingJobs: number;
    applicationsReceived: number;
    totalViews: number;
    totalBookmarks: number;
    averageApplicationRate: string;
    recentJobs: Array<{
      id: string;
      title: string;
      jobType: string;
      status: string;
      views: number;
      createdAt: string;
      updatedAt: string;
      location: string;
      company: string;
      applicationRate: number;
      bookmarkRate: number;
      _count: {
        applications: number;
        bookmarks: number;
      };
    }>;
  };
}

interface DashboardClientProps {
  profile: {
    id: string
    fullName: string | null
    avatarUrl: string | null
    department: string | null
    role: string
    skills: string[]
    interests: string[]
  }
  serverActiveRole?: 'SEEKER' | 'FINDER'
}

export function DashboardClient({ profile, serverActiveRole }: DashboardClientProps) {
  const { activeRole, isLoading } = useActiveRole(serverActiveRole || profile.role as 'SEEKER' | 'FINDER')
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async (): Promise<void> => {
      try {
        const response = await fetch('/api/dashboard/analytics')
        if (response.ok) {
          const data: AnalyticsData = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading || loadingAnalytics) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="glass-card p-8 h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 h-24"></div>
          <div className="glass-card p-6 h-24"></div>
          <div className="glass-card p-6 h-24"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-8">
        <div className="flex items-start gap-6">
          {profile.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt={profile.fullName || 'Profile'} 
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Welcome back, {profile.fullName}
            </h2>
            <p className="text-lg flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
              {activeRole === 'SEEKER' ? (
                <>
                  <Search className="h-5 w-5" />
                  <span>Finding Work Mode</span>
                </>
              ) : (
                <>
                  <Briefcase className="h-5 w-5" />
                  <span>Posting Jobs Mode</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>{profile.department || 'No department set'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Seeker Mode Dashboard */}
      {activeRole === 'SEEKER' && analytics && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 hover:scale-105 transition-transform">
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Applications Sent
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {analytics.seeker.applicationsSent}
                </p>
              </div>
            </div>
            <div className="glass-card p-6 hover:scale-105 transition-transform">
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Saved Jobs
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {analytics.seeker.savedJobs}
                </p>
              </div>
            </div>
            <div className="glass-card p-6 hover:scale-105 transition-transform">
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Profile Views
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {analytics.seeker.profileViews}
                </p>
              </div>
            </div>
          </div>

          {/* Application Status Breakdown */}
          {analytics.seeker.applicationsSent > 0 && (
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Application Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
                  <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.seeker.applicationsByStatus.pending}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Pending</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.seeker.applicationsByStatus.reviewing}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Reviewing</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.seeker.applicationsByStatus.accepted}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Accepted</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <XCircle className="w-8 h-8 text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.seeker.applicationsByStatus.rejected}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Rejected</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                  <Search className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    Browse Opportunities
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                    Find projects, internships, and collaborations that match your skills
                  </p>
                  <Link href="/jobs" className="btn-gradient inline-block px-6 py-2 text-sm">
                    Explore Jobs
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                  <BookmarkIcon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    Saved Jobs
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                    Review and apply to jobs you've bookmarked
                  </p>
                  <Link href="/bookmarks" className="btn-gradient inline-block px-6 py-2 text-sm">
                    View Saved
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Finder Mode Dashboard */}
      {activeRole === 'FINDER' && analytics && (
        <>
          {/* Overview Stats */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Active Jobs</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{analytics.finder.activeJobs}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Pending</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{analytics.finder.pendingJobs}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Applications</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {analytics.finder.applicationsReceived}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Total Views</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {analytics.finder.totalViews}
                </p>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BookmarkIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Total Bookmarks</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {analytics.finder.totalBookmarks}
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Users who saved your jobs
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Avg Application Rate</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {analytics.finder.averageApplicationRate}%
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Applications per view
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-100">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Engagement Score</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {analytics.finder.activeJobs > 0 
                      ? Math.round((analytics.finder.applicationsReceived / analytics.finder.activeJobs) * 10) / 10
                      : 0}
                  </p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Average apps per job
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                  <Plus className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    Post a New Job
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                    Create a new opportunity and find talented collaborators
                  </p>
                  <Link href="/jobs/create" className="btn-gradient inline-block px-6 py-2 text-sm">
                    Create Job
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                  <Users className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                    Manage Applications
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                    Review and respond to applications from candidates
                  </p>
                  <Link href="/applications" className="btn-gradient inline-block px-6 py-2 text-sm">
                    View Applications
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Job Analytics */}
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Job Performance Analytics
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  Detailed metrics for each job posting
                </p>
              </div>
              <Link href="/jobs/create" className="btn-gradient px-6 py-3 text-sm font-semibold">
                + Post New Job
              </Link>
            </div>
            
            {analytics.finder.recentJobs.length > 0 ? (
              <div className="space-y-4">
                {analytics.finder.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="glass-card p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-bold text-lg hover:text-[#1E3A8A] transition-colors"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {job.title}
                          </Link>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'POSTED'
                                ? 'bg-green-100 text-green-700'
                                : job.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(30, 58, 138, 0.1)', color: '#1E3A8A' }}>
                            {job.jobType}
                          </span>
                          {job.company && (
                            <span style={{ color: 'var(--foreground-muted)' }}>
                              {job.company}
                            </span>
                          )}
                          {job.location && (
                            <span style={{ color: 'var(--foreground-muted)' }}>
                              📍 {job.location}
                            </span>
                          )}
                        </div>

                        {/* Analytics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Views</span>
                            </div>
                            <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                              {job.views}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Applications</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600">
                              {job._count.applications}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BookmarkIcon className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Saved</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600">
                              {job._count.bookmarks}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MousePointerClick className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>App Rate</span>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                              {job.applicationRate}%
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" style={{ color: 'var(--foreground-muted)' }} />
                              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Save Rate</span>
                            </div>
                            <p className="text-lg font-bold text-orange-600">
                              {job.bookmarkRate}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/jobs/${job.id}/applications`}
                          className="btn-gradient px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          View Applications
                        </Link>
                        <Link
                          href={`/jobs/${job.id}/edit`}
                          className="glass-card px-4 py-2 text-sm text-center whitespace-nowrap hover:scale-105 transition-transform"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Edit Job
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/my-jobs"
                  className="block text-center text-sm font-medium pt-4 hover:text-[#1E3A8A] transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  View All Your Jobs →
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--foreground-muted)', opacity: 0.5 }}
                />
                <p className="text-lg mb-2 font-semibold" style={{ color: 'var(--foreground)' }}>
                  No jobs posted yet
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                  Create your first job posting to find talented collaborators
                </p>
                <Link href="/jobs/create" className="btn-gradient px-6 py-3 text-sm font-semibold inline-block">
                  Post Your First Job
                </Link>
              </div>
            )}</div>
        </>
      )}

      {/* Profile Summary - Shown in both modes */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Your Profile
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)' }}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  No skills added yet
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Interests
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <span 
                    key={interest} 
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)' }}
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  No interests added yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/profile" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Edit Profile →
          </Link>
        </div>
      </div>

      {/* AI Job Recommendations - Only for Seekers */}
      {activeRole === 'SEEKER' && (
        <AIJobRecommendations />
      )}
    </div>
  )
}

