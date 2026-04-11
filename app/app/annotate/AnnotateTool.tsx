'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import PdfDropzone from '../components/PdfDropzone'
import AuthModal from '../components/AuthModal'
import type { Annotation, TextHighlight, StickyNote } from '@/lib/pdf/types'
import { canUse, incrementUses } from '@/lib/usage'
import { useUser } from '@/hooks/useUser'

// CSS highlight colours matching annotate.ts constants
const HIGHLIGHT_CSS = [
  'rgba(255,235,51,0.50)',   // yellow
  'rgba(74,222,128,0.50)',   // green
  'rgba(248,113,182,0.50)',  // pink
] as const

const HIGHLIGHT_LABELS = ['Yellow', 'Green', 'Pink'] as const

type ToolMode = 'highlight-0' | 'highlight-1' | 'highlight-2' | 'sticky'

interface PageTextItem {
  id: string
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
}

interface PageData {
  pageNum: number
  widthPx: number
  heightPx: number
  textItems: PageTextItem[]
}

const SCALE = 1.5
const STICKY_W_PCT = 15  // matches annotate.ts note width (% of page)
const STICKY_H_PCT = 9   // matches annotate.ts note height

export default function AnnotateTool() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [filename, setFilename] = useState('')
  const [pages, setPages] = useState<PageData[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeTool, setActiveTool] = useState<ToolMode | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAuthGate, setShowAuthGate] = useState(false)

  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docRef = useRef<any>(null)
  const { user } = useUser()

  // ── PDF loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pdfBytes) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setPages([])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjs = (await import('pdfjs-dist')) as any
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

      try {
        const doc = await pdfjs.getDocument({ data: pdfBytes!.slice(0) }).promise
        if (cancelled) return
        docRef.current = doc

        const pageArr: PageData[] = []

        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p)
          const viewport = page.getViewport({ scale: SCALE })
          const textContent = await page.getTextContent()

          const textItems: PageTextItem[] = textContent.items
            .filter((it: unknown) => typeof it === 'object' && it !== null && 'str' in it && (it as { str: string }).str.trim().length > 0)
            .map((it: unknown, idx: number) => {
              const raw = it as { str: string; transform: number[]; width: number }
              const tx: number[] = pdfjs.Util.transform(viewport.transform, raw.transform)
              const fontSizePx = Math.max(Math.abs(tx[3]), 4)
              const x = tx[4]
              const y = viewport.height - tx[5] - fontSizePx  // top edge of text in canvas coords
              const w = Math.max(raw.width * SCALE, 4)
              const h = fontSizePx

              return {
                id: `p${p}-${idx}`,
                xPct: (x / viewport.width) * 100,
                yPct: (y / viewport.height) * 100,
                widthPct: (w / viewport.width) * 100,
                heightPct: (h / viewport.height) * 100,
              }
            })

          pageArr.push({
            pageNum: p,
            widthPx: viewport.width,
            heightPx: viewport.height,
            textItems,
          })
        }

        if (!cancelled) {
          setPages(pageArr)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false)
          alert(`Could not load PDF: ${(err as Error).message ?? 'Unknown error'}`)
        }
      }
    }

    load()
    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
    }
  }, [pdfBytes])

  // Render canvases after page data is ready
  useEffect(() => {
    if (!docRef.current || pages.length === 0) return

    async function renderAll() {
      for (const { pageNum } of pages) {
        const canvas = canvasRefs.current.get(pageNum)
        if (!canvas) continue
        const page = await docRef.current!.getPage(pageNum)
        const vp = page.getViewport({ scale: SCALE })
        canvas.width = vp.width
        canvas.height = vp.height
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx as any, viewport: vp }).promise
      }
    }

    renderAll()
  }, [pages])

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleLoad = useCallback((bytes: Uint8Array, name: string) => {
    setPdfBytes(bytes)
    setFilename(name)
    setAnnotations([])
    setActiveTool(null)
    setEditingNoteId(null)
  }, [])

  const handleReset = useCallback(() => {
    setPdfBytes(null)
    setFilename('')
    setPages([])
    setAnnotations([])
    setActiveTool(null)
    setEditingNoteId(null)
    docRef.current?.destroy()
    docRef.current = null
  }, [])

  const handleTextClick = useCallback((pageNum: number, item: PageTextItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeTool || activeTool === 'sticky') return

    const colorIndex = parseInt(activeTool.split('-')[1])

    setAnnotations(prev => {
      const existingIdx = prev.findIndex(a => a.type === 'highlight' && a.id === `hl-${item.id}`)
      if (existingIdx >= 0) {
        // Toggle off
        return [...prev.slice(0, existingIdx), ...prev.slice(existingIdx + 1)]
      }
      const hl: TextHighlight = {
        type: 'highlight',
        id: `hl-${item.id}`,
        pageNum,
        colorIndex,
        xPct: item.xPct,
        yPct: item.yPct,
        widthPct: item.widthPct,
        heightPct: item.heightPct,
      }
      return [...prev, hl]
    })
  }, [activeTool])

  const handlePageClick = useCallback((pageNum: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'sticky') return
    if (editingNoteId) {
      // Confirm current note first
      setAnnotations(prev => prev.map(a =>
        a.id === editingNoteId && a.type === 'sticky-note' ? { ...a, text: noteText } : a
      ))
      setEditingNoteId(null)
      setNoteText('')
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    const id = `sticky-${Date.now()}`

    const note: StickyNote = { type: 'sticky-note', id, pageNum, text: '', xPct, yPct }
    setAnnotations(prev => [...prev, note])
    setEditingNoteId(id)
    setNoteText('')
  }, [activeTool, editingNoteId, noteText])

  const handleNoteConfirm = useCallback(() => {
    if (!editingNoteId) return
    setAnnotations(prev => prev.map(a =>
      a.id === editingNoteId && a.type === 'sticky-note' ? { ...a, text: noteText } : a
    ))
    setEditingNoteId(null)
    setNoteText('')
  }, [editingNoteId, noteText])

  const handleNoteDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAnnotations(prev => prev.filter(a => a.id !== id))
    if (editingNoteId === id) {
      setEditingNoteId(null)
      setNoteText('')
    }
  }, [editingNoteId])

  const handleDownload = useCallback(async () => {
    if (!pdfBytes) return
    if (!user && !canUse()) {
      setShowAuthGate(true)
      return
    }
    setSaving(true)
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    try {
      const { applyAnnotations } = await import('@/lib/pdf/annotate')
      const outputBytes = await applyAnnotations(pdfBytes, annotations)
      const blob = new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace(/\.pdf$/i, '-annotated.pdf')
      a.click()
      URL.revokeObjectURL(url)
      if (!user) incrementUses()
    } catch (err) {
      alert(`Save failed: ${(err as Error).message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }, [pdfBytes, annotations, filename, user])

  // ── Idle / dropzone state ──────────────────────────────────────────────────

  if (!pdfBytes) {
    return (
      <div
        className="rounded-2xl p-10 flex flex-col items-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(251,191,36,0.15)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#fbbf24" width={28} height={28}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>

        <h2
          className="text-2xl font-bold text-white mb-2 text-center"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Annotate your PDF
        </h2>
        <p className="text-sm mb-8 text-center" style={{ color: 'rgba(255,255,255,.5)' }}>
          Highlight text in three colours. Add sticky notes. Download with annotations baked in.
        </p>

        <PdfDropzone onLoad={handleLoad} />
      </div>
    )
  }

  // ── Viewing state ──────────────────────────────────────────────────────────

  const annotationCount = annotations.length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0d14' }}>

      {/* Toolbar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-2 px-4 py-3 flex-wrap"
        style={{ background: 'rgba(11,13,20,.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,.06)' }}
      >
        {/* Back */}
        <button
          onClick={handleReset}
          className="text-sm transition-colors mr-2"
          style={{ color: 'rgba(255,255,255,.45)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.85)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.45)')}
        >
          ← Back
        </button>

        <span className="text-sm font-medium text-white truncate max-w-[140px] mr-2">{filename}</span>

        <div className="h-5 w-px mx-1" style={{ background: 'rgba(255,255,255,.1)' }} />

        {/* Highlight tools */}
        {([0, 1, 2] as const).map(idx => (
          <button
            key={idx}
            onClick={() => setActiveTool(activeTool === `highlight-${idx}` ? null : `highlight-${idx}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTool === `highlight-${idx}` ? HIGHLIGHT_CSS[idx].replace('.50', '.25') : 'rgba(255,255,255,.06)',
              border: `1px solid ${activeTool === `highlight-${idx}` ? HIGHLIGHT_CSS[idx] : 'rgba(255,255,255,.08)'}`,
              color: activeTool === `highlight-${idx}` ? '#fff' : 'rgba(255,255,255,.6)',
            }}
          >
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: HIGHLIGHT_CSS[idx] }} />
            {HIGHLIGHT_LABELS[idx]}
          </button>
        ))}

        {/* Sticky note tool */}
        <button
          onClick={() => setActiveTool(activeTool === 'sticky' ? null : 'sticky')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeTool === 'sticky' ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.06)',
            border: `1px solid ${activeTool === 'sticky' ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.08)'}`,
            color: activeTool === 'sticky' ? '#fbbf24' : 'rgba(255,255,255,.6)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z" />
          </svg>
          Sticky note
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Annotation count badge */}
        {annotationCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,.15)', color: '#fbbf24' }}>
            {annotationCount} mark{annotationCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Tool hint */}
        {activeTool && (
          <span className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,.4)' }}>
            {activeTool === 'sticky' ? 'Click page to place note' : 'Click text to highlight'}
          </span>
        )}

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={saving}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{
            background: saving ? 'rgba(99,102,241,.4)' : '#6366f1',
            color: '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : '⬇ Download'}
        </button>
      </header>

      {showAuthGate && <AuthModal reason="gate" onClose={() => setShowAuthGate(false)} />}

      {/* PDF pages */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col items-center gap-6">
        {loading && (
          <>
            {[1, 2].map(i => (
              <div
                key={i}
                className="animate-pulse rounded-sm"
                style={{ width: 'min(816px, calc(100vw - 2rem))', aspectRatio: '1 / 1.414', background: 'rgba(255,255,255,.06)' }}
              />
            ))}
            <p className="text-sm" style={{ color: 'rgba(255,255,255,.35)' }}>Loading PDF…</p>
          </>
        )}

        {!loading && pages.map(pg => (
          <div key={pg.pageNum} style={{ maxWidth: pg.widthPx, width: '100%' }}>
            <div
              className="relative shadow-2xl"
              style={{ width: pg.widthPx, height: pg.heightPx }}
            >
              {/* Canvas */}
              <canvas
                ref={el => {
                  if (el) canvasRefs.current.set(pg.pageNum, el)
                  else canvasRefs.current.delete(pg.pageNum)
                }}
                width={pg.widthPx}
                height={pg.heightPx}
                className="block"
              />

              {/* Annotation + interaction overlay */}
              <div
                className="absolute inset-0"
                style={{ cursor: activeTool === 'sticky' ? 'crosshair' : 'default' }}
                onClick={e => handlePageClick(pg.pageNum, e)}
              >

                {/* Existing annotations for this page */}
                {annotations
                  .filter(a => a.pageNum === pg.pageNum)
                  .map(a => {
                    if (a.type === 'highlight') {
                      const hl = a as TextHighlight
                      return (
                        <div
                          key={hl.id}
                          style={{
                            position: 'absolute',
                            left: `${hl.xPct}%`,
                            top: `${hl.yPct}%`,
                            width: `${hl.widthPct}%`,
                            height: `${hl.heightPct}%`,
                            background: HIGHLIGHT_CSS[hl.colorIndex],
                            pointerEvents: 'none',
                            mixBlendMode: 'multiply',
                          }}
                        />
                      )
                    } else {
                      const note = a as StickyNote
                      const isEditing = editingNoteId === note.id
                      return (
                        <div
                          key={note.id}
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            left: `${note.xPct}%`,
                            top: `${note.yPct}%`,
                            width: `${STICKY_W_PCT}%`,
                            minHeight: `${STICKY_H_PCT}%`,
                            background: '#fef08a',
                            boxShadow: '2px 3px 8px rgba(0,0,0,.3)',
                            borderRadius: '2px',
                            padding: '4px 6px',
                            zIndex: 20,
                            cursor: 'default',
                          }}
                        >
                          {/* Delete button */}
                          <button
                            onClick={e => handleNoteDelete(note.id, e)}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 4,
                              fontSize: '10px',
                              color: 'rgba(0,0,0,.4)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            ✕
                          </button>
                          {isEditing ? (
                            <div>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                onBlur={handleNoteConfirm}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNoteConfirm() } }}
                                style={{
                                  width: '100%',
                                  fontSize: '10px',
                                  lineHeight: 1.3,
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  resize: 'none',
                                  color: '#1a1a1a',
                                  fontFamily: 'DM Sans, sans-serif',
                                  minHeight: '40px',
                                  paddingRight: '12px',
                                }}
                                placeholder="Type your note…"
                              />
                            </div>
                          ) : (
                            <p
                              style={{
                                fontSize: '10px',
                                lineHeight: 1.3,
                                color: '#1a1a1a',
                                wordBreak: 'break-word',
                                paddingRight: '12px',
                                cursor: activeTool === 'sticky' ? 'default' : 'text',
                                whiteSpace: 'pre-wrap',
                              }}
                              onClick={() => {
                                setEditingNoteId(note.id)
                                setNoteText(note.text)
                              }}
                            >
                              {note.text || <em style={{ color: 'rgba(0,0,0,.35)' }}>Empty note</em>}
                            </p>
                          )}
                        </div>
                      )
                    }
                  })}

                {/* Text item hit targets — only in highlight mode */}
                {activeTool && activeTool !== 'sticky' && pg.textItems.map(item => (
                  <div
                    key={item.id}
                    onClick={e => handleTextClick(pg.pageNum, item, e)}
                    style={{
                      position: 'absolute',
                      left: `${item.xPct}%`,
                      top: `${item.yPct}%`,
                      width: `${item.widthPct}%`,
                      height: `${item.heightPct}%`,
                      cursor: 'text',
                      // Slight visual feedback on hover via CSS class not possible inline;
                      // background is transparent — highlights show beneath via annotation layer
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
