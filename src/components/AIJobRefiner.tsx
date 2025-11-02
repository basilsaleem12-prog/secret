'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Wand2, Copy, Check } from 'lucide-react'

interface AIJobRefinerProps {
  role: string
  currentDescription?: string
  currentRequirements?: string
  duration?: string
  compensation?: string
  type?: string
  onApply: (result: RefineResult) => void
}

interface RefineResult {
  title: string
  description: string
  requirements: string
  suggestedTags: string[]
  duration: string
  teamSize: string
  compensation: string
}

export default function AIJobRefiner({
  role,
  currentDescription,
  currentRequirements,
  duration,
  compensation,
  type,
  onApply,
}: AIJobRefinerProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RefineResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const refineJob = async (generateFromRole: boolean = false): Promise<void> => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai/refine-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          currentDescription,
          currentRequirements,
          duration,
          compensation,
          type,
          generateFromRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refine job posting')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to refine job posting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => refineJob(false)}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refining...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Refine with AI
            </>
          )}
        </Button>
        <Button
          onClick={() => refineJob(true)}
          disabled={loading}
          className="flex-1 btn-gradient"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate from Role
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="glass-card p-6 space-y-6 border-2" style={{ borderColor: '#8B5CF6' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
              AI-Refined Job Posting
            </h3>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              AI-Powered
            </Badge>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Title
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.title, 'title')}
              >
                {copied === 'title' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <p className="font-semibold">{result.title}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Description
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.description, 'description')}
              >
                {copied === 'description' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 rounded-lg whitespace-pre-wrap" style={{ background: 'var(--background)' }}>
              <p className="text-sm">{result.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Requirements
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.requirements, 'requirements')}
              >
                {copied === 'requirements' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="p-3 rounded-lg whitespace-pre-wrap" style={{ background: 'var(--background)' }}>
              <p className="text-sm">{result.requirements}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
              Suggested Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {result.suggestedTags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Duration
              </label>
              <p className="text-sm font-semibold mt-1">{result.duration}</p>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Team Size
              </label>
              <p className="text-sm font-semibold mt-1">{result.teamSize}</p>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Compensation
              </label>
              <p className="text-sm font-semibold mt-1">{result.compensation}</p>
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => onApply(result)}
            className="w-full btn-gradient"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Use This AI-Refined Version
          </Button>
        </div>
      )}
    </div>
  )
}

