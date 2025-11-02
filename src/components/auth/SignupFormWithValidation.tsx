'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GoogleSignInButton } from './GoogleSignInButton'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

export function SignupFormWithValidation() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | 'email_confirmation'>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignupInput) => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        // EMAIL VERIFICATION DISABLED - Users can login immediately
        // Uncomment the code below to enable email verification
        
        // // Check if email confirmation is required
        // const { data: { session } } = await supabase.auth.getSession()
        // 
        // if (session) {
        //   // User is logged in (email confirmation disabled)
        //   setSuccess(true)
        //   setTimeout(() => {
        //     router.push('/create-profile')
        //     router.refresh()
        //   }, 2000)
        // } else {
        //   // Email confirmation required
        //   setSuccess('email_confirmation')
        // }
        
        // For now, redirect directly to profile creation
        setSuccess(true)
        setTimeout(() => {
          router.push('/create-profile')
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Account created!
            </h3>
            {success === 'email_confirmation' ? (
              <div className="space-y-3">
                <p className="text-base" style={{ color: 'var(--foreground-muted)' }}>
                  We've sent a confirmation email to your inbox.
                </p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Please check your email and click the confirmation link to activate your account. 
                  After confirming, you can log in.
                </p>
                <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <p className="text-sm" style={{ color: 'var(--accent)' }}>
                    Don't see the email? Check your spam folder or contact support.
                  </p>
                </div>
                <Link 
                  href="/login" 
                  className="btn-gradient inline-block px-6 py-3 mt-4"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Let's create your profile...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold" style={{
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Join CampusConnect
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
          Start connecting with talented students
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8">
        {/* Google Sign In Button */}
        <GoogleSignInButton redirectTo="/create-profile" label="Sign up with Google" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span style={{ color: 'var(--foreground-muted)', backgroundColor: 'var(--card)', padding: '0 1rem' }}>
              Or sign up with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="glass-card p-4" style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#dc2626'
              }}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@university.edu"
                      autoComplete="email"
                      className="glass-input h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="glass-input h-12 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Must contain uppercase, lowercase, and number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="glass-input h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              className="btn-gradient w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </Form>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


