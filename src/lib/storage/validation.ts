import { FILE_LIMITS } from './config'

export type FileCategory = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AVATAR'

export interface FileValidationResult {
  valid: boolean
  error?: string
  category?: FileCategory
}

export function validateFile(file: File, category?: FileCategory): FileValidationResult {
  // Determine category if not provided
  const detectedCategory = category || detectFileCategory(file.type)
  
  if (!detectedCategory) {
    return {
      valid: false,
      error: 'Unsupported file type',
    }
  }

  const limits = FILE_LIMITS[detectedCategory]

  // Check file size
  if (file.size > limits.maxSize) {
    const maxSizeMB = (limits.maxSize / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  // Check file type
  if (!limits.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${limits.allowedExtensions.join(', ')}`,
    }
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (fileExtension && !limits.allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File extension ${fileExtension} is not allowed`,
    }
  }

  return {
    valid: true,
    category: detectedCategory,
  }
}

export function detectFileCategory(mimeType: string): FileCategory | null {
  if (mimeType.startsWith('image/')) {
    return 'IMAGE'
  }
  if (mimeType.startsWith('video/')) {
    return 'VIDEO'
  }
  if (
    mimeType.startsWith('application/') ||
    mimeType === 'text/plain'
  ) {
    return 'DOCUMENT'
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(`.${extension}`, '')
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_')
  
  return `${sanitizedName}_${timestamp}_${random}.${extension}`
}





