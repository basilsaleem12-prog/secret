'use client'

import { useAuth } from '@/contexts/AuthContext'
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, Role } from '@/lib/rbac/permissions'

export function usePermissions() {
  const { user } = useAuth()
  
  // For now, get role from user metadata
  // In production, this should come from your database
  const userRole = (user?.user_metadata?.role || 'USER') as Role

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(userRole, permission)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return hasAnyPermission(userRole, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return hasAllPermissions(userRole, permissions)
  }

  return {
    userRole,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
  }
}





