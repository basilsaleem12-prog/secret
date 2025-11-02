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

export interface UploadAvatarResult {
  storagePath: string
  publicUrl: string
}

/**
 * Upload an avatar image to Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadAvatarResult> {
  // Create a unique file path: avatars/userId/avatar-timestamp.ext
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const storagePath = `avatars/${userId}/${fileName}`

  // Upload file to Supabase Storage
  const { data, error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite, create new file each time
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`)
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
 * Delete an avatar from Supabase Storage
 */
export async function deleteAvatar(storagePath: string): Promise<void> {
  const { error } = await supabaseStorageClient.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`)
  }
}

