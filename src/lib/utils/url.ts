/**
 * Get the application URL dynamically
 * Works in both development and production environments
 */

/**
 * Get app URL for server-side code
 * Uses environment variable or derives from request headers
 */
export function getAppUrl(request?: Request | { headers: Headers | { get: (name: string) => string | null } }): string {
  // Priority 1: Environment variable (for production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Priority 2: Derive from request headers (for server-side rendering)
  if (request) {
    const headers = 'headers' in request ? request.headers : request
    const origin = headers.get('origin') || headers.get('x-forwarded-host') || headers.get('host')
    
    if (origin) {
      // If we have x-forwarded-host or host, construct URL
      const protocol = headers.get('x-forwarded-proto') || 
                      (origin.includes('localhost') ? 'http' : 'https')
      const host = origin.includes('://') ? origin : `${protocol}://${origin}`
      return host
    }
  }

  // Priority 3: Use Vercel URL if available (for Vercel deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback: Only use localhost in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // Production fallback - should not happen if env vars are set correctly
  throw new Error(
    'NEXT_PUBLIC_APP_URL environment variable must be set in production. ' +
    'Set it to your production URL (e.g., https://yourdomain.com)'
  )
}

/**
 * Get app URL for client-side code
 * Uses window.location.origin which is always correct
 */
export function getClientAppUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  return window.location.origin
}

/**
 * Build a full URL for a route
 */
export function buildAppUrl(path: string, request?: Request): string {
  const baseUrl = getAppUrl(request)
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

