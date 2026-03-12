import type { Metadata } from 'next'
import Link from 'next/link'
import MergeTool from './MergeTool'

export const metadata: Metadata = {
  title: 'Free PDF Merger — Combine PDF Files Without Uploading',
  description:
    'Merge multiple PDF files into one in your browser. No upload, no account, no watermark. Drag to reorder pages, then download the combined PDF.',
}

export default function MergePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
          LocalPDF
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-800">PDF Editor</Link>
          <Link href="/compress" className="text-gray-500 hover:text-gray-800">Compress</Link>
          <Link href="/merge" className="text-indigo-600 font-medium">Merge</Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-800">About</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Merge PDFs</h1>
          <p className="text-gray-600">
            Combine multiple PDF files into one. Set the order, then download. Processed entirely in your browser.
          </p>
        </div>

        <MergeTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-gray-500">Need to edit text or compress first?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
              PDF Editor →
            </Link>
            <Link href="/compress" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
              Compress PDF →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
