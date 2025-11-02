import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/ai/match-scoring';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = await params;

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

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        tags: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Calculate match score using AI
    const matchResult = await calculateMatchScore({
      jobTitle: job.title,
      jobDescription: job.description,
      jobRequirements: job.requirements || '',
      jobTags: job.tags,
      applicantSkills: profile.skills,
      applicantInterests: profile.interests,
      applicantBio: profile.bio || '',
      applicantProposal: '', // No proposal yet since they haven't applied
      applicantDepartment: profile.department,
      applicantYear: profile.year,
    });

    return NextResponse.json(matchResult);
  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate match score' },
      { status: 500 }
    );
  }
}

