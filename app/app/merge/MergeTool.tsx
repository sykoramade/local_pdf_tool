'use client'

import { useState, useRef } from 'react'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'

interface PdfFile {
  id: string
  name: string
  bytes: Uint8Array
}

type Status = 'idle' | 'merging' | 'done' | 'error'

export default function MergeTool() {
  const { user } = useUser()
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [files, setFiles] = useState<PdfFile[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [dragging, setDragging] = useState(false)
  const outputRef = useRef<Uint8Array | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming)
    const pdfs = arr.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (pdfs.length === 0) return

    const loaded: PdfFile[] = await Promise.all(
      pdfs.map(async f => {
        const buf = await f.arrayBuffer()
        return { id: `${f.name}-${Date.now()}-${Math.random()}`, name: f.name, bytes: new Uint8Array(buf) }
      })
    )
    setFiles(prev => [...prev, ...loaded])
    setStatus('idle')
    outputRef.current = null
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
    outputRef.current = null
    if (status === 'done') setStatus('idle')
  }

  function moveUp(index: number) {
    if (index === 0) return
    setFiles(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
    outputRef.current = null
    if (status === 'done') setStatus('idle')
  }

  function moveDown(index: number) {
    setFiles(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
    outputRef.current = null
    if (status === 'done') setStatus('idle')
  }

  async function handleMerge() {
    if (files.length < 2) return

    if (!user && !canUse()) {
      setShowAuthGate(true)
      return
    }

    setStatus('merging')
    setErrorMsg('')

    try {
      const { mergePdfs } = await import('@/lib/pdf/merge')
      const result = await mergePdfs(files.map(f => f.bytes))
      outputRef.current = result.output
      setPageCount(result.pageCount)
      setStatus('done')
      if (!user) incrementUses()
    } catch (err) {
      setErrorMsg((err as Error).message ?? 'Merge failed')
      setStatus('error')
    }
  }

  function handleDownload() {
    const output = outputRef.current
    if (!output) return
    const blob = new Blob([output.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setFiles([])
    setStatus('idle')
    outputRef.current = null
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Drop zone — always visible so user can keep adding files */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`
          bg-white rounded-2xl border-2 border-dashed cursor-pointer p-8 text-center transition-colors mb-4
          ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files) }}
        />
        <div className="text-4xl mb-3">📎</div>
        <p className="text-base font-medium text-gray-700 mb-1">
          {files.length === 0
            ? (dragging ? 'Drop PDFs here!' : 'Drop PDFs here')
            : (dragging ? 'Drop to add more' : 'Drop more PDFs to add')}
        </p>
        <p className="text-sm text-gray-400">
          {files.length === 0 ? 'Select 2 or more PDF files' : `${files.length} file${files.length !== 1 ? 's' : ''} added — click or drop to add more`}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wide">
            Merge order
          </div>
          <ul className="divide-y divide-gray-100">
            {files.map((f, i) => (
              <li key={f.id} className="flex items-center gap-2 px-4 py-3">
                <span className="text-xs text-gray-400 w-5 text-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-700 truncate" title={f.name}>{f.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >↑</button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === files.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >↓</button>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors ml-1"
                    aria-label="Remove"
                  >✕</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status messages */}
      {status === 'error' && (
        <p className="text-sm text-red-500 text-center mb-4">{errorMsg}</p>
      )}

      {status === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
          <p className="text-sm font-medium text-green-800">
            Merged {files.length} files into {pageCount} page{pageCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {status === 'merging' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center mb-4">
          <p className="text-sm text-gray-500 animate-pulse">Merging in your browser…</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {status === 'done' ? (
          <>
            <button
              onClick={handleDownload}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              ⬇ Download merged.pdf
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              Start over
            </button>
          </>
        ) : (
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || status === 'merging'}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {status === 'merging' ? 'Merging…' : files.length < 2 ? 'Add at least 2 PDFs' : `Merge ${files.length} files`}
          </button>
        )}
      </div>

      {showAuthGate && <AuthModal reason="gate" onClose={() => setShowAuthGate(false)} />}
    </div>
  )
}
