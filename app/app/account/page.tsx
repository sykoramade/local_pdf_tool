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
    <main className="min-h-screen bg-gray-50">
      <NavBar current="account" />

      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your account</h1>

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-gray-800">{user.email}</p>
          </div>

          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Plan</p>
            <p className="text-sm text-gray-800">
              {isPro ? 'Pro — $9/month' : 'Free — unlimited tool uses (signed in)'}
            </p>
          </div>

          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tool uses today</p>
            <p className="text-sm text-gray-800">
              {usesToday} use{usesToday !== 1 ? 's' : ''} (signed-in accounts are unlimited)
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            Sign out
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Anonymous users get {FREE_USES_PER_DAY} free uses per day. Signed-in accounts are always unlimited.
        </p>
      </div>
    </main>
  )
}
