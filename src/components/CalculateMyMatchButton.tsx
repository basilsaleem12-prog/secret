'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface CalculateMyMatchButtonProps {
  jobId: string
  jobTitle: string
}

export default function CalculateMyMatchButton({ jobId, jobTitle }: CalculateMyMatchButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateMatch = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      // Open in new tab
      const url = `/ai-results/match-score?jobId=${encodeURIComponent(jobId)}&jobTitle=${encodeURIComponent(jobTitle || '')}`
      window.open(url, '_blank')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to open')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={calculateMatch}
        disabled={loading}
        className="btn-gradient w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Calculate My Match Score
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </>
  )
}
