'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image as ImageIcon, Video, FileText, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileCategory } from '@/lib/storage/validation'

interface FilesClientProps {
  userId: string
}

export function FilesClient({ userId }: FilesClientProps) {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; fileName: string; category: FileCategory }>
  >([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleUploadComplete = (url: string, fileName: string, category: FileCategory) => {
    setUploadedFiles(prev => [...prev, { url, fileName, category }])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            File uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a category and upload your files
          </p>
        </div>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <FileUpload
              category="IMAGE"
              onUploadComplete={(url, fileName) => handleUploadComplete(url, fileName, 'IMAGE')}
              maxFiles={10}
            />
          </TabsContent>

          <TabsContent value="videos">
            <FileUpload
              category="VIDEO"
              onUploadComplete={(url, fileName) => handleUploadComplete(url, fileName, 'VIDEO')}
              maxFiles={5}
            />
          </TabsContent>

          <TabsContent value="documents">
            <FileUpload
              category="DOCUMENT"
              onUploadComplete={(url, fileName) => handleUploadComplete(url, fileName, 'DOCUMENT')}
              maxFiles={10}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recently Uploaded</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-4">
                {file.category === 'IMAGE' ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                ) : file.category === 'VIDEO' ? (
                  <video
                    src={file.url}
                    controls
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <p className="text-sm font-medium truncate">{file.fileName}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1E3A8A] hover:underline mt-1 block"
                >
                  View File
                </a>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">📝 Getting Started with File Upload</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Create storage buckets in Supabase Dashboard: images, videos, documents, avatars</li>
          <li>Set bucket policies to allow authenticated users to upload</li>
          <li>Files are automatically validated based on type and size</li>
          <li>Drag and drop or click to browse files</li>
          <li>Multiple files can be uploaded at once</li>
        </ul>
      </Card>
    </div>
  )
}





