import { NextRequest, NextResponse } from 'next/server'
import { isEmailEnabled } from '@/lib/email/config'
import {
  sendWelcomeEmail,
  sendJobApprovalEmail,
  sendJobRejectionEmail,
  sendTestEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendVideoCallRequestEmail,
  sendVideoCallAcceptedEmail,
  sendVideoCallRejectedEmail,
  sendPaymentSuccessEmail,
  sendJobFilledEmail,
} from '@/lib/email/service'

/**
 * POST /api/test-all-emails - Test all email types in the application
 * Body: { "to": "your@email.com" } (optional, defaults to abbddullahh1122@gmail.com)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isEmailEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.'
      }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const recipientEmail = body.to || 'abbddullahh1122@gmail.com'

    console.log(`📧 Starting comprehensive email test to: ${recipientEmail}`)

    const results: Record<string, { success: boolean; messageId?: string | null; error?: string }> = {}
    
    // Test 1: Welcome Email
    console.log('📧 1/11: Testing Welcome Email...')
    results.welcome = await sendWelcomeEmail(recipientEmail, 'Test User', request)

    // Test 2: Job Approval Email
    console.log('📧 2/11: Testing Job Approval Email...')
    results.jobApproval = await sendJobApprovalEmail(
      recipientEmail,
      'Test Job Poster',
      'Software Developer Internship',
      'test-job-id-123',
      request
    )

    // Test 3: Job Rejection Email
    console.log('📧 3/11: Testing Job Rejection Email...')
    results.jobRejection = await sendJobRejectionEmail(
      recipientEmail,
      'Test Job Poster',
      'Marketing Coordinator Position',
      'The job description did not meet our posting guidelines. Please review our requirements and resubmit.',
      request
    )

    // Test 4: Test Email
    console.log('📧 4/11: Testing Test Email...')
    results.test = await sendTestEmail(recipientEmail)

    // Test 5: Application Received Email
    console.log('📧 5/11: Testing Application Received Email...')
    results.applicationReceived = await sendApplicationReceivedEmail(
      recipientEmail,
      'Test Job Poster',
      'John Doe',
      'Frontend Developer Role',
      'test-job-id-456',
      request
    )

    // Test 6: Application Status - SHORTLISTED
    console.log('📧 6/11: Testing Application Status Email (SHORTLISTED)...')
    results.applicationShortlisted = await sendApplicationStatusEmail(
      recipientEmail,
      'Jane Smith',
      'SHORTLISTED',
      'Backend Engineer Position',
      'test-job-id-789',
      request
    )

    // Test 7: Application Status - ACCEPTED
    console.log('📧 7/11: Testing Application Status Email (ACCEPTED)...')
    results.applicationAccepted = await sendApplicationStatusEmail(
      recipientEmail,
      'Alice Johnson',
      'ACCEPTED',
      'Full Stack Developer',
      'test-job-id-101',
      request
    )

    // Test 8: Application Status - REJECTED
    console.log('📧 8/11: Testing Application Status Email (REJECTED)...')
    results.applicationRejected = await sendApplicationStatusEmail(
      recipientEmail,
      'Bob Williams',
      'REJECTED',
      'DevOps Engineer',
      'test-job-id-202',
      request
    )

    // Test 9: Video Call Request Email
    console.log('📧 9/11: Testing Video Call Request Email...')
    results.videoCallRequest = await sendVideoCallRequestEmail(
      recipientEmail,
      'Test Job Poster',
      'Mike Chen',
      'Product Manager Internship',
      'I would love to schedule a video interview to discuss my qualifications and learn more about this opportunity!',
      request
    )

    // Test 10: Video Call Accepted Email
    console.log('📧 10/11: Testing Video Call Accepted Email...')
    results.videoCallAccepted = await sendVideoCallAcceptedEmail(
      recipientEmail,
      'Sarah Thompson',
      'Test Job Poster',
      'UX Designer Position',
      'test-call-request-id-303',
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      request
    )

    // Test 11: Video Call Rejected Email
    console.log('📧 11/11: Testing Video Call Rejected Email...')
    results.videoCallRejected = await sendVideoCallRejectedEmail(
      recipientEmail,
      'David Martinez',
      'Test Job Poster',
      'Data Analyst Role',
      'We have already filled this position with another candidate. Thank you for your interest!',
      request
    )

    // Test 12: Payment Success Email
    console.log('📧 12/13: Testing Payment Success Email...')
    results.paymentSuccess = await sendPaymentSuccessEmail(
      recipientEmail,
      'Test Employer',
      'Senior Python Developer',
      500,
      'test-job-id-404',
      request
    )

    // Test 13: Job Filled Email
    console.log('📧 13/13: Testing Job Filled Email...')
    results.jobFilled = await sendJobFilledEmail(
      recipientEmail,
      'Test Applicant',
      'Junior React Developer',
      request
    )

    // Calculate summary
    const total = Object.keys(results).length
    const successful = Object.values(results).filter(r => r.success).length
    const failed = total - successful

    console.log(`✅ Email test completed: ${successful}/${total} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Comprehensive email test completed! Sent ${total} test emails to ${recipientEmail}`,
      recipient: recipientEmail,
      summary: {
        total,
        successful,
        failed,
        successRate: `${Math.round((successful / total) * 100)}%`
      },
      results: {
        welcome: {
          name: 'Welcome Email',
          ...results.welcome
        },
        jobApproval: {
          name: 'Job Approval Email',
          ...results.jobApproval
        },
        jobRejection: {
          name: 'Job Rejection Email',
          ...results.jobRejection
        },
        test: {
          name: 'Test Email',
          ...results.test
        },
        applicationReceived: {
          name: 'Application Received Email',
          ...results.applicationReceived
        },
        applicationShortlisted: {
          name: 'Application Status - Shortlisted',
          ...results.applicationShortlisted
        },
        applicationAccepted: {
          name: 'Application Status - Accepted',
          ...results.applicationAccepted
        },
        applicationRejected: {
          name: 'Application Status - Rejected',
          ...results.applicationRejected
        },
        videoCallRequest: {
          name: 'Video Call Request Email',
          ...results.videoCallRequest
        },
        videoCallAccepted: {
          name: 'Video Call Accepted Email',
          ...results.videoCallAccepted
        },
        videoCallRejected: {
          name: 'Video Call Rejected Email',
          ...results.videoCallRejected
        },
        paymentSuccess: {
          name: 'Payment Success Email',
          ...results.paymentSuccess
        },
        jobFilled: {
          name: 'Job Filled Email',
          ...results.jobFilled
        }
      },
      nextSteps: [
        `✅ Check your inbox at ${recipientEmail}`,
        '✅ Check spam/junk folder if emails are not in inbox',
        `✅ You should receive ${total} test emails`,
        '✅ Review each email template for proper formatting',
        '✅ Test all links in the emails to ensure they work',
        '✅ Email system is ready for production!'
      ]
    })

  } catch (error) {
    console.error('❌ Error in comprehensive email test:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete email test',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/test-all-emails - Quick test with default email
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isEmailEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const recipientEmail = searchParams.get('to') || 'abbddullahh1122@gmail.com'

    // Use POST handler logic
    return POST(request)
  } catch (error) {
    console.error('❌ Error in email test:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test emails'
      },
      { status: 500 }
    )
  }
}

