import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
          <FileQuestion className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          Job Not Found
        </h1>
        
        <p className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
          This job posting doesn't exist or has been removed
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="btn-gradient">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

