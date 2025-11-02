/**
 * Get the application URL dynamically
 * Works in both development and production environments
 */

/**
 * Get app URL for server-side code
 * Uses environment variable or derives from request headers
 */
export function getAppUrl(request?: Request | { headers: Headers | { get: (name: string) => string | null } }): string {
  // Priority 1: Environment variable (for production) - ALWAYS USE THIS WHEN SET
  // This takes absolute priority to ensure production URLs are always correct
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL.trim()
    // Ensure it doesn't end with a slash
    const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
    // Always return the env var if set - ignore request headers completely
    return cleanUrl
  }

  // Priority 2: Derive from request (for development or when env var not set)
  if (request) {
    const headers = 'headers' in request ? request.headers : request
    
    // Try to get the full origin from the request URL first (most reliable)
    if ('url' in request && request.url) {
      try {
        const url = new URL(request.url)
        const origin = url.origin
        // Only use request URL origin if it's not localhost (unless in development)
        if (process.env.NODE_ENV === 'development' || (!origin.includes('localhost') && !origin.includes('127.0.0.1'))) {
          return origin
        }
      } catch {
        // Invalid URL, continue with headers
      }
    }
    
    // Get origin from headers (includes protocol)
    const headerOrigin = headers.get('origin')
    
    // Use origin from header if it's available and not localhost (unless in development)
    if (headerOrigin) {
      if (process.env.NODE_ENV === 'development' || (!headerOrigin.includes('localhost') && !headerOrigin.includes('127.0.0.1'))) {
        return headerOrigin
      }
    }
    
    // Last resort: construct from forwarded headers or host
    const forwardedHost = headers.get('x-forwarded-host') || headers.get('host')
    if (forwardedHost) {
      const protocol = headers.get('x-forwarded-proto') || 
                      (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1') ? 'http' : 'https')
      // Preserve port if present in host
      const host = forwardedHost.includes('://') ? forwardedHost : `${protocol}://${forwardedHost}`
      // Only use this if it's not localhost (unless in development)
      if (process.env.NODE_ENV === 'development' || (!host.includes('localhost') && !host.includes('127.0.0.1'))) {
        return host
      }
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

  // Production fallback - CRITICAL: This should not happen in production
  console.error('⚠️ WARNING: NEXT_PUBLIC_APP_URL is not set in production!')
  console.error('Please set NEXT_PUBLIC_APP_URL=http://159.223.38.110:3000 in your environment variables')
  
  // Return production URL as hardcoded fallback (this should be temporary)
  return 'http://159.223.38.110:3000'
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

