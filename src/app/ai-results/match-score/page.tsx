'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, TrendingUp, AlertCircle, CheckCircle2, Lightbulb, ArrowLeft } from 'lucide-react';
import MatchScoreBadge from '@/components/MatchScoreBadge';
import { Navbar } from '@/components/Navbar';

export default function MatchScoreResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!jobId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchMatchScore();
  }, [jobId]);

  const fetchMatchScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/calculate-my-match`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to calculate match score');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate match');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (jobId) {
      router.push(`/jobs/${jobId}`);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
              Calculating your match score...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="max-w-md w-full text-center glass-card p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Error</h2>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {error || 'Failed to calculate match score'}
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
            Back to Job
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div 
              className="p-4 rounded-full shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                color: 'white'
              }}
            >
              <Target className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                Your Match Score
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  className="border-0 text-white px-3 py-1"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  AI-Powered Analysis
                </Badge>
              </div>
            </div>
          </div>
          
          {jobTitle && (
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              For: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{jobTitle}</span>
            </p>
          )}
        </div>

        {/* Score Display */}
        <div className="glass-card p-8 mb-8 text-center">
          <MatchScoreBadge score={result.score} size="lg" showLabel={true} />
          <p className="text-sm mt-4" style={{ color: 'var(--foreground-muted)' }}>
            AI-calculated compatibility based on your profile and this job
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* AI Reasoning */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div 
                className="p-3 rounded-full shrink-0"
                style={{ 
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--accent)'
                }}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--foreground)' }}
                >
                  AI Analysis
                </h2>
                <p 
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {result.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="glass-card p-6">
              <h2 
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E'
                  }}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                Your Strengths for This Role
              </h2>
              <ul className="space-y-3">
                {result.strengths.map((strength: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 pl-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <CheckCircle2 
                      className="w-5 h-5 mt-0.5 shrink-0" 
                      style={{ color: '#22C55E' }}
                    />
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {result.gaps && result.gaps.length > 0 && (
            <div className="glass-card p-6">
              <h2 
                className="text-xl font-bold mb-4 flex items-center gap-2"
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
                Areas to Highlight or Develop
              </h2>
              <ul className="space-y-3">
                {result.gaps.map((gap: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 pl-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ background: '#F97316' }}
                    />
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="p-3 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#A855F7'
                  }}
                >
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 
                    className="text-xl font-bold mb-3"
                    style={{ color: 'var(--foreground)' }}
                  >
                    AI Recommendation
                  </h2>
                  <p 
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              size="lg"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                const url = `/jobs/${jobId}`;
                router.push(url);
                setTimeout(() => {
                  const applySection = document.getElementById('apply-section');
                  if (applySection) {
                    applySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="flex-1 btn-gradient"
              size="lg"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

