'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  { id: 1, label: 'Your company',   desc: 'Basic information about your organisation' },
  { id: 2, label: 'Verification',   desc: 'Confirm your company is real' },
  { id: 3, label: 'Culture',        desc: 'What it is like to work at your company' },
  { id: 4, label: 'Choose a plan',  desc: 'Select your pitch credit plan' },
]

const INDUSTRIES = [
  'Technology', 'Fintech', 'Healthcare', 'E-commerce', 'Media',
  'Education', 'Gaming', 'AI / ML', 'Cybersecurity', 'SaaS',
  'Consulting', 'Finance', 'Legal', 'Marketing', 'Logistics',
  'Property', 'Energy', 'Retail', 'Manufacturing', 'Other',
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£299',
    period: '/month',
    pitches: '20 pitches/month',
    color: '#4B7BFF',
    features: [
      '20 pitch credits per month',
      'Salary transparency enforced',
      'Basic culture profile',
      'Standard matching',
      'Email support',
    ],
    best_for: 'Startups hiring up to 3 roles/month',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '£799',
    period: '/month',
    pitches: '75 pitches/month',
    color: '#23D160',
    popular: true,
    features: [
      '75 pitch credits per month',
      'Full culture verification',
      'Freelance pitches included',
      'Priority matching',
      '1 sponsored problem/month',
      'Dedicated support',
    ],
    best_for: 'Scale-ups hiring regularly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '£2,000',
    period: '/month',
    pitches: 'Unlimited pitches',
    color: '#F59E0B',
    features: [
      'Unlimited pitch credits',
      'Dedicated account manager',
      'Custom salary benchmarking',
      '3 sponsored problems/month',
      'ATS integration',
      'Candor Verified Employer badge',
    ],
    best_for: 'Companies hiring at volume',
  },
]

