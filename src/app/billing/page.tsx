'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const COMPANY_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£299',
    period: '/month',
    credits: '20 pitches/month',
    color: '#4B7BFF',
    features: ['20 pitch credits/month', 'Salary transparency enforced', 'Basic culture profile', 'Standard matching', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '£799',
    period: '/month',
    credits: '75 pitches/month',
    color: '#23D160',
    popular: true,
    features: ['75 pitch credits/month', 'Full culture verification', 'Freelance pitches included', 'Priority matching', '1 sponsored problem/month', 'Dedicated support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '£2,000',
    period: '/month',
    credits: 'Unlimited pitches',
    color: '#F59E0B',
    features: ['Unlimited pitch credits', 'Dedicated account manager', 'Custom salary benchmarking', '3 sponsored problems/month', 'ATS integration', 'Verified Employer badge'],
  },
]

const CANDIDATE_PLANS = [
  {
    id: 'candidate_pro',
    name: 'Candor Pro',
    price: '£9.99',
    period: '/month',
    color: '#4B7BFF',
    features: ['Profile boost in matching', 'Full salary intelligence', 'Advanced availability settings', 'Career timeline', 'Priority wallet withdrawal', 'Salary negotiation benchmarks'],
  },
  {
    id: 'candidate_expert',
    name: 'Candor Expert',
    price: '£24.99',
    period: '/month',
    color: '#A78BFA',
    features: ['Expert badge on profile', 'Set your own session rate', 'Run sponsored office hours', 'Candor takes only 10% of earnings', 'Priority in Ask-an-expert', 'Monthly earnings dashboard'],
  },
]

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<'candidate' | 'company'>('company')
  const [currentPlan, setCurrentPlan] = useState<string>('none')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadBilling()

    if (searchParams.get('success')) {
      setMessage('✓ Subscription activated successfully. Your pitch credits are ready.')
    }
    if (searchParams.get('cancelled')) {
      setMessage('Checkout cancelled. No changes were made.')
    }
  }, [])

  async function loadBilling() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: userData } = await (supabase as any)
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (userData) setUserType(userData.user_type as any)

    if (userData?.user_type === 'company') {
      const { data: company } = await (supabase as any)
        .from('company_profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      if (company) setCurrentPlan(company.plan)
    } else {
      const { data: candidate } = await (supabase as any)
        .from('candidate_profiles')
        .select('is_pro, is_expert')
        .eq('user_id', user.id)
        .single()
      if (candidate) {
        if (candidate.is_expert) setCurrentPlan('candidate_expert')
        else if (candidate.is_pro) setCurrentPlan('candidate_pro')
      }
    }
    setLoading(false)
  }

  async function handleCheckout(planId: string) {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, user_type: userType }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch {
      setMessage('Failed to start checkout. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handleManageSubscription() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    if (data.portal_url) window.location.href = data.portal_url
  }

  const plans = userType === 'company' ? COMPANY_PLANS : CANDIDATE_PLANS
  const dashboardLink = userType === 'company' ? '/dashboard/company' : '/dashboard/candidate'

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href={dashboardLink} className="text-w4 text-sm hover:text-w2 transition-colors">
          ← Dashboard
        </Link>
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
        <div className="mb-8">
          <div className="candor-section-label">Billing</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            {userType === 'company' ? 'Choose your plan.' : 'Upgrade your account.'}
          </h1>
          <p className="text-w3 text-sm">
            {userType === 'company'
              ? 'Pay month to month. Cancel anytime. No long-term contracts.'
              : 'Join thousands of professionals getting more from Candor.'}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm ${
            message.startsWith('✓')
              ? 'bg-candor-green/10 border border-candor-green/30 text-candor-green'
              : 'bg-candor-amber/10 border border-candor-amber/30 text-candor-amber'
          }`}>
            {message}
          </div>
        )}

        {/* Current plan */}
        {currentPlan !== 'none' && (
          <div className="candor-card p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="candor-label mb-1">Current plan</div>
              <div className="font-bold text-white capitalize">{currentPlan.replace('_', ' ')}</div>
            </div>
            <button
              onClick={handleManageSubscription}
              className="candor-btn-secondary px-4 py-2 text-sm"
            >
              Manage subscription →
            </button>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id
            const isLoading = checkoutLoading === plan.id

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 relative transition-all ${
                  isCurrent
                    ? 'border-candor-green/40 bg-candor-green/5'
                    : 'border-white/10 bg-s1 hover:border-white/20'
                }`}
              >
                {(plan as any).popular && !isCurrent && (
                  <span
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold text-black"
                    style={{ background: plan.color }}
                  >
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute top-4 right-4 green-pill text-xs">Current plan</span>
                )}

                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div
                      className="text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: plan.color }}
                    >
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-w4">{plan.period}</span>
                    </div>
                    {(plan as any).credits && (
                      <div className="text-xs text-w4 mt-1">{(plan as any).credits}</div>
                    )}
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                      className="candor-btn-primary px-5 py-2.5 text-sm flex-shrink-0"
                      style={!isLoading ? { background: plan.color === '#23D160' ? '#23D160' : undefined } : {}}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        currentPlan === 'none' ? 'Get started →' : 'Switch plan →'
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {plan.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-w2">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5 5.5-5" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-w5 mt-8 leading-relaxed">
          All plans include a 14-day free trial. Cancel or change anytime. No hidden fees. VAT may apply.
        </p>
      </div>
    </div>
  )
}
