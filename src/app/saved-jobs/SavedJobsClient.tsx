'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Job, Profile, Bookmark } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Bookmark as BookmarkIcon,
  MapPin,
  Users,
  Eye,
  Calendar,
  Briefcase,
  Trash2,
} from 'lucide-react'

interface BookmarkWithJob extends Bookmark {
  job: Job & {
    createdBy: {
      id: string
      fullName: string | null
      avatarUrl: string | null
      department: string | null
      year: string | null
      role: string
    }
    _count: {
      applications: number
    }
  }
}

interface SavedJobsClientProps {
  bookmarks: BookmarkWithJob[]
  currentUserId: string
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_PROJECT: 'Academic Project',
  STARTUP_COLLABORATION: 'Startup/Collaboration',
  PART_TIME_JOB: 'Part-time Job',
  COMPETITION_HACKATHON: 'Competition/Hackathon',
}

const JOB_TYPE_COLORS: Record<string, string> = {
  ACADEMIC_PROJECT: 'bg-blue-100 text-blue-800 border-blue-300',
  STARTUP_COLLABORATION: 'bg-purple-100 text-purple-800 border-purple-300',
  PART_TIME_JOB: 'bg-green-100 text-green-800 border-green-300',
  COMPETITION_HACKATHON: 'bg-orange-100 text-orange-800 border-orange-300',
}

export function SavedJobsClient({ bookmarks, currentUserId }: SavedJobsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      bookmark.job.title.toLowerCase().includes(query) ||
      bookmark.job.description.toLowerCase().includes(query) ||
      (bookmark.job.tags && Array.isArray(bookmark.job.tags) && bookmark.job.tags.some((tag) => tag.toLowerCase().includes(query))) ||
      bookmark.job.createdBy.fullName?.toLowerCase().includes(query)
    )
  })

  const handleRemoveBookmark = async (jobId: string) => {
    if (!confirm('Remove this job from your saved list?')) {
      return
    }

    setRemovingId(jobId)
    try {
      const response = await fetch(`/api/bookmarks?jobId=${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove bookmark')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to remove bookmark. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl md:text-5xl font-bold mb-3"
          style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Saved Jobs
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Your bookmarked opportunities ({bookmarks.length})
        </p>
      </div>

      {/* Search Bar */}
      {bookmarks.length > 0 && (
        <div className="glass-card p-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--foreground-muted)' }}
            />
            <Input
              type="text"
              placeholder="Search saved jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {filteredBookmarks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookmarkIcon
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--foreground-muted)' }}
          />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            {bookmarks.length === 0
              ? 'No saved jobs yet'
              : 'No jobs found matching your search'}
          </h3>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            {bookmarks.length === 0
              ? 'Start bookmarking jobs to save them for later'
              : 'Try adjusting your search query'}
          </p>
          {bookmarks.length === 0 && (
            <Button onClick={() => router.push('/jobs')} className="btn-gradient">
              Browse Jobs
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => {
            const job = bookmark.job
            const isOwnJob = job.createdBy.id === currentUserId

            return (
              <div
                key={bookmark.id}
                className="glass-card p-6 flex flex-col cursor-pointer hover:scale-[1.02] transition-transform relative"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                {/* Remove Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveBookmark(job.id)
                  }}
                  disabled={removingId === job.id}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>

                {/* Job Card Content */}
                <div className="flex-1">
                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-4 pr-8">
                    <Badge className={JOB_TYPE_COLORS[job.type]}>
                      {JOB_TYPE_LABELS[job.type]}
                    </Badge>
                    {isOwnJob && (
                      <Badge
                        className="bg-indigo-100 text-indigo-800 border-indigo-300"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                          color: 'var(--primary)',
                          borderColor: 'var(--primary)',
                        }}
                      >
                        Your Post
                      </Badge>
                    )}
                    {job.isFilled && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        Filled
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--foreground)' }}>
                    {job.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--foreground-muted)' }}>
                    {job.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.teamSize && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Team size: {job.teamSize}</span>
                      </div>
                    )}
                    {job.compensation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.compensation}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {/* Poster Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {job.createdBy.avatarUrl ? (
                        <img
                          src={job.createdBy.avatarUrl}
                          alt={job.createdBy.fullName || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                          }}
                        >
                          {job.createdBy.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {job.createdBy.fullName}
                        </p>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                          {job.createdBy.department}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {job.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job._count.applications}
                      </span>
                    </div>
                  </div>

                  {/* Saved Date */}
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <Calendar className="w-3 h-3" />
                    Saved {new Date(bookmark.createdAt).toLocaleDateString()}
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

