import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Candor Learn — Skill verification for professionals',
  description: 'Not a course platform. A skill verification engine. Identify your gaps, fill them with expert-led programmes, and earn permanent verified skill badges on your Candor profile.',
  openGraph: {
    title: 'Candor Learn',
    description: 'Skill verification powered by real pitch data. Expert-led. Outcome-verified.',
  },
}

const LAYERS = [
  {
    number: '01',
    title: 'Skill Gap Analysis',
    tag: 'Free',
    tagColor: '#23D160',
    desc: 'Connect your Candor profile. See what companies in your target roles are actually pitching for right now — from real verified pitch data. Identify exactly what is missing between your current skills and what the market wants.',
    highlight: 'Demand-led. Based on real pitches, not surveys.',
    color: '#4B7BFF',
    icon: '🔍',
  },
  {
    number: '02',
    title: 'Expert-Led Masterclasses',
    tag: '£199–£499',
    tagColor: '#A78BFA',
    desc: 'Live cohort programmes of 8 to 12 people. Led by verified Candor Experts — current practitioners, not professional course creators. A Senior Engineer who shipped at scale teaching system design. A Head of Growth who built from zero teaching acquisition. Real people, real work, real feedback.',
    highlight: 'Expert earns 70%. Candor takes 30%. Not recorded. Not generic.',
    color: '#A78BFA',
    icon: '🎓',
  },
  {
    number: '03',
    title: 'Verified Skill Demonstrations',
    tag: '£49 each',
    tagColor: '#F59E0B',
    desc: 'A real task in your skill area reviewed by two verified Candor Experts. Not a multiple choice test. Not a certificate anyone can buy. Actual demonstrated work, reviewed by practitioners. Pass — and a permanent verified skill badge appears on your Candor profile with the evidence attached.',
    highlight: 'Reviewed by two verified experts. Permanent. Cannot be faked.',
    color: '#F59E0B',
    icon: '✓',
  },
]

const FOR_WHO = [
  { emoji: '🎓', title: 'Students', desc: 'Get verified before you graduate. Companies pitch students who can demonstrate skills, not just list them.' },
  { emoji: '💼', title: 'Mid-career professionals', desc: 'Close the gap identified in your pitch decline feedback. Turn "salary too low" into "more pitches at higher salary".' },
  { emoji: '🏢', title: 'Companies', desc: 'Use Candor Learn L&D budgets for your team. Verified skills mean verifiable hiring criteria.' },
  { emoji: '🏫', title: 'Universities', desc: 'Replace ineffective careers services with real graduate employment infrastructure.' },
  { emoji: '🧠', title: 'Experts', desc: 'Teach what you know. Earn from cohort programmes. Candor takes 30% — less than any university or platform.' },
]

