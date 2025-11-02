'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutButton } from './auth/LogoutButton'
import { RoleSwitcher } from './RoleSwitcher'
import NotificationCenter from './NotificationCenter'
import Cookies from 'js-cookie'
import { 
  Sparkles, Menu, X, LayoutDashboard, Briefcase, FileText, 
  Bookmark, Video, User, Search, PlusCircle, LogOut, Shield,
  ChevronDown
} from 'lucide-react'

export function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [activeRole, setActiveRole] = useState<'SEEKER' | 'FINDER' | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get active role from cookie
    const role = Cookies.get('campusconnect_active_role') as 'SEEKER' | 'FINDER' | undefined
    setActiveRole(role || null)

    // Check if user is admin
    if (user) {
      checkAdminStatus()
    }

    // Listen for role changes
    const handleRoleChange = (): void => {
      const newRole = Cookies.get('campusconnect_active_role') as 'SEEKER' | 'FINDER' | undefined
      setActiveRole(newRole || null)
    }

    window.addEventListener('roleChanged', handleRoleChange)
    return () => window.removeEventListener('roleChanged', handleRoleChange)
  }, [user])

  // Close dropdowns when pathname changes
  useEffect(() => {
    setRoleMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAdminStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      // User is not admin
      setIsAdmin(false)
    }
  }

  const NavLink = ({ href, children, icon: Icon, onClick }: { 
    href: string; 
    children: React.ReactNode; 
    icon?: React.ComponentType<{ className?: string }>; 
    onClick?: () => void;
  }): React.ReactElement => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isActive ? 'text-white' : ''
        }`}
        style={{ 
          color: isActive ? 'white' : 'var(--foreground)',
          backgroundColor: isActive ? '#1E3A8A' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
            e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
            e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
          }
        }}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 glass-card shadow-md" style={{ borderBottom: '1px solid var(--border)' }} suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex h-16 justify-between items-center" suppressHydrationWarning>
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-[#1E3A8A] to-blue-600 bg-clip-text text-transparent">
                CampusConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden lg:flex items-center gap-2">
                {/* Primary Navigation */}
                <div className="flex items-center gap-1">
                <NavLink href="/dashboard" icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
                <NavLink href="/jobs" icon={Search}>
                  Browse
                </NavLink>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300 mx-1" />

                {/* Role-specific Menu Dropdown */}
                <div className="relative" ref={roleMenuRef}>
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ 
                      color: pathname === '/my-jobs' || 
                        pathname === '/drafts' || 
                        pathname === '/my-applications' || 
                        pathname === '/resume-tips'
                        ? 'white' : 'var(--foreground)',
                      backgroundColor: (pathname === '/my-jobs' || 
                        pathname === '/drafts' || 
                        pathname === '/my-applications' || 
                        pathname === '/resume-tips') ? '#1E3A8A' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (pathname !== '/my-jobs' && 
                          pathname !== '/drafts' && 
                          pathname !== '/my-applications' && 
                          pathname !== '/resume-tips') {
                        e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== '/my-jobs' && 
                          pathname !== '/drafts' && 
                          pathname !== '/my-applications' && 
                          pathname !== '/resume-tips') {
                        e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                  >
                    {activeRole === 'FINDER' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>
                      {activeRole === 'FINDER' ? 'My Jobs' : 'Applications'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Role Menu Dropdown */}
                  {roleMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 glass-card shadow-lg rounded-lg overflow-hidden z-50 border" style={{ borderColor: 'var(--border)' }}>
                      {activeRole === 'FINDER' ? (
                        <>
                          <Link
                            href="/my-jobs"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm"
                            style={{ 
                              color: 'var(--foreground)', 
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                          >
                            <Briefcase className="w-4 h-4" />
                      My Jobs
                          </Link>
                          <Link
                            href="/drafts"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm border-t" 
                            style={{ 
                              borderColor: 'var(--border)', 
                              color: 'var(--foreground)', 
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                          >
                            <FileText className="w-4 h-4" />
                      Drafts
                          </Link>
                          <Link
                            href="/jobs/create"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold border-t" 
                            style={{ 
                              borderColor: 'var(--border)', 
                              color: '#1E3A8A',
                              backgroundColor: 'rgba(239, 246, 255, 0.8)',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#DBEAFE', 'important')
                              e.currentTarget.style.setProperty('color', '#1E3A8A', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'rgba(239, 246, 255, 0.8)', 'important')
                              e.currentTarget.style.setProperty('color', '#1E3A8A', 'important')
                            }}
                          >
                            <PlusCircle className="w-4 h-4" />
                            Post New Job
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/my-applications"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm"
                            style={{ 
                              color: 'var(--foreground)', 
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            My Applications
                          </Link>
                          <Link
                            href="/resume-tips"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm border-t" 
                            style={{ 
                              borderColor: 'var(--border)', 
                              color: 'var(--foreground)', 
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                          >
                        <Sparkles className="w-4 h-4" />
                            Resume Tips
                          </Link>
                  </>
                )}
                    </div>
                  )}
                </div>

                {/* Secondary Actions (Icon buttons with tooltips) */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/saved-jobs"
                    className="p-2 rounded-lg"
                    title="Saved Jobs"
                    style={{ 
                      color: pathname === '/saved-jobs' ? 'white' : 'var(--foreground)',
                      backgroundColor: pathname === '/saved-jobs' ? '#1E3A8A' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (pathname !== '/saved-jobs') {
                        e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== '/saved-jobs') {
                        e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/video-calls"
                    className="p-2 rounded-lg"
                    title="Video Calls"
                    style={{ 
                      color: pathname === '/video-calls' ? 'white' : 'var(--foreground)',
                      backgroundColor: pathname === '/video-calls' ? '#1E3A8A' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (pathname !== '/video-calls') {
                        e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== '/video-calls') {
                        e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                        e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                      }
                    }}
                  >
                    <Video className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            ) : user ? (
              <>
                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-2">
                  {/* Divider */}
                  <div className="h-6 w-px bg-gray-300 mx-1" />
                  
                  {/* Role Switcher (Compact) */}
                  <div className="hidden xl:block">
                  <RoleSwitcher />
                  </div>
                  
                  {/* Notification Center */}
                  <NotificationCenter />
                  
                  {/* User Menu Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      title={user.email || 'User menu'}
                      style={{ 
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--foreground-muted)' }} />
                    </button>

                    {/* User Menu Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 glass-card shadow-lg rounded-lg overflow-hidden z-50 border" style={{ borderColor: 'var(--border)' }}>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                      {user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                            {user.email}
                          </p>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activeRole === 'SEEKER' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                      {activeRole === 'SEEKER' ? '🔍 Finding Work' : '📝 Posting Jobs'}
                    </span>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm"
                            style={{ 
                              color: 'var(--foreground)', 
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                              e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                            }}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>

                          {/* Role Switcher (in menu for smaller screens) */}
                          <div className="xl:hidden px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                            <RoleSwitcher />
                          </div>

                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm border-t" 
                              style={{ 
                                borderColor: 'var(--border)', 
                                color: 'var(--foreground)', 
                                backgroundColor: 'transparent',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.setProperty('background-color', '#9CA3AF', 'important')
                                e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                                e.currentTarget.style.setProperty('color', 'var(--foreground)', 'important')
                              }}
                            >
                              <Shield className="w-4 h-4" />
                              <span className="font-semibold">Admin Panel</span>
                            </Link>
                          )}

                          <div className="border-t mt-1" style={{ borderColor: 'var(--border)' }}>
                            <div className="px-1 py-1">
                              <LogoutButton />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile menu button */}
                <button
                  className="lg:hidden p-2 rounded-xl active:scale-95"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                  style={{ 
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.setProperty('background-color', '#D1D5DB', 'important')
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                  }}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                  ) : (
                    <Menu className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                  )}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="glass-card rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ color: 'var(--foreground)' }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t animate-in slide-in-from-top duration-200" style={{ borderColor: 'var(--border)' }}>
            {/* User Info Section */}
            <div className="px-4 py-3 mb-2 rounded-xl" style={{ background: 'rgba(30, 58, 138, 0.05)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`px-2 py-1 rounded-full ${
                  activeRole === 'SEEKER' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {activeRole === 'SEEKER' ? '🔍 Finding Work' : '📝 Posting Jobs'}
                </span>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="px-4 py-2">
              <RoleSwitcher />
            </div>

            <div className="h-px" style={{ background: 'var(--border)' }}></div>

            {/* Navigation Links */}
            <div className="space-y-1 px-2">
              <NavLink 
                href="/dashboard" 
                icon={LayoutDashboard}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              
              <NavLink 
                href="/jobs" 
                icon={Search}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Jobs
              </NavLink>
              
              {activeRole === 'FINDER' && (
                <>
                  <NavLink 
                    href="/my-jobs" 
                    icon={Briefcase}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Jobs
                  </NavLink>
                  <NavLink 
                    href="/drafts" 
                    icon={FileText}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Drafts
                  </NavLink>
                  <Link
                    href="/jobs/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all bg-[#1E3A8A] text-white hover:bg-blue-700"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post New Job
                  </Link>
                </>
              )}
              
              {activeRole === 'SEEKER' && (
                <>
                <NavLink 
                  href="/my-applications" 
                  icon={FileText}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Applications
                </NavLink>
                  <NavLink 
                    href="/resume-tips" 
                    icon={Sparkles}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Resume Tips
                  </NavLink>
                </>
              )}
              
              <NavLink 
                href="/saved-jobs" 
                icon={Bookmark}
                onClick={() => setMobileMenuOpen(false)}
              >
                Saved Jobs
              </NavLink>
              
              <NavLink 
                href="/video-calls" 
                icon={Video}
                onClick={() => setMobileMenuOpen(false)}
              >
                Video Calls
              </NavLink>
              
              <NavLink 
                href="/profile" 
                icon={User}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </NavLink>

              {isAdmin && (
                <NavLink 
                  href="/admin" 
                  icon={Shield}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-bold">Admin Panel</span>
                  </div>
                </NavLink>
              )}
            </div>

            <div className="h-px" style={{ background: 'var(--border)' }}></div>

            {/* Notifications and Logout */}
            <div className="px-2 space-y-2">
              <div className="px-2">
                <NotificationCenter />
              </div>
              <div className="px-1">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

