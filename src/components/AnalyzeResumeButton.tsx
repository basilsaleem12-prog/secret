'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import ResumeAnalysisModal from './ResumeAnalysisModal';

interface AnalyzeResumeButtonProps {
  resumeId: string;
  fileName: string;
  fileUrl: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

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

export default function AnalyzeResumeButton({
  resumeId,
  fileName,
  fileUrl,
  variant = 'outline',
  size = 'sm',
}: AnalyzeResumeButtonProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  const analyzeResume = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      // Check file type from fileName
      const isPDF = fileName.toLowerCase().endsWith('.pdf');
      if (isPDF) {
        alert('⚠️ PDF Analysis Not Available\n\nAI analysis is only available for DOCX and TXT files.\n\nTo analyze your resume:\n1. Convert your PDF to DOCX (Open PDF → Save As → Word Document)\n2. Upload the DOCX file\n3. Use AI Analysis\n\nDon\'t worry - you can still apply with your PDF resume!');
        setLoading(false);
        return;
      }

      // Download the file
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to download resume file');
      }

      const blob = await fileResponse.blob();
      
      // Determine correct MIME type
      let mimeType = blob.type;
      if (fileName.toLowerCase().endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.toLowerCase().endsWith('.txt')) {
        mimeType = 'text/plain';
      }

      const file = new File([blob], fileName, { type: mimeType });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resumeId', resumeId);

      // Call analysis API
      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      
      // Check if the response has error
      if (data.error) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      // Validate response has required fields
      if (data.success && data.overallScore !== undefined) {
        setAnalysis({
          summary: data.professionalSummary || '',
          detectedSkills: data.detectedSkills || [],
          experienceLevel: data.experienceLevel || 'N/A',
          yearsOfExperience: data.yearsOfExperience || 0,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          suggestedJobTitles: data.suggestedJobTitles || [],
          overallScore: data.overallScore || 0,
          wordCount: data.wordCount,
          pageCount: data.pageCount,
          insights: {
            education: data.education || '',
            professionalSummary: data.professionalBackground || data.professionalSummary || '',
            keyAchievements: data.keyAchievements || [],
          },
        });
      } else {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response format from server - missing required fields');
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze resume';
      setError(errorMessage);
      alert(`Error analyzing resume:\n\n${errorMessage}\n\nPlease make sure your resume is in DOCX or TXT format.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={analyzeResume}
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
            AI Analysis
          </>
        )}
      </Button>

      {analysis && (
        <ResumeAnalysisModal
          analysis={analysis}
          fileName={fileName}
          onClose={() => setAnalysis(null)}
        />
      )}
    </>
  );
}

