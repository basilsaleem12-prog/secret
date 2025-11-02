import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateInterviewTips } from '@/lib/ai/interview-tips';

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
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Generate interview tips
    const tips = await generateInterviewTips({
      jobTitle: job.title,
      jobDescription: job.description,
      requirements: job.requirements || '',
      applicantSkills: profile.skills,
      applicantExperience: `${profile.year || ''} ${profile.department || ''}`.trim(),
    });

    return NextResponse.json(tips);
  } catch (error) {
    console.error('Error generating interview tips:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview tips' },
      { status: 500 }
    );
  }
}

