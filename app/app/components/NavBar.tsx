'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { getSupabaseClient } from '@/lib/auth/client'
import { usesRemaining, FREE_USES_PER_DAY } from '@/lib/usage'
import AuthModal from './AuthModal'

interface NavBarProps {
  current?: string
}

export default function NavBar({ current }: NavBarProps) {
  const { user, loading } = useUser()
  const [showAuth, setShowAuth] = useState(false)
  const [remaining, setRemaining] = useState(FREE_USES_PER_DAY)
  useEffect(() => { setRemaining(usesRemaining()) }, [])
  const authEnabled = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    if (supabase) await supabase.auth.signOut()
  }

  const links: { href: string; label: string; key: NavBarProps['current'] }[] = [
    { href: '/pricing', label: 'Pricing', key: 'pricing' },
    { href: '/privacy-architecture', label: 'Privacy', key: 'privacy' },
    { href: '/blog', label: 'Blog', key: 'blog' },
    { href: '/about', label: 'About', key: 'about' },
  ]

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-7 h-[50px]"
        style={{
          background: 'rgba(11,13,20,.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <Link
          href="/"
          className="font-semibold text-[15px] tracking-[-0.2px] text-[#f4f6fc] hover:text-white transition-colors"
        >
          LocalPDF
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className="text-[13px] px-[10px] py-[5px] rounded-md transition-all duration-150"
              style={{
                color: current === key ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.38)',
                background: current === key ? 'rgba(255,255,255,.07)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (current !== key) {
                  (e.target as HTMLElement).style.color = 'rgba(255,255,255,.8)'
                  ;(e.target as HTMLElement).style.background = 'rgba(255,255,255,.05)'
                }
              }}
              onMouseLeave={e => {
                if (current !== key) {
                  (e.target as HTMLElement).style.color = 'rgba(255,255,255,.38)'
                  ;(e.target as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {label}
            </Link>
          ))}

          {authEnabled && !loading && (
            <div className="flex items-center gap-2 ml-2 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,.1)' }}>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-xs max-w-[120px] truncate transition-colors"
                    style={{ color: 'rgba(255,255,255,.4)' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,.7)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,.4)')}
                  >
                    {user.email}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs transition-colors"
                    style={{ color: 'rgba(255,255,255,.28)' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,.6)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,.28)')}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  {remaining < FREE_USES_PER_DAY && (
                    <span className="text-xs" style={{ color: 'rgba(245,158,11,.8)' }}>
                      {remaining} left today
                    </span>
                  )}
                  <button
                    onClick={() => setShowAuth(true)}
                    className="text-xs font-medium px-3 py-1 rounded-md transition-all"
                    style={{
                      background: 'rgba(99,102,241,.15)',
                      border: '1px solid rgba(99,102,241,.3)',
                      color: 'rgba(148,150,245,.9)',
                    }}
                    onMouseEnter={e => {
                      const el = e.target as HTMLElement
                      el.style.background = 'rgba(99,102,241,.25)'
                      el.style.color = '#a5b4fc'
                    }}
                    onMouseLeave={e => {
                      const el = e.target as HTMLElement
                      el.style.background = 'rgba(99,102,241,.15)'
                      el.style.color = 'rgba(148,150,245,.9)'
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
