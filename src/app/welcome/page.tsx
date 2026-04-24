'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserType = 'candidate' | 'company'

interface WelcomePageProps {
  userType?: UserType
}

// Candidate steps
const CANDIDATE_STEPS = [
  {
    step: 1,
    icon: '👤',
    title: 'Build your profile.',
    body: 'Takes 10 minutes. You add your skills, your salary floor, and your terms. Not a CV — evidence of what you have actually built and achieved.',
    highlight: 'Your name and employer stay hidden until you choose to reveal them.',
    color: '#4B7BFF',
  },
  {
    step: 2,
    icon: '📨',
    title: 'Companies pitch you.',
    body: 'You do not apply anywhere. Companies find your profile and send you a pitch. The real salary is on the first message — always. No exceptions.',
    highlight: 'You earn £2.70 just for reading a pitch. 48 hours after you open it.',
    color: '#23D160',
  },
  {
    step: 3,
    icon: '💬',
    title: 'You decide.',
    body: 'Accept or decline — it is entirely your call. If you decline, give structured feedback and earn £7.10. If you accept and get hired, you earn £30.',
    highlight: 'No ghosting. Companies that disappear lose their access permanently.',
    color: '#F59E0B',
  },
  {
    step: 4,
    icon: '💰',
    title: 'You earn.',
    body: 'Every pitch read, every feedback given, every hire confirmed — money goes into your Candor wallet. Withdraw to your bank account above £50.',
    highlight: 'The Giant charges companies £9,000 to access your data. Candor pays you.',
    color: '#23D160',
  },
]

// Company steps
const COMPANY_STEPS = [
  {
    step: 1,
    icon: '🏢',
    title: 'Verify your company.',
    body: 'Enter your Companies House number. We verify you are a real registered business. This unlocks your Verified Employer badge and full candidate access.',
    highlight: 'Verification usually completes within 24 hours.',
    color: '#23D160',
  },
  {
    step: 2,
    icon: '🔍',
    title: 'Search verified candidates.',
    body: 'Filter by skill, location, salary budget, and availability. Every candidate on Candor has a verified profile — no inflated CVs, no exaggerated titles.',
    highlight: 'You only see candidates whose salary floor you can meet.',
    color: '#4B7BFF',
  },
  {
    step: 3,
    icon: '📝',
    title: 'Pitch with salary on the first message.',
    body: 'This is the most important thing to understand about Candor. You cannot send a pitch without including the real salary. This is enforced structurally — the field is required.',
    highlight: 'Companies that include real salaries get 3x higher response rates.',
    color: '#F59E0B',
  },
  {
    step: 4,
    icon: '✅',
    title: 'Hire and review.',
    body: 'When a candidate accepts and a hire is confirmed, both sides verify it. The candidate leaves a verified review. Your culture score updates automatically.',
    highlight: 'Great companies build a public reputation that makes future hiring easier.',
    color: '#23D160',
  },
]

const CANDIDATE_FAQ = [
  {
    q: 'Will my current employer know I am here?',
    a: 'No. Your profile is anonymous by default — no name, no employer. You can also block specific company domains from ever seeing your profile. Your boss will never know you are here unless you choose to tell them.',
  },
  {
    q: 'Is the £2.70 and £7.10 actually real money?',
    a: 'Yes. Real money goes into your Candor wallet. The £2.70 arrives 48 hours after you open a pitch. The £7.10 arrives immediately when you submit your decline feedback. You withdraw to your bank account once your balance reaches £50.',
  },
  {
    q: 'What if a company ghosts me after I accept?',
    a: 'Companies have 7 days to respond after you accept a pitch. If they do not respond, you report it as a ghosting incident. Three incidents and they get a formal warning published on their profile. Ten incidents and they are permanently removed from Candor.',
  },
  {
    q: 'Do I have to respond to every pitch?',
    a: 'No. You can read and ignore. But you earn £7.10 extra when you decline with feedback — and the company genuinely learns something from it. Most people find it takes two minutes and is worth doing.',
  },
  {
    q: 'What if the salary in the pitch is different from what they actually offer?',
    a: 'This is tracked in the salary accuracy score on your post-hire review. Companies with large discrepancies between pitched salary and actual offer get flagged in the quarterly Transparency Report.',
  },
]

