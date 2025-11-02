import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/jobs/[id]/applications - Get all applications for a job (Owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user owns this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { 
        id: true, 
        createdById: true,
        title: true,
        type: true
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.createdById !== profile.id) {
      return NextResponse.json({ 
        error: 'Only the job owner can view applications' 
      }, { status: 403 })
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // PENDING, SHORTLISTED, ACCEPTED, REJECTED

    // Build where clause
    const whereClause: any = { jobId }
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter
    }

    // Fetch applications with applicant details
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            department: true,
            year: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Show pending first
        { createdAt: 'desc' }
      ]
    })

    // Get status counts
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where: { jobId },
      _count: true
    })

    const counts = {
      ALL: applications.length,
      PENDING: statusCounts.find(s => s.status === 'PENDING')?._count || 0,
      SHORTLISTED: statusCounts.find(s => s.status === 'SHORTLISTED')?._count || 0,
      ACCEPTED: statusCounts.find(s => s.status === 'ACCEPTED')?._count || 0,
      REJECTED: statusCounts.find(s => s.status === 'REJECTED')?._count || 0,
    }

    return NextResponse.json({
      job,
      applications,
      counts
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

