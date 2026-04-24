'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Admin emails — only these addresses can access admin
const ADMIN_EMAILS = ['resonstudios@gmail.com']

interface AdminStats {
  total_candidates: number
  total_companies: number
  total_pitches: number
  total_hires: number
  total_earnings_paid: number
  pending_verifications: number
  ghosting_incidents: number
  banned_companies: number
  active_companies: number
  new_signups_today: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentPitches, setRecentPitches] = useState<any[]>([])
  const [recentSignups, setRecentSignups] = useState<any[]>([])
  const [flaggedCompanies, setFlaggedCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorised, setUnauthorised] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      setUnauthorised(true)
      setLoading(false)
      return
    }
    loadAdminData()
  }

  async function loadAdminData() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      candidatesRes,
      companiesRes,
      pitchesRes,
      hiresRes,
      earningsRes,
      ghostingRes,
      bannedRes,
      signupsRes,
      recentPitchesRes,
      flaggedRes,
    ] = await Promise.all([
      supabase.from('candidate_profiles').select('id', { count: 'exact' }),
      supabase.from('company_profiles').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('pitches').select('id', { count: 'exact' }),
      supabase.from('pitches').select('id', { count: 'exact' }).eq('status', 'hired'),
      supabase.from('wallet_transactions').select('amount').eq('status', 'completed').gt('amount', 0).neq('type', 'withdrawal'),
      supabase.from('ghosting_incidents').select('id', { count: 'exact' }),
      supabase.from('company_profiles').select('id', { count: 'exact' }).eq('is_banned', true),
      supabase.from('users').select('id', { count: 'exact' }).gte('created_at', today.toISOString()),
      supabase.from('pitches').select('*, company:company_profiles(company_name), candidate:candidate_profiles(current_title)').order('created_at', { ascending: false }).limit(5),
      supabase.from('company_profiles').select('*').gte('ghosting_incidents', 3).eq('is_banned', false).order('ghosting_incidents', { ascending: false }).limit(10),
    ])

    const totalEarnings = (earningsRes.data || []).reduce((s, t) => s + (t.amount || 0), 0)

    setStats({
      total_candidates: candidatesRes.count || 0,
      total_companies: companiesRes.count || 0,
      total_pitches: pitchesRes.count || 0,
      total_hires: hiresRes.count || 0,
      total_earnings_paid: totalEarnings,
      pending_verifications: 0,
      ghosting_incidents: ghostingRes.count || 0,
      banned_companies: bannedRes.count || 0,
      active_companies: companiesRes.count || 0,
      new_signups_today: signupsRes.count || 0,
    })

    if (recentPitchesRes.data) setRecentPitches(recentPitchesRes.data)
    if (flaggedRes.data) setFlaggedCompanies(flaggedRes.data)
    setLoading(false)
  }

  async function banCompany(companyId: string, reason: string) {
    await supabase
      .from('company_profiles')
      .update({ is_banned: true, is_active: false, ban_reason: reason })
      .eq('id', companyId)
    loadAdminData()
  }

  function formatCurrency(pence: number) {
    return `£${(pence / 100).toLocaleString()}`
  }

  function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
    </div>
  )

  if (unauthorised) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <div className="text-4xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-white mb-3">Unauthorised</h1>
      <p className="text-w4 text-sm mb-6">This area is restricted to Candor administrators.</p>
      <Link href="/dashboard/candidate" className="candor-btn-primary px-5">Go to dashboard</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
          <span className="text-candor-red font-bold text-xs ml-1">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/transparency" className="text-xs text-w4 hover:text-w2 transition-colors">Transparency Report</Link>
          <Link href="/dashboard/candidate" className="text-xs text-w4 hover:text-w2 transition-colors">Exit Admin</Link>
        </div>
      </nav>

      <div className="pt-14 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Admin</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview.</h1>
        </div>

        {stats && (
          <>
            {/* Core stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Candidates', value: stats.total_candidates.toLocaleString(), color: 'text-candor-blue', sub: `+${stats.new_signups_today} today` },
                { label: 'Active Companies', value: stats.active_companies.toLocaleString(), color: 'text-candor-green', sub: `${stats.banned_companies} banned` },
                { label: 'Total Pitches', value: stats.total_pitches.toLocaleString(), color: 'text-white', sub: `${stats.total_hires} hires` },
                { label: 'Paid to Candidates', value: formatCurrency(stats.total_earnings_paid), color: 'text-candor-green', sub: 'All time' },
              ].map(s => (
                <div key={s.label} className="candor-card p-4">
                  <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-xs font-semibold text-w3">{s.label}</div>
                  <div className="text-xs text-w5 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Alert stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Ghosting incidents', value: stats.ghosting_incidents, color: stats.ghosting_incidents > 0 ? 'text-candor-red' : 'text-candor-green', urgent: stats.ghosting_incidents > 0 },
                { label: 'Companies flagged', value: flaggedCompanies.length, color: flaggedCompanies.length > 0 ? 'text-candor-amber' : 'text-candor-green', urgent: flaggedCompanies.length > 0 },
                { label: 'Banned companies', value: stats.banned_companies, color: 'text-w3', urgent: false },
              ].map(s => (
                <div key={s.label} className={`candor-card p-4 ${s.urgent ? 'border-candor-red/30' : ''}`}>
                  <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-xs font-semibold text-w3">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent pitches */}
          <div className="candor-card p-5">
            <div className="candor-label mb-4">Recent pitches</div>
            {recentPitches.length === 0 ? (
              <div className="text-center py-6 text-w5 text-sm">No pitches yet</div>
            ) : (
              <div className="space-y-2">
                {recentPitches.map(pitch => (
                  <div key={pitch.id} className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10">
                    <div>
                      <div className="text-sm font-semibold text-white">{pitch.role_title}</div>
                      <div className="text-xs text-w4 mt-0.5">
                        {pitch.company?.company_name} → {pitch.candidate?.current_title}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold capitalize ${
                        pitch.status === 'hired' ? 'text-candor-green' :
                        pitch.status === 'declined' ? 'text-w4' : 'text-candor-blue'
                      }`}>{pitch.status}</div>
                      <div className="text-xs text-w5">{timeAgo(pitch.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flagged companies */}
          <div className="candor-card p-5">
            <div className="candor-label mb-4" style={{ color: '#F87171' }}>Flagged companies ({flaggedCompanies.length})</div>
            {flaggedCompanies.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-candor-green font-bold text-sm">All clear</div>
                <div className="text-xs text-w5 mt-1">No companies approaching removal threshold</div>
              </div>
            ) : (
              <div className="space-y-2">
                {flaggedCompanies.map(company => (
                  <div key={company.id} className="p-3 rounded-xl bg-s2 border border-candor-red/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white">{company.company_name}</div>
                        <div className="text-xs text-candor-red mt-0.5">
                          {company.ghosting_incidents} incidents · {company.warnings} warnings
                        </div>
                      </div>
                      <button
                        onClick={() => banCompany(company.id, 'Manual admin removal: repeated ghosting')}
                        className="text-xs font-bold text-candor-red border border-candor-red/30 px-2 py-1 rounded-lg hover:bg-candor-red/10 transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Transparency Report', href: '/transparency', color: '#F59E0B' },
            { label: 'Community rooms', href: '/community', color: '#A78BFA' },
            { label: 'All pitches', href: '/admin/companies', color: '#4B7BFF' },
            { label: 'Ghosting log', href: '/admin/ghosting', color: '#F87171' },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="p-4 rounded-2xl bg-s1 border border-white/10 hover:border-white/20 transition-all text-sm font-semibold"
              style={{ color: link.color }}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
