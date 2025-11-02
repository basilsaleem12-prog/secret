import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendApplicationReceivedEmail } from '@/lib/email/service';

interface CreateApplicationBody {
  jobId: string;
  proposal?: string;
  resumeId?: string;
}

/**
 * POST /api/applications - Submit a job application
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

    const body: CreateApplicationBody = await request.json();
    const { jobId, proposal, resumeId } = body;

    // Validation
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    if (!proposal || !proposal.trim()) {
      return NextResponse.json(
        { error: 'Proposal/cover letter is required' },
        { status: 400 }
      );
    }

    // Verify resume if provided
    let resumeName = null
    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        select: { userId: true, fileName: true }
      })

      if (!resume || resume.userId !== profile.id) {
        return NextResponse.json(
          { error: 'Invalid resume' },
          { status: 400 }
        )
      }

      resumeName = resume.fileName
    }

    // Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        isFilled: true,
        createdById: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.isPublished) {
      return NextResponse.json(
        { error: 'This job is not published yet' },
        { status: 400 }
      );
    }

    if (job.isFilled) {
      return NextResponse.json(
        { error: 'This position has been filled' },
        { status: 400 }
      );
    }

    // Prevent self-application
    if (job.createdById === profile.id) {
      return NextResponse.json(
        { error: 'You cannot apply to your own job posting' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: profile.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: profile.id,
        proposal: proposal.trim(),
        resumeUrl: resumeId || null,
        resumeName: resumeName,
        status: 'PENDING',
      },
      include: {
        applicant: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    // Update job applications count
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicationsCount: { increment: 1 },
      },
    });

    // Create notification for job creator
    await prisma.notification.create({
      data: {
        userId: job.createdById,
        type: 'APPLICATION_RECEIVED',
        title: 'New Application Received',
        content: `${profile.fullName || 'A user'} applied for your job: ${job.title}`,
        link: `/jobs/${jobId}/applications`,
        metadata: JSON.stringify({
          jobId,
          applicantId: profile.id,
          applicantName: profile.fullName
        })
      },
    });

    // Send email to job poster (non-blocking)
    if (job.createdBy.email) {
      sendApplicationReceivedEmail(
        job.createdBy.email,
        job.createdBy.fullName || 'User',
        profile.fullName || 'A user',
        job.title,
        jobId,
        request
      ).catch(err => console.error('Failed to send application email:', err))
    }

    return NextResponse.json(
      {
        success: true,
        application,
        message: 'Application submitted successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications - Fetch user's applications or applications for user's jobs
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

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent' or 'received'

    if (type === 'received') {
      // Get applications for jobs created by the user
      const applications = await prisma.application.findMany({
        where: {
          job: {
            createdById: profile.id,
          },
        },
        include: {
          applicant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              department: true,
              year: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ applications });
    } else {
      // Get applications sent by the user (default)
      const applications = await prisma.application.findMany({
        where: {
          applicantId: profile.id,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              type: true,
              createdBy: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ applications });
    }

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

