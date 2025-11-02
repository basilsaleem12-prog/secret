// Supabase Storage Configuration

export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
} as const

interface FileLimitsConfig {
  readonly maxSize: number
  readonly allowedTypes: string[]
  readonly allowedExtensions: string[]
}

type FileCategory = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AVATAR'

export const FILE_LIMITS: Record<FileCategory, FileLimitsConfig> = {
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  },
  VIDEO: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    allowedExtensions: ['.mp4', '.webm', '.ogg', '.mov'],
  },
  DOCUMENT: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  },
  AVATAR: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
}

export const STORAGE_PATHS = {
  user: (userId: string) => `users/${userId}`,
  file: (userId: string, fileName: string) => `users/${userId}/files/${fileName}`,
  avatar: (userId: string, fileName: string) => `users/${userId}/avatar/${fileName}`,
  thumbnail: (userId: string, fileName: string) => `users/${userId}/thumbnails/${fileName}`,
} as const



