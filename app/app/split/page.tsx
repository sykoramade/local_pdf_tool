import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import Footer from '@/app/components/Footer'
import SplitTool from './SplitTool'

export const metadata: Metadata = {
  title: 'Split PDF — Extract Pages or Split into Individual Files',
  description:
    'Split a PDF into individual pages or extract a page range. No upload, no account, no watermark. Processed entirely in your browser.',
  alternates: { canonical: 'https://localpdf.tools/split' },
}

export default function SplitPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="split" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(96,165,250,.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#60a5fa' }} />
            Split tool
          </div>
          <h1
            className="text-4xl font-normal text-white mb-3"
            style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
          >
            Split PDF
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,.5)' }}>
            Split into one file per page, or extract a page range. Processed entirely in your browser.
          </p>
        </div>

        <SplitTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#22d3a0' }}>✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center space-y-2">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>Need to merge or compress instead?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/merge" className="font-medium underline" style={{ color: '#a5b4fc' }}>
              Merge PDFs →
            </Link>
            <Link href="/compress" className="font-medium underline" style={{ color: '#a5b4fc' }}>
              Compress PDF →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
