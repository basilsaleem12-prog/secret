'use client';

import { Sparkles, TrendingUp, Zap, Target } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
}

export default function MatchScoreBadge({ 
  score, 
  size = 'md', 
  showLabel = true,
  showIcon = true 
}: MatchScoreBadgeProps): JSX.Element | null {
  if (score === null || score === undefined) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#f59e0b'; // orange
    if (score >= 40) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Great Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const getScoreIcon = (score: number): JSX.Element => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    if (score >= 90) return <Zap className={iconClass} />;
    if (score >= 75) return <Target className={iconClass} />;
    if (score >= 60) return <TrendingUp className={iconClass} />;
    return <Sparkles className={iconClass} />;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        background: `${getScoreColor(score)}15`,
        color: getScoreColor(score),
        border: `2px solid ${getScoreColor(score)}60`,
        boxShadow: `0 2px 8px ${getScoreColor(score)}20`,
      }}
      title={`AI Match Score: ${score}% - ${getScoreLabel(score)}`}
    >
      {showIcon && getScoreIcon(score)}
      <span className="font-bold">{score}%</span>
      {showLabel && size !== 'sm' && (
        <span className="hidden sm:inline font-medium">
          {getScoreLabel(score)}
        </span>
      )}
      <Sparkles className="w-3 h-3 opacity-60" />
    </div>
  );
}

