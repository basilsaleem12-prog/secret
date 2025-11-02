import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { VideoCallsClient } from './VideoCallsClient'

export default async function VideoCallsPage() {
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

  // Fetch all call requests (sent and received)
  const callRequests = await prisma.callRequest.findMany({
    where: {
      OR: [
        { requesterId: profile.id },
        { receiverId: profile.id }
      ]
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          createdBy: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true
            }
          }
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
      },
      application: {
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Separate sent and received requests
  const sentRequests = callRequests.filter(req => req.requesterId === profile.id)
  const receivedRequests = callRequests.filter(req => req.receiverId === profile.id)

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <VideoCallsClient
          sentRequests={sentRequests}
          receivedRequests={receivedRequests}
          currentUserId={profile.id}
        />
      </main>
    </div>
  )
}

