'use client'

import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import { useUser } from '@/hooks/useUser'

export default function BillingSuccessPage() {
  const { isPro, loading } = useUser()

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-md mx-auto px-4 py-24 text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        ) : isPro ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re on Pro</h1>
            <p className="text-gray-600 mb-2">Thanks for supporting LocalPDF.</p>
            <p className="text-sm text-gray-500 mb-8">
              New tools will appear as they launch — you&apos;ll have first access.
            </p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Start editing PDFs
            </Link>
            <div className="mt-6">
              <Link href="/account" className="text-sm text-indigo-600 hover:text-indigo-800">
                View your account →
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-semibold text-gray-800 mb-3">Payment processing…</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your Pro status should appear within a few seconds. If it doesn&apos;t, try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </main>
  )
}
