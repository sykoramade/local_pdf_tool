import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PDF Editor With No Upload — Edit PDFs Without Sending Your File Anywhere',
  description:
    'How to edit PDF text without uploading your file to a server. A guide to browser-based PDF editing that keeps your documents private.',
}

export default function GuideNoUpload() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← Try LocalPDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Guide</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          PDF Editor With No Upload: How to Edit PDFs Without Sending Your File to a Server
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          Most online PDF editors require you to upload your document to their servers. Here&apos;s why that
          matters — and how to avoid it.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Why PDF editors ask you to upload</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Traditional web-based PDF tools process files on a server. When you &quot;open&quot; a PDF on
            these sites, you&apos;re actually uploading a copy of your document to their infrastructure. The
            editing happens there, and you download the result.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            This design made sense when browsers couldn&apos;t run complex document processing. That&apos;s
            no longer true. Modern browsers can run near-native code through WebAssembly, which means PDF
            processing can happen entirely on your device.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Why it matters for sensitive documents</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Consider what people typically edit in PDFs: lease agreements, employment contracts, invoices,
            tax documents, medical forms, legal filings. These are not documents you want sitting on a
            stranger&apos;s server.
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Most PDF editing sites have privacy policies that allow them to retain uploaded files for days
            or weeks, use them to improve their services, or share them with third-party processors. Even
            well-intentioned companies can suffer data breaches.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            A tool that never receives your file cannot leak it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">How browser-based PDF editing works</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Tools like LocalPDF use PDF.js (Mozilla&apos;s open-source PDF renderer) to display your
            document and pdf-lib to modify it — both running entirely in your browser tab. Your file is
            read from your local disk into browser memory, processed there, and the modified version is
            written back to your local disk on download.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            At no point does the file travel over a network connection. You can verify this by opening your
            browser&apos;s developer tools (F12), switching to the Network tab, and watching what happens
            when you load and edit a PDF — you&apos;ll see no outbound upload requests.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">What you can and can&apos;t do without uploading</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>In-browser PDF tools handle most everyday tasks well:</p>
          <ul className="pl-6 space-y-2 mb-4 list-disc" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li>Editing text (fixing typos, updating dates, changing names)</li>
            <li>Compressing file size by removing redundant data</li>
            <li>Merging multiple PDFs into one</li>
            <li>Splitting a PDF into separate pages</li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            OCR (converting scanned images to editable text) still typically requires server-side
            processing because the models are too large to run in a browser efficiently. If you&apos;re
            working with scanned documents, that&apos;s the one case where a server-side tool is
            still necessary.
          </p>
        </section>

        <div className="rounded-xl p-6 mt-10" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
          <h3 className="font-semibold text-white mb-2">Try it now — no account required</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF processes everything in your browser. Drop in a PDF and start editing.
            Your file never leaves your computer.
          </p>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
          >
            Open PDF Editor →
          </Link>
        </div>
      </article>
    </main>
  )
}
