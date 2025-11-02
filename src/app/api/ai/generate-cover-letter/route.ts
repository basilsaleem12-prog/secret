import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        fullName: true,
        bio: true,
        skills: true,
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
        title: true,
        description: true,
        requirements: true,
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Generate cover letter
    const coverLetter = await generateCoverLetter({
      jobTitle: job.title,
      companyName: job.createdBy.fullName || 'the Company',
      jobDescription: job.description,
      requirements: job.requirements || '',
      applicantName: profile.fullName || 'Applicant',
      applicantBio: profile.bio || '',
      applicantSkills: profile.skills,
      applicantExperience: `${profile.year || ''} ${profile.department || ''}`.trim(),
    });

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}

