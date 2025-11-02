import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin/config';
import { JobType, JobStatus } from '@prisma/client';

type JobStatusFilter = 'ALL' | JobStatus;
type JobTypeFilter = 'ALL' | JobType;

/**
 * GET /api/admin/jobs - Fetch all jobs with filters (Admin only)
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

    // Get filters from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = (searchParams.get('status') || 'ALL') as JobStatusFilter;
    const typeFilter = (searchParams.get('type') || 'ALL') as JobTypeFilter;

    // Build where clause based on filters
    const whereClause: any = {};
    
    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }
    
    if (typeFilter !== 'ALL') {
      whereClause.type = typeFilter;
    }

    // Fetch jobs with creator info
    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
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

    // Get total count
    const totalCount = await prisma.job.count();

    // Get counts for each status
    const statusCounts = await prisma.job.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get counts for each type
    const typeCounts = await prisma.job.groupBy({
      by: ['type'],
      _count: true,
    });

    const counts = {
      status: {
        ALL: totalCount,
        PENDING: statusCounts.find((s) => s.status === 'PENDING')?._count || 0,
        APPROVED: statusCounts.find((s) => s.status === 'APPROVED')?._count || 0,
        REJECTED: statusCounts.find((s) => s.status === 'REJECTED')?._count || 0,
      },
      type: {
        ALL: totalCount,
        ACADEMIC_PROJECT: typeCounts.find((t) => t.type === 'ACADEMIC_PROJECT')?._count || 0,
        STARTUP_COLLABORATION: typeCounts.find((t) => t.type === 'STARTUP_COLLABORATION')?._count || 0,
        PART_TIME_JOB: typeCounts.find((t) => t.type === 'PART_TIME_JOB')?._count || 0,
        COMPETITION_HACKATHON: typeCounts.find((t) => t.type === 'COMPETITION_HACKATHON')?._count || 0,
      },
    };

    return NextResponse.json({ 
      jobs,
      counts,
      currentFilter: {
        status: statusFilter,
        type: typeFilter,
      },
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

