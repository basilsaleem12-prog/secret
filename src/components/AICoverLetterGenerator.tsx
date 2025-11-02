'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, FileText } from 'lucide-react'

interface AICoverLetterGeneratorProps {
  jobId: string
  jobTitle: string
  onGenerated?: (coverLetter: string) => void
}

export default function AICoverLetterGenerator({ jobId, jobTitle, onGenerated }: AICoverLetterGeneratorProps) {
  const [loading, setLoading] = useState(false)

  const generateCoverLetter = async (): Promise<void> => {
    setLoading(true)
    
    try {
      // Open in new tab
      const url = `/ai-results/cover-letter?jobId=${encodeURIComponent(jobId)}&jobTitle=${encodeURIComponent(jobTitle || '')}`
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={generateCoverLetter}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Opening...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          AI Cover Letter
        </>
      )}
    </Button>
  )
}
