'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/auth/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Subscribe first so we don't miss events that fire before getUser resolves
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Still call getUser for the initial session — the subscription handles updates
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
