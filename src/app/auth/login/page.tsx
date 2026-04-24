'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      if (data.user) {
        // Route based on user type
        const { data: userData } = await supabase
          .from('users')
          .select('user_type, onboarding_complete')
          .eq('id', data.user.id)
          .single()

        if (!userData?.onboarding_complete) {
          router.push(userData?.user_type === 'company'
            ? '/onboarding/company'
            : '/onboarding/candidate')
        } else {
          router.push(userData?.user_type === 'company'
            ? '/dashboard/company'
            : '/dashboard/candidate')
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email first. Check your inbox.')
      } else {
        setError(err.message || 'Something went wrong.')
      }
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
        <span className="text-white font-semibold text-lg tracking-tight">Candor</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back.</h1>
          <p className="text-w3 text-sm">Sign in to your Candor account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between mb-2">
              <label className="candor-label">Password</label>
              <Link href="/auth/reset" className="text-xs text-w4 hover:text-w2 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="candor-input"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="candor-btn-primary w-full py-3.5 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text-w4 text-sm mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-white font-semibold hover:text-w2 transition-colors">
            Join Candor
          </Link>
        </p>
      </div>
    </div>
  )
}
