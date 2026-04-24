'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useWallet(userId?: string) {
  const [balance, setBalance] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    loadWallet()
    subscribeToUpdates()
  }, [userId])

  async function loadWallet() {
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('wallet_balance, total_earned')
      .eq('user_id', userId)
      .single()

    if (profile) {
      setBalance(profile.wallet_balance)
      setTotalEarned(profile.total_earned)
    }

    const { data: pendingTx } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('amount', 0)

    if (pendingTx) {
      setPendingAmount(pendingTx.reduce((sum, t) => sum + t.amount, 0))
    }

    setLoading(false)
  }

  function subscribeToUpdates() {
    // Subscribe to real-time wallet balance changes
    const channel = supabase
      .channel(`wallet:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidate_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setBalance((payload.new as any).wallet_balance)
            setTotalEarned((payload.new as any).total_earned)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  function formatCurrency(pence: number) {
    return `£${(pence / 100).toFixed(2)}`
  }

  return {
    balance,
    totalEarned,
    pendingAmount,
    loading,
    formatted: {
      balance: formatCurrency(balance),
      totalEarned: formatCurrency(totalEarned),
      pendingAmount: formatCurrency(pendingAmount),
    },
    canWithdraw: balance >= 5000,
    reload: loadWallet,
  }
}
