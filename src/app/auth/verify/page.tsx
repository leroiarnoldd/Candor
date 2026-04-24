'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your inbox'
  const nextUrl = searchParams.get('next') || '/onboarding/candidate'

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">

      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
            <circle cx="6" cy="6" r="1.7" fill="black"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Candor</span>
      </Link>

      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center"
          style={{ background: 'rgba(35,209,96,0.12)', border: '1px solid rgba(35,209,96,0.3)' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#23D160" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h28l-14 10L4 8z"/>
            <path d="M4 8v20h28V8"/>
            <path d="M4 28l10-10M32 28L22 18"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Check your inbox.</h1>
        <p className="text-w3 text-base leading-relaxed mb-2">
          We sent a verification link to
        </p>
        <p className="text-white font-semibold text-base mb-6">{email}</p>
        <p className="text-w4 text-sm leading-relaxed mb-8">
          Click the link in the email to verify your account and complete signup. The link expires in 24 hours.
        </p>

        <div className="p-5 rounded-2xl bg-s1 border border-white/10 text-left mb-8">
          <div className="candor-label mb-3">Not seeing it?</div>
          <ul className="space-y-2 text-sm text-w3 leading-relaxed">
            <li>→ Check your spam or junk folder</li>
            <li>→ Make sure you used the right email address</li>
            <li>→ It can take up to 2 minutes to arrive</li>
          </ul>
        </div>

        <Link href="/auth/login" className="text-w4 text-sm hover:text-w2 transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
