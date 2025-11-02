import { createClient } from '@supabase/supabase-js'

// Create a separate client for storage operations with service role
// This allows bypassing RLS policies for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use anonymous key if service role key is not available
const supabaseStorageClient = createClient(
  supabaseUrl,
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET_NAME = 'umt-surge-bucket'

export interface UploadResumeResult {
  storagePath: string
  publicUrl: string
}

/**
 * Upload a resume file to Supabase Storage
 */
export async function uploadResume(
  file: File,
  userId: string,
  resumeId: string
): Promise<UploadResumeResult> {
  // Create a unique file path: applicant-docs/userId/resumeId-originalFileName
  const fileExt = file.name.split('.').pop()
  const fileName = `${resumeId}-${Date.now()}.${fileExt}`
  const storagePath = `applicant-docs/${userId}/${fileName}`

  // Upload file to Supabase Storage
  const { data, error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)

  return {
    storagePath,
    publicUrl: urlData.publicUrl,
  }
}

/**
 * Delete a resume file from Supabase Storage
 */
export async function deleteResume(storagePath: string): Promise<void> {
  const { error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get a signed URL for private file access (if needed)
 */
export async function getResumeSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Initialize storage bucket (call this once during setup)
 */
export async function initializeResumeBucket(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseStorageClient.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      // Create bucket
      const { error } = await supabaseStorageClient.storage.createBucket(BUCKET_NAME, {
        public: true, // Set to true for public access, false for private
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      })

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`)
      }

      console.log(`✅ Created storage bucket: ${BUCKET_NAME}`)
    } else {
      console.log(`✅ Storage bucket already exists: ${BUCKET_NAME}`)
    }
  } catch (error) {
    console.error('Error initializing storage bucket:', error)
    throw error
  }
}

