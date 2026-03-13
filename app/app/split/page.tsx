import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import SplitTool from './SplitTool'

export const metadata: Metadata = {
  title: 'Split PDF — Extract Pages or Split into Individual Files',
  description:
    'Split a PDF into individual pages or extract a page range. No upload, no account, no watermark. Processed entirely in your browser.',
}

export default function SplitPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar current="split" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Split PDF</h1>
          <p className="text-gray-600">
            Split into one file per page, or extract a page range. Processed entirely in your browser.
          </p>
        </div>

        <SplitTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-gray-500">Need to merge or compress instead?</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/merge" className="text-indigo-600 hover:text-indigo-800 font-medium underline">
              Merge PDFs →
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
