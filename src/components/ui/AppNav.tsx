'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AppNavProps {
  userType: 'candidate' | 'company'
  walletBalance?: number
  notificationCount?: number
  companyName?: string
}

export function AppNav({ userType, walletBalance = 0, notificationCount = 0, companyName }: AppNavProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function formatCurrency(pence: number) {
    return `£${(pence / 100).toFixed(2)}`
  }

  const dashboardLink = userType === 'company' ? '/dashboard/company' : '/dashboard/candidate'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10">

      {/* Logo */}
      <Link href={dashboardLink} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.2" stroke="black" strokeWidth="1.5"/>
            <circle cx="6" cy="6" r="1.7" fill="black"/>
          </svg>
        </div>
        <span className="text-white font-semibold tracking-tight">Candor</span>
        {companyName && (
          <span className="text-w5 text-sm hidden sm:block">/ {companyName}</span>
        )}
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Wallet (candidates only) */}
        {userType === 'candidate' && (
          <Link
            href="/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-s1 border border-white/10 hover:border-white/20 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#23D160" strokeWidth="1.4" strokeLinecap="round">
              <rect x="1" y="4" width="11" height="8" rx="1.5"/>
              <path d="M1 7h11"/>
              <path d="M7.5 2l3 2"/>
            </svg>
            <span className="text-candor-green font-bold text-sm">{formatCurrency(walletBalance)}</span>
          </Link>
        )}

        {/* Credits (companies only) */}
        {userType === 'company' && (
          <Link
            href="/billing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-s1 border border-white/10 hover:border-white/20 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#4B7BFF" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="6.5" cy="6.5" r="5.5"/>
              <path d="M6.5 3.5v6M4 6.5h5"/>
            </svg>
            <span className="text-candor-blue font-bold text-sm">Credits</span>
          </Link>
        )}

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-s1 border border-white/10 hover:border-white/20 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#A0A0A0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 1a4.5 4.5 0 014.5 4.5v3l1.5 2H2L3.5 8.5V5.5A4.5 4.5 0 017.5 1z"/>
            <path d="M5.5 12a2 2 0 004 0"/>
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-candor-red rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-xl bg-s1 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#A0A0A0" strokeWidth="1.4" strokeLinecap="round">
              <path d="M2 4h11M2 7.5h11M2 11h11"/>
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-48 bg-s1 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-1">
                  {userType === 'candidate' && (
                    <>
                      <Link href="/dashboard/candidate" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/profile/edit" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Edit profile
                      </Link>
                      <Link href="/wallet" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Wallet
                      </Link>
                      <Link href="/billing" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Upgrade to Pro
                      </Link>
                    </>
                  )}
                  {userType === 'company' && (
                    <>
                      <Link href="/dashboard/company" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/pitch/new" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        New pitch
                      </Link>
                      <Link href="/billing" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                        Billing
                      </Link>
                    </>
                  )}
                  <Link href="/transparency" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-w2 hover:bg-white/5 transition-colors">
                    Transparency Report
                  </Link>
                  <div className="h-px bg-white/10 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-candor-red hover:bg-candor-red/5 transition-colors text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
