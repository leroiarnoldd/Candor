'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { CandidateProfile, CompanyProfile } from '@/types/database'
import { PITCH_PRICES } from '@/lib/stripe'

export default function NewPitch() {
  const router = useRouter()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'find' | 'compose'>('find')

  // Search filters
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchMaxSalary, setSearchMaxSalary] = useState('')
  const [searchAvailability, setSearchAvailability] = useState('open')

  // Pitch fields
  const [roleTitle, setRoleTitle] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [employmentType, setEmploymentType] = useState('full-time')
  const [location, setLocation] = useState('')
  const [remotePolicy, setRemotePolicy] = useState('')
  const [pitchMessage, setPitchMessage] = useState('')
  const [hiringManagerName, setHiringManagerName] = useState('')
  const [hiringManagerTitle, setHiringManagerTitle] = useState('')

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) setCompany(data)
    setLoading(false)
  }

  async function searchCandidates() {
    setLoading(true)

    let query = supabase
      .from('candidate_profiles')
      .select('*')
      .eq('availability', searchAvailability || 'open')
      .neq('user_id', (await supabase.auth.getUser()).data.user?.id)

    if (searchSkill) {
      query = query.contains('skills', [searchSkill])
    }

    if (searchLocation) {
      query = query.ilike('location', `%${searchLocation}%`)
    }

    if (searchMaxSalary) {
      query = query.lte('salary_floor', parseInt(searchMaxSalary) * 100)
    }

    const { data } = await query.limit(20)
    if (data) setCandidates(data)
    setLoading(false)
  }

  function selectCandidate(candidate: CandidateProfile) {
    setSelectedCandidate(candidate)
    setStep('compose')
  }

  async function sendPitch() {
    if (!company || !selectedCandidate) return
    if (!roleTitle || !salaryMin || !pitchMessage || !hiringManagerName) {
      setError('Please fill in all required fields.')
      return
    }
    if ((company.pitch_credits || 0) < 1) {
      setError('You have no pitch credits remaining. Please top up to continue.')
      return
    }

    setSending(true)
    setError('')

    try {
      // Create the pitch
      const { error: pitchError } = await supabase.from('pitches').insert({
        company_id: company.id,
        candidate_id: selectedCandidate.id,
        role_title: roleTitle,
        salary_min: Math.round(parseFloat(salaryMin) * 100),
        salary_max: salaryMax ? Math.round(parseFloat(salaryMax) * 100) : null,
        employment_type: employmentType as any,
        location: location || null,
        remote_policy: remotePolicy || null,
        pitch_message: pitchMessage,
        hiring_manager_name: hiringManagerName,
        hiring_manager_title: hiringManagerTitle || null,
        status: 'sent',
      })

      if (pitchError) throw pitchError

      // Deduct one pitch credit
      await supabase
        .from('company_profiles')
        .update({ pitch_credits: (company.pitch_credits || 1) - 1 })
        .eq('id', company.id)

      // Create notification for candidate
      const { data: candidateUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', selectedCandidate.user_id)
        .single()

      if (candidateUser) {
        await supabase.from('notifications').insert({
          user_id: candidateUser.id,
          type: 'new_pitch',
          title: 'New pitch received',
          message: `${company.company_name} has pitched you for a ${roleTitle} role at ${formatSalary(parseInt(salaryMin) * 100)}.`,
          action_url: '/dashboard/candidate',
        })
      }

      router.push('/dashboard/company?pitched=true')
    } catch (err: any) {
      setError(err.message || 'Failed to send pitch.')
    } finally {
      setSending(false)
    }
  }

  function formatSalary(pence: number) {
    return `£${(pence / 100).toLocaleString()}`
  }

  if (loading && !candidates.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-w4">
          <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === 'compose' ? setStep('find') : router.back()}
            className="text-w4 hover:text-w2 transition-colors text-sm flex items-center gap-2"
          >
            ← {step === 'compose' ? 'Back to search' : 'Dashboard'}
          </button>
        </div>
        <div className="text-w4 text-sm">
          {company?.pitch_credits || 0} credits remaining
        </div>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">

        {/* STEP 1 — Find candidate */}
        {step === 'find' && (
          <div>
            <div className="mb-8">
              <div className="candor-section-label">New pitch</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Find a candidate.</h1>
              <p className="text-w3 text-sm">Search verified professionals by skill, location, and salary expectation. Every profile is real and verified.</p>
            </div>

            {/* Search filters */}
            <div className="candor-card p-5 mb-6">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="candor-label block mb-2">Skill</label>
                  <input
                    type="text"
                    value={searchSkill}
                    onChange={e => setSearchSkill(e.target.value)}
                    placeholder="e.g. React, Product Management"
                    className="candor-input"
                    onKeyDown={e => e.key === 'Enter' && searchCandidates()}
                  />
                </div>
                <div>
                  <label className="candor-label block mb-2">Location</label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    placeholder="e.g. London"
                    className="candor-input"
                    onKeyDown={e => e.key === 'Enter' && searchCandidates()}
                  />
                </div>
                <div>
                  <label className="candor-label block mb-2">Max salary expectation (£/yr)</label>
                  <input
                    type="number"
                    value={searchMaxSalary}
                    onChange={e => setSearchMaxSalary(e.target.value)}
                    placeholder="e.g. 80000"
                    className="candor-input"
                  />
                </div>
                <div>
                  <label className="candor-label block mb-2">Availability</label>
                  <select
                    value={searchAvailability}
                    onChange={e => setSearchAvailability(e.target.value)}
                    className="candor-input"
                  >
                    <option value="open">Actively looking</option>
                    <option value="passive">Open to opportunities</option>
                  </select>
                </div>
              </div>
              <button
                onClick={searchCandidates}
                className="candor-btn-primary w-full py-3"
              >
                Search candidates
              </button>
            </div>

            {/* Results */}
            {candidates.length > 0 && (
              <div>
                <div className="candor-label mb-3">{candidates.length} candidates found</div>
                <div className="space-y-3">
                  {candidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className="candor-card p-5 cursor-pointer hover:border-white/20 transition-all"
                      onClick={() => selectCandidate(candidate)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-s2 border border-white/10 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {candidate.anonymous_name?.[0] || 'P'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm mb-1">
                              {candidate.current_title || 'Professional'}
                            </div>
                            {candidate.location && (
                              <div className="text-xs text-w4 mb-2">{candidate.location}</div>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="blue-pill text-[10px] px-2 py-0.5">{skill}</span>
                              ))}
                              {candidate.skills.length > 4 && (
                                <span className="text-[10px] text-w5 self-center">+{candidate.skills.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-candor-green font-bold text-sm">
                            {formatSalary(candidate.salary_floor)}+
                          </div>
                          <div className="text-xs text-w4 mt-0.5">min salary</div>
                          <div className={`mt-2 text-[10px] font-bold uppercase ${
                            candidate.availability === 'open' ? 'text-candor-green' : 'text-candor-blue'
                          }`}>
                            {candidate.availability === 'open' ? '● Active' : '● Passive'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="text-xs text-w5">
                          {candidate.years_experience} years experience · {candidate.profile_completeness}% profile complete
                        </div>
                        <button className="text-xs font-bold text-candor-green hover:underline">
                          Pitch this candidate →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {candidates.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-w4 text-sm">Search above to find matching candidates.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Compose pitch */}
        {step === 'compose' && selectedCandidate && (
          <div>
            <div className="mb-6">
              <div className="candor-section-label">Compose pitch</div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Write your pitch.</h1>
              <p className="text-w3 text-sm">Every field matters. Candidates decide in under 60 seconds whether to engage. Salary on the first message is not optional — it is enforced.</p>
            </div>

            {/* Candidate preview */}
            <div className="p-4 rounded-2xl bg-candor-blue/10 border border-candor-blue/30 mb-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-s1 border border-white/10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {selectedCandidate.anonymous_name?.[0] || 'P'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{selectedCandidate.current_title}</div>
                <div className="text-xs text-w4">Minimum salary: {formatSalary(selectedCandidate.salary_floor)}/year</div>
              </div>
              <button
                onClick={() => setStep('find')}
                className="ml-auto text-xs text-w4 hover:text-w2 transition-colors"
              >
                Change →
              </button>
            </div>

            <div className="space-y-5">
              {/* Salary — first and mandatory */}
              <div className="p-5 rounded-2xl bg-candor-green/10 border border-candor-green/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="candor-label" style={{ color: '#23D160' }}>Salary — required</div>
                  <span className="text-[10px] text-candor-green font-bold px-2 py-0.5 rounded-full bg-candor-green/20">ENFORCED</span>
                </div>
                <p className="text-xs text-candor-green/70 mb-4 leading-relaxed">
                  This candidate expects a minimum of {formatSalary(selectedCandidate.salary_floor)}/year. Your pitch will only be delivered if your salary meets or exceeds their floor.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="candor-label block mb-2">Salary minimum <span className="text-candor-green">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-w3 font-semibold">£</span>
                      <input
                        type="number"
                        value={salaryMin}
                        onChange={e => setSalaryMin(e.target.value)}
                        placeholder="60000"
                        className="candor-input pl-8"
                        min={selectedCandidate.salary_floor / 100}
                      />
                    </div>
                    {salaryMin && parseInt(salaryMin) * 100 < selectedCandidate.salary_floor && (
                      <p className="text-xs text-candor-red mt-1">Below candidate's minimum. Pitch will not be delivered.</p>
                    )}
                  </div>
                  <div>
                    <label className="candor-label block mb-2">Salary maximum</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-w3 font-semibold">£</span>
                      <input
                        type="number"
                        value={salaryMax}
                        onChange={e => setSalaryMax(e.target.value)}
                        placeholder="80000"
                        className="candor-input pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="candor-label block mb-2">Role title <span className="text-candor-blue">*</span></label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="candor-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="candor-label block mb-2">Employment type</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value)}
                    className="candor-input"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="candor-label block mb-2">Remote policy</label>
                  <select
                    value={remotePolicy}
                    onChange={e => setRemotePolicy(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select</option>
                    <option value="remote">Fully remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="office">Office-based</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="candor-label block mb-2">Your name <span className="text-candor-blue">*</span></label>
                  <input
                    type="text"
                    value={hiringManagerName}
                    onChange={e => setHiringManagerName(e.target.value)}
                    placeholder="Your full name"
                    className="candor-input"
                  />
                </div>
                <div>
                  <label className="candor-label block mb-2">Your title</label>
                  <input
                    type="text"
                    value={hiringManagerTitle}
                    onChange={e => setHiringManagerTitle(e.target.value)}
                    placeholder="e.g. Head of Engineering"
                    className="candor-input"
                  />
                </div>
              </div>

              <div>
                <label className="candor-label block mb-2">
                  Your pitch <span className="text-candor-blue">*</span>
                  <span className="text-w5 ml-2 normal-case font-normal">Why should they talk to you?</span>
                </label>
                <textarea
                  value={pitchMessage}
                  onChange={e => setPitchMessage(e.target.value)}
                  placeholder="Write a personal, specific pitch. Mention what caught your attention about their profile. Explain what the role involves and why it could be interesting for them. Generic messages get ignored."
                  rows={6}
                  className="candor-input resize-none"
                  maxLength={800}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-w5">Longer, specific pitches get 3x higher response rates.</p>
                  <span className="text-xs text-w5">{pitchMessage.length}/800</span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
                  {error}
                </div>
              )}

              {/* Cost and send */}
              <div className="p-5 rounded-2xl bg-s1 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="candor-label">Pitch cost</div>
                  <div className="font-bold text-white">
                    1 credit ({employmentType === 'freelance' ? '£35' : '£50'})
                  </div>
                </div>
                <div className="text-xs text-w4 leading-relaxed mb-4">
                  This deducts 1 pitch credit from your account. If this pitch leads to a confirmed hire, £30 will be paid directly to the candidate from the platform.
                </div>
                <button
                  onClick={sendPitch}
                  disabled={
                    sending ||
                    !roleTitle ||
                    !salaryMin ||
                    !pitchMessage ||
                    !hiringManagerName ||
                    (parseInt(salaryMin) * 100 < selectedCandidate.salary_floor)
                  }
                  className="candor-btn-green w-full py-3.5 text-base"
                >
                  {sending ? 'Sending pitch...' : 'Send pitch →'}
                </button>
                <p className="text-center text-xs text-w5 mt-3">
                  {company?.pitch_credits || 0} credits remaining after this pitch.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
