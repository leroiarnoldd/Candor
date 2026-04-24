'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Expert {
  id: string
  current_title: string
  anonymous_name: string
  display_name: string | null
  skills: string[]
  verified_skills: string[]
  reputation_score: number
  expert_rate: number
  bio: string
  location: string
  is_anonymous: boolean
}

export default function ExpertPage() {
  const router = useRouter()
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [duration, setDuration] = useState(60)
  const [message, setMessage] = useState('')
  const [filterSkill, setFilterSkill] = useState('')

  useEffect(() => { loadExperts() }, [])

  async function loadExperts() {
    let query = supabase
      .from('candidate_profiles')
      .select('id, current_title, anonymous_name, display_name, skills, verified_skills, reputation_score, expert_rate, bio, location, is_anonymous')
      .eq('is_expert', true)
      .order('reputation_score', { ascending: false })

    if (filterSkill) query = query.contains('skills', [filterSkill])

    const { data } = await query.limit(30)
    if (data) setExperts(data as Expert[])
    setLoading(false)
  }

  async function handleBook() {
    if (!selectedExpert) return
    setBookingLoading(true)
    try {
      const res = await fetch('/api/expert/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expert_candidate_id: selectedExpert.id,
          session_type: 'one_to_one',
          duration_minutes: duration,
          message,
        }),
      })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } finally {
      setBookingLoading(false)
    }
  }

  function formatRate(pence: number, minutes: number) {
    const sessionCost = Math.round((pence * minutes) / 60)
    return `£${(sessionCost / 100).toFixed(0)}`
  }

  function formatHourlyRate(pence: number) {
    return `£${(pence / 100).toFixed(0)}/hr`
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-purple rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/dashboard/candidate" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
        <Link href="/dashboard/candidate" className="text-w4 text-sm hover:text-w2 transition-colors">← Dashboard</Link>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Candor Experts</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Book a session.</h1>
          <p className="text-w3 text-sm leading-relaxed max-w-xl">
            Verified practitioners charging fair rates. Candor takes only 10% — less than any other platform. Book a one-to-one session and get real advice from someone doing the work right now.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-candor-purple/10 border border-candor-purple/30 mb-6">
          <div className="text-sm font-bold text-candor-purple mb-1">Why 10%?</div>
          <p className="text-xs text-candor-purple/70 leading-relaxed">
            Toptal takes 40%. Intro takes 20%. Clarity.fm takes 15%. Candor takes 10% — just enough to cover payment processing. The expert keeps 90%. That is not a feature. It is a principle.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-5">
          <input
            type="text"
            value={filterSkill}
            onChange={e => { setFilterSkill(e.target.value); loadExperts() }}
            placeholder="Filter by skill e.g. React, Product Management"
            className="candor-input"
          />
        </div>

        {/* Booking modal */}
        {selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="candor-card w-full max-w-md p-6 relative">
              <button
                onClick={() => setSelectedExpert(null)}
                className="absolute top-4 right-4 text-w4 hover:text-w2 transition-colors"
              >
                ✕
              </button>

              <div className="mb-5">
                <div className="candor-label mb-2">Book a session with</div>
                <h3 className="text-xl font-bold text-white">{selectedExpert.current_title}</h3>
                <div className="text-sm text-w4 mt-0.5">{formatHourlyRate(selectedExpert.expert_rate || 15000)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="candor-label mb-2">Session length</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          duration === mins
                            ? 'border-candor-purple/50 bg-candor-purple/10 text-candor-purple'
                            : 'border-white/10 bg-s2 text-w3 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-sm">{mins} min</div>
                        <div className="text-xs mt-0.5">
                          {formatRate(selectedExpert.expert_rate || 15000, mins)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="candor-label mb-2">What do you want to cover?</div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Brief description of what you want to discuss..."
                    rows={3}
                    className="candor-input resize-none"
                    maxLength={400}
                  />
                </div>

                <div className="p-4 rounded-xl bg-s2 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-w3">Session cost</span>
                    <span className="font-bold text-white">{formatRate(selectedExpert.expert_rate || 15000, duration)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-w4">Expert earns (90%)</span>
                    <span className="text-xs text-candor-purple font-bold">
                      {formatRate(Math.round((selectedExpert.expert_rate || 15000) * 0.9), duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-w4">Candor fee (10%)</span>
                    <span className="text-xs text-w5">
                      {formatRate(Math.round((selectedExpert.expert_rate || 15000) * 0.1), duration)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={bookingLoading || !message.trim()}
                  className="candor-btn-primary w-full py-3.5"
                >
                  {bookingLoading ? 'Loading checkout...' : `Book session — ${formatRate(selectedExpert.expert_rate || 15000, duration)}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expert list */}
        {experts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔬</div>
            <h3 className="text-white font-bold mb-2">No experts yet.</h3>
            <p className="text-w4 text-sm max-w-xs mx-auto leading-relaxed">
              Candor Experts appear here once professionals upgrade to the Expert tier. Be the first — go to Billing.
            </p>
            <Link href="/billing" className="candor-btn-primary px-5 py-2.5 mt-5 inline-block">
              Become an Expert →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {experts.map(expert => (
              <div key={expert.id} className="candor-card p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-s2 border border-candor-purple/30 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {expert.current_title?.[0] || 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-white text-sm">{expert.current_title}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-candor-purple/15 text-candor-purple border border-candor-purple/30">
                          ✓ Expert
                        </span>
                      </div>
                      {expert.location && (
                        <div className="text-xs text-w4 mb-2">{expert.location}</div>
                      )}
                      {expert.bio && (
                        <p className="text-xs text-w3 leading-relaxed mb-2 line-clamp-2">{expert.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {expert.verified_skills.slice(0, 3).map(skill => (
                          <span key={skill} className="green-pill text-[10px] px-1.5 py-0.5">✓ {skill}</span>
                        ))}
                        {expert.skills.filter(s => !expert.verified_skills.includes(s)).slice(0, 2).map(skill => (
                          <span key={skill} className="blue-pill text-[10px] px-1.5 py-0.5">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-white text-sm mb-0.5">
                      {formatHourlyRate(expert.expert_rate || 15000)}
                    </div>
                    <div className="flex items-center gap-1 justify-end mb-2">
                      <span className="text-candor-amber text-xs">★</span>
                      <span className="text-xs font-bold text-white">{expert.reputation_score.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => setSelectedExpert(expert)}
                      className="candor-btn-primary px-3 py-1.5 text-xs"
                    >
                      Book →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
