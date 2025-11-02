import { EMAIL_CONFIG } from './config'

// Base email template with styling
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${EMAIL_CONFIG.appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E3A8A, #3B82F6);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #1E3A8A, #3B82F6);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background: linear-gradient(135deg, #1E40AF, #2563EB);
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .highlight {
      background: #EFF6FF;
      padding: 16px;
      border-left: 4px solid #3B82F6;
      border-radius: 4px;
      margin: 20px 0;
    }
    .success {
      color: #059669;
      font-weight: 600;
    }
    .warning {
      color: #D97706;
      font-weight: 600;
    }
    .danger {
      color: #DC2626;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ${EMAIL_CONFIG.appName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 ${EMAIL_CONFIG.appName}. All rights reserved.</p>
      <p>Connect. Collaborate. Create.</p>
    </div>
  </div>
</body>
</html>
`

// Welcome email template
export const welcomeEmail = (userName: string, profileLink: string) => baseTemplate(`
  <h2>Welcome to ${EMAIL_CONFIG.appName}! 🎉</h2>
  <p>Hi ${userName},</p>
  <p>Thank you for joining ${EMAIL_CONFIG.appName}! We're excited to have you on board.</p>
  
  <div class="highlight">
    <p><strong>🚀 Get Started:</strong></p>
    <ul>
      <li>Complete your profile to stand out</li>
      <li>Browse amazing opportunities</li>
      <li>Connect with talented students</li>
      <li>Start collaborating on projects</li>
    </ul>
  </div>
  
  <center>
    <a href="${profileLink}" class="button">Complete Your Profile</a>
  </center>
  
  <p>If you have any questions, feel free to reach out to our support team.</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Job approval email
export const jobApprovedEmail = (userName: string, jobTitle: string, jobLink: string) => baseTemplate(`
  <h2><span class="success">✅ Your Job Has Been Approved!</span></h2>
  <p>Hi ${userName},</p>
  <p>Great news! Your job posting has been approved by our admin team and is now live.</p>
  
  <div class="highlight">
    <p><strong>Job Details:</strong></p>
    <p style="font-size: 18px; font-weight: 600; color: #1E3A8A;">${jobTitle}</p>
    <p>Your job is now visible to all users on the platform.</p>
  </div>
  
  <center>
    <a href="${jobLink}" class="button">View Your Job</a>
  </center>
  
  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Monitor applications at your job dashboard</li>
    <li>Review candidate profiles and proposals</li>
    <li>Schedule video interviews with top candidates</li>
    <li>Mark the position as filled when you find the right match</li>
  </ul>
  
  <p>Good luck finding the perfect candidate!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Job rejection email
export const jobRejectedEmail = (userName: string, jobTitle: string, reason: string) => baseTemplate(`
  <h2><span class="danger">❌ Job Posting Update</span></h2>
  <p>Hi ${userName},</p>
  <p>We regret to inform you that your job posting could not be approved at this time.</p>
  
  <div class="highlight">
    <p><strong>Job Title:</strong></p>
    <p style="font-size: 18px; font-weight: 600;">${jobTitle}</p>
    
    ${reason ? `
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
    ` : ''}
  </div>
  
  <p><strong>What You Can Do:</strong></p>
  <ul>
    <li>Review our posting guidelines</li>
    <li>Edit your job posting to address the concerns</li>
    <li>Resubmit for approval</li>
  </ul>
  
  <center>
    <a href="${EMAIL_CONFIG.appUrl}/my-jobs" class="button">View My Jobs</a>
  </center>
  
  <p>If you have any questions about this decision, please contact our support team.</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Application received email (for job poster)
export const applicationReceivedEmail = (
  posterName: string,
  applicantName: string,
  jobTitle: string,
  applicationLink: string
) => baseTemplate(`
  <h2>📩 New Application Received!</h2>
  <p>Hi ${posterName},</p>
  <p>You've received a new application for your job posting!</p>
  
  <div class="highlight">
    <p><strong>Applicant:</strong> ${applicantName}</p>
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Status:</strong> <span class="warning">Pending Review</span></p>
  </div>
  
  <center>
    <a href="${applicationLink}" class="button">Review Application</a>
  </center>
  
  <p><strong>Quick Actions:</strong></p>
  <ul>
    <li>Read their proposal and review their resume</li>
    <li>Shortlist promising candidates</li>
    <li>Schedule video interviews</li>
    <li>Accept or reject applications</li>
  </ul>
  
  <p>Don't keep talented candidates waiting!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Application status update email (for applicant)
export const applicationStatusEmail = (
  applicantName: string,
  status: string,
  jobTitle: string,
  jobLink: string
) => {
  const statusConfig: Record<string, { color: string; icon: string; message: string }> = {
    SHORTLISTED: {
      color: 'success',
      icon: '⭐',
      message: 'Congratulations! You\'ve been shortlisted for the next round.'
    },
    ACCEPTED: {
      color: 'success',
      icon: '🎉',
      message: 'Congratulations! Your application has been accepted!'
    },
    REJECTED: {
      color: 'danger',
      icon: '😔',
      message: 'Unfortunately, your application was not selected this time.'
    }
  }

  const config = statusConfig[status] || statusConfig.REJECTED

  return baseTemplate(`
    <h2><span class="${config.color}">${config.icon} Application Update</span></h2>
    <p>Hi ${applicantName},</p>
    <p>We have an update regarding your application.</p>
    
    <div class="highlight">
      <p><strong>Job:</strong> ${jobTitle}</p>
      <p><strong>Status:</strong> <span class="${config.color}">${status}</span></p>
      <p>${config.message}</p>
    </div>
    
    ${status === 'ACCEPTED' ? `
      <p><strong>🎊 Next Steps:</strong></p>
      <ul>
        <li>The job poster will contact you soon</li>
        <li>Check your dashboard for any messages</li>
        <li>Be ready for a potential video interview</li>
      </ul>
    ` : status === 'SHORTLISTED' ? `
      <p><strong>📝 Next Steps:</strong></p>
      <ul>
        <li>Keep an eye on your notifications</li>
        <li>You may receive a video interview request</li>
        <li>Prepare to discuss your proposal</li>
      </ul>
    ` : `
      <p><strong>Keep Going:</strong></p>
      <ul>
        <li>Don't give up! Keep applying to other opportunities</li>
        <li>Update your profile to showcase your skills</li>
        <li>Browse more jobs that match your interests</li>
      </ul>
    `}
    
    <center>
      <a href="${jobLink}" class="button">View Job Details</a>
    </center>
    
    <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
  `)
}

// Video call request email
export const videoCallRequestEmail = (
  receiverName: string,
  requesterName: string,
  jobTitle: string,
  message: string,
  callsLink: string
) => baseTemplate(`
  <h2>📹 Video Interview Request</h2>
  <p>Hi ${receiverName},</p>
  <p><strong>${requesterName}</strong> has requested a video interview with you!</p>
  
  <div class="highlight">
    <p><strong>Job:</strong> ${jobTitle}</p>
    ${message ? `<p><strong>Message:</strong></p><p style="font-style: italic;">"${message}"</p>` : ''}
  </div>
  
  <center>
    <a href="${callsLink}" class="button">Review Request</a>
  </center>
  
  <p><strong>You can:</strong></p>
  <ul>
    <li>✅ Accept and schedule a time</li>
    <li>❌ Decline with an optional reason</li>
  </ul>
  
  <p>Video interviews are a great way to assess candidates quickly!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Video call accepted email
export const videoCallAcceptedEmail = (
  requesterName: string,
  receiverName: string,
  jobTitle: string,
  videoCallLink: string,
  scheduledTime?: string
) => baseTemplate(`
  <h2><span class="success">✅ Video Interview Accepted!</span></h2>
  <p>Hi ${requesterName},</p>
  <p>Great news! <strong>${receiverName}</strong> has accepted your video interview request.</p>
  
  <div class="highlight">
    <p><strong>Job:</strong> ${jobTitle}</p>
    ${scheduledTime ? `<p><strong>🗓️ Scheduled Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>` : '<p>No specific time set - you can join anytime!</p>'}
  </div>
  
  <center>
    <a href="${videoCallLink}" class="button">Join Video Call</a>
  </center>
  
  <p><strong>📝 Prepare for Your Interview:</strong></p>
  <ul>
    <li>Test your camera and microphone</li>
    <li>Review the job requirements</li>
    <li>Prepare questions about the role</li>
    <li>Find a quiet location with good lighting</li>
  </ul>
  
  <p><strong>Video Call Link:</strong></p>
  <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; word-break: break-all;">
    ${videoCallLink}
  </p>
  
  <p>Good luck with your interview!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Video call rejected email
export const videoCallRejectedEmail = (
  requesterName: string,
  jobTitle: string,
  reason: string
) => baseTemplate(`
  <h2><span class="warning">Video Interview Update</span></h2>
  <p>Hi ${requesterName},</p>
  <p>We wanted to let you know that your video interview request was declined.</p>
  
  <div class="highlight">
    <p><strong>Job:</strong> ${jobTitle}</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
  </div>
  
  <p><strong>Don't be discouraged!</strong></p>
  <ul>
    <li>The job poster may have scheduling conflicts</li>
    <li>They might be reviewing other candidates first</li>
    <li>Your application is still under consideration</li>
  </ul>
  
  <center>
    <a href="${EMAIL_CONFIG.appUrl}/my-applications" class="button">View My Applications</a>
  </center>
  
  <p>Keep applying and showcasing your talents!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Payment success email
export const paymentSuccessEmail = (
  userName: string,
  jobTitle: string,
  amount: number,
  jobLink: string
) => baseTemplate(`
  <h2><span class="success">💰 Payment Confirmed!</span></h2>
  <p>Hi ${userName},</p>
  <p>Your payment has been successfully processed.</p>
  
  <div class="highlight">
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Amount:</strong> <span style="font-size: 24px; font-weight: 700; color: #059669;">$${amount}</span></p>
    <p><strong>Status:</strong> <span class="success">Paid ✓</span></p>
  </div>
  
  <p><strong>What This Means:</strong></p>
  <ul>
    <li>Your job now displays the compensation amount</li>
    <li>Paid jobs get better visibility</li>
    <li>More attractive to quality candidates</li>
  </ul>
  
  <center>
    <a href="${jobLink}" class="button">View Your Job</a>
  </center>
  
  <p>Thank you for using our payment feature!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

// Job filled notification email
export const jobFilledEmail = (
  applicantName: string,
  jobTitle: string
) => baseTemplate(`
  <h2>Position Filled</h2>
  <p>Hi ${applicantName},</p>
  <p>We wanted to let you know that the position you applied for has been filled.</p>
  
  <div class="highlight">
    <p><strong>Job:</strong> ${jobTitle}</p>
    <p><strong>Status:</strong> Position Filled</p>
  </div>
  
  <p><strong>Keep Exploring:</strong></p>
  <ul>
    <li>Browse more opportunities on our platform</li>
    <li>Update your skills and experience</li>
    <li>Network with other students</li>
  </ul>
  
  <center>
    <a href="${EMAIL_CONFIG.appUrl}/jobs" class="button">Browse More Jobs</a>
  </center>
  
  <p>Your next opportunity is waiting!</p>
  <p>Best regards,<br>The ${EMAIL_CONFIG.appName} Team</p>
`)

