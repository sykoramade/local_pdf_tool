import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Edit PDF Text for Free — Without Losing the Original Fonts',
  description:
    'A practical guide to editing text in a PDF without destroying the formatting. Covers font matching, common pitfalls, and which tools actually work for free.',
}

export default function GuideEditPdfFree() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Try LocalPDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Guide</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How to Edit PDF Text for Free Without Losing the Original Fonts
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Most free PDF editors solve text editing by pasting an obvious box over your document.
          Here&apos;s how font-matching works and why it matters.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why PDF text editing is harder than it looks</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Unlike a Word document, a PDF doesn&apos;t store &quot;paragraphs&quot; you can click and edit.
            A PDF is closer to a printed page — it stores instructions for where to draw each character,
            in what font, at what size and position. There is no concept of a cursor, a line, or a paragraph.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Editing text means finding those drawing instructions for a specific word, removing them, and
            replacing them with new instructions for your edited text — ideally using the same font so the
            result looks seamless.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">The two approaches: overlay vs. replace</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Overlay approach (bad):</strong> Draw a white rectangle over the original text, then
            draw new text in a generic font like Arial on top. Fast to implement, looks terrible. The font
            won&apos;t match, the size may be off, and the white box is visible if the page has a non-white
            background.
          </p>
          <p className="text-gray-600 leading-relaxed">
            <strong>Font-matching approach (good):</strong> Read the font name from the PDF&apos;s metadata,
            look it up against known fonts, embed the closest match, and draw the replacement text in that
            font at the exact same position and size. The result blends into the surrounding text.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What fonts are typically used in PDFs</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            The vast majority of everyday PDFs use a small set of standard fonts:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li><strong>Helvetica / Arial</strong> — the default for most modern documents</li>
            <li><strong>Times New Roman</strong> — contracts, legal documents, academic papers</li>
            <li><strong>Courier</strong> — code listings, some government forms</li>
            <li><strong>Calibri, Georgia, Verdana</strong> — common in Microsoft Word exports</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            If your document uses one of these, a font-matching editor will produce seamless results.
            Custom corporate typefaces (where a company has a proprietary brand font embedded in their
            PDFs) are the outlier case — you&apos;ll get a close match, not an exact one.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Step-by-step: editing a PDF for free with LocalPDF</h2>
          <ol className="list-decimal pl-6 text-gray-600 space-y-3">
            <li>Go to <Link href="/" className="text-indigo-600 hover:underline">localpdf.tools</Link> and drop in your PDF</li>
            <li>The document loads in your browser — no upload, your file stays on your computer</li>
            <li>Click on any text in the document. An edit field appears with the matched font</li>
            <li>Type your changes and press Enter or click elsewhere to confirm</li>
            <li>Edited sections are highlighted so you can see what&apos;s changed</li>
            <li>Click Download — the modified PDF is saved to your computer</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Common use cases that work well</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Fixing a typo in a signed contract before sending</li>
            <li>Updating an expiry date on an invoice</li>
            <li>Changing your name or address on a form</li>
            <li>Correcting a mistake in a CV or cover letter</li>
            <li>Updating a price in a quote or proposal</li>
          </ul>
        </section>

        <div className="bg-indigo-50 rounded-xl p-6 mt-10">
          <h3 className="font-semibold text-gray-800 mb-2">Try it on your PDF</h3>
          <p className="text-sm text-gray-600 mb-4">
            No account. No upload. No paywall. Open your PDF and start editing.
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
