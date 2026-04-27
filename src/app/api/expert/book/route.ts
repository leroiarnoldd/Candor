import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PAYMENTS } from '@/lib/stripe'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const {
      expert_candidate_id,
      session_type,       // 'one_to_one' | 'office_hours'
      duration_minutes,   // 30, 60, 90
      message,
      proposed_time,
    } = await request.json()

    if (!expert_candidate_id || !session_type || !duration_minutes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get expert profile
    const { data: expert } = await supabase
      .from('candidate_profiles')
      .select('id, user_id, is_expert, expert_rate, current_title, anonymous_name')
      .eq('id', expert_candidate_id)
      .single()

    if (!expert) return NextResponse.json({ error: 'Expert not found' }, { status: 404 })
    if (!expert.is_expert) return NextResponse.json({ error: 'This candidate is not a Candor Expert' }, { status: 400 })

    const hourlyRate = expert.expert_rate || 15000 // Default £150/hour
    const sessionRate = Math.round((hourlyRate * duration_minutes) / 60)
    const candorFee = Math.round(sessionRate * PAYMENTS.EXPERT_TAKE_RATE)
    const expertEarns = sessionRate - candorFee

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.getcandor.net'

    // Create Stripe checkout for the session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Expert session with ${expert.current_title}`,
            description: `${duration_minutes}-minute ${session_type.replace('_', ' ')} session`,
          },
          unit_amount: sessionRate,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'expert_session',
        expert_candidate_id,
        booker_user_id: session.user.id,
        session_type,
        duration_minutes: duration_minutes.toString(),
        expert_earns: expertEarns.toString(),
        candor_fee: candorFee.toString(),
        message: message || '',
        proposed_time: proposed_time || '',
      },
      customer_email: session.user.email,
      success_url: `${appUrl}/expert/booked?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/expert`,
    })

    // Notify expert of booking request
    await supabase.from('notifications').insert({
      user_id: expert.user_id,
      type: 'system',
      title: 'New session booking request',
      message: `Someone has requested a ${duration_minutes}-minute expert session with you. You will earn £${(expertEarns / 100).toFixed(2)}.`,
      action_url: '/expert',
    })

    return NextResponse.json({
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id,
      session_rate: sessionRate,
      session_rate_formatted: `£${(sessionRate / 100).toFixed(2)}`,
      expert_earns: expertEarns,
      expert_earns_formatted: `£${(expertEarns / 100).toFixed(2)}`,
      candor_fee: candorFee,
      candor_fee_formatted: `£${(candorFee / 100).toFixed(2)}`,
      candor_take_rate: `${PAYMENTS.EXPERT_TAKE_RATE * 100}%`,
    })

  } catch (error: any) {
    console.error('Expert booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
