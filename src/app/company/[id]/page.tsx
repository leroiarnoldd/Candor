'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { formatDate, timeAgo } from '@/lib/utils'

export default function CompanyPublicPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCompany() }, [companyId])

  async function loadCompany() {
    const { data: c } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .eq('is_active', true)
      .single()

    if (!c) { router.push('/'); return }
    setCompany(c)

    const { data: r } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (r) setReviews(r)
    setLoading(false)
  }

  function StarRow({ label, score }: { label: string; score: number }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-w3">{label}</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`w-3 h-3 rounded-sm ${score >= s ? 'bg-candor-amber' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-white">{score.toFixed(1)}</span>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
    </div>
  )
  if (!company) return null

  const avgScore = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.overall_score || 0), 0) / reviews.length
    : 0

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
        <Link href="/" className="text-w4 text-sm hover:text-w2 transition-colors">← Home</Link>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">

        {/* Company header */}
        <div className="candor-card p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-s2 border border-white/10 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {company.company_name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{company.company_name}</h1>
                  {company.is_candor_verified && (
                    <span className="green-pill text-xs">✓ Verified</span>
                  )}
                </div>
                {company.industry && <div className="text-sm text-w4">{company.industry}</div>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-candor-blue text-xs hover:underline mt-0.5 block">
                    {company.website}
                  </a>
                )}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="text-center flex-shrink-0">
                <div className="text-3xl font-bold text-white">{avgScore.toFixed(1)}</div>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-lg ${avgScore >= s ? 'text-candor-amber' : 'text-w5'}`}>★</span>
                  ))}
                </div>
                <div className="text-xs text-w4 mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>

          {company.description && (
            <p className="text-sm text-w2 leading-relaxed mb-4">{company.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            {[
              { label: 'Size', value: company.size_range ? `${company.size_range} employees` : null },
              { label: 'Remote policy', value: company.remote_policy },
              { label: 'Founded', value: company.founded_year?.toString() },
              { label: 'Ghosting incidents', value: company.ghosting_incidents > 0 ? company.ghosting_incidents.toString() : '0', alert: company.ghosting_incidents > 2 },
            ].filter(i => i.value !== null && i.value !== undefined).map(item => (
              <div key={item.label}>
                <div className="text-xs text-w4 mb-0.5">{item.label}</div>
                <div className={`text-sm font-bold capitalize ${(item as any).alert ? 'text-candor-red' : 'text-white'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scores */}
        {reviews.length > 0 && (
          <div className="candor-card p-5 mb-5">
            <div className="candor-label mb-4">Verified scores</div>
            <div className="space-y-3">
              <StarRow label="Culture score" score={company.culture_score || 0} />
              <StarRow label="Salary accuracy" score={company.salary_accuracy_score || 0} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-w3">Hire rate</span>
                <span className="text-sm font-bold text-white">{(company.hire_rate || 0).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-w5 mt-3 leading-relaxed">
              Scores calculated from {reviews.length} verified post-hire candidate reviews. Updated automatically. Cannot be purchased or suppressed.
            </p>
          </div>
        )}

        {/* Culture */}
        {company.culture_description && (
          <div className="candor-card p-5 mb-5">
            <div className="candor-label mb-3">Culture</div>
            <p className="text-sm text-w2 leading-relaxed">{company.culture_description}</p>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="candor-label mb-4">
            {reviews.length > 0 ? `${reviews.length} verified review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
          </div>

          {reviews.length === 0 ? (
            <div className="candor-card p-6 text-center">
              <p className="text-w4 text-sm">Reviews appear here after candidates are hired through Candor. Every review is verified and permanent.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="candor-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-base ${(review.overall_score || 0) >= s ? 'text-candor-amber' : 'text-w5'}`}>★</span>
                      ))}
                    </div>
                    <div className="text-xs text-w5">{timeAgo(review.created_at)}</div>
                  </div>

                  {review.review_text && (
                    <p className="text-sm text-w2 leading-relaxed mb-3">{review.review_text}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                    {[
                      { label: 'Salary accuracy', score: review.salary_accuracy_score },
                      { label: 'Communication', score: review.communication_score },
                      { label: 'Fairness', score: review.fairness_score },
                      { label: 'Culture match', score: review.culture_match_score },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-w4">{s.label}</span>
                        <span className="text-xs font-bold text-white">{s.score}/5</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="green-pill text-[10px] px-1.5 py-0.5">✓ Verified review</span>
                    <span className="text-[10px] text-w5">Cannot be deleted by company</span>
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
