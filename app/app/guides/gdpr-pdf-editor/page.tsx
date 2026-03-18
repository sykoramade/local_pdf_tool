import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR-Friendly PDF Editor — No Upload, No Data Transfer',
  description:
    'Edit and sign PDFs without transferring data to any server. LocalPDF processes everything in your browser — a practical approach to GDPR data minimisation for PDF workflows.',
  alternates: { canonical: 'https://localpdf.tools/guides/gdpr-pdf-editor' },
}

export default function GuideGdprPdfEditor() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← PDF Editor
        </Link>
        <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
        <Link href="/sign" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          Sign PDF
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Guide</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          GDPR-Friendly PDF Editor — No Upload, No Data Transfer
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          Most online PDF editors upload your documents to remote servers. For organisations
          subject to GDPR, that creates a data transfer risk that is easy to overlook and
          difficult to justify. This guide explains how browser-based PDF editing eliminates
          that risk by keeping document data on the user&apos;s device at all times.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            GDPR and the data minimisation principle
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Article 5(1)(c) of the GDPR requires that personal data be &ldquo;adequate, relevant and
            limited to what is necessary in relation to the purposes for which they are processed&rdquo;
            — the data minimisation principle. In practical terms, this means organisations should
            avoid collecting or processing more personal data than the task actually requires.
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            When a staff member edits or signs a PDF using an upload-based online tool, they are
            transferring document content to a third-party data processor. Depending on the
            document, that content could include names, addresses, salary figures, medical
            information, or other personal data. Under GDPR, this constitutes a data processing
            activity that requires a lawful basis, a data processing agreement with the third
            party, and — if the server is outside the EEA — an appropriate transfer mechanism.
          </p>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Many organisations allow staff to use online PDF tools without any of this being in
            place. It is a common but genuine compliance gap.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Why upload-based PDF tools create GDPR risk
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            The risk is not hypothetical. Services like ilovepdf, smallpdf, and similar tools are
            popular precisely because they are convenient — but convenience comes with a cost.
            When you upload a document to any of these services, the following applies:
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>The document content is transmitted over the internet to a third-party server, potentially in a different jurisdiction.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>The provider&apos;s data retention policy determines how long a copy of your document is kept — often up to 60 minutes, sometimes longer.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>If the provider experiences a data breach, your documents may be included in the compromised data.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>You may not have a Data Processing Agreement in place with the provider, making the upload a non-compliant processing activity.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Free-tier tools may use document content to train AI models or for analytics, depending on their terms of service.</span>
            </li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            These are not worst-case scenarios — they are standard operating conditions for most
            cloud-based PDF tools. Organisations in regulated sectors (healthcare, legal, financial
            services, HR) should treat upload-based PDF tools as a data processing risk until
            appropriate agreements and reviews are in place.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            How local browser processing eliminates the risk
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF takes a fundamentally different approach: all PDF processing — editing,
            signing, compressing, merging — happens inside the user&apos;s browser using JavaScript
            libraries (pdf-lib and PDF.js). The document never leaves the device.
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            From a GDPR perspective, this means:
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>No personal data is transferred to a third-party processor when editing or signing a PDF.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>No Data Processing Agreement is required with LocalPDF for document content, because we never receive it.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>There is no server-side retention period to worry about — the document exists only in the user&apos;s browser memory while the tab is open.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Cross-border data transfer rules do not apply to the PDF content, because the content never crosses a border.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Staff can edit and sign PDFs without creating an undocumented data processing activity.</span>
            </li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            This architecture is privacy by design — not a policy statement, but a technical
            reality. There is nothing to leak because there is nothing on the server.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Use cases where this matters most
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>HR departments</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                HR teams regularly edit and sign documents containing sensitive personal data —
                employment contracts, salary letters, disciplinary documents, performance reviews.
                Using an upload-based tool to process these documents creates an undocumented
                transfer of employee personal data to a third-party system. Processing them
                locally in the browser avoids this entirely.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Legal and compliance teams</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Lawyers and compliance officers handle documents subject to legal professional
                privilege, confidentiality obligations, and regulatory requirements. Uploading
                a contract or NDA to a third-party server — even briefly — may breach those
                obligations. A browser-based tool that processes locally raises none of these
                concerns.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Healthcare</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Medical consent forms, patient records, referral letters, and other clinical
                documents contain special-category personal data under GDPR (Article 9).
                The legal basis for processing special-category data is strict. Uploading
                such documents to a generic PDF tool almost certainly lacks a valid basis.
                Processing them on-device sidesteps the issue entirely.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Finance and accounting</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Invoices, payslips, tax documents, and bank statements often contain personal
                financial data. Editing these in a browser-based tool with no upload is a
                straightforward way to keep document workflows within your existing data
                processing perimeter.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            What LocalPDF does and does not do
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            To be precise: LocalPDF processes PDF content entirely client-side. When you
            create a free account (optional), only your email address is stored — never
            document content. We use Supabase for authentication and Stripe for billing.
            Those services process only account data, not document data.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            We use &ldquo;GDPR-friendly&rdquo; deliberately rather than &ldquo;GDPR-compliant&rdquo;. We do not
            hold a formal certification and cannot assess your organisation&apos;s overall GDPR
            position. What we can say is that the architecture of this tool minimises
            third-party data exposure for document content to zero.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            For organisations that need to document their tooling decisions, the architecture
            described here is straightforward to explain to a Data Protection Officer: no
            document data is ever transmitted, retained, or stored by LocalPDF.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <div className="rounded-xl p-6" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
            <h3 className="font-semibold text-white mb-2">Edit PDFs without uploading</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
              Click text, edit it, download. No upload. Works entirely in your browser.
            </p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
            >
              Open PDF Editor →
            </Link>
          </div>
          <div className="rounded-xl p-6" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
            <h3 className="font-semibold text-white mb-2">Sign PDFs without uploading</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
              Draw your signature and place it on any page. No upload, no account required.
            </p>
            <Link
              href="/sign"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors inline-block text-sm"
            >
              Sign a PDF free →
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
