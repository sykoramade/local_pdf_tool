import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'How to Annotate a PDF for Free (No Upload Required) | LocalPDF',
  description:
    'Highlight text, add sticky notes, and annotate any PDF directly in your browser. Nothing is uploaded to a server — your document stays private.',
  alternates: { canonical: 'https://localpdf.tools/guides/annotate-pdf-free' },
  openGraph: {
    title: 'How to Annotate a PDF for Free (No Upload) — LocalPDF',
    description: 'Highlight text and add sticky notes to any PDF in your browser. 100% private — nothing leaves your device.',
    url: 'https://localpdf.tools/guides/annotate-pdf-free',
  },
}

export default function GuideAnnotatePdfFree() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar />

      <article className="max-w-2xl mx-auto px-4 py-20">

        {/* Breadcrumb */}
        <nav className="text-xs mb-8" style={{ color: 'rgba(255,255,255,.35)' }}>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides/pdf-editor-no-upload" className="hover:text-white transition-colors">Guides</Link>
          <span className="mx-2">/</span>
          <span style={{ color: 'rgba(255,255,255,.6)' }}>Annotate PDF free</span>
        </nav>

        <h1
          className="text-4xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-display, serif)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          How to Annotate a PDF for Free — Without Uploading It
        </h1>

        <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
          Most PDF annotation tools — ilovepdf, smallpdf, Adobe Acrobat online — send your file to a server before you can mark it up.
          LocalPDF does everything in your browser using WebAssembly. Your document never touches a server.
        </p>

        {/* CTA */}
        <div
          className="rounded-xl p-6 mb-12"
          style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)' }}
        >
          <p className="text-sm font-semibold text-white mb-3">Try it now — no sign-up needed</p>
          <Link
            href="/annotate"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            style={{ background: '#fbbf24', color: '#0b0d14' }}
          >
            Open the annotation tool →
          </Link>
        </div>

        <h2 className="text-xl font-bold text-white mt-10 mb-4">Step-by-step: highlighting text</h2>
        <ol className="space-y-4 mb-8" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >1</span>
            <span>Open <Link href="/annotate" className="text-yellow-400 underline underline-offset-2">localpdf.tools/annotate</Link> and drop your PDF onto the page.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >2</span>
            <span>Click <strong className="text-white">Yellow</strong>, <strong className="text-white">Green</strong>, or <strong className="text-white">Pink</strong> in the toolbar to choose a highlight colour.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >3</span>
            <span>Click any word or phrase on the page — it gets highlighted instantly. Click again to remove it.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >4</span>
            <span>Click <strong className="text-white">⬇ Download</strong>. The highlights are permanently embedded in the PDF — viewable in any reader.</span>
          </li>
        </ol>

        <h2 className="text-xl font-bold text-white mt-10 mb-4">Step-by-step: sticky notes</h2>
        <ol className="space-y-4 mb-8" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >1</span>
            <span>In the toolbar, click <strong className="text-white">Sticky note</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >2</span>
            <span>Click anywhere on the page. A yellow sticky note appears at that position.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >3</span>
            <span>Type your note text. Press <kbd className="text-xs bg-white bg-opacity-10 rounded px-1">Enter</kbd> or click elsewhere to confirm.</span>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,.2)', color: '#fbbf24' }}
            >4</span>
            <span>Download — the note is printed on the page.</span>
          </li>
        </ol>

        <h2 className="text-xl font-bold text-white mt-10 mb-4">Why is this free?</h2>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          Because the work happens entirely in your browser. There are no server costs for processing your files — only static hosting for the JavaScript.
          We offer a free tier (3 downloads per day) and a Pro plan for unlimited use.
        </p>

        <h2 className="text-xl font-bold text-white mt-10 mb-4">Privacy: the technical facts</h2>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          LocalPDF loads <code className="text-yellow-300 text-sm bg-white bg-opacity-5 rounded px-1">pdf-lib</code> (PDF creation) and{' '}
          <code className="text-yellow-300 text-sm bg-white bg-opacity-5 rounded px-1">pdfjs-dist</code> (PDF rendering) as WebAssembly modules.
          Your file is read from disk into browser memory, processed, and saved back to disk.
          Open DevTools → Network tab while annotating: you will see zero upload requests.
        </p>
        <p style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          More detail: <Link href="/privacy-architecture" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">Technical privacy architecture →</Link>
        </p>

        <h2 className="text-xl font-bold text-white mt-10 mb-4">Frequently asked questions</h2>

        <div className="space-y-6" style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
          <div>
            <p className="font-semibold text-white mb-1">Are the annotations permanent?</p>
            <p>Yes. When you download, highlights and sticky notes are drawn directly onto the PDF page using pdf-lib. They are visible in Adobe Reader, Preview, Chrome PDF viewer, and every other standard reader.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Can I annotate a password-protected PDF?</p>
            <p>No. You need to remove the password first. Try unlocking the PDF with the owner password in your PDF reader, then save it without encryption.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">What is the free tier limit?</p>
            <p>3 downloads per calendar day, reset at local midnight. Highlights and sticky notes are unlimited — you only use a credit when you click Download.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Does it work on mobile?</p>
            <p>Yes, on modern mobile browsers (Safari iOS 16+, Chrome Android). The annotation overlay is touch-compatible.</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 rounded-xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}
        >
          <p className="text-lg font-bold text-white mb-2">Ready to annotate?</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.5)' }}>
            No account. No upload. Works offline after first load.
          </p>
          <Link
            href="/annotate"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Open annotation tool →
          </Link>
        </div>

      </article>

      <Footer />
    </main>
  )
}
