import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getJobRecommendations } from '@/lib/ai/job-recommendations';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        fullName: true,
        bio: true,
        skills: true,
        interests: true,
        department: true,
        year: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all published, unfilled jobs (excluding user's own jobs)
    const jobs = await prisma.job.findMany({
      where: {
        isPublished: true,
        isFilled: false,
        createdById: {
          not: profile.id,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        tags: true,
        type: true,
        location: true,
      },
      take: 50, // Limit to 50 jobs for performance
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        recommendations: [],
        careerInsights: 'No jobs available at the moment. Check back soon!',
        topSkillsToLearn: [],
      });
    }

    // Get AI recommendations
    const recommendations = await getJobRecommendations(
      {
        fullName: profile.fullName,
        bio: profile.bio,
        skills: profile.skills,
        interests: profile.interests,
        department: profile.department,
        year: profile.year,
      },
      jobs
    );

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

