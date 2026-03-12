import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Compress PDF Free — Reduce File Size Without Uploading',
  description:
    'Reduce your PDF file size in the browser for free. No upload, no account, no watermark. Removes redundant structure to shrink files by 10–40%.',
  alternates: { canonical: 'https://localpdf.tools/guides/compress-pdf-free' },
}

export default function GuideCompressPdfFree() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/compress" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Compress PDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Guide</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How to Compress a PDF for Free (Without Uploading It)
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Most &ldquo;free&rdquo; PDF compressors send your file to a server, shrink it, and let you download the result.
          If your PDF contains anything sensitive, that&apos;s a problem. Here&apos;s how to reduce PDF
          file size entirely in your browser.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How PDF compression works</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            PDF files can contain redundant data — old versions of objects, unused cross-references,
            and uncompressed streams. When a PDF is edited repeatedly or exported from certain tools,
            this bloat accumulates without affecting how the document looks.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Structural compression removes this overhead by rewriting the PDF with object streams
            enabled — packing multiple objects together and compressing them. This is what LocalPDF does,
            and it typically reduces file size by 10–40% on unoptimised documents.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What this tool does and doesn&apos;t compress</h2>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Redundant PDF structure and cross-references', yes: true },
              { label: 'Uncompressed object streams', yes: true },
              { label: 'Works on any PDF — no size limit', yes: true },
              { label: 'Embedded images (JPEG, PNG inside the PDF)', yes: false },
              { label: 'Fonts embedded in the file', yes: false },
            ].map(({ label, yes }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className={yes ? 'text-green-600' : 'text-gray-400'}>{yes ? '✓' : '○'}</span>
                <span className={yes ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            If your PDF is large primarily because of high-resolution photos or scanned pages,
            structural compression will have limited effect. Image recompression requires server-side
            tooling and is on the roadmap.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">When to compress vs. when not to</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 mb-2">Good candidates</p>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>PDFs exported from Word / Google Docs</li>
                <li>PDFs edited multiple times</li>
                <li>Reports with mostly text and simple graphics</li>
                <li>Forms and contracts</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Limited benefit</p>
              <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                <li>PDFs that are mostly scanned images</li>
                <li>Already-optimised PDFs</li>
                <li>PDFs with many high-res photos</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why no upload is a real privacy advantage</h2>
          <p className="text-gray-600 leading-relaxed">
            When you upload a PDF to an online compressor, you&apos;re trusting that service with the
            document contents, metadata, and any personal information inside. Even services with good
            intentions retain files temporarily — and &ldquo;temporarily&rdquo; is hard to verify.
            LocalPDF&apos;s compression runs in WebAssembly inside your browser tab.
            Nothing is transmitted to any server.
          </p>
        </section>

        <div className="bg-indigo-50 rounded-xl p-6 mt-10">
          <h3 className="font-semibold text-gray-800 mb-2">Compress your PDF now</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drop in your PDF. See the size reduction. Download. No upload, no account.
          </p>
          <Link
            href="/compress"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
          >
            Open PDF Compressor →
          </Link>
        </div>
      </article>
    </main>
  )
}
