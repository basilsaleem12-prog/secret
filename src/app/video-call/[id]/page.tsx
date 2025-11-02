import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { VideoCallRoom } from './VideoCallRoom'

export default async function VideoCallPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  if (!profile) {
    redirect('/create-profile')
  }

  const { id: callRequestId } = await params

  // Get call request with full details
  const callRequest = await prisma.callRequest.findUnique({
    where: { id: callRequestId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          description: true
        }
      },
      requester: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          department: true,
          year: true
        }
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          department: true,
          year: true
        }
      }
    }
  })

  if (!callRequest) {
    redirect('/video-calls')
  }

  // Verify user is authorized
  const isRequester = callRequest.requesterId === profile.id
  const isReceiver = callRequest.receiverId === profile.id

  if (!isRequester && !isReceiver) {
    redirect('/video-calls')
  }

  // Check if call is accepted
  if (callRequest.status !== 'ACCEPTED') {
    redirect('/video-calls')
  }

  return (
    <VideoCallRoom
      callRequestId={callRequestId}
      userRole={isReceiver ? 'host' : 'guest'}
      userName={profile.fullName || profile.email || 'Anonymous'}
      userId={profile.id}
      jobTitle={callRequest.job.title}
      otherUser={isReceiver ? callRequest.requester : callRequest.receiver}
    />
  )
}

