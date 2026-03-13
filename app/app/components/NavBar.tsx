'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { getSupabaseClient } from '@/lib/auth/client'
import { usesRemaining, FREE_USES_PER_DAY } from '@/lib/usage'
import AuthModal from './AuthModal'

interface NavBarProps {
  current?: 'editor' | 'compress' | 'merge' | 'split' | 'sign' | 'about' | 'account' | 'pricing'
}

export default function NavBar({ current }: NavBarProps) {
  const { user, loading } = useUser()
  const [showAuth, setShowAuth] = useState(false)
  // Read localStorage after mount only — avoids SSR hydration mismatch
  const [remaining, setRemaining] = useState(FREE_USES_PER_DAY)
  useEffect(() => { setRemaining(usesRemaining()) }, [])
  const authEnabled = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    if (supabase) await supabase.auth.signOut()
  }

  const links: { href: string; label: string; key: NavBarProps['current'] }[] = [
    { href: '/', label: 'PDF Editor', key: 'editor' },
    { href: '/compress', label: 'Compress', key: 'compress' },
    { href: '/merge', label: 'Merge', key: 'merge' },
    { href: '/split', label: 'Split', key: 'split' },
    { href: '/sign', label: 'Sign', key: 'sign' },
    { href: '/pricing', label: 'Pricing', key: 'pricing' },
    { href: '/about', label: 'About', key: 'about' },
  ]

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900 hover:text-indigo-700 transition-colors">
          LocalPDF
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {links.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className={current === key ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-800'}
            >
              {label}
            </Link>
          ))}

          {authEnabled && !loading && (
            user ? (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200">
                <Link href="/account" className="text-xs text-gray-500 hover:text-gray-800 max-w-[120px] truncate">
                  {user.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200">
                {remaining < FREE_USES_PER_DAY && (
                  <span className="text-xs text-amber-600">
                    {remaining} free use{remaining !== 1 ? 's' : ''} left today
                  </span>
                )}
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  Sign in
                </button>
              </div>
            )
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
