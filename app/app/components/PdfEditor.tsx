'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PdfDropzone from './PdfDropzone'
import AuthModal from './AuthModal'
import type { ExtractedTextItem, EditMap } from '@/lib/pdf/types'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'

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

const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
  </svg>
)

const IconSignature = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a1.875 1.875 0 1 1 2.652 2.652L8.332 18.371a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
)

const IconArchive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
)

const IconArrowsUpDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
)

const IconAnnotate = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
)

const IconRedact = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={20} height={20}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

export default function PdfEditor() {
  const [state, setState] = useState<EditorState>('idle')
  const [viewerScale, setViewerScale] = useState(1.5)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const { user } = useUser()
  useEffect(() => { setViewerScale(getResponsiveScale()) }, [])
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [filename, setFilename] = useState('')
  const [editMap, setEditMap] = useState<EditMap>(new Map())
  const [saving, setSaving] = useState(false)
  const [editCount, setEditCount] = useState(0)
  const textItemsRef = useRef<ExtractedTextItem[]>([])
  // S9-3: editMap history stack for Ctrl+Z undo
  const historyRef = useRef<EditMap[]>([])
  const [activeToolTab, setActiveToolTab] = useState<'edit' | 'sign' | 'compress' | 'merge' | 'annotate' | 'redact'>('edit')

  const handleLoad = useCallback((bytes: Uint8Array, name: string) => {
    setPdfBytes(bytes)
    setFilename(name)
    setEditMap(new Map())
    setEditCount(0)
    historyRef.current = []
    textItemsRef.current = []
    setState('viewing')
  }, [])

  const handleReset = useCallback(() => {
    setPdfBytes(null)
    setFilename('')
    setEditMap(new Map())
    setEditCount(0)
    historyRef.current = []
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
      // Push previous state to history so Ctrl+Z can restore it
      historyRef.current = [...historyRef.current, prev]
      setEditCount(next.size)
      return next
    })
  }, [])

  // S9-3: Ctrl+Z undo — pop last editMap state from history.
  // Only fires when focus is NOT inside a text input (browser handles undo
  // within inputs natively). Prevents browser page-level undo from freezing
  // the editor by taking ownership of the Ctrl+Z event in viewing state.
  const handleUndo = useCallback(() => {
    const history = historyRef.current
    if (history.length === 0) return
    const previous = history[history.length - 1]
    historyRef.current = history.slice(0, -1)
    setEditMap(previous)
    setEditCount(previous.size)
  }, [])

  useEffect(() => {
    if (state !== 'viewing') return
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const tag = (document.activeElement as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        handleUndo()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [state, handleUndo])

  const handleTextItems = useCallback((items: ExtractedTextItem[]) => {
    textItemsRef.current = items
  }, [])

  const handleDownload = useCallback(async () => {
    if (!pdfBytes) return

    // Usage gate: anonymous users get FREE_USES_PER_DAY uses/day
    if (!user && !canUse()) {
      setShowAuthGate(true)
      return
    }

    setSaving(true)

    // S9-5: Yield two animation frames so the "Saving…" button state renders
    // before pdf-lib serialisation blocks the main thread.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

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
      if (!user) incrementUses()
    } catch (err) {
      alert(`Save failed: ${(err as Error).message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }, [pdfBytes, editMap, filename, user])

  const toolTabs: {
    id: 'edit' | 'sign' | 'compress' | 'merge' | 'annotate' | 'redact'
    label: string
    icon: React.ReactNode
    iconBg: string
    desc: string
    cta: React.ReactNode
    comingSoon: boolean
    mock: React.ReactNode
  }[] = [
    {
      id: 'edit',
      label: 'Edit text',
      icon: <IconPencil />,
      iconBg: 'bg-indigo-100 text-indigo-600',
      desc: 'Click any text in your PDF and edit it directly. Fonts matched automatically — no reformatting, no layout shift.',
      cta: <a href="/" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">Open the editor →</a>,
      comingSoon: false,
      mock: (
        <div className="space-y-3">
          <div className="h-2 bg-gray-600 rounded w-full" />
          <div className="h-2 bg-gray-600 rounded" style={{ width: '82%' }} />
          <div className="flex items-center gap-0.5">
            <div className="h-2 bg-indigo-400 rounded" style={{ width: '60%', opacity: 0.85 }} />
            <div className="w-0.5 h-4 bg-indigo-300" />
          </div>
          <div className="h-2 bg-gray-600 rounded" style={{ width: '90%' }} />
          <div className="h-2 bg-gray-600 rounded" style={{ width: '45%' }} />
          <p className="text-xs text-gray-500 pt-2">Click any text to edit</p>
        </div>
      ),
    },
    {
      id: 'sign',
      label: 'Sign',
      icon: <IconSignature />,
      iconBg: 'bg-purple-100 text-purple-600',
      desc: 'Draw your signature on a canvas, then drag it to any position on any page. Client-side only.',
      cta: <a href="/sign" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">Open the sign tool →</a>,
      comingSoon: false,
      mock: (
        <div className="space-y-3">
          <div className="h-2 bg-gray-600 rounded w-full" />
          <div className="h-2 bg-gray-600 rounded" style={{ width: '70%' }} />
          <div className="h-2 bg-gray-600 rounded" style={{ width: '85%' }} />
          <div className="border-t border-white border-opacity-10 pt-3 mt-3">
            <p className="text-xs text-gray-500 mb-2">Your signature</p>
            <div className="h-14 rounded-lg border border-dashed border-gray-600 flex items-center justify-center px-3">
              <svg viewBox="0 0 140 36" fill="none" className="w-full" style={{ maxWidth: '140px' }}>
                <path d="M8 28 C28 8 48 32 68 18 C88 4 108 28 132 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Drag to place</p>
          </div>
        </div>
      ),
    },
    {
      id: 'compress',
      label: 'Compress',
      icon: <IconArchive />,
      iconBg: 'bg-green-100 text-green-700',
      desc: 'Reduce file size without quality loss. Works on scanned documents, forms, and presentations.',
      cta: <a href="/compress" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">Open the compressor →</a>,
      comingSoon: false,
      mock: (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Before</p>
            <div className="h-3 bg-gray-600 rounded w-full" />
            <p className="text-xs text-gray-400 mt-1">2.4 MB</p>
          </div>
          <p className="text-xs text-gray-500 text-center">↓ compressed</p>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">After</p>
            <div className="h-3 bg-emerald-500 rounded" style={{ width: '20%', opacity: 0.9 }} />
            <p className="text-xs text-emerald-400 mt-1">480 KB — 80% smaller</p>
          </div>
        </div>
      ),
    },
    {
      id: 'merge',
      label: 'Merge & Split',
      icon: <IconArrowsUpDown />,
      iconBg: 'bg-blue-100 text-blue-600',
      desc: 'Combine multiple PDFs into one document, or extract a page range. Instant, no quality loss.',
      cta: <a href="/merge" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">Merge or split →</a>,
      comingSoon: false,
      mock: (
        <div className="flex items-center gap-3">
          {['doc1.pdf', 'doc2.pdf'].map((label) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-14 h-18 rounded border border-gray-600 p-2 flex flex-col gap-1.5">
                <div className="h-1 bg-gray-600 rounded w-full" />
                <div className="h-1 bg-gray-600 rounded" style={{ width: '70%' }} />
                <div className="h-1 bg-gray-600 rounded" style={{ width: '85%' }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{label}</p>
            </div>
          ))}
          <span className="text-gray-500 text-sm font-light">+</span>
          <span className="text-gray-500 text-sm">→</span>
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 rounded border-2 flex flex-col gap-1.5 p-2" style={{ borderColor: 'rgba(52,211,153,0.5)' }}>
              <div className="h-1 bg-gray-600 rounded w-full" />
              <div className="h-1 bg-gray-600 rounded" style={{ width: '70%' }} />
              <div className="h-1 bg-gray-500 rounded w-full opacity-60" />
              <div className="h-1 bg-gray-500 rounded opacity-60" style={{ width: '80%' }} />
            </div>
            <p className="text-[10px] text-emerald-400 mt-1">merged.pdf</p>
          </div>
        </div>
      ),
    },
    {
      id: 'annotate',
      label: 'Annotate',
      icon: <IconAnnotate />,
      iconBg: 'bg-yellow-100 text-yellow-700',
      desc: 'Mark up research papers, highlight contract clauses, and add sticky notes to any page.',
      cta: <span className="text-gray-400 text-sm">Coming soon — <a href="/pricing" className="text-indigo-400 underline hover:text-indigo-300 transition-colors">Get notified</a></span>,
      comingSoon: true,
      mock: (
        <div className="space-y-3">
          <div className="h-2 bg-gray-600 rounded w-full" />
          <div className="relative h-2">
            <div className="h-2 bg-gray-600 rounded w-full" />
            <div className="absolute inset-0 rounded" style={{ width: '65%', backgroundColor: 'rgba(251,191,36,0.35)' }} />
          </div>
          <div className="h-2 bg-gray-600 rounded" style={{ width: '80%' }} />
          <div className="relative h-2">
            <div className="h-2 bg-gray-600 rounded" style={{ width: '90%' }} />
            <div className="absolute inset-0 rounded" style={{ width: '40%', backgroundColor: 'rgba(251,191,36,0.35)' }} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
            <p className="text-xs text-gray-400">Needs review</p>
          </div>
        </div>
      ),
    },
    {
      id: 'redact',
      label: 'Redaction',
      icon: <IconRedact />,
      iconBg: 'bg-amber-100 text-amber-700',
      desc: 'Permanently remove sensitive content — not just visually hidden. GDPR Art. 17 and FOI compliant.',
      cta: <span className="text-gray-400 text-sm">Coming soon — <a href="/pricing" className="text-indigo-400 underline hover:text-indigo-300 transition-colors">Get notified</a></span>,
      comingSoon: true,
      mock: (
        <div className="space-y-3">
          <div className="h-2 bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-900 rounded border border-gray-800" style={{ width: '75%' }} />
          <div className="h-2 bg-gray-600 rounded" style={{ width: '85%' }} />
          <div className="h-4 bg-gray-900 rounded border border-gray-800" style={{ width: '40%' }} />
          <div className="h-2 bg-gray-600 rounded w-full" />
          <p className="text-xs text-gray-500 pt-1">Content deleted. Not just hidden.</p>
        </div>
      ),
    },
  ]

  if (state === 'idle') {
    const activeTool = toolTabs.find(t => t.id === activeToolTab)!

    return (
      <div className="min-h-screen bg-white">

        {/* ── HERO — dark navy ─────────────────────────────────────────── */}
        <section style={{ backgroundColor: '#0c111d' }} className="py-24 lg:py-32">
          <div className="max-w-2xl mx-auto px-4 flex flex-col items-center">

            {/* H1 — DM Serif Display via CSS variable */}
            <h1
              style={{
                fontFamily: 'var(--font-display, "Georgia", serif)',
                fontSize: 'clamp(48px, 7vw, 72px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              Edit PDFs. Your file stays here.
            </h1>

            <p className="text-gray-400 text-lg text-center mb-10">
              Processed in your browser. Nothing leaves this tab.
            </p>

            {/* Dropzone card — floating on dark */}
            <div
              className="bg-white rounded-2xl p-10 w-full max-w-lg mx-auto flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
            >
              {/* PDF icon — inline SVG, no emoji */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#d1d5db" width={56} height={56} className="mb-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>

              <p className="font-semibold text-gray-800 text-base mb-1">Drop a PDF here</p>
              <p className="text-sm text-gray-400 mb-7">or click to choose a file</p>

              {/* Wraps PdfDropzone — clicking the button triggers the dropzone */}
              <PdfDropzone onLoad={handleLoad} />
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-6">
              {['No upload', 'No account', 'No server', 'Works offline'].map(item => (
                <span key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold text-sm">✓</span> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TOOL SWITCHER ───────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4">

            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-10">
              Five tools. All in your browser.
            </p>

            {/* Tab row */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              {toolTabs.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolTab(tool.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${activeToolTab === tool.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                >
                  <span className={activeToolTab === tool.id ? 'text-white' : 'text-gray-400'}>
                    {tool.icon}
                  </span>
                  {tool.label}
                  {tool.comingSoon && (
                    <span className="text-[9px] uppercase tracking-wide font-medium bg-gray-100 text-gray-400 rounded-full px-1.5 py-0.5 ml-0.5">
                      soon
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel — dark navy card */}
            <div
              className="rounded-2xl p-10 lg:p-14 flex flex-col lg:flex-row lg:items-center gap-10"
              style={{ backgroundColor: '#0c111d' }}
            >
              {/* Left: description */}
              <div className="flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${activeTool.iconBg}`}>
                  {activeTool.icon}
                </div>
                <h2 className="font-bold text-2xl text-white mb-3">{activeTool.label}</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{activeTool.desc}</p>
                {activeTool.cta}
              </div>

              {/* Right: UI mock */}
              <div className="flex-1 lg:max-w-xs">
                <div
                  className="rounded-xl p-6"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {activeTool.mock}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FOR THE SKEPTIC — DevTools proof ────────────────────────── */}
        <section className="py-20" style={{ backgroundColor: '#f9fafb' }}>
          <div className="max-w-5xl mx-auto px-4 flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-20">

            {/* Copy */}
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">The proof</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Open DevTools. Watch the network tab.</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                While you work, the Fetch/XHR panel shows 0 requests. Your file is loaded from disk,
                processed in WebAssembly, and saved back to disk. No server is involved.
              </p>
              <a href="/privacy-architecture" className="text-sm text-indigo-600 underline underline-offset-2 hover:text-indigo-700 transition-colors">
                Technical details and verification steps →
              </a>
            </div>

            {/* DevTools panel mock */}
            <div className="flex-1 lg:max-w-xl">
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1e2433' }}>
                {/* Window dots */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white border-opacity-5">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                  <span className="text-xs text-gray-400 ml-3 font-mono">DevTools — Network</span>
                </div>
                {/* Tabs */}
                <div className="flex gap-4 px-4 pt-2 pb-0 border-b border-white border-opacity-5 font-mono text-xs">
                  <span className="text-gray-500 pb-2">Elements</span>
                  <span className="text-white border-b-2 border-indigo-400 pb-2">Network</span>
                  <span className="text-gray-500 pb-2">Console</span>
                  <span className="text-gray-500 pb-2">Sources</span>
                </div>
                {/* Column headers */}
                <div className="font-mono text-xs text-gray-500 grid px-4 py-2 border-b border-white border-opacity-5" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                  <span>Name</span><span>Status</span><span>Type</span><span>Size</span>
                </div>
                {/* Rows */}
                {[
                  ['app.js', '200', 'Script', '344 KB'],
                  ['pdf.worker.min.js', '200', 'Script', '1.2 MB'],
                ].map(([name, status, type, size]) => (
                  <div key={name} className="font-mono text-xs grid px-4 py-1.5 border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                    <span className="text-blue-400 truncate">{name}</span>
                    <span className="text-green-400">{status}</span>
                    <span className="text-gray-400">{type}</span>
                    <span className="text-gray-300">{size}</span>
                  </div>
                ))}
                {/* Empty rows */}
                <div className="font-mono text-xs grid px-4 py-1.5 text-gray-700" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}><span>—</span><span /><span /><span /></div>
                <div className="font-mono text-xs grid px-4 py-1.5 text-gray-700" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}><span>—</span><span /><span /><span /></div>
                {/* Footer */}
                <div className="border-t border-white border-opacity-5 px-4 py-3">
                  <p className="font-mono text-xs text-emerald-400">0 requests while your document is open</p>
                  <p className="font-mono text-xs text-gray-500 mt-0.5">Your PDF never left this tab</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-4">

            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Honest pricing.</h2>
            <p className="text-sm text-gray-500 text-center mb-12">The free tier is actually free. No card, no watermarks, no bait.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Free */}
              <div className="rounded-2xl border-2 border-gray-200 p-8">
                <p className="text-lg font-bold text-gray-900">Free</p>
                <div className="flex items-baseline mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-sm text-gray-400 ml-1.5">forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Edit, sign, compress, merge, split', '3 uses per day', 'No watermarks, ever', 'No card required'].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <a href="/" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 underline underline-offset-2 transition-colors">
                  Start free →
                </a>
              </div>

              {/* Pro */}
              <div className="rounded-2xl border-2 p-8" style={{ borderColor: '#818cf8', backgroundColor: '#eef2ff' }}>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">Pro</p>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-full px-2 py-0.5">$9 / month</span>
                </div>
                <div className="flex items-baseline mt-4 mb-1">
                  <span className="text-4xl font-bold text-gray-900">$9</span>
                  <span className="text-sm text-gray-500 ml-1.5">/ month</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Cancel any time.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-gray-600"><span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> Everything in Free, unlimited</li>
                  <li className="flex items-start gap-2 text-sm text-gray-600"><span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> <span>Annotate &amp; highlight <span className="text-[10px] uppercase font-medium text-indigo-500 bg-indigo-100 rounded-full px-1.5 py-0.5 ml-1">soon</span></span></li>
                  <li className="flex items-start gap-2 text-sm text-gray-600"><span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> <span>Permanent redaction <span className="text-[10px] uppercase font-medium text-indigo-500 bg-indigo-100 rounded-full px-1.5 py-0.5 ml-1">soon</span></span></li>
                  <li className="flex items-start gap-2 text-sm text-gray-600"><span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> Batch processing</li>
                  <li className="flex items-start gap-2 text-sm text-gray-600"><span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span> Priority support</li>
                </ul>
                <a href="/pricing" className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
                  Get Pro →
                </a>
              </div>

            </div>
          </div>
        </section>

      </div>
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

      {showAuthGate && (
        <AuthModal reason="gate" onClose={() => setShowAuthGate(false)} />
      )}

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
