import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Verify company
    const { data: company } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })
    }

    const {
      skills = [],
      location,
      max_salary,
      availability = 'open',
      employment_types = [],
      remote_only,
      min_experience,
      limit = 20,
      offset = 0,
    } = await request.json()

    // Build query
    let query = supabase
      .from('candidate_profiles')
      .select(`
        id,
        anonymous_name,
        current_title,
        years_experience,
        skills,
        location,
        salary_floor,
        availability,
        employment_types,
        remote_only,
        profile_completeness,
        reputation_score,
        verified_skills,
        is_anonymous,
        bio
      `)
      .eq('availability', availability)
      .neq('user_id', session.user.id)

    // Salary filter — only show candidates within budget
    if (max_salary) {
      query = query.lte('salary_floor', max_salary * 100)
    }

    // Skills filter
    if (skills.length > 0) {
      query = query.overlaps('skills', skills)
    }

    // Location filter
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Remote filter
    if (remote_only) {
      query = query.eq('remote_only', true)
    }

    // Experience filter
    if (min_experience) {
      query = query.gte('years_experience', min_experience)
    }

    // Employment type filter
    if (employment_types.length > 0) {
      query = query.overlaps('employment_types', employment_types)
    }

    // Exclude candidates the company has already pitched
    const { data: existingPitches } = await supabase
      .from('pitches')
      .select('candidate_id')
      .eq('company_id', company.id)
      .not('status', 'eq', 'expired')

    if (existingPitches && existingPitches.length > 0) {
      const pitchedIds = existingPitches.map(p => p.candidate_id)
      query = query.not('id', 'in', `(${pitchedIds.join(',')})`)
    }

    // Exclude candidates who have blocked this company's domain
    // This is handled application-side for privacy

    const { data: candidates, error } = await query
      .order('profile_completeness', { ascending: false })
      .order('reputation_score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Apply matching score to each candidate
    const scoredCandidates = (candidates || []).map(candidate => {
      let score = 0

      // Profile completeness (max 30 points)
      score += (candidate.profile_completeness / 100) * 30

      // Skill overlap (max 40 points)
      if (skills.length > 0) {
        const overlap = candidate.skills.filter((s: string) =>
          skills.some((qs: string) => s.toLowerCase().includes(qs.toLowerCase()))
        ).length
        score += Math.min(40, (overlap / skills.length) * 40)
      }

      // Reputation score (max 20 points)
      score += (candidate.reputation_score / 5) * 20

      // Verified skills bonus (max 10 points)
      score += Math.min(10, candidate.verified_skills.length * 2)

      return {
        ...candidate,
        match_score: Math.round(score),
        // Enforce anonymity — never return identifying info
        display_name: candidate.is_anonymous ? null : candidate.anonymous_name,
      }
    }).sort((a, b) => b.match_score - a.match_score)

    return NextResponse.json({
      candidates: scoredCandidates,
      total: scoredCandidates.length,
      filters_applied: { skills, location, max_salary, availability, employment_types },
    })

  } catch (error: any) {
    console.error('Candidate search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
