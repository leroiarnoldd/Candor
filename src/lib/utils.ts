// Currency formatting
export function formatCurrency(pence: number, showPence = true): string {
  const pounds = pence / 100
  if (showPence) return `£${pounds.toFixed(2)}`
  return `£${pounds.toLocaleString()}`
}

export function formatSalary(pence: number): string {
  const pounds = pence / 100
  if (pounds >= 1000) return `£${(pounds / 1000).toFixed(pounds % 1000 === 0 ? 0 : 1)}k`
  return `£${pounds.toLocaleString()}`
}

// Date formatting
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatDate(date: string | Date, includeYear = false): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (includeYear) opts.year = 'numeric'
  return new Date(date).toLocaleDateString('en-GB', opts)
}

export function formatDateFull(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// Profile completeness calculator
export function calculateProfileCompleteness(profile: {
  current_title?: string | null
  skills?: string[]
  salary_floor?: number
  bio?: string | null
  location?: string | null
  years_experience?: number | null
  notice_period?: string | null
  work_experience_count?: number
}): number {
  let score = 0
  if (profile.current_title) score += 20
  if ((profile.skills?.length || 0) >= 3) score += 20
  if ((profile.salary_floor || 0) > 0) score += 20
  if (profile.bio && profile.bio.length > 50) score += 15
  if (profile.location) score += 10
  if (profile.years_experience) score += 10
  if (profile.notice_period) score += 5
  return Math.min(100, score)
}

// Skill matching
export function getSkillOverlap(candidateSkills: string[], searchSkills: string[]): number {
  if (searchSkills.length === 0) return 100
  const matched = searchSkills.filter(s =>
    candidateSkills.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
  )
  return Math.round((matched.length / searchSkills.length) * 100)
}

// Match score to label
export function matchScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent match', color: '#23D160' }
  if (score >= 70) return { label: 'Strong match', color: '#4B7BFF' }
  if (score >= 50) return { label: 'Good match', color: '#F59E0B' }
  return { label: 'Partial match', color: '#A78BFA' }
}

// Pitch status helpers
export function pitchStatusLabel(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    sent:      { label: 'Sent',       color: '#A0A0A0', bg: 'rgba(160,160,160,0.1)' },
    read:      { label: 'Read',       color: '#4B7BFF', bg: 'rgba(75,123,255,0.1)' },
    accepted:  { label: 'Accepted',   color: '#23D160', bg: 'rgba(35,209,96,0.1)' },
    declined:  { label: 'Declined',   color: '#606060', bg: 'rgba(96,96,96,0.1)' },
    interview: { label: 'Interview',  color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
    offered:   { label: 'Offered',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    hired:     { label: 'Hired ✓',    color: '#23D160', bg: 'rgba(35,209,96,0.15)' },
    withdrawn: { label: 'Withdrawn',  color: '#3A3A3A', bg: 'rgba(58,58,58,0.1)' },
    expired:   { label: 'Expired',    color: '#3A3A3A', bg: 'rgba(58,58,58,0.1)' },
  }
  return map[status] || map.sent
}

// Availability helpers
export function availabilityLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    open:    { label: 'Open to pitches',    color: '#23D160' },
    passive: { label: 'Open to good offers',color: '#4B7BFF' },
    closed:  { label: 'Not looking',        color: '#606060' },
  }
  return map[status] || map.closed
}

// Extract domain from email
export function emailToDomain(email: string): string {
  return email.split('@')[1] || ''
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Validate UK Companies House number
export function isValidCompaniesHouseNumber(num: string): boolean {
  return /^[A-Z0-9]{8}$/.test(num.toUpperCase())
}

// Format plan name
export function formatPlanName(plan: string): string {
  const map: Record<string, string> = {
    none: 'No plan',
    starter: 'Starter',
    growth: 'Growth',
    enterprise: 'Enterprise',
    candidate_pro: 'Candor Pro',
    candidate_expert: 'Candor Expert',
  }
  return map[plan] || plan
}
