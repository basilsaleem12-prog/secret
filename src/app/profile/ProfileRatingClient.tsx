'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';

interface RatingData {
  rating: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  feedback: string;
  profileCompleteness: number;
}

interface ProfileRatingClientProps {
  userId: string;
}

export default function ProfileRatingClient({ userId }: ProfileRatingClientProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [error, setError] = useState<string>('');

  const handleRateProfile = async (): Promise<void> => {
    setLoading(true);
    setError('');
    setRatingData(null);

    try {
      const response = await fetch('/api/profile/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rate profile');
      }

      if (data.success && data.data) {
        setRatingData(data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error rating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while rating your profile');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 8) return '#10b981'; // green
    if (rating >= 6) return '#3b82f6'; // blue
    if (rating >= 4) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-4">
      {/* Rate Profile Button */}
      <div className="glass-card p-6 border-2" style={{ borderColor: '#8B5CF6', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))' }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#8B5CF6' }} />
                AI Profile Rating
              </h3>
              <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-0">
                AI-Powered
              </Badge>
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Get personalized AI-powered insights, recommendations, and a professional score (0-10) for your profile
            </p>
          </div>
          <Button
            onClick={handleRateProfile}
            disabled={loading}
            className="btn-gradient whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Rate My Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('API key') && (
                <p className="text-xs text-red-600 mt-2">
                  Please ensure GEMINI_API_KEY is configured in your environment variables.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Results */}
      {ratingData && (
        <div className="space-y-4">
          {/* Overall Rating Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${getRatingColor(ratingData.rating)}, ${getRatingColor(ratingData.rating)}dd)` 
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold">{ratingData.rating}</div>
                      <div className="text-xs">out of 10</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {getRatingLabel(ratingData.rating)}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                      {ratingData.summary}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  Profile Completeness
                </div>
                <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
                  {ratingData.profileCompleteness}%
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="glass-card p-6">
              <h4 className="font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--foreground)' }}>
                <TrendingUp className="w-5 h-5 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-3">
                {ratingData.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="glass-card p-6">
              <h4 className="font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--foreground)' }}>
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-3">
                {ratingData.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-orange-600 shrink-0 mt-0.5"
                      style={{ borderColor: '#f59e0b' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {improvement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="glass-card p-6">
            <h4 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Detailed Feedback
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {ratingData.feedback}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleRateProfile}
              variant="outline"
              disabled={loading}
            >
              Rate Again
            </Button>
            <Button
              onClick={() => window.location.href = '/profile/edit'}
              className="btn-gradient"
            >
              Improve Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

