import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

export const dynamic = "force-dynamic"

const MIN_PRIZE_PENCE = 20000 // £200 minimum

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: company } = await supabase
      .from('company_profiles')
      .select('id, plan, pitch_credits, company_name')
      .eq('user_id', session.user.id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // Only Growth and Enterprise can post sponsored problems
    if (!['growth', 'enterprise'].includes(company.plan)) {
      return NextResponse.json({
        error: 'Sponsored problems require a Growth or Enterprise plan.'
      }, { status: 403 })
    }

    const {
      room_slug,
      title,
      content,
      prize_amount_pounds,
      deadline_days = 14,
    } = await request.json()

    if (!room_slug || !title || !content || !prize_amount_pounds) {
      return NextResponse.json({ error: 'room_slug, title, content, and prize_amount_pounds required' }, { status: 400 })
    }

    const prizeAmountPence = Math.round(prize_amount_pounds * 100)

    if (prizeAmountPence < MIN_PRIZE_PENCE) {
      return NextResponse.json({
        error: `Minimum prize is £${MIN_PRIZE_PENCE / 100}. You entered £${prize_amount_pounds}.`
      }, { status: 400 })
    }

    // Get room
    const { data: room } = await supabase
      .from('community_rooms')
      .select('id')
      .eq('slug', room_slug)
      .single()

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    // Check monthly problem limit
    const startOfMonth = new Date()
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

    const { count: problemsThisMonth } = await supabase
      .from('community_posts')
      .select('id', { count: 'exact' })
      .eq('sponsor_company_id', company.id)
      .eq('type', 'sponsored_problem')
      .gte('created_at', startOfMonth.toISOString())

    const monthlyLimit = company.plan === 'enterprise' ? 3 : 1
    if ((problemsThisMonth || 0) >= monthlyLimit) {
      return NextResponse.json({
        error: `You have reached your monthly limit of ${monthlyLimit} sponsored problem${monthlyLimit > 1 ? 's' : ''}.`
      }, { status: 400 })
    }

    // Create Stripe payment intent to escrow the prize money
    // In production: hold funds until winner is selected
    const paymentIntent = await stripe.paymentIntents.create({
      amount: prizeAmountPence,
      currency: 'gbp',
      metadata: {
        type: 'sponsored_problem',
        company_id: company.id,
        company_name: company.company_name,
        room_slug,
      },
      description: `Sponsored problem prize: ${title}`,
    })

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + deadline_days)

    // Create the sponsored problem post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        room_id: room.id,
        author_id: session.user.id,
        type: 'sponsored_problem',
        title,
        content,
        prize_amount: prizeAmountPence,
        prize_currency: 'GBP',
        sponsor_company_id: company.id,
        problem_deadline: deadline.toISOString(),
        problem_closed: false,
        is_published: true,
      })
      .select()
      .single()

    if (postError) throw postError

    return NextResponse.json({
      success: true,
      post_id: post.id,
      prize_amount: prizeAmountPence,
      prize_formatted: `£${prize_amount_pounds}`,
      winner_receives: `£${(prizeAmountPence * 0.6 / 100).toFixed(2)}`,
      candor_fee: `£${(prizeAmountPence * 0.4 / 100).toFixed(2)}`,
      deadline: deadline.toISOString(),
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      message: `Sponsored problem posted. £${(prizeAmountPence * 0.6 / 100).toFixed(2)} will go to the winner.`,
    })

  } catch (error: any) {
    console.error('Problem creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
