import type { Metadata } from 'next'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomepageHub from './components/HomepageHub'

export const metadata: Metadata = {
  title: 'Free PDF Editor — Edit, Sign, Compress & Annotate Without Uploading',
  description:
    'Edit text, sign, compress, merge, split, and annotate PDFs in your browser. No upload, no account, no paywall at download. Your files stay on your computer.',
  keywords: [
    'pdf editor', 'edit pdf text', 'pdf editor no upload',
    'pdf editor privacy', 'free pdf editor', 'edit pdf online free',
    'sign pdf free', 'compress pdf', 'annotate pdf',
  ],
  alternates: {
    canonical: 'https://localpdf.tools',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar />
      <HomepageHub />
      <Footer />
    </main>
  )
}
