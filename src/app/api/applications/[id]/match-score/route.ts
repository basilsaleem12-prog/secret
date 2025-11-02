import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore } from '@/lib/ai/match-scoring';

/**
 * POST /api/applications/[id]/match-score - Calculate or recalculate match score
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get application with full details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            tags: true,
            createdById: true,
          },
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            bio: true,
            skills: true,
            interests: true,
            department: true,
            year: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user is either the job owner or the applicant
    const isJobOwner = application.job.createdById === profile.id;
    const isApplicant = application.applicant.id === profile.id;

    if (!isJobOwner && !isApplicant) {
      return NextResponse.json(
        { error: 'You do not have permission to calculate this match score' },
        { status: 403 }
      );
    }

    // Calculate match score using AI
    const matchResult = await calculateMatchScore({
      jobTitle: application.job.title,
      jobDescription: application.job.description,
      jobRequirements: application.job.requirements,
      jobTags: application.job.tags,
      applicantSkills: application.applicant.skills,
      applicantInterests: application.applicant.interests,
      applicantBio: application.applicant.bio,
      applicantProposal: application.proposal,
      applicantDepartment: application.applicant.department,
      applicantYear: application.applicant.year,
    });

    // Update application with match score
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        matchScore: matchResult.score,
      },
    });

    return NextResponse.json({
      success: true,
      matchScore: matchResult.score,
      analysis: {
        reasoning: matchResult.reasoning,
        strengths: matchResult.strengths,
        gaps: matchResult.gaps,
        recommendation: matchResult.recommendation,
      },
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate match score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/[id]/match-score - Get existing match score analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get application with match score
    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        matchScore: true,
        job: {
          select: {
            createdById: true,
          },
        },
        applicant: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check permissions
    const isJobOwner = application.job.createdById === profile.id;
    const isApplicant = application.applicant.id === profile.id;

    if (!isJobOwner && !isApplicant) {
      return NextResponse.json(
        { error: 'You do not have permission to view this match score' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      matchScore: application.matchScore,
      hasScore: application.matchScore !== null,
    });
  } catch (error) {
    console.error('Error fetching match score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match score' },
      { status: 500 }
    );
  }
}

