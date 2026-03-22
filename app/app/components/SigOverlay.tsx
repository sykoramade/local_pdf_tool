'use client'

import { useState, useRef } from 'react'
import type { SigEntry } from '@/lib/pdf/types'

interface SigOverlayProps {
  sig: SigEntry
  onMove: (id: string, xPct: number, yPct: number) => void
  onDelete: (id: string) => void
  isPro: boolean
}

export default function SigOverlay({ sig, onMove, onDelete, isPro }: SigOverlayProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{
    mouseX: number
    mouseY: number
    xPct: number
    yPct: number
  } | null>(null)
  const lastPositionRef = useRef({ xPct: sig.xPct, yPct: sig.yPct })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      xPct: sig.xPct,
      yPct: sig.yPct,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current || !containerRef.current) {
        return
      }

      const parent = containerRef.current.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const dx = moveEvent.clientX - dragStartRef.current.mouseX
      const dy = moveEvent.clientY - dragStartRef.current.mouseY

      const newXPct = Math.max(0, Math.min(100 - sig.widthPct, dragStartRef.current.xPct + (dx / rect.width) * 100))
      const newYPct = Math.max(0, dragStartRef.current.yPct + (dy / rect.height) * 100)

      // Update position visually with direct DOM manipulation for smooth drag
      containerRef.current.style.left = newXPct + '%'
      containerRef.current.style.top = newYPct + '%'

      // Store last computed position
      lastPositionRef.current = { xPct: newXPct, yPct: newYPct }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
      const finalXPct = lastPositionRef.current.xPct
      const finalYPct = lastPositionRef.current.yPct
      onMove(sig.id, finalXPct, finalYPct)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(sig.id)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: sig.xPct + '%',
        top: sig.yPct + '%',
        width: sig.widthPct + '%',
        cursor: isDragging ? 'grabbing' : 'move',
        userSelect: 'none',
        zIndex: 5,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Signature content */}
      {sig.drawingDataUrl && (
        <img
          src={sig.drawingDataUrl}
          alt="signature"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      )}

      {sig.text && (
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: 14,
            color: '#000',
            background: '#fff',
            padding: '2px 6px',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}
        >
          {sig.text}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={handleDeleteClick}
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 700,
          display: isHovered ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          lineHeight: 1,
          padding: 0,
        }}
        aria-label="Delete signature"
      >
        ×
      </button>

      {/* Pro resize handle placeholder */}
      {isPro && (
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            right: -6,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#3b82f6',
            display: isHovered ? 'block' : 'none',
            zIndex: 10,
            cursor: 'nwse-resize',
          }}
        />
      )}
    </div>
  )
}
