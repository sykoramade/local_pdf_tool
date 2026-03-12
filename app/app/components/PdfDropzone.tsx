'use client'

import { useRef, useState } from 'react'

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

interface PdfDropzoneProps {
  onLoad: (bytes: Uint8Array, filename: string) => void
}

export default function PdfDropzone({ onLoad }: PdfDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [largeFile, setLargeFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function loadFile(file: File) {
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    const header = new TextDecoder('ascii').decode(bytes.slice(0, 5))
    if (!header.startsWith('%PDF')) {
      setErr('That file doesn\'t appear to be a valid PDF.')
      return
    }
    onLoad(bytes, file.name)
  }

  async function handleFile(file: File) {
    setErr(null)
    setLargeFile(null)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErr('Please select a PDF file.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLargeFile(file)
      return
    }
    await loadFile(file)
  }

  if (largeFile) {
    return (
      <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-yellow-300 p-10 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-base font-medium text-gray-800 mb-2">Large file detected</p>
        <p className="text-sm text-gray-500 mb-1">
          <strong>{largeFile.name}</strong> is {(largeFile.size / 1024 / 1024).toFixed(1)} MB.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Files over 20MB may be slow to process in your browser. Consider compressing it first.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => loadFile(largeFile)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Load anyway
          </button>
          <button
            onClick={() => { setLargeFile(null); if (inputRef.current) inputRef.current.value = '' }}
            className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Choose another file
          </button>
        </div>
      </div>
    )
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
