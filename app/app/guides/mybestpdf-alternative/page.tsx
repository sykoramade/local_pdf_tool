import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'mybestpdf Alternative — A Free PDF Editor That Actually Lets You Download',
  description:
    "Looking for a mybestpdf alternative? LocalPDF lets you edit PDF text and download for free — no paywall after you've done the work.",
}

export default function GuideMyBestPdfAlternative() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Try LocalPDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Comparison</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          mybestpdf Alternative: A PDF Editor That Doesn&apos;t Hold Your Work Hostage
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          If you&apos;ve landed here, you probably just spent 20 minutes editing a PDF only to hit a
          subscription wall at the download button. Here&apos;s a free alternative that doesn&apos;t do that.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">The pattern these tools use</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Many online PDF editors — mybestpdf and others in the same category — use the same conversion
            funnel: let you do all the work, then demand payment the moment you try to save your results.
            By then, you&apos;ve invested time and have a psychological sunk cost that pushes you toward paying.
          </p>
          <p className="text-gray-600 leading-relaxed">
            It&apos;s deliberate design. The editing experience is unlocked specifically to create that
            commitment before the paywall appears. You haven&apos;t failed to read the fine print — the fine
            print was hidden on purpose.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What LocalPDF does differently</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold text-gray-700">Feature</th>
                  <th className="text-left p-3 font-semibold text-gray-700">mybestpdf / clones</th>
                  <th className="text-left p-3 font-semibold text-indigo-700">LocalPDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ['Edit text', '✓ (then paywall)', '✓ Free'],
                  ['Download edited PDF', 'Requires subscription', '✓ Free'],
                  ['File upload to server', 'Yes', 'Never'],
                  ['Account required', 'Often', 'No'],
                  ['Watermark on free tier', 'Often', 'No'],
                  ['Font matching', 'Text box overlay', 'Font-matched'],
                ].map(([feature, them, us]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-700">{feature}</td>
                    <td className="p-3 text-red-600">{them}</td>
                    <td className="p-3 text-green-700 font-medium">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why LocalPDF can afford to be free</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Most of these tools have server costs — they&apos;re running your PDF through processing
            infrastructure that costs real money per document. That&apos;s partly why the paywall exists.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF runs entirely in your browser. There&apos;s no server processing your PDF. That means
            near-zero variable cost per user, which means we can offer the core tools free without a
            business model built on surprising people at the download button.
          </p>
          <p className="text-gray-600 leading-relaxed">
            When we introduce paid features, they&apos;ll be clearly labeled as paid before you start using
            them — not revealed after you&apos;ve done the work.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitations to be honest about</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF works best on standard document types — contracts, invoices, forms, letters. PDFs with
            heavily custom corporate fonts may show a slightly different typeface on edited text. We show
            a clear indicator when this happens.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Scanned PDFs (images of documents, not digital text) can be viewed but the text layer can&apos;t
            be edited until OCR is added — that&apos;s on the roadmap.
          </p>
        </section>

        <div className="bg-indigo-50 rounded-xl p-6 mt-10">
          <h3 className="font-semibold text-gray-800 mb-2">Ready to try it?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drop in your PDF. Edit the text. Download. No account, no paywall, no file upload.
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
