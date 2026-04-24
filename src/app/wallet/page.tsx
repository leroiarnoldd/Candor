'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { CandidateProfile, WalletTransaction } from '@/types/database'
import { PAYMENTS } from '@/lib/stripe'

export default function WalletPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')

  useEffect(() => { loadWallet() }, [])

  async function loadWallet() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, txRes] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('wallet_transactions').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(50),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (txRes.data) setTransactions(txRes.data)
    setLoading(false)
  }

  async function handleWithdraw() {
    if (!profile) return
    setWithdrawError('')
    setWithdrawSuccess('')
    setWithdrawing(true)

    const amount = withdrawAmount ? parseInt(withdrawAmount) * 100 : profile.wallet_balance

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_pence: amount }),
      })
      const data = await res.json()

      if (!res.ok) {
        setWithdrawError(data.error)
      } else {
        setWithdrawSuccess(data.message)
        setWithdrawAmount('')
        loadWallet()
      }
    } catch {
      setWithdrawError('Something went wrong. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  function formatCurrency(pence: number) {
    return `£${Math.abs(pence / 100).toFixed(2)}`
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function getTxIcon(type: string) {
    const icons: Record<string, string> = {
      pitch_read: '👁',
      pitch_feedback: '💬',
      hire_payment: '🎉',
      community_answer: '⭐',
      office_hours: '🎤',
      case_study: '📝',
      sponsored_problem: '🏆',
      expert_session: '💡',
      withdrawal: '🏦',
      refund: '↩️',
    }
    return icons[type] || '💰'
  }

  function getTxLabel(type: string) {
    const labels: Record<string, string> = {
      pitch_read: 'Pitch read',
      pitch_feedback: 'Decline feedback',
      hire_payment: 'Confirmed hire',
      community_answer: 'Top-rated answer',
      office_hours: 'Office hours session',
      case_study: 'Case study published',
      sponsored_problem: 'Sponsored problem winner',
      expert_session: 'Expert session',
      withdrawal: 'Bank withdrawal',
      refund: 'Refund',
    }
    return labels[type] || type
  }

  const balance = profile?.wallet_balance || 0
  const totalEarned = profile?.total_earned || 0
  const pendingAmount = transactions
    .filter(t => t.status === 'pending' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const canWithdraw = balance >= PAYMENTS.MIN_WITHDRAWAL

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-w5 border-t-candor-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/dashboard/candidate" className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="1.7" fill="black"/>
            </svg>
          </div>
          <span className="text-white font-semibold">Candor</span>
        </Link>
        <Link href="/dashboard/candidate" className="text-w4 text-sm hover:text-w2 transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="pt-14 max-w-2xl mx-auto px-6 py-8">

        <div className="mb-8">
          <div className="candor-section-label">Candor Wallet</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your earnings.</h1>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="candor-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #4B7BFF, #23D160)' }} />
            <div className="candor-label mb-2">Available</div>
            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(balance)}</div>
            {canWithdraw && (
              <div className="green-pill text-[10px] mt-2 px-2 py-0.5 w-fit">Ready to withdraw</div>
            )}
          </div>
          <div className="candor-card p-5">
            <div className="candor-label mb-2">Pending</div>
            <div className="text-3xl font-bold text-candor-amber tracking-tight">{formatCurrency(pendingAmount)}</div>
            <div className="text-xs text-w5 mt-1">Arriving soon</div>
          </div>
          <div className="candor-card p-5">
            <div className="candor-label mb-2">Total earned</div>
            <div className="text-3xl font-bold text-w2 tracking-tight">{formatCurrency(totalEarned)}</div>
            <div className="text-xs text-w5 mt-1">All time</div>
          </div>
        </div>

        {/* Withdraw section */}
        <div className="candor-card p-6 mb-6">
          <div className="candor-label mb-4">Withdraw to bank</div>

          {!canWithdraw ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-w4">Progress to minimum withdrawal</span>
                  <span className="text-xs text-w4">{formatCurrency(balance)} / £50.00</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (balance / PAYMENTS.MIN_WITHDRAWAL) * 100)}%`,
                      background: '#4B7BFF',
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-w4 leading-relaxed">
                Minimum withdrawal is £50.00. You need {formatCurrency(PAYMENTS.MIN_WITHDRAWAL - balance)} more.
                Keep reading pitches and giving feedback to build your balance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="candor-label block mb-2">
                  Amount to withdraw
                  <span className="text-w5 ml-2 normal-case font-normal">Leave blank to withdraw all</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-w3 font-semibold">£</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder={`${(balance / 100).toFixed(2)}`}
                    min="50"
                    max={balance / 100}
                    className="candor-input pl-8"
                  />
                </div>
              </div>

              {withdrawError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-candor-red text-sm">
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 rounded-xl bg-candor-green/10 border border-candor-green/30 text-candor-green text-sm">
                  {withdrawSuccess}
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="candor-btn-green w-full py-3"
              >
                {withdrawing
                  ? 'Processing...'
                  : `Withdraw ${withdrawAmount ? `£${withdrawAmount}` : formatCurrency(balance)} →`
                }
              </button>

              <p className="text-xs text-w5 leading-relaxed">
                Funds arrive within 1-2 business days via bank transfer. You will need to complete identity verification on first withdrawal. Earnings may be subject to income tax above your personal allowance.
              </p>
            </div>
          )}
        </div>

        {/* How to earn */}
        <div className="candor-card p-5 mb-6">
          <div className="candor-label mb-4">How to earn more</div>
          <div className="space-y-2">
            {[
              { action: 'Read a pitch', trigger: '60 sec minimum, 48hr delay', amount: '£2.70', color: 'text-candor-blue' },
              { action: 'Decline with feedback', trigger: 'Four structured questions', amount: '£7.10', color: 'text-candor-amber' },
              { action: 'Confirmed hire', trigger: 'Both sides confirm, 30-day hold', amount: '£30.00', color: 'text-candor-green' },
              { action: 'Win sponsored problem', trigger: '60% of prize money', amount: '£120+', color: 'text-candor-purple' },
              { action: 'Top community answer', trigger: 'Verified by peers', amount: '£15.00', color: 'text-candor-blue' },
            ].map(item => (
              <div key={item.action} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-white">{item.action}</div>
                  <div className="text-xs text-w5 mt-0.5">{item.trigger}</div>
                </div>
                <span className={`text-sm font-bold ${item.color}`}>{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <div className="candor-label mb-4">Transaction history</div>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-w5 text-sm">
              No transactions yet. Start reading pitches to earn.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-s1 border border-white/10"
                >
                  <div className="text-2xl flex-shrink-0">{getTxIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{getTxLabel(tx.type)}</div>
                    {tx.description && (
                      <div className="text-xs text-w4 mt-0.5 truncate">{tx.description}</div>
                    )}
                    <div className="text-xs text-w5 mt-0.5">{formatDate(tx.created_at)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-bold text-sm ${
                      tx.amount > 0 ? 'text-candor-green' : 'text-candor-red'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </div>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${
                      tx.status === 'completed' ? 'text-candor-green' :
                      tx.status === 'pending' ? 'text-candor-amber' : 'text-w5'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
