'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { CompanyProfile, Pitch } from '@/types/database'

export default function CompanyDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'pitches' | 'profile'>('overview')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [profileRes, pitchesRes] = await Promise.all([
      supabase.from('company_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('pitches').select('*, candidate:candidate_profiles(*)').eq('company_id', user.id).order('sent_at', { ascending: false }).limit(30),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (pitchesRes.data) setPitches(pitchesRes.data as any)
    setLoading(false)
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  function formatSalary(pence: number) {
    return `£${(pence / 100).toLocaleString()}`
  }

  const stats = {
    sent: pitches.length,
    read: pitches.filter(p => ['read', 'accepted', 'declined', 'interview', 'hired'].includes(p.status)).length,
    accepted: pitches.filter(p => ['accepted', 'interview', 'hired'].includes(p.status)).length,
    hired: pitches.filter(p => p.status === 'hired').length,
    readRate: pitches.length > 0
      ? Math.round((pitches.filter(p => p.status !== 'sent').length / pitches.length) * 100)
      : 0,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-w4">
          <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  const creditsLow = (profile?.pitch_credits || 0) < 5

  return (
    <div className="min-h-screen bg-black">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
          <span className="text-w5 text-sm">/ {profile?.company_name}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Credits badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${
            creditsLow
              ? 'bg-candor-red/10 border-candor-red/30 text-candor-red'
              : 'bg-s1 border-white/10 text-white'
          }`}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="5.5"/>
              <path d="M6.5 3.5v3l2 1.5"/>
            </svg>
            {profile?.pitch_credits || 0} credits
          </div>

          <button
            onClick={() => router.push('/pitch/new')}
            className="candor-btn-green px-4 py-2 text-sm"
          >
            + New pitch
          </button>
        </div>
      </nav>

      <div className="pt-14">

        {/* Low credits warning */}
        {creditsLow && (
          <div className="mx-6 mt-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-candor-red/10 border border-candor-red/30 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-candor-red font-bold text-sm mb-0.5">Running low on pitch credits</div>
                <div className="text-xs text-w4">You have {profile?.pitch_credits || 0} credits remaining. Top up to keep pitching.</div>
              </div>
              <button className="text-xs font-bold text-candor-red border border-candor-red/40 px-3 py-1.5 rounded-lg hover:bg-candor-red/10 transition-colors flex-shrink-0">
                Top up credits →
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-s1 border border-white/10 flex items-center justify-center text-white font-bold">
                    {profile?.company_name?.[0]}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{profile?.company_name}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profile?.is_candor_verified && (
                        <span className="green-pill text-[10px] px-2 py-0.5">✓ Verified</span>
                      )}
                      <span className="text-xs text-w4 capitalize">{profile?.plan} plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Pitches sent', value: stats.sent, color: 'text-white' },
                { label: 'Read rate', value: `${stats.readRate}%`, color: 'text-candor-blue' },
                { label: 'Accepted', value: stats.accepted, color: 'text-candor-green' },
                { label: 'Hired', value: stats.hired, color: 'text-candor-green' },
                { label: 'Credits left', value: profile?.pitch_credits || 0, color: creditsLow ? 'text-candor-red' : 'text-white' },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-2xl bg-s1 border border-white/10">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-w4">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 py-6">

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-s1 border border-white/10 mb-6 w-fit">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pitches', label: `All pitches (${pitches.length})` },
              { id: 'profile', label: 'Company profile' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-white text-black' : 'text-w4 hover:text-w2'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Recent pitches */}
              <div className="candor-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="candor-label">Recent pitches</div>
                  <button onClick={() => setActiveTab('pitches')} className="text-xs text-w4 hover:text-w2 transition-colors">
                    View all →
                  </button>
                </div>
                {pitches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-w5 text-sm mb-3">No pitches sent yet.</p>
                    <button
                      onClick={() => router.push('/pitch/new')}
                      className="candor-btn-primary px-4 py-2 text-sm"
                    >
                      Send your first pitch
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pitches.slice(0, 5).map(pitch => (
                      <div key={pitch.id} className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10">
                        <div>
                          <div className="text-sm font-semibold text-white">{pitch.role_title}</div>
                          <div className="text-xs text-w4 mt-0.5">{timeAgo(pitch.sent_at)}</div>
                        </div>
                        <StatusBadge status={pitch.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Culture score */}
              <div className="candor-card p-5">
                <div className="candor-label mb-4">Your Candor score</div>
                <div className="space-y-4">
                  {[
                    { label: 'Culture score', value: profile?.culture_score || 0, max: 5, color: '#23D160' },
                    { label: 'Salary accuracy', value: profile?.salary_accuracy_score || 0, max: 5, color: '#4B7BFF' },
                    { label: 'Hire rate', value: (profile?.hire_rate || 0) / 20, max: 5, color: '#F59E0B' },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-w2">{metric.label}</span>
                        <span className="text-sm font-bold text-white">
                          {metric.label === 'Hire rate'
                            ? `${profile?.hire_rate || 0}%`
                            : `${metric.value.toFixed(1)} / 5`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(metric.value / metric.max) * 100}%`,
                            background: metric.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {stats.hired === 0 && (
                  <p className="text-xs text-w5 mt-4 leading-relaxed">
                    Scores update after your first confirmed hire and candidate review.
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div className="candor-card p-5">
                <div className="candor-label mb-4">Quick actions</div>
                <div className="space-y-2">
                  {[
                    { label: 'Send a new pitch', desc: 'Find and pitch a candidate', action: () => router.push('/pitch/new'), color: '#23D160' },
                    { label: 'Edit company profile', desc: 'Update culture and details', action: () => setActiveTab('profile'), color: '#4B7BFF' },
                    { label: 'View transparency report', desc: 'See how you compare', action: () => {}, color: '#F59E0B' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: item.color + '20', border: `1px solid ${item.color}40` }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="text-xs text-w4">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghosting warning */}
              {(profile?.ghosting_incidents || 0) > 0 && (
                <div className="candor-card p-5 border-candor-red/30" style={{ borderColor: 'rgba(248,113,113,0.3)' }}>
                  <div className="candor-label mb-2" style={{ color: '#F87171' }}>Ghosting incidents</div>
                  <div className="text-3xl font-bold text-candor-red mb-1">{profile?.ghosting_incidents}</div>
                  <p className="text-xs text-w4 leading-relaxed">
                    {(profile?.ghosting_incidents || 0) >= 3
                      ? 'Warning issued. Further incidents may result in platform removal.'
                      : 'Respond to all accepted pitches within 7 days to avoid further incidents.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PITCHES TAB */}
          {activeTab === 'pitches' && (
            <div>
              {pitches.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-white font-bold text-lg mb-2">No pitches sent yet.</h3>
                  <p className="text-w4 text-sm mb-6 max-w-xs mx-auto">
                    Find candidates that match your requirements and send them a pitch with the real salary on the first message.
                  </p>
                  <button
                    onClick={() => router.push('/pitch/new')}
                    className="candor-btn-primary px-6"
                  >
                    Send your first pitch →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pitches.map(pitch => (
                    <div key={pitch.id} className="p-4 rounded-2xl bg-s1 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-s2 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                          {(pitch as any).candidate?.anonymous_name?.[0] || 'P'}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{pitch.role_title}</div>
                          <div className="text-xs text-w4 mt-0.5">
                            {formatSalary(pitch.salary_min)} · {timeAgo(pitch.sent_at)}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={pitch.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-4">
              <div className="candor-card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="candor-label mb-2">Company details</div>
                    <h3 className="text-xl font-bold text-white">{profile.company_name}</h3>
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-candor-blue text-sm hover:underline mt-1 block">
                        {profile.website}
                      </a>
                    )}
                  </div>
                  <button className="candor-btn-secondary px-4 py-2 text-sm">Edit</button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {[
                    { label: 'Industry', value: profile.industry },
                    { label: 'Size', value: profile.size_range ? `${profile.size_range} employees` : null },
                    { label: 'Remote policy', value: profile.remote_policy },
                    { label: 'Plan', value: profile.plan },
                    { label: 'Pitch credits', value: String(profile.pitch_credits) },
                    { label: 'Verified', value: profile.is_candor_verified ? 'Yes ✓' : 'Pending' },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label}>
                      <div className="candor-label mb-1">{item.label}</div>
                      <div className="text-white font-bold capitalize text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {profile.culture_description && (
                <div className="candor-card p-5">
                  <div className="candor-label mb-3">Culture description</div>
                  <p className="text-sm text-w2 leading-relaxed">{profile.culture_description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    sent:       { label: 'Sent',        class: 'bg-white/10 text-w3' },
    read:       { label: 'Read',        class: 'bg-candor-blue/15 text-candor-blue' },
    accepted:   { label: 'Accepted',    class: 'bg-candor-green/15 text-candor-green' },
    declined:   { label: 'Declined',    class: 'bg-white/10 text-w4' },
    interview:  { label: 'Interview',   class: 'bg-candor-purple/15 text-candor-purple' },
    offered:    { label: 'Offered',     class: 'bg-candor-amber/15 text-candor-amber' },
    hired:      { label: 'Hired ✓',     class: 'bg-candor-green/20 text-candor-green' },
    withdrawn:  { label: 'Withdrawn',   class: 'bg-white/10 text-w5' },
    expired:    { label: 'Expired',     class: 'bg-white/10 text-w5' },
  }
  const c = config[status] || config.sent
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${c.class}`}>
      {c.label}
    </span>
  )
}
