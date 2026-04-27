'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { CommunityRoom } from '@/types/database'

const ROOM_ICONS: Record<string, string> = {
  'senior-engineering': '⚙️',
  'product-management': '🗺',
  'design-ux': '🎨',
  'launching-something': '🚀',
  'salary-negotiation': '💰',
  'first-time-managers': '🌱',
  'data-analytics': '📊',
  'marketing-growth': '📈',
}

const ROOM_COLORS: Record<string, string> = {
  'senior-engineering': '#4B7BFF',
  'product-management': '#23D160',
  'design-ux': '#A78BFA',
  'launching-something': '#F59E0B',
  'salary-negotiation': '#23D160',
  'first-time-managers': '#4B7BFF',
  'data-analytics': '#F59E0B',
  'marketing-growth': '#F87171',
}

export default function CommunityPage() {
  const [rooms, setRooms] = useState<CommunityRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeProblemCounts, setActiveProblemCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    const { data: roomsData } = await (supabase as any)
      .from('community_rooms')
      .select('*')
      .eq('is_active', true)
      .order('member_count', { ascending: false })

    if (roomsData) setRooms(roomsData)

    // Get active sponsored problem counts per room
    const { data: problems } = await (supabase as any)
      .from('community_posts')
      .select('room_id')
      .eq('type', 'sponsored_problem')
      .eq('problem_closed', false)
      .eq('is_published', true)

    if (problems) {
      const counts: Record<string, number> = {}
      problems.forEach(p => {
        counts[p.room_id] = (counts[p.room_id] || 0) + 1
      })
      setActiveProblemCounts(counts)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-w5 border-t-candor-purple rounded-full animate-spin" />
      </div>
    )
  }

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
          <div className="candor-section-label">Communities</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">High-signal rooms.</h1>
          <p className="text-w3 text-sm max-w-xl leading-relaxed">
            Verified professionals. Real problems. Expert answers. Sponsored problems you can win. Your knowledge is worth something here.
          </p>
        </div>

        {/* Earnings reminder */}
        <div className="p-4 rounded-2xl bg-candor-green/10 border border-candor-green/30 mb-6">
          <div className="text-sm font-bold text-candor-green mb-1">Get paid to contribute</div>
          <div className="text-xs text-candor-green/70 leading-relaxed">
            Top-rated answers earn £15 · Sponsored problem winners earn 60% of prize · Office hours earn £30 · Case studies earn £20
          </div>
        </div>

        {/* Rooms grid */}
        <div className="space-y-3">
          {rooms.map(room => {
            const color = ROOM_COLORS[room.slug] || '#4B7BFF'
            const icon = ROOM_ICONS[room.slug] || '💬'
            const activeProblems = activeProblemCounts[room.id] || 0

            return (
              <Link
                key={room.id}
                href={`/community/${room.slug}`}
                className="block candor-card p-5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: color + '20', border: `1px solid ${color}40` }}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-candor-blue transition-colors">
                          {room.name}
                        </h3>
                        <p className="text-xs text-w4 mt-0.5 leading-relaxed">{room.description}</p>
                      </div>
                      <svg className="w-4 h-4 text-w5 flex-shrink-0 mt-1 group-hover:text-w2 transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10M9 4l4 4-4 4"/>
                      </svg>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-w4">
                        {room.member_count.toLocaleString()} members
                      </span>
                      <span className="text-xs text-w4">
                        {room.expert_count} experts
                      </span>
                      {activeProblems > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: color + '20', color }}
                        >
                          {activeProblems} active problem{activeProblems > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-candor-green animate-pulse" />
                        <span className="text-candor-green">Active</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* What you can do */}
        <div className="mt-8 candor-card p-5">
          <div className="candor-label mb-4">What happens in every room</div>
          <div className="space-y-3">
            {[
              { icon: '❓', title: 'Expert threads', desc: 'Post real questions. Verified experts answer. Top 3 answers per week earn £15.', color: 'text-candor-blue' },
              { icon: '🏆', title: 'Sponsored problems', desc: 'Companies post real challenges with prize money. Win 60% of the pot.', color: 'text-candor-green' },
              { icon: '🎤', title: 'Live office hours', desc: 'Verified experts open up for an hour. Bring real problems.', color: 'text-candor-amber' },
              { icon: '📝', title: 'Case studies', desc: 'Share real work with real outcomes. Gets published permanently on your profile.', color: 'text-candor-purple' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <div className={`text-sm font-bold ${item.color}`}>{item.title}</div>
                  <div className="text-xs text-w4 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
