import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendVideoCallRequestEmail } from '@/lib/email/service'

/**
 * POST /api/call-requests - Create a new video call request
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { jobId, receiverId, applicationId, message, requestedTime } = body

    // Validate required fields
    if (!jobId || !receiverId) {
      return NextResponse.json(
        { error: 'Job ID and receiver ID are required' },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify receiver is the job creator
    if (job.createdById !== receiverId) {
      return NextResponse.json(
        { error: 'Receiver must be the job creator' },
        { status: 400 }
      )
    }

    // Check if user has already requested a call for this job
    const existingRequest = await prisma.callRequest.findFirst({
      where: {
        jobId,
        requesterId: profile.id,
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending or accepted call request for this job' },
        { status: 400 }
      )
    }

    // Create call request
    const callRequest = await prisma.callRequest.create({
      data: {
        jobId,
        requesterId: profile.id,
        receiverId,
        applicationId: applicationId || null,
        message: message || null,
        requestedTime: requestedTime ? new Date(requestedTime) : null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            department: true,
            year: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CALL_REQUEST_RECEIVED',
        title: 'New Video Call Request',
        content: `${profile.fullName || 'A user'} requested a video call for your job: ${job.title}`,
        link: '/video-calls',
        metadata: JSON.stringify({
          jobId,
          requesterId: profile.id,
          requesterName: profile.fullName
        })
      }
    })

    // Send video call request email (non-blocking)
    if (job.createdBy.email) {
      sendVideoCallRequestEmail(
        job.createdBy.email,
        job.createdBy.fullName || 'User',
        profile.fullName || 'A user',
        job.title,
        message || '',
        request
      ).catch(err => console.error('Failed to send video call request email:', err))
    }

    return NextResponse.json({
      callRequest,
      message: 'Call request sent successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating call request:', error)
    return NextResponse.json(
      { error: 'Failed to create call request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/call-requests - Get all call requests for current user
 * Query params: ?role=sent|received&status=PENDING|ACCEPTED|REJECTED
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'all' // 'sent', 'received', or 'all'
    const status = searchParams.get('status') // Optional status filter

    let whereClause: any = {}

    // Filter by role
    if (role === 'sent') {
      whereClause.requesterId = profile.id
    } else if (role === 'received') {
      whereClause.receiverId = profile.id
    } else {
      // Get both sent and received
      whereClause.OR = [
        { requesterId: profile.id },
        { receiverId: profile.id }
      ]
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status
    }

    const callRequests = await prisma.callRequest.findMany({
      where: whereClause,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            createdBy: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            department: true,
            year: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            department: true,
            year: true
          }
        },
        application: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Separate into sent and received
    const sentRequests = callRequests.filter(req => req.requesterId === profile.id)
    const receivedRequests = callRequests.filter(req => req.receiverId === profile.id)

    return NextResponse.json({
      callRequests,
      sent: sentRequests,
      received: receivedRequests,
      total: callRequests.length
    })

  } catch (error) {
    console.error('Error fetching call requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call requests' },
      { status: 500 }
    )
  }
}

