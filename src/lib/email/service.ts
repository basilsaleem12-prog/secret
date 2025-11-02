import { Resend } from 'resend'
import { SENDER_EMAIL, RESEND_API_KEY } from './config'
import * as EmailTemplates from './templates'

// Extract components with proper typing
const WelcomeEmail = (EmailTemplates as any).WelcomeEmail
const JobApprovedEmail = (EmailTemplates as any).JobApprovedEmail
const JobRejectedEmail = (EmailTemplates as any).JobRejectedEmail
const TestEmail = (EmailTemplates as any).TestEmail
const ApplicationReceivedEmail = (EmailTemplates as any).ApplicationReceivedEmail
const ApplicationStatusEmail = (EmailTemplates as any).ApplicationStatusEmail
const VideoCallRequestEmail = (EmailTemplates as any).VideoCallRequestEmail
const VideoCallAcceptedEmail = (EmailTemplates as any).VideoCallAcceptedEmail
const VideoCallRejectedEmail = (EmailTemplates as any).VideoCallRejectedEmail
const PaymentSuccessEmail = (EmailTemplates as any).PaymentSuccessEmail
const JobFilledEmail = (EmailTemplates as any).JobFilledEmail

const resend = new Resend(RESEND_API_KEY)

interface SendEmailParams {
  to: string
  subject: string
  html: string
  react?: React.ReactElement | null
}

/**
 * Generic email sending function
 */
export async function sendEmail({ to, subject, html, react = null }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn(`Email not sent to ${to}: RESEND_API_KEY is not configured.`)
    return { data: null, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: to,
      subject: subject,
      html: html,
      react: react,
    })

    if (error) {
      console.error(`Failed to send email to ${to}:`, error)
      return { data: null, error: error.message }
    }

    console.log(`✅ Email sent successfully to ${to}. ID: ${data?.id}`)
    return { data, error: null }
  } catch (error: any) {
    console.error(`❌ Unexpected error sending email to ${to}:`, error)
    return { data: null, error: error.message || 'Unknown error' }
  }
}

/**
 * Send welcome email on signup
 */
export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: 'Welcome to CampusConnect! 🎉',
    react: WelcomeEmail({ userName }),
    html: '',
  })
}

/**
 * Send job approval email to job poster
 */
export async function sendJobApprovalEmail(to: string, userName: string, jobTitle: string, jobId: string, request?: Request) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const jobLink = `${appUrl}/jobs/${jobId}`
  return sendEmail({
    to,
    subject: `Your Job "${jobTitle}" has been Approved! ✅`,
    react: JobApprovalEmail({ userName, jobTitle, jobLink }),
    html: '',
  })
}

/**
 * Send job rejection email to job poster
 */
export async function sendJobRejectionEmail(to: string, userName: string, jobTitle: string, rejectionReason: string) {
  return sendEmail({
    to,
    subject: `Update on Your Job "${jobTitle}" - Action Required ❌`,
    react: JobRejectedEmail({ userName, jobTitle, rejectionReason }),
    html: '',
  })
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: 'CampusConnect Test Email 🧪',
    react: TestEmail(),
    html: '',
  })
}

/**
 * Send application received email to job poster
 */
export async function sendApplicationReceivedEmail(
  to: string,
  posterName: string,
  applicantName: string,
  jobTitle: string,
  jobId: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const applicationLink = `${appUrl}/jobs/${jobId}/applications`
  
  return sendEmail({
    to,
    subject: `New Application for "${jobTitle}" 📩`,
    react: ApplicationReceivedEmail({ posterName, applicantName, jobTitle, applicationLink }),
    html: '',
  })
}

/**
 * Send application status update email to applicant
 */
export async function sendApplicationStatusEmail(
  to: string,
  applicantName: string,
  status: string,
  jobTitle: string,
  jobId: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const jobLink = `${appUrl}/jobs/${jobId}`
  
  const statusLabels: Record<string, string> = {
    SHORTLISTED: 'Shortlisted ⭐',
    ACCEPTED: 'Accepted 🎉',
    REJECTED: 'Application Update 📋'
  }
  
  return sendEmail({
    to,
    subject: `${statusLabels[status] || 'Application Update'} - ${jobTitle}`,
    react: ApplicationStatusEmail({ applicantName, status, jobTitle, jobLink }),
    html: '',
  })
}

/**
 * Send video call request email to job poster
 */
export async function sendVideoCallRequestEmail(
  to: string,
  receiverName: string,
  requesterName: string,
  jobTitle: string,
  message: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const callsLink = `${appUrl}/video-calls`
  
  return sendEmail({
    to,
    subject: `Video Interview Request from ${requesterName} 📹`,
    react: VideoCallRequestEmail({ receiverName, requesterName, jobTitle, message, callsLink }),
    html: '',
  })
}

/**
 * Send video call accepted email to requester
 */
export async function sendVideoCallAcceptedEmail(
  to: string,
  requesterName: string,
  receiverName: string,
  jobTitle: string,
  callRequestId: string,
  scheduledTime: string | null,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const videoCallLink = `${appUrl}/video-call/${callRequestId}`
  
  return sendEmail({
    to,
    subject: `Video Interview Accepted! 🎉 - ${jobTitle}`,
    react: VideoCallAcceptedEmail({ requesterName, receiverName, jobTitle, videoCallLink, scheduledTime }),
    html: '',
  })
}

/**
 * Send video call rejected email to requester
 */
export async function sendVideoCallRejectedEmail(
  to: string,
  requesterName: string,
  receiverName: string,
  jobTitle: string,
  reason: string
) {
  return sendEmail({
    to,
    subject: `Video Interview Request Update - ${jobTitle}`,
    react: VideoCallRejectedEmail({ requesterName, jobTitle, reason }),
    html: '',
  })
}

/**
 * Send payment success email to job poster
 */
export async function sendPaymentSuccessEmail(
  to: string,
  userName: string,
  jobTitle: string,
  amount: number,
  jobId: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  const jobLink = `${appUrl}/jobs/${jobId}`
  
  return sendEmail({
    to,
    subject: `Payment Confirmed for "${jobTitle}" 💰`,
    react: PaymentSuccessEmail({ userName, jobTitle, amount, jobLink }),
    html: '',
  })
}

/**
 * Send job filled notification email to applicant
 */
export async function sendJobFilledEmail(
  to: string,
  applicantName: string,
  jobTitle: string
) {
  return sendEmail({
    to,
    subject: `Position Filled: ${jobTitle}`,
    react: JobFilledEmail({ applicantName, jobTitle }),
    html: '',
  })
}
