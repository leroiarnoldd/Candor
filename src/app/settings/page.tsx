'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'account' | 'password' | 'notifications' | 'danger'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'account')
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'candidate' | 'company'>('candidate')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification prefs
  const [notifNewPitch, setNotifNewPitch] = useState(true)
  const [notifPayments, setNotifPayments] = useState(true)
  const [notifCommunity, setNotifCommunity] = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)

  useEffect(() => { loadUser() }, [])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)

    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (userData) setUserType(userData.user_type as any)
    setLoading(false)
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone. All your data, wallet balance, and profile will be permanently removed.'
    )
    if (!confirmed) return
    const doubleConfirm = window.confirm('This is permanent. Your wallet balance will be lost. Are you absolutely sure?')
    if (!doubleConfirm) return

    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const dashboardLink = userType === 'company' ? '/dashboard/company' : '/dashboard/candidate'

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href={dashboardLink} className="text-w4 text-sm hover:text-w2 transition-colors">← Dashboard</Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </div>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="candor-section-label">Settings</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Account settings.</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-s1 border border-white/10 mb-6 flex-wrap">
          {[
            { id: 'account', label: 'Account' },
            { id: 'password', label: 'Password' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'danger', label: 'Danger zone' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? t.id === 'danger' ? 'bg-candor-red text-white' : 'bg-white text-black'
                  : t.id === 'danger' ? 'text-candor-red hover:text-candor-red/80' : 'text-w4 hover:text-w2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-candor-green/10 border border-candor-green/30 text-candor-green text-sm mb-4">
            ✓ Saved successfully.
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm mb-4">
            {error}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {tab === 'account' && (
          <div className="space-y-4">
            <div className="candor-card p-5">
              <div className="candor-label mb-4">Account details</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-w4 mb-1">Email address</div>
                  <div className="text-sm font-semibold text-white">{user?.email}</div>
                </div>
                <div>
                  <div className="text-xs text-w4 mb-1">Account type</div>
                  <div className="text-sm font-semibold text-white capitalize">{userType}</div>
                </div>
                <div>
                  <div className="text-xs text-w4 mb-1">Member since</div>
                  <div className="text-sm font-semibold text-white">
                    {new Date(user?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="candor-card p-5">
              <div className="candor-label mb-4">Quick links</div>
              <div className="space-y-2">
                {userType === 'candidate' && (
                  <>
                    <Link href="/profile/edit" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                      <span className="text-sm text-white">Edit profile</span>
                      <span className="text-w5 text-xs">→</span>
                    </Link>
                    <Link href="/wallet" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                      <span className="text-sm text-white">Wallet & earnings</span>
                      <span className="text-w5 text-xs">→</span>
                    </Link>
                    <Link href="/billing" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                      <span className="text-sm text-white">Upgrade plan</span>
                      <span className="text-w5 text-xs">→</span>
                    </Link>
                  </>
                )}
                {userType === 'company' && (
                  <>
                    <Link href="/billing" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                      <span className="text-sm text-white">Billing & plan</span>
                      <span className="text-w5 text-xs">→</span>
                    </Link>
                    <Link href="/dashboard/company" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                      <span className="text-sm text-white">Company dashboard</span>
                      <span className="text-w5 text-xs">→</span>
                    </Link>
                  </>
                )}
                <Link href="/legal/privacy" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                  <span className="text-sm text-white">Privacy policy</span>
                  <span className="text-w5 text-xs">→</span>
                </Link>
                <Link href="/legal/terms/candidate" className="flex items-center justify-between p-3 rounded-xl bg-s2 border border-white/10 hover:border-white/20 transition-all">
                  <span className="text-sm text-white">Terms of service</span>
                  <span className="text-w5 text-xs">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {tab === 'password' && (
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Change password</div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="candor-label block mb-2">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="candor-input"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="candor-label block mb-2">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="candor-input"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newPassword || !confirmPassword}
                className="candor-btn-primary w-full py-3"
              >
                {saving ? 'Updating...' : 'Update password →'}
              </button>
            </form>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div className="candor-card p-6">
            <div className="candor-label mb-5">Notification preferences</div>
            <div className="space-y-4">
              {[
                { label: 'New pitch received', desc: 'When a company sends you a pitch', value: notifNewPitch, set: setNotifNewPitch },
                { label: 'Payment received', desc: 'When money is added to your wallet', value: notifPayments, set: setNotifPayments },
                { label: 'Community activity', desc: 'Replies, votes, and problem updates', value: notifCommunity, set: setNotifCommunity },
                { label: 'Email notifications', desc: 'Receive notifications by email as well', value: notifEmail, set: setNotifEmail },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{item.label}</div>
                    <div className="text-xs text-w4">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={`w-10 h-5.5 rounded-full transition-all flex-shrink-0 relative mt-0.5 ${
                      item.value ? 'bg-candor-green' : 'bg-white/20'
                    }`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      item.value ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
              className="candor-btn-primary w-full py-3 mt-5"
            >
              Save preferences →
            </button>
          </div>
        )}

        {/* DANGER ZONE */}
        {tab === 'danger' && (
          <div className="space-y-4">
            <div className="candor-card p-5 border-candor-red/20">
              <div className="candor-label mb-3" style={{ color: '#F87171' }}>Sign out everywhere</div>
              <p className="text-sm text-w4 leading-relaxed mb-4">
                Sign out of all devices and browsers. You will need to sign back in.
              </p>
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
                className="candor-btn-secondary px-5 py-2.5 text-sm"
              >
                Sign out →
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-candor-red/30 bg-candor-red/5">
              <div className="candor-label mb-3" style={{ color: '#F87171' }}>Delete account</div>
              <p className="text-sm text-w3 leading-relaxed mb-4">
                Permanently delete your account and all associated data. This includes your profile, pitch history, wallet balance, and community contributions. <span className="text-candor-red font-semibold">This cannot be undone.</span>
              </p>
              {userType === 'candidate' && (
                <div className="p-3 rounded-xl bg-candor-amber/10 border border-candor-amber/20 mb-4">
                  <p className="text-xs text-candor-amber leading-relaxed">
                    If you have a wallet balance above £0, withdraw it before deleting your account. Balances are not automatically refunded.
                  </p>
                </div>
              )}
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-candor-red border border-candor-red/30 hover:bg-candor-red/10 transition-all"
              >
                Delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
