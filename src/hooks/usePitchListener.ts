'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface PitchListenerOptions {
  candidateId: string
  onNewPitch: (pitch: any) => void
  onPitchUpdated?: (pitch: any) => void
}

export function usePitchListener({
  candidateId,
  onNewPitch,
  onPitchUpdated,
}: PitchListenerOptions) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!candidateId) return

    // Subscribe to new pitches for this candidate
    channelRef.current = supabase
      .channel(`pitches:${candidateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pitches',
          filter: `candidate_id=eq.${candidateId}`,
        },
        async (payload) => {
          // Fetch full pitch with company data
          const { data: fullPitch } = await supabase
            .from('pitches')
            .select('*, company:company_profiles(company_name, culture_score, is_candor_verified)')
            .eq('id', payload.new.id)
            .single()

          if (fullPitch) onNewPitch(fullPitch)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pitches',
          filter: `candidate_id=eq.${candidateId}`,
        },
        (payload) => {
          if (onPitchUpdated) onPitchUpdated(payload.new)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [candidateId, onNewPitch, onPitchUpdated])
}

// Toast notification for new pitch
export function showPitchToast(pitch: any) {
  if (typeof window === 'undefined') return

  // Use browser notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New pitch received', {
      body: `${pitch.company?.company_name} pitched you for ${pitch.role_title} at £${(pitch.salary_min / 100).toLocaleString()}`,
      icon: '/favicon.png',
    })
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
