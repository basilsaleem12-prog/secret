'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileText, Copy, Download, Check, AlertCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function CoverLetterResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!jobId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchCoverLetter();
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

  const handleBack = () => {
    if (jobId) {
      router.push(`/jobs/${jobId}`);
    } else {
      router.back();
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
      element.download = `cover-letter-${jobTitle || 'application'}-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
              Generating your cover letter...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="max-w-md w-full text-center glass-card p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Error</h2>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              {error || 'Failed to generate cover letter'}
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
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: 'var(--foreground)' }}
              >
                AI-Generated Cover Letter
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
            <p className="text-lg mb-4" style={{ color: 'var(--foreground-muted)' }}>
              For: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{jobTitle}</span>
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            {coverLetter.wordCount && (
              <Badge 
                variant="outline" 
                className="px-3 py-1"
                style={{
                  borderColor: 'var(--border)',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--accent)'
                }}
              >
                📊 {coverLetter.wordCount} words
              </Badge>
            )}
            {coverLetter.tone && (
              <Badge 
                variant="outline" 
                className="px-3 py-1"
                style={{
                  borderColor: 'var(--border)',
                  background: 'rgba(168, 85, 247, 0.1)',
                  color: '#A855F7'
                }}
              >
                ✨ {coverLetter.tone} tone
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Key Points */}
          {coverLetter.keyPoints && coverLetter.keyPoints.length > 0 && (
            <div className="glass-card p-6">
              <h3 
                className="font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <div 
                  className="p-2 rounded-full shrink-0"
                  style={{ 
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--accent)'
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                Key Highlights
              </h3>
              <ul className="space-y-2">
                {coverLetter.keyPoints.map((point: string, idx: number) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <Check 
                      className="w-5 h-5 mt-0.5 shrink-0" 
                      style={{ color: '#22C55E' }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cover Letter Text */}
          <div className="glass-card p-6 sm:p-8">
            <div 
              className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--foreground)' }}
            >
              {coverLetter.coverLetter}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={copyToClipboard} 
              className="flex-1 btn-gradient"
            >
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
            <Button 
              onClick={downloadAsText} 
              variant="outline" 
              className="flex-1"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download as Text
            </Button>
          </div>

          {/* Tip */}
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
                <strong style={{ color: 'var(--foreground)' }}>Tip:</strong> Personalize this cover letter before submitting. Add specific details about why you're interested in this company and role.
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
                Apply with This Letter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

