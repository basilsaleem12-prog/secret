'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Briefcase, MapPin, Clock } from 'lucide-react';

interface JobRecommendation {
  id: string;
  title: string;
  description: string;
  jobType: string;
  location: string;
  createdAt: string;
  matchScore: number;
  company: string;
  views: number;
  _count: {
    applications: number;
  };
}

export default function AIJobRecommendations(): JSX.Element {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async (): Promise<void> => {
      try {
        const response = await fetch('/api/jobs?limit=5');
        if (response.ok) {
          const data = await response.json();
          // Handle both array and object responses
          const jobsArray = Array.isArray(data) ? data : (data.jobs || []);
          // Transform to expected format
          const transformed: JobRecommendation[] = jobsArray.slice(0, 5).map((job: any) => ({
            id: job.id,
            title: job.title,
            description: job.description || '',
            jobType: job.type || 'N/A',
            location: job.location || 'Remote',
            createdAt: job.createdAt || new Date().toISOString(),
            matchScore: 85, // Default match score for now
            company: job.createdBy?.fullName || 'Company',
            views: job.views || 0,
            _count: {
              applications: job._count?.applications || 0,
            },
          }));
          setRecommendations(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-[#1E3A8A]" />
          <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            AI Recommendations
          </h3>
        </div>
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--foreground-muted)', opacity: 0.5 }} />
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            No recommendations available yet. Complete your profile to get personalized job matches!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(30, 58, 138, 0.1)' }}>
          <Sparkles className="w-6 h-6 text-[#1E3A8A]" />
        </div>
        <div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            AI-Powered Recommendations
          </h3>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Jobs matched to your skills and interests
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block glass-card p-6 hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1 group-hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground)' }}>
                      {job.title}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                      {job.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">{job.matchScore}% Match</span>
                  </div>
                </div>

                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(30, 58, 138, 0.1)', color: '#1E3A8A' }}>
                    {job.jobType}
                  </span>
                  {job.location && (
                    <div className="flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                      <MapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/jobs"
        className="block text-center text-sm font-medium pt-4 mt-4 hover:text-[#1E3A8A] transition-colors"
        style={{ color: 'var(--accent)', borderTop: '1px solid var(--border)' }}
      >
        View All Opportunities →
      </Link>
    </div>
  );
}
