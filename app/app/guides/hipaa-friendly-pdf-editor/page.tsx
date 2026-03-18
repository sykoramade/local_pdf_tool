import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HIPAA-Friendly PDF Editor — Edit Medical Documents Without Uploading',
  description:
    'Edit medical PDFs — intake forms, consent forms, patient records — without uploading to any server. LocalPDF processes documents entirely in your browser, eliminating upload-related privacy risk.',
  alternates: { canonical: 'https://localpdf.tools/guides/hipaa-friendly-pdf-editor' },
}

export default function GuideHipaaFriendlyPdfEditor() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← PDF Editor
        </Link>
        <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
        <Link href="/compress" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          Compress PDF
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Guide</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          HIPAA-Friendly PDF Editor — Edit Medical Documents Without Uploading
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          Healthcare organisations routinely handle sensitive patient documents — intake forms, consent
          agreements, records amendments — using generic online PDF tools that upload every file to a
          remote server. This guide explains why that practice carries meaningful privacy risk and how
          client-side PDF editing eliminates it.
        </p>

        <div className="rounded-xl px-5 py-4 mb-10 text-sm" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', color: '#f59e0b' }}>
          <strong>Disclaimer:</strong> This tool is HIPAA-friendly by design but does not constitute
          legal HIPAA compliance advice. Whether your specific use satisfies HIPAA obligations depends
          on your organisation&apos;s policies, workflows, and covered-entity status. Consult your
          privacy officer before changing any clinical document workflow.
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Why cloud PDF tools create risk in healthcare settings
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            HIPAA&apos;s Privacy Rule and Security Rule govern how Protected Health Information (PHI) is
            handled, stored, and transmitted. When a staff member uploads a patient document to a
            web-based PDF tool, PHI leaves the covered entity&apos;s control and is transmitted to a
            third-party server — often one that has not been assessed as a Business Associate and has
            not signed a Business Associate Agreement (BAA).
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            The risk surfaces in several common scenarios:
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Front desk staff editing a patient intake form in a free online PDF editor — PHI is transmitted to the editor&apos;s servers without a BAA in place.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>A clinician annotating a referral letter using a cloud PDF tool — the document may be retained on the tool&apos;s servers for minutes or hours after the session ends.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Administrative staff merging insurance claim PDFs using an upload-based merger — claim data including names, dates of service, and diagnosis codes leaves the organisation&apos;s network.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Free-tier PDF tools may use uploaded document content for service improvement, analytics, or AI training — use cases that are plainly incompatible with HIPAA requirements for PHI.</span>
            </li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            These are not edge cases. They represent the default behaviour of the most widely used
            online PDF tools. For a covered entity, each of these constitutes a potential disclosure
            of PHI to an entity without a valid BAA — which is itself a reportable event under the
            Breach Notification Rule.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            How client-side processing changes the picture
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF processes every PDF operation — editing, merging, splitting, compressing —
            entirely inside the user&apos;s browser. The document bytes are loaded into browser memory,
            manipulated using JavaScript (pdf-lib), and written back to a file the user downloads.
            Nothing is transmitted to any server at any point in this workflow.
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>No PHI leaves the device. The document never reaches LocalPDF&apos;s infrastructure — there is nothing to intercept, breach, or retain.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>No BAA is required with LocalPDF for document content because LocalPDF never receives or processes PHI on behalf of the covered entity.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>There is no server-side retention window. The document exists only in browser memory while the tab is open.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Document content cannot be used for third-party analytics or model training — it never reaches any third party.</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Use cases where this matters most
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Patient intake forms</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Practices that send and receive intake forms as PDFs often need to fill in or adjust
                fields before printing or filing. Doing this with a local browser-based tool means
                the form content — name, date of birth, insurance ID, medical history — never
                leaves the practice&apos;s device.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Consent forms and authorisations</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Consent documents often carry sensitive information about planned procedures,
                diagnosis codes, or mental health status. Editing or annotating these locally
                avoids any upstream transmission of that content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Records and correspondence</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Clinicians amending patient letters, referrals, or discharge summaries can use
                LocalPDF&apos;s text editor to make corrections without sending the document off-device.
                The corrected file downloads directly to the user&apos;s machine.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Combining and splitting clinical documents</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Merging multiple referral pages into one PDF, or splitting a large records document
                to extract a single patient&apos;s pages — both operations run in the browser with no
                upload required.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            What LocalPDF stores and does not store
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            When you create a free LocalPDF account (optional), we store only your email address.
            We use Supabase for authentication and Stripe for billing. Neither service receives
            document content. Document bytes exist exclusively in your browser&apos;s memory while the
            tool is in use and are discarded when you close the tab.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            This architecture is verifiable: the LocalPDF source code is straightforward to audit,
            and network inspection in any browser dev tools will confirm that no document content
            is sent during normal operation.
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              Open PDF Editor →
            </Link>
          </div>
          <div className="rounded-xl p-6" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
            <h3 className="font-semibold text-white mb-2">Merge or split PDFs</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
              Combine multiple files or extract individual pages. No upload, no account required.
            </p>
            <Link
              href="/merge"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              Merge PDFs free →
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
