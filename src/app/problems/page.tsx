'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatCurrency, timeAgo } from '@/lib/utils'

interface Problem {
  id: string
  title: string
  content: string
  prize_amount: number
  problem_deadline: string
  problem_closed: boolean
  created_at: string
  upvotes: number
  room: { name: string; slug: string } | null
  sponsor_company: { company_name: string; is_candor_verified: boolean } | null
  _answer_count?: number
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'closed'>('active')
  const [totalPrizePool, setTotalPrizePool] = useState(0)

  useEffect(() => { loadProblems() }, [filter])

  async function loadProblems() {
    const { data } = await supabase
      .from('community_posts')
      .select(`
        id, title, content, prize_amount, problem_deadline,
        problem_closed, created_at, upvotes,
        room:community_rooms(name, slug),
        sponsor_company:company_profiles(company_name, is_candor_verified)
      `)
      .eq('type', 'sponsored_problem')
      .eq('problem_closed', filter === 'closed')
      .eq('is_published', true)
      .order('prize_amount', { ascending: false })
      .limit(30)

    if (data) {
      setProblems(data as any)
      const pool = data.reduce((s, p) => s + ((p.prize_amount || 0) * 0.6), 0)
      setTotalPrizePool(pool)
    }
    setLoading(false)
  }

  function daysLeft(deadline: string): number {
    return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/community" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
        <Link href="/community" className="text-w4 text-sm hover:text-w2 transition-colors">← Communities</Link>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">

        <div className="mb-6">
          <div className="candor-section-label">Sponsored Problems</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Real problems. Real prize money.</h1>
          <p className="text-w3 text-sm leading-relaxed max-w-xl">
            Companies post actual challenges they are facing. You solve them. The winner gets 60% of the prize. No catch.
          </p>
        </div>

        {filter === 'active' && totalPrizePool > 0 && (
          <div className="p-5 rounded-2xl bg-candor-green/10 border border-candor-green/30 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold text-candor-green uppercase tracking-wider mb-1">Total prize pool available</div>
              <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalPrizePool)}</div>
            </div>
            <div className="text-xs text-candor-green/70 leading-relaxed max-w-xs">
              Winners receive 60% of each prize. Paid directly to your Candor wallet the moment you are selected.
            </div>
          </div>
        )}

        <div className="flex gap-1 p-1 rounded-xl bg-s1 border border-white/10 mb-5 w-fit">
          {[{id:'active',l:'Active'},{id:'closed',l:'Closed'}].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === f.id ? 'bg-white text-black' : 'text-w4 hover:text-w2'
              }`}>{f.l}</button>
          ))}
        </div>

        {problems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-white font-bold text-lg mb-2">
              {filter === 'active' ? 'No active problems right now.' : 'No closed problems yet.'}
            </h3>
            <p className="text-w4 text-sm max-w-xs mx-auto leading-relaxed">
              {filter === 'active'
                ? 'Check back soon — companies post new problems regularly. Growth and Enterprise plan companies can post problems from their dashboard.'
                : 'Closed problems with winners will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map(problem => {
              const days = problem.problem_deadline ? daysLeft(problem.problem_deadline) : 0
              const winnerAmount = Math.round((problem.prize_amount || 0) * 0.6)
              const urgent = days <= 3 && !problem.problem_closed

              return (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  className={`block candor-card p-5 hover:border-white/20 transition-all ${
                    urgent ? 'border-candor-amber/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {problem.sponsor_company?.is_candor_verified && (
                          <span className="green-pill text-[10px] px-1.5 py-0.5">✓ Verified</span>
                        )}
                        {problem.room && (
                          <span className="blue-pill text-[10px] px-1.5 py-0.5">{problem.room.name}</span>
                        )}
                        {urgent && (
                          <span className="amber-pill text-[10px] px-1.5 py-0.5">⚡ {days}d left</span>
                        )}
                        {problem.problem_closed && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-w4">Closed</span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug mb-1">{problem.title}</h3>
                      <p className="text-xs text-w4 mb-1">
                        Posted by {problem.sponsor_company?.company_name}
                      </p>
                      <p className="text-sm text-w3 leading-relaxed line-clamp-2">{problem.content}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-candor-green mb-0.5">
                        {formatCurrency(winnerAmount, false)}
                      </div>
                      <div className="text-[10px] text-w4">winner gets 60%</div>
                      <div className="text-[10px] text-w5 mt-1">
                        Total: {formatCurrency(problem.prize_amount || 0, false)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-xs text-w4">
                    <span>↑ {problem.upvotes}</span>
                    {!problem.problem_closed && problem.problem_deadline && (
                      <span>{days} days left</span>
                    )}
                    <span className="ml-auto">{timeAgo(problem.created_at)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
