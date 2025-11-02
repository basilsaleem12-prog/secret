'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface InterestsInputProps {
  interests: string[];
  onChange: (interests: string[]) => void;
}

const SUGGESTED_INTERESTS = [
  'Web Development',
  'Mobile Apps',
  'AI & Machine Learning',
  'Blockchain',
  'Cybersecurity',
  'Game Development',
  'Startups',
  'Hackathons',
  'Research',
  'Open Source',
  'Entrepreneurship',
  'Data Science',
  'Cloud Computing',
  'IoT',
  'Robotics',
  'AR/VR',
  'Sustainability',
  'Social Impact',
  'EdTech',
  'FinTech',
];

export function InterestsInput({ interests, onChange }: InterestsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim();
    
    if (!trimmedInterest) return;
    
    if (trimmedInterest.length > 50) {
      alert('Interest name too long (max 50 characters)');
      return;
    }
    
    if (interests.length >= 20) {
      alert('Maximum 20 interests allowed');
      return;
    }
    
    if (interests.includes(trimmedInterest)) {
      alert('This interest already exists');
      return;
    }
    
    onChange([...interests, trimmedInterest]);
    setInputValue('');
  };

  const removeInterest = (interestToRemove: string) => {
    onChange(interests.filter((i) => i !== interestToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add an interest (e.g., Startups, AI, Game Dev...)"
          className="glass-input"
          maxLength={50}
        />
        <button
          type="button"
          onClick={() => addInterest(inputValue)}
          className="btn-gradient px-4"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Selected Interests */}
      {interests.length > 0 && (
        <div className="glass-card flex flex-wrap gap-2 p-4" style={{ 
          background: 'rgba(139, 92, 246, 0.05)',
          borderColor: 'rgba(139, 92, 246, 0.2)'
        }}>
          {interests.map((interest) => (
            <Badge
              key={interest}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2 glass-card"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggested Interests */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Popular Interests (click to add):
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.filter((i) => !interests.includes(i)).map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => addInterest(interest)}
              className="px-3 py-1.5 text-sm rounded-full transition-all hover:scale-105"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                backdropFilter: 'blur(8px)'
              }}
            >
              + {interest}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
        Added {interests.length}/20 interest{interests.length !== 1 ? 's' : ''} • These help us recommend relevant opportunities
      </p>
    </div>
  );
}

