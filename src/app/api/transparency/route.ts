import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quarter = searchParams.get('quarter') || getCurrentQuarter()

    const { start, end } = getQuarterDates(quarter)

    // Run all queries in parallel
    const [
      pitchStats,
      hireStats,
      walletStats,
      sponsoredStats,
      topCompanies,
      ghostingData,
      declineData,
      removalsData,
    ] = await Promise.all([

      // Total pitches this quarter
      supabaseAdmin
        .from('pitches')
        .select('id', { count: 'exact' })
        .gte('sent_at', start)
        .lte('sent_at', end),

      // Confirmed hires this quarter
      supabaseAdmin
        .from('pitches')
        .select('id', { count: 'exact' })
        .eq('status', 'hired')
        .gte('hired_at', start)
        .lte('hired_at', end),

      // Candidate earnings paid this quarter
      supabaseAdmin
        .from('wallet_transactions')
        .select('amount')
        .eq('status', 'completed')
        .gt('amount', 0)
        .neq('type', 'withdrawal')
        .gte('created_at', start)
        .lte('created_at', end),

      // Sponsored problems this quarter
      supabaseAdmin
        .from('community_posts')
        .select('prize_amount', { count: 'exact' })
        .eq('type', 'sponsored_problem')
        .eq('problem_closed', true)
        .gte('created_at', start)
        .lte('created_at', end),

      // Top 20 companies by culture score
      supabaseAdmin
        .from('company_profiles')
        .select('company_name, culture_score, salary_accuracy_score, hire_rate, ghosting_incidents, is_candor_verified')
        .eq('is_active', true)
        .eq('is_banned', false)
        .gt('hire_rate', 0)
        .order('culture_score', { ascending: false })
        .limit(20),

      // Ghosting incidents this quarter
      supabaseAdmin
        .from('ghosting_incidents')
        .select('*, company:company_profiles(company_name, is_banned)')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false }),

      // Decline reasons this quarter (aggregated)
      supabaseAdmin
        .from('pitches')
        .select('decline_reason')
        .eq('status', 'declined')
        .not('decline_reason', 'is', null)
        .gte('responded_at', start)
        .lte('responded_at', end),

      // Removals and warnings
      supabaseAdmin
        .from('company_profiles')
        .select('company_name, ban_reason, warnings, ghosting_incidents')
        .or('is_banned.eq.true,warnings.gte.1')
        .order('ghosting_incidents', { ascending: false })
        .limit(50),
    ])

    // Process earnings
    const totalEarnings = (walletStats.data || [])
      .reduce((sum, tx) => sum + (tx.amount || 0), 0)

    // Process sponsored prize money
    const totalPrizeMoney = (sponsoredStats.data || [])
      .reduce((sum, post) => sum + ((post.prize_amount || 0) * 0.6), 0) // 60% goes to winners

    // Process decline reasons
    const declineCounts: Record<string, number> = {}
    ;(declineData.data || []).forEach(p => {
      const reason = p.decline_reason || 'other'
      declineCounts[reason] = (declineCounts[reason] || 0) + 1
    })
    const totalDeclines = Object.values(declineCounts).reduce((a, b) => a + b, 0)
    const declineBreakdown = Object.entries(declineCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalDeclines > 0 ? Math.round((count / totalDeclines) * 100) : 0,
    })).sort((a, b) => b.count - a.count)

    // Process ghosting register
    const ghostingRegister = Object.values(
      (ghostingData.data || []).reduce((acc: any, incident: any) => {
        const companyId = incident.company_id
        if (!acc[companyId]) {
          acc[companyId] = {
            company_name: incident.company?.company_name || 'Unknown',
            incidents: 0,
            action_taken: incident.action_taken,
            is_removed: incident.company?.is_banned || false,
          }
        }
        acc[companyId].incidents++
        return acc
      }, {})
    ).sort((a: any, b: any) => b.incidents - a.incidents)

    const report = {
      quarter,
      generated_at: new Date().toISOString(),

      // Section 1 — Platform overview
      overview: {
        total_pitches: pitchStats.count || 0,
        confirmed_hires: hireStats.count || 0,
        candidate_earnings_paid_pence: totalEarnings,
        candidate_earnings_paid_formatted: `£${(totalEarnings / 100).toLocaleString()}`,
        sponsored_problems_completed: sponsoredStats.count || 0,
        prize_money_paid_pence: totalPrizeMoney,
        prize_money_paid_formatted: `£${(totalPrizeMoney / 100).toLocaleString()}`,
        active_companies: (topCompanies.data || []).length,
      },

      // Section 2 — Top companies
      top_companies: (topCompanies.data || []).map((c, i) => ({
        rank: i + 1,
        company_name: c.company_name,
        culture_score: c.culture_score,
        salary_accuracy_score: c.salary_accuracy_score,
        hire_rate: c.hire_rate,
        is_verified: c.is_candor_verified,
        ghosting_incidents: c.ghosting_incidents,
      })),

      // Section 3 — Ghosting register
      ghosting_register: ghostingRegister,
      total_ghosting_incidents: (ghostingData.count || 0),

      // Section 4 — Salary transparency index
      // TODO: Calculate average salary accuracy deviation
      salary_transparency: {
        note: 'Salary accuracy scores calculated from post-hire candidate reviews comparing pitched salary to actual offer.',
        companies_with_score: (topCompanies.data || []).filter(c => c.salary_accuracy_score > 0).length,
      },

      // Section 5 — Decline data
      decline_data: {
        total_declines: totalDeclines,
        breakdown: declineBreakdown,
        most_common_reason: declineBreakdown[0]?.reason || 'none',
      },

      // Section 6 — Removals and warnings
      removals_and_warnings: {
        removed: (removalsData.data || []).filter(c => c.ban_reason).map(c => ({
          company_name: c.company_name,
          reason: c.ban_reason,
          incidents: c.ghosting_incidents,
        })),
        warned: (removalsData.data || []).filter(c => !c.ban_reason && (c.warnings || 0) >= 1).map(c => ({
          company_name: c.company_name,
          warnings: c.warnings,
          incidents: c.ghosting_incidents,
        })),
      },
    }

    return NextResponse.json(report)

  } catch (error: any) {
    console.error('Transparency report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getCurrentQuarter(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const q = Math.floor(month / 3) + 1
  return `${year}-Q${q}`
}

function getQuarterDates(quarter: string): { start: string; end: string } {
  const [year, q] = quarter.split('-Q')
  const quarterNum = parseInt(q)
  const yearNum = parseInt(year)

  const starts = [0, 3, 6, 9]
  const startMonth = starts[quarterNum - 1]
  const endMonth = startMonth + 2

  const start = new Date(yearNum, startMonth, 1).toISOString()
  const end = new Date(yearNum, endMonth + 1, 0, 23, 59, 59).toISOString()

  return { start, end }
}
