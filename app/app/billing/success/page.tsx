'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import { useUser } from '@/hooks/useUser'

const POLL_INTERVAL_MS = 3000
const TIMEOUT_MS = 30000

export default function BillingSuccessPage() {
  const { isPro, loading, refresh } = useUser()
  const [timedOut, setTimedOut] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isPro) {
      if (pollRef.current) clearInterval(pollRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }

    if (!loading && !isPro && !timedOut) {
      pollRef.current = setInterval(() => {
        refresh?.()
      }, POLL_INTERVAL_MS)

      timeoutRef.current = setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current)
        setTimedOut(true)
      }, TIMEOUT_MS)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPro, loading, timedOut, refresh])

  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar />

      <div className="max-w-md mx-auto px-4 py-24 text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 rounded w-48 mx-auto mb-4" style={{ background: 'rgba(255,255,255,.08)' }} />
            <div className="h-4 rounded w-64 mx-auto" style={{ background: 'rgba(255,255,255,.08)' }} />
          </div>
        ) : isPro ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-3">You&apos;re on Pro</h1>
            <p className="mb-2" style={{ color: 'rgba(255,255,255,.6)' }}>Thanks for supporting LocalPDF.</p>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,.5)' }}>
              New tools will appear as they launch — you&apos;ll have first access.
            </p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Start editing PDFs
            </Link>
            <div className="mt-6">
              <Link href="/account" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                View your account →
              </Link>
            </div>
          </>
        ) : timedOut ? (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-white mb-3">Taking longer than expected</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.5)' }}>
              Your payment may still be processing. Wait a minute, then check your account page.
              If your plan still shows Free after 5 minutes, please get in touch.
            </p>
            <Link
              href="/account"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm mb-4"
            >
              Check account
            </Link>
            <div>
              <button
                onClick={() => { setTimedOut(false); refresh?.() }}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors underline"
              >
                Try again
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-semibold text-white mb-3">Payment processing…</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.5)' }}>
              Confirming your Pro status. This usually takes a few seconds.
            </p>
            <div className="flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
