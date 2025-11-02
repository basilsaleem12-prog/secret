import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { uploadResume } from '@/lib/storage/resumes'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/**
 * POST /api/resumes - Upload a resume
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const setAsDefault = formData.get('setAsDefault') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF or Word document.' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File size exceeds 5MB limit' 
      }, { status: 400 })
    }

    // Generate resume ID first
    const resumeId = crypto.randomUUID()

    // Upload to Supabase Storage
    let uploadResult
    try {
      uploadResult = await uploadResume(file, profile.id, resumeId)
    } catch (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ 
        error: 'Failed to upload file to storage. Please try again.' 
      }, { status: 500 })
    }

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await prisma.resume.updateMany({
        where: { userId: profile.id },
        data: { isDefault: false }
      })
    }

    // Create resume record with storage path
    const resume = await prisma.resume.create({
      data: {
        id: resumeId,
        userId: profile.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: uploadResult.storagePath,
        publicUrl: uploadResult.publicUrl,
        isDefault: setAsDefault,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        publicUrl: true,
        isDefault: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ 
      resume,
      message: 'Resume uploaded successfully to Supabase Storage',
      storageLocation: `Bucket: umt-surge-bucket/applicant-docs, Path: ${uploadResult.storagePath}`
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/resumes - Get user's resumes
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

    // Get all resumes for the user
    const resumes = await prisma.resume.findMany({
      where: { userId: profile.id },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        publicUrl: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ resumes })

  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

