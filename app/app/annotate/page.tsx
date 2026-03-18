import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Annotate PDF Free — Highlight & Sticky Notes | LocalPDF',
  description:
    'Highlight text in yellow, green, or pink and add sticky notes to any PDF. 100% in your browser — files never leave your device.',
  alternates: { canonical: 'https://localpdf.tools/annotate' },
  openGraph: {
    title: 'Annotate PDF Free — LocalPDF',
    description: 'Highlight and annotate PDFs directly in your browser. No upload, no account.',
    url: 'https://localpdf.tools/annotate',
  },
}

// AnnotateTool uses PDF.js — must be client-only
const AnnotateTool = dynamic(() => import('./AnnotateTool'), { ssr: false })

export default function AnnotatePage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="annotate" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Page heading */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(251,191,36,.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
            Annotation tool
          </div>
          <h1
            className="text-4xl font-normal text-white mb-3"
            style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
          >
            Annotate your PDF
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,.5)' }}>
            Highlight text, add sticky notes — baked into the PDF when you download.
          </p>
        </div>

        <AnnotateTool />

        {/* Trust badge row */}
        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#22d3a0' }}>✓</span> {item}
            </span>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
