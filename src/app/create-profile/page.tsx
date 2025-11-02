import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateProfileForm } from './CreateProfileForm';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin/config';

export default async function CreateProfilePage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Admins don't need a profile - redirect to admin dashboard
  if (isAdminEmail(user.email)) {
    redirect('/admin');
  }

  // Check if profile already exists
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id }
  });

  if (existingProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to CampusConnect
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Let's create your profile and connect you with opportunities
          </p>
        </div>

        {/* Form Card with Glassmorphic Design */}
        <div className="glass-card p-8 md:p-10">
          <CreateProfileForm user={user} />
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
          Your information is secure and will only be visible to relevant connections
        </p>
      </div>
    </div>
  );
}

