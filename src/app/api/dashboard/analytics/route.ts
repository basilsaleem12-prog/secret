import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch seeker analytics
    const applicationsSent = await prisma.application.count({
      where: { applicantId: profile.id },
    });

    const savedJobs = await prisma.bookmark.count({
      where: { userId: profile.id },
    });

    // Fetch finder analytics
    const activeJobs = await prisma.job.count({
      where: {
        createdById: profile.id,
        status: 'POSTED',
      },
    });

    const draftJobs = await prisma.job.count({
      where: {
        createdById: profile.id,
        isPublished: false,
        status: 'PENDING',
      },
    });

    const pendingJobs = await prisma.job.count({
      where: {
        createdById: profile.id,
        status: 'PENDING',
      },
    });

    const applicationsReceived = await prisma.application.count({
      where: {
        job: {
          createdById: profile.id,
        },
      },
    });

    // Get total views for all jobs
    const jobsWithViews = await prisma.job.findMany({
      where: { createdById: profile.id },
      select: { views: true },
    });

    const totalViews = jobsWithViews.reduce((sum: number, job: { views: number }) => sum + job.views, 0);

    // Get recent jobs for finder mode with comprehensive analytics
    const recentJobs = await prisma.job.findMany({
      where: { createdById: profile.id },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        views: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate engagement rate for each job
    const jobsWithAnalytics = await Promise.all(
      recentJobs.map(async (job) => {
        const applicationRate = job.views > 0 
          ? ((job._count.applications / job.views) * 100).toFixed(1)
          : '0.0';
        
        const bookmarkRate = job.views > 0
          ? ((job._count.bookmarks / job.views) * 100).toFixed(1)
          : '0.0';

        return {
          ...job,
          applicationRate: parseFloat(applicationRate),
          bookmarkRate: parseFloat(bookmarkRate),
        };
      })
    );

    // Get total bookmarks across all jobs
    const totalBookmarks = await prisma.bookmark.count({
      where: {
        job: {
          createdById: profile.id,
        },
      },
    });

    // Get application statuses for seeker mode
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: { applicantId: profile.id },
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
    };

    applicationsByStatus.forEach((item: { status: string; _count: number }) => {
      if (item.status === 'PENDING') statusCounts.pending = item._count;
      if (item.status === 'REVIEWING') statusCounts.reviewing = item._count;
      if (item.status === 'ACCEPTED') statusCounts.accepted = item._count;
      if (item.status === 'REJECTED') statusCounts.rejected = item._count;
    });

    return NextResponse.json({
      seeker: {
        applicationsSent,
        savedJobs,
        profileViews: 0, // Placeholder - implement if needed
        applicationsByStatus: statusCounts,
      },
      finder: {
        activeJobs,
        draftJobs,
        pendingJobs,
        applicationsReceived,
        totalViews,
        totalBookmarks,
        averageApplicationRate: jobsWithAnalytics.length > 0
          ? (jobsWithAnalytics.reduce((sum, job) => sum + job.applicationRate, 0) / jobsWithAnalytics.length).toFixed(1)
          : '0.0',
        recentJobs: jobsWithAnalytics,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

