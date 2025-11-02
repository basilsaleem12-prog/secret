# 100ms Video Conferencing Implementation Guide

This guide explains the complete flow for implementing 100ms video conferencing in any application, based on the implementation in this Eshafi app.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Complete Flow Diagram](#complete-flow-diagram)
6. [Environment Variables](#environment-variables)
7. [Step-by-Step Implementation](#step-by-step-implementation)

---

## Overview

This implementation uses **100ms Prebuilt UI** (iframe-based) which provides a ready-made video conferencing interface. The flow consists of:

1. **Backend**: Creates 100ms rooms and generates room codes
2. **Frontend**: Displays video calls using iframe with room codes
3. **Database**: Stores room codes with bookings/appointments

---

## Prerequisites

### 1. 100ms Account Setup
- Create account at [100ms.live](https://www.100ms.live/)
- Get your credentials:
  - `HMS_ACCESS_KEY`
  - `HMS_SECRET`
  - `HMS_TEMPLATE_ID` (create a template in 100ms dashboard)
  - `HMS_MANAGEMENT_TOKEN` (for API calls)
  - `HMS_SUBDOMAIN` (your app subdomain, e.g., `your-app-name-1234`)

### 2. 100ms Template Configuration
- In 100ms dashboard, create a template with roles (e.g., `guest`, `host`, `doctor`, `patient`)
- Note the template ID

---

## Backend Implementation

### Step 1: Install Backend Dependencies

```bash
npm install @100mslive/server-sdk axios
# or
pnpm add @100mslive/server-sdk axios
```

### Step 2: Create Video Service (`backend/src/services/videoService.js`)

```javascript
import pkg from '@100mslive/server-sdk';
const { SDK } = pkg;
import axios from 'axios';

// Environment variables
const accessKey = process.env.HMS_ACCESS_KEY;
const secret = process.env.HMS_SECRET;
const templateId = process.env.HMS_TEMPLATE_ID;
const managementToken = process.env.HMS_MANAGEMENT_TOKEN;

// Initialize SDK
const sdk = new SDK(accessKey, secret);

/**
 * Create a 100ms room
 * @param {string} bookingId - Unique identifier for the booking/appointment
 * @returns {Promise<string>} Room ID
 */
export async function create100msRoom(bookingId) {
  const room = await sdk.rooms.create({
    name: `booking_${bookingId}_${Date.now()}`,
    description: `Room for booking ${bookingId}`,
    template_id: templateId // Use template from env
  });
  return room.id;
}

/**
 * Create a room code for Prebuilt UI
 * Room codes allow users to join via iframe without tokens
 * @param {string} roomId - The room ID from create100msRoom
 * @returns {Promise<string|undefined>} Room code (guest code)
 */
export async function create100msRoomCode(roomId) {
  try {
    const response = await axios.post(
      `https://api.100ms.live/v2/room-codes/room/${roomId}`,
      {
        role: 'guest',
        enabled: true
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract guest code from response
    if (response.data && Array.isArray(response.data.data)) {
      const guestCode = response.data.data.find(c => c.role === 'guest')?.code;
      return guestCode;
    }
    return undefined;
  } catch (err) {
    console.error('Error from 100ms room code API:', err.response ? err.response.data : err);
    return undefined;
  }
}

/**
 * Generate auth token (if using SDK approach instead of Prebuilt)
 * @param {string} roomId - Room ID
 * @param {string} userName - User identifier
 * @param {string} role - User role (default: 'guest')
 * @returns {Promise<string>} Auth token
 */
export async function generate100msToken(roomId, userName, role = 'guest') {
  const { token } = await sdk.auth.getAuthToken({
    roomId,
    role,
    userId: userName
  });
  return token;
}
```

### Step 3: Integrate with Booking Service

```javascript
import { create100msRoom, create100msRoomCode } from './videoService.js';

export const createBooking = async (patientId, doctorId, dateTime, type = 'PHYSICAL') => {
  let videoRoomId = null; // Store room code here
  
  // Only create video room for virtual appointments
  if (type === 'VIRTUAL') {
    try {
      // Step 1: Create room
      const roomId = await create100msRoom(`${patientId}_${doctorId}_${Date.now()}`);
      
      // Step 2: Generate room code for Prebuilt UI
      videoRoomId = await create100msRoomCode(roomId);
      
      if (!videoRoomId) {
        throw new Error('Failed to create room code');
      }
    } catch (err) {
      console.error('Error during 100ms room creation:', err);
      throw err;
    }
  }
  
  // Step 3: Save booking with room code
  const booking = await prisma.booking.create({
    data: {
      patientId,
      doctorId,
      dateTime: new Date(dateTime),
      type,
      videoRoomId // Store the room code here
    }
  });
  
  return booking;
};
```

### Step 4: Create Video Controller

```javascript
// backend/src/controllers/videoController.js
import prisma from '../prisma.js';

/**
 * Get video info for a booking
 * Returns room code for Prebuilt UI
 */
export const getVideoInfo = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findUnique({ 
      where: { id: Number(bookingId) } 
    });
    
    if (!booking || !booking.videoRoomId) {
      return res.status(404).json({ error: 'No video room for this booking' });
    }
    
    res.json({
      roomCode: booking.videoRoomId, // Return room code
      dateTime: booking.dateTime,
      type: booking.type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get video info' });
  }
};
```

### Step 5: Add Routes

```javascript
// backend/src/routes/bookRoutes.js
import { getVideoInfo } from '../controllers/videoController.js';

bookingRouter.get('/video/info/:bookingId', getVideoInfo);
```

---

## Frontend Implementation

### Step 1: Install Frontend Dependencies

```bash
npm install @100mslive/roomkit-react
# Optional: For custom UI instead of Prebuilt
npm install @100mslive/hms-video-react @100mslive/react-sdk
```

### Step 2: Create Video Call Component (`components/VideoCall.tsx`)

```typescript
import React, { useState, useEffect } from 'react';

interface VideoCallProps {
  roomCode: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomCode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get subdomain from environment
  const subdomain = process.env.NEXT_PUBLIC_HMS_SUBDOMAIN || 'your-subdomain';

  // Validate room code
  useEffect(() => {
    if (!roomCode || typeof roomCode !== 'string' || roomCode.trim() === '') {
      setError('No room code provided.');
      setLoading(false);
    } else {
      setError(null);
      setLoading(true);
    }
  }, [roomCode]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#111',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
        }}
      >
        {loading && !error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2,
            }}
          >
            <div style={{ color: '#fff', fontSize: 20 }}>Loading video call...</div>
          </div>
        )}
        {error ? (
          <div
            style={{
              color: '#fff',
              textAlign: 'center',
              margin: '40px auto',
              fontSize: 20,
              width: '100%',
            }}
          >
            {error}
          </div>
        ) : (
          <iframe
            src={`https://${subdomain}.app.100ms.live/preview/${roomCode}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#222',
            }}
            allow="camera; microphone; fullscreen; display-capture"
            title="100ms Video Call"
            onLoad={handleIframeLoad}
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        )}
      </div>
    </div>
  );
};

export default VideoCall;
```

### Step 3: Create Video Call Page (`app/videocall/page.tsx`)

```typescript
"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const VideoCall = dynamic(() => import('@/components/VideoCall'), { ssr: false });

const VideoCallContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('roomCode');

  if (!roomCode) {
    return <div>No room code provided</div>;
  }

  return (
    <div className="w-full h-screen">
      <VideoCall roomCode={roomCode} />
    </div>
  );
};

const VideoCallPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoCallContent />
    </Suspense>
  );
};

export default VideoCallPage;
```

### Step 4: Join Video Call from Appointments List

```typescript
// In your appointments component
const handleJoinVideoCall = async (appointment: Appointment) => {
  try {
    // Fetch video info from backend
    const infoRes = await fetch(`${API_URL}/api/bookings/video/info/${appointment.id}`, {
      credentials: 'include'
    });
    
    if (!infoRes.ok) throw new Error('Failed to get video info');
    
    const info = await infoRes.json();
    
    // Open video call in new tab
    window.open(`/videocall?roomCode=${encodeURIComponent(info.roomCode)}`, '_blank');
  } catch (err) {
    console.error('Video call error:', err);
    // Show error toast
  }
};

// Usage in JSX
<button onClick={() => handleJoinVideoCall(appointment)}>
  Join Video Call
</button>
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INITIATES BOOKING                    │
│                  (type: 'VIRTUAL')                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND: createBooking()                         │
│  1. Check if type === 'VIRTUAL'                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        BACKEND: videoService.create100msRoom()               │
│  - Creates room in 100ms using SDK                           │
│  - Returns roomId                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      BACKEND: videoService.create100msRoomCode()             │
│  - Calls 100ms API to generate room code                     │
│  - Returns roomCode (e.g., "abc123xyz")                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE: Save booking                           │
│  - Store videoRoomId (roomCode) with booking                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         USER CLICKS "Join Video Call" BUTTON                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND: GET /api/bookings/video/info/:id            │
│  - Fetches booking with roomCode                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND: Opens Video Call Page                 │
│  window.open(`/videocall?roomCode=${roomCode}`)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           FRONTEND: VideoCall Component Renders              │
│  - Loads iframe: https://{subdomain}.app.100ms.live/         │
│    preview/${roomCode}                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              100MS PREBUILT UI LOADS                         │
│  - User joins video call automatically                       │
│  - Camera/mic permissions requested                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Backend (`.env`)

```env
# 100ms Configuration
HMS_ACCESS_KEY=your_access_key_here
HMS_SECRET=your_secret_here
HMS_TEMPLATE_ID=your_template_id_here
HMS_MANAGEMENT_TOKEN=your_management_token_here
```

### Frontend (`.env.local` or `.env`)

```env
NEXT_PUBLIC_HMS_SUBDOMAIN=your-app-name-1234
```

---

## Step-by-Step Implementation

### Phase 1: Backend Setup

1. **Install dependencies**
   ```bash
   npm install @100mslive/server-sdk axios
   ```

2. **Create video service** (`services/videoService.js`)
   - Copy the video service code from above
   - Add environment variables

3. **Update your booking/appointment creation logic**
   - Integrate `create100msRoom()` and `create100msRoomCode()`
   - Store `videoRoomId` (room code) in database

4. **Create video controller** (`controllers/videoController.js`)
   - Add `getVideoInfo()` endpoint

5. **Add routes** (`routes/bookRoutes.js` or similar)
   - `GET /video/info/:bookingId`

### Phase 2: Frontend Setup

1. **Install dependencies** (optional - only if not using Prebuilt)
   ```bash
   npm install @100mslive/roomkit-react
   ```

2. **Create VideoCall component**
   - Copy `components/VideoCall.tsx` code
   - Set `NEXT_PUBLIC_HMS_SUBDOMAIN`

3. **Create video call page**
   - Create route: `app/videocall/page.tsx` (or equivalent)
   - Uses `roomCode` from query params

4. **Add "Join Video Call" button**
   - In appointments/meetings list
   - Calls `GET /video/info/:bookingId`
   - Opens `/videocall?roomCode=...`

### Phase 3: Database

1. **Add column to bookings/appointments table**
   ```sql
   ALTER TABLE "Booking" ADD COLUMN "videoRoomId" TEXT;
   ```
   Or using Prisma:
   ```prisma
   model Booking {
     // ... other fields
     videoRoomId String? // 100ms room code
   }
   ```

---

## Important Notes

1. **Room Codes vs Tokens**
   - This implementation uses **room codes** (Prebuilt UI)
   - Room codes allow joining via iframe URL
   - No token generation needed on frontend
   - Simpler implementation

2. **Alternative: SDK Approach**
   - If you want custom UI, use `@100mslive/hms-video-react`
   - Generate tokens using `generate100msToken()`
   - Initialize HMS SDK in React component

3. **Error Handling**
   - Always handle cases where room creation fails
   - Check if `videoRoomId` exists before allowing join
   - Show user-friendly error messages

4. **Security**
   - Don't expose `HMS_SECRET` to frontend
   - Use backend API to fetch room codes
   - Validate user permissions before returning video info

5. **Subdomain**
   - Your 100ms subdomain is unique to your account
   - Find it in 100ms dashboard or use the format: `your-app-name-1234`

---

## Testing Checklist

- [ ] Backend creates room successfully
- [ ] Room code is generated and stored
- [ ] Video info endpoint returns correct room code
- [ ] Frontend loads iframe with correct URL
- [ ] Video call page opens in new tab
- [ ] Camera/microphone permissions work
- [ ] Multiple users can join same room
- [ ] Error handling works (no room code, failed creation, etc.)

---

## Troubleshooting

### Room code is undefined
- Check `HMS_MANAGEMENT_TOKEN` is valid
- Verify template has 'guest' role
- Check API response structure

### Iframe not loading
- Verify `NEXT_PUBLIC_HMS_SUBDOMAIN` is correct
- Check room code format (should be string)
- Ensure iframe URL is correct: `https://{subdomain}.app.100ms.live/preview/{roomCode}`

### Room creation fails
- Verify `HMS_ACCESS_KEY` and `HMS_SECRET`
- Check `HMS_TEMPLATE_ID` exists and is valid
- Ensure network connectivity to 100ms API

---

## Additional Resources

- [100ms Documentation](https://www.100ms.live/docs)
- [100ms Prebuilt UI](https://www.100ms.live/docs/prebuilt/v2/overview)
- [100ms Server SDK](https://www.100ms.live/docs/server-side/v2/introduction/basics)

---

## Summary

The key steps are:
1. Backend creates room → gets room code
2. Backend stores room code with booking
3. Frontend fetches room code via API
4. Frontend opens iframe with room code
5. 100ms Prebuilt UI handles the rest!

This approach is simple, reliable, and requires minimal frontend code.

