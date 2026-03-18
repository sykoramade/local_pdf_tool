import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'mybestpdf Alternative — A Free PDF Editor That Actually Lets You Download',
  description:
    "Looking for a mybestpdf alternative? LocalPDF lets you edit PDF text and download for free — no paywall after you've done the work.",
}

export default function GuideMyBestPdfAlternative() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← Try LocalPDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Comparison</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          mybestpdf Alternative: A PDF Editor That Doesn&apos;t Hold Your Work Hostage
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          If you&apos;ve landed here, you probably just spent 20 minutes editing a PDF only to hit a
          subscription wall at the download button. Here&apos;s a free alternative that doesn&apos;t do that.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">The pattern these tools use</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Many online PDF editors — mybestpdf and others in the same category — use the same conversion
            funnel: let you do all the work, then demand payment the moment you try to save your results.
            By then, you&apos;ve invested time and have a psychological sunk cost that pushes you toward paying.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            It&apos;s deliberate design. The editing experience is unlocked specifically to create that
            commitment before the paywall appears. You haven&apos;t failed to read the fine print — the fine
            print was hidden on purpose.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">What LocalPDF does differently</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.06)' }}>
                  <th className="text-left p-3 font-semibold text-white">Feature</th>
                  <th className="text-left p-3 font-semibold text-white">mybestpdf / clones</th>
                  <th className="text-left p-3 font-semibold" style={{ color: '#a5b4fc' }}>LocalPDF</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Edit text', '✓ (then paywall)', '✓ Free'],
                  ['Download edited PDF', 'Requires subscription', '✓ Free'],
                  ['File upload to server', 'Yes', 'Never'],
                  ['Account required', 'Often', 'No'],
                  ['Watermark on free tier', 'Often', 'No'],
                  ['Font matching', 'Text box overlay', 'Font-matched'],
                ].map(([feature, them, us], i) => (
                  <tr key={feature} className="hover:bg-white/5" style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,.06)' } : undefined}>
                    <td className="p-3" style={{ color: 'rgba(255,255,255,.7)' }}>{feature}</td>
                    <td className="p-3 text-red-400">{them}</td>
                    <td className="p-3 text-green-400 font-medium">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Why LocalPDF can afford to be free</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Most of these tools have server costs — they&apos;re running your PDF through processing
            infrastructure that costs real money per document. That&apos;s partly why the paywall exists.
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF runs entirely in your browser. There&apos;s no server processing your PDF. That means
            near-zero variable cost per user, which means we can offer the core tools free without a
            business model built on surprising people at the download button.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            When we introduce paid features, they&apos;ll be clearly labeled as paid before you start using
            them — not revealed after you&apos;ve done the work.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Limitations to be honest about</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF works best on standard document types — contracts, invoices, forms, letters. PDFs with
            heavily custom corporate fonts may show a slightly different typeface on edited text. We show
            a clear indicator when this happens.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Scanned PDFs (images of documents, not digital text) can be viewed but the text layer can&apos;t
            be edited until OCR is added — that&apos;s on the roadmap.
          </p>
        </section>

        <div className="rounded-xl p-6 mt-10" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
          <h3 className="font-semibold text-white mb-2">Ready to try it?</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
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
