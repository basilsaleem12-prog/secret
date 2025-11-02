// Role-Based Access Control (RBAC) utilities

export const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
  GUEST: 'GUEST',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  // User permissions
  'user:view': ['ADMIN', 'MODERATOR'],
  'user:create': ['ADMIN'],
  'user:update': ['ADMIN'],
  'user:delete': ['ADMIN'],
  'user:manage_roles': ['ADMIN'],

  // File permissions
  'file:upload': ['ADMIN', 'MODERATOR', 'USER'],
  'file:view_own': ['ADMIN', 'MODERATOR', 'USER'],
  'file:view_all': ['ADMIN', 'MODERATOR'],
  'file:delete_own': ['ADMIN', 'MODERATOR', 'USER'],
  'file:delete_any': ['ADMIN', 'MODERATOR'],
  'file:share': ['ADMIN', 'MODERATOR', 'USER'],

  // Folder permissions
  'folder:create': ['ADMIN', 'MODERATOR', 'USER'],
  'folder:delete': ['ADMIN', 'MODERATOR', 'USER'],
  'folder:share': ['ADMIN', 'MODERATOR', 'USER'],

  // Admin permissions
  'admin:access_panel': ['ADMIN'],
  'admin:view_logs': ['ADMIN', 'MODERATOR'],
  'admin:manage_storage': ['ADMIN'],
  'admin:manage_permissions': ['ADMIN'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.includes(userRole)
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

export function getRoleLevel(role: Role): number {
  const levels: Record<Role, number> = {
    ADMIN: 4,
    MODERATOR: 3,
    USER: 2,
    GUEST: 1,
  }
  return levels[role] || 0
}

export function canManageUser(managerRole: Role, targetRole: Role): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: 'Full system access with all permissions',
  MODERATOR: 'Can manage content and view users',
  USER: 'Standard user with file upload and management',
  GUEST: 'Limited read-only access',
}

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MODERATOR: 'bg-blue-100 text-blue-800 border-blue-200',
  USER: 'bg-green-100 text-green-800 border-green-200',
  GUEST: 'bg-gray-100 text-gray-800 border-gray-200',
}





