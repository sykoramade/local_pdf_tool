'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { SigEntry } from '@/lib/pdf/types'
import {
  getSavedSignatures,
  saveSignature,
  deleteSignature,
  type StoredSignature,
} from '@/lib/signatures-store'

interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (sig: Pick<SigEntry, 'text' | 'drawingDataUrl'>) => void
}

/**
 * Line smoothing utility using quadratic curves.
 */
function drawSmooth(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const cpX = (pts[i].x + pts[i + 1].x) / 2
    const cpY = (pts[i].y + pts[i + 1].y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpX, cpY)
  }
  const last = pts[pts.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

export default function SignatureModal({ open, onClose, onConfirm }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw')
  const [isDesktop, setIsDesktop] = useState(true)
  const [typedName, setTypedName] = useState('')
  const [hasStrokes, setHasStrokes] = useState(false)
  const [saveForLater, setSaveForLater] = useState(false)
  const [savedSigs, setSavedSigs] = useState<StoredSignature[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([])
  const strokesRef = useRef<{ x: number; y: number }[][]>([])

  // Detect screen size
  useEffect(() => {
    const mediaQuery = matchMedia('(min-width: 640px)')
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Initialize canvas size on mount and after render
  useEffect(() => {
    if (!open || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [open, activeTab, isDesktop])

  // Load saved sigs on open; reset state on close
  useEffect(() => {
    if (open) {
      setSavedSigs(getSavedSignatures())
    } else {
      setActiveTab('draw')
      setTypedName('')
      setHasStrokes(false)
      setSaveForLater(false)
      currentStrokeRef.current = []
      strokesRef.current = []
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [open])

  // Get pointer position relative to canvas
  const getPointerPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  // Redraw canvas with all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Redraw completed strokes
    for (const stroke of strokesRef.current) {
      drawSmooth(ctx, stroke)
    }

    // Redraw current stroke
    if (currentStrokeRef.current.length > 0) {
      drawSmooth(ctx, currentStrokeRef.current)
    }
  }, [])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getPointerPos(e)
    if (!pos) return

    isDrawingRef.current = true
    currentStrokeRef.current = [pos]
  }, [getPointerPos])

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawingRef.current) return

      const pos = getPointerPos(e)
      if (!pos) return

      currentStrokeRef.current.push(pos)
      redrawCanvas()
    },
    [getPointerPos, redrawCanvas],
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawingRef.current && currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current])
      setHasStrokes(true)
    }
    isDrawingRef.current = false
    currentStrokeRef.current = []
    redrawCanvas()
  }, [redrawCanvas])

  const handleCanvasTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const pos = getPointerPos(e)
      if (!pos) return

      isDrawingRef.current = true
      currentStrokeRef.current = [pos]
    },
    [getPointerPos],
  )

  const handleCanvasTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawingRef.current) return

      const pos = getPointerPos(e)
      if (!pos) return

      currentStrokeRef.current.push(pos)
      redrawCanvas()
    },
    [getPointerPos, redrawCanvas],
  )

  const handleCanvasTouchEnd = useCallback(() => {
    if (isDrawingRef.current && currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current])
      setHasStrokes(true)
    }
    isDrawingRef.current = false
    currentStrokeRef.current = []
    redrawCanvas()
  }, [redrawCanvas])

  const handleClearCanvas = useCallback(() => {
    strokesRef.current = []
    currentStrokeRef.current = []
    setHasStrokes(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const handleConfirmDraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    if (saveForLater) {
      saveSignature({ drawingDataUrl: dataUrl })
    }
    onConfirm({ drawingDataUrl: dataUrl })
  }, [onConfirm, saveForLater])

  const handleConfirmType = useCallback(() => {
    const text = typedName.trim()
    if (saveForLater) {
      saveSignature({ text })
    }
    onConfirm({ text })
  }, [typedName, onConfirm, saveForLater])

  if (!open) return null

  const canvasHeight = isDesktop ? 240 : 180

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const modalBaseStyle: React.CSSProperties = {
    background: 'rgba(11,13,20,.96)',
    border: '1px solid rgba(255,255,255,.1)',
    padding: 20,
    maxHeight: '90dvh',
    overflowY: 'auto',
  }

  const modalStyle: React.CSSProperties = isDesktop
    ? {
        ...modalBaseStyle,
        maxWidth: 520,
        width: '100%',
        borderRadius: 16,
      }
    : {
        ...modalBaseStyle,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90dvh',
        borderRadius: '16px 16px 0 0',
      }

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? 'rgba(255,255,255,.1)' : 'none',
    color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
    border: 'none',
    borderRadius: 6,
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .15s',
  })

  const confirmButtonStyle = (enabled: boolean): React.CSSProperties => ({
    background: enabled ? '#6366f1' : 'rgba(99,102,241,.25)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: 12,
    fontWeight: 600,
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.4,
  })

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('draw')}
            style={tabButtonStyle(activeTab === 'draw')}
          >
            Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            style={tabButtonStyle(activeTab === 'type')}
          >
            Type
          </button>
        </div>

        {/* Draw tab */}
        {activeTab === 'draw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              style={{
                width: '100%',
                height: canvasHeight,
                background: '#fff',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 10,
                display: 'block',
                cursor: 'crosshair',
                touchAction: 'none',
              }}
            />
            <button
              onClick={handleClearCanvas}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,.2)',
                color: 'rgba(255,255,255,.6)',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 11,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Type tab */}
        {activeTab === 'type' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Your full name"
              autoFocus
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
            {typedName.trim() && (
              <div
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: '#0b0d14',
                  background: '#fff',
                  borderRadius: 6,
                  padding: '8px 16px',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {typedName.trim()}
              </div>
            )}
          </div>
        )}

        {/* Recent signatures */}
        {savedSigs.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Recent
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {savedSigs.map(sig => (
                <div key={sig.id} style={{ position: 'relative', display: 'inline-flex' }}>
                  <button
                    onClick={() => onConfirm({ text: sig.text, drawingDataUrl: sig.drawingDataUrl })}
                    title="Use this signature"
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      minWidth: 80,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {sig.drawingDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sig.drawingDataUrl} alt="Saved signature" style={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: '#0b0d14' }}>
                        {sig.text}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      deleteSignature(sig.id)
                      setSavedSigs(getSavedSignatures())
                    }}
                    title="Remove"
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: 'rgba(30,27,75,.9)',
                      border: '1px solid rgba(255,255,255,.2)',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'rgba(255,255,255,.6)',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={saveForLater}
              onChange={e => setSaveForLater(e.target.checked)}
              style={{ accentColor: '#6366f1', width: 14, height: 14 }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Save for later</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,.2)',
              color: 'rgba(255,255,255,.6)',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (activeTab === 'draw') {
                handleConfirmDraw()
              } else {
                handleConfirmType()
              }
            }}
            disabled={activeTab === 'draw' ? !hasStrokes : typedName.trim() === ''}
            style={confirmButtonStyle(
              activeTab === 'draw' ? hasStrokes : typedName.trim() !== '',
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}
