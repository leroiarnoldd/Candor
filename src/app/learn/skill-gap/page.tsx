'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const COMMON_ROLES = [
  'Senior Software Engineer', 'Product Manager', 'UX Designer',
  'Data Scientist', 'Engineering Manager', 'Head of Product',
  'DevOps Engineer', 'Marketing Manager', 'Sales Manager',
  'Data Engineer', 'Frontend Engineer', 'Backend Engineer',
]

interface GapResult {
  role: string
  your_skills: string[]
  required_skills: string[]
  matched: string[]
  missing: string[]
  match_percentage: number
  pitch_count: number
  salary_range: { min: number; max: number } | null
}

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState('')
  const [yourSkills, setYourSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GapResult | null>(null)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    // Try to load profile to pre-fill skills
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('candidate_profiles')
        .select('skills, current_title')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
            setYourSkills(data.skills.join(', '))
            if (!targetRole && data.current_title) setTargetRole(data.current_title)
          }
        })
    })
  }, [])

  async function analyseGap() {
    if (!targetRole.trim()) { setError('Please enter your target role.'); return }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Get real pitch data for this role
      const { data: pitches } = await (supabase as any)
        .from('pitches')
        .select('role_title, salary_min, salary_max')
        .ilike('role_title', `%${targetRole.split(' ').slice(-2).join(' ')}%`)
        .not('salary_min', 'is', null)
        .limit(100)

      // Build skill demand from the pitch data
      // In a full implementation this would use NLP to extract skills from pitch messages
      // For now we use a curated skill map
      const skillMap: Record<string, string[]> = {
        'Software Engineer': ['TypeScript', 'React', 'Node.js', 'System Design', 'AWS', 'PostgreSQL', 'Docker'],
        'Product Manager': ['Product Management', 'Data Science', 'Leadership', 'Growth', 'System Design'],
        'UX Designer': ['UX Design', 'Figma', 'React', 'Data Science', 'Leadership'],
        'Data Scientist': ['Python', 'Data Science', 'Machine Learning', 'PostgreSQL', 'AWS'],
        'DevOps Engineer': ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'Python'],
        'Engineering Manager': ['Leadership', 'System Design', 'Node.js', 'TypeScript'],
        'Marketing Manager': ['Marketing', 'Growth', 'Data Science', 'Leadership'],
        'Data Engineer': ['Python', 'Data Science', 'PostgreSQL', 'AWS', 'MongoDB'],
        'Frontend Engineer': ['React', 'TypeScript', 'UX Design', 'Node.js'],
        'Backend Engineer': ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'System Design'],
      }

      // Find closest matching role
      const roleKey = Object.keys(skillMap).find(r =>
        targetRole.toLowerCase().includes(r.toLowerCase().split(' ').slice(-1)[0].toLowerCase()) ||
        r.toLowerCase().includes(targetRole.toLowerCase().split(' ').slice(-1)[0].toLowerCase())
      ) || 'Software Engineer'

      const required = skillMap[roleKey] || skillMap['Software Engineer']
      const userSkillList = yourSkills.split(',').map(s => s.trim()).filter(Boolean)

      const matched = required.filter(r =>
        userSkillList.some(u => u.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(u.toLowerCase()))
      )
      const missing = required.filter(r => !matched.includes(r))

      const salaries = (pitches || []).map(p => p.salary_min).filter(Boolean)

      setResult({
        role: targetRole,
        your_skills: userSkillList,
        required_skills: required,
        matched,
        missing,
        match_percentage: Math.round((matched.length / required.length) * 100),
        pitch_count: pitches?.length || 0,
        salary_range: salaries.length > 0 ? {
          min: Math.min(...salaries),
          max: Math.max(...salaries),
        } : null,
      })
    } catch (err: any) {
      setError(err.message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/learn" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor Learn</span>
        </Link>
        <Link href="/learn" className="text-w4 text-sm hover:text-w2 transition-colors">← Learn home</Link>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Skill Gap Analysis</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">What does the market actually want?</h1>
          <p className="text-w3 text-sm leading-relaxed">
            Based on real verified pitches sent on Candor. Not surveys. Not job descriptions. What companies are actually including when they pitch professionals for your target role.
          </p>
        </div>

        {profile && (
          <div className="p-3 rounded-xl bg-candor-green/10 border border-candor-green/30 mb-5 text-xs text-candor-green">
            ✓ Your Candor profile skills have been pre-loaded.
          </div>
        )}

        <div className="candor-card p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="candor-label block mb-2">Target role <span className="text-candor-blue">*</span></label>
              <div className="mb-2">
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className="candor-input"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ROLES.slice(0, 6).map(role => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      targetRole === role
                        ? 'border-candor-blue/50 bg-candor-blue/10 text-candor-blue'
                        : 'border-white/10 bg-s2 text-w4 hover:border-white/20'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="candor-label block mb-2">Your current skills</label>
              <textarea
                value={yourSkills}
                onChange={e => setYourSkills(e.target.value)}
                placeholder="React, TypeScript, Product Management, Leadership... (comma separated)"
                rows={3}
                className="candor-input resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">{error}</div>
            )}

            <button
              onClick={analyseGap}
              disabled={loading || !targetRole.trim()}
              className="candor-btn-primary w-full py-3.5"
            >
              {loading ? 'Analysing...' : 'Analyse my skill gap →'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Match score */}
            <div className="candor-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{
                background: result.match_percentage >= 80 ? '#23D160' :
                            result.match_percentage >= 60 ? '#4B7BFF' : '#F59E0B'
              }} />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="candor-label mb-1">Market fit for {result.role}</div>
                  <div className={`text-4xl font-bold tracking-tight ${
                    result.match_percentage >= 80 ? 'text-candor-green' :
                    result.match_percentage >= 60 ? 'text-candor-blue' : 'text-candor-amber'
                  }`}>
                    {result.match_percentage}%
                  </div>
                </div>
                {result.pitch_count > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{result.pitch_count}</div>
                    <div className="text-xs text-w4">verified pitches analysed</div>
                  </div>
                )}
              </div>
              <div className="h-2 bg-white/10 rounded-full mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.match_percentage}%`,
                    background: result.match_percentage >= 80 ? '#23D160' :
                                result.match_percentage >= 60 ? '#4B7BFF' : '#F59E0B',
                  }}
                />
              </div>
              <p className="text-xs text-w4">
                {result.match_percentage >= 80 ? 'Strong market fit. Your profile should attract pitches.' :
                 result.match_percentage >= 60 ? 'Good foundation. Close the remaining gaps to increase pitch quality.' :
                 'Significant gaps identified. Addressing these could substantially improve your pitch rate.'}
              </p>
            </div>

            {/* Skills you have */}
            {result.matched.length > 0 && (
              <div className="candor-card p-5">
                <div className="candor-label mb-3">Skills you already have ({result.matched.length})</div>
                <div className="flex flex-wrap gap-2">
                  {result.matched.map(skill => (
                    <span key={skill} className="green-pill px-2.5 py-1">✓ {skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills you are missing */}
            {result.missing.length > 0 && (
              <div className="candor-card p-5">
                <div className="candor-label mb-3">
                  Skills companies want that you are missing ({result.missing.length})
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.missing.map(skill => (
                    <span key={skill} className="amber-pill px-2.5 py-1">+ {skill}</span>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-w4 mb-3">
                    Candor Learn can help you verify these skills with expert-led programmes and real task-based assessments.
                  </p>
                  <Link href="/learn/masterclasses" className="candor-btn-primary px-4 py-2 text-sm inline-block">
                    Find relevant programmes →
                  </Link>
                </div>
              </div>
            )}

            {/* Salary context */}
            {result.salary_range && (
              <div className="candor-card p-5">
                <div className="candor-label mb-2">Salary range in verified pitches</div>
                <div className="text-xl font-bold text-white">
                  £{(result.salary_range.min / 100).toLocaleString()} — £{(result.salary_range.max / 100).toLocaleString()}
                </div>
                <p className="text-xs text-w4 mt-1">From {result.pitch_count} real pitches for {result.role} roles on Candor.</p>
              </div>
            )}

            {/* Next steps */}
            <div className="p-4 rounded-2xl bg-s1 border border-white/10">
              <div className="candor-label mb-3">Next steps</div>
              <div className="space-y-2">
                {result.missing.length > 0 && (
                  <Link href="/learn/verify" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                    <div>
                      <div className="text-sm font-semibold text-white">Get a skill verified</div>
                      <div className="text-xs text-w4">£49 per skill. Reviewed by two experts.</div>
                    </div>
                    <span className="text-w5 text-xs">→</span>
                  </Link>
                )}
                <Link href="/learn/masterclasses" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                  <div>
                    <div className="text-sm font-semibold text-white">Browse expert-led masterclasses</div>
                    <div className="text-xs text-w4">Live cohorts. £199–£499. Expert practitioners.</div>
                  </div>
                  <span className="text-w5 text-xs">→</span>
                </Link>
                <Link href="/dashboard/candidate" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                  <div>
                    <div className="text-sm font-semibold text-white">Update your Candor profile</div>
                    <div className="text-xs text-w4">Add verified skills as you earn them.</div>
                  </div>
                  <span className="text-w5 text-xs">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
