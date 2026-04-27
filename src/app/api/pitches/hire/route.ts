import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PAYMENTS } from '@/lib/stripe'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { pitch_id, confirming_as } = await request.json()

    if (!pitch_id || !confirming_as) {
      return NextResponse.json({ error: 'pitch_id and confirming_as required' }, { status: 400 })
    }

    if (!['candidate', 'company'].includes(confirming_as)) {
      return NextResponse.json({ error: 'confirming_as must be candidate or company' }, { status: 400 })
    }

    // Get full pitch
    const { data: pitch } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitch_id)
      .single()

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Verify the confirming party owns this pitch
    if (confirming_as === 'candidate') {
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!candidateProfile || pitch.candidate_id !== candidateProfile.id) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
      }

      await supabase
        .from('pitches')
        .update({ hire_confirmed_candidate: true })
        .eq('id', pitch_id)

    } else {
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!companyProfile || pitch.company_id !== companyProfile.id) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
      }

      await supabase
        .from('pitches')
        .update({ hire_confirmed_company: true })
        .eq('id', pitch_id)
    }

    // Refetch to check if both sides confirmed
    const { data: updatedPitch } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitch_id)
      .single()

    const bothConfirmed = updatedPitch?.hire_confirmed_candidate && updatedPitch?.hire_confirmed_company

    if (bothConfirmed && !updatedPitch?.hire_payment_released) {
      // Mark as hired
      await supabase
        .from('pitches')
        .update({
          status: 'hired',
          hired_at: new Date().toISOString(),
          hire_confirmed_at: new Date().toISOString(),
          hire_payment_sent: true,
          hire_payment_released: true,
        })
        .eq('id', pitch_id)

      // Get candidate user_id
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('user_id')
        .eq('id', updatedPitch.candidate_id)
        .single()

      if (candidateProfile) {
        // Determine payment amount based on employment type
        const paymentAmount = updatedPitch.employment_type === 'freelance'
          ? PAYMENTS.HIRE_CONFIRMED - 500  // £25 for freelance
          : PAYMENTS.HIRE_CONFIRMED        // £30 for employment

        // Create hire payment transaction
        // NOTE: In production this would be held for 30 days
        // before releasing to verify employment
        await supabase
          .from('wallet_transactions')
          .insert({
            user_id: candidateProfile.user_id,
            candidate_id: updatedPitch.candidate_id,
            amount: paymentAmount,
            type: 'hire_payment',
            status: 'pending', // Pending 30-day verification
            pitch_id: pitch_id,
            description: `£${(paymentAmount / 100).toFixed(2)} hire payment — releases after 30-day verification`,
          })

        // Notify candidate
        await supabase
          .from('notifications')
          .insert({
            user_id: candidateProfile.user_id,
            type: 'hire_confirmed',
            title: 'Hire confirmed',
            message: `Both you and the company have confirmed this hire. £${(paymentAmount / 100).toFixed(2)} will be released to your wallet after 30-day employment verification.`,
            action_url: '/wallet',
          })
      }

      return NextResponse.json({
        success: true,
        both_confirmed: true,
        message: 'Hire confirmed by both parties. Payment of £30 will be released after 30-day employment verification.',
        payment_amount: PAYMENTS.HIRE_CONFIRMED,
      })
    }

    return NextResponse.json({
      success: true,
      both_confirmed: false,
      message: `Your confirmation recorded. Waiting for ${confirming_as === 'candidate' ? 'company' : 'candidate'} to confirm.`,
    })

  } catch (error: any) {
    console.error('Hire confirmation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
