'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import PdfDropzone from '@/app/components/PdfDropzone'
import AuthModal from '@/app/components/AuthModal'
import { useUser } from '@/hooks/useUser'
import { canUse, incrementUses } from '@/lib/usage'
import { applySignatures } from '@/lib/pdf/signature'
import { consumePendingFile } from '@/lib/pending-file'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignaturePlacement {
  id: string
  dataUrl: string
  /** Position as percentage of page dimensions (0–100). Scale-independent. */
  xPct: number
  yPct: number
  /** Width as percentage of page width. */
  widthPct: number
  pageNum: number
  committed: boolean
}

export interface SignToolProps {
  onSave?: (placements: SignaturePlacement[]) => void
}

// ─── Signature Canvas ─────────────────────────────────────────────────────────

interface SignatureCanvasProps {
  onConfirm: (dataUrl: string) => void
  onBack: () => void
}

function SignatureCanvas({ onConfirm, onBack }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  function getPos(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  function startDraw(x: number, y: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawing.current = true
    lastPos.current = { x, y }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Draw a dot so single taps register
    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a2e'
    ctx.fill()
  }

  function draw(x: number, y: number) {
    if (!isDrawing.current || !lastPos.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = { x, y }
  }

  function endDraw() {
    isDrawing.current = false
    lastPos.current = null
  }

  // ── Mouse events
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getPos(canvas, e.clientX, e.clientY)
    startDraw(pos.x, pos.y)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getPos(canvas, e.clientX, e.clientY)
    draw(pos.x, pos.y)
  }

  // ── Touch events (must preventDefault to block scroll while drawing)
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const touch = e.touches[0]
    const pos = getPos(canvas, touch.clientX, touch.clientY)
    startDraw(pos.x, pos.y)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const touch = e.touches[0]
    const pos = getPos(canvas, touch.clientX, touch.clientY)
    draw(pos.x, pos.y)
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    endDraw()
  }

  function handleClear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
  }

  function handleConfirm() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Guard: don't confirm a blank canvas
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = data.data.some((v, i) => i % 4 === 3 && v > 0)
    if (!hasContent) return
    onConfirm(canvas.toDataURL('image/png'))
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-sm text-center mb-3" style={{ color: 'rgba(255,255,255,.5)' }}>Draw your signature below</p>

      {/* Canvas area with lined-paper feel — keep bg-white for ink drawing surface */}
      <div
        className="flex-1 min-h-0 relative bg-white border rounded-xl overflow-hidden"
        style={{
          borderColor: 'rgba(255,255,255,.15)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
          backgroundSize: '100% 32px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-full cursor-crosshair touch-none"
          style={{ minHeight: '200px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Action row */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onBack}
          className="min-h-[44px] px-4 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.12)' }}
        >
          Back
        </button>
        <button
          onClick={handleClear}
          className="min-h-[44px] px-4 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.12)' }}
        >
          Clear
        </button>
        <button
          onClick={handleConfirm}
          className="min-h-[44px] flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors"
        >
          Confirm →
        </button>
      </div>

      {/* Pro upsell hint — locked feature, non-interactive */}
      <div className="mt-3 text-center">
        <span className="text-xs inline-flex items-center gap-1 opacity-60 select-none cursor-default" style={{ color: 'rgba(255,255,255,.4)' }}>
          Upload image instead
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>Pro</span>
        </span>
      </div>
    </div>
  )
}

// ─── Signature Modal ──────────────────────────────────────────────────────────

interface SignatureModalProps {
  onConfirm: (dataUrl: string) => void
  onClose: () => void
}

function SignatureModal({ onConfirm, onClose }: SignatureModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    // Backdrop — mobile: bottom sheet, desktop: centred dialog
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-[480px] sm:mx-4 p-5 sm:p-6"
        style={{ background: '#141720', border: '1px solid rgba(255,255,255,.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-semibold text-white">Draw your signature</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(255,255,255,.5)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <SignatureCanvas onConfirm={onConfirm} onBack={onClose} />
        </div>
      </div>
    </div>
  )
}

// ─── Draggable / Resizable Signature Overlay ──────────────────────────────────

interface SignatureOverlayProps {
  placement: SignaturePlacement
  pageEl: HTMLElement
  isPro: boolean
  onUpdate: (updates: Partial<SignaturePlacement>) => void
  onCommit: () => void
  onDelete: () => void
}

function SignatureOverlay({ placement, pageEl, isPro, onUpdate, onCommit, onDelete }: SignatureOverlayProps) {
  // Shared drag/resize state
  const activeGesture = useRef<'drag' | 'resize' | null>(null)
  const startData = useRef<{
    clientX: number
    clientY: number
    origXPct: number
    origYPct: number
    origWidthPct: number
    pageW: number
    pageH: number
  } | null>(null)

  function getXY(e: MouseEvent | TouchEvent) {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
    }
    return { clientX: e.clientX, clientY: e.clientY }
  }

  // ── Drag handle
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const rect = pageEl.getBoundingClientRect()
    const { clientX, clientY } = getXY(e.nativeEvent as MouseEvent | TouchEvent)
    activeGesture.current = 'drag'
    startData.current = {
      clientX, clientY,
      origXPct: placement.xPct,
      origYPct: placement.yPct,
      origWidthPct: placement.widthPct,
      pageW: rect.width,
      pageH: rect.height,
    }
  }, [pageEl, placement.xPct, placement.yPct, placement.widthPct])

  // ── Resize handle (Pro only)
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const rect = pageEl.getBoundingClientRect()
    const { clientX, clientY } = getXY(e.nativeEvent as MouseEvent | TouchEvent)
    activeGesture.current = 'resize'
    startData.current = {
      clientX, clientY,
      origXPct: placement.xPct,
      origYPct: placement.yPct,
      origWidthPct: placement.widthPct,
      pageW: rect.width,
      pageH: rect.height,
    }
  }, [pageEl, placement.xPct, placement.yPct, placement.widthPct])

  // ── Global move / end listeners
  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!activeGesture.current || !startData.current) return
      // Block page scroll while a drag or resize gesture is active
      if ('touches' in e) e.preventDefault()
      const { clientX, clientY } = getXY(e)
      const { clientX: sx, clientY: sy, origXPct, origYPct, origWidthPct, pageW, pageH } = startData.current

      if (activeGesture.current === 'drag') {
        const dxPct = ((clientX - sx) / pageW) * 100
        const dyPct = ((clientY - sy) / pageH) * 100
        onUpdate({
          xPct: Math.max(0, Math.min(100, origXPct + dxPct)),
          yPct: Math.max(0, Math.min(100, origYPct + dyPct)),
        })
      } else if (activeGesture.current === 'resize') {
        const dxPct = ((clientX - sx) / pageW) * 100
        onUpdate({ widthPct: Math.max(5, Math.min(80, origWidthPct + dxPct)) })
      }
    }

    function onEnd() {
      activeGesture.current = null
      startData.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [onUpdate])

  return (
    <div
      className="absolute select-none"
      style={{
        left: `${placement.xPct}%`,
        top: `${placement.yPct}%`,
        width: `${placement.widthPct}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'grab',
        zIndex: 10,
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Signature image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={placement.dataUrl}
        alt="Signature"
        className="w-full pointer-events-none block"
        draggable={false}
      />

      {/* Commit (place) button */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onCommit() }}
        className="absolute -top-3 -right-3 w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md text-xs font-bold"
        aria-label="Place signature"
      >
        ✓
      </button>

      {/* Delete button */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute -top-3 -left-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md text-xs font-bold"
        aria-label="Delete signature"
      >
        ✕
      </button>

      {/* Resize handle — Pro only */}
      {isPro && (
        <div
          className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize shadow"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          aria-label="Resize"
        />
      )}

      {/* Hint */}
      <p
        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap pointer-events-none"
        style={{ color: 'rgba(255,255,255,.4)' }}
      >
        Drag to reposition
      </p>
    </div>
  )
}

// ─── Main SignTool Component ───────────────────────────────────────────────────

type ToolStep = 'dropzone' | 'viewing' | 'modal' | 'placing'

interface PageInfo {
  pageNum: number
  width: number   // canvas pixels at render scale
  height: number  // canvas pixels at render scale
}

export default function SignTool({ onSave }: SignToolProps) {
  const { user, isPro } = useUser()
  const [step, setStep] = useState<ToolStep>('dropzone')
  const [filename, setFilename] = useState('')
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [pendingSigDataUrl, setPendingSigDataUrl] = useState<string | null>(null)
  const [placements, setPlacements] = useState<SignaturePlacement[]>([])
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // PDF.js page rendering
  const [pages, setPages] = useState<PageInfo[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null)
  // Track rendered page element refs for drag position calculations
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map())
  // Force re-render after page refs are set so overlays can read them
  const [pageRefsReady, setPageRefsReady] = useState(false)
  // Track which page is most visible — signature is placed on this page
  const [activePage, setActivePage] = useState(1)

  function handleFileLoad(bytes: Uint8Array, name: string) {
    setPdfBytes(bytes)
    setFilename(name)
    setStep('viewing')
    setPageRefsReady(false)
    setPlacements([])
  }

  // Auto-load a file pre-selected on the homepage drop zone
  useEffect(() => {
    const f = consumePendingFile()
    if (!f) return
    f.arrayBuffer().then(buf => handleFileLoad(new Uint8Array(buf), f.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load PDF.js and render pages when pdfBytes changes ─────────────────────
  useEffect(() => {
    if (!pdfBytes) return
    let cancelled = false
    setPdfLoading(true)
    setPdfError(null)
    setPages([])

    async function loadPdf() {
      const pdfjs = (await import('pdfjs-dist')) as typeof import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      try {
        const doc = await pdfjs.getDocument({ data: pdfBytes!.slice(0) }).promise
        if (cancelled) { doc.destroy(); return }
        pdfDocRef.current = doc

        const viewportW = typeof window !== 'undefined' ? window.innerWidth - 32 : 800
        const pageData: PageInfo[] = []
        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p)
          const natural = page.getViewport({ scale: 1 })
          const scale = Math.min(1.5, viewportW / natural.width)
          const vp = page.getViewport({ scale })
          pageData.push({ pageNum: p, width: Math.floor(vp.width), height: Math.floor(vp.height) })
        }
        if (cancelled) return
        setPages(pageData)
        setPdfLoading(false)
      } catch (err) {
        if (!cancelled) {
          const msg = (err as Error).message ?? ''
          setPdfError(
            msg.toLowerCase().includes('password')
              ? 'This PDF is password-protected. Please unlock it first.'
              : 'Could not open this PDF. It may be corrupted or unsupported.',
          )
          setPdfLoading(false)
        }
      }
    }

    loadPdf()
    return () => {
      cancelled = true
      pdfDocRef.current?.destroy()
      pdfDocRef.current = null
    }
  }, [pdfBytes])

  // ── Render each page canvas after pages state settles ──────────────────────
  const renderPages = useCallback(async (pageData: PageInfo[]) => {
    const doc = pdfDocRef.current
    if (!doc) return
    const viewportW = typeof window !== 'undefined' ? window.innerWidth - 32 : 800
    for (const { pageNum } of pageData) {
      const canvas = canvasRefs.current.get(pageNum)
      if (!canvas) continue
      const page = await doc.getPage(pageNum)
      const natural = page.getViewport({ scale: 1 })
      const scale = Math.min(1.5, viewportW / natural.width)
      const vp = page.getViewport({ scale })
      canvas.width = vp.width
      canvas.height = vp.height
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx as any, viewport: vp }).promise
    }
  }, [])

  useEffect(() => {
    if (pages.length > 0) renderPages(pages)
  }, [pages, renderPages])

  // ── Track active (most visible) page via IntersectionObserver ──────────────
  useEffect(() => {
    if (pages.length === 0) return
    const ratios = new Map<number, number>()
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const pageNum = Number((entry.target as HTMLElement).dataset.pagenum)
          ratios.set(pageNum, entry.intersectionRatio)
        }
        // Pick the page with the highest visible ratio
        let best = 1
        let bestRatio = -1
        ratios.forEach((ratio, num) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = num }
        })
        setActivePage(best)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] },
    )
    // Observe all page elements once they are mounted
    const timer = setTimeout(() => {
      pageRefs.current.forEach((el, pageNum) => {
        el.dataset.pagenum = String(pageNum)
        observer.observe(el)
      })
    }, 100)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pages, pageRefsReady])

  function handleFabClick() {
    setStep('modal')
  }

  function handleModalClose() {
    setStep('viewing')
  }

  function placeSig(dataUrl: string) {
    const id = `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setPlacements(prev => [
      ...prev,
      { id, dataUrl, xPct: 50, yPct: 50, widthPct: 30, pageNum: activePage, committed: false },
    ])
    if (!user) incrementUses()
    setPendingSigDataUrl(null)
    setStep('placing')
  }

  function handleSignatureConfirm(dataUrl: string) {
    // Gate fires at placement, not on modal open
    if (!user && !canUse()) {
      setPendingSigDataUrl(dataUrl)
      setShowAuthGate(true)
      return
    }
    placeSig(dataUrl)
  }

  function handleAuthClose() {
    setShowAuthGate(false)
    // If user just signed in and we have a pending sig, place it now
    if (user && pendingSigDataUrl) {
      placeSig(pendingSigDataUrl)
    }
  }

  function handleUpdatePlacement(id: string, updates: Partial<SignaturePlacement>) {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function handleCommitPlacement(id: string) {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, committed: true } : p))
    setStep('viewing')
  }

  function handleDeletePlacement(id: string) {
    setPlacements(prev => prev.filter(p => p.id !== id))
    setStep('viewing')
  }

  async function handleSave() {
    if (!pdfBytes) return
    const committed = placements.filter(p => p.committed)
    if (committed.length === 0) return
    setSaving(true)
    try {
      const result = await applySignatures(
        pdfBytes,
        committed.map(p => ({
          pageNum: p.pageNum,
          xPct: p.xPct,
          yPct: p.yPct,
          widthPct: p.widthPct,
          dataUrl: p.dataUrl,
        })),
      )
      const blob = new Blob([result.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace(/\.pdf$/i, '') + '-signed.pdf'
      a.click()
      URL.revokeObjectURL(url)
      if (onSave) onSave(committed)
    } catch (err) {
      console.error('Save failed:', err)
      setSaveMsg('Save failed — please try again')
      setTimeout(() => setSaveMsg(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const uncommittedCount = placements.filter(p => !p.committed).length
  const committedCount = placements.filter(p => p.committed).length
  const totalCount = placements.length

  // ── Drop zone ──────────────────────────────────────────────────────────────
  if (step === 'dropzone') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <PdfDropzone onLoad={handleFileLoad} />
        <p className="mt-4 text-xs text-center max-w-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
          Your PDF never leaves your device. All signing happens in your browser.
        </p>
      </div>
    )
  }

  // ── PDF view + signature UI ────────────────────────────────────────────────
  return (
    <div className="relative pb-28">
      {/* Filename / back bar — sticky */}
      <div
        className="flex items-center gap-3 px-4 py-2 sticky top-0 z-20"
        style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }}
      >
        <button
          onClick={() => { setStep('dropzone'); setPlacements([]); setFilename('') }}
          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,.4)' }}
          aria-label="Change file"
        >
          ←
        </button>
        <span className="text-sm truncate flex-1" style={{ color: 'rgba(255,255,255,.6)' }}>{filename || 'document.pdf'}</span>
        {committedCount > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full shrink-0"
            style={{ color: '#a5b4fc', background: 'rgba(99,102,241,.15)' }}
          >
            {committedCount} placed
          </span>
        )}
      </div>

      {/* Pages */}
      <div className="flex flex-col items-center gap-6 py-6 px-4">
        {/* Loading skeleton */}
        {pdfLoading && (
          <>
            {[1, 2].map(i => (
              <div
                key={i}
                className="bg-white shadow-lg animate-pulse rounded-sm"
                style={{ width: 'min(612px, calc(100vw - 2rem))', aspectRatio: '1 / 1.414' }}
              >
                <div className="p-8 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>Loading PDF…</p>
          </>
        )}

        {/* Error state */}
        {pdfError && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-xs">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-sm text-red-400 mb-3">{pdfError}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>Use ← to go back and try another file.</p>
            </div>
          </div>
        )}

        {/* Real PDF pages — keep bg-white (PDF rendering surface) */}
        {!pdfLoading && !pdfError && pages.map(({ pageNum, width, height }) => (
          <div
            key={pageNum}
            className="relative shadow-lg bg-white overflow-hidden"
            style={{ width, height }}
            ref={el => {
              if (el) {
                pageRefs.current.set(pageNum, el)
                if (!pageRefsReady) setPageRefsReady(true)
              } else {
                pageRefs.current.delete(pageNum)
              }
            }}
          >
            <canvas
              ref={el => {
                if (el) canvasRefs.current.set(pageNum, el)
                else canvasRefs.current.delete(pageNum)
              }}
              width={width}
              height={height}
              className="block"
            />

            {/* Signature overlays for this page */}
            {pageRefsReady && placements
              .filter(p => p.pageNum === pageNum)
              .map(placement => {
                const pageEl = pageRefs.current.get(pageNum)
                if (!pageEl) return null
                return (
                  <SignatureOverlay
                    key={placement.id}
                    placement={placement}
                    pageEl={pageEl}
                    isPro={isPro}
                    onUpdate={updates => handleUpdatePlacement(placement.id, updates)}
                    onCommit={() => handleCommitPlacement(placement.id)}
                    onDelete={() => handleDeletePlacement(placement.id)}
                  />
                )
              })}
          </div>
        ))}
      </div>

      {/* FAB — shown in viewing state, and in placing state once all sigs committed */}
      {(step === 'viewing' || (step === 'placing' && uncommittedCount === 0)) && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl shadow-lg flex items-center justify-center sm:bottom-8 sm:right-8 transition-colors"
          aria-label="Add signature"
        >
          ✍
        </button>
      )}

      {/* Save bar — fixed bottom */}
      {totalCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 flex items-center gap-3 sm:px-6"
          style={{ background: '#0d0f17', borderTop: '1px solid rgba(255,255,255,.08)' }}
        >
          <div className="flex-1 text-sm min-w-0" style={{ color: 'rgba(255,255,255,.6)' }}>
            {totalCount} signature{totalCount !== 1 ? 's' : ''}
            {uncommittedCount > 0 && (
              <span className="ml-2 text-xs block sm:inline" style={{ color: '#f59e0b' }}>
                ({uncommittedCount} not confirmed — tap ✓ to place)
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || committedCount === 0}
            className="min-h-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shrink-0 transition-colors"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save signed PDF{committedCount > 1 ? ` (${committedCount})` : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Save toast */}
      {saveMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg pointer-events-none">
          {saveMsg}
        </div>
      )}

      {/* Signature drawing modal */}
      {step === 'modal' && (
        <SignatureModal onConfirm={handleSignatureConfirm} onClose={handleModalClose} />
      )}

      {/* Auth gate modal */}
      {showAuthGate && (
        <AuthModal reason="gate" onClose={handleAuthClose} />
      )}
    </div>
  )
}
