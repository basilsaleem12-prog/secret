'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, MessageCircle, CheckCircle, AlertCircle, Clipboard } from 'lucide-react';

export default function InterviewTipsResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchTips();
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#1E3A8A] mb-4" />
          <p className="text-lg">Generating interview tips...</p>
        </div>
      </div>
    );
  }

  if (error || !tips) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to generate tips'}</p>
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
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Interview Preparation</h1>
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

        {/* Content */}
        <div className="space-y-6">
          {/* Overall Advice */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-full bg-purple-100 shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-purple-900 mb-2">💡 Overall Advice</h2>
                <p className="text-gray-700 leading-relaxed">{tips.overallAdvice}</p>
              </div>
            </div>
          </div>

          {/* Common Questions */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Common Interview Questions
            </h2>
            <div className="space-y-4">
              {tips.commonQuestions.map((q: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <p className="font-semibold text-blue-900 mb-2">
                    Q{idx + 1}: {q.question}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Suggested Answer:</p>
                      <p className="text-sm text-gray-700">{q.suggestedAnswer}</p>
                    </div>
                    <div className="p-2 rounded bg-blue-50 border border-blue-200">
                      <p className="text-xs font-medium text-blue-900">
                        💡 Tip: {q.tips}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Points */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Key Points to Highlight
            </h2>
            <ul className="space-y-2">
              {tips.keyPointsToHighlight.map((point: string, idx: number) => (
                <li key={idx} className="text-gray-800 flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Things to Avoid */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Things to Avoid
            </h2>
            <ul className="space-y-2">
              {tips.thingsToAvoid.map((thing: string, idx: number) => (
                <li key={idx} className="text-gray-800 flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>{thing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Checklist */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              Pre-Interview Checklist
            </h2>
            <ul className="space-y-2">
              {tips.preparationChecklist.map((item: string, idx: number) => (
                <li key={idx} className="text-gray-800 flex items-start gap-2">
                  <span className="text-orange-600 font-bold">□</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="glass-card p-4 bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>💡 Remember:</strong> These are AI-generated suggestions. Personalize your answers based on your unique experiences and the specific role. Practice your responses out loud and be genuine in the interview.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button onClick={() => router.back()} className="btn-gradient" size="lg">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

