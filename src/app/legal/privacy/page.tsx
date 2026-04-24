import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Candor',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Privacy Policy.</h1>
          <p className="text-w4 text-sm">Last updated: January 2026 · Candor, getcandor.net</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-w2 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Who we are</h2>
            <p>Candor is a candidate-first professional platform operated from the United Kingdom. When we say "Candor", "we", "us", or "our" in this policy, we mean the company behind getcandor.net and app.getcandor.net.</p>
            <p className="mt-2">We take privacy seriously. Candidates trust us with their career data and anonymity. Companies trust us with their hiring information. This policy explains exactly what we collect, why, and what we do not do with it.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. What we collect</h2>
            <p className="font-semibold text-white mb-2">For candidates:</p>
            <ul className="list-disc pl-5 space-y-1 text-w3">
              <li>Email address and authentication credentials</li>
              <li>Professional information — job title, skills, experience, bio</li>
              <li>Salary floor and employment preferences</li>
              <li>Work history you choose to add</li>
              <li>Anonymity settings and blocked domain lists</li>
              <li>Wallet transactions and payment details (processed by Stripe)</li>
              <li>Community posts, answers, and contributions</li>
              <li>Pitch interactions — read timestamps, decline feedback, hire confirmations</li>
            </ul>
            <p className="font-semibold text-white mt-4 mb-2">For companies:</p>
            <ul className="list-disc pl-5 space-y-1 text-w3">
              <li>Email address and authentication credentials</li>
              <li>Company information — name, Companies House number, director name</li>
              <li>Culture description and company profile data</li>
              <li>Pitches sent, hire confirmations, and ghosting incidents</li>
              <li>Billing and subscription data (processed by Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. What we never do</h2>
            <ul className="list-disc pl-5 space-y-2 text-w3">
              <li><span className="text-white font-semibold">We never sell your data.</span> Not to companies. Not to advertisers. Not to anyone. Ever.</li>
              <li><span className="text-white font-semibold">We never share candidate identity with companies</span> without explicit candidate consent. Anonymous means anonymous until you choose otherwise.</li>
              <li><span className="text-white font-semibold">We never use your data for advertising targeting.</span> Candor does not run ads. We have no interest in your data for that purpose.</li>
              <li><span className="text-white font-semibold">We never share your salary floor</span> with your current employer or any company you have blocked.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-w3">
              <li>To match candidates with relevant company pitches</li>
              <li>To process wallet payments and withdrawals via Stripe Connect</li>
              <li>To verify company identity and enforce platform accountability rules</li>
              <li>To generate the quarterly Transparency Report — anonymised and aggregated</li>
              <li>To calculate culture scores and salary accuracy indices — no individual data is attributed without consent</li>
              <li>To send platform notifications — pitches received, payments processed, ghosting incidents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Anonymity and visibility</h2>
            <p>When a candidate profile is set to anonymous — which is the default — companies see only professional information: role, skills, experience, salary floor, and work outcomes. Name, current employer, and any identifying information is hidden until the candidate explicitly chooses to reveal it.</p>
            <p className="mt-2">Domain blocking is enforced at the database level. If you block a company's email domain, their accounts cannot query or see your profile regardless of search parameters.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Data retention</h2>
            <p>Your data is retained for as long as your account is active. When you delete your account, your personal data is removed within 30 days. Wallet transaction records are retained for 7 years for UK tax compliance purposes, in anonymised form.</p>
            <p className="mt-2">Post-hire reviews are published permanently by design — this is a core part of the Candor accountability model and cannot be deleted by companies. Candidates may request removal of their own reviews by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Your rights under UK GDPR</h2>
            <p>You have the right to access your data, correct inaccuracies, request deletion, object to processing, and request data portability. To exercise any of these rights, email <a href="mailto:privacy@getcandor.net" className="text-candor-blue hover:underline">privacy@getcandor.net</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising cookies, tracking pixels, or third-party analytics that share your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contact</h2>
            <p>For privacy questions: <a href="mailto:privacy@getcandor.net" className="text-candor-blue hover:underline">privacy@getcandor.net</a></p>
            <p className="mt-1">Candor · getcandor.net · United Kingdom</p>
          </section>
        </div>
      </div>
    </div>
  )
}
