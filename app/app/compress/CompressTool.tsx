'use client'

import { useState, useRef } from 'react'
import { formatBytes } from '@/lib/pdf/compress'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'

type State = 'idle' | 'compressing' | 'done' | 'error'

export default function CompressTool() {
  const { user } = useUser()
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [dragging, setDragging] = useState(false)
  const [filename, setFilename] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [saving, setSaving] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const outputRef = useRef<Uint8Array | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a PDF file.')
      setState('error')
      return
    }

    setFilename(file.name)
    setState('compressing')
    setErrorMsg('')

    try {
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf)

      const { compressPdf } = await import('@/lib/pdf/compress')
      const result = await compressPdf(bytes)

      outputRef.current = result.output
      setOriginalSize(result.originalBytes)
      setCompressedSize(result.compressedBytes)
      setSaving(result.savingPercent)
      setState('done')
    } catch (err) {
      setErrorMsg((err as Error).message ?? 'Compression failed')
      setState('error')
    }
  }

  function handleDownload() {
    if (!user && !canUse()) {
      setShowAuthGate(true)
      return
    }
    const output = outputRef.current
    if (!output) return
    const blob = new Blob([output.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.replace(/\.pdf$/i, '-compressed.pdf')
    a.click()
    URL.revokeObjectURL(url)
    if (!user) incrementUses()
  }

  function reset() {
    setState('idle')
    outputRef.current = null
    setFilename('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="max-w-xl mx-auto">
      {state === 'idle' || state === 'error' ? (
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
            bg-white rounded-2xl border-2 border-dashed cursor-pointer p-12 text-center transition-colors
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
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-medium text-gray-700 mb-1">
            {dragging ? 'Drop it!' : 'Drop your PDF here'}
          </p>
          <p className="text-sm text-gray-400 mb-6">or click to browse</p>
          <button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Select PDF
          </button>
          {state === 'error' && (
            <p className="mt-4 text-sm text-red-500">{errorMsg}</p>
          )}
        </div>
      ) : state === 'compressing' ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">Compressing {filename}...</p>
          <p className="text-sm text-gray-400 mt-2">Processing in your browser</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{saving > 0 ? '✅' : 'ℹ️'}</div>
            <h3 className="text-lg font-semibold text-gray-800">
              {saving > 0 ? `Reduced by ${saving}%` : 'File already optimised'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{formatBytes(originalSize)}</div>
              <div className="text-xs text-gray-400 mt-1">Original</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{formatBytes(compressedSize)}</div>
              <div className="text-xs text-gray-400 mt-1">Compressed</div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mb-6">
            Compression removes redundant PDF structure. Embedded images are not recompressed.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              ⬇ Download
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              New file
            </button>
          </div>
        </div>
      )}

      {showAuthGate && <AuthModal reason="gate" onClose={() => setShowAuthGate(false)} />}
    </div>
  )
}
