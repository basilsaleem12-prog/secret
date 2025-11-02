'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Job } from '@prisma/client'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditJobFormProps {
  job: Job
}

const JOB_TYPES = [
  { value: 'ACADEMIC_PROJECT', label: 'Academic Project' },
  { value: 'STARTUP_COLLABORATION', label: 'Startup/Collaboration' },
  { value: 'PART_TIME_JOB', label: 'Part-time Job' },
  { value: 'COMPETITION_HACKATHON', label: 'Competition/Hackathon' },
]

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: job.title,
    type: job.type,
    description: job.description,
    requirements: job.requirements || '',
    duration: job.duration || '',
    compensation: job.compensation || '',
    location: job.location || '',
    teamSize: job.teamSize || '',
    tags: job.tags.join(', '),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.title || !formData.type || !formData.description) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job')
      }

      router.push('/my-jobs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
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
          Edit Job Posting
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Update your opportunity details
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Job Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="glass-input w-full"
            placeholder="e.g., Looking for React Developer"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Job Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="glass-input w-full"
          >
            <option value="">Select a type</option>
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="glass-input w-full min-h-[150px]"
            placeholder="Describe the opportunity..."
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Requirements
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            className="glass-input w-full min-h-[100px]"
            placeholder="Required skills, experience, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., 3 months, 6 weeks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Compensation
            </label>
            <input
              type="text"
              value={formData.compensation}
              onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., Paid, Unpaid, $500/month"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., Remote, On-campus, Hybrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Team Size
            </label>
            <input
              type="text"
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., 2-3 people"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="glass-input w-full"
            placeholder="e.g., React, Node.js, AI/ML"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="btn-gradient flex-1">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

