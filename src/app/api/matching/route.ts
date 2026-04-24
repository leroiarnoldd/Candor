import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Matching weights — these determine what matters most
const WEIGHTS = {
  SKILL_OVERLAP:       0.35, // 35% — most important
  PROFILE_COMPLETENESS:0.20, // 20%
  REPUTATION:          0.15, // 15%
  VERIFIED_SKILLS:     0.15, // 15%
  AVAILABILITY:        0.10, // 10%
  RESPONSE_HISTORY:    0.05, // 5%  — how quickly they respond to pitches
}

interface MatchRequest {
  required_skills: string[]
  nice_to_have_skills?: string[]
  max_salary: number
  location?: string
  remote_required?: boolean
  employment_type?: string
  min_experience?: number
  limit?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Verify company
    const { data: company } = await supabase
      .from('company_profiles')
      .select('id, plan')
      .eq('user_id', session.user.id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company profile not found' }, { status: 404 })

    const body: MatchRequest = await request.json()
    const {
      required_skills = [],
      nice_to_have_skills = [],
      max_salary,
      location,
      remote_required = false,
      employment_type,
      min_experience,
      limit = 20,
    } = body

    // Get already-pitched candidates to exclude
    const { data: existingPitches } = await supabase
      .from('pitches')
      .select('candidate_id')
      .eq('company_id', company.id)
      .not('status', 'eq', 'expired')

    const excludedIds = (existingPitches || []).map(p => p.candidate_id)

    // Base query
    let query = supabase
      .from('candidate_profiles')
      .select(`
        id, anonymous_name, current_title, years_experience,
        skills, verified_skills, location, salary_floor,
        availability, employment_types, remote_only,
        profile_completeness, reputation_score, bio,
        is_anonymous, blocked_domains, blocked_companies
      `)
      .in('availability', ['open', 'passive'])
      .lte('salary_floor', (max_salary || 999999) * 100)

    if (remote_required) query = query.eq('remote_only', true)
    if (min_experience) query = query.gte('years_experience', min_experience)
    if (required_skills.length > 0) query = query.overlaps('skills', required_skills)

    const { data: rawCandidates } = await query.limit(200)

    if (!rawCandidates) return NextResponse.json({ candidates: [], total: 0 })

    // Get company domain to check blocks
    const { data: companyUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', session.user.id)
      .single()

    const companyDomain = companyUser?.email?.split('@')[1] || ''

    // Filter out candidates who blocked this company
    const eligible = rawCandidates.filter(c => {
      if (excludedIds.includes(c.id)) return false
      if (c.blocked_domains?.includes(companyDomain)) return false
      if (c.blocked_companies?.includes(company.id)) return false
      return true
    })

    // Score each candidate
    const scored = eligible.map(candidate => {
      let score = 0
      const breakdown: Record<string, number> = {}

      // 1. Skill overlap (required + nice to have)
      const requiredOverlap = required_skills.filter(s =>
        candidate.skills.some((cs: string) => cs.toLowerCase().includes(s.toLowerCase()))
      ).length
      const niceOverlap = nice_to_have_skills.filter(s =>
        candidate.skills.some((cs: string) => cs.toLowerCase().includes(s.toLowerCase()))
      ).length

      const skillScore = required_skills.length > 0
        ? (requiredOverlap / required_skills.length) * 100
        : 50
      const niceBonus = nice_to_have_skills.length > 0
        ? (niceOverlap / nice_to_have_skills.length) * 20
        : 0

      breakdown.skills = Math.round(Math.min(100, skillScore + niceBonus))
      score += breakdown.skills * WEIGHTS.SKILL_OVERLAP

      // 2. Profile completeness
      breakdown.completeness = candidate.profile_completeness
      score += breakdown.completeness * WEIGHTS.PROFILE_COMPLETENESS

      // 3. Reputation score (0-5 → 0-100)
      breakdown.reputation = (candidate.reputation_score / 5) * 100
      score += breakdown.reputation * WEIGHTS.REPUTATION

      // 4. Verified skills bonus
      const verifiedBonus = Math.min(100, candidate.verified_skills.length * 15)
      breakdown.verified = verifiedBonus
      score += verifiedBonus * WEIGHTS.VERIFIED_SKILLS

      // 5. Availability score
      const availScore = candidate.availability === 'open' ? 100 : 60
      breakdown.availability = availScore
      score += availScore * WEIGHTS.AVAILABILITY

      // 6. Location bonus
      let locationBonus = 0
      if (location && candidate.location) {
        if (candidate.location.toLowerCase().includes(location.toLowerCase())) {
          locationBonus = 20
        }
      }
      if (candidate.remote_only && remote_required) locationBonus += 10
      score += locationBonus

      // Employment type match
      if (employment_type && candidate.employment_types?.includes(employment_type)) {
        score += 5
      }

      // Salary headroom — candidates closer to company's max get slight boost
      // (better fit, less negotiation risk)
      const salaryHeadroom = max_salary > 0
        ? (1 - candidate.salary_floor / (max_salary * 100)) * 10
        : 0
      score += Math.max(0, salaryHeadroom)

      return {
        ...candidate,
        match_score: Math.round(Math.min(100, score)),
        match_breakdown: breakdown,
        required_skills_matched: requiredOverlap,
        required_skills_total: required_skills.length,
        // Enforce anonymity
        display_name: candidate.is_anonymous ? null : candidate.anonymous_name,
      }
    })

    // Sort by match score
    scored.sort((a, b) => b.match_score - a.match_score)

    const results = scored.slice(0, limit)

    return NextResponse.json({
      candidates: results,
      total: scored.length,
      showing: results.length,
      filters: { required_skills, max_salary, location, remote_required },
      top_match_score: results[0]?.match_score || 0,
    })

  } catch (error: any) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
