'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { CandidateProfile, Pitch, WalletTransaction, Notification } from '@/types/database'
import { EmptyPitchInbox, FirstActionPrompt } from '@/components/onboarding/EmptyStates'

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pitches' | 'wallet' | 'profile'>('pitches')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, pitchesRes, txRes, notifRes] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('pitches').select('*, company:company_profiles(*)').eq('candidate_id', user.id).order('sent_at', { ascending: false }).limit(20),
      supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*').eq('user_id', user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (pitchesRes.data) setPitches(pitchesRes.data as any)
    if (txRes.data) setTransactions(txRes.data)
    if (notifRes.data) setNotifications(notifRes.data)
    setLoading(false)
  }

  function formatCurrency(pence: number) {
    return `£${(pence / 100).toFixed(2)}`
  }

  function formatSalary(pence: number) {
    return `£${(pence / 100).toLocaleString()}`
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const unreadPitches = pitches.filter(p => p.status === 'sent').length
  const walletBalance = profile?.wallet_balance || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-w4">
          <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet balance */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-s1 border border-white/10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round">
              <rect x="1" y="4" width="12" height="8" rx="1.5"/>
              <path d="M1 7h12"/>
              <path d="M8 2l3 2"/>
            </svg>
            <span className="text-candor-green font-bold text-sm">{formatCurrency(walletBalance)}</span>
          </div>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-s1 border border-white/10">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#A0A0A0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1a5 5 0 015 5v3l1.5 2H1.5L3 9V6a5 5 0 015-5z"/>
              <path d="M6 13a2 2 0 004 0"/>
            </svg>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-candor-red rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button className="w-9 h-9 rounded-xl bg-s1 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
            {profile?.anonymous_name?.[0] || 'P'}
          </button>
        </div>
      </nav>

      <div className="pt-14">

        {/* Hero stats */}
        <div className="px-6 py-8 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-w4 text-sm mb-1">Welcome back</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profile?.current_title || 'Professional'}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${
                    profile?.availability === 'open' ? 'bg-candor-green' :
                    profile?.availability === 'passive' ? 'bg-candor-blue' : 'bg-w5'
                  }`} />
                  <span className="text-sm text-w4 capitalize">{profile?.availability || 'open'} to pitches</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-xl bg-s1 border border-white/10 text-center">
                  <div className="text-xl font-bold text-white">{profile?.profile_completeness || 0}%</div>
                  <div className="text-xs text-w4">Profile complete</div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'New pitches', value: unreadPitches, color: 'text-candor-blue', highlight: unreadPitches > 0 },
                { label: 'Total pitches', value: pitches.length, color: 'text-w1', highlight: false },
                { label: 'Wallet balance', value: formatCurrency(walletBalance), color: 'text-candor-green', highlight: false },
                { label: 'Total earned', value: formatCurrency(profile?.total_earned || 0), color: 'text-w1', highlight: false },
              ].map(stat => (
                <div key={stat.label} className={`p-4 rounded-2xl border ${
                  stat.highlight ? 'bg-candor-blue/10 border-candor-blue/30' : 'bg-s1 border-white/10'
                }`}>
                  <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-w4">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile completeness banner */}
        {(profile?.profile_completeness || 0) < 80 && (
          <div className="mx-6 mt-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-candor-amber font-bold text-sm mb-1">Complete your profile to get more pitches</div>
                <div className="text-xs text-w4">Companies pitch profiles that are at least 80% complete first.</div>
              </div>
              <Link href="/profile/edit" className="text-xs font-bold text-candor-amber border border-candor-amber/40 px-3 py-1.5 rounded-lg hover:bg-candor-amber/10 transition-colors flex-shrink-0">
                Complete profile →
              </Link>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-s1 border border-white/10 mb-6 w-fit">
            {[
              { id: 'pitches', label: `Pitches ${unreadPitches > 0 ? `(${unreadPitches} new)` : ''}` },
              { id: 'wallet', label: 'Wallet' },
              { id: 'profile', label: 'Profile' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-w4 hover:text-w2'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* PITCHES TAB */}
          {activeTab === 'pitches' && (
            <div>
              {pitches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-s1 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#606060" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h20l-10 8L4 6z"/>
                      <path d="M4 6v16h20V6"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">No pitches yet.</h3>
                  <p className="text-w4 text-sm max-w-xs mx-auto leading-relaxed">
                    Once companies start pitching you, they will appear here. Make sure your profile is complete to attract the right opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pitches.map(pitch => (
                    <PitchCard key={pitch.id} pitch={pitch} onUpdate={loadDashboard} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WALLET TAB */}
          {activeTab === 'wallet' && (
            <div>
              {/* Balance card */}
              <div className="candor-card p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #4B7BFF, #23D160)' }} />
                <div className="candor-label mb-3">Candor Wallet</div>
                <div className="text-4xl font-bold text-white tracking-tight mb-1">
                  {formatCurrency(walletBalance)}
                </div>
                <div className="text-sm text-w4 mb-6">
                  {walletBalance >= 5000
                    ? 'Ready to withdraw'
                    : `${formatCurrency(5000 - walletBalance)} until you can withdraw`}
                </div>

                {/* Progress to withdrawal */}
                <div className="h-1.5 bg-white/10 rounded-full mb-4">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (walletBalance / 5000) * 100)}%`,
                      background: walletBalance >= 5000 ? '#23D160' : '#4B7BFF'
                    }}
                  />
                </div>

                <button
                  disabled={walletBalance < 5000}
                  className="candor-btn-green px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Withdraw to bank →
                </button>
              </div>

              {/* How to earn */}
              <div className="candor-card p-5 mb-4">
                <div className="candor-label mb-4">How to earn</div>
                <div className="space-y-3">
                  {[
                    { action: 'Read a pitch (60 sec minimum)', amount: '£2.70', color: 'text-candor-blue' },
                    { action: 'Decline with structured feedback', amount: '£7.10', color: 'text-candor-amber' },
                    { action: 'Confirmed hire', amount: '£30.00', color: 'text-candor-green' },
                    { action: 'Win a sponsored problem', amount: '60% of prize', color: 'text-candor-purple' },
                  ].map(item => (
                    <div key={item.action} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-w2">{item.action}</span>
                      <span className={`text-sm font-bold ${item.color}`}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent transactions */}
              <div>
                <div className="candor-label mb-3">Recent transactions</div>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-w5 text-sm">
                    No transactions yet. Start reading pitches to earn.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-s1 border border-white/10">
                        <div>
                          <div className="text-sm font-semibold text-white capitalize mb-0.5">
                            {tx.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-w4">{timeAgo(tx.created_at)}</div>
                        </div>
                        <div className={`font-bold ${tx.amount > 0 ? 'text-candor-green' : 'text-candor-red'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && profile && (
            <div>
              <div className="candor-card p-6 mb-4">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="candor-label mb-2">Your profile</div>
                    <h3 className="text-xl font-bold text-white">{profile.current_title}</h3>
                    {profile.location && <p className="text-w4 text-sm mt-1">{profile.location}</p>}
                  </div>
                  <Link href="/profile/edit" className="candor-btn-secondary px-4 py-2 text-sm">
                    Edit
                  </Link>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="candor-label mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                        <span key={skill} className="blue-pill">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="candor-label mb-1">Salary floor</div>
                      <div className="text-white font-bold">{formatSalary(profile.salary_floor)}/year</div>
                    </div>
                    <div>
                      <div className="candor-label mb-1">Availability</div>
                      <div className={`font-bold capitalize ${
                        profile.availability === 'open' ? 'text-candor-green' :
                        profile.availability === 'passive' ? 'text-candor-blue' : 'text-w4'
                      }`}>{profile.availability}</div>
                    </div>
                    <div>
                      <div className="candor-label mb-1">Profile visibility</div>
                      <div className="text-white font-bold">{profile.is_anonymous ? 'Anonymous' : 'Named'}</div>
                    </div>
                    <div>
                      <div className="candor-label mb-1">Profile score</div>
                      <div className="text-white font-bold">{profile.profile_completeness}% complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Pitch card component
function PitchCard({ pitch, onUpdate }: { pitch: any; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [declineFeedback, setDeclineFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  function formatSalary(pence: number) {
    return `£${(pence / 100).toLocaleString()}`
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  async function markAsRead() {
    if (pitch.status !== 'sent') return
    await supabase.from('pitches').update({
      status: 'read',
      read_at: new Date().toISOString(),
    }).eq('id', pitch.id)
    onUpdate()
  }

  async function handleAccept() {
    setLoading(true)
    await supabase.from('pitches').update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
    }).eq('id', pitch.id)
    setLoading(false)
    onUpdate()
  }

  async function handleDecline() {
    if (!declineReason) return
    setLoading(true)
    await supabase.from('pitches').update({
      status: 'declined',
      responded_at: new Date().toISOString(),
      decline_reason: declineReason,
      decline_feedback: declineFeedback,
    }).eq('id', pitch.id)
    setLoading(false)
    setDeclining(false)
    onUpdate()
  }

  const isNew = pitch.status === 'sent'
  const company = pitch.company

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isNew
          ? 'border-candor-blue/30 bg-candor-blue/5'
          : 'border-white/10 bg-s1'
      }`}
      onClick={() => { setExpanded(!expanded); if (isNew) markAsRead() }}
    >
      {/* Card header */}
      <div className="p-5 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Company logo placeholder */}
            <div className="w-10 h-10 rounded-xl bg-s2 border border-white/10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {company?.company_name?.[0] || 'C'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{pitch.role_title}</span>
                {isNew && (
                  <span className="blue-pill text-[10px] px-2 py-0.5">New</span>
                )}
              </div>
              <div className="text-xs text-w4 mt-0.5">
                {company?.company_name} · {timeAgo(pitch.sent_at)}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-candor-green text-sm">
              {formatSalary(pitch.salary_min)}{pitch.salary_max ? `–${formatSalary(pitch.salary_max)}` : ''}
            </div>
            <div className="text-xs text-w4 mt-0.5 capitalize">{pitch.employment_type}</div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/10 pt-4">
          <div className="space-y-4">
            {/* Pitch message */}
            <div>
              <div className="candor-label mb-2">From {pitch.hiring_manager_name}</div>
              <p className="text-sm text-w2 leading-relaxed">{pitch.pitch_message}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              {pitch.location && (
                <div className="p-3 rounded-xl bg-s2 border border-white/10">
                  <div className="candor-label mb-1">Location</div>
                  <div className="text-white text-sm">{pitch.location}</div>
                </div>
              )}
              {pitch.remote_policy && (
                <div className="p-3 rounded-xl bg-s2 border border-white/10">
                  <div className="candor-label mb-1">Remote</div>
                  <div className="text-white text-sm capitalize">{pitch.remote_policy}</div>
                </div>
              )}
            </div>

            {/* Earnings reminder */}
            {isNew && (
              <div className="p-3 rounded-xl bg-candor-green/10 border border-candor-green/20 text-xs text-candor-green">
                ✓ £2.70 earned for reading this pitch. Arrives in your wallet in 48 hours.
              </div>
            )}

            {/* Actions */}
            {pitch.status === 'read' && !declining && (
              <div className="flex gap-3">
                <button
                  onClick={e => { e.stopPropagation(); handleAccept() }}
                  disabled={loading}
                  className="candor-btn-green flex-1 py-3"
                >
                  Accept pitch
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setDeclining(true) }}
                  className="candor-btn-secondary flex-1 py-3"
                >
                  Decline (+£7.10)
                </button>
              </div>
            )}

            {/* Decline form */}
            {declining && (
              <div className="space-y-3" onClick={e => e.stopPropagation()}>
                <div className="p-3 rounded-xl bg-candor-amber/10 border border-candor-amber/20 text-xs text-candor-amber">
                  Giving feedback earns you £7.10. Be honest — the company will use this to improve their pitching.
                </div>
                <div>
                  <div className="candor-label mb-2">Main reason <span className="text-candor-blue">*</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'salary_too_low', label: 'Salary too low' },
                      { value: 'role_not_right', label: 'Role not right' },
                      { value: 'culture_concerns', label: 'Culture concerns' },
                      { value: 'timing', label: 'Timing' },
                    ].map(reason => (
                      <button
                        key={reason.value}
                        onClick={() => setDeclineReason(reason.value)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          declineReason === reason.value
                            ? 'border-candor-amber/50 bg-candor-amber/10 text-candor-amber'
                            : 'border-white/10 bg-s1 text-w3 hover:border-white/20'
                        }`}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="candor-label mb-2">Additional feedback (optional)</div>
                  <textarea
                    value={declineFeedback}
                    onChange={e => setDeclineFeedback(e.target.value)}
                    placeholder="Anything specific the company should know?"
                    rows={2}
                    className="candor-input resize-none"
                    maxLength={300}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={!declineReason || loading}
                    className="candor-btn-primary flex-1 py-3"
                  >
                    {loading ? 'Sending...' : 'Send feedback & earn £7.10'}
                  </button>
                  <button
                    onClick={() => setDeclining(false)}
                    className="candor-btn-secondary px-4 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status badges */}
            {['accepted', 'declined', 'hired'].includes(pitch.status) && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                pitch.status === 'hired' ? 'green-pill' :
                pitch.status === 'accepted' ? 'blue-pill' : 'amber-pill'
              }`}>
                {pitch.status === 'hired' ? '✓ Hired' :
                 pitch.status === 'accepted' ? 'In progress' : 'Declined'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
