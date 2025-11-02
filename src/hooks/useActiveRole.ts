'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export type UserRole = 'SEEKER' | 'FINDER'

const ACTIVE_ROLE_COOKIE = 'campusconnect_active_role'

export function useActiveRole(defaultRole: UserRole = 'SEEKER') {
  const [activeRole, setActiveRoleState] = useState<UserRole>(defaultRole)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load active role from cookie on mount
    const savedRole = Cookies.get(ACTIVE_ROLE_COOKIE) as UserRole | undefined
    if (savedRole && (savedRole === 'SEEKER' || savedRole === 'FINDER')) {
      setActiveRoleState(savedRole)
    } else {
      setActiveRoleState(defaultRole)
    }
    setIsLoading(false)
  }, [defaultRole])

  const setActiveRole = (role: UserRole): void => {
    setActiveRoleState(role)
    // Save to cookie with 30 days expiry
    Cookies.set(ACTIVE_ROLE_COOKIE, role, { expires: 30 })
  }

  const toggleRole = (): void => {
    const newRole = activeRole === 'SEEKER' ? 'FINDER' : 'SEEKER'
    setActiveRole(newRole)
  }

  return {
    activeRole,
    setActiveRole,
    toggleRole,
    isLoading,
    isSeekerMode: activeRole === 'SEEKER',
    isFinderMode: activeRole === 'FINDER',
  }
}

