'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, Copy, Download, Check, AlertCircle } from 'lucide-react';

export default function CoverLetterResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchCoverLetter();
    }
  }, [jobId]);

  const fetchCoverLetter = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (coverLetter?.coverLetter) {
      await navigator.clipboard.writeText(coverLetter.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsText = () => {
    if (coverLetter?.coverLetter) {
      const element = document.createElement('a');
      const file = new Blob([coverLetter.coverLetter], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `cover-letter-${jobTitle}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#1E3A8A] mb-4" />
          <p className="text-lg">Generating your cover letter...</p>
        </div>
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to generate cover letter'}</p>
          <Button onClick={() => router.back()} className="btn-gradient">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
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
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI-Generated Cover Letter</h1>
              <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-0 mt-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            For: <span className="font-semibold text-purple-700">{jobTitle}</span>
          </p>

          {/* Metadata */}
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              📊 {coverLetter.wordCount} words
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              ✨ {coverLetter.tone} tone
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Key Points */}
          {coverLetter.keyPoints && coverLetter.keyPoints.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Highlights:</h3>
              <ul className="space-y-1">
                {coverLetter.keyPoints.map((point: string, idx: number) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cover Letter Text */}
          <div className="glass-card p-6">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
              {coverLetter.coverLetter}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={copyToClipboard} className="flex-1 btn-gradient">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button onClick={downloadAsText} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download as Text
            </Button>
          </div>

          {/* Tip */}
          <div className="glass-card p-3 bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>💡 Tip:</strong> Personalize this cover letter before submitting. Add specific details about why you're interested in this company and role.
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

