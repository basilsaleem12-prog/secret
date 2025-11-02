import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe/config'

/**
 * POST /api/jobs/[id]/payment - Create Stripe checkout session for job payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params
    const body = await request.json()
    const { paymentAmount } = body

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify ownership
    if (job.createdById !== profile.id) {
      return NextResponse.json(
        { error: 'Only the job owner can make payments' },
        { status: 403 }
      )
    }

    // Check if already paid
    if (job.isPaid) {
      return NextResponse.json(
        { error: 'This job has already been paid for' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Job Posting: ${job.title}`,
              description: `Payment for job posting - ${job.type}`,
            },
            unit_amount: Math.round(paymentAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${(await import('@/lib/utils/url')).getAppUrl(request)}/jobs/${jobId}?payment=success`,
      cancel_url: `${(await import('@/lib/utils/url')).getAppUrl(request)}/jobs/${jobId}?payment=cancelled`,
      metadata: {
        jobId: job.id,
        userId: profile.id,
        paymentAmount: paymentAmount.toString(),
      },
      customer_email: profile.email || user.email,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating payment session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}

