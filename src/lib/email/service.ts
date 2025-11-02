import { Resend } from 'resend'
import { render } from '@react-email/render'
import { SENDER_EMAIL, RESEND_API_KEY } from './config'
import * as EmailTemplates from './templates'
import * as React from 'react'

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
  html?: string
  react?: React.ReactElement | null
}

/**
 * Generic email sending function
 */
export async function sendEmail({ to, subject, html, react = null }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn(`Email not sent to ${to}: RESEND_API_KEY is not configured.`)
    return { success: false, data: null, error: 'Email service not configured', messageId: null }
  }

  try {
    // If React component is provided, render it to HTML
    let emailHtml = html || ''
    if (react) {
      try {
        emailHtml = await render(react)
      } catch (renderError) {
        console.error('Error rendering React email component:', renderError)
        return { success: false, data: null, error: 'Failed to render email template', messageId: null }
      }
    }

    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: to,
      subject: subject,
      html: emailHtml,
    })

    if (error) {
      console.error(`Failed to send email to ${to}:`, error)
      return { success: false, data: null, error: error.message, messageId: null }
    }

    console.log(`✅ Email sent successfully to ${to}. ID: ${data?.id}`)
    return { success: true, data, error: null, messageId: data?.id || null }
  } catch (error: any) {
    console.error(`❌ Unexpected error sending email to ${to}:`, error)
    return { success: false, data: null, error: error.message || 'Unknown error', messageId: null }
  }
}

/**
 * Send welcome email on signup
 */
export async function sendWelcomeEmail(to: string, userName: string, request?: Request) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  
  return sendEmail({
    to,
    subject: 'Welcome to CampusConnect! 🎉',
    react: React.createElement(WelcomeEmail, { userName, appUrl }),
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
    react: React.createElement(JobApprovedEmail, { userName, jobTitle, jobLink }),
  })
}

/**
 * Send job rejection email to job poster
 */
export async function sendJobRejectionEmail(to: string, userName: string, jobTitle: string, rejectionReason: string, request?: Request) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  
  return sendEmail({
    to,
    subject: `Update on Your Job "${jobTitle}" - Action Required ❌`,
    react: React.createElement(JobRejectedEmail, { userName, jobTitle, rejectionReason, appUrl }),
  })
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: 'CampusConnect Test Email 🧪',
    react: React.createElement(TestEmail),
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
    react: React.createElement(ApplicationReceivedEmail, { posterName, applicantName, jobTitle, applicationLink }),
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
    react: React.createElement(ApplicationStatusEmail, { applicantName, status, jobTitle, jobLink }),
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
    react: React.createElement(VideoCallRequestEmail, { receiverName, requesterName, jobTitle, message, callsLink }),
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
    react: React.createElement(VideoCallAcceptedEmail, { requesterName, receiverName, jobTitle, videoCallLink: videoCallLink, scheduledTime }),
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
  reason: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  
  return sendEmail({
    to,
    subject: `Video Interview Request Update - ${jobTitle}`,
    react: React.createElement(VideoCallRejectedEmail, { requesterName, jobTitle, reason, appUrl }),
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
    react: React.createElement(PaymentSuccessEmail, { userName, jobTitle, amount, jobLink }),
  })
}

/**
 * Send job filled notification email to applicant
 */
export async function sendJobFilledEmail(
  to: string,
  applicantName: string,
  jobTitle: string,
  request?: Request
) {
  const { getAppUrl } = await import('@/lib/utils/url')
  const appUrl = request ? getAppUrl(request) : (process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''))
  
  return sendEmail({
    to,
    subject: `Position Filled: ${jobTitle}`,
    react: React.createElement(JobFilledEmail, { applicantName, jobTitle, appUrl }),
  })
}
