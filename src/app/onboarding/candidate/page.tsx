'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { EmploymentType, AvailabilityStatus } from '@/types/database'

const STEPS = [
  { id: 1, label: 'About you',      desc: 'Your current position and experience' },
  { id: 2, label: 'Your work',      desc: 'What you have built and achieved' },
  { id: 3, label: 'Your terms',     desc: 'Salary, availability, and what you want' },
  { id: 4, label: 'Your privacy',   desc: 'Control who can see you' },
]

const SKILLS_OPTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust',
  'Product Management', 'UX Design', 'Data Science', 'DevOps',
  'Machine Learning', 'System Design', 'Leadership', 'Growth',
  'Marketing', 'Sales', 'Finance', 'Operations', 'Legal',
  'iOS', 'Android', 'AWS', 'GCP', 'Azure', 'GraphQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes', 'Docker',
]

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
]

export default function CandidateOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 data
  const [currentTitle, setCurrentTitle] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Step 2 data — work experience
  const [workExp, setWorkExp] = useState([{
    company_name: '', title: '', start_date: '',
    end_date: '', is_current: false,
    description: '', outcomes: ['', '', '']
  }])

  // Step 3 data
  const [salaryFloor, setSalaryFloor] = useState('')
  const [availability, setAvailability] = useState<AvailabilityStatus>('open')
  const [noticePeriod, setNoticePeriod] = useState('')
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(['full-time'])
  const [remoteOnly, setRemoteOnly] = useState(false)

  // Step 4 data
  const [blockedDomains, setBlockedDomains] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')

  function toggleSkill(skill: string) {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < 10 ? [...prev, skill] : prev
    )
  }

  function toggleEmploymentType(type: EmploymentType) {
    setEmploymentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  function addWorkExp() {
    setWorkExp(prev => [...prev, {
      company_name: '', title: '', start_date: '',
      end_date: '', is_current: false,
      description: '', outcomes: ['', '', '']
    }])
  }

  function updateWorkExp(index: number, field: string, value: any) {
    setWorkExp(prev => prev.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    ))
  }

  function updateOutcome(expIndex: number, outcomeIndex: number, value: string) {
    setWorkExp(prev => prev.map((exp, i) =>
      i === expIndex ? {
        ...exp,
        outcomes: exp.outcomes.map((o, j) => j === outcomeIndex ? value : o)
      } : exp
    ))
  }

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create candidate profile
      const { data: profile, error: profileError } = await supabase
        .from('candidate_profiles')
        .insert({
          user_id: user.id,
          current_title: currentTitle,
          years_experience: parseInt(yearsExp) || 0,
          location,
          bio,
          skills: selectedSkills,
          salary_floor: Math.round(parseFloat(salaryFloor) * 100) || 0,
          availability,
          notice_period: noticePeriod,
          employment_types: employmentTypes,
          remote_only: remoteOnly,
          blocked_domains: blockedDomains
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0),
          is_anonymous: isAnonymous,
          display_name: displayName || currentTitle,
          anonymous_name: currentTitle || 'Professional',
          profile_completeness: calculateCompleteness(),
        })
        .select()
        .single()

      if (profileError) throw profileError

      // Insert work experience
      const validWorkExp = workExp.filter(exp => exp.company_name && exp.title)
      if (validWorkExp.length > 0) {
        await supabase.from('work_experience').insert(
          validWorkExp.map(exp => ({
            candidate_id: profile.id,
            company_name: exp.company_name,
            title: exp.title,
            start_date: exp.start_date,
            end_date: exp.is_current ? null : exp.end_date || null,
            is_current: exp.is_current,
            description: exp.description,
            outcomes: exp.outcomes.filter(o => o.trim()),
          }))
        )
      }

      // Mark onboarding complete
      await supabase
        .from('users')
        .update({ onboarding_complete: true })
        .eq('id', user.id)

      router.push('/dashboard/candidate')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function calculateCompleteness() {
    let score = 0
    if (currentTitle) score += 20
    if (selectedSkills.length > 0) score += 20
    if (salaryFloor) score += 20
    if (workExp[0]?.company_name) score += 20
    if (bio) score += 10
    if (location) score += 10
    return score
  }

  function canProceed() {
    switch (step) {
      case 1: return currentTitle && selectedSkills.length > 0
      case 2: return workExp[0]?.company_name && workExp[0]?.title
      case 3: return salaryFloor && employmentTypes.length > 0
      case 4: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
                <circle cx="6" cy="6" r="1.7" fill="black"/>
              </svg>
            </div>
            <span className="text-white font-semibold">Candor</span>
          </div>
          <div className="text-w4 text-sm">Step {step} of {STEPS.length}</div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(step / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #4B7BFF, #23D160)'
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
              className={`flex-1 h-1 rounded-full transition-all ${
                s.id <= step ? 'bg-candor-blue' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — About you */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 1</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">About you.</h1>
              <p className="text-w3">Tell us who you are professionally. This is the foundation of your profile.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="candor-label block mb-2">Current job title <span className="text-candor-blue">*</span></label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={e => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="candor-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="candor-label block mb-2">Years of experience</label>
                  <select
                    value={yearsExp}
                    onChange={e => setYearsExp(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select</option>
                    {['0-1', '1-2', '2-4', '4-6', '6-8', '8-10', '10-15', '15+'].map(y => (
                      <option key={y} value={y}>{y} years</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="candor-label block mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="candor-input"
                  />
                </div>
              </div>

              <div>
                <label className="candor-label block mb-2">Professional bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="In 2-3 sentences, what do you do and what makes you good at it?"
                  rows={3}
                  className="candor-input resize-none"
                  maxLength={300}
                />
                <div className="text-right text-xs text-w5 mt-1">{bio.length}/300</div>
              </div>

              <div>
                <label className="candor-label block mb-3">
                  Your skills <span className="text-candor-blue">*</span>
                  <span className="text-w5 ml-2 normal-case font-normal">Select up to 10</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-candor-blue/20 border border-candor-blue/50 text-candor-blue'
                          : 'bg-s1 border border-white/10 text-w3 hover:border-white/20'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-xs text-w4 mt-2">{selectedSkills.length}/10 selected</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Work experience */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 2</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Your work.</h1>
              <p className="text-w3">Not just where you worked — what you actually achieved. Outcomes matter more than job titles on Candor.</p>
            </div>

            <div className="space-y-6">
              {workExp.map((exp, index) => (
                <div key={index} className="candor-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="candor-label">Position {index + 1}</div>
                    {index > 0 && (
                      <button
                        onClick={() => setWorkExp(prev => prev.filter((_, i) => i !== index))}
                        className="text-xs text-w4 hover:text-candor-red transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="candor-label block mb-2">Company <span className="text-candor-blue">*</span></label>
                        <input
                          type="text"
                          value={exp.company_name}
                          onChange={e => updateWorkExp(index, 'company_name', e.target.value)}
                          placeholder="Company name"
                          className="candor-input"
                        />
                      </div>
                      <div>
                        <label className="candor-label block mb-2">Job title <span className="text-candor-blue">*</span></label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={e => updateWorkExp(index, 'title', e.target.value)}
                          placeholder="Your title"
                          className="candor-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="candor-label block mb-2">Start date</label>
                        <input
                          type="month"
                          value={exp.start_date}
                          onChange={e => updateWorkExp(index, 'start_date', e.target.value)}
                          className="candor-input"
                        />
                      </div>
                      <div>
                        <label className="candor-label block mb-2">End date</label>
                        {exp.is_current ? (
                          <div className="candor-input text-w4 flex items-center">Present</div>
                        ) : (
                          <input
                            type="month"
                            value={exp.end_date}
                            onChange={e => updateWorkExp(index, 'end_date', e.target.value)}
                            className="candor-input"
                          />
                        )}
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => updateWorkExp(index, 'is_current', !exp.is_current)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          exp.is_current
                            ? 'border-candor-blue bg-candor-blue'
                            : 'border-white/20 bg-transparent'
                        }`}
                      >
                        {exp.is_current && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-w2">I currently work here</span>
                    </label>

                    <div>
                      <label className="candor-label block mb-2">What did you do?</label>
                      <textarea
                        value={exp.description}
                        onChange={e => updateWorkExp(index, 'description', e.target.value)}
                        placeholder="Brief description of your role and responsibilities"
                        rows={2}
                        className="candor-input resize-none"
                      />
                    </div>

                    <div>
                      <label className="candor-label block mb-2">
                        Verifiable outcomes
                        <span className="text-w5 ml-2 normal-case font-normal">What did you actually achieve?</span>
                      </label>
                      {exp.outcomes.map((outcome, oIndex) => (
                        <input
                          key={oIndex}
                          type="text"
                          value={outcome}
                          onChange={e => updateOutcome(index, oIndex, e.target.value)}
                          placeholder={[
                            'e.g. Grew conversion rate from 12% to 34% in 6 months',
                            'e.g. Led a team of 8 engineers to ship v2.0 on time',
                            'e.g. Reduced infrastructure costs by 40% through optimisation',
                          ][oIndex]}
                          className={`candor-input ${oIndex < 2 ? 'mb-2' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {workExp.length < 5 && (
                <button
                  onClick={addWorkExp}
                  type="button"
                  className="candor-btn-secondary w-full py-3"
                >
                  + Add another role
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Your terms */}
        {step === 3 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 3</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Your terms.</h1>
              <p className="text-w3">Set your salary floor and what you are looking for. Companies that do not meet your floor cannot pitch you.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="candor-label block mb-2">
                  Minimum salary <span className="text-candor-blue">*</span>
                  <span className="text-w5 ml-2 normal-case font-normal">Annual, before tax (GBP)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-w3 font-semibold">£</span>
                  <input
                    type="number"
                    value={salaryFloor}
                    onChange={e => setSalaryFloor(e.target.value)}
                    placeholder="50000"
                    min="0"
                    className="candor-input pl-8"
                  />
                </div>
                {salaryFloor && (
                  <p className="text-xs text-w4 mt-1">
                    Companies pitching below £{parseInt(salaryFloor).toLocaleString()} will not be able to reach you
                  </p>
                )}
              </div>

              <div>
                <label className="candor-label block mb-3">
                  Availability <span className="text-candor-blue">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'open', label: 'Open', desc: 'Actively looking', color: 'green' },
                    { value: 'passive', label: 'Passive', desc: 'Open to good opportunities', color: 'blue' },
                    { value: 'closed', label: 'Closed', desc: 'Not looking right now', color: 'w4' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailability(opt.value as AvailabilityStatus)}
                      type="button"
                      className={`p-4 rounded-xl border text-left transition-all ${
                        availability === opt.value
                          ? opt.color === 'green'
                            ? 'border-candor-green/50 bg-candor-green/10'
                            : opt.color === 'blue'
                            ? 'border-candor-blue/50 bg-candor-blue/10'
                            : 'border-white/30 bg-white/5'
                          : 'border-white/10 bg-s1 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-white text-sm mb-1">{opt.label}</div>
                      <div className="text-xs text-w4 leading-relaxed">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="candor-label block mb-3">
                  Employment types <span className="text-candor-blue">*</span>
                  <span className="text-w5 ml-2 normal-case font-normal">Select all that apply</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYMENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleEmploymentType(type.value)}
                      type="button"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        employmentTypes.includes(type.value)
                          ? 'border-candor-blue/50 bg-candor-blue/10 text-candor-blue'
                          : 'border-white/10 bg-s1 text-w3 hover:border-white/20'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="candor-label block mb-2">Notice period</label>
                  <select
                    value={noticePeriod}
                    onChange={e => setNoticePeriod(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select</option>
                    <option value="immediate">Immediate</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
                <div>
                  <label className="candor-label block mb-2">Work preference</label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-s1 border border-white/10 h-[46px]">
                    <div
                      onClick={() => setRemoteOnly(!remoteOnly)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        remoteOnly
                          ? 'border-candor-blue bg-candor-blue'
                          : 'border-white/20 bg-transparent'
                      }`}
                    >
                      {remoteOnly && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-w2">Remote only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Privacy */}
        {step === 4 && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">Step 4</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Your privacy.</h1>
              <p className="text-w3">Control who can see you. Your boss will never know you are here unless you tell them.</p>
            </div>

            <div className="space-y-6">

              {/* Anonymous toggle */}
              <div className="candor-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-white mb-1">Stay anonymous by default</div>
                    <p className="text-sm text-w4 leading-relaxed">Companies see your role, skills, and salary expectations but not your name or current employer until you choose to reveal them.</p>
                  </div>
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${
                      isAnonymous ? 'bg-candor-green' : 'bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      isAnonymous ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="candor-label block mb-2">Your display name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="candor-input"
                  />
                </div>
              )}

              {/* Blocked domains */}
              <div>
                <label className="candor-label block mb-2">
                  Block specific companies
                  <span className="text-w5 ml-2 normal-case font-normal">They will never see your profile</span>
                </label>
                <textarea
                  value={blockedDomains}
                  onChange={e => setBlockedDomains(e.target.value)}
                  placeholder="Enter company email domains separated by commas&#10;e.g. currentemployer.com, exemployer.com"
                  rows={3}
                  className="candor-input resize-none"
                />
                <p className="text-xs text-w5 mt-1">These companies will not be able to see your profile even if they search for your skills.</p>
              </div>

              {/* What companies see */}
              <div className="candor-card p-5">
                <div className="candor-label mb-4">What companies will see</div>
                <div className="space-y-3">
                  {[
                    { label: 'Your job title', visible: true },
                    { label: 'Your skills', visible: true },
                    { label: 'Your salary floor', visible: true },
                    { label: 'Your years of experience', visible: true },
                    { label: 'Your work outcomes (anonymised)', visible: true },
                    { label: 'Your full name', visible: !isAnonymous },
                    { label: 'Your current employer', visible: !isAnonymous },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-w3">{item.label}</span>
                      <span className={`text-xs font-bold ${item.visible ? 'text-candor-green' : 'text-w5'}`}>
                        {item.visible ? '✓ Visible' : '✗ Hidden'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/90 backdrop-blur-xl px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(s => (s - 1) as any) : null}
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
                disabled={loading}
                className="candor-btn-green px-8"
              >
                {loading ? 'Creating profile...' : 'Complete profile →'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
