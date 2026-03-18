'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/app/components/NavBar'
import { useUser } from '@/hooks/useUser'
import { getUsesToday, FREE_USES_PER_DAY } from '@/lib/usage'
import { getSupabaseClient } from '@/lib/auth/client'

export default function AccountPage() {
  const { user, isPro, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
      router.replace('/')
    }
  }

  if (loading || !user) return null

  const usesToday = getUsesToday()

  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="account" />

      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-white mb-8">Your account</h1>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)' }}>
          <div className="px-6 py-4">
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Email</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>{user.email}</p>
          </div>

          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Plan</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>
              {isPro ? 'Pro — $9/month' : 'Free — unlimited tool uses (signed in)'}
            </p>
          </div>

          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Tool uses today</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>
              {usesToday} use{usesToday !== 1 ? 's' : ''} (signed-in accounts are unlimited)
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="w-full font-medium py-2.5 rounded-lg transition-colors text-sm hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}
          >
            Sign out
          </button>
        </div>

        <p className="text-xs text-center mt-8" style={{ color: 'rgba(255,255,255,.4)' }}>
          Anonymous users get {FREE_USES_PER_DAY} free uses per day. Signed-in accounts are always unlimited.
        </p>
      </div>
    </main>
  )
}
