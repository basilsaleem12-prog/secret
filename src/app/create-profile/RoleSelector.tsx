'use client';

import { Briefcase, Search } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'FINDER' | 'SEEKER';
  onSelect: (role: 'FINDER' | 'SEEKER') => void;
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Seeker Card */}
      <button
        type="button"
        onClick={() => onSelect('SEEKER')}
        className="glass-card p-6 text-left"
        style={{
          borderColor: selectedRole === 'SEEKER' ? 'var(--accent)' : 'var(--border)',
          borderWidth: '2px',
          background: selectedRole === 'SEEKER' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{
              background: selectedRole === 'SEEKER' ? 'var(--accent)' : 'rgba(0,0,0,0.1)',
              color: selectedRole === 'SEEKER' ? 'white' : 'var(--foreground)'
            }}
          >
            <Search className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Talent Seeker
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              Looking for opportunities, projects, internships, or collaborations. 
              Browse and apply to posts from finders.
            </p>
          </div>
        </div>
        {selectedRole === 'SEEKER' && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            <div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
            Selected
          </div>
        )}
      </button>

      {/* Finder Card */}
      <button
        type="button"
        onClick={() => onSelect('FINDER')}
        className="glass-card p-6 text-left"
        style={{
          borderColor: selectedRole === 'FINDER' ? '#8B5CF6' : 'var(--border)',
          borderWidth: '2px',
          background: selectedRole === 'FINDER' ? 'rgba(139, 92, 246, 0.1)' : 'var(--card)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{
              background: selectedRole === 'FINDER' ? '#8B5CF6' : 'rgba(0,0,0,0.1)',
              color: selectedRole === 'FINDER' ? 'white' : 'var(--foreground)'
            }}
          >
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Talent Finder
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              Have a project, startup, or opportunity? Post opportunities and 
              find talented students to collaborate with.
            </p>
          </div>
        </div>
        {selectedRole === 'FINDER' && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: '#8B5CF6' }}>
            <div className="h-2 w-2 rounded-full" style={{ background: '#8B5CF6' }}></div>
            Selected
          </div>
        )}
      </button>
    </div>
  );
}

