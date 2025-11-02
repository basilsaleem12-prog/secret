import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin/config';
import { notifyJobApproved, notifyJobRejected, notifyMatchingUsersAboutNewJob } from '@/lib/notifications/service';
import { sendJobApprovalEmail, sendJobRejectionEmail } from '@/lib/email/service';

interface ApproveJobBody {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

/**
 * POST /api/admin/jobs/[jobId]/approve - Approve or reject a job (Admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
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

    // Get admin profile for audit trail
    const adminProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true, fullName: true },
    });

    // Await params (Next.js 15+ requirement)
    const resolvedParams = await params;
    const body: ApproveJobBody = await request.json();
    const { action, rejectionReason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the job
    const job = await prisma.job.findUnique({
      where: { id: resolvedParams.jobId },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Validate rejection reason if rejecting
    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a job' },
        { status: 400 }
      );
    }

    // Update job based on action
    const updatedJob = await prisma.job.update({
      where: { id: resolvedParams.jobId },
      data:
        action === 'approve'
          ? {
              status: 'APPROVED',
              approvedAt: new Date(),
              approvedBy: adminProfile?.id || user.id,
              rejectionReason: null,
              // Automatically publish when approved
              isPublished: true,
              publishedAt: new Date(),
              isDraft: false,
            }
          : {
              status: 'REJECTED',
              rejectionReason: rejectionReason!.trim(),
              approvedBy: null,
              approvedAt: null,
              isPublished: false,
              publishedAt: null,
            },
    });

    // Create notification for job creator
    if (action === 'approve') {
      await notifyJobApproved(job.createdBy.id, job.id, job.title);
      
      // Send approval email (non-blocking)
      if (job.createdBy.email) {
        sendJobApprovalEmail(
          job.createdBy.email,
          job.createdBy.fullName || 'User',
          job.title,
          job.id,
          request
        ).catch(err => console.error('Failed to send approval email:', err))
      }
      
      // Notify matching users about the new approved job
      await notifyMatchingUsersAboutNewJob(
        job.id,
        job.title,
        job.tags,
        job.type,
        job.createdBy.id
      );
    } else {
      await notifyJobRejected(job.createdBy.id, job.id, job.title, rejectionReason);
      
      // Send rejection email (non-blocking)
      if (job.createdBy.email) {
        sendJobRejectionEmail(
          job.createdBy.email,
          job.createdBy.fullName || 'User',
          job.title,
          rejectionReason || ''
        ).catch(err => console.error('Failed to send rejection email:', err))
      }
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message:
        action === 'approve'
          ? 'Job approved successfully'
          : 'Job rejected successfully',
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}

