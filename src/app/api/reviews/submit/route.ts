import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const {
      pitch_id,
      salary_accuracy_score,
      communication_score,
      fairness_score,
      culture_match_score,
      review_text,
    } = await request.json()

    if (!pitch_id) return NextResponse.json({ error: 'pitch_id required' }, { status: 400 })

    const scores = [salary_accuracy_score, communication_score, fairness_score, culture_match_score]
    if (scores.some(s => !s || s < 1 || s > 5)) {
      return NextResponse.json({ error: 'All scores must be between 1 and 5' }, { status: 400 })
    }

    const { data: pitch } = await supabase
      .from('pitches')
      .select('company_id, candidate_id')
      .eq('id', pitch_id)
      .single()

    if (!pitch) return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })

    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!candidateProfile || pitch.candidate_id !== candidateProfile.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const overall = Math.round((salary_accuracy_score + communication_score + fairness_score + culture_match_score) / 4)

    const { error: reviewError } = await supabase
      .from('reviews')
      .upsert({
        pitch_id,
        candidate_id: candidateProfile.id,
        company_id: pitch.company_id,
        salary_accuracy_score,
        communication_score,
        fairness_score,
        culture_match_score,
        overall_score: overall,
        review_text: review_text || null,
        is_published: true,
        is_verified: true,
        published_at: new Date().toISOString(),
      }, { onConflict: 'pitch_id' })

    if (reviewError) throw reviewError

    // Recalculate company scores
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('overall_score, salary_accuracy_score')
      .eq('company_id', pitch.company_id)
      .eq('is_published', true)

    if (allReviews && allReviews.length > 0) {
      const avgCulture = allReviews.reduce((s, r) => s + (r.overall_score || 0), 0) / allReviews.length
      const avgSalary = allReviews.reduce((s, r) => s + (r.salary_accuracy_score || 0), 0) / allReviews.length

      await supabase
        .from('company_profiles')
        .update({
          culture_score: Math.round(avgCulture * 10) / 10,
          salary_accuracy_score: Math.round(avgSalary * 10) / 10,
        })
        .eq('id', pitch.company_id)
    }

    return NextResponse.json({ success: true, overall_score: overall })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
