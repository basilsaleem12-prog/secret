'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Job, Profile } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MatchScoreBadge from '@/components/MatchScoreBadge'
import { calculateSimpleMatch } from '@/lib/ai/match-scoring'
import { 
  Search, 
  MapPin, 
  Users, 
  Eye,
  Calendar,
  Briefcase,
  Filter,
  X,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react'

interface JobWithRelations extends Job {
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
  isPaid: boolean
  paymentAmount: number | null
  paymentCurrency: string
  stripePaymentId: string | null
  paidAt: Date | null
}

interface JobsListClientProps {
  jobs: JobWithRelations[]
  currentUserId: string
  userProfile?: {
    skills: string[]
    interests: string[]
  } | null
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

export function JobsListClient({ jobs, currentUserId, userProfile }: JobsListClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [hideOwnJobs, setHideOwnJobs] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'applications'>('recent')
  const [locationFilter, setLocationFilter] = useState<string>('ALL')
  const [compensationFilter, setCompensationFilter] = useState<string>('ALL')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300) // 300ms delay for debouncing

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Extract unique locations and tags from jobs
  const uniqueLocations = useMemo(() => {
    const locations = jobs
      .map(job => job.location)
      .filter((loc): loc is string => !!loc)
    return ['ALL', ...Array.from(new Set(locations))]
  }, [jobs])

  const allTags = useMemo(() => {
    const tags = jobs.flatMap(job => job.tags)
    return Array.from(new Set(tags)).sort()
  }, [jobs])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs

    // Filter out own jobs if toggle is enabled
    if (hideOwnJobs) {
      filtered = filtered.filter(job => job.createdBy.id !== currentUserId)
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(job => job.type === selectedType)
    }

    // Filter by location
    if (locationFilter !== 'ALL') {
      filtered = filtered.filter(job => job.location === locationFilter)
    }

    // Filter by compensation (has compensation or not)
    if (compensationFilter === 'PAID') {
      filtered = filtered.filter(job => job.compensation && job.compensation.toLowerCase().includes('paid'))
    } else if (compensationFilter === 'UNPAID') {
      filtered = filtered.filter(job => !job.compensation || job.compensation.toLowerCase().includes('unpaid') || job.compensation.toLowerCase().includes('volunteer'))
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(job => 
        selectedTags.some(tag => job.tags.includes(tag))
      )
    }

    // Filter by search query (debounced)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query)) ||
        job.createdBy.fullName?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.compensation?.toLowerCase().includes(query)
      )
    }

    // Sort jobs
    switch (sortBy) {
      case 'popular':
        return [...filtered].sort((a, b) => b.views - a.views)
      case 'applications':
        return [...filtered].sort((a, b) => b._count.applications - a._count.applications)
      case 'recent':
      default:
        return [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }, [jobs, selectedType, debouncedSearch, hideOwnJobs, currentUserId, locationFilter, compensationFilter, selectedTags, sortBy])

  const jobTypes = Object.keys(JOB_TYPE_LABELS)

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedType('ALL')
    setLocationFilter('ALL')
    setCompensationFilter('ALL')
    setSelectedTags([])
    setHideOwnJobs(false)
    setSortBy('recent')
  }

  const activeFiltersCount = 
    (selectedType !== 'ALL' ? 1 : 0) +
    (locationFilter !== 'ALL' ? 1 : 0) +
    (compensationFilter !== 'ALL' ? 1 : 0) +
    selectedTags.length +
    (hideOwnJobs ? 1 : 0) +
    (sortBy !== 'recent' ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Browse Opportunities
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Discover exciting projects, jobs, and collaborations
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="space-y-4">
          {/* Search Bar with Real-time indicator */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
            <Input
              type="text"
              placeholder="Search jobs in real-time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 glass-input"
            />
            {searchQuery !== debouncedSearch && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-blue-600">
                Searching...
              </span>
            )}
            {searchQuery && searchQuery === debouncedSearch && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle and Clear */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {/* Job Type Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                  Job Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedType === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('ALL')}
                    className={selectedType === 'ALL' ? 'btn-gradient' : ''}
                  >
                    All ({jobs.length})
                  </Button>
                  {jobTypes.map((type) => {
                    const count = jobs.filter(job => job.type === type).length
                    return (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className={selectedType === type ? 'btn-gradient' : ''}
                      >
                        {JOB_TYPE_LABELS[type]} ({count})
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Location Filter */}
              {uniqueLocations.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueLocations.map((location) => (
                      <Button
                        key={location}
                        variant={locationFilter === location ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLocationFilter(location)}
                        className={locationFilter === location ? 'btn-gradient' : ''}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compensation Filter */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <DollarSign className="w-4 h-4" />
                  Compensation
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={compensationFilter === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCompensationFilter('ALL')}
                    className={compensationFilter === 'ALL' ? 'btn-gradient' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={compensationFilter === 'PAID' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCompensationFilter('PAID')}
                    className={compensationFilter === 'PAID' ? 'btn-gradient' : ''}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={compensationFilter === 'UNPAID' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCompensationFilter('UNPAID')}
                    className={compensationFilter === 'UNPAID' ? 'btn-gradient' : ''}
                  >
                    Unpaid/Volunteer
                  </Button>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                    Skills & Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.slice(0, 20).map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer ${selectedTags.includes(tag) ? 'bg-blue-600 text-white' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                    className={sortBy === 'recent' ? 'btn-gradient' : ''}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Most Recent
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                    className={sortBy === 'popular' ? 'btn-gradient' : ''}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Most Popular
                  </Button>
                  <Button
                    variant={sortBy === 'applications' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('applications')}
                    className={sortBy === 'applications' ? 'btn-gradient' : ''}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Most Applications
                  </Button>
                </div>
              </div>

              {/* Hide Own Jobs Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="checkbox"
                  id="hideOwnJobs"
                  checked={hideOwnJobs}
                  onChange={(e) => setHideOwnJobs(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label 
                  htmlFor="hideOwnJobs" 
                  className="text-sm cursor-pointer"
                  style={{ color: 'var(--foreground)' }}
                >
                  Hide my own job postings ({jobs.filter(job => job.createdBy.id === currentUserId).length})
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p style={{ color: 'var(--foreground-muted)' }}>
          Found <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{filteredJobs.length}</span> opportunities
        </p>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-muted)', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No opportunities found
          </h3>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const isOwnJob = job.createdBy.id === currentUserId
            return (
              <div
                key={job.id}
                className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={JOB_TYPE_COLORS[job.type]}>
                    {JOB_TYPE_LABELS[job.type]}
                  </Badge>
                  {!isOwnJob && userProfile && (
                    <MatchScoreBadge 
                      score={calculateSimpleMatch(
                        job.tags,
                        userProfile.skills,
                        userProfile.interests
                      )}
                      size="sm"
                      showLabel={false}
                    />
                  )}
                  {isOwnJob && (
                    <Badge 
                      className="bg-indigo-100 text-indigo-800 border-indigo-300"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.1))',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary)',
                      }}
                    >
                      Your Post
                    </Badge>
                  )}
                  {job.isPaid && job.paymentAmount && (
                    <Badge 
                      className="bg-green-100 text-green-800 border-green-300 font-semibold"
                    >
                      💰 ${job.paymentAmount.toFixed(0)}
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
                      +{job.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                {/* Posted By */}
                <div className="flex items-center gap-2">
                  {job.createdBy.avatarUrl ? (
                    <img
                      src={job.createdBy.avatarUrl}
                      alt={job.createdBy.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
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
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
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

              {/* Posted Date */}
              <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                <Calendar className="w-3 h-3" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

