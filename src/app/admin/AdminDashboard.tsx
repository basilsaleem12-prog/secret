'use client'

import { useState, useEffect, JSX } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isAdminEmail } from '@/lib/admin/config'
import { 
  Users, 
  FileText, 
  Activity, 
  Settings, 
  Shield,
  BarChart3,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  AlertCircle
} from 'lucide-react'

interface AdminDashboardProps {
  userId: string
}

interface User {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  department: string | null;
  year: string | null;
  createdAt: string;
  stats: {
    totalJobs: number;
    totalApplications: number;
    totalMessages: number;
  };
}

interface Job {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  _count: {
    applications: number;
  };
}

interface JobCounts {
  status: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  type: {
    ALL: number;
    ACADEMIC_PROJECT: number;
    STARTUP_COLLABORATION: number;
    PART_TIME_JOB: number;
    COMPETITION_HACKATHON: number;
  };
}

type JobStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type JobTypeFilter = 'ALL' | 'ACADEMIC_PROJECT' | 'STARTUP_COLLABORATION' | 'PART_TIME_JOB' | 'COMPETITION_HACKATHON';

export function AdminDashboard({ userId }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobCounts, setJobCounts] = useState<JobCounts>({
    status: {
      ALL: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    },
    type: {
      ALL: 0,
      ACADEMIC_PROJECT: 0,
      STARTUP_COLLABORATION: 0,
      PART_TIME_JOB: 0,
      COMPETITION_HACKATHON: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatusFilter>('PENDING')
  const [jobTypeFilter, setJobTypeFilter] = useState<JobTypeFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({})
  const [processingJobId, setProcessingJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchJobs()
  }, [jobStatusFilter, jobTypeFilter])

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/jobs?status=${jobStatusFilter}&type=${jobTypeFilter}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
        setJobCounts(data.counts)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject'): Promise<void> => {
    setProcessingJobId(jobId)
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason[jobId] : undefined,
        }),
      })

      if (response.ok) {
        await fetchJobs()
        setRejectionReason((prev) => ({ ...prev, [jobId]: '' }))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to process job')
      }
    } catch (error) {
      console.error('Error processing job:', error)
      alert('Failed to process job')
    } finally {
      setProcessingJobId(null)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string): JSX.Element => {
    const variants: { [key: string]: { color: string; icon: JSX.Element } } = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      POSTED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
    }
    const variant = variants[status] || variants.PENDING
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        {variant.icon}
        {status}
      </Badge>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Shield className="h-8 w-8" style={{ color: 'var(--primary)' }} />
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Manage users, files, and system settings
            </p>
          </div>
          <Badge style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
            Administrator
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Total Users</h3>
            <Users className="h-5 w-5" style={{ color: 'var(--foreground-muted)' }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{users.length}</div>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Registered users
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Pending Jobs</h3>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{jobCounts.status.PENDING}</div>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Awaiting approval
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Approved Jobs</h3>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{jobCounts.status.APPROVED}</div>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Approved and live
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Total Jobs</h3>
            <FileText className="h-5 w-5" style={{ color: 'var(--foreground-muted)' }} />
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{jobCounts.status.ALL}</div>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            All jobs created
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <div className="glass-card p-1 inline-flex" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <TabsList 
            className="grid w-full grid-cols-2"
            style={{ 
              background: 'transparent',
              padding: 0,
            }}
          >
            <TabsTrigger 
              value="jobs"
              style={{ 
                color: 'var(--foreground)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
              }}
              className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-gray-100 data-[state=active]:hover:bg-[#1E3A8A]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Job Approvals ({jobCounts.status.PENDING})
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              style={{ 
                color: 'var(--foreground)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
              }}
              className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-gray-100 data-[state=active]:hover:bg-[#1E3A8A]"
            >
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="glass-card p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Job Approval Management</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    Review and approve or reject job postings
                  </p>
                </div>
              </div>
                
              {/* Status Filters */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Filter by Status:</p>
                <div className="flex flex-wrap gap-2">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      onClick={() => setJobStatusFilter(status)}
                      className="text-xs"
                      style={{
                        backgroundColor: jobStatusFilter === status ? '#1E3A8A' : 'transparent',
                        color: jobStatusFilter === status ? 'white' : 'var(--foreground)',
                        border: `1px solid ${jobStatusFilter === status ? '#1E3A8A' : 'var(--border)'}`,
                      }}
                    >
                      {status} ({jobCounts.status[status]})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Filter by Type:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setJobTypeFilter('ALL')}
                    className="text-xs"
                    style={{
                      backgroundColor: jobTypeFilter === 'ALL' ? '#1E3A8A' : 'transparent',
                      color: jobTypeFilter === 'ALL' ? 'white' : 'var(--foreground)',
                      border: `1px solid ${jobTypeFilter === 'ALL' ? '#1E3A8A' : 'var(--border)'}`,
                    }}
                  >
                    All Types ({jobCounts.type.ALL})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setJobTypeFilter('ACADEMIC_PROJECT')}
                    className="text-xs"
                    style={{
                      backgroundColor: jobTypeFilter === 'ACADEMIC_PROJECT' ? '#1E3A8A' : 'transparent',
                      color: jobTypeFilter === 'ACADEMIC_PROJECT' ? 'white' : 'var(--foreground)',
                      border: `1px solid ${jobTypeFilter === 'ACADEMIC_PROJECT' ? '#1E3A8A' : 'var(--border)'}`,
                    }}
                  >
                    Academic ({jobCounts.type.ACADEMIC_PROJECT})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setJobTypeFilter('STARTUP_COLLABORATION')}
                    className="text-xs"
                    style={{
                      backgroundColor: jobTypeFilter === 'STARTUP_COLLABORATION' ? '#1E3A8A' : 'transparent',
                      color: jobTypeFilter === 'STARTUP_COLLABORATION' ? 'white' : 'var(--foreground)',
                      border: `1px solid ${jobTypeFilter === 'STARTUP_COLLABORATION' ? '#1E3A8A' : 'var(--border)'}`,
                    }}
                  >
                    Startup ({jobCounts.type.STARTUP_COLLABORATION})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setJobTypeFilter('PART_TIME_JOB')}
                    className="text-xs"
                    style={{
                      backgroundColor: jobTypeFilter === 'PART_TIME_JOB' ? '#1E3A8A' : 'transparent',
                      color: jobTypeFilter === 'PART_TIME_JOB' ? 'white' : 'var(--foreground)',
                      border: `1px solid ${jobTypeFilter === 'PART_TIME_JOB' ? '#1E3A8A' : 'var(--border)'}`,
                    }}
                  >
                    Part-time ({jobCounts.type.PART_TIME_JOB})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setJobTypeFilter('COMPETITION_HACKATHON')}
                    className="text-xs"
                    style={{
                      backgroundColor: jobTypeFilter === 'COMPETITION_HACKATHON' ? '#1E3A8A' : 'transparent',
                      color: jobTypeFilter === 'COMPETITION_HACKATHON' ? 'white' : 'var(--foreground)',
                      border: `1px solid ${jobTypeFilter === 'COMPETITION_HACKATHON' ? '#1E3A8A' : 'var(--border)'}`,
                    }}
                  >
                    Competition ({jobCounts.type.COMPETITION_HACKATHON})
                  </Button>
                </div>
              </div>
            </div>
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>
                  <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border)' }} />
                  <p className="text-sm">No {jobStatusFilter.toLowerCase()} jobs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{job.title}</h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>{job.description}</p>
                          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            <span>Type: {job.type.replace(/_/g, ' ')}</span>
                            <span>By: {job.createdBy.fullName || job.createdBy.email}</span>
                            <span>Applications: {job._count.applications}</span>
                            <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {job.status === 'PENDING' && (
                        <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <Button
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'approve')}
                            disabled={processingJobId === job.id}
                            className="btn-gradient"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {processingJobId === job.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Input
                            placeholder="Rejection reason (required for rejection) *"
                            value={rejectionReason[job.id] || ''}
                            onChange={(e) =>
                              setRejectionReason((prev) => ({ ...prev, [job.id]: e.target.value }))
                            }
                            className="flex-1 glass-input"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!rejectionReason[job.id]?.trim()) {
                                alert('Please provide a rejection reason')
                                return
                              }
                              handleJobAction(job.id, 'reject')
                            }}
                            disabled={processingJobId === job.id}
                            style={{ backgroundColor: '#EF4444', color: 'white' }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {processingJobId === job.id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </div>
                      )}

                      {job.status === 'REJECTED' && job.rejectionReason && (
                        <div className="flex items-start gap-2 p-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{job.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>User Management</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  View and manage all registered users
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" style={{ color: 'var(--foreground-muted)' }} />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 glass-input"
                />
              </div>
            </div>
            <div>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--foreground-muted)' }}>
                  <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border)' }} />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                          {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{user.fullName || 'No name'}</h3>
                            {isAdminEmail(user.email) && (
                              <Badge style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Admin</Badge>
                            )}
                            <Badge variant="outline" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>{user.role}</Badge>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{user.email}</p>
                          <div className="flex items-center gap-4 text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                            {user.department && <span>Dept: {user.department}</span>}
                            {user.year && <span>Year: {user.year}</span>}
                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Activity</div>
                        <div className="text-xs space-y-1" style={{ color: 'var(--foreground-muted)' }}>
                          <div>Jobs: {user.stats.totalJobs}</div>
                          <div>Applications: {user.stats.totalApplications}</div>
                          <div>Messages: {user.stats.totalMessages}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

