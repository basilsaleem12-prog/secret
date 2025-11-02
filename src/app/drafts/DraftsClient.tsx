'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Job } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Edit,
  Trash2,
  Send,
  Calendar,
  Plus,
} from 'lucide-react'

interface DraftsClientProps {
  drafts: Job[]
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_PROJECT: 'Academic Project',
  STARTUP_COLLABORATION: 'Startup/Collaboration',
  PART_TIME_JOB: 'Part-time Job',
  COMPETITION_HACKATHON: 'Competition/Hackathon',
}

export function DraftsClient({ drafts }: DraftsClientProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return
    }

    setDeletingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to delete draft. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePublish = async (jobId: string) => {
    if (!confirm('Publish this job? It will be sent for admin approval.')) {
      return
    }

    setPublishingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDraft: false,
          status: 'PENDING', // Reset to pending for admin approval
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish draft')
      }

      router.refresh()
      alert('Draft published and sent for approval!')
    } catch (error) {
      alert('Failed to publish draft. Please try again.')
    } finally {
      setPublishingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            Draft Jobs
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Your unpublished job postings ({drafts.length})
          </p>
        </div>
        <Button onClick={() => router.push('/jobs/create')} className="btn-gradient">
          <Plus className="w-5 h-5 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            No drafts yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
            Start creating a job posting and save it as a draft
          </p>
          <Button onClick={() => router.push('/jobs/create')} className="btn-gradient">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Draft
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <div key={draft.id} className="glass-card p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Left: Draft Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {draft.title}
                    </h3>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                      Draft
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {JOB_TYPE_LABELS[draft.type]}
                    </Badge>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                    {draft.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last edited {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/jobs/${draft.id}/edit`)}
                    className="flex-1 md:flex-initial"
                  >
                    <Edit className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(draft.id)}
                    disabled={publishingId === draft.id}
                    className="flex-1 md:flex-initial text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Send className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">
                      {publishingId === draft.id ? 'Publishing...' : 'Publish'}
                    </span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                    className="flex-1 md:flex-initial"
                  >
                    <Trash2 className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">
                      {deletingId === draft.id ? 'Deleting...' : 'Delete'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

