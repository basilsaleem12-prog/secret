# 🌐 CampusConnect – The University Talent Finder App

**CampusConnect** is a modern web platform that bridges the gap between students within a university — enabling them to **discover talent**, **post opportunities**, and **collaborate** on projects, startups, hackathons, and part-time work.

Built for **Surge ’25 Web Hackathon**, CampusConnect aims to deliver a **premium, scalable, and AI-powered platform** with a beautiful **Glassmorphic UI** and robust **Supabase + Prisma backend**.

🌐 **Live Application**: [http://159.223.38.110:3000](http://159.223.38.110:3000)

---

## 🚀 Overview

CampusConnect empowers students to:
- **Post** academic, startup, or freelance opportunities.
- **Browse and apply** for campus-based gigs.
- **Collaborate and chat** in real-time.
- **Track applications** and analytics for their posts.
- **Get personalized recommendations** powered by smart matching algorithms.

Every user can act as both:
- 🧑‍💼 **Talent Finder** – Post jobs or opportunities.
- 🧑‍🎓 **Talent Seeker** – Discover and apply to them.

---

## 🧱 Core Features

| Category | Description |
|-----------|--------------|
| 🔐 **Authentication** | Supabase Auth with Google, GitHub, and Email login. Profiles managed via Prisma. |
| 👥 **Role-based Dashboard** | Seamless switch between “Finder” and “Seeker” modes without logout. |
| 💼 **Job Management** | Create, edit, delete, and mark posts as filled or draft. |
| 🧾 **Applications** | Upload resumes, send proposals, and track status (Pending, Shortlisted, Accepted, Rejected). |
| 💬 **Chat System** | Real-time messaging between finders and seekers using Supabase Realtime. |
| 🔍 **Smart Recommendations** | Suggests jobs that best match a user’s skills and interests. |
| 📈 **Analytics Dashboard** | View total views, applications, and engagement metrics for each job. |
| 🧠 **Match Score AI** | Calculates how well a user’s skills align with a job’s tags (e.g., “You match 82% of this opportunity”). |
| ⭐ **Bookmarks & Notifications** | Save opportunities for later and get updates for new messages or status changes. |

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + TailwindCSS + Shadcn/UI + Framer Motion |
| **Backend** | Prisma ORM + Supabase PostgreSQL |
| **Auth** | Supabase Auth (OAuth + Email) |
| **Realtime** | Supabase Realtime for chat and notifications |
| **Hosting** | Vercel (Frontend + API) |
| **AI Logic** | Match score algorithm (skills-to-tags similarity model) |

---

## 🎨 Design System — *Premium Glassmorphism*

CampusConnect uses a **modern glassmorphic aesthetic** inspired by Apple’s macOS design language, combined with bold gradients and subtle depth.

### ✨ Visual Language
- Transparent layers with **blurred backgrounds**.
- **Soft gradients**: Yellow → Blue tones for positivity and energy.
- **Rounded edges** and **subtle shadows** for visual depth.
- **Minimal typography** (Inter + Poppins) for clean readability.
- Dynamic **Framer Motion animations** for fluid transitions.

### 🧭 Core UI Principles
| Principle | Description |
|------------|-------------|
| 🧊 **Glass Layers** | Every card, modal, and sidebar is semi-transparent with backdrop blur. |
| 🌈 **Gradient Accents** | Buttons and highlights use smooth linear gradients. |
| 💫 **Depth & Motion** | Hover lift, fade transitions, and parallax scrolling used for interactivity. |
| ⚙️ **Consistency** | Centralized design configuration via `/design/design.json` and Tailwind theme extension. |

### 🎨 Color & Style Reference
| Element | Light Mode | Dark Mode |
|----------|-------------|-----------|
| Background | rgba(255,255,255,0.75) | rgba(17,25,40,0.85) |
| Card | rgba(255,255,255,0.25) | rgba(255,255,255,0.05) |
| Accent | #3B82F6 | #38BDF8 |
| Gradient | Yellow → Blue | Amber → Cyan |

> 💡 See [`design/design.json`](./design/design.json) for the full theme configuration file defining global blur, shadows, and typography.

---

## 🧬 Database Schema (Prisma + Supabase)

CampusConnect’s data model is optimized for scalability and hackathon-level innovation.

### 🗂️ Key Models
- **Profile** – extends Supabase Auth with skills, interests, and role.
- **Job** – stores all postings with analytics.
- **Application** – manages job applications with status and match score.
- **Message** – real-time chat system between users.
- **Bookmark** – saved jobs per user.
- **Notification** – in-app alerts and push events.
- **JobAnalytics** – per-view engagement tracking.

### 🧩 Enums
- `Role`: FINDER | SEEKER  
- `JobType`: Academic Project | Startup | Part-time | Competition | Other  
- `ApplicationStatus`: Pending | Shortlisted | Accepted | Rejected  

> See [`prisma/schema.prisma`](./prisma/schema.prisma) for full relational schema.

---

## 🧠 Engineering Logic

CampusConnect integrates algorithmic thinking for the *Engineering Logic* judging criteria:

### 🧩 Smart Match Score
Compares user `skills` with `job.tags` using set overlap and weighting logic:
match = (commonSkills / totalJobTags) * 100

Displayed visually on each job card.

### ⚙️ Recommendation Engine
Suggests relevant opportunities using interest-based filtering and skill similarity.

---

## 🛡️ Admin System & Job Approval

CampusConnect includes a robust admin system with job approval workflow:

### Admin Access
Admin access is controlled by hardcoded email addresses in `/src/lib/admin/config.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@campusconnect.com',
  // Add more admin emails here
];
```

**Default Admin Credentials:**
- Email: `admin@campusconnect.com`
- Password: `Admin@123456` (change in production!)

### Setup Steps

#### Quick Start (3 steps):

1. **Create Admin User in Supabase:**
   - Go to your Supabase Dashboard → Authentication → Users
   - Click "Add user" → "Create new user"
   - Email: `admin@campusconnect.com`
   - Password: `Admin@123456`
   - ✅ Check "Auto Confirm User"
   - Click "Create user"

2. **Run Database Migration:**
   ```bash
   npx prisma migrate dev --name add_admin_and_job_approval
   npx prisma generate
   ```
   This adds job approval fields (`status`, `rejectionReason`, etc.)

3. **Uncomment Code (After Migration):**
   In `/src/app/api/jobs/route.ts`, uncomment these lines:
   - **Line 104:** `status: 'PENDING',` 
   - **Line 169:** `status: 'POSTED',`

**Done!** Login with admin email and go to `/admin`

### Alternative: Modify Admin Email
Don't want to use the default admin email? Just update `/src/lib/admin/config.ts`:

```typescript
export const ADMIN_EMAILS = [
  'youremail@university.edu', // Change to your email
];
```

Then create a Supabase user with that email!

### Job Approval Workflow

1. **User Creates Job** → Status: `PENDING`
2. **Admin Reviews** → Can approve or reject with reason
3. **If Approved** → Status: `APPROVED` → Job visible to public
4. **If Rejected** → Status: `REJECTED` → User notified with reason

### Admin Features
- ✅ View all registered users with stats
- ✅ Search users by name/email
- ✅ View, filter, and manage all jobs (PENDING, APPROVED, REJECTED, POSTED)
- ✅ Approve/reject jobs with optional rejection reasons
- ✅ Real-time statistics dashboard
- ✅ User activity tracking (jobs created, applications, messages)

### Adding More Admins
Simply add their email to the `ADMIN_EMAILS` array in `/src/lib/admin/config.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@campusconnect.com',
  'admin2@university.edu',
  'supervisor@campusconnect.com',
];
```

No database changes or scripts needed - just add the email and they'll have instant admin access once they create an account!

---

## 🤖 AI-Powered Features

CampusConnect leverages **Google Gemini AI** to provide intelligent assistance throughout the job application process:

### 📄 Resume Analysis & Feedback
- **Smart Resume Parsing**: Upload PDF, DOCX, or TXT resumes for AI analysis
- **Comprehensive Scoring**: Get an overall score (0-100) with detailed feedback
- **Skill Detection**: Automatically extracts all technical and soft skills from your resume
- **Experience Level Assessment**: AI determines your level (Entry, Junior, Mid, Senior, Expert)
- **Actionable Recommendations**: Receive specific improvements to strengthen your resume
- **Job Title Suggestions**: Get recommended positions based on your profile
- **Formatting & Content Tips**: Professional advice on resume presentation
- **Industry Insights**: Context-specific recommendations for your field

**Access**: Visit `/resume-tips` to upload and analyze your resume

### ✍️ AI Cover Letter Generator
- **Job-Specific Letters**: Generate personalized cover letters tailored to each position
- **Context-Aware**: Analyzes job requirements and your profile to create relevant content
- **Professional Tone**: AI ensures your cover letter is polished and professional
- **One-Click Generation**: Instantly create cover letters for any job application
- **Downloadable**: Export and customize AI-generated letters

**Access**: Click "AI Cover Letter" button on any job listing page

### 💡 AI Interview Tips Generator
- **Customized Advice**: Get personalized interview tips for specific positions
- **Job-Specific Questions**: AI predicts likely interview questions based on job description
- **Preparation Strategies**: Receive tailored advice on how to prepare
- **Key Points to Highlight**: Know what skills and experiences to emphasize
- **Industry Best Practices**: Get insights specific to your target role

**Access**: Click "AI Interview Tips" button on any job listing page

### 🎯 Enhanced Match Scoring
The platform uses advanced algorithms beyond simple skill matching:
- **Multi-Factor Analysis**: Considers skills, interests, experience, and career goals
- **Weighted Scoring**: More important skills are given higher weight
- **Real-Time Calculation**: Match scores update as you refine your profile
- **Visual Indicators**: Color-coded match percentages (Excellent, Good, Fair)
- **Detailed Breakdown**: See exactly why you match (or don't match) each position

---

## 💰 Payment & Monetization Features

### Job Posting Payments
- **Pay-to-Post**: Job creators can pay to promote their listings
- **Stripe Integration**: Secure payment processing via Stripe
- **Flexible Pricing**: Set custom payment amounts per job posting
- **Payment Tracking**: Full transaction history and receipts
- **Webhook Handling**: Automated payment verification and job status updates

### Subscription Plans
CampusConnect offers tiered subscription plans:

| Plan | Price | Storage | Files | Features |
|------|-------|---------|-------|----------|
| **Free** | $0 | 5 GB | Up to 100 | Basic support, Community access |
| **Pro** | $19/mo | 100 GB | Unlimited | Priority support, Advanced analytics, Custom branding, API access |
| **Business** | $49/mo | 1 TB | Unlimited | 24/7 Premium support, Team management, SSO integration |

**Features**:
- ✅ Secure Stripe checkout for subscriptions
- ✅ Automatic billing and invoice management
- ✅ Plan upgrade/downgrade flexibility
- ✅ Customer portal for managing subscriptions
- ✅ Invoice download and payment history
- ✅ Webhook-based subscription sync

**Access**: Visit `/pricing` to view plans or `/billing` to manage subscription

---

## 🎥 Video Call System

CampusConnect integrates **100ms** for professional video calling:

### Core Features
- **HD Video Quality**: Up to 1080p with adaptive bitrate
- **Low Latency**: Sub-200ms for seamless conversations
- **Screen Sharing**: Collaborate in real-time on presentations and code
- **Secure Rooms**: Token-based authentication for private calls
- **One-Click Join**: Seamless joining experience

### Call Request Workflow
1. **Request Call**: Job seekers can request video calls with job creators
2. **Proposed Times**: Suggest multiple time slots for scheduling
3. **Accept/Reject**: Finders can accept or reject with optional messages
4. **Notifications**: Real-time alerts for all call activities
5. **Instant Join**: Secure room tokens generated on-demand
6. **Call History**: Track all past and upcoming video calls

**Access**: 
- Request calls from job detail pages
- View all calls at `/video-calls`
- Join active calls from `/video-call/[id]`

---

## 📁 File Management System

### Upload & Storage
- **Multiple Categories**: Organize files as Images, Videos, or Documents
- **Cloud Storage**: Files stored securely in Supabase Storage
- **Size Limits**: Intelligent file size and type validation
- **Upload Progress**: Real-time upload status tracking
- **Bulk Upload**: Upload multiple files at once

### File Types Supported
- **Images**: JPG, PNG, GIF, WebP (5 MB limit)
- **Videos**: MP4, AVI, MOV, WebM (50 MB limit)
- **Documents**: PDF, DOCX, DOC, TXT (10 MB limit)

### Use Cases
- Upload portfolios and project showcases
- Store resume versions
- Share video presentations
- Keep project documentation

**Access**: Visit `/files` to upload and manage files

---

## 💬 Real-Time Messaging

### Chat Features
- **Instant Messaging**: Real-time chat powered by Supabase Realtime
- **Conversation Management**: Organized chat threads per user
- **Message History**: Persistent message storage and retrieval
- **Read Receipts**: Know when messages are delivered and read
- **Typing Indicators**: See when others are typing
- **User Presence**: Know who's online
- **Search Functionality**: Find specific conversations quickly

### Integration
- Start conversations from job detail pages
- Message job creators before applying
- Communicate with applicants during review process
- Follow up after interviews and decisions

**Access**: Visit `/messages` for all conversations

---

## 📧 Email Notification System

CampusConnect includes a comprehensive email notification system:

### Email Types
- **Application Updates**: Notify applicants of status changes
- **New Messages**: Alert users of incoming chat messages
- **Call Requests**: Inform about video call invitations
- **Job Approvals**: Notify when jobs are approved/rejected by admin
- **Match Notifications**: Alert when high-matching opportunities are posted
- **Payment Receipts**: Send transaction confirmations

### Email Features
- **Professional Templates**: Beautiful, responsive email designs
- **Event-Based Triggers**: Automated emails for key actions
- **Customization**: Personalized content based on user profile
- **Delivery Tracking**: Monitor email delivery status
- **Fallback Handling**: Graceful error handling and retry logic

---

## 📊 Analytics & Tracking

### Job Analytics
- **View Counts**: Track how many people see your posts
- **Application Metrics**: Monitor total and unique applications
- **Engagement Rates**: Measure clicks vs. applications
- **Time-to-Fill**: Track how quickly positions are filled
- **Performance Comparison**: Compare multiple job postings

### User Dashboard
- **Activity Overview**: See your recent actions and updates
- **Application Status**: Monitor all your applications in one place
- **Profile Views**: Know when employers view your profile
- **Match Scores**: Track your compatibility with opportunities
- **Skill Analytics**: See which skills are most in-demand

**Access**: Visit `/dashboard` for personalized analytics

---

## 🔐 Security & Permissions

### Role-Based Access Control (RBAC)
CampusConnect implements comprehensive permission management:
- **Permission Guards**: Frontend route protection based on user roles
- **API Middleware**: Server-side permission validation
- **Resource-Level Access**: Control who can view/edit specific resources
- **Admin Privileges**: Special permissions for platform administrators

### Data Protection
- **Authentication**: Secure auth via Supabase with OAuth support
- **Data Validation**: Server-side validation for all inputs
- **File Upload Security**: Type checking, size limits, and virus scanning
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in escaping
- **CORS Configuration**: Proper cross-origin policies

---

## 🧪 Testing & Quality Assurance

### Available Endpoints
- `/api/test-email`: Test email functionality
- `/api/test-hms-token`: Verify 100ms video token generation
- **Mock Data Scripts**: Cleanup utilities for development

### Development Tools
- **TypeScript**: Full type safety across codebase
- **ESLint**: Code quality and consistency
- **Prisma Studio**: Database GUI for testing queries
- **Supabase Dashboard**: Real-time database monitoring
- **Vercel Analytics**: Production performance tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm/npm
- Supabase account (free tier works)
- PostgreSQL database
- Stripe account (for payments)
- 100ms account (for video calls)
- Google Gemini API key (for AI features)

### Quick Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env` file with required keys (see `.env.example`)

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Visit** `http://localhost:3000`

### 🌐 Live Deployment

**Production URL**: [http://159.223.38.110:3000](http://159.223.38.110:3000)

The application is currently deployed and accessible at the above URL. You can test all features including:
- User authentication and registration
- Job posting and management
- AI-powered resume analysis
- Video call integration
- Real-time messaging
- Payment processing
- Admin dashboard

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📚 Additional Resources

- **Database Schema**: See `prisma/schema.prisma` for full data model
- **Design System**: Check `design/design.json` for UI configuration
- **API Routes**: Explore `src/app/api/` for all endpoints
- **Components**: Browse `src/components/` for reusable UI elements
- **Admin Guide**: Review admin setup in this README's Admin section

---

## 🤝 Contributing

This project was built for Surge '25 Web Hackathon. For questions or contributions, please reach out to the development team.

---

**Built with ❤️ by the CampusConnect Team**

*Last updated: January 2025*

