# 🚀 Deployment Guide

This guide ensures your application works correctly in both development and production environments without hardcoded URLs.

## 📋 Environment Variables

Set these environment variables in your production environment (Vercel, Railway, etc.):

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application URL (CRITICAL for production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# OR for Vercel deployments, this is auto-set as VERCEL_URL
```

### Optional Variables

```bash
# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# 100ms Video Calling
HMS_APP_ACCESS_KEY=your-100ms-access-key
HMS_APP_SECRET=your-100ms-secret

# Database
DATABASE_URL=your-postgres-connection-string
```

## 🔧 How URL Resolution Works

The app uses a smart URL resolution system that works in all environments:

1. **Priority 1**: `NEXT_PUBLIC_APP_URL` environment variable
2. **Priority 2**: Request headers (`origin`, `x-forwarded-host`)
3. **Priority 3**: `VERCEL_URL` (automatically set by Vercel)
4. **Fallback**: `http://localhost:3000` (development only)

### Server-Side

```typescript
import { getAppUrl } from '@/lib/utils/url'

// In API routes
export async function GET(request: Request) {
  const appUrl = getAppUrl(request)
  // Use appUrl for redirects, emails, etc.
}
```

### Client-Side

```typescript
// Automatically uses window.location.origin
const url = `${window.location.origin}/some-path`
```

## 🌐 Platform-Specific Setup

### Vercel Deployment

1. Push your code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (or custom domain)
   - All other required env vars

Vercel automatically sets `VERCEL_URL`, but for production, use `NEXT_PUBLIC_APP_URL` with your custom domain.

### Railway Deployment

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Set `NEXT_PUBLIC_APP_URL` to your Railway app URL or custom domain

### Other Platforms

Ensure:
- `NEXT_PUBLIC_APP_URL` is set to your production domain
- All environment variables are configured
- Database connection string is valid

## ✅ Pre-Deployment Checklist

- [ ] All environment variables are set
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] Supabase redirect URLs are configured:
  - Add your production URL: `https://yourdomain.com/auth/callback`
  - Add to Supabase Dashboard → Authentication → URL Configuration
- [ ] Google OAuth redirect URI is set:
  - In Google Cloud Console: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
- [ ] Database migrations are run
- [ ] Stripe webhook URL is configured (if using payments)
- [ ] Test OAuth sign-in works
- [ ] Test file uploads work (Supabase Storage)

## 🔍 Testing URLs After Deployment

1. **Test OAuth Callback**:
   - Sign in with Google
   - Verify redirect to `/auth/callback` works
   - Check browser console for any URL-related errors

2. **Test Email Links**:
   - Send a test email
   - Verify all links in emails point to your production domain

3. **Test Stripe Payments**:
   - Make a test payment
   - Verify success/cancel URLs work correctly

4. **Test File Storage**:
   - Upload a file (avatar, resume)
   - Verify file is accessible via public URL

## 🐛 Troubleshooting

### Issue: OAuth redirects to localhost

**Cause**: `NEXT_PUBLIC_APP_URL` not set in production

**Fix**: Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` in your deployment platform

### Issue: Email links point to localhost

**Cause**: Email service functions not receiving request context

**Fix**: The email functions now automatically use environment variables. Ensure `NEXT_PUBLIC_APP_URL` is set.

### Issue: API routes returning wrong URLs

**Cause**: Request headers not being read correctly

**Fix**: The `getAppUrl()` utility handles this automatically. If issues persist, verify `NEXT_PUBLIC_APP_URL` is set.

## 📝 Notes

- **Never hardcode URLs** in the codebase
- Always use `getAppUrl(request)` for server-side URL resolution
- Use `window.location.origin` for client-side URL resolution
- `NEXT_PUBLIC_APP_URL` is required for production deployments
- The app will throw an error in production if `NEXT_PUBLIC_APP_URL` is not set (to prevent silent failures)

## 🔐 Security

- Never commit `.env` files
- Use platform environment variable secrets
- Rotate keys periodically
- Use different keys for development and production

---

**Need Help?** Check the console logs for URL-related errors, or verify all environment variables are correctly set in your deployment platform.