export default function CompanyOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [sizeRange, setSizeRange] = useState('')
  const [description, setDescription] = useState('')

  // Step 2
  const [companiesHouseNumber, setCompaniesHouseNumber] = useState('')
  const [directorName, setDirectorName] = useState('')

  // Step 3
  const [remotePolicy, setRemotePolicy] = useState('')
  const [officeLocations, setOfficeLocations] = useState('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [foundedYear, setFoundedYear] = useState('')

  // Step 4
  const [selectedPlan, setSelectedPlan] = useState('growth')

  function canProceed() {
    switch (step) {
      case 1: return companyName && industry && sizeRange
      case 2: return companiesHouseNumber && directorName
      case 3: return remotePolicy && cultureDescription
      case 4: return selectedPlan
      default: return false
    }
  }

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: user.id,
          company_name: companyName,
          website: website || null,
          industry,
          size_range: sizeRange,
          description,
          companies_house_number: companiesHouseNumber,
          director_name: directorName,
          remote_policy: remotePolicy as any,
          office_locations: officeLocations
            .split(',')
            .map(l => l.trim())
            .filter(l => l.length > 0),
          culture_description: cultureDescription,
          founded_year: foundedYear ? parseInt(foundedYear) : null,
          plan: selectedPlan as any,
          pitch_credits: selectedPlan === 'starter' ? 20 : selectedPlan === 'growth' ? 75 : 999,
        })

      if (profileError) throw profileError

      await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', user.id)

      router.push('/dashboard/company')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
                <circle cx="6" cy="6" r="1.7" fill="black"/>
              </svg>
            </div>
            <span className="text-white font-semibold">Candor</span>
          </Link>
          <div className="text-w4 text-sm">Step {step} of {STEPS.length}</div>
        </div>
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(step / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #23D160, #4B7BFF)'
            }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-32">

        {/* Step indicators */}
        <div className="flex gap-2 mb-10">
          {STEPS.map(s => (
            <div
              key={s.id}
              className="flex-1 h-1 rounded-full transition-all"
              style={{ background: s.id <= step ? '#23D160' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>

        {/* STEP 1 — Company basics */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 1</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Your company.</h1>
              <p className="text-w3">Tell candidates who you are. The companies that are transparent about who they are get the best response rates.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="candor-label block mb-2">Company name <span className="text-candor-blue">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies Ltd"
                  className="candor-input"
                />
              </div>

              <div>
                <label className="candor-label block mb-2">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="candor-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="candor-label block mb-2">Industry <span className="text-candor-blue">*</span></label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="candor-label block mb-2">Company size <span className="text-candor-blue">*</span></label>
                  <select
                    value={sizeRange}
                    onChange={e => setSizeRange(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select size</option>
                    {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => (
                      <option key={s} value={s}>{s} employees</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="candor-label block mb-2">What does your company do?</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of your company and what you are building"
                  rows={3}
                  className="candor-input resize-none"
                  maxLength={400}
                />
                <div className="text-right text-xs text-w5 mt-1">{description.length}/400</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Verification */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 2</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Verification.</h1>
              <p className="text-w3">Candidates trust pitches from verified companies. We check your Companies House number to confirm you are a real registered business.</p>
            </div>

            <div className="p-4 rounded-xl bg-candor-blue/10 border border-candor-blue/30 mb-6">
              <p className="text-sm text-candor-blue leading-relaxed">
                Your Companies House number is public information. We use it to verify your company is registered in the UK. This takes less than 24 hours and unlocks your Candor Verified status.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="candor-label block mb-2">Companies House number <span className="text-candor-blue">*</span></label>
                <input
                  type="text"
                  value={companiesHouseNumber}
                  onChange={e => setCompaniesHouseNumber(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="candor-input"
                  maxLength={8}
                />
                <p className="text-xs text-w5 mt-1">
                  Find yours at{' '}
                  <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer" className="text-candor-blue hover:underline">
                    Companies House →
                  </a>
                </p>
              </div>

              <div>
                <label className="candor-label block mb-2">Director name <span className="text-candor-blue">*</span></label>
                <input
                  type="text"
                  value={directorName}
                  onChange={e => setDirectorName(e.target.value)}
                  placeholder="Full name of a registered director"
                  className="candor-input"
                />
                <p className="text-xs text-w5 mt-1">Must match the name registered at Companies House.</p>
              </div>

              <div className="candor-card p-5">
                <div className="candor-label mb-3">What verification unlocks</div>
                <div className="space-y-2">
                  {[
                    'Candor Verified Employer badge on all your pitches',
                    '3x higher pitch acceptance rates from candidates',
                    'Priority placement in the matching algorithm',
                    'Access to the full candidate pool',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm text-w2">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3 3 7-7" stroke="#23D160" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Culture */}
        {step === 3 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 3</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Your culture.</h1>
              <p className="text-w3">Candidates read your culture profile before deciding whether to engage with your pitch. Honest, specific culture data gets better responses than vague buzzwords.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="candor-label block mb-3">Remote policy <span className="text-candor-blue">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'remote', label: 'Fully remote', desc: 'Work from anywhere' },
                    { value: 'hybrid', label: 'Hybrid', desc: 'Mix of office and remote' },
                    { value: 'office', label: 'Office-based', desc: 'Primarily in office' },
                    { value: 'flexible', label: 'Flexible', desc: 'Team decides' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRemotePolicy(opt.value)}
                      type="button"
                      className={`p-4 rounded-xl border text-left transition-all ${
                        remotePolicy === opt.value
                          ? 'border-candor-green/50 bg-candor-green/10'
                          : 'border-white/10 bg-s1 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-white text-sm mb-1">{opt.label}</div>
                      <div className="text-xs text-w4">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="candor-label block mb-2">Office locations</label>
                <input
                  type="text"
                  value={officeLocations}
                  onChange={e => setOfficeLocations(e.target.value)}
                  placeholder="e.g. London, Manchester, Edinburgh"
                  className="candor-input"
                />
                <p className="text-xs text-w5 mt-1">Separate multiple locations with commas.</p>
              </div>

              <div>
                <label className="candor-label block mb-2">
                  Describe your culture <span className="text-candor-blue">*</span>
                </label>
                <textarea
                  value={cultureDescription}
                  onChange={e => setCultureDescription(e.target.value)}
                  placeholder="What is it actually like to work here? What do people value? What does a typical week look like? Be specific and honest — candidates can tell when it's marketing copy."
                  rows={5}
                  className="candor-input resize-none"
                  maxLength={600}
                />
                <div className="text-right text-xs text-w5 mt-1">{cultureDescription.length}/600</div>
              </div>

              <div>
                <label className="candor-label block mb-2">Year founded</label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={e => setFoundedYear(e.target.value)}
                  placeholder="e.g. 2019"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="candor-input"
                />
              </div>

              <div className="p-4 rounded-xl bg-s1 border border-white/10">
                <div className="candor-label mb-2">Candor culture rule</div>
                <p className="text-xs text-w4 leading-relaxed">
                  After your first hire through Candor, your culture score is calculated from verified candidate reviews covering communication quality, interview fairness, and culture match. Your profile updates automatically. Companies with a score below 3.0 receive a warning. Below 2.5 triggers a review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Plan selection */}
        {step === 4 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 4</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Choose your plan.</h1>
              <p className="text-w3">Start with whatever fits your hiring volume. You can upgrade or downgrade anytime. No long-term contracts.</p>
            </div>

            <div className="space-y-3 mb-6">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  type="button"
                  className={`w-full p-5 rounded-2xl border text-left transition-all relative ${
                    selectedPlan === plan.id
                      ? 'border-opacity-50 bg-opacity-10'
                      : 'border-white/10 bg-s1 hover:border-white/20'
                  }`}
                  style={selectedPlan === plan.id ? {
                    borderColor: plan.color + '80',
                    background: plan.color + '10',
                  } : {}}
                >
                  {plan.popular && (
                    <span
                      className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold text-black"
                      style={{ background: plan.color }}
                    >
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div
                        className="text-xs font-bold tracking-widest uppercase mb-1"
                        style={{ color: plan.color }}
                      >
                        {plan.name}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                        <span className="text-w4 text-sm">{plan.period}</span>
                      </div>
                      <div className="text-xs text-w4 mt-0.5">{plan.pitches}</div>
                    </div>

                    {/* Selected indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                        selectedPlan === plan.id ? 'border-opacity-100' : 'border-white/20'
                      }`}
                      style={selectedPlan === plan.id ? { borderColor: plan.color, background: plan.color } : {}}
                    >
                      {selectedPlan === plan.id && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-center gap-2.5 text-xs text-w2">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l2.5 2.5 5.5-5" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-w5">{plan.best_for}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-s1 border border-white/10">
              <p className="text-xs text-w4 leading-relaxed">
                You will not be charged today. Billing starts when your verification is complete and you send your first pitch. Cancel or change plan anytime from your dashboard.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-xl px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep(s => (s - 1) as any)}
              className={`candor-btn-secondary px-6 ${step === 1 ? 'invisible' : ''}`}
            >
              ← Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={() => canProceed() && setStep(s => (s + 1) as any)}
                disabled={!canProceed()}
                className="candor-btn-primary px-8"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading || !selectedPlan}
                className="candor-btn-green px-8"
              >
                {loading ? 'Setting up account...' : 'Complete setup →'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
