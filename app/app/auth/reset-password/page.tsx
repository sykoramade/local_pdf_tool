'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/auth/client'

type Step = 'request' | 'check-email' | 'set-password' | 'done'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If user lands here after clicking the reset link, Supabase sets the session
  // via the URL fragment. Detect that and switch to password-entry step.
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('set-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Auth is not configured yet.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('check-email')
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Auth is not configured.')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('done')
      setTimeout(() => router.push('/workspace'), 2000)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0f17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#f4f6fc',
          textDecoration: 'none',
          marginBottom: 32,
          letterSpacing: '-0.02em',
        }}
      >
        LocalPDF
      </Link>

      <div
        style={{
          background: '#12151f',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,.5)',
          maxWidth: 380,
          width: '100%',
          padding: 28,
        }}
      >
        {step === 'request' && (
          <>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#f4f6fc',
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
              }}
            >
              Reset your password
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: '0 0 22px' }}>
              Enter your email and we&apos;ll send a reset link.
            </p>

            <form onSubmit={handleRequestReset}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  display: 'block',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 9,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: '#f4f6fc',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
                onFocus={e =>
                  ((e.target as HTMLElement).style.borderColor = 'rgba(99,102,241,.6)')
                }
                onBlur={e =>
                  ((e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,.12)')
                }
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? 'rgba(99,102,241,.5)' : '#6366f1',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px 16px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            {error && (
              <p style={{ fontSize: 12, color: '#f87171', marginTop: 10, textAlign: 'center' }}>
                {error}
              </p>
            )}

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', textAlign: 'center', marginTop: 14 }}>
              <Link href="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </p>
          </>
        )}

        {step === 'check-email' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📬</div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#f4f6fc', margin: '0 0 8px' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: 0, lineHeight: 1.5 }}>
              Reset link sent to <strong style={{ color: '#f4f6fc' }}>{email}</strong>.
            </p>
          </div>
        )}

        {step === 'set-password' && (
          <>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#f4f6fc',
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
              }}
            >
              Set a new password
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: '0 0 22px' }}>
              Choose a strong password for your account.
            </p>

            <form onSubmit={handleSetPassword}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                style={{
                  width: '100%',
                  display: 'block',
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 9,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: '#f4f6fc',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
                onFocus={e =>
                  ((e.target as HTMLElement).style.borderColor = 'rgba(99,102,241,.6)')
                }
                onBlur={e =>
                  ((e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,.12)')
                }
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? 'rgba(99,102,241,.5)' : '#6366f1',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px 16px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>

            {error && (
              <p style={{ fontSize: 12, color: '#f87171', marginTop: 10, textAlign: 'center' }}>
                {error}
              </p>
            )}
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>✅</div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#f4f6fc', margin: '0 0 8px' }}>
              Password updated
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: 0 }}>
              Redirecting you to the app…
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
