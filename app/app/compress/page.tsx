import type { Metadata } from 'next'
import NavBar from '@/app/components/NavBar'
import CompressTool from './CompressTool'

export const metadata: Metadata = {
  title: 'Free PDF Compressor — Reduce PDF Size Without Uploading',
  description:
    'Compress your PDF file in the browser. No upload, no account, no watermark. Reduces file size by removing redundant PDF structure.',
}

export default function CompressPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar current="compress" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Compress PDF</h1>
          <p className="text-gray-600">
            Reduce file size by removing redundant PDF structure. Processed entirely in your browser.
          </p>
        </div>

        <CompressTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
          {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-3">Need to edit text too?</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">
            Open the PDF text editor →
          </Link>
        </div>
      </div>
    </main>
  )
}
