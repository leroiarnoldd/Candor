import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PAYMENTS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { pitch_id, decline_reason, decline_feedback } = await request.json()

    if (!pitch_id || !decline_reason) {
      return NextResponse.json({ error: 'pitch_id and decline_reason required' }, { status: 400 })
    }

    const validReasons = ['salary_too_low', 'role_not_right', 'culture_concerns', 'timing', 'other']
    if (!validReasons.includes(decline_reason)) {
      return NextResponse.json({ error: 'Invalid decline reason' }, { status: 400 })
    }

    // Get pitch and verify ownership
    const { data: pitch } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitch_id)
      .single()

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!candidateProfile || pitch.candidate_id !== candidateProfile.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    // Prevent double payment
    if (pitch.feedback_payment_sent) {
      return NextResponse.json({ message: 'Already processed' }, { status: 200 })
    }

    // Anti-gaming check — detect suspiciously identical feedback patterns
    const { data: recentFeedback } = await supabase
      .from('pitches')
      .select('decline_reason')
      .eq('candidate_id', candidateProfile.id)
      .eq('status', 'declined')
      .gte('responded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (recentFeedback) {
      const sameReasonCount = recentFeedback.filter(p => p.decline_reason === decline_reason).length
      // Flag if more than 10 identical reasons in 7 days — unusual pattern
      if (sameReasonCount > 10) {
        // Log for review but still process — don't block legitimate users
        console.warn(`High frequency same decline reason for candidate ${candidateProfile.id}`)
      }
    }

    // Update pitch
    await supabase
      .from('pitches')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
        decline_reason,
        decline_feedback: decline_feedback || null,
        feedback_payment_sent: true,
      })
      .eq('id', pitch_id)

    // Create wallet transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: session.user.id,
        candidate_id: candidateProfile.id,
        amount: PAYMENTS.PITCH_FEEDBACK,
        type: 'pitch_feedback',
        status: 'completed',
        pitch_id: pitch_id,
        description: `£${(PAYMENTS.PITCH_FEEDBACK / 100).toFixed(2)} for structured decline feedback`,
      })

    // Update company's decline data stats
    await supabase
      .from('company_profiles')
      .select('id')
      .eq('id', pitch.company_id)

    return NextResponse.json({
      success: true,
      message: `Feedback sent. £${(PAYMENTS.PITCH_FEEDBACK / 100).toFixed(2)} added to your wallet.`,
      amount: PAYMENTS.PITCH_FEEDBACK,
    })

  } catch (error: any) {
    console.error('Pitch feedback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