const COMPANY_FAQ = [
  {
    q: 'Why do I have to put the salary on the first message?',
    a: 'Because candidates on Candor have set a salary floor. If your salary does not meet their minimum, the pitch is not delivered. This saves everyone time. You only pay for pitches to candidates you can actually afford.',
  },
  {
    q: 'Can recruitment agencies use Candor?',
    a: 'No. Only verified internal recruiters and hiring managers at named companies can send pitches. Third-party agencies, headhunters, and staffing firms are prohibited. Every pitch comes from the company doing the hiring.',
  },
  {
    q: 'What happens if a candidate ignores my pitch?',
    a: 'If a candidate reads your pitch and does not respond within 30 days, it expires. You are not charged again. Use that learning to improve your next pitch — the structured feedback from declined pitches tells you exactly why candidates said no.',
  },
  {
    q: 'What does the Candor Verified Employer badge do?',
    a: 'It appears on every pitch you send. Candidates see it before they decide whether to engage. Companies with the badge get significantly higher acceptance rates because candidates trust that the pitch is genuine.',
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showFaq, setShowFaq] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = userType === 'company' ? COMPANY_STEPS : CANDIDATE_STEPS
  const faq = userType === 'company' ? COMPANY_FAQ : CANDIDATE_FAQ

  function handleContinue() {
    if (!userType) return
    router.push(userType === 'company' ? '/onboarding/company' : '/onboarding/candidate')
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">Candor</span>
        </Link>

        <div className="max-w-md w-full text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Welcome to Candor.</h1>
          <p className="text-w3 leading-relaxed">Before you set up your profile, let us show you how Candor works. It takes 2 minutes and will make everything make sense.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
          <button
            onClick={() => setUserType('candidate')}
            className="p-6 rounded-2xl border border-white/10 bg-s1 hover:border-candor-blue/50 hover:bg-candor-blue/5 transition-all text-left"
          >
            <div className="text-3xl mb-3">👤</div>
            <div className="font-bold text-white mb-1">I am a professional</div>
            <div className="text-xs text-w4 leading-relaxed">I want companies to come to me with real salaries</div>
          </button>
          <button
            onClick={() => setUserType('company')}
            className="p-6 rounded-2xl border border-white/10 bg-s1 hover:border-candor-green/50 hover:bg-candor-green/5 transition-all text-left"
          >
            <div className="text-3xl mb-3">🏢</div>
            <div className="font-bold text-white mb-1">I am hiring</div>
            <div className="text-xs text-w4 leading-relaxed">I want to pitch verified candidates directly</div>
          </button>
        </div>
      </div>
    )
  }

  if (showFaq) {
    return (
      <div className="min-h-screen bg-black px-6 py-16">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowFaq(false)}
            className="text-w4 text-sm hover:text-w2 transition-colors mb-8 flex items-center gap-2"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Common questions.</h2>
          <div className="space-y-2">
            {faq.map((item, i) => (
              <div key={i} className="candor-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 flex items-start justify-between gap-3 text-left"
                >
                  <span className="font-semibold text-white text-sm leading-relaxed">{item.q}</span>
                  <span className={`text-w4 text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-w3 leading-relaxed border-t border-white/10 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleContinue}
            className="candor-btn-primary w-full py-4 mt-8 text-base"
          >
            I understand — set up my profile →
          </button>
        </div>
      </div>
    )
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/10">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: `linear-gradient(90deg, ${step.color}, #23D160)`,
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">

          {/* Step counter */}
          <div className="flex gap-2 mb-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all"
                style={{ background: i <= currentStep ? step.color : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>

          {/* Step content */}
          <div
            key={currentStep}
            className="animate-in fade-in duration-300"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ background: step.color + '20', border: `1px solid ${step.color}40` }}
            >
              {step.icon}
            </div>

            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: step.color }}>
              Step {step.step} of {steps.length}
            </div>

            <h2 className="text-3xl font-bold text-white tracking-tight mb-4 leading-tight">
              {step.title}
            </h2>

            <p className="text-w2 text-base leading-relaxed mb-5">{step.body}</p>

            <div
              className="p-4 rounded-xl text-sm font-semibold leading-relaxed"
              style={{
                background: step.color + '15',
                border: `1px solid ${step.color}30`,
                color: step.color,
              }}
            >
              {step.highlight}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => currentStep > 0 && setCurrentStep(s => s - 1)}
              className={`text-w4 text-sm hover:text-w2 transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
            >
              ← Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                className="candor-btn-primary px-8 py-3"
                style={currentStep < steps.length - 1 ? {} : {}}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="candor-btn-green px-8 py-3"
              >
                Set up my profile →
              </button>
            )}
          </div>

          {/* FAQ link */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowFaq(true)}
              className="text-xs text-w5 hover:text-w3 transition-colors"
            >
              Have questions? See the FAQ →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
