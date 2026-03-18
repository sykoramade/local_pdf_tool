import type { Metadata } from 'next'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Blog — LocalPDF',
  description:
    'Long-form guides, privacy deep-dives, and release notes from the LocalPDF team.',
  alternates: { canonical: 'https://localpdf.tools/blog' },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="blog" />

      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.28)',
            marginBottom: 20,
          }}
        >
          LocalPDF Blog
        </p>

        <h1
          className="text-5xl font-normal mb-5"
          style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
        >
          Coming soon.
        </h1>

        <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,.45)' }}>
          Long-form guides, privacy architecture breakdowns, and release notes.
          <br />
          Subscribe to updates via the waitlist on <a href="/pricing" style={{ color: '#818cf8', textDecoration: 'underline' }}>Pricing</a>.
        </p>
      </div>

      <Footer />
    </main>
  )
}
