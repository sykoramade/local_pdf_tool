import type { Metadata } from 'next'
import Link from 'next/link'
import PdfEditor from '../components/PdfEditor'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Free PDF Editor — Edit Text Without Uploading Your File | LocalPDF',
  description:
    'Edit PDF text in your browser. No upload, no account, no paywall at download. Fix typos, update dates, change names. Your files stay on your computer.',
  keywords: [
    'pdf editor', 'edit pdf text', 'pdf editor no upload',
    'pdf editor privacy', 'free pdf editor', 'edit pdf online free',
  ],
  alternates: {
    canonical: 'https://localpdf.tools/edit',
  },
}

export default function EditPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="edit" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: 'rgba(99,102,241,.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#818cf8' }} />
            Edit tool
          </div>
          <h1
            className="text-4xl font-normal text-white mb-3"
            style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em' }}
          >
            Edit PDF
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,.5)' }}>
            Click any text and edit it directly. Fonts matched automatically. Processed entirely in your browser.
          </p>
        </div>

        <PdfEditor />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span style={{ color: '#22d3a0' }}>✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,.4)' }}>Need to sign or compress too?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/sign" className="font-medium underline" style={{ color: '#a5b4fc' }}>Sign PDF →</Link>
            <Link href="/compress" className="font-medium underline" style={{ color: '#a5b4fc' }}>Compress PDF →</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
