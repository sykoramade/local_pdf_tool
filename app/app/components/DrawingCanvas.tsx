'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface PageRect {
  left: number
  top: number
  width: number
  height: number
}

interface DrawingCanvasProps {
  pageRect: PageRect
  onDone: (dataUrl: string) => void
  onCancel: () => void
}

const PEN_COLORS = [
  { label: 'Black', value: '#111111' },
  { label: 'Blue',  value: '#2563eb' },
  { label: 'Red',   value: '#dc2626' },
]

const PEN_SIZES = [2, 4, 7]

export default function DrawingCanvas({ pageRect, onDone, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const [penColor, setPenColor] = useState('#111111')
  const [penSize, setPenSize] = useState(2)

  // Resize canvas to fill viewport at device pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  const getPos = (e: MouseEvent | Touch): { x: number; y: number } => {
    const target = 'clientX' in e ? e : e
    return { x: (target as MouseEvent).clientX, y: (target as MouseEvent).clientY }
  }

  const startDraw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    isDrawingRef.current = true
    lastPosRef.current = { x, y }
    ctx.beginPath()
    ctx.arc(x, y, penSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = penColor
    ctx.fill()
  }, [penColor, penSize])

  const continueDraw = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !lastPosRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = penColor
    ctx.lineWidth = penSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPosRef.current = { x, y }
  }, [penColor, penSize])

  const stopDraw = useCallback(() => {
    isDrawingRef.current = false
    lastPosRef.current = null
  }, [])

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMouseDown = (e: MouseEvent) => { e.preventDefault(); startDraw(e.clientX, e.clientY) }
    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); continueDraw(e.clientX, e.clientY) }
    const onMouseUp = () => stopDraw()

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [startDraw, continueDraw, stopDraw])

  // Touch events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      startDraw(t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      continueDraw(t.clientX, t.clientY)
    }
    const onTouchEnd = () => stopDraw()

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [startDraw, continueDraw, stopDraw])

  const handleDone = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1

    // Crop the drawing to the page bounds
    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = pageRect.width * dpr
    cropCanvas.height = pageRect.height * dpr
    const ctx = cropCanvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      canvas,
      pageRect.left * dpr,
      pageRect.top * dpr,
      pageRect.width * dpr,
      pageRect.height * dpr,
      0,
      0,
      pageRect.width * dpr,
      pageRect.height * dpr,
    )

    const dataUrl = cropCanvas.toDataURL('image/png')
    onDone(dataUrl)
  }, [pageRect, onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
      }}
    >
      {/* Drawing canvas — transparent background so PDF shows through */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      />

      {/* Page boundary indicator */}
      <div
        style={{
          position: 'absolute',
          left: pageRect.left,
          top: pageRect.top,
          width: pageRect.width,
          height: pageRect.height,
          border: '2px dashed rgba(99,102,241,.5)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(11,13,20,.92)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 12,
          padding: '8px 12px',
          backdropFilter: 'blur(14px)',
          zIndex: 10,
          userSelect: 'none',
        }}
      >
        {/* Pen color */}
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em', marginRight: 2 }}>Pen</span>
        {PEN_COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => setPenColor(c.value)}
            title={c.label}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: c.value,
              border: penColor === c.value ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              boxShadow: penColor === c.value ? '0 0 0 1px rgba(255,255,255,.3)' : 'none',
            }}
          />
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.12)', flexShrink: 0 }} />

        {/* Pen size */}
        {PEN_SIZES.map(s => (
          <button
            key={s}
            onClick={() => setPenSize(s)}
            title={`Size ${s}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: penSize === s ? 'rgba(255,255,255,.12)' : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <div style={{ width: s * 2.5, height: s * 2.5, borderRadius: '50%', background: penColor }} />
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.12)', flexShrink: 0 }} />

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 7,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,.5)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        {/* Done */}
        <button
          onClick={handleDone}
          style={{
            background: '#6366f1',
            border: 'none',
            borderRadius: 7,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