export default function LearnPage() {
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
          <span className="text-w4 text-sm">/ Learn</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/signup" className="text-w4 text-sm hover:text-w2 transition-colors hidden sm:block">Sign up free</Link>
          <Link href="/learn/skill-gap" className="candor-btn-primary px-4 py-2 text-sm">Start free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-candor-blue/10 border border-candor-blue/30 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-candor-blue" />
          <span className="text-xs font-bold text-candor-blue tracking-wider uppercase">Candor Learn</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
          Not a course platform.<br />
          <span className="text-w4">A skill verification engine.</span>
        </h1>
        <p className="text-lg text-w3 leading-relaxed max-w-2xl mx-auto mb-8">
          Identify your gaps using real pitch data. Fill them with expert-led programmes. Earn permanent verified skill badges that companies on Candor actually trust.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/learn/skill-gap" className="candor-btn-primary px-7 py-3.5 text-base">
            Analyse my skill gaps — free →
          </Link>
          <Link href="/learn/masterclasses" className="candor-btn-secondary px-7 py-3.5 text-base">
            Browse masterclasses
          </Link>
        </div>
        <p className="text-xs text-w5 mt-4">Skill Gap Analysis is always free. No account required to start.</p>
      </div>

      {/* The difference */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-s1 border border-white/10">
            <div className="text-xs font-bold tracking-wider uppercase text-candor-red mb-4">Every other learning platform</div>
            <div className="space-y-3 text-sm text-w3 leading-relaxed">
              <div className="flex items-start gap-2"><span className="text-w5 flex-shrink-0">✗</span> Pre-recorded courses by professional course creators</div>
              <div className="flex items-start gap-2"><span className="text-w5 flex-shrink-0">✗</span> Certificates anyone can buy without demonstrating anything</div>
              <div className="flex items-start gap-2"><span className="text-w5 flex-shrink-0">✗</span> Generic curriculum disconnected from what companies want</div>
              <div className="flex items-start gap-2"><span className="text-w5 flex-shrink-0">✗</span> No connection to your actual job search or hiring profile</div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-s1 border border-candor-green/30" style={{ background: 'rgba(35,209,96,0.04)' }}>
            <div className="text-xs font-bold tracking-wider uppercase text-candor-green mb-4">Candor Learn</div>
            <div className="space-y-3 text-sm text-w2 leading-relaxed">
              <div className="flex items-start gap-2"><span className="text-candor-green flex-shrink-0">✓</span> Live cohorts taught by current practitioners</div>
              <div className="flex items-start gap-2"><span className="text-candor-green flex-shrink-0">✓</span> Verified badges backed by reviewed demonstrated work</div>
              <div className="flex items-start gap-2"><span className="text-candor-green flex-shrink-0">✓</span> Gap analysis driven by real company pitch data</div>
              <div className="flex items-start gap-2"><span className="text-candor-green flex-shrink-0">✓</span> Verified skills appear directly on your Candor hiring profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Three layers */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-10">
          <div className="candor-section-label justify-center mb-3">How it works</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Three layers. One outcome.</h2>
          <p className="text-w3 mt-3 text-base">Every layer connects to the next. Every layer connects to your Candor hiring profile.</p>
        </div>

        <div className="space-y-5">
          {LAYERS.map(layer => (
            <div key={layer.number} className="p-6 rounded-2xl bg-s1 border border-white/10 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: layer.color }}
              />
              <div className="pl-4">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{layer.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-w5 mb-0.5">Layer {layer.number}</div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{layer.title}</h3>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{ background: layer.tagColor + '20', color: layer.tagColor, border: `1px solid ${layer.tagColor}40` }}
                  >
                    {layer.tag}
                  </span>
                </div>
                <p className="text-sm text-w2 leading-relaxed mb-3">{layer.desc}</p>
                <div
                  className="text-xs font-semibold px-3 py-2 rounded-xl w-fit"
                  style={{ background: layer.color + '15', color: layer.color }}
                >
                  {layer.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who it's for */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-10">
          <div className="candor-section-label justify-center mb-3">Who it is for</div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Five users. One platform.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FOR_WHO.map(item => (
            <div key={item.title} className="p-5 rounded-2xl bg-s1 border border-white/10">
              <div className="text-2xl mb-3">{item.emoji}</div>
              <div className="font-bold text-white mb-2">{item.title}</div>
              <p className="text-xs text-w4 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* University CTA */}
      <div className="px-6 py-12 max-w-4xl mx-auto border-t border-white/10">
        <div className="p-8 rounded-2xl bg-s1 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #4B7BFF, #23D160)' }} />
          <div className="text-3xl mb-4">🏫</div>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Candor Learn for Universities</h3>
          <p className="text-w3 text-base mb-2 max-w-lg mx-auto leading-relaxed">
            £2,000 per year per institution. Your students get real employer pitches, verified skill development, and £30 when they land their first job. You get outcome data that actually means something.
          </p>
          <p className="text-w4 text-sm mb-6">First three pilot universities are free. No commitment required to explore.</p>
          <Link href="/universities" className="candor-btn-primary px-7 py-3">
            Learn about university partnerships →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 max-w-4xl mx-auto border-t border-white/10 text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Start with your skill gap. It is free.</h2>
        <p className="text-w3 mb-6 max-w-md mx-auto leading-relaxed">No account required to run a skill gap analysis. Connect your profile or describe your target role and see what the market actually wants from someone like you.</p>
        <Link href="/learn/skill-gap" className="candor-btn-green px-8 py-4 text-base inline-block">
          Analyse my skill gaps →
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
                <circle cx="6" cy="6" r="1.7" fill="black"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Candor Learn</span>
          </div>
          <div className="flex gap-4 text-xs text-w5">
            <Link href="/" className="hover:text-w2 transition-colors">Main platform</Link>
            <Link href="/universities" className="hover:text-w2 transition-colors">Universities</Link>
            <Link href="/legal/privacy" className="hover:text-w2 transition-colors">Privacy</Link>
            <Link href="/legal/terms/candidate" className="hover:text-w2 transition-colors">Terms</Link>
          </div>
          <span className="text-xs text-w5">© 2026 Candor</span>
        </div>
      </footer>
    </div>
  )
}
