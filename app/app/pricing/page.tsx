'use client'

import { useState } from 'react'
import NavBar from '@/app/components/NavBar'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'

export default function PricingPage() {
  const { user, isPro, loading } = useUser()
  const [showAuth, setShowAuth] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  async function handleUpgrade() {
    if (!user) {
      setShowAuth(true)
      return
    }
    setUpgrading(true)
    setUpgradeError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setUpgradeError('Could not start checkout. Please try again.')
        setUpgrading(false)
      }
    } catch {
      setUpgradeError('Could not start checkout. Please try again.')
      setUpgrading(false)
    }
  }

  const freeFeatures = [
    'PDF text editor',
    'PDF compressor',
    'PDF merger',
    'Files never leave your browser',
    'No account required for basic use',
    '3 uses/day without sign-in',
    'Unlimited uses when signed in (free)',
  ]

  const proFeatures = [
    'Everything in Free',
    'PDF Split (coming soon)',
    'OCR for scanned documents (coming soon)',
    'Batch processing (coming soon)',
    'Early access to all new tools',
    'Support independent development',
  ]

  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Simple, honest pricing</h1>
          <p className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,.6)' }}>
            The core tools are free — no tricks, no paywall after you&apos;ve done the work.
            Pro is for people who want to support the project and get new tools first.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="mb-4">
              <p className="text-sm font-medium uppercase tracking-wide mb-1" style={{ color: 'rgba(255,255,255,.5)' }}>Free</p>
              <p className="text-4xl font-bold text-white">$0</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>forever</p>
            </div>
            <ul className="space-y-2 mb-6">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>
                  <span className="text-green-400 shrink-0 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="text-sm font-medium py-2.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)' }}>
              {user ? 'Your current plan' : 'No sign-up needed'}
            </div>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="mb-4">
              <p className="text-sm font-medium text-indigo-200 uppercase tracking-wide mb-1">Pro</p>
              <p className="text-4xl font-bold">$9</p>
              <p className="text-sm text-indigo-300 mt-1">per month</p>
            </div>
            <ul className="space-y-2 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-indigo-100">
                  <span className="text-indigo-300 shrink-0 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            {!loading && (
              isPro ? (
                <div className="bg-white/20 text-white text-sm font-medium py-2.5 rounded-lg text-center">
                  You&apos;re on Pro
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full bg-white hover:bg-indigo-50 disabled:bg-white/70 text-indigo-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  {upgrading ? 'Redirecting…' : user ? 'Upgrade to Pro' : 'Sign in to upgrade'}
                </button>
              )
            )}
          </div>
        </div>

        {upgradeError && (
          <p className="mt-4 text-sm text-red-400 text-center">{upgradeError}</p>
        )}

        <div className="mt-10 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
            No contracts. Cancel anytime. Payment processed by Stripe.
            Your PDF files are never sent to our servers — not even on Pro.
          </p>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  )
}
