import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import Footer from '@/app/components/Footer'
import CompressTool from './CompressTool'

export const metadata: Metadata = {
  title: 'Free PDF Compressor — Reduce PDF Size Without Uploading',
  description:
    'Compress your PDF file in the browser. No upload, no account, no watermark. Reduces file size by removing redundant PDF structure.',
  alternates: { canonical: 'https://localpdf.tools/compress' },
}

export default function CompressPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="compress" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#f59e0b' }} />
            Compress tool
          </div>
          <h1
            className="text-4xl font-normal text-white mb-3"
            style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
          >
            Compress PDF
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,.5)' }}>
            Reduce file size by removing redundant PDF structure. Processed entirely in your browser.
          </p>
        </div>

        <CompressTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#22d3a0' }}>✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,.4)' }}>Need to edit text too?</p>
          <Link
            href="/edit"
            className="text-sm font-medium underline"
            style={{ color: '#a5b4fc' }}
          >
            Open the PDF text editor →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
