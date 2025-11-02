import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS, STORAGE_PATHS } from './config'
import { validateFile, generateUniqueFileName, FileCategory } from './validation'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
  fileName?: string
}

export async function uploadFile(
  file: File,
  userId: string,
  category: FileCategory,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file, category)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const supabase = createClient()

  // Generate unique file name
  const uniqueFileName = generateUniqueFileName(file.name)
  
  // Determine bucket based on category
  const bucket = getBucketForCategory(category)
  
  // Create storage path
  const storagePath = STORAGE_PATHS.file(userId, uniqueFileName)

  try {
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
      fileName: uniqueFileName,
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function getFileUrl(bucket: string, path: string): Promise<string | null> {
  const supabase = createClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data?.publicUrl || null
}

function getBucketForCategory(category: FileCategory): string {
  switch (category) {
    case 'IMAGE':
      return STORAGE_BUCKETS.IMAGES
    case 'VIDEO':
      return STORAGE_BUCKETS.VIDEOS
    case 'DOCUMENT':
      return STORAGE_BUCKETS.DOCUMENTS
    case 'AVATAR':
      return STORAGE_BUCKETS.AVATARS
    default:
      return STORAGE_BUCKETS.DOCUMENTS
  }
}





