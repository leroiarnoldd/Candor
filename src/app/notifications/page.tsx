'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Notification } from '@/types/database'

const NOTIF_ICONS: Record<string, string> = {
  new_pitch: '📨',
  pitch_accepted: '✅',
  pitch_declined: '↩️',
  hire_confirmed: '🎉',
  payment_received: '💰',
  payment_ready: '🏦',
  ghosting_warning: '⚠️',
  profile_view: '👁',
  system: '📢',
}

const NOTIF_COLORS: Record<string, string> = {
  new_pitch: 'border-candor-blue/30 bg-candor-blue/5',
  pitch_accepted: 'border-candor-green/30 bg-candor-green/5',
  hire_confirmed: 'border-candor-green/30 bg-candor-green/5',
  payment_received: 'border-candor-green/30 bg-candor-green/5',
  payment_ready: 'border-candor-green/30 bg-candor-green/5',
  ghosting_warning: 'border-candor-red/30 bg-candor-red/5',
  system: 'border-white/10 bg-s1',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<'candidate' | 'company'>('candidate')

  useEffect(() => {
    loadNotifications()
    subscribeToNew()
  }, [])

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [notifRes, userRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single(),
    ])

    if (notifRes.data) setNotifications(notifRes.data)
    if (userRes.data) setUserType(userRes.data.user_type as any)
    setLoading(false)

    // Mark all as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  function subscribeToNew() {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .channel('notifications-page')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        })
        .subscribe()
    })
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const dashboardLink = userType === 'company' ? '/dashboard/company' : '/dashboard/candidate'
  const unread = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-w5 border-t-candor-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <Link href={dashboardLink} className="text-w4 text-sm hover:text-w2 transition-colors flex items-center gap-2">
          ← Dashboard
        </Link>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="candor-section-label">Notifications</div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {notifications.length === 0 ? 'All clear.' : `${notifications.length} notifications.`}
            </h1>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-white font-bold text-lg mb-2">No notifications yet.</h3>
            <p className="text-w4 text-sm">When companies pitch you, payments arrive, or anything important happens — it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-white/20 ${
                  NOTIF_COLORS[notif.type] || 'border-white/10 bg-s1'
                } ${!notif.is_read ? 'ring-1 ring-candor-blue/20' : ''}`}
                onClick={() => notif.action_url && router.push(notif.action_url)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 mt-0.5">
                    {NOTIF_ICONS[notif.type] || '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white text-sm">{notif.title}</div>
                      <div className="text-xs text-w5 flex-shrink-0">{timeAgo(notif.created_at)}</div>
                    </div>
                    <p className="text-sm text-w3 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.action_url && (
                      <div className="text-xs text-candor-blue mt-2 font-semibold">
                        View →
                      </div>
                    )}
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-candor-blue flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
