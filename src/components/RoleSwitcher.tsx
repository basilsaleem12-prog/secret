'use client'

import { Search, Briefcase } from 'lucide-react'
import Cookies from 'js-cookie'
import { useState } from 'react'

export type UserRole = 'SEEKER' | 'FINDER'

const ACTIVE_ROLE_COOKIE = 'campusconnect_active_role'

interface RoleSwitcherProps {
  defaultRole?: UserRole
  className?: string
}

export function RoleSwitcher({ defaultRole = 'SEEKER', className = '' }: RoleSwitcherProps) {
  // Get initial role from cookie or default
  const savedRole = Cookies.get(ACTIVE_ROLE_COOKIE) as UserRole | undefined
  const [activeRole] = useState<UserRole>(savedRole || defaultRole)

  const handleRoleSwitch = (newRole: UserRole): void => {
    if (newRole !== activeRole) {
      // Clear existing cookie
      Cookies.remove(ACTIVE_ROLE_COOKIE)
      // Set new role in cookie
      Cookies.set(ACTIVE_ROLE_COOKIE, newRole, { expires: 30 })
      // Redirect to dashboard
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className={`flex items-center gap-2 glass-card p-1 rounded-full ${className}`}>
      <button
        onClick={() => handleRoleSwitch('SEEKER')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeRole === 'SEEKER' ? 'text-white' : ''
        }`}
        style={{
          background: activeRole === 'SEEKER' 
            ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' 
            : 'transparent',
          color: activeRole === 'SEEKER' ? 'white' : 'var(--foreground-muted)',
        }}
      >
        <Search className="h-4 w-4" />
        <span>Find Work</span>
      </button>
      <button
        onClick={() => handleRoleSwitch('FINDER')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeRole === 'FINDER' ? 'text-white' : ''
        }`}
        style={{
          background: activeRole === 'FINDER' 
            ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' 
            : 'transparent',
          color: activeRole === 'FINDER' ? 'white' : 'var(--foreground-muted)',
        }}
      >
        <Briefcase className="h-4 w-4" />
        <span>Post Jobs</span>
      </button>
    </div>
  )
}

