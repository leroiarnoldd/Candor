import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { problem_id, winner_post_id } = await request.json()
    if (!problem_id || !winner_post_id) {
      return NextResponse.json({ error: 'problem_id and winner_post_id required' }, { status: 400 })
    }

    // Get the problem
    const { data: problem } = await supabase
      .from('community_posts')
      .select('*, sponsor_company:company_profiles(user_id, company_name)')
      .eq('id', problem_id)
      .eq('type', 'sponsored_problem')
      .single()

    if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 })

    // Verify the company owns this problem
    const { data: company } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!company || problem.sponsor_company_id !== company.id) {
      return NextResponse.json({ error: 'Unauthorised — only the sponsoring company can select a winner' }, { status: 403 })
    }

    if (problem.problem_closed) {
      return NextResponse.json({ error: 'This problem is already closed' }, { status: 400 })
    }

    // Get the winning answer and its author
    const { data: winningPost } = await supabase
      .from('community_posts')
      .select('*, author:users(id)')
      .eq('id', winner_post_id)
      .eq('parent_id', problem_id)
      .single()

    if (!winningPost) return NextResponse.json({ error: 'Winning post not found' }, { status: 404 })

    // Get winner's candidate profile
    const { data: winnerProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, user_id')
      .eq('user_id', winningPost.author_id)
      .single()

    const prizeAmount = problem.prize_amount || 0
    const winnerAmount = Math.round(prizeAmount * 0.6)
    const candorAmount = prizeAmount - winnerAmount

    // Mark problem as closed with winner
    await supabaseAdmin
      .from('community_posts')
      .update({
        problem_closed: true,
        problem_winner_id: winnerProfile?.id || null,
      })
      .eq('id', problem_id)

    // Mark winning answer as top answer
    await supabaseAdmin
      .from('community_posts')
      .update({ is_top_answer: true })
      .eq('id', winner_post_id)

    // Pay the winner
    if (winnerProfile) {
      await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: winnerProfile.user_id,
          candidate_id: winnerProfile.id,
          amount: winnerAmount,
          type: 'sponsored_problem',
          status: 'completed',
          description: `Won sponsored problem: ${problem.title} — ${problem.sponsor_company?.company_name}`,
        })

      // Notify winner
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: winnerProfile.user_id,
          type: 'payment_received',
          title: 'You won a sponsored problem',
          message: `${problem.sponsor_company?.company_name} selected your answer as the winner. £${(winnerAmount / 100).toFixed(2)} has been added to your wallet.`,
          action_url: '/wallet',
        })
    }

    // Notify all other respondents
    const { data: otherAnswers } = await supabaseAdmin
      .from('community_posts')
      .select('author_id')
      .eq('parent_id', problem_id)
      .neq('id', winner_post_id)

    for (const answer of otherAnswers || []) {
      if (answer.author_id !== winningPost.author_id) {
        await supabaseAdmin.from('notifications').insert({
          user_id: answer.author_id,
          type: 'system',
          title: 'Sponsored problem closed',
          message: `${problem.sponsor_company?.company_name} has selected a winner for "${problem.title}". Thank you for contributing.`,
          action_url: `/community`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      winner_paid: winnerAmount,
      winner_formatted: `£${(winnerAmount / 100).toFixed(2)}`,
      candor_fee: candorAmount,
      message: `Winner selected. £${(winnerAmount / 100).toFixed(2)} paid to winner immediately.`,
    })

  } catch (error: any) {
    console.error('Winner selection error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
