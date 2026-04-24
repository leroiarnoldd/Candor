import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { referral_code } = await request.json()
    if (!referral_code) return NextResponse.json({ error: 'referral_code required' }, { status: 400 })

    // Find referrer by code
    // In production: store referral codes on profiles
    // For now: referral code is first 8 chars of user ID uppercased
    const referrerId = referral_code.toLowerCase()

    const { data: referrerProfile } = await supabase
      .from('candidate_profiles')
      .select('id, user_id')
      .eq('user_id', referrerId)
      .single()

    if (!referrerProfile) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Make sure they are not referring themselves
    if (referrerProfile.user_id === session.user.id) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
    }

    // Record the referral
    // In production: store in a referrals table
    // For now: add a notification to the referrer
    await supabase.from('notifications').insert({
      user_id: referrerProfile.user_id,
      type: 'system',
      title: 'Someone used your referral link',
      message: 'A new professional joined Candor using your referral link. You will earn £5 when they confirm their first hire.',
      action_url: '/wallet',
    })

    return NextResponse.json({
      success: true,
      message: 'Referral recorded. Your referrer will earn £5 when you confirm your first hire.',
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Generate referral code from user ID
    const referralCode = session.user.id.slice(0, 8).toUpperCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.getcandor.net'
    const referralUrl = `${appUrl}/auth/signup?ref=${referralCode}`

    return NextResponse.json({
      referral_code: referralCode,
      referral_url: referralUrl,
      earn_amount: 500, // £5 in pence
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
