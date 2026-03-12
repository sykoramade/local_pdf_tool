'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PdfDropzone from './PdfDropzone'
import type { ExtractedTextItem, EditMap } from '@/lib/pdf/types'

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false })

type EditorState = 'idle' | 'viewing'

function getResponsiveScale(): number {
  if (typeof window === 'undefined') return 1.5
  const w = window.innerWidth
  if (w < 480) return 0.65
  if (w < 640) return 0.9
  if (w < 900) return 1.2
  return 1.5
}

export default function PdfEditor() {
  const [state, setState] = useState<EditorState>('idle')
  // Start at 1.5 (SSR-safe), update client-side after mount to avoid hydration mismatch
  const [viewerScale, setViewerScale] = useState(1.5)
  useEffect(() => { setViewerScale(getResponsiveScale()) }, [])
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [filename, setFilename] = useState('')
  const [editMap, setEditMap] = useState<EditMap>(new Map())
  const [saving, setSaving] = useState(false)
  const [editCount, setEditCount] = useState(0)
  const textItemsRef = useRef<ExtractedTextItem[]>([])

  const handleLoad = useCallback((bytes: Uint8Array, name: string) => {
    setPdfBytes(bytes)
    setFilename(name)
    setEditMap(new Map())
    setEditCount(0)
    textItemsRef.current = []
    setState('viewing')
  }, [])

  const handleReset = useCallback(() => {
    setPdfBytes(null)
    setFilename('')
    setEditMap(new Map())
    setEditCount(0)
    textItemsRef.current = []
    setState('idle')
  }, [])

  const handleEdit = useCallback((id: string, text: string) => {
    setEditMap(prev => {
      const item = textItemsRef.current.find(t => t.id === id)
      const original = item?.str ?? ''
      const next = new Map(prev)
      if (text === original) {
        next.delete(id) // revert — no longer an edit
      } else {
        next.set(id, text)
      }
      setEditCount(next.size)
      return next
    })
  }, [])

  const handleTextItems = useCallback((items: ExtractedTextItem[]) => {
    textItemsRef.current = items
  }, [])

  const handleDownload = useCallback(async () => {
    if (!pdfBytes) return
    setSaving(true)

    try {
      let outputBytes = pdfBytes

      if (editMap.size > 0) {
        const { applyEditsAndSave } = await import('@/lib/pdf/save')
        outputBytes = await applyEditsAndSave(pdfBytes, textItemsRef.current, editMap)
      }

      const blob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace(/\.pdf$/i, '-edited.pdf')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Save failed: ${(err as Error).message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }, [pdfBytes, editMap, filename])

  if (state === 'idle') {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Edit PDF text without the paywall trap
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Fix a typo. Update a date. Change a name.
            Your file never leaves your browser.
          </p>
          <p className="text-sm text-gray-400">
            No account. No upload. No &ldquo;pay to download&rdquo; surprises.
          </p>
        </div>

        <PdfDropzone onLoad={handleLoad} />

        <div className="max-w-2xl w-full mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          {['100% in-browser', 'Files never uploaded', 'No account required', 'Free to download'].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span> {item}
            </span>
          ))}
        </div>

        <div className="max-w-2xl w-full mt-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '1', title: 'Open your PDF', desc: 'Drop in any PDF. It loads instantly in your browser.' },
              { step: '2', title: 'Click and edit', desc: 'Click any text to edit it. Fonts are matched automatically.' },
              { step: '3', title: 'Download', desc: 'Hit download. Your edited PDF is ready. Zero uploads.' },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <p className="font-medium text-gray-800 mb-1">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors shrink-0"
          >
            ← Back
          </button>
          <span className="text-sm text-gray-600 font-medium truncate">{filename}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {editCount > 0 && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {editCount} edit{editCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-gray-400 hidden sm:block">
            Click any text to edit
          </span>
          <button
            onClick={handleDownload}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : '⬇ Download'}
          </button>
        </div>
      </header>

      {/* PDF Viewer with editable text layer */}
      <div className="flex-1 overflow-y-auto">
        {pdfBytes && (
          <PdfViewer
            pdfBytes={pdfBytes}
            scale={viewerScale}
            editMap={editMap}
            onEdit={handleEdit}
            onTextItems={handleTextItems}
          />
        )}
      </div>
    </div>
  )
}
