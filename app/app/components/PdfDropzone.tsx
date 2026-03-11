'use client'

import { useRef, useState } from 'react'

interface PdfDropzoneProps {
  onLoad: (bytes: Uint8Array, filename: string) => void
}

export default function PdfDropzone({ onLoad }: PdfDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setErr(null)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErr('Please select a PDF file.')
      return
    }
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    // Quick header check
    const header = new TextDecoder('ascii').decode(bytes.slice(0, 5))
    if (!header.startsWith('%PDF')) {
      setErr('That file doesn\'t appear to be a valid PDF.')
      return
    }
    onLoad(bytes, file.name)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      onClick={() => inputRef.current?.click()}
      className={`
        max-w-2xl w-full bg-white rounded-2xl border-2 border-dashed cursor-pointer
        p-12 text-center transition-colors
        ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
      <div className="text-5xl mb-4">📄</div>
      <p className="text-lg font-medium text-gray-700 mb-1">
        {dragging ? 'Drop it!' : 'Drop your PDF here'}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        or click to browse — contracts, invoices, forms, CVs
      </p>
      <button
        type="button"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        Open PDF
      </button>
      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}
    </div>
  )
}
