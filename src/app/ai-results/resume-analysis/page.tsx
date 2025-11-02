'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Sparkles, 
  FileText, 
  ArrowLeft, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface ResumeAnalysis {
  summary: string;
  detectedSkills: string[];
  experienceLevel: string;
  yearsOfExperience: number;
  strengths: string[];
  improvements: string[];
  suggestedJobTitles: string[];
  overallScore: number;
  wordCount?: number;
  pageCount?: number;
  insights: {
    education: string;
    professionalSummary: string;
    keyAchievements: string[];
  };
}

export default function ResumeAnalysisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get('resumeId');
  const fileName = searchParams.get('fileName');
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    // Only run on client side
    if (typeof window === 'undefined') {
      setError('This page must be accessed after analyzing a resume.');
      setLoading(false);
      return;
    }

    try {
      // Check for error in URL params
      if (errorParam === 'storage_failed') {
        setError('Failed to store analysis data. Please try analyzing again.');
        setLoading(false);
        return;
      }

      // Try to get analysis from sessionStorage first
      const storedAnalysis = sessionStorage.getItem('resumeAnalysis');
      
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis);
          
          // Validate that we have required fields
          if (!parsed.overallScore && parsed.overallScore !== 0) {
            throw new Error('Invalid analysis data: missing score');
          }
          
          setAnalysis(parsed);
          setLoading(false);
          // Clear from sessionStorage after reading (with a delay to ensure state is set)
          setTimeout(() => {
            try {
              sessionStorage.removeItem('resumeAnalysis');
            } catch (e) {
              // Ignore errors when clearing
            }
          }, 500);
          return;
        } catch (err) {
          console.error('Failed to parse stored analysis:', err);
          setError('Failed to parse analysis data. Please try analyzing again.');
          setLoading(false);
          // Clear invalid data
          try {
            sessionStorage.removeItem('resumeAnalysis');
          } catch (e) {
            // Ignore errors
          }
          return;
        }
      }

      // If no stored analysis, show error
      setError('No analysis data found. Please analyze your resume again.');
      setLoading(false);
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load analysis data. Please try analyzing again.');
      setLoading(false);
    }
  }, []);

  const handleBack = () => {
    if (resumeId) {
      // Try to go back to where they came from, or to files page
      router.back();
    } else {
      router.push('/files');
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
              Loading resume analysis...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="max-w-md w-full text-center glass-card p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Error</h2>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {error || 'Failed to load resume analysis'}
            </p>
            <Button onClick={handleBack} className="btn-gradient">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 hover:bg-transparent"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div 
              className="p-4 rounded-full shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: 'white'
              }}
            >
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                AI Resume Analysis
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  className="border-0 text-white px-3 py-1"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  AI-Powered
                </Badge>
                {fileName && (
                  <Badge 
                    variant="outline"
                    className="px-3 py-1"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground-muted)'
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1.5" />
                    {fileName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Overall Score */}
          <div className="glass-card p-8 text-center">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${getScoreColor(analysis.overallScore)}, ${getScoreColor(analysis.overallScore)}dd)`,
              }}
            >
              <div>
                <div className="text-3xl font-bold">{analysis.overallScore}</div>
                <div className="text-xs">/ 100</div>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
              Resume Score
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>

          {/* Experience Level */}
          <div className="glass-card p-8 text-center">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)' }}
            >
              <Briefcase className="w-12 h-12" />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
              Experience Level
            </h3>
            <Badge 
              className="px-4 py-1 mb-2"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                color: '#A855F7',
                borderColor: '#A855F7'
              }}
            >
              {analysis.experienceLevel}
            </Badge>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {analysis.yearsOfExperience} {analysis.yearsOfExperience === 1 ? 'year' : 'years'} experience
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Professional Summary */}
          <div className="glass-card p-6">
            <h3 
              className="font-semibold text-lg mb-3 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <div 
                className="p-2 rounded-full shrink-0"
                style={{ 
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--accent)'
                }}
              >
                <Award className="w-5 h-5" />
              </div>
              Professional Summary
            </h3>
            <p 
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {analysis.summary}
            </p>
          </div>

          {/* Detected Skills */}
          {analysis.detectedSkills && analysis.detectedSkills.length > 0 && (
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-3 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent)'
                  }}
                >
                  <Target className="w-5 h-5" />
                </div>
                Detected Skills ({analysis.detectedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills.map((skill: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-3 py-1"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--accent)'
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Strengths
              </h3>
              <ul className="space-y-3">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 
                      className="w-5 h-5 mt-0.5 shrink-0" 
                      style={{ color: '#22C55E' }}
                    />
                    <span style={{ color: 'var(--foreground-muted)' }}>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#F97316'
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {analysis.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ background: '#F97316' }}
                    />
                    <span style={{ color: 'var(--foreground-muted)' }}>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Job Titles */}
          {analysis.suggestedJobTitles && analysis.suggestedJobTitles.length > 0 && (
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-3 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent)'
                  }}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                Recommended Job Titles
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedJobTitles.map((title: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-3 py-1"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--accent)'
                    }}
                  >
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Achievements */}
          {analysis.insights.keyAchievements && analysis.insights.keyAchievements.length > 0 && (
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-3 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(251, 191, 36, 0.1)',
                    color: '#F59E0B'
                  }}
                >
                  <Award className="w-5 h-5" />
                </div>
                Key Achievements
              </h3>
              <ul className="space-y-2">
                {analysis.insights.keyAchievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-yellow-600 mt-0.5 shrink-0">★</span>
                    <span style={{ color: 'var(--foreground-muted)' }}>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education & Professional Background */}
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.insights.education && (
              <div className="glass-card p-6">
                <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Education
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {analysis.insights.education}
                </p>
              </div>
            )}
            {analysis.insights.professionalSummary && (
              <div className="glass-card p-6">
                <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Professional Background
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {analysis.insights.professionalSummary}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {(analysis.wordCount || analysis.pageCount) && (
            <div 
              className="glass-card p-4"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                borderColor: '#A855F7'
              }}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 shrink-0" style={{ color: '#A855F7' }} />
                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {analysis.wordCount && <span>{analysis.wordCount} words</span>}
                  {analysis.wordCount && analysis.pageCount && <span> • </span>}
                  {analysis.pageCount && <span>{analysis.pageCount} {analysis.pageCount === 1 ? 'page' : 'pages'}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="px-8"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

