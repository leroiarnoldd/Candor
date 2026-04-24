'use client'

import Link from 'next/link'

// Empty pitch inbox for candidates
export function EmptyPitchInbox() {
  return (
    <div className="py-16 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-s1 border border-white/10 flex items-center justify-center mx-auto mb-5 text-2xl">
        📭
      </div>
      <h3 className="text-white font-bold text-lg mb-2">No pitches yet.</h3>
      <p className="text-w4 text-sm leading-relaxed mb-6">
        Once companies start pitching you they will appear here. Companies pitch profiles that are complete and set to open or passive availability.
      </p>
      <div className="space-y-2 text-left">
        <div className="p-3.5 rounded-xl bg-s1 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-candor-blue/20 border border-candor-blue/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 4.5l2 2 5-5" stroke="#4B7BFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold mb-0.5">Complete your profile</div>
              <div className="text-xs text-w4 leading-relaxed">Profiles above 80% completeness get pitched first.</div>
            </div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-s1 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-candor-green/20 border border-candor-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 4.5l2 2 5-5" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold mb-0.5">Set availability to Open</div>
              <div className="text-xs text-w4 leading-relaxed">Companies search for open candidates first.</div>
            </div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-s1 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-candor-amber/20 border border-candor-amber/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1 4.5l2 2 5-5" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold mb-0.5">Check your salary floor</div>
              <div className="text-xs text-w4 leading-relaxed">Set a realistic floor — companies only see you if they can meet it.</div>
            </div>
          </div>
        </div>
      </div>
      <Link href="/profile/edit" className="candor-btn-primary w-full py-3 mt-5 block text-center">
        Complete profile →
      </Link>
    </div>
  )
}

// Empty company dashboard
export function EmptyCompanyDashboard({ pitchCredits }: { pitchCredits: number }) {
  return (
    <div className="py-16 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-s1 border border-white/10 flex items-center justify-center mx-auto mb-5 text-2xl">
        🎯
      </div>
      <h3 className="text-white font-bold text-lg mb-2">Ready to pitch.</h3>
      <p className="text-w4 text-sm leading-relaxed mb-6">
        You have {pitchCredits} pitch credits. Find a candidate, write a pitch with the real salary on the first message, and send it.
      </p>

      <div className="p-4 rounded-xl bg-s1 border border-white/10 text-left mb-5">
        <div className="candor-label mb-3">How pitching works</div>
        <div className="space-y-2.5">
          {[
            { step: '1', text: 'Search candidates by skill, location, and salary budget' },
            { step: '2', text: 'Select a candidate whose profile matches the role' },
            { step: '3', text: 'Write a personal pitch with the real salary — required' },
            { step: '4', text: 'Send. The candidate earns £2.70 to read it' },
            { step: '5', text: 'They accept, decline with feedback, or ignore' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-candor-green/15 border border-candor-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-candor-green text-[10px] font-bold">{item.step}</span>
              </div>
              <span className="text-sm text-w2 leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/pitch/new" className="candor-btn-green w-full py-3 block text-center">
        Send your first pitch →
      </Link>
    </div>
  )
}

// Tooltip component
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-s2 border border-white/20 rounded-xl text-xs text-w2 leading-relaxed whitespace-nowrap max-w-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-s2 border-r border-b border-white/20 rotate-45 -mt-1" />
      </div>
    </div>
  )
}

// Context hint — appears inline next to form fields
export function ContextHint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-candor-blue/8 border border-candor-blue/20 mt-2">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#4B7BFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
        <circle cx="6.5" cy="6.5" r="5.5"/>
        <path d="M6.5 5.5v4M6.5 4h0"/>
      </svg>
      <p className="text-xs text-candor-blue leading-relaxed">{text}</p>
    </div>
  )
}

// Step explainer — shows at top of multi-step forms
export function StepExplainer({ current, total, title, desc }: {
  current: number; total: number; title: string; desc: string
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < current ? '#4B7BFF' : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <div className="text-xs font-bold tracking-widest uppercase text-w4 mb-2">
        Step {current} of {total}
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{title}</h1>
      <p className="text-w3 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// First action prompt — shown when a user completes onboarding
export function FirstActionPrompt({ userType }: { userType: 'candidate' | 'company' }) {
  if (userType === 'candidate') {
    return (
      <div className="p-5 rounded-2xl bg-candor-blue/10 border border-candor-blue/30 mb-5">
        <div className="text-sm font-bold text-candor-blue mb-1">Profile created. Here is what happens next.</div>
        <p className="text-xs text-candor-blue/70 leading-relaxed">
          Companies are searching for candidates right now. Once your profile is visible you will start receiving pitches. Each pitch you receive and read earns you £2.70. Each one you decline with feedback earns you £7.10. Each hire earns you £30. There is nothing else you need to do — the jobs come to you.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-candor-green/10 border border-candor-green/30 mb-5">
      <div className="text-sm font-bold text-candor-green mb-1">Account ready. Time to pitch.</div>
      <p className="text-xs text-candor-green/70 leading-relaxed">
        Search for candidates that match your role. When you find someone interesting, write them a personal pitch with the real salary. They earn £2.70 to read it. If they decline they give you structured feedback telling you exactly why. If they accept you have a genuine conversation with someone who wants to hear from you.
      </p>
    </div>
  )
}
