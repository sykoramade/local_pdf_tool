import type { Metadata } from 'next'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'Why Your PDF Editor Shouldn\'t Need a Server — LocalPDF',
  description:
    'Every time you upload a PDF to an online editor, you\'re trusting a stranger with your documents. Here\'s why that\'s a problem — and how browser-based processing fixes it.',
  alternates: {
    canonical:
      'https://localpdf.tools/blog/why-your-pdf-editor-shouldnt-need-a-server',
  },
  openGraph: {
    title: 'Why Your PDF Editor Shouldn\'t Need a Server',
    description:
      'Every upload is a trust decision. Most PDF tools ask for that trust silently.',
    type: 'article',
    publishedTime: '2026-03-23T00:00:00Z',
  },
}

export default function Article() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="blog" />

      <article
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '80px 24px 120px',
          fontFamily: 'var(--font-sans)',
          color: 'rgba(255,255,255,.8)',
          lineHeight: 1.75,
          fontSize: 16,
        }}
      >
        {/* Byline */}
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.28)',
            marginBottom: 18,
          }}
        >
          LocalPDF Blog &mdash; March 2026
        </p>

        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#f4f6fc',
            margin: '0 0 32px',
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
          }}
        >
          Why Your PDF Editor Shouldn&apos;t Need a Server
        </h1>

        <p>
          Every time you drag a PDF into an online editor, you make a trust
          decision. Usually without realising it. The file travels across the
          internet, lands on a server you don&apos;t control, gets processed by
          software you can&apos;t inspect, and eventually gets deleted — maybe.
        </p>

        <p>
          For most documents that&apos;s fine. But PDFs are rarely casual. They&apos;re
          contracts, medical records, pay stubs, visa applications, tax returns.
          The files people need to edit are often the files they most need to
          keep private.
        </p>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#f4f6fc',
            margin: '40px 0 14px',
            letterSpacing: '-0.01em',
          }}
        >
          What actually happens when you upload
        </h2>

        <p>
          When you upload to a typical online PDF tool, your file is transmitted
          over HTTPS (good), received by their servers (necessary for their
          model), processed by backend code (fine), and stored temporarily on
          disk or object storage. That last part is where things get complicated.
        </p>

        <p>
          &ldquo;Temporary&rdquo; is doing a lot of work in that sentence. Retention
          policies vary. Some tools keep files for hours, some for days, some
          indefinitely in archives you never see. Even tools with honest
          intentions have backups, logs, and disaster-recovery copies that outlive
          the stated policy. And their employees — or anyone who compromises their
          systems — can see what you uploaded.
        </p>

        <p>
          None of this is hypothetical. In 2023, a popular PDF tool leaked user
          files due to a misconfigured S3 bucket. In 2024, another was acquired
          by a company with a very different privacy stance. When a product is
          free and server-dependent, the business model question is always worth
          asking.
        </p>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#f4f6fc',
            margin: '40px 0 14px',
            letterSpacing: '-0.01em',
          }}
        >
          The browser is powerful enough now
        </h2>

        <p>
          For most of the web&apos;s history, complex document processing genuinely
          required a server. JavaScript was slow. Browsers couldn&apos;t read binary
          files efficiently. There was no way to render a PDF in the browser with
          enough fidelity to edit it accurately.
        </p>

        <p>
          That changed. WebAssembly made it possible to run near-native
          performance code in the browser. PDF.js — originally built by Mozilla —
          can now render PDFs with pixel-accurate fidelity. Libraries like pdf-lib
          can create and modify PDF documents entirely in-memory. The server is no
          longer a technical requirement. It&apos;s a business choice.
        </p>

        <p>
          LocalPDF is built on this stack. When you open a file in our editor, it
          is read by your browser and never sent anywhere. The processing — text
          extraction, font matching, reflow, signature placement — all happens
          locally. When you download, the file is generated in your browser and
          written directly to your disk. Our servers never see a byte of your
          document.
        </p>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#f4f6fc',
            margin: '40px 0 14px',
            letterSpacing: '-0.01em',
          }}
        >
          What we do use servers for
        </h2>

        <p>
          We&apos;re not server-free in every sense. We use servers to serve the
          application code — the JavaScript, styles, and WebAssembly blobs that
          your browser downloads and runs. We use Supabase for account
          information (email, subscription status). We use Stripe for billing.
          None of these systems ever receive your PDF.
        </p>

        <p>
          This architecture has a useful side-effect: it&apos;s verifiable. You can
          open your browser&apos;s Network tab before dropping a file and watch what
          requests go out. You&apos;ll see requests to fonts, to our static asset CDN,
          to Supabase for auth. You won&apos;t see your PDF bytes leaving your machine.
        </p>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#f4f6fc',
            margin: '40px 0 14px',
            letterSpacing: '-0.01em',
          }}
        >
          The honest trade-off
        </h2>

        <p>
          Client-side processing isn&apos;t free. It means we can&apos;t easily add
          features that require large AI models or complex server infrastructure.
          Very large PDFs (200+ pages) may be slower to process. Certain advanced
          operations — like OCR on scanned documents — are harder to do well in
          the browser today, though that&apos;s changing fast with WebGPU and
          on-device AI.
        </p>

        <p>
          We think those trade-offs are worth it. A PDF tool that keeps your
          documents on your device is a more honest product. It can&apos;t leak what
          it never received.
        </p>

        <p style={{ marginTop: 48, color: 'rgba(255,255,255,.35)', fontSize: 14 }}>
          &mdash; The LocalPDF Team
        </p>
      </article>

      <Footer />
    </main>
  )
}
