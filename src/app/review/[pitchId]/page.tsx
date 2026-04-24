'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReviewScores {
  salary_accuracy: number
  communication: number
  fairness: number
  culture_match: number
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const pitchId = params.pitchId as string

  const [pitch, setPitch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [scores, setScores] = useState<ReviewScores>({
    salary_accuracy: 0,
    communication: 0,
    fairness: 0,
    culture_match: 0,
  })
  const [reviewText, setReviewText] = useState('')

  useEffect(() => { loadPitch() }, [pitchId])

  async function loadPitch() {
    const { data } = await supabase
      .from('pitches')
      .select('*, company:company_profiles(*)')
      .eq('id', pitchId)
      .single()

    if (data) setPitch(data)
    setLoading(false)
  }

  async function submitReview() {
    if (!pitch) return
    const allScored = Object.values(scores).every(s => s > 0)
    if (!allScored) { setError('Please rate all four areas before submitting.'); return }

    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!candidateProfile) throw new Error('Profile not found')

      const overall = Math.round(
        (scores.salary_accuracy + scores.communication + scores.fairness + scores.culture_match) / 4
      )

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          pitch_id: pitchId,
          candidate_id: candidateProfile.id,
          company_id: pitch.company_id,
          salary_accuracy_score: scores.salary_accuracy,
          communication_score: scores.communication,
          fairness_score: scores.fairness,
          culture_match_score: scores.culture_match,
          overall_score: overall,
          review_text: reviewText || null,
          is_published: true,
          is_verified: true,
          published_at: new Date().toISOString(),
        })

      if (reviewError) throw reviewError

      // Update company culture score
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('overall_score, salary_accuracy_score')
        .eq('company_id', pitch.company_id)
        .eq('is_published', true)

      if (allReviews && allReviews.length > 0) {
        const avgCulture = allReviews.reduce((s, r) => s + (r.overall_score || 0), 0) / allReviews.length
        const avgSalary = allReviews.reduce((s, r) => s + (r.salary_accuracy_score || 0), 0) / allReviews.length

        await supabase
          .from('company_profiles')
          .update({
            culture_score: Math.round(avgCulture * 10) / 10,
            salary_accuracy_score: Math.round(avgSalary * 10) / 10,
          })
          .eq('id', pitch.company_id)
      }

      setSubmitted(true)

      // Trigger hire confirmation flow if both sides confirmed
      await fetch('/api/pitches/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch_id: pitchId, confirming_as: 'candidate' }),
      })

    } catch (err: any) {
      setError(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  function StarRating({ field, label, desc }: { field: keyof ReviewScores; label: string; desc: string }) {
    return (
      <div className="candor-card p-5">
        <div className="mb-3">
          <div className="font-bold text-white text-sm mb-0.5">{label}</div>
          <div className="text-xs text-w4">{desc}</div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setScores(prev => ({ ...prev, [field]: star }))}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${
                scores[field] >= star
                  ? 'border-candor-amber bg-candor-amber/20 text-candor-amber'
                  : 'border-white/10 bg-s2 text-w5 hover:border-white/20'
              }`}
            >
              ★
            </button>
          ))}
          {scores[field] > 0 && (
            <span className="text-sm text-w3 self-center ml-1">{scores[field]}/5</span>
          )}
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-candor-green/15 border border-candor-green/30 flex items-center justify-center mb-6 text-4xl">🎉</div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Review submitted.</h1>
        <p className="text-w3 text-base mb-2 max-w-sm leading-relaxed">
          Your verified review has been published on {pitch?.company?.company_name}'s Candor profile.
        </p>
        <p className="text-candor-green font-bold mb-8">£30 hire payment is being processed.</p>
        <Link href="/dashboard/candidate" className="candor-btn-primary px-6">Back to dashboard →</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/dashboard/candidate" className="text-w4 text-sm hover:text-w2 transition-colors">← Dashboard</Link>
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

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Verified review</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Rate your experience.</h1>
          <p className="text-w3 text-sm leading-relaxed">
            This review will be published permanently on {pitch?.company?.company_name}'s Candor profile. Future candidates will read it before deciding whether to engage. Be honest. It matters.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-candor-amber/10 border border-candor-amber/30 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-candor-amber mb-0.5">Complete this to unlock your £30 hire payment</div>
            <div className="text-xs text-candor-amber/70">Review + hire confirmation releases the payment within 30 days.</div>
          </div>
          <span className="text-2xl flex-shrink-0">💰</span>
        </div>

        <div className="space-y-3 mb-6">
          <StarRating
            field="salary_accuracy"
            label="Salary accuracy"
            desc="How accurate was the salary in the pitch compared to what was actually offered?"
          />
          <StarRating
            field="communication"
            label="Communication quality"
            desc="How responsive, clear, and professional was the company throughout the process?"
          />
          <StarRating
            field="fairness"
            label="Interview fairness"
            desc="Was the interview process fair, relevant, and respectful of your time?"
          />
          <StarRating
            field="culture_match"
            label="Culture match"
            desc="How accurate was the company's culture description compared to what you experienced?"
          />
        </div>

        <div className="mb-6">
          <label className="candor-label block mb-2">
            Written review
            <span className="text-w5 ml-2 normal-case font-normal">Optional but helpful for other candidates</span>
          </label>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="What would you tell a friend who was considering applying to this company? What surprised you? What should others know?"
            rows={4}
            className="candor-input resize-none"
            maxLength={600}
          />
          <div className="text-right text-xs text-w5 mt-1">{reviewText.length}/600</div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm mb-4">
            {error}
          </div>
        )}

        <div className="candor-card p-4 mb-5">
          <div className="candor-label mb-2">This review will</div>
          <div className="space-y-1.5">
            {[
              'Be published permanently on this company\'s Candor profile',
              'Contribute to their culture score and salary accuracy index',
              'Appear in the quarterly Candor Transparency Report',
              'Help future candidates make informed decisions',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-w2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5 5.5-5" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={submitReview}
          disabled={submitting || Object.values(scores).some(s => s === 0)}
          className="candor-btn-green w-full py-4 text-base"
        >
          {submitting ? 'Submitting...' : 'Submit verified review →'}
        </button>
        <p className="text-center text-xs text-w5 mt-3">Reviews are permanent and cannot be removed by the company.</p>
      </div>
    </div>
  )
}
