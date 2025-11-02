import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_CONFIG, isEmailEnabled } from '@/lib/email/config'
import { sendWelcomeEmail } from '@/lib/email/service'

/**
 * GET /api/test-email - Test email service
 * Usage: http://localhost:3000/api/test-email?to=youremail@example.com
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const toEmail = searchParams.get('to')

    // Check if email service is enabled
    if (!isEmailEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        message: 'RESEND_API_KEY is not set in environment variables',
        instructions: {
          step1: 'Add RESEND_API_KEY to your .env file',
          step2: 'Current key in config: re_FS9srZH7_4WmoaoLSF97wjVv9ZKn8EJDV',
          step3: 'Restart your development server',
          step4: 'Try again'
        }
      }, { status: 400 })
    }

    // If no email provided, send test email to default
    const recipientEmail = toEmail || 'www.basilslothdemon@gmail.com'

    // Test 1: Simple email using Resend directly
    console.log('📧 Sending test email to:', recipientEmail)
    
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: '🧪 Test Email from CampusConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 40px auto; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: white; padding: 30px; margin-top: 20px; border-radius: 8px; }
            .success { color: #059669; font-weight: bold; }
            .code { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 CampusConnect</h1>
              <p>Email Service Test</p>
            </div>
            <div class="content">
              <h2 class="success">✅ Email System Working!</h2>
              <p>If you're reading this, your email service is configured correctly.</p>
              
              <h3>📊 Test Details:</h3>
              <div class="code">
                <p><strong>From:</strong> ${EMAIL_CONFIG.from}</p>
                <p><strong>To:</strong> ${recipientEmail}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Service:</strong> Resend</p>
              </div>
              
              <h3>✨ What This Means:</h3>
              <ul>
                <li>✅ Resend API key is valid</li>
                <li>✅ Email configuration is correct</li>
                <li>✅ Emails can be sent successfully</li>
                <li>✅ Your welcome, approval, and notification emails will work</li>
              </ul>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                This is a test email from your CampusConnect application.<br>
                You can safely ignore or delete this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Email send error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to send email',
        details: error,
        troubleshooting: {
          check1: 'Verify RESEND_API_KEY is correct',
          check2: 'Ensure sender domain is verified in Resend',
          check3: 'Check Resend dashboard for errors',
          check4: 'Verify you have email credits'
        }
      }, { status: 500 })
    }

    console.log('✅ Email sent successfully:', data)

    // Test 2: Test welcome email template
    console.log('📧 Testing welcome email template...')
    const welcomeResult = await sendWelcomeEmail(recipientEmail, 'Test User')

    return NextResponse.json({
      success: true,
      message: '✅ Email service is working perfectly!',
      results: {
        simpleEmail: {
          status: 'sent',
          messageId: data?.id,
          recipient: recipientEmail
        },
        welcomeEmail: {
          status: welcomeResult.success ? 'sent' : 'failed',
          messageId: welcomeResult.messageId,
          error: welcomeResult.error
        }
      },
      config: {
        from: EMAIL_CONFIG.from,
        appUrl: EMAIL_CONFIG.appUrl,
        emailsEnabled: isEmailEnabled()
      },
      nextSteps: [
        '✅ Check your inbox at ' + recipientEmail,
        '✅ Check spam folder if not in inbox',
        '✅ You should receive 2 test emails',
        '✅ Email system is ready for production!'
      ]
    })

  } catch (error) {
    console.error('❌ Test email error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

/**
 * POST /api/test-email - Send test email to custom recipient
 * Body: { "to": "your@email.com", "subject": "Custom Subject" }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isEmailEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 400 })
    }

    const body = await request.json()
    const { to, subject, name } = body

    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Email recipient is required'
      }, { status: 400 })
    }

    const emailSubject = subject || '🧪 Test Email from CampusConnect'
    const userName = name || 'Test User'

    // Send welcome email
    const result = await sendWelcomeEmail(to, userName)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      recipient: to,
      messageId: result.messageId
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email'
    }, { status: 500 })
  }
}

