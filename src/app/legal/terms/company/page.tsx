import Link from 'next/link'

export const metadata = { title: 'Company Terms — Candor' }

export default function CompanyTermsPage() {
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
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Company Terms of Service.</h1>
          <p className="text-w4 text-sm">Last updated: January 2026 · Version 2.0</p>
        </div>

        <div className="space-y-6 text-w2 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Access and verification</h2>
            <p>Company accounts require UK Companies House verification. By signing up you confirm that the Companies House number and director name provided are accurate. Providing false verification information results in immediate account termination and may be reported to relevant authorities.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Pitch rules — mandatory</h2>
            <p>Every pitch sent on Candor must include a real salary figure. The salary stated in the pitch must be a genuine offer amount. Companies whose pitched salary consistently differs from the actual offer by more than 10% will receive a salary accuracy warning published on their public profile.</p>
            <p className="mt-2">Pitches must be sent by verified internal employees of the company. Third-party recruitment agencies, headhunters, and staffing firms are prohibited from using Candor.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Ghosting policy — strict</h2>
            <p>When a candidate accepts a pitch, the company must respond within 7 days. Failure to respond constitutes a ghosting incident. The escalation ladder is automatic and published:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-w3">
              <li>1 incident — formal warning issued, logged on profile</li>
              <li>3 incidents — second formal warning, published on Transparency Report</li>
              <li>5 incidents — final warning, suspension threatened</li>
              <li>10 incidents — permanent platform removal, published publicly</li>
            </ul>
            <p className="mt-2">There is no appeals process for ghosting incidents that are verified by platform timestamp data. Reinstatement after removal requires a £5,000 reinstatement fee and a minimum 12-month probationary period.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Candidate data</h2>
            <p>Candidate profile data accessed through the Candor platform is confidential. Companies must not export, share, or use candidate data outside the Candor platform. Candidate anonymity must be respected — companies may not attempt to identify anonymous candidates through external means.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Reviews and transparency</h2>
            <p>Post-hire candidate reviews are published permanently. Companies cannot request removal of verified reviews. Culture scores and salary accuracy indices are calculated automatically and published. These scores appear on the quarterly Candor Transparency Report.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Subscriptions and billing</h2>
            <p>Subscriptions are charged monthly. Pitch credits allocated at the start of each billing cycle do not roll over. Cancellation takes effect at the end of the current billing period. Refunds are not provided for unused pitch credits.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Sponsored problems</h2>
            <p>Prize money for sponsored problems is held in escrow at point of posting. The full prize amount must be funded before the problem goes live. Winner selection is at the company's sole discretion. Candor retains 40% of the prize as a platform fee. Prize money is non-refundable once a winner is selected.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Governing law</h2>
            <p>These terms are governed by English law. Disputes are subject to the exclusive jurisdiction of English courts.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contact</h2>
            <p>For terms questions: <a href="mailto:legal@getcandor.net" className="text-candor-blue hover:underline">legal@getcandor.net</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
