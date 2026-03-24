'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/auth/client'

type Step = 'entry' | 'check-email'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/workspace'
  const callbackError = searchParams.get('error')

  const [step, setStep] = useState<Step>('entry')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    callbackError ? 'Sign-in link expired or already used. Please try again.' : null
  )

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

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
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
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
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
      {/* Logo */}
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
        {step === 'entry' ? (
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
              Sign in to LocalPDF
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: '0 0 22px' }}>
              Free account. No credit card needed.
            </p>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: '1px solid rgba(255,255,255,.12)',
                background: 'rgba(255,255,255,.05)',
                color: 'rgba(255,255,255,.8)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 14,
                padding: '10px 16px',
                borderRadius: 9,
                cursor: 'pointer',
                marginBottom: 14,
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLElement).style.background =
                  'rgba(255,255,255,.09)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLElement).style.background =
                  'rgba(255,255,255,.05)')
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div
              style={{
                position: 'relative',
                margin: '14px 0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
              <span
                style={{
                  padding: '0 10px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,.28)',
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignIn}>
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
                  ((e.target as HTMLElement).style.borderColor =
                    'rgba(99,102,241,.6)')
                }
                onBlur={e =>
                  ((e.target as HTMLElement).style.borderColor =
                    'rgba(255,255,255,.12)')
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
                {loading ? 'Sending link…' : 'Send magic link'}
              </button>
            </form>

            {error && (
              <p
                style={{
                  fontSize: 12,
                  color: '#f87171',
                  marginTop: 10,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,.28)',
                textAlign: 'center',
                marginTop: 14,
              }}
            >
              No password needed. We email you a one-click sign-in link.
            </p>
          </>
        ) : (
          /* Check email state */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📬</div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: '#f4f6fc',
                margin: '0 0 8px',
              }}
            >
              Check your inbox
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.45)',
                margin: '0 0 20px',
                lineHeight: 1.5,
              }}
            >
              We sent a sign-in link to <strong style={{ color: '#f4f6fc' }}>{email}</strong>.
              Click it to continue.
            </p>
            <button
              onClick={() => setStep('entry')}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                color: 'rgba(255,255,255,.5)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
