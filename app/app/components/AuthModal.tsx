'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/auth/client'

interface AuthModalProps {
  onClose: () => void
  reason?: 'gate' | 'manual'
}

type AuthStep = 'entry' | 'check-email'

export default function AuthModal({ onClose, reason = 'manual' }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('entry')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Auth is not configured yet.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('check-email')
    }
  }

  async function handleGoogleSignIn() {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        {step === 'entry' ? (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                {reason === 'gate' ? (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900">You&apos;ve used your 3 free sessions today</h2>
                    <p className="text-sm text-gray-500 mt-1">Sign in (free) to continue using all tools. Resets at midnight.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900">Sign in to LocalPDF</h2>
                    <p className="text-sm text-gray-500 mt-1">Free account. No credit card needed.</p>
                  </>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3 shrink-0">✕</button>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm mb-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
            </div>

            <form onSubmit={handleEmailSignIn}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Sending link…' : 'Send magic link'}
              </button>
            </form>

            {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}

            <p className="text-xs text-gray-400 text-center mt-4">
              No password needed. We email you a one-click sign-in link.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-4">
              We sent a sign-in link to <strong>{email}</strong>. Click it to sign in — no password needed.
            </p>
            <button onClick={onClose} className="text-sm text-indigo-600 hover:text-indigo-800">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
