'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { isAdminEmail } from '@/lib/admin/config'

interface GoogleSignInButtonProps {
  redirectTo?: string
  label?: string
}

export function GoogleSignInButton({ 
  redirectTo = '/dashboard',
  label = 'Continue with Google'
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Ensure we get user metadata from Google
          skipBrowserRedirect: false,
        },
      })

      if (error) {
        console.error('❌ Google OAuth error:', error)
        
        // Provide helpful error messages
        if (error.message.includes('redirect_uri')) {
          setError('Google OAuth is not properly configured. Please check the redirect URI settings.')
        } else {
          setError(error.message || 'Failed to sign in with Google. Please try again.')
        }
        setLoading(false)
      } else if (data.url) {
        // Success - redirect to Google
        // The loading state will persist until redirect happens
        // No need to set loading to false here as redirect is happening
        window.location.href = data.url
      } else {
        setError('Unable to initiate Google sign-in. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error in Google sign-in:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {label}
          </>
        )}
      </Button>

      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            border: '1px solid',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

