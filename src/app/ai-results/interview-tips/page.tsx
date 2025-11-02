'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, MessageCircle, CheckCircle2, AlertCircle, Clipboard, ArrowLeft, Lightbulb } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function InterviewTipsResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!jobId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchTips();
  }, [jobId]);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/interview-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview tips');
      }

      const data = await response.json();
      setTips(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate tips');
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
              Generating interview tips...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tips) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="max-w-md w-full text-center glass-card p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Error</h2>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {error || 'Failed to generate tips'}
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
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                AI Interview Preparation
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
              </div>
            </div>
          </div>
          
          {jobTitle && (
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              For: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{jobTitle}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overall Advice */}
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
                  Overall Advice
                </h2>
                <p 
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {tips.overallAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Common Questions */}
          {tips.commonQuestions && tips.commonQuestions.length > 0 && (
            <div className="glass-card p-6">
              <h2 
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent)'
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                </div>
                Common Interview Questions
              </h2>
              <div className="space-y-4">
                {tips.commonQuestions.map((q: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg glass-card"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <p 
                      className="font-semibold mb-3"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Q{idx + 1}: {q.question}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p 
                          className="text-xs font-medium mb-1"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          Suggested Answer:
                        </p>
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          {q.suggestedAnswer}
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          background: 'rgba(37, 99, 235, 0.1)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <p 
                          className="text-xs font-medium flex items-start gap-2"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{q.tips}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {tips.keyPointsToHighlight && tips.keyPointsToHighlight.length > 0 && (
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
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                Key Points to Highlight
              </h2>
              <ul className="space-y-3">
                {tips.keyPointsToHighlight.map((point: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <CheckCircle2 
                      className="w-5 h-5 mt-0.5 shrink-0" 
                      style={{ color: '#22C55E' }}
                    />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Things to Avoid */}
          {tips.thingsToAvoid && tips.thingsToAvoid.length > 0 && (
            <div className="glass-card p-6">
              <h2 
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444'
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                Things to Avoid
              </h2>
              <ul className="space-y-3">
                {tips.thingsToAvoid.map((thing: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ background: '#EF4444' }}
                    />
                    <span className="leading-relaxed">{thing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          {tips.preparationChecklist && tips.preparationChecklist.length > 0 && (
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
                  <Clipboard className="w-5 h-5" />
                </div>
                Pre-Interview Checklist
              </h2>
              <ul className="space-y-3">
                {tips.preparationChecklist.map((item: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <div 
                      className="w-5 h-5 rounded border-2 mt-0.5 shrink-0"
                      style={{ borderColor: '#F97316' }}
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div 
            className="glass-card p-4"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              borderColor: '#F59E0B'
            }}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 shrink-0" style={{ color: '#F59E0B' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                <strong style={{ color: 'var(--foreground)' }}>Remember:</strong> These are AI-generated suggestions. Personalize your answers based on your unique experiences and the specific role. Practice your responses out loud and be genuine in the interview.
              </p>
            </div>
          </div>

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
            {jobId && (
              <Button 
                onClick={() => {
                  router.push(`/jobs/${jobId}`);
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

