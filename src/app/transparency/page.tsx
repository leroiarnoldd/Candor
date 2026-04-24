'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ReportData {
  quarter: string
  generated_at: string
  overview: {
    total_pitches: number
    confirmed_hires: number
    candidate_earnings_paid_formatted: string
    sponsored_problems_completed: number
    prize_money_paid_formatted: string
    active_companies: number
  }
  top_companies: Array<{
    rank: number
    company_name: string
    culture_score: number
    salary_accuracy_score: number
    hire_rate: number
    is_verified: boolean
    ghosting_incidents: number
  }>
  ghosting_register: Array<{
    company_name: string
    incidents: number
    action_taken: string
    is_removed: boolean
  }>
  decline_data: {
    total_declines: number
    breakdown: Array<{ reason: string; count: number; percentage: number }>
    most_common_reason: string
  }
  removals_and_warnings: {
    removed: Array<{ company_name: string; reason: string; incidents: number }>
    warned: Array<{ company_name: string; warnings: number; incidents: number }>
  }
}

const DECLINE_LABELS: Record<string, string> = {
  salary_too_low: 'Salary too low',
  role_not_right: 'Role not right',
  culture_concerns: 'Culture concerns',
  timing: 'Timing',
  other: 'Other',
}

export default function TransparencyReportPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReport()
  }, [])

  async function loadReport() {
    try {
      const res = await fetch('/api/transparency')
      if (!res.ok) throw new Error('Failed to load report')
      const data = await res.json()
      setReport(data)
    } catch (err: any) {
      setError('Report data unavailable. Check back after the platform launches.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-w4">
          <div className="w-4 h-4 border-2 border-w5 border-t-candor-amber rounded-full animate-spin" />
          Loading report...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/" className="text-w4 text-sm hover:text-w2 transition-colors">← Home</Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </div>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ background: 'linear-gradient(90deg, #4B7BFF, #23D160)', height: '2px', width: '40px' }} />
            <span className="text-xs font-bold tracking-widest uppercase text-w4">Transparency Report</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            The data both giants will never publish.
          </h1>
          {report && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="amber-pill">{report.quarter}</span>
              <span className="text-xs text-w4">Generated {formatDate(report.generated_at)}</span>
              <span className="text-xs text-w4">Published publicly · Cannot be suppressed</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="candor-card p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">Report data loading soon.</h3>
            <p className="text-w4 text-sm leading-relaxed max-w-sm mx-auto">{error}</p>
          </div>
        ) : report ? (
          <div className="space-y-6">

            {/* Section 1 — Overview */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-candor-blue tracking-widest uppercase">Section 01</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Pitches sent', value: report.overview.total_pitches.toLocaleString(), color: 'text-white' },
                  { label: 'Confirmed hires', value: report.overview.confirmed_hires.toLocaleString(), color: 'text-candor-green' },
                  { label: 'Paid to candidates', value: report.overview.candidate_earnings_paid_formatted, color: 'text-candor-green' },
                  { label: 'Sponsored problems', value: report.overview.sponsored_problems_completed.toLocaleString(), color: 'text-candor-blue' },
                  { label: 'Prize money paid', value: report.overview.prize_money_paid_formatted, color: 'text-candor-blue' },
                  { label: 'Active companies', value: report.overview.active_companies.toLocaleString(), color: 'text-white' },
                ].map(stat => (
                  <div key={stat.label} className="candor-card p-4">
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-xs text-w4">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2 — Top companies */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-candor-green tracking-widest uppercase">Section 02</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">The Best Companies</h2>
              {report.top_companies.length === 0 ? (
                <div className="candor-card p-5 text-center text-w5 text-sm">
                  Company rankings will appear after hire reviews are submitted.
                </div>
              ) : (
                <div className="candor-card overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-s2 border-b border-white/10">
                    {['Rank', 'Company', 'Score', 'Hire rate', 'Status'].map(h => (
                      <div key={h} className="text-xs font-bold text-w4 uppercase tracking-wider">{h}</div>
                    ))}
                  </div>
                  {report.top_companies.slice(0, 10).map(company => (
                    <div key={company.rank} className="grid grid-cols-5 gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center">
                      <div className="text-sm font-bold text-w3">#{company.rank}</div>
                      <div className="text-sm font-semibold text-white truncate">{company.company_name}</div>
                      <div className="text-sm font-bold text-candor-green">{company.culture_score.toFixed(1)}/5</div>
                      <div className="text-sm text-w2">{company.hire_rate.toFixed(1)}%</div>
                      <div>{company.is_verified && <span className="green-pill text-[10px] px-1.5 py-0.5">✓ Verified</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3 — Ghosting register */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-candor-red tracking-widest uppercase">Section 03</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">The Ghosting Register</h2>
              <p className="text-sm text-w4 mb-4 leading-relaxed">Every company that failed to respond to a candidate this quarter. Named. Permanent.</p>

              {report.ghosting_register.length === 0 ? (
                <div className="candor-card p-5 text-center">
                  <div className="text-candor-green font-bold mb-1">Zero ghosting incidents this quarter.</div>
                  <div className="text-xs text-w4">Every company responded to every candidate on time.</div>
                </div>
              ) : (
                <div className="candor-card overflow-hidden">
                  <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-s2 border-b border-white/10">
                    {['Company', 'Incidents', 'Action', 'Status'].map(h => (
                      <div key={h} className="text-xs font-bold text-w4 uppercase tracking-wider">{h}</div>
                    ))}
                  </div>
                  {report.ghosting_register.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center">
                      <div className="text-sm font-semibold text-white truncate">{item.company_name}</div>
                      <div className="text-sm font-bold text-candor-red">{item.incidents}</div>
                      <div className="text-xs text-w3 capitalize">{item.action_taken?.replace('_', ' ')}</div>
                      <div>
                        {item.is_removed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-candor-red/20 text-candor-red border border-candor-red/30">REMOVED</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-candor-amber/20 text-candor-amber border border-candor-amber/30">WARNING</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 5 — Decline data */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-candor-purple tracking-widest uppercase">Section 05</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">The Decline Data</h2>
              <p className="text-sm text-w4 mb-4 leading-relaxed">
                Why candidates said no this quarter. {report.decline_data.total_declines.toLocaleString()} structured decline responses analysed.
              </p>

              {report.decline_data.breakdown.length === 0 ? (
                <div className="candor-card p-5 text-center text-w5 text-sm">
                  Decline data will appear once candidates start giving feedback.
                </div>
              ) : (
                <div className="candor-card p-5 space-y-3">
                  {report.decline_data.breakdown.map(item => (
                    <div key={item.reason}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-w2">{DECLINE_LABELS[item.reason] || item.reason}</span>
                        <span className="text-sm font-bold text-white">{item.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${item.percentage}%`, background: '#A78BFA' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 6 — Removals */}
            {(report.removals_and_warnings.removed.length > 0 || report.removals_and_warnings.warned.length > 0) && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-candor-red tracking-widest uppercase">Section 06</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <h2 className="text-xl font-bold text-white mb-4">Removals and Warnings</h2>

                {report.removals_and_warnings.removed.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-bold text-candor-red mb-2">Removed from platform</div>
                    <div className="space-y-2">
                      {report.removals_and_warnings.removed.map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-candor-red/5 border border-candor-red/20 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">{c.company_name}</div>
                            <div className="text-xs text-w4 mt-0.5">{c.reason}</div>
                          </div>
                          <span className="text-xs font-bold text-candor-red">{c.incidents} incidents</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.removals_and_warnings.warned.length > 0 && (
                  <div>
                    <div className="text-sm font-bold text-candor-amber mb-2">Formal warnings issued</div>
                    <div className="space-y-2">
                      {report.removals_and_warnings.warned.slice(0, 10).map((c, i) => (
                        <div key={i} className="p-3 rounded-xl bg-candor-amber/5 border border-candor-amber/20 flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">{c.company_name}</div>
                          <span className="text-xs font-bold text-candor-amber">{c.incidents} incidents · {c.warnings} warning{c.warnings > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Footer note */}
            <div className="p-5 rounded-2xl bg-s1 border border-white/10">
              <p className="text-xs text-w4 leading-relaxed">
                All data in this report is drawn directly from the Candor platform. Company scores are calculated from verified post-hire candidate reviews. Ghosting incidents are verified by platform timestamp data. This report is published freely and cannot be suppressed, purchased away, or modified by any company listed within it.
              </p>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  )
}
