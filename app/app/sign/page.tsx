import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import Footer from '@/app/components/Footer'
import SignTool from './SignTool'

export const metadata: Metadata = {
  title: 'Sign PDF Without Uploading — Free, Private, In-Browser',
  description:
    'Add your signature to any PDF entirely in your browser. No upload, no account required, no watermark. Your document never leaves your device.',
  alternates: { canonical: 'https://localpdf.tools/sign' },
}

export default function SignPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="sign" />

      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center pt-16 mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(34,211,160,.12)', color: '#22d3a0', border: '1px solid rgba(34,211,160,.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22d3a0' }} />
            Sign tool
          </div>
          <h1
            className="text-4xl font-normal text-white mb-3"
            style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
          >
            Sign PDF
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,.5)' }}>
            Draw your signature and place it on any PDF page. Processed entirely in your browser — your document is never uploaded.
          </p>
        </div>

        <SignTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
          {['Files never uploaded', 'No account required', 'No watermark', 'Works on mobile'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#22d3a0' }}>✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 pb-16 text-center">
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,.4)' }}>Need to edit or compress too?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/edit" className="font-medium underline" style={{ color: '#a5b4fc' }}>PDF Editor →</Link>
            <Link href="/compress" className="font-medium underline" style={{ color: '#a5b4fc' }}>Compress PDF →</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
