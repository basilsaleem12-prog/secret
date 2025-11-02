'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, TrendingUp, AlertCircle, X } from 'lucide-react';
import MatchScoreBadge from '@/components/MatchScoreBadge';

export default function MatchScoreResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchMatchScore();
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#1E3A8A] mb-4" />
          <p className="text-lg">Calculating your match score...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to calculate match score'}</p>
          <Button onClick={() => router.back()} className="btn-gradient">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Your Match Score</h1>
              <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-0 mt-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            For: <span className="font-semibold text-purple-700">{jobTitle}</span>
          </p>
        </div>

        {/* Score Display */}
        <div className="glass-card p-8 mb-6 text-center">
          <MatchScoreBadge score={result.score} size="lg" showLabel={true} />
          <p className="text-sm mt-4 text-gray-600">
            AI-calculated compatibility based on your profile and this job
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* AI Reasoning */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-full bg-blue-100 shrink-0">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 mb-2">AI Analysis</h2>
                <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              Your Strengths for This Role
            </h2>
            <ul className="space-y-3">
              {result.strengths.map((strength: string, idx: number) => (
                <li key={idx} className="text-gray-800 flex items-start gap-3 pl-2">
                  <span className="text-green-600 font-bold text-lg mt-0.5 shrink-0">✓</span>
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          {result.gaps && result.gaps.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-orange-100">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                Areas to Highlight or Develop
              </h2>
              <ul className="space-y-3">
                {result.gaps.map((gap: string, idx: number) => (
                  <li key={idx} className="text-gray-800 flex items-start gap-3 pl-2">
                    <span className="text-orange-600 font-bold text-lg mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">💡</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-900 mb-2">AI Recommendation</h2>
                <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
              size="lg"
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

