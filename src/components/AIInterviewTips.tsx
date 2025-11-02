'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, MessageCircle } from 'lucide-react'

interface AIInterviewTipsProps {
  jobId: string
  jobTitle: string
}

export default function AIInterviewTips({ jobId, jobTitle }: AIInterviewTipsProps) {
  const [loading, setLoading] = useState(false)

  const generateTips = async (): Promise<void> => {
    setLoading(true)
    
    try {
      // Open in new tab
      const url = `/ai-results/interview-tips?jobId=${encodeURIComponent(jobId)}&jobTitle=${encodeURIComponent(jobTitle || '')}`
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={generateTips}
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
          AI Interview Tips
        </>
      )}
    </Button>
  )
}
