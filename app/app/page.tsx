import type { Metadata } from 'next'
import Link from 'next/link'
import PdfEditor from './components/PdfEditor'

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
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900">LocalPDF</span>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-indigo-600 font-medium">PDF Editor</Link>
          <Link href="/compress" className="text-gray-500 hover:text-gray-800">Compress</Link>
          <Link href="/merge" className="text-gray-500 hover:text-gray-800">Merge</Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-800">About</Link>
        </div>
      </nav>
      <PdfEditor />
    </>
  )
}
