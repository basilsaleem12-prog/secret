'use client';

import { Sparkles, X, Award, Briefcase, TrendingUp, Target, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

interface ResumeAnalysisModalProps {
  analysis: ResumeAnalysis | null;
  fileName?: string;
  onClose: () => void;
}

export default function ResumeAnalysisModal({
  analysis,
  fileName,
  onClose,
}: ResumeAnalysisModalProps): JSX.Element | null {
  if (!analysis) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getExperienceColor = (level: string): string => {
    if (level === 'Expert' || level === 'Senior') return 'bg-purple-100 text-purple-800';
    if (level === 'Mid Level') return 'bg-blue-100 text-blue-800';
    if (level === 'Junior') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9996] p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass-card p-6 border-b flex items-start justify-between bg-linear-to-r from-purple-50 to-blue-50" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#1E3A8A' }} />
              AI Resume Analysis
            </h2>
            {fileName && (
              <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                <FileText className="w-4 h-4" />
                {fileName}
                {analysis.wordCount && ` • ${analysis.wordCount} words`}
                {analysis.pageCount && ` • ${analysis.pageCount} pages`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score and Level */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Overall Score */}
            <div className="glass-card p-6 text-center">
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
            <div className="glass-card p-6 text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)' }}
              >
                <Briefcase className="w-12 h-12" />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                Experience Level
              </h3>
              <Badge className={getExperienceColor(analysis.experienceLevel)}>
                {analysis.experienceLevel}
              </Badge>
              <p className="text-sm mt-2" style={{ color: 'var(--foreground-muted)' }}>
                {analysis.yearsOfExperience} {analysis.yearsOfExperience === 1 ? 'year' : 'years'} experience
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Award className="w-5 h-5" style={{ color: '#1E3A8A' }} />
              Professional Summary
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {analysis.summary}
            </p>
          </div>

          {/* Detected Skills */}
          {analysis.detectedSkills.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Target className="w-5 h-5" style={{ color: '#1E3A8A' }} />
                Detected Skills ({analysis.detectedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    <span style={{ color: 'var(--foreground-muted)' }}>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {analysis.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                    <span style={{ color: 'var(--foreground-muted)' }}>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Job Titles */}
          {analysis.suggestedJobTitles.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#1E3A8A' }} />
                Recommended Job Titles
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedJobTitles.map((title: string, index: number) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Achievements */}
          {analysis.insights.keyAchievements.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--foreground)' }}>
                Key Achievements
              </h3>
              <ul className="space-y-2">
                {analysis.insights.keyAchievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-600 mt-0.5">★</span>
                    <span style={{ color: 'var(--foreground-muted)' }}>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education & Professional Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Education
              </h4>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {analysis.insights.education}
              </p>
            </div>
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Professional Background
              </h4>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {analysis.insights.professionalSummary}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="btn-gradient">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

