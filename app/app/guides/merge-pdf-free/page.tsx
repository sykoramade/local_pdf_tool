import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Merge PDF Files Free — No Upload, No Account',
  description:
    'Combine multiple PDF files into one without uploading them. Free, private, browser-based. No account required, no watermark, no file size limit.',
  alternates: { canonical: 'https://localpdf.tools/guides/merge-pdf-free' },
}

export default function GuideMergePdfFree() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4">
        <Link href="/merge" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← Merge PDFs free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Guide</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          How to Merge PDF Files Free (Without Uploading Them)
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          Most online PDF mergers upload your files to a server. If your PDFs contain contracts,
          financial statements, or personal information, that&apos;s a real privacy risk.
          Here&apos;s how to merge PDFs entirely in your browser — nothing leaves your device.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">How to merge PDFs on LocalPDF</h2>
          <ol className="space-y-3" style={{ color: 'rgba(255,255,255,.6)' }}>
            {[
              'Go to the Merge tool (link below).',
              'Drop your PDF files onto the upload zone, or click to browse. You can add as many as you need.',
              'The files appear in a list. Use the ↑ ↓ buttons to set the order you want them merged in.',
              'Remove any file from the list with the ✕ button.',
              'Click Merge — the combined PDF is created in your browser in seconds.',
              'Download your merged file. Nothing was uploaded anywhere.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full font-bold text-sm flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,.15)', color: '#a5b4fc' }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Why most PDF mergers upload your files</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            PDF merging historically required server software — libraries like Ghostscript, iTextSharp,
            or Acrobat. Running those in a browser wasn&apos;t possible until WebAssembly made it practical
            to run compiled native libraries directly in the browser sandbox.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF uses <strong className="text-white">pdf-lib</strong>, a pure JavaScript library that handles all PDF
            manipulation in-browser. Your files are loaded into browser memory, merged, and written
            back out — entirely on your device. The server never sees your documents.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">What the merge tool does and doesn&apos;t do</h2>
          <div className="space-y-2">
            {[
              { label: 'Merge unlimited PDFs into one', yes: true },
              { label: 'Set custom page order', yes: true },
              { label: 'Works on any size file', yes: true },
              { label: 'No watermark on output', yes: true },
              { label: 'Recompress or downscale images', yes: false },
              { label: 'Split individual pages (coming soon)', yes: false },
            ].map(({ label, yes }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className={yes ? 'text-green-400' : 'text-white/30'}>{yes ? '✓' : '○'}</span>
                <span style={{ color: yes ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.35)' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Common use cases</h2>
          <ul className="space-y-2 text-sm list-disc list-inside" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li>Combining a cover letter and CV into a single submission PDF</li>
            <li>Merging monthly bank statements into one annual document</li>
            <li>Joining scanned pages that came out as separate files</li>
            <li>Assembling a multi-document contract package</li>
            <li>Combining report chapters written separately</li>
          </ul>
        </section>

        <div className="rounded-xl p-6 mt-10" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
          <h3 className="font-semibold text-white mb-2">Merge your PDFs now</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Drop in your files. Set the order. Download the merged PDF. No upload, no account.
          </p>
          <Link
            href="/merge"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
          >
            Open PDF Merger →
          </Link>
        </div>
      </article>
    </main>
  )
}
