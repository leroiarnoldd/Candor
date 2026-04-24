'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings?tab=password`,
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
            <circle cx="6" cy="6" r="1.7" fill="black"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-lg">Candor</span>
      </Link>

      <div className="w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-candor-blue/15 border border-candor-blue/30 flex items-center justify-center mx-auto mb-6 text-3xl">
              📧
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your inbox.</h1>
            <p className="text-w3 text-sm leading-relaxed mb-6">
              We sent a password reset link to <span className="text-white font-semibold">{email}</span>. Click the link to set a new password.
            </p>
            <Link href="/auth/login" className="text-w4 text-sm hover:text-w2 transition-colors">
              Back to sign in →
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Reset your password.</h1>
              <p className="text-w3 text-sm">Enter your email and we will send you a reset link.</p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
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
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="candor-btn-primary w-full py-3.5"
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>
            <p className="text-center text-w4 text-sm mt-6">
              Remember it?{' '}
              <Link href="/auth/login" className="text-white font-semibold hover:text-w2 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
