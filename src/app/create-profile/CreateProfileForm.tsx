'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { SkillsInput } from './SkillsInput';
import { InterestsInput } from './InterestsInput';
import { RoleSelector } from './RoleSelector';
import { AvatarUpload } from './AvatarUpload';

interface CreateProfileFormProps {
  user: User;
}

export function CreateProfileForm({ user }: CreateProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0] || '',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || 
               user.user_metadata?.picture || '',
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
    role: 'SEEKER' as 'FINDER' | 'SEEKER',
    department: '',
    year: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Comprehensive Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (formData.fullName.trim().length > 100) {
      setError('Full name must be less than 100 characters');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName.trim())) {
      setError('Full name can only contain letters, spaces, hyphens and apostrophes');
      setLoading(false);
      return;
    }

    if (formData.bio.length > 500) {
      setError('Bio must be less than 500 characters');
      setLoading(false);
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      setLoading(false);
      return;
    }

    if (formData.skills.length > 20) {
      setError('Maximum 20 skills allowed');
      setLoading(false);
      return;
    }

    // Validate each skill
    for (const skill of formData.skills) {
      if (skill.length > 50) {
        setError('Skill name too long (max 50 characters)');
        setLoading(false);
        return;
      }
    }

    if (formData.interests.length === 0) {
      setError('Please add at least one interest');
      setLoading(false);
      return;
    }

    if (formData.interests.length > 20) {
      setError('Maximum 20 interests allowed');
      setLoading(false);
      return;
    }

    // Validate each interest
    for (const interest of formData.interests) {
      if (interest.length > 50) {
        setError('Interest name too long (max 50 characters)');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const years = [
    'Freshman (1st Year)',
    'Sophomore (2nd Year)',
    'Junior (3rd Year)',
    'Senior (4th Year)',
    'Graduate Student',
    'PhD Candidate',
    'Alumni',
    'Faculty',
  ];

  const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Design',
    'Sciences',
    'Arts & Humanities',
    'Medicine',
    'Law',
    'Education',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="glass-card px-4 py-3" style={{ 
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Avatar Upload */}
      <div>
        <Label className="text-lg font-semibold mb-3 block" style={{ color: 'var(--foreground)' }}>
          Profile Photo
        </Label>
        <AvatarUpload
          currentUrl={formData.avatarUrl}
          onUpload={(url: string) => updateField('avatarUrl', url)}
        />
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Basic Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" style={{ color: 'var(--foreground)' }}>
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="John Doe"
              required
              minLength={2}
              maxLength={100}
              pattern="[a-zA-Z\s'-]+"
              title="Full name can only contain letters, spaces, hyphens and apostrophes"
              className="mt-2 glass-input"
            />
          </div>

          <div>
            <Label htmlFor="email" style={{ color: 'var(--foreground)' }}>
              Email
            </Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="mt-2 glass-input opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

          <div>
            <Label htmlFor="bio" style={{ color: 'var(--foreground)' }}>
              Bio / About Me
            </Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Tell us about yourself... What are you passionate about? What are your goals?"
              rows={4}
              maxLength={500}
              className="mt-2 w-full glass-input resize-none"
            />
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
              {formData.bio.length}/500 characters - A good bio helps others understand your background
            </p>
          </div>
      </div>

      {/* Academic Information */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Academic Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="department" style={{ color: 'var(--foreground)' }}>
              Department / Major
            </Label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className="mt-2 w-full glass-input"
            >
              <option value="">Select your department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="year" style={{ color: 'var(--foreground)' }}>
              Academic Year / Level
            </Label>
            <select
              id="year"
              value={formData.year}
              onChange={(e) => updateField('year', e.target.value)}
              className="mt-2 w-full glass-input"
            >
              <option value="">Select your year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          How will you use CampusConnect?
        </h2>
        <RoleSelector
          selectedRole={formData.role}
          onSelect={(role: 'FINDER' | 'SEEKER') => updateField('role', role)}
        />
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          You can always switch between roles later
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Your Skills *
        </h2>
        <SkillsInput
          skills={formData.skills}
          onChange={(skills: string[]) => updateField('skills', skills)}
        />
      </div>

      {/* Interests */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Your Interests *
        </h2>
        <InterestsInput
          interests={formData.interests}
          onChange={(interests: string[]) => updateField('interests', interests)}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full h-14 text-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
              Creating your profile...
            </>
          ) : (
            'Create Profile'
          )}
        </button>
      </div>
    </form>
  );
}

