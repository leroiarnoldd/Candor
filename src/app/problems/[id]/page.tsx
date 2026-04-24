'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency, timeAgo, formatDate } from '@/lib/utils'

export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = params.id as string

  const [problem, setProblem] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isSponsors, setIsSponsors] = useState(false)
  const [selectingWinner, setSelectingWinner] = useState(false)

  useEffect(() => {
    loadProblem()
    loadUserContext()
  }, [problemId])

  async function loadProblem() {
    const { data: p } = await supabase
      .from('community_posts')
      .select('*, room:community_rooms(name, slug), sponsor_company:company_profiles(company_name, user_id, is_candor_verified)')
      .eq('id', problemId)
      .single()

    if (!p) { router.push('/problems'); return }
    setProblem(p)

    const { data: ans } = await supabase
      .from('community_posts')
      .select('*')
      .eq('parent_id', problemId)
      .eq('is_published', true)
      .order('upvotes', { ascending: false })

    if (ans) setAnswers(ans)
    setLoading(false)
  }

  async function loadUserContext() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: prof } = await supabase
      .from('candidate_profiles')
      .select('id, current_title, is_expert')
      .eq('user_id', user.id)
      .single()
    if (prof) setUserProfile(prof)

    const { data: company } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (company) setIsSponsors(true)
  }

  async function submitAnswer() {
    if (!answerContent.trim() || !problem) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          room_id: problem.room_id,
          author_id: user.id,
          candidate_id: userProfile?.id || null,
          type: 'answer',
          content: answerContent,
          parent_id: problemId,
          is_published: true,
        })
        .select()
        .single()

      if (error) throw error
      if (data) setAnswers(prev => [...prev, data])
      setAnswerContent('')
    } finally {
      setSubmitting(false)
    }
  }

  async function selectWinner(answerId: string) {
    setSelectingWinner(true)
    try {
      const res = await fetch('/api/problems/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id: problemId, winner_post_id: answerId }),
      })
      const data = await res.json()
      if (data.success) {
        setProblem((prev: any) => ({ ...prev, problem_closed: true }))
        setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, is_top_answer: true } : a))
      }
    } finally {
      setSelectingWinner(false)
    }
  }

  async function voteAnswer(answerId: string) {
    await fetch('/api/community/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: answerId }),
    })
    setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a))
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
    </div>
  )

  if (!problem) return null

  const winnerAmount = Math.round((problem.prize_amount || 0) * 0.6)
  const daysLeft = problem.problem_deadline
    ? Math.max(0, Math.ceil((new Date(problem.problem_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/problems" className="text-w4 text-sm hover:text-w2 transition-colors">← Problems</Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">

        {/* Problem header */}
        <div className="candor-card p-6 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-candor-green" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {problem.sponsor_company?.is_candor_verified && (
                  <span className="green-pill text-[10px] px-1.5 py-0.5">✓ Verified company</span>
                )}
                {problem.room && (
                  <Link href={`/community/${problem.room.slug}`} className="blue-pill text-[10px] px-1.5 py-0.5 hover:opacity-80 transition-opacity">
                    {problem.room.name}
                  </Link>
                )}
                {problem.problem_closed && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-w5/20 text-w4">Closed</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{problem.title}</h1>
              <p className="text-sm text-w4">
                Posted by <span className="text-white font-semibold">{problem.sponsor_company?.company_name}</span> · {timeAgo(problem.created_at)}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-candor-green">{formatCurrency(winnerAmount, false)}</div>
              <div className="text-xs text-w4 mt-0.5">winner gets 60%</div>
              <div className="text-xs text-w5">of {formatCurrency(problem.prize_amount || 0, false)}</div>
            </div>
          </div>

          <p className="text-sm text-w2 leading-relaxed mb-4 whitespace-pre-wrap">{problem.content}</p>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10 text-xs text-w4 flex-wrap">
            <span>{answers.length} response{answers.length !== 1 ? 's' : ''}</span>
            {!problem.problem_closed && daysLeft >= 0 && (
              <span className={daysLeft <= 3 ? 'text-candor-amber font-bold' : ''}>
                {daysLeft === 0 ? 'Closes today' : `${daysLeft} days left`}
              </span>
            )}
            {problem.problem_deadline && (
              <span>Deadline: {formatDate(problem.problem_deadline, true)}</span>
            )}
          </div>
        </div>

        {/* Submit answer */}
        {!problem.problem_closed && (
          <div className="candor-card p-5 mb-5">
            <div className="candor-label mb-3">Your answer</div>
            <p className="text-xs text-w4 mb-3 leading-relaxed">
              Write a specific, actionable response. The company selects the winner. Top answer earns {formatCurrency(winnerAmount, false)}.
            </p>
            <textarea
              value={answerContent}
              onChange={e => setAnswerContent(e.target.value)}
              placeholder="Write your answer here. Be specific. Include your reasoning. Show your expertise."
              rows={5}
              className="candor-input resize-none mb-3"
              maxLength={3000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-w5">{answerContent.length}/3000</span>
              <button
                onClick={submitAnswer}
                disabled={submitting || !answerContent.trim()}
                className="candor-btn-primary px-5 py-2"
              >
                {submitting ? 'Posting...' : 'Submit answer'}
              </button>
            </div>
          </div>
        )}

        {/* Answers */}
        <div>
          <div className="candor-label mb-3">{answers.length} Response{answers.length !== 1 ? 's' : ''}</div>

          {answers.length === 0 ? (
            <div className="text-center py-10 text-w5 text-sm">
              No answers yet. Be the first to respond.
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map(answer => (
                <div
                  key={answer.id}
                  className={`candor-card p-5 ${answer.is_top_answer ? 'border-candor-green/40 bg-candor-green/5' : ''}`}
                >
                  {answer.is_top_answer && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-candor-green/20">
                      <span className="green-pill text-xs px-2 py-1">🏆 Winner — {formatCurrency(winnerAmount, false)} awarded</span>
                    </div>
                  )}
                  <p className="text-sm text-w2 leading-relaxed mb-3 whitespace-pre-wrap">{answer.content}</p>
                  <div className="flex items-center gap-3 text-xs text-w4">
                    <button
                      onClick={() => voteAnswer(answer.id)}
                      className="flex items-center gap-1 hover:text-candor-blue transition-colors"
                    >
                      ↑ {answer.upvotes}
                    </button>
                    <span>{timeAgo(answer.created_at)}</span>
                    {isSponsors && !problem.problem_closed && !answer.is_top_answer && (
                      <button
                        onClick={() => selectWinner(answer.id)}
                        disabled={selectingWinner}
                        className="ml-auto text-xs font-bold text-candor-green border border-candor-green/30 px-2.5 py-1 rounded-lg hover:bg-candor-green/10 transition-colors"
                      >
                        {selectingWinner ? 'Selecting...' : 'Select as winner →'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
