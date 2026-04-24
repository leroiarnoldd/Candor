import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Candor for Universities — Real graduate employment infrastructure',
  description: 'Replace ineffective careers services with real verified hiring. Students get employer pitches, skill verification, and £30 when they land their first job. £2,000/year per institution.',
}

const BENEFITS = [
  { icon: '💼', title: 'Students receive real employer pitches', desc: 'Companies on Candor pitch students directly with the real salary on the first message. Final year students and recent graduates. Anonymous until they choose otherwise.' },
  { icon: '💰', title: 'Students earn from the process', desc: '£2.70 to read a pitch. £7.10 to decline with structured feedback. £30 when they confirm a hire. For a student that £30 is meaningful.' },
  { icon: '✓', title: 'Verified skill badges on graduate profiles', desc: 'Students complete real task-based skill demonstrations reviewed by practising experts. Permanent verified badges appear on their Candor profile.' },
  { icon: '📊', title: 'Real outcome data for your careers service', desc: 'A dashboard showing student engagement, which companies are pitching your graduates, average offer salaries by course, and anonymised hire rates. Data that actually means something.' },
  { icon: '🔒', title: 'Same privacy protection as the main platform', desc: 'Students stay anonymous until they choose to reveal themselves. Their current institution is never shared without consent.' },
  { icon: '♾️', title: 'Access continues after graduation', desc: 'Students get access in their final two terms and for 24 months after graduation. They do not lose access the day they pick up their degree.' },
]

const UNIVERSITIES = [
  { name: 'Coventry University', type: 'Post-92', note: 'Strong vocational courses, active employer relationships' },
  { name: 'Leeds Beckett University', type: 'Post-92', note: 'Professional course focus, engaged careers service' },
  { name: 'Northumbria University', type: 'Post-92', note: 'Technology and business strength' },
  { name: 'Birmingham City University', type: 'Post-92', note: 'Large student population, diverse course mix' },
]

