'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/lib/rbac/permissions'
import { Alert, AlertDescription } from './ui/alert'

interface PermissionGuardProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to access this feature.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}





