/**
 * Hardcoded Admin Configuration
 * 
 * Add admin emails here to grant admin access
 * These users will have full access to admin dashboard and job approval
 * 
 * HOW TO ADD YOURSELF AS ADMIN:
 * 1. Add your email to the array below
 * 2. Restart the dev server
 * 3. Look for the "Admin" link (with shield icon) in the navbar
 * 4. Click to access the admin dashboard
 */

export const ADMIN_EMAILS = [
  'admin@campusconnect.com',
  // Add more admin emails here as needed
  // Example: 'yourname@example.com',
];

/**
 * Check if a user email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Admin credentials for initial setup
 * Create a user with this email in Supabase Auth to become admin
 */
export const ADMIN_CREDENTIALS = {
  email: 'admin@campusconnect.com',
  password: 'Admin@123456', // Change this in production!
  displayName: 'System Administrator',
};

