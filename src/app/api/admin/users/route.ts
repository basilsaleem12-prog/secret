import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin/config';

interface UserStats {
  totalJobs: number;
  totalApplications: number;
  totalMessages: number;
}

interface UserWithStats {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  department: string | null;
  year: string | null;
  createdAt: Date;
  stats: UserStats;
}

/**
 * GET /api/admin/users - Fetch all users (Admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin using hardcoded email list
    if (!isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users with their stats
    const users = await prisma.profile.findMany({
      include: {
        _count: {
          select: {
            jobs: true,
            applications: true,
            messagesSent: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithStats: UserWithStats[] = users.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      department: profile.department,
      year: profile.year,
      createdAt: profile.createdAt,
      stats: {
        totalJobs: profile._count.jobs,
        totalApplications: profile._count.applications,
        totalMessages: profile._count.messagesSent,
      },
    }));

    return NextResponse.json({ 
      users: usersWithStats,
      total: usersWithStats.length,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

