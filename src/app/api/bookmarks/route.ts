import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookmarks - Get all bookmarked jobs for current user
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

    // Get all bookmarks with job details
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: profile.id },
      include: {
        job: {
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                department: true,
                year: true,
              }
            },
            _count: {
              select: {
                applications: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bookmarks })

  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookmarks - Bookmark a job
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId: profile.id,
          jobId
        }
      }
    })

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Job already bookmarked' },
        { status: 400 }
      )
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: profile.id,
        jobId
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        }
      }
    })

    return NextResponse.json({
      bookmark,
      message: 'Job bookmarked successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to bookmark job' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookmarks?jobId=xxx - Remove a bookmark
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Delete bookmark
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId: profile.id,
          jobId
        }
      }
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    await prisma.bookmark.delete({
      where: {
        userId_jobId: {
          userId: profile.id,
          jobId
        }
      }
    })

    return NextResponse.json({
      message: 'Bookmark removed successfully'
    })

  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}

