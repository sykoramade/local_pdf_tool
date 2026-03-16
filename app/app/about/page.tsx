import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About LocalPDF — Privacy-First PDF Tools',
  description:
    'Learn why LocalPDF processes everything in your browser, never uploads your files, and has no paywalls. Built for people who value privacy and honesty.',
}

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Back to LocalPDF
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About LocalPDF</h1>
        <p className="text-lg text-gray-600 mb-12">
          A simple set of PDF tools that don&apos;t treat you like a product.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why we built this</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Every time someone needs to fix a typo in a PDF, the top Google results send them through the same trap:
            upload your file, do all the work, click download — paywall. Or worse, your private document sits on
            a server somewhere you&apos;ve never heard of.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We built LocalPDF because the tools that exist are designed to extract money, not deliver value.
            There&apos;s no good reason a simple text edit requires a subscription.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How it actually works</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            When you open a PDF in LocalPDF, it loads directly into your browser using WebAssembly-based PDF
            rendering. Your file is never sent anywhere. There is no server receiving your documents.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            You can verify this yourself: open your browser&apos;s network inspector (F12 → Network tab), load
            a PDF, make some edits, and download. You&apos;ll see zero outbound requests containing your file.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            The only external requests are to load the app itself (standard website resources — JavaScript,
            CSS). Your PDF never leaves your computer.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <Link href="/privacy-architecture" className="text-indigo-600 hover:text-indigo-800 underline">
              Full technical details and verification steps →
            </Link>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">GDPR compliance by architecture</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF is built in compliance with GDPR Article 25 — Data Protection by Design. Because no file
            content ever leaves your browser, LocalPDF does not require a Data Processing Agreement for document
            processing. Healthcare workers, legal professionals, and anyone handling sensitive documents can
            use LocalPDF without triggering data transfer obligations.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <Link href="/privacy-architecture" className="text-indigo-600 hover:text-indigo-800 underline">
              Read the full technical explanation →
            </Link>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What&apos;s free, what&apos;s not</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Core tools — text editing and PDF compression — are free to use with no page limits and no
            watermarks. We&apos;re building toward a Pro tier for power users who need more advanced tools
            and want to support continued development.
          </p>
          <p className="text-gray-600 leading-relaxed">
            When we introduce paid features, the free tier will continue to work exactly as it does today.
            No bait-and-switch.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Font matching</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Most PDF editors solve text editing by pasting a plain text box over your content — the result
            looks obviously patched. LocalPDF reads the original font metadata from your PDF and matches it
            to the closest available font, so your edits blend in rather than standing out.
          </p>
          <p className="text-gray-600 leading-relaxed">
            It works well for the standard fonts used in most everyday documents — contracts, invoices,
            forms, CVs. Heavily customised corporate fonts may not match perfectly, and we&apos;ll tell you
            when that happens rather than silently falling back.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Try the PDF Editor →
          </Link>
        </div>
      </article>
    </main>
  )
}
