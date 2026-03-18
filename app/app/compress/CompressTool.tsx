'use client'

import { useState, useRef, useEffect } from 'react'
import { formatBytes } from '@/lib/pdf/compress'
import { consumePendingFile } from '@/lib/pending-file'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'

type State = 'idle' | 'compressing' | 'done' | 'error'

export default function CompressTool() {
  const { user } = useUser()
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [filename, setFilename] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [saving, setSaving] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const outputRef = useRef<Uint8Array | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-process a file pre-selected on the homepage drop zone
  useEffect(() => {
    const f = consumePendingFile()
    if (f) handleFile(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const borderColor = dragging
    ? 'rgba(99,102,241,.7)'
    : hovered
    ? 'rgba(99,102,241,.4)'
    : 'rgba(255,255,255,.12)'

  const bgColor = dragging ? 'rgba(99,102,241,.07)' : 'rgba(255,255,255,.02)'

  return (
    <div className="max-w-xl mx-auto">
      {state === 'idle' || state === 'error' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            setHovered(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="rounded-2xl border-2 border-dashed cursor-pointer p-12 text-center transition-colors"
          style={{ background: bgColor, borderColor }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-medium mb-1 text-white">
            {dragging ? 'Drop it!' : 'Drop your PDF here'}
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,.35)' }}>or click to browse</p>
          <button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Select PDF
          </button>
          {state === 'error' && (
            <p className="mt-4 text-sm text-red-400">{errorMsg}</p>
          )}
        </div>
      ) : state === 'compressing' ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
        >
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p style={{ color: 'rgba(255,255,255,.7)' }}>Compressing {filename}...</p>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,.35)' }}>Processing in your browser</p>
        </div>
      ) : (
        <div
          className="rounded-2xl p-8"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{saving > 0 ? '✅' : 'ℹ️'}</div>
            <h3 className="text-lg font-semibold text-white">
              {saving > 0 ? `Reduced by ${saving}%` : 'File already optimised'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,.05)' }}>
              <div className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,.5)' }}>
                {formatBytes(originalSize)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.3)' }}>Original</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(34,211,160,.08)' }}>
              <div className="text-2xl font-bold" style={{ color: '#22d3a0' }}>
                {formatBytes(compressedSize)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.3)' }}>Compressed</div>
            </div>
          </div>

          <p className="text-xs text-center mb-6" style={{ color: 'rgba(255,255,255,.3)' }}>
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
              className="px-4 py-3 rounded-lg transition-colors text-sm"
              style={{ border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}
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
