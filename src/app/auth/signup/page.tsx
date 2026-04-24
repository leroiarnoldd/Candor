'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type UserType = 'candidate' | 'company'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [userType, setUserType] = useState<UserType>('candidate')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: userType },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      })

      if (signupError) throw signupError

      if (data.user) {
        router.push('/auth/verify?email=' + encodeURIComponent(email) + '&next=/welcome')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
            <circle cx="6" cy="6" r="1.7" fill="black"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Candor</span>
      </Link>

      <div className="w-full max-w-md">

        {/* Step 1 — Choose type */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Join Candor.</h1>
              <p className="text-w3 text-base">Are you a professional or a company?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setUserType('candidate')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  userType === 'candidate'
                    ? 'border-candor-blue bg-candor-blue/10'
                    : 'border-white/10 bg-s1 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-3">👤</div>
                <div className="font-bold text-white text-sm mb-1">Professional</div>
                <div className="text-w4 text-xs leading-relaxed">I want companies to come to me</div>
              </button>

              <button
                onClick={() => setUserType('company')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  userType === 'company'
                    ? 'border-candor-blue bg-candor-blue/10'
                    : 'border-white/10 bg-s1 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-3">🏢</div>
                <div className="font-bold text-white text-sm mb-1">Company</div>
                <div className="text-w4 text-xs leading-relaxed">I want to hire great people</div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="candor-btn-primary w-full py-3.5"
            >
              Continue as {userType === 'candidate' ? 'a Professional' : 'a Company'} →
            </button>
          </div>
        )}

        {/* Step 2 — Email and password */}
        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-w4 text-sm mb-8 hover:text-w2 transition-colors"
            >
              ← Back
            </button>

            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${
                userType === 'candidate' ? 'blue-pill' : 'green-pill'
              }`}>
                {userType === 'candidate' ? '👤 Professional' : '🏢 Company'}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create your account.</h1>
              <p className="text-w3 text-sm">
                {userType === 'candidate'
                  ? 'Join 4,000+ professionals already on the platform.'
                  : 'Start hiring without the noise.'}
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="candor-label block mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="candor-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="candor-label block mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="candor-input"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red/10 border border-red/30 text-candor-red text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="candor-btn-primary w-full py-3.5 mt-2"
              >
                {loading ? 'Creating account...' : 'Create account →'}
              </button>
            </form>

            <p className="text-center text-w4 text-xs mt-6 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-w3 hover:text-white transition-colors">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-w3 hover:text-white transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        )}

        <p className="text-center text-w4 text-sm mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-semibold hover:text-w2 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
