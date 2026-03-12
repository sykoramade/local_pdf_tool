'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/auth/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data } = await supabase
      .from('user_profiles')
      .select('is_pro')
      .eq('id', userId)
      .single()
    setIsPro(data?.is_pro ?? false)
  }

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Subscribe first so we don't miss events that fire before getUser resolves
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      if (u) fetchProfile(u.id)
      else setIsPro(false)
    })

    // Still call getUser for the initial session — the subscription handles updates
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user)
        setLoading(false)
        if (data.user) fetchProfile(data.user.id)
      })
      .catch(() => setLoading(false))

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, isPro, loading }
}
