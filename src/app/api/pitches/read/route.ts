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

    const { pitch_id } = await request.json()
    if (!pitch_id) {
      return NextResponse.json({ error: 'pitch_id required' }, { status: 400 })
    }

    // Get the pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('*, candidate:candidate_profiles(*)')
      .eq('id', pitch_id)
      .single()

    if (pitchError || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Verify this candidate owns this pitch
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!candidateProfile || pitch.candidate_id !== candidateProfile.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    // Only trigger if pitch is in 'sent' status and payment not already sent
    if (pitch.status !== 'sent' || pitch.read_payment_sent) {
      return NextResponse.json({ message: 'Already processed' }, { status: 200 })
    }

    // Update pitch status to read
    await supabase
      .from('pitches')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
        read_payment_sent: true,
      })
      .eq('id', pitch_id)

    // Create wallet transaction (pending — releases after 48 hours)
    // In production this would be triggered by a cron job after 48 hours
    // For now we create it as pending
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: session.user.id,
        candidate_id: candidateProfile.id,
        amount: PAYMENTS.PITCH_READ,
        type: 'pitch_read',
        status: 'pending',
        pitch_id: pitch_id,
        description: `£${(PAYMENTS.PITCH_READ / 100).toFixed(2)} for reading pitch`,
      })

    return NextResponse.json({
      success: true,
      message: 'Pitch marked as read. Payment of £2.70 pending — arrives in your wallet in 48 hours.',
      amount: PAYMENTS.PITCH_READ,
    })

  } catch (error: any) {
    console.error('Pitch read error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
