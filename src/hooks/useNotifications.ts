'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    loadNotifications()
    return subscribeToNotifications()
  }, [userId])

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId as string)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data as any[])
      setUnreadCount((data as any[]).filter((n: any) => !n.is_read).length)
    }
    setLoading(false)
  }

  function subscribeToNotifications() {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const newNotif = payload.new as any
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('user_id', userId as string)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  async function markRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', notificationId)

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, loading, markAllRead, markRead, reload: loadNotifications }
}
