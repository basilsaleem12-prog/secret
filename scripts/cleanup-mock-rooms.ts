/**
 * Cleanup Mock Room IDs
 * 
 * This script removes call requests with mock room IDs (UUIDs)
 * so users can create new requests with real 100ms rooms.
 * 
 * Run with: npx tsx scripts/cleanup-mock-rooms.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupMockRooms() {
  console.log('🔍 Looking for call requests with mock room IDs...\n')

  // Find all accepted call requests
  const callRequests = await prisma.callRequest.findMany({
    where: {
      status: 'ACCEPTED',
      roomId: {
        not: null
      }
    },
    include: {
      job: {
        select: {
          title: true
        }
      },
      requester: {
        select: {
          fullName: true
        }
      },
      receiver: {
        select: {
          fullName: true
        }
      }
    }
  })

  if (callRequests.length === 0) {
    console.log('✅ No call requests found. Nothing to clean up!')
    return
  }

  console.log(`Found ${callRequests.length} accepted call request(s):\n`)

  // Identify mock rooms (UUID format = 36 characters with dashes)
  const mockRooms = callRequests.filter(cr => {
    return cr.roomId && cr.roomId.length === 36 && cr.roomId.includes('-')
  })

  if (mockRooms.length === 0) {
    console.log('✅ No mock room IDs found. All rooms appear to be real 100ms rooms!')
    return
  }

  console.log(`⚠️  Found ${mockRooms.length} call request(s) with mock room IDs:\n`)

  mockRooms.forEach((cr, index) => {
    console.log(`${index + 1}. Job: "${cr.job.title}"`)
    console.log(`   Requester: ${cr.requester.fullName}`)
    console.log(`   Receiver: ${cr.receiver.fullName}`)
    console.log(`   Room ID: ${cr.roomId}`)
    console.log(`   Status: ${cr.status}`)
    console.log(`   Created: ${cr.createdAt.toLocaleString()}\n`)
  })

  console.log('🗑️  Deleting call requests with mock room IDs...\n')

  // Delete mock room call requests
  const deleteResult = await prisma.callRequest.deleteMany({
    where: {
      id: {
        in: mockRooms.map(cr => cr.id)
      }
    }
  })

  console.log(`✅ Deleted ${deleteResult.count} call request(s) with mock room IDs`)
  console.log('\n✨ You can now create new call requests with real 100ms rooms!')
  console.log('\nNext steps:')
  console.log('1. Make sure HMS_APP_ACCESS_KEY, HMS_APP_SECRET, HMS_TEMPLATE_ID are in .env.local')
  console.log('2. Restart your server: npm run dev')
  console.log('3. Create a new video call request')
  console.log('4. Accept it to create a real 100ms room')
  console.log('5. Join the call - it should work! 🎉')
}

cleanupMockRooms()
  .catch((error) => {
    console.error('❌ Error cleaning up mock rooms:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

