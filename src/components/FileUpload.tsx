'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { validateFile, formatFileSize, FileCategory } from '@/lib/storage/validation'
import { uploadFile } from '@/lib/storage/upload'
import { useAuth } from '@/contexts/AuthContext'

interface FileWithPreview extends File {
  preview?: string
  id: string
}

interface FileUploadProps {
  category: FileCategory
  onUploadComplete?: (url: string, fileName: string) => void
  maxFiles?: number
  className?: string
}

export function FileUpload({ 
  category, 
  onUploadComplete,
  maxFiles = 10,
  className 
}: FileUploadProps) {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [files])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: FileWithPreview[] = []
    
    for (const file of newFiles) {
      const validation = validateFile(file, category)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        continue
      }

      const fileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substring(7),
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file) 
          : undefined
      })

      validFiles.push(fileWithPreview)
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const uploadFiles = async () => {
    if (!user) {
      setError('You must be logged in to upload files')
      return
    }

    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      for (const file of files) {
        const result = await uploadFile(
          file,
          user.id,
          category,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: progress.percentage
            }))
          }
        )

        if (!result.success) {
          setError(result.error || 'Upload failed')
          continue
        }

        if (result.url && result.fileName) {
          onUploadComplete?.(result.url, result.fileName)
        }

        // Remove successfully uploaded file
        removeFile(file.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'relative border-2 border-dashed transition-colors',
          dragActive ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-300',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop {category.toLowerCase()} files here or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[#1E3A8A] hover:underline font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supports {getCategoryDescription(category)}
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={getAcceptString(category)}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Selected Files ({files.length}/{maxFiles})
            </h3>
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              size="sm"
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload All
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Preview/Icon */}
                  <div className="shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress[file.id] !== undefined && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#1E3A8A] h-1.5 rounded-full transition-all"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getCategoryDescription(category: FileCategory): string {
  switch (category) {
    case 'IMAGE':
      return 'JPG, PNG, GIF, WebP up to 10MB'
    case 'VIDEO':
      return 'MP4, WebM, OGG up to 100MB'
    case 'DOCUMENT':
      return 'PDF, DOC, DOCX, XLS, XLSX up to 50MB'
    case 'AVATAR':
      return 'JPG, PNG, WebP up to 5MB'
    default:
      return 'Various file types'
  }
}

function getAcceptString(category: FileCategory): string {
  switch (category) {
    case 'IMAGE':
    case 'AVATAR':
      return 'image/*'
    case 'VIDEO':
      return 'video/*'
    case 'DOCUMENT':
      return '.pdf,.doc,.docx,.xls,.xlsx,.txt'
    default:
      return '*/*'
  }
}

