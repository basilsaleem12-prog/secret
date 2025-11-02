'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Upload, Loader2, FileText, TrendingUp, AlertCircle, CheckCircle, X, Download } from 'lucide-react'

interface ResumeTipsResponse {
  overallScore: number
  experienceLevel: string
  yearsOfExperience: number
  professionalSummary: string
  detectedSkills: string[]
  strengths: string[]
  improvements: string[]
  suggestedJobTitles: string[]
  keyAchievements: string[]
  education: string
  professionalBackground: string
  formattingTips: string[]
  contentTips: string[]
  industryInsights: string[]
}

export default function ResumeTipsClient() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeTipsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOCX, or TXT file')
        return
      }

      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      // Show warning for PDF files
      if (selectedFile.type === 'application/pdf') {
        setError('⚠️ PDF parsing is currently not available. For best results, please convert your resume to DOCX or TXT format. Open your PDF → Save As → Choose "Word Document (.docx)" or "Text File (.txt)"')
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const analyzeResume = async (): Promise<void> => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze resume')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Validate response format
      if (!data.success || data.overallScore === undefined) {
        console.error('Invalid API response:', data)
        throw new Error('Invalid response from server')
      }

      setResult(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">📄</span>
          <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
            AI Resume Tips
          </h1>
          <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
          Upload your resume and get instant AI-powered feedback, tips, and improvement suggestions
        </p>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-8 border-2" style={{ borderColor: '#8B5CF6' }}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Upload Your Resume
            </h2>
          </div>

          <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <input
              type="file"
              id="resume-upload"
              accept=".doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-purple-100">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    DOCX or TXT (Max 5MB) - <span className="font-semibold text-orange-600">PDF not supported</span>
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
                    💡 Have a PDF? Open it → Save As → Choose "Word Document (.docx)"
                  </p>
                </div>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--background)' }}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{file.name}</p>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            onClick={analyzeResume}
            disabled={!file || loading}
            className="w-full btn-gradient"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Your Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Tips
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="glass-card p-8 text-center">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Resume Score
            </h3>
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${getScoreColor(result.overallScore)}`}>
              <span className="text-4xl font-bold">{result.overallScore}</span>
              <span className="text-lg">/100</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {result.experienceLevel}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {result.yearsOfExperience} years experience
              </Badge>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Professional Summary
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {result.professionalSummary}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="glass-card p-6 bg-green-50 border-2 border-green-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-900">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {result.improvements && result.improvements.length > 0 && (
              <div className="glass-card p-6 bg-orange-50 border-2 border-orange-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-900">
                  <TrendingUp className="w-5 h-5" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-600 font-bold mt-0.5">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Formatting Tips */}
          {result.formattingTips && result.formattingTips.length > 0 && (
            <div className="glass-card p-6 bg-blue-50 border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-900">
                <FileText className="w-5 h-5" />
                Formatting Tips
              </h3>
              <ul className="space-y-2">
                {result.formattingTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content Tips */}
          {result.contentTips && result.contentTips.length > 0 && (
            <div className="glass-card p-6 bg-purple-50 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-900">
                <AlertCircle className="w-5 h-5" />
                Content Improvement Tips
              </h3>
              <ul className="space-y-2">
                {result.contentTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected Skills */}
          {result.detectedSkills && result.detectedSkills.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                Detected Skills ({result.detectedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.detectedSkills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Job Titles */}
          {result.suggestedJobTitles && result.suggestedJobTitles.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                Suggested Job Titles
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.suggestedJobTitles.map((title, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-200">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Achievements */}
          {result.keyAchievements && result.keyAchievements.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                Key Achievements Identified
              </h3>
              <ul className="space-y-2">
                {result.keyAchievements.map((achievement, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2" style={{ color: 'var(--foreground-muted)' }}>
                    <span className="text-green-600 font-bold mt-0.5">★</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Industry Insights */}
          {result.industryInsights && result.industryInsights.length > 0 && (
            <div className="glass-card p-6 bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-purple-900">
                <Sparkles className="w-5 h-5" />
                Industry-Specific Insights
              </h3>
              <ul className="space-y-2">
                {result.industryInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">💼</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                setFile(null)
                setResult(null)
                setError(null)
              }}
              variant="outline"
              size="lg"
            >
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

