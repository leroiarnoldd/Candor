import Link from 'next/link'

export const metadata = { title: 'Candidate Terms — Candor' }

export default function CandidateTermsPage() {
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
        <Link href="/" className="text-w4 text-sm hover:text-w2 transition-colors">← Home</Link>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="candor-section-label">Legal</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Candidate Terms of Service.</h1>
          <p className="text-w4 text-sm">Last updated: January 2026 · Version 2.0</p>
        </div>

        <div className="space-y-6 text-w2 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. The core promise</h2>
            <p>Candor is built for you. The platform is designed to give professionals power, privacy, and payment in the hiring process. These terms set out the rules that make that work for everyone.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Your profile</h2>
            <p>You are responsible for the accuracy of your profile. Work experience, skills, and outcomes must be truthful. Candor reserves the right to remove or suspend profiles containing false information.</p>
            <p className="mt-2">Your profile is anonymous by default. You control what companies see and when. Candor enforces domain blocking at the infrastructure level — blocked companies cannot see your profile.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Candidate earnings</h2>
            <p>Earnings are triggered by verified platform actions. Candor reserves the right to withhold payments where fraud or gaming is suspected. Anti-gaming rules include:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-w3">
              <li>Minimum 60-second pitch read time for read payments</li>
              <li>Pattern detection on decline feedback — identical responses at high frequency may trigger review</li>
              <li>30-day employment verification hold on hire payments</li>
              <li>Both parties must confirm a hire before payment releases</li>
            </ul>
            <p className="mt-2">Minimum withdrawal threshold is £50. Candor is not liable for income tax on your earnings — you are responsible for your own tax affairs. Annual earnings statements are provided by 5 April each year.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Community conduct</h2>
            <p>Community posts must be honest, professional, and relevant. Candor prohibits spam, false information, harassment, and content designed to game the earnings system. Violations result in removal from the community layer, which may affect Expert tier eligibility.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Expert tier</h2>
            <p>Candor Expert status requires a monthly subscription. Expert session rates are set by the expert but must meet the minimum floor for their skill category. Candor takes 10% of expert session earnings to cover payment processing. Experts are responsible for their own tax on session income.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Account termination</h2>
            <p>You may delete your account at any time from Settings. Candor reserves the right to terminate accounts for fraud, gaming, or repeated policy violations. Pending wallet payments at the time of deletion are processed normally. Wallet balances above £50 are paid out on termination where possible.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Governing law</h2>
            <p>These terms are governed by English law. Disputes are subject to the exclusive jurisdiction of English courts.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Contact</h2>
            <p>For terms questions: <a href="mailto:legal@getcandor.net" className="text-candor-blue hover:underline">legal@getcandor.net</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
