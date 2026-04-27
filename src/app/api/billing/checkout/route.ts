import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, PLAN_PRICES } from '@/lib/stripe'

export const dynamic = "force-dynamic"

const PLAN_STRIPE_PRICES: Record<string, { amount: number; credits: number; name: string }> = {
  starter: {
    amount: PLAN_PRICES.STARTER,
    credits: 20,
    name: 'Candor Starter',
  },
  growth: {
    amount: PLAN_PRICES.GROWTH,
    credits: 75,
    name: 'Candor Growth',
  },
  enterprise: {
    amount: PLAN_PRICES.ENTERPRISE,
    credits: 9999,
    name: 'Candor Enterprise',
  },
  candidate_pro: {
    amount: PLAN_PRICES.CANDIDATE_PRO,
    credits: 0,
    name: 'Candor Pro',
  },
  candidate_expert: {
    amount: PLAN_PRICES.CANDIDATE_EXPERT,
    credits: 0,
    name: 'Candor Expert',
  },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { plan, user_type } = await request.json()

    if (!plan || !PLAN_STRIPE_PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLAN_STRIPE_PRICES[plan]

    // Get profile ID for metadata
    let profileId = ''
    if (user_type === 'company') {
      const { data } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      profileId = data?.id || ''
    } else {
      const { data } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      profileId = data?.id || ''
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.getcandor.net'

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: planConfig.name,
              description: user_type === 'company'
                ? `${planConfig.credits === 9999 ? 'Unlimited' : planConfig.credits} pitch credits per month`
                : `Candor ${plan === 'candidate_pro' ? 'Pro' : 'Expert'} features`,
            },
            unit_amount: planConfig.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: session.user.id,
        profile_id: profileId,
        plan,
        pitch_credits: planConfig.credits.toString(),
        user_type,
      },
      customer_email: session.user.email,
      success_url: `${appUrl}/billing?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/billing?cancelled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id,
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
