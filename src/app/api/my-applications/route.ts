import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/my-applications - Get all applications submitted by the current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // PENDING, SHORTLISTED, ACCEPTED, REJECTED

    // Build where clause
    const whereClause: any = { applicantId: profile.id }
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter
    }

    // Fetch applications with job details
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            location: true,
            compensation: true,
            isPublished: true,
            isFilled: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                department: true,
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get status counts
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where: { applicantId: profile.id },
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
      applications,
      counts
    })

  } catch (error) {
    console.error('Error fetching user applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

