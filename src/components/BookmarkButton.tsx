'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

interface BookmarkButtonProps {
  jobId: string
  initialBookmarked: boolean
  variant?: 'default' | 'icon'
  className?: string
}

export function BookmarkButton({ 
  jobId, 
  initialBookmarked, 
  variant = 'default',
  className = ''
}: BookmarkButtonProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleBookmark = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent navigation when clicking bookmark button on cards
    }

    setIsLoading(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?jobId=${jobId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to remove bookmark')
        }

        setIsBookmarked(false)
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to bookmark job')
        }

        setIsBookmarked(true)
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update bookmark')
      // Revert state on error
      setIsBookmarked(!isBookmarked)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleBookmark}
        disabled={isLoading}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        title={isBookmarked ? 'Remove from saved' : 'Save job'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--foreground-muted)' }} />
        ) : isBookmarked ? (
          <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
        ) : (
          <Bookmark className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} />
        )}
      </button>
    )
  }

  return (
    <Button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      variant="outline"
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 mr-2 text-blue-600 fill-blue-600" />
      ) : (
        <Bookmark className="w-4 h-4 mr-2" />
      )}
      {isBookmarked ? 'Saved' : 'Save Job'}
    </Button>
  )
}

