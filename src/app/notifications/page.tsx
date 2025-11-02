import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage(): Promise<JSX.Element> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Notifications
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Stay updated with all your notifications
          </p>
        </div>
        
        <NotificationsPageClient />
      </main>
    </div>
  );
}

