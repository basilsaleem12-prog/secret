import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { JobType } from '@prisma/client';
import { cookies } from 'next/headers';

interface CreateJobBody {
  title: string;
  type: JobType;
  description: string;
  requirements?: string;
  duration?: string;
  compensation?: string;
  location?: string;
  teamSize?: string;
  tags?: string[];
  isDraft?: boolean;
}

/**
 * POST /api/jobs - Create a new job (sets status to PENDING for admin approval)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // Check active role from cookie (multi-role system)
    const cookieStore = await cookies();
    const activeRole = cookieStore.get('campusconnect_active_role')?.value as 'SEEKER' | 'FINDER' | undefined;
    
    // Use active role if set, otherwise fall back to profile role
    const currentRole = activeRole || profile.role;

    // Only users in FINDER mode can create jobs
    if (currentRole !== 'FINDER') {
      return NextResponse.json(
        { error: 'Switch to Finder mode to create jobs' },
        { status: 403 }
      );
    }

    const body: CreateJobBody = await request.json();
    const {
      title,
      type,
      description,
      requirements,
      duration,
      compensation,
      location,
      teamSize,
      tags,
      isDraft = false,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Job type is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Create job with PENDING status (after migration, status will be available)
    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        type,
        description: description.trim(),
        requirements: requirements?.trim() || null,
        duration: duration?.trim() || null,
        compensation: compensation?.trim() || null,
        location: location?.trim() || null,
        teamSize: teamSize?.trim() || null,
        tags: tags || [],
        isDraft,
        // status: isDraft ? 'PENDING' : 'PENDING', // Uncomment after migration
        isPublished: false, // Not published until approved
        createdById: profile.id,
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification for admins (after migration)
    // Note: Uncomment after running prisma migrate
    // const admins = await prisma.profile.findMany({
    //   where: { isAdmin: true },
    //   select: { id: true },
    // });

    // if (admins.length > 0) {
    //   for (const admin of admins) {
    //     await prisma.notification.create({
    //       data: {
    //         userId: admin.id,
    //         type: 'NEW_JOB_PENDING',
    //         content: `New job "${title}" is pending your approval`,
    //       },
    //     });
    //   }
    // }

    return NextResponse.json(
      {
        success: true,
        job,
        message: isDraft
          ? 'Job saved as draft'
          : 'Job created and sent for admin approval',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs - Fetch all approved jobs (public)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: any = {
      // status: 'POSTED', // Uncomment after migration - Only show approved and posted jobs
      isPublished: true,
      isFilled: false,
    };

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
