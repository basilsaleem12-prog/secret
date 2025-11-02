'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';

interface CalculateMatchButtonProps {
  applicationId: string;
  currentScore: number | null;
  onScoreCalculated?: (score: number) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

interface MatchAnalysis {
  score: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export default function CalculateMatchButton({
  applicationId,
  currentScore,
  onScoreCalculated,
  variant = 'outline',
  size = 'default',
}: CalculateMatchButtonProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

  const calculateMatch = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${applicationId}/match-score`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to calculate match score');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAnalysis({
          score: data.matchScore,
          reasoning: data.analysis.reasoning,
          strengths: data.analysis.strengths,
          gaps: data.analysis.gaps,
          recommendation: data.analysis.recommendation,
        });
        setShowAnalysis(true);
        
        if (onScoreCalculated) {
          onScoreCalculated(data.matchScore);
        }
      }
    } catch (error) {
      console.error('Error calculating match:', error);
      alert('Failed to calculate match score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = currentScore !== null ? 'Recalculate Match' : 'Calculate Match';

  return (
    <>
      <Button
        onClick={calculateMatch}
        disabled={loading}
        variant={variant}
        size={size}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </Button>

      {/* Match Analysis Modal */}
      {showAnalysis && analysis && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9995] p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAnalysis(false)}
        >
          <div
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 glass-card p-6 border-b flex items-start justify-between bg-linear-to-r from-blue-50 to-purple-50 mb-6" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#1E3A8A' }} />
                  AI Match Analysis
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  Powered by Gemini AI
                </p>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Score */}
            <div className="text-center mb-6 p-6 rounded-lg" style={{ background: 'var(--card)' }}>
              <div className="text-5xl font-bold mb-2" style={{ color: '#1E3A8A' }}>
                {analysis.score}%
              </div>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Match Score
              </p>
            </div>

            {/* Reasoning */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Analysis
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                {analysis.reasoning}
              </p>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Strengths */}
              <div className="p-4 rounded-lg" style={{ background: '#10b98115' }}>
                <h4 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="p-4 rounded-lg" style={{ background: '#f59e0b15' }}>
                <h4 className="font-semibold mb-3 text-orange-700 flex items-center gap-2">
                  <span className="text-lg">!</span>
                  Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {analysis.gaps.map((gap: string, index: number) => (
                    <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg" style={{ background: '#1E3A8A15' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#1E3A8A' }}>
                <Sparkles className="w-4 h-4" />
                Recommendation
              </h4>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {analysis.recommendation}
              </p>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowAnalysis(false)} className="btn-gradient">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

