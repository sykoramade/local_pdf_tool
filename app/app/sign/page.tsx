import type { Metadata } from 'next'
import NavBar from '@/app/components/NavBar'
import SignTool from './SignTool'

export const metadata: Metadata = {
  title: 'Sign PDF Without Uploading — Free, Private, In-Browser',
  description:
    'Add your signature to any PDF entirely in your browser. No upload, no account required, no watermark. Your document never leaves your device.',
  alternates: { canonical: 'https://localpdf.tools/sign' },
}

export default function SignPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar current="sign" />

      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center pt-16 mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Sign PDF</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Draw your signature and place it on any PDF page. Processed entirely in your browser — your document is never uploaded.
          </p>
        </div>

        <SignTool />

        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-500">
          {['Files never uploaded', 'No account required', 'No watermark', 'Works on mobile'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> {item}
            </span>
          ))}
        </div>

        <div className="mt-12 pb-16 text-center">
          <p className="text-sm text-gray-500 mb-3">Need to edit or compress too?</p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="/" className="text-indigo-600 hover:text-indigo-800 font-medium underline">PDF Editor →</a>
            <a href="/compress" className="text-indigo-600 hover:text-indigo-800 font-medium underline">Compress PDF →</a>
          </div>
        </div>
      </div>
    </main>
  )
}