export default function UniversitiesPage() {
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
        <a href="mailto:universities@getcandor.net" className="candor-btn-primary px-4 py-2 text-sm">
          Get in touch →
        </a>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-candor-blue/10 border border-candor-blue/30 mb-6">
          <span className="text-xs font-bold text-candor-blue tracking-wider uppercase">Candor for Universities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6 max-w-3xl">
          Your careers service tells students to write CVs. We get them hired.
        </h1>
        <p className="text-lg text-w3 leading-relaxed max-w-2xl mb-8">
          Candor for Universities is real graduate employment infrastructure. Not a job board. Not a milk round. Companies pitch your students directly, with the real salary upfront, and students earn money throughout the process.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="mailto:universities@getcandor.net" className="candor-btn-primary px-7 py-3.5 text-base">
            Book a conversation →
          </a>
          <Link href="/learn" className="candor-btn-secondary px-7 py-3.5 text-base">
            Explore Candor Learn
          </Link>
        </div>
        <p className="text-xs text-w5 mt-4">First three pilot universities are free for one academic year.</p>
      </div>

      {/* The problem */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-5">The honest problem with university careers services.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Teach students to format CVs the way companies stopped reading in 2015',
            'Relationships with a handful of large graduate employers who pay to attend milk rounds',
            'Students graduate and immediately feel lost — the careers service prepared them for a market that barely exists',
            'Graduate employment stats are mediocre despite millions spent annually',
            'No real-time data on what the market actually wants from your graduates',
            'No mechanism to pay students for engaging with the hiring process',
          ].map(problem => (
            <div key={problem} className="flex items-start gap-3 p-4 rounded-xl bg-s1 border border-white/10">
              <span className="text-candor-red flex-shrink-0 mt-0.5 text-sm font-bold">✗</span>
              <span className="text-sm text-w2 leading-relaxed">{problem}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-w3 mt-5 leading-relaxed">
          Universities know this. They are genuinely looking for something better. Candor walks through that door.
        </p>
      </div>

      {/* Benefits */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">What Candor gives your students.</h2>
        <p className="text-w3 text-sm mb-8 leading-relaxed">Everything the main Candor platform offers — plus university-specific features designed for students and recent graduates.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map(b => (
            <div key={b.title} className="p-5 rounded-2xl bg-s1 border border-white/10">
              <div className="text-2xl mb-3">{b.icon}</div>
              <div className="font-bold text-white mb-2 text-sm">{b.title}</div>
              <p className="text-xs text-w4 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The numbers */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-8">The numbers that matter.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '140+', label: 'UK universities', color: 'text-white' },
            { value: '3,500', label: 'Avg graduates/year per university', color: 'text-white' },
            { value: '490k', label: 'Students entering Candor/year at full penetration', color: 'text-candor-green' },
            { value: '£2,000', label: 'Annual licence per institution', color: 'text-candor-blue' },
          ].map(s => (
            <div key={s.label} className="candor-card p-4 text-center">
              <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-w4 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-2xl bg-s1 border border-white/10">
          <div className="candor-label mb-2">The long game</div>
          <p className="text-sm text-w2 leading-relaxed">
            A student who joins Candor through their university is 21 years old. They will use Candor for the next 30 to 40 years of their career. They never leave because the platform earns them money. Every graduating class from every partner university is a cohort of verified young professionals entering the Candor database permanently.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-8">How we roll this out.</h2>
        <div className="space-y-4">
          {[
            { period: 'Now — Month 12', title: 'Platform proven on main market', desc: 'Build the track record. Get real companies using Candor. Get real candidates hired. Build the case studies that universities will ask for.', color: '#4B7BFF' },
            { period: 'Month 12 — 18', title: 'Three pilot universities — free', desc: 'Approach post-92 universities with strong vocational courses. Offer the first year free. Build outcome data. Build case studies.', color: '#23D160' },
            { period: 'Month 18 — 24', title: '20 universities — £2,000/year', desc: 'The case studies do the selling. A careers director who sees that companies pitched 47 of their students last term and 12 got hired will sign the next day.', color: '#F59E0B' },
            { period: 'Month 24 — 36', title: 'Russell Group expansion', desc: 'By then the product is proven, the data is real, and the peer pressure from other institutions does the selling.', color: '#A78BFA' },
          ].map(t => (
            <div key={t.period} className="flex gap-4 p-5 rounded-2xl bg-s1 border border-white/10">
              <div className="w-1 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: t.color }}>{t.period}</div>
                <div className="font-bold text-white mb-1">{t.title}</div>
                <p className="text-sm text-w3 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* First universities */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-3">First universities we are approaching.</h2>
        <p className="text-w3 text-sm mb-6 leading-relaxed">Post-92 institutions first. They are more willing to try something genuinely new. Russell Group later, once the proof exists.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {UNIVERSITIES.map(u => (
            <div key={u.name} className="p-4 rounded-xl bg-s1 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-w4 mt-0.5">{u.note}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-candor-blue/15 text-candor-blue flex-shrink-0">{u.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 max-w-4xl mx-auto border-t border-white/10 text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Interested in piloting Candor at your institution?</h2>
        <p className="text-w3 mb-2 max-w-lg mx-auto leading-relaxed">The first three pilot universities are free for one full academic year. No budget required. No commitment required. Just a conversation.</p>
        <p className="text-w4 text-sm mb-6">We will work around your academic calendar and integrate with your existing systems.</p>
        <a href="mailto:universities@getcandor.net" className="candor-btn-primary px-8 py-4 text-base inline-block">
          Email universities@getcandor.net →
        </a>
        <p className="text-xs text-w5 mt-3">We typically respond within one business day.</p>
      </div>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
                <circle cx="6" cy="6" r="1.7" fill="black"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Candor</span>
          </Link>
          <div className="flex gap-4 text-xs text-w5">
            <Link href="/learn" className="hover:text-w2">Candor Learn</Link>
            <Link href="/legal/privacy" className="hover:text-w2">Privacy</Link>
            <Link href="/legal/terms/candidate" className="hover:text-w2">Terms</Link>
          </div>
          <span className="text-xs text-w5">© 2026 Candor</span>
        </div>
      </footer>
    </div>
  )
}
