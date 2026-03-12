import type { Metadata } from 'next'
import PdfEditor from './components/PdfEditor'
import NavBar from './components/NavBar'

export const metadata: Metadata = {
  title: 'Free PDF Editor — Edit Text Without Uploading Your File',
  description:
    'Edit PDF text in your browser. No upload, no account, no paywall at download. Fix typos, update dates, change names. Your files stay on your computer.',
  keywords: [
    'pdf editor', 'edit pdf text', 'pdf editor no upload',
    'pdf editor privacy', 'free pdf editor', 'edit pdf online free',
  ],
  alternates: {
    canonical: 'https://localpdf.tools',
  },
}

export default function Home() {
  return (
    <>
      <NavBar current="editor" />
      <PdfEditor />
    </>
  )
}
