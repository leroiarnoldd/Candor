import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, PAYMENTS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { amount_pence } = await request.json()

    // Get candidate profile and current balance
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!candidateProfile) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    // Minimum withdrawal check
    if (candidateProfile.wallet_balance < PAYMENTS.MIN_WITHDRAWAL) {
      return NextResponse.json({
        error: `Minimum withdrawal is £${(PAYMENTS.MIN_WITHDRAWAL / 100).toFixed(2)}. Your balance is £${(candidateProfile.wallet_balance / 100).toFixed(2)}.`
      }, { status: 400 })
    }

    const withdrawAmount = amount_pence || candidateProfile.wallet_balance

    if (withdrawAmount > candidateProfile.wallet_balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    if (withdrawAmount < PAYMENTS.MIN_WITHDRAWAL) {
      return NextResponse.json({
        error: `Minimum withdrawal is £${(PAYMENTS.MIN_WITHDRAWAL / 100).toFixed(2)}.`
      }, { status: 400 })
    }

    // In production: Create Stripe Connect transfer
    // The candidate needs a connected Stripe account for payouts
    // For now we create the transaction record and mark as pending
    // Full Stripe Connect implementation requires:
    // 1. Candidate to complete Stripe identity verification
    // 2. Connected account to be created
    // 3. Transfer to be initiated

    // Create withdrawal transaction
    const { data: transaction } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: session.user.id,
        candidate_id: candidateProfile.id,
        amount: -withdrawAmount, // Negative = debit
        type: 'withdrawal',
        status: 'pending',
        description: `Withdrawal of £${(withdrawAmount / 100).toFixed(2)} to bank account`,
      })
      .select()
      .single()

    // Deduct from wallet balance
    await supabase
      .from('candidate_profiles')
      .update({
        wallet_balance: candidateProfile.wallet_balance - withdrawAmount,
      })
      .eq('id', candidateProfile.id)

    // Notify candidate
    await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type: 'payment_ready',
        title: 'Withdrawal initiated',
        message: `Your withdrawal of £${(withdrawAmount / 100).toFixed(2)} has been initiated. Funds arrive within 1-2 business days.`,
        action_url: '/wallet',
      })

    return NextResponse.json({
      success: true,
      transaction_id: transaction?.id,
      amount_withdrawn: withdrawAmount,
      new_balance: candidateProfile.wallet_balance - withdrawAmount,
      message: `Withdrawal of £${(withdrawAmount / 100).toFixed(2)} initiated. Arrives within 1-2 business days.`,
    })

  } catch (error: any) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
