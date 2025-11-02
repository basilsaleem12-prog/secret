'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SUGGESTED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'UI/UX Design',
  'Figma',
  'Machine Learning',
  'Data Analysis',
  'Project Management',
  'Marketing',
  'Content Writing',
  'Video Editing',
  'Public Speaking',
  'Leadership',
  'Flutter',
  'iOS Development',
  'Android Development',
  'SQL',
  'AWS',
];

export function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill) return;
    
    if (trimmedSkill.length > 50) {
      alert('Skill name too long (max 50 characters)');
      return;
    }
    
    if (skills.length >= 20) {
      alert('Maximum 20 skills allowed');
      return;
    }
    
    if (skills.includes(trimmedSkill)) {
      alert('This skill already exists');
      return;
    }
    
    onChange([...skills, trimmedSkill]);
    setInputValue('');
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
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
          placeholder="Add a skill (e.g., React, Python, Design...)"
          className="glass-input"
          maxLength={50}
        />
        <Button
          type="button"
          onClick={() => addSkill(inputValue)}
          className="btn-gradient"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Skills */}
      {skills.length > 0 && (
        <div className="glass-card flex flex-wrap gap-2 p-4" style={{ 
          background: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        }}>
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2 glass-card"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggested Skills */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Suggested Skills (click to add):
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="px-3 py-1.5 text-sm rounded-full transition-all hover:scale-105"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                backdropFilter: 'blur(8px)'
              }}
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
        Added {skills.length}/20 skill{skills.length !== 1 ? 's' : ''} • These help match you with relevant opportunities
      </p>
    </div>
  );
}

