'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CandidateProfile, AvailabilityStatus } from '@/types/database'

const SKILLS_OPTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust',
  'Product Management', 'UX Design', 'Data Science', 'DevOps',
  'Machine Learning', 'System Design', 'Leadership', 'Growth',
  'Marketing', 'Sales', 'Finance', 'Operations', 'Legal',
  'iOS', 'Android', 'AWS', 'GCP', 'Azure', 'GraphQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes', 'Docker',
]

export default function ProfileEdit() {
  const router = useRouter()
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [currentTitle, setCurrentTitle] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [salaryFloor, setSalaryFloor] = useState('')
  const [availability, setAvailability] = useState<AvailabilityStatus>('open')
  const [noticePeriod, setNoticePeriod] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [blockedDomains, setBlockedDomains] = useState('')
  const [customSkill, setCustomSkill] = useState('')

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setCurrentTitle(data.current_title || '')
      setBio(data.bio || '')
      setLocation(data.location || '')
      setYearsExp(data.years_experience?.toString() || '')
      setSkills(data.skills || [])
      setSalaryFloor(data.salary_floor ? (data.salary_floor / 100).toString() : '')
      setAvailability(data.availability)
      setNoticePeriod(data.notice_period || '')
      setRemoteOnly(data.remote_only)
      setIsAnonymous(data.is_anonymous)
      setDisplayName(data.display_name || '')
      setBlockedDomains((data.blocked_domains || []).join(', '))
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const completeness = calculateCompleteness()

      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update({
          current_title: currentTitle,
          bio,
          location,
          years_experience: yearsExp ? parseInt(yearsExp) : null,
          skills,
          salary_floor: salaryFloor ? Math.round(parseFloat(salaryFloor) * 100) : 0,
          availability,
          notice_period: noticePeriod || null,
          remote_only: remoteOnly,
          is_anonymous: isAnonymous,
          display_name: displayName || currentTitle,
          anonymous_name: currentTitle || 'Professional',
          blocked_domains: blockedDomains
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0),
          profile_completeness: completeness,
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  function calculateCompleteness() {
    let score = 0
    if (currentTitle) score += 20
    if (skills.length > 0) score += 20
    if (salaryFloor) score += 20
    if (bio) score += 15
    if (location) score += 10
    if (yearsExp) score += 10
    if (noticePeriod) score += 5
    return score
  }

  function toggleSkill(skill: string) {
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < 10 ? [...prev, skill] : prev
    )
  }

  function addCustomSkill() {
    if (customSkill.trim() && !skills.includes(customSkill.trim()) && skills.length < 10) {
      setSkills(prev => [...prev, customSkill.trim()])
      setCustomSkill('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/dashboard/candidate" className="text-w4 text-sm hover:text-w2 transition-colors flex items-center gap-2">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-candor-green text-sm font-semibold">✓ Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="candor-btn-primary px-5 py-2 text-sm"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">

        <div className="mb-8">
          <div className="candor-section-label">Edit profile</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Your profile.</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${calculateCompleteness()}%`,
                  background: calculateCompleteness() >= 80 ? '#23D160' : '#4B7BFF',
                }}
              />
            </div>
            <span className="text-sm font-bold text-white flex-shrink-0">{calculateCompleteness()}%</span>
          </div>
        </div>

        <div className="space-y-6">

          {/* Basic info */}
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Basic information</div>
            <div className="space-y-4">
              <div>
                <label className="candor-label block mb-2">Current job title</label>
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
                  <label className="candor-label block mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="candor-input"
                  />
                </div>
                <div>
                  <label className="candor-label block mb-2">Years of experience</label>
                  <select
                    value={yearsExp}
                    onChange={e => setYearsExp(e.target.value)}
                    className="candor-input"
                  >
                    <option value="">Select</option>
                    {['0-1','1-2','2-4','4-6','6-8','8-10','10-15','15+'].map(y => (
                      <option key={y} value={y}>{y} years</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="candor-label block mb-2">Bio</label>
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
            </div>
          </div>

          {/* Skills */}
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Skills ({skills.length}/10)</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {SKILLS_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    skills.includes(skill)
                      ? 'bg-candor-blue/20 border border-candor-blue/50 text-candor-blue'
                      : 'bg-s2 border border-white/10 text-w3 hover:border-white/20'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {/* Custom skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                placeholder="Add a custom skill"
                className="candor-input flex-1"
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
              />
              <button
                onClick={addCustomSkill}
                className="candor-btn-secondary px-4"
                disabled={!customSkill.trim() || skills.length >= 10}
              >
                Add
              </button>
            </div>

            {/* Selected custom skills not in the preset list */}
            {skills.filter(s => !SKILLS_OPTIONS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.filter(s => !SKILLS_OPTIONS.includes(s)).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-candor-purple/20 border border-candor-purple/50 text-candor-purple"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Your terms</div>
            <div className="space-y-4">
              <div>
                <label className="candor-label block mb-2">Minimum salary (£/year)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-w3 font-semibold">£</span>
                  <input
                    type="number"
                    value={salaryFloor}
                    onChange={e => setSalaryFloor(e.target.value)}
                    placeholder="50000"
                    className="candor-input pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="candor-label block mb-3">Availability</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'open', label: 'Open', color: 'green' },
                    { value: 'passive', label: 'Passive', color: 'blue' },
                    { value: 'closed', label: 'Closed', color: 'w4' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailability(opt.value as AvailabilityStatus)}
                      type="button"
                      className={`p-3 rounded-xl border text-center transition-all ${
                        availability === opt.value
                          ? opt.color === 'green' ? 'border-candor-green/50 bg-candor-green/10 text-candor-green'
                          : opt.color === 'blue' ? 'border-candor-blue/50 bg-candor-blue/10 text-candor-blue'
                          : 'border-white/30 bg-white/5 text-w2'
                          : 'border-white/10 bg-s2 text-w4 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-sm">{opt.label}</div>
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
                    {['Immediate', '1 week', '2 weeks', '1 month', '3 months', '6 months'].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-s2 border border-white/10 w-full h-[46px]">
                    <div
                      onClick={() => setRemoteOnly(!remoteOnly)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        remoteOnly ? 'border-candor-blue bg-candor-blue' : 'border-white/20'
                      }`}
                    >
                      {remoteOnly && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-w2">Remote only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Privacy settings</div>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-white text-sm mb-1">Stay anonymous</div>
                  <p className="text-xs text-w4 leading-relaxed">Your name and employer stay hidden until you reveal them to a specific company.</p>
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

              {!isAnonymous && (
                <div>
                  <label className="candor-label block mb-2">Display name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="candor-input"
                  />
                </div>
              )}

              <div>
                <label className="candor-label block mb-2">
                  Blocked company domains
                  <span className="text-w5 ml-2 normal-case font-normal">These companies cannot see you</span>
                </label>
                <textarea
                  value={blockedDomains}
                  onChange={e => setBlockedDomains(e.target.value)}
                  placeholder="youremployer.com, excompany.com"
                  rows={2}
                  className="candor-input resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="candor-btn-primary w-full py-4 text-base"
          >
            {saving ? 'Saving...' : 'Save all changes →'}
          </button>
        </div>
      </div>
    </div>
  )
}
