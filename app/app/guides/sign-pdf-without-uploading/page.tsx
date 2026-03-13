import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Sign a PDF Without Uploading It',
  description:
    'Sign a PDF privately using only your browser. No upload, no cloud storage, no account. Step-by-step guide to offline browser-based PDF signing.',
  alternates: { canonical: 'https://localpdf.tools/guides/sign-pdf-without-uploading' },
}

export default function GuideSignPdfWithoutUploading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/sign" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Sign PDF free
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Guide</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How to Sign a PDF Without Uploading It
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Most PDF signing services upload your document to a server before you can sign it.
          If that document contains a contract, a tax form, a medical record, or anything personal,
          that upload is a real privacy risk. This guide explains how to sign a PDF entirely
          in your browser — offline, private, and free.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Why upload-based signing tools are a privacy risk
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Services like DocuSign, SmallPDF, Adobe Sign, and dozens of lesser-known tools all
            follow the same model: you upload your PDF, it travels to their servers, gets processed
            remotely, and is returned to you — signed. While that may be fine for some documents,
            many people sign PDFs containing sensitive data they should never voluntarily share with
            a third-party server.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Consider what ends up in PDFs that need signatures: employment contracts with salary
            details, tenancy agreements with your home address, non-disclosure agreements, medical
            consent forms, school enrolment documents. When you upload these to a cloud PDF tool,
            you are handing a copy to a company whose data retention policies, security practices,
            and jurisdiction may be entirely unclear to you.
          </p>
          <p className="text-gray-600 leading-relaxed">
            The smarter approach is to sign the PDF without sending it anywhere at all. Modern
            browsers are capable enough to handle this entirely on-device, and LocalPDF is built
            around exactly that principle.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How browser-based PDF signing works
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            When you open a PDF in LocalPDF, the file is loaded into your browser&apos;s memory using
            a JavaScript library called <strong>pdf-lib</strong>. All rendering, signature drawing,
            and PDF generation happens inside the browser sandbox — no network request is made
            to any server with your file data. The signed PDF is written back out of browser memory
            and downloaded directly to your device.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your signature is drawn on an HTML canvas element using touch or mouse input, then
            embedded as an image into the PDF at the position you choose. The whole process is
            identical to using a desktop app — except it runs in your browser tab, which means
            no installation, no account, and no upload.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This approach works on any device — desktop, tablet, or phone. On a touchscreen,
            you draw your signature with your finger just as you would on paper.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Step-by-step: how to sign a PDF on LocalPDF
          </h2>
          <ol className="space-y-4 text-gray-600">
            {[
              {
                step: 'Open the Sign tool',
                detail: 'Go to localpdf.tools/sign. No account or sign-in is needed to get started.',
              },
              {
                step: 'Drop in your PDF',
                detail: 'Drag your PDF onto the drop zone, or tap "Open PDF" to browse your files. The PDF is loaded directly into your browser — nothing is uploaded.',
              },
              {
                step: 'Tap "Add Signature"',
                detail: 'Once the PDF is displayed, tap the "Add Signature" button (bottom-right on desktop, floating button on mobile). A signature drawing panel opens.',
              },
              {
                step: 'Draw your signature',
                detail: 'Use your finger (on mobile) or mouse (on desktop) to draw your signature on the canvas. Tap Clear to start over if needed.',
              },
              {
                step: 'Confirm and position',
                detail: 'Tap Confirm. Your signature appears on the PDF page. Drag it to the correct position — the signature line, bottom of the page, or wherever it belongs.',
              },
              {
                step: 'Place and save',
                detail: 'Tap the green checkmark to lock the signature in place. Then tap "Save signed PDF" to download the completed document.',
              },
            ].map(({ step, detail }, i) => (
              <li key={i} className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <strong className="text-gray-800">{step}.</strong>{' '}
                  <span>{detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            What you can do with the free version
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Draw a signature with mouse or touch', yes: true },
              { label: 'Place signature anywhere on the page', yes: true },
              { label: 'Add multiple signatures to a document', yes: true },
              { label: 'Works on mobile — sign with your finger', yes: true },
              { label: 'No watermark on the output PDF', yes: true },
              { label: 'Resize signature (available on Pro plan)', yes: false },
              { label: 'Upload a signature image (available on Pro plan)', yes: false },
            ].map(({ label, yes }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className={yes ? 'text-green-600' : 'text-gray-400'}>{yes ? '✓' : '○'}</span>
                <span className={yes ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently asked questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Is a browser-drawn signature legally binding?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                In most jurisdictions, an electronic signature is legally valid if both parties
                intend to sign and the document is not one requiring a witnessed wet signature
                (such as a will or certain property deeds). A drawn signature placed on a PDF
                meets this standard for the vast majority of everyday documents — contracts,
                NDAs, consent forms, letters of agreement, and similar. If you need an audited
                e-signature trail with timestamps and identity verification, consider a dedicated
                e-signature service for those specific documents. For everything else, a drawn
                signature is adequate and widely accepted.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Is it really free?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes. Anonymous users can place up to 3 signatures per day for free with no account.
                Signing in with a free account removes that daily limit entirely — there is no charge.
                A Pro plan adds extra features like signature resizing and image upload, but the core
                signing tool is free.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Does it work on mobile?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Yes. The signature drawing canvas supports touch input, so you can sign with your
                finger on any smartphone or tablet. The interface is designed mobile-first — the
                signature panel opens as a full-screen drawer on small screens, and all buttons
                meet accessibility tap-target minimums. It works in Safari on iOS and Chrome on
                Android.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Is my PDF stored anywhere?
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No. Your PDF is loaded into your browser&apos;s memory and never transmitted to any
                server. When you close the tab or navigate away, the file is gone. LocalPDF does
                not log filenames, contents, or any document data. This is the core architecture
                of the tool — privacy by design, not by policy.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-indigo-50 rounded-xl p-6 mt-10">
          <h3 className="font-semibold text-gray-800 mb-2">Sign your PDF now — no upload needed</h3>
          <p className="text-sm text-gray-600 mb-4">
            Open your PDF, draw your signature, download the result. Nothing leaves your device.
          </p>
          <Link
            href="/sign"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
          >
            Sign a PDF free →
          </Link>
        </div>
      </article>
    </main>
  )
}
