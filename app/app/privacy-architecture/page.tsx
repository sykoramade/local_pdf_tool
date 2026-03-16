import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'

export const metadata: Metadata = {
  title: 'Privacy Architecture — How LocalPDF Processes Files Client-Side',
  description:
    'Technical explanation of how LocalPDF processes PDF files entirely in your browser using WebAssembly. No server, no upload, verifiable.',
  alternates: { canonical: 'https://localpdf.tools/privacy-architecture' },
}

export default function PrivacyArchitecture() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar current={undefined} />

      <article className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How your files stay private</h1>
        <p className="text-lg text-gray-600 mb-12">
          Every PDF operation in this tool runs in your browser. No file is transmitted to a server.
          Here is exactly how.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">The architecture</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF uses pdf-lib and PDF.js — both of which run as WebAssembly inside your browser tab.
            When you open a document, your browser reads it directly from local disk via the File API.
            The PDF is loaded into browser memory. All processing — text editing, compression, merging,
            splitting, signing — happens inside that memory space.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            When you click Download, the result is written back to your machine via a Blob URL. A Blob URL
            is a browser-internal memory address (it begins with <code className="text-sm bg-gray-100 px-1 rounded">blob:</code>).
            It is not a network address. No outbound request is made.
          </p>
          <p className="text-gray-600 leading-relaxed">
            You can confirm this by opening your browser&apos;s Network panel (F12 → Network → filter by
            Fetch/XHR) and processing a document. The panel will show 0 requests that contain your file data.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What does leave your browser</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Being precise about this matters. Here is what is transmitted:
          </p>
          <ul className="text-gray-600 leading-relaxed space-y-3 mb-4 list-none">
            <li className="pl-4 border-l-2 border-gray-200">
              Standard page resources (JavaScript, CSS, fonts) are loaded from our CDN when you first
              visit — this is identical to any website.
            </li>
            <li className="pl-4 border-l-2 border-gray-200">
              If you sign in, your email address is stored in Supabase (EU region) for authentication
              only. No file content is ever associated with your account.
            </li>
            <li className="pl-4 border-l-2 border-gray-200">
              Anonymous analytics (page views only, no file names or content) may be added in future
              with your consent.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            If you use the tool without signing in, no personal data leaves your browser.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            GDPR Article 25 — Data Protection by Design
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF is designed in compliance with GDPR Article 25 (Data Protection by Design and by
            Default). The technical architecture ensures that personal data — including the contents of
            documents — is processed exclusively on the user&apos;s device. No document content is
            transmitted, stored, or accessible to LocalPDF servers at any point.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This design means LocalPDF does not require a Data Processing Agreement (DPA) for document
            processing. Users in regulated industries (healthcare, legal, finance) can use LocalPDF for
            document editing without triggering data transfer obligations under GDPR, HIPAA, or equivalent
            frameworks — because no data transfer occurs.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Verify it yourself</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            These steps work in Chrome and Firefox:
          </p>
          <ol className="text-gray-600 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>Open Chrome or Firefox.</li>
            <li>Press F12 to open DevTools.</li>
            <li>Click the Network tab.</li>
            <li>
              Select the <strong className="font-medium text-gray-700">Fetch/XHR</strong> filter (Chrome)
              or <strong className="font-medium text-gray-700">XHR</strong> filter (Firefox).
            </li>
            <li>Open a PDF in LocalPDF and perform an edit.</li>
            <li>Observe: 0 requests appear in the panel during document processing.</li>
            <li>Click Download.</li>
            <li>
              The download triggers a local Blob URL (
              <code className="text-sm bg-gray-100 px-1 rounded">blob://</code>) — not a network request.
            </li>
          </ol>
          <p className="text-gray-600 leading-relaxed">
            The Blob URL in step 8 is a browser-internal memory address, not a network transfer. Your
            file is written directly from browser memory to your download folder.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Try the PDF Editor →
          </Link>
        </div>
      </article>
    </main>
  )
}
