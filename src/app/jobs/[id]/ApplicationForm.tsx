'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, Check, Loader2 } from 'lucide-react'
import AnalyzeResumeButton from '@/components/AnalyzeResumeButton'
import AICoverLetterGenerator from '@/components/AICoverLetterGenerator'

interface Resume {
  id: string
  fileName: string
  fileSize: number
  isDefault: boolean
  createdAt: string
  publicUrl?: string
}

interface ApplicationFormProps {
  jobId: string
  jobTitle: string
  onSuccess: () => void
}

export function ApplicationForm({ jobId, jobTitle, onSuccess }: ApplicationFormProps) {
  const [proposal, setProposal] = useState('')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
        
        // Auto-select default resume
        const defaultResume = data.resumes.find((r: Resume) => r.isDefault)
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id)
        }
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file - Only DOCX and TXT for AI analysis
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/pdf', // Allow PDF but with limited functionality
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a DOCX, TXT, or PDF document')
      return
    }

    // Show warning for PDF
    if (file.type === 'application/pdf') {
      setError('⚠️ Note: PDF files can be uploaded but AI analysis is not available. For best results with AI features, please use DOCX or TXT format.')
      // Don't return, allow upload to continue
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('setAsDefault', 'false')

      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume')
      }

      // Show success message with storage location
      setSuccessMessage(
        `✅ ${data.message}\n📍 Storage: ${data.storageLocation || 'Supabase Storage'}\n🔗 URL: ${data.resume.publicUrl}`
      )

      // Refresh resumes list
      await fetchResumes()

      // Auto-select the newly uploaded resume
      setSelectedResumeId(data.resume.id)

      // Clear success message after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')

    if (!proposal.trim()) {
      setError('Please write a proposal')
      return
    }

    if (proposal.trim().length < 50) {
      setError('Proposal must be at least 50 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          proposal: proposal.trim(),
          resumeId: selectedResumeId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Proposal/Cover Letter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Your Proposal *
          </label>
          <AICoverLetterGenerator jobId={jobId} jobTitle={jobTitle} />
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
          Write a compelling proposal - or use AI to generate a professional cover letter!
        </p>
        <textarea
          className="glass-input w-full min-h-[250px] resize-y font-sans"
          placeholder="Dear Hiring Team,

I am writing to express my strong interest in this opportunity...

[Why you're interested]
[Your relevant experience and skills]
[What you can bring to the project]
[Your availability and commitment]

Best regards,
[Your name]"
          value={proposal}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProposal(e.target.value)}
          disabled={isSubmitting}
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.6',
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Minimum 50 characters
          </p>
          <p 
            className="text-sm"
            style={{ 
              color: proposal.length >= 50 ? 'var(--accent)' : 'var(--foreground-muted)' 
            }}
          >
            {proposal.length} characters
          </p>
        </div>
      </div>

      {/* Resume Upload/Selection */}
      <div>
        <label className="block text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Attach Resume (Optional)
        </label>
        <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
          Upload a new resume or select from your previously uploaded resumes
        </p>

        {/* Upload New Resume */}
        <div className="mb-4">
          <input
            type="file"
            id="resume-upload"
            accept=".docx,.txt,.pdf"
            onChange={handleFileUpload}
            disabled={isUploading || isSubmitting}
            className="hidden"
          />
          <label
            htmlFor="resume-upload"
            className={`glass-card p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold">Upload New Resume</span>
                </div>
                <span className="text-sm text-center" style={{ color: 'var(--foreground-muted)' }}>
                  DOCX or TXT recommended for AI analysis • PDF accepted (max 5MB)
                </span>
              </>
            )}
          </label>
        </div>

        {/* Existing Resumes */}
        {loadingResumes ? (
          <div className="glass-card p-4 text-center" style={{ color: 'var(--foreground-muted)' }}>
            Loading your resumes...
          </div>
        ) : resumes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Select from your resumes:
            </p>
            {resumes.map((resume) => (
              <div key={resume.id} className="space-y-2">
                <label
                  className={`glass-card p-3 flex items-center gap-3 cursor-pointer transition-all ${
                    selectedResumeId === resume.id
                      ? 'ring-2 ring-offset-2'
                      : 'hover:scale-[1.01]'
                  }`}
                  style={{
                    outlineColor: 'var(--accent)',
                  }}
                >
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResumeId === resume.id}
                    onChange={() => setSelectedResumeId(resume.id)}
                    disabled={isSubmitting}
                    className="w-4 h-4"
                  />
                  <FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {resume.fileName}
                      {resume.isDefault && (
                        <span 
                          className="ml-2 text-xs px-2 py-0.5 rounded"
                          style={{ 
                            background: 'var(--accent)',
                            color: 'white'
                          }}
                        >
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {formatFileSize(resume.fileSize)} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedResumeId === resume.id && (
                    <Check className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  )}
                </label>
                {resume.publicUrl && (
                  <div className="flex gap-2 ml-9">
                    <AnalyzeResumeButton
                      resumeId={resume.id}
                      fileName={resume.fileName}
                      fileUrl={resume.publicUrl}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-4 text-center" style={{ color: 'var(--foreground-muted)' }}>
            No resumes uploaded yet. Upload one above to attach to your application.
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-800">
          <pre className="whitespace-pre-wrap text-sm font-mono" style={{ fontFamily: 'monospace' }}>
            {successMessage}
          </pre>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !proposal.trim() || proposal.length < 50}
        className="btn-gradient w-full h-12 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting Application...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>

      <p className="text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
        Your application will be sent to the job poster for review
      </p>
    </form>
  )
}

