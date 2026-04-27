'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatSalary } from '@/lib/utils'

interface SalaryData {
  title: string
  count: number
  median: number
  p25: number
  p75: number
  min: number
  max: number
}

const ROLES = [
  'Senior Software Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Head of Engineering',
  'Senior Product Manager',
  'Marketing Manager',
  'Data Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Engineering Manager',
]

export default function SalaryPage() {
  const [salaryData, setSalaryData] = useState<SalaryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<SalaryData | null>(null)
  const [searchRole, setSearchRole] = useState('')
  const [isPro, setIsPro] = useState(false)

  useEffect(() => { loadSalaryData() }, [])

  async function loadSalaryData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await (supabase as any)
        .from('candidate_profiles')
        .select('is_pro, is_expert')
        .eq('user_id', user.id)
        .single()
      if (profile) setIsPro(profile.is_pro || profile.is_expert)
    }

    // Get real salary data from pitches
    const { data: pitches } = await (supabase as any)
      .from('pitches')
      .select('role_title, salary_min, salary_max, status')
      .in('status', ['hired', 'accepted', 'read', 'declined'])
      .not('salary_min', 'is', null)
      .gte('salary_min', 2000000) // Min £20k
      .lte('salary_min', 100000000) // Max £1M

    if (pitches && pitches.length > 0) {
      // Group by role title (fuzzy matching)
      const grouped: Record<string, number[]> = {}

      pitches.forEach(pitch => {
        const title = pitch.role_title?.trim()
        if (!title) return

        // Find closest matching standard role
        const matched = ROLES.find(r =>
          title.toLowerCase().includes(r.toLowerCase().split(' ').slice(-2).join(' ')) ||
          r.toLowerCase().includes(title.toLowerCase())
        ) || title

        if (!grouped[matched]) grouped[matched] = []
        grouped[matched].push(pitch.salary_min)
      })

      const data: SalaryData[] = Object.entries(grouped)
        .filter(([, salaries]) => salaries.length >= 3)
        .map(([title, salaries]) => {
          const sorted = salaries.sort((a, b) => a - b)
          const len = sorted.length
          return {
            title,
            count: len,
            median: sorted[Math.floor(len / 2)],
            p25: sorted[Math.floor(len * 0.25)],
            p75: sorted[Math.floor(len * 0.75)],
            min: sorted[0],
            max: sorted[len - 1],
          }
        })
        .sort((a, b) => b.count - a.count)

      setSalaryData(data)
    } else {
      // Show placeholder data when no real data exists yet
      setSalaryData(ROLES.slice(0, 6).map(title => ({
        title,
        count: 0,
        median: 0,
        p25: 0,
        p75: 0,
        min: 0,
        max: 0,
      })))
    }

    setLoading(false)
  }

  const filtered = salaryData.filter(d =>
    !searchRole || d.title.toLowerCase().includes(searchRole.toLowerCase())
  )

  const hasData = salaryData.some(d => d.count > 0)

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/dashboard/candidate" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
        <Link href="/dashboard/candidate" className="text-w4 text-sm hover:text-w2 transition-colors">← Dashboard</Link>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Salary Intelligence</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">What companies are actually offering.</h1>
          <p className="text-w3 text-sm leading-relaxed max-w-xl">
            Not surveys. Not self-reported estimates. Real verified salary data from real pitches sent on Candor. Every number has a source.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Data source', value: 'Verified pitches', color: 'text-candor-green' },
            { label: 'Updated', value: 'In real time', color: 'text-candor-blue' },
            { label: 'Accuracy', value: 'Enforced at source', color: 'text-candor-amber' },
          ].map(s => (
            <div key={s.label} className="candor-card p-4 text-center">
              <div className={`text-sm font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-w4">{s.label}</div>
            </div>
          ))}
        </div>

        {!isPro && (
          <div className="p-4 rounded-2xl bg-candor-blue/10 border border-candor-blue/30 mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-bold text-candor-blue mb-0.5">Full salary intelligence is a Candor Pro feature</div>
              <div className="text-xs text-candor-blue/70">Upgrade to Pro for full salary ranges, percentile breakdowns, and location-based filtering.</div>
            </div>
            <Link href="/billing" className="text-xs font-bold text-candor-blue border border-candor-blue/30 px-3 py-1.5 rounded-lg hover:bg-candor-blue/10 transition-colors flex-shrink-0">
              Upgrade →
            </Link>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            value={searchRole}
            onChange={e => setSearchRole(e.target.value)}
            placeholder="Search by role title..."
            className="candor-input"
          />
        </div>

        {!hasData ? (
          <div className="candor-card p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">Building the database.</h3>
            <p className="text-w4 text-sm leading-relaxed max-w-sm mx-auto">
              Salary intelligence fills up as companies pitch candidates on the platform. Once there are enough verified pitches the real data will appear here automatically.
            </p>
            <p className="text-xs text-w5 mt-4">No synthetic data. No estimates. Real numbers only.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(role => (
              <div
                key={role.title}
                onClick={() => setSelectedRole(selectedRole?.title === role.title ? null : role)}
                className="candor-card p-4 cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{role.title}</div>
                    <div className="text-xs text-w4 mt-0.5">{role.count} verified pitches</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {isPro ? (
                      <>
                        <div className="font-bold text-white text-sm">{formatSalary(role.median)}</div>
                        <div className="text-xs text-w4">median</div>
                      </>
                    ) : (
                      <div className="text-xs text-w5 italic">Pro required</div>
                    )}
                  </div>
                </div>

                {selectedRole?.title === role.title && isPro && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {/* Salary bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-w4 mb-2">
                        <span>Salary range</span>
                        <span>{formatSalary(role.min)} — {formatSalary(role.max)}</span>
                      </div>
                      <div className="relative h-3 bg-white/10 rounded-full">
                        <div
                          className="absolute h-full bg-candor-blue/30 rounded-full"
                          style={{
                            left: `${((role.p25 - role.min) / (role.max - role.min)) * 100}%`,
                            width: `${((role.p75 - role.p25) / (role.max - role.min)) * 100}%`,
                          }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
                          style={{ left: `${((role.median - role.min) / (role.max - role.min)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: '25th percentile', value: formatSalary(role.p25), color: 'text-w3' },
                        { label: 'Median', value: formatSalary(role.median), color: 'text-white' },
                        { label: '75th percentile', value: formatSalary(role.p75), color: 'text-candor-green' },
                        { label: 'Top offers', value: formatSalary(role.max), color: 'text-candor-amber' },
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-xl bg-s2 border border-white/10 text-center">
                          <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-[10px] text-w5 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-w5 mt-3">
                      Based on {role.count} verified pitches. Salary shown is the figure companies stated in their pitch — enforced at time of sending.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
