'use client'

import { useState, useRef } from 'react'
import type { StickyNote, CheckAnnotation } from '@/lib/pdf/types'

type MovableAnnotation = StickyNote | CheckAnnotation

interface AnnotationOverlayProps {
  annotation: MovableAnnotation
  onMove: (id: string, xPct: number, yPct: number) => void
  onDelete: (id: string) => void
}

export default function AnnotationOverlay({ annotation, onMove, onDelete }: AnnotationOverlayProps) {
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
  const lastPositionRef = useRef({ xPct: annotation.xPct, yPct: annotation.yPct })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      xPct: annotation.xPct,
      yPct: annotation.yPct,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current || !containerRef.current) return
      const parent = containerRef.current.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const dx = moveEvent.clientX - dragStartRef.current.mouseX
      const dy = moveEvent.clientY - dragStartRef.current.mouseY

      const newXPct = Math.max(0, Math.min(99, dragStartRef.current.xPct + (dx / rect.width) * 100))
      const newYPct = Math.max(0, Math.min(99, dragStartRef.current.yPct + (dy / rect.height) * 100))

      containerRef.current.style.left = newXPct + '%'
      containerRef.current.style.top = newYPct + '%'
      lastPositionRef.current = { xPct: newXPct, yPct: newYPct }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
      onMove(annotation.id, lastPositionRef.current.xPct, lastPositionRef.current.yPct)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(annotation.id)
  }

  const isNote = annotation.type === 'sticky-note'

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: annotation.xPct + '%',
        top: annotation.yPct + '%',
        cursor: isDragging ? 'grabbing' : 'move',
        userSelect: 'none',
        zIndex: 4,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isNote ? (
        <div
          style={{
            background: '#fff9c4',
            border: '1px solid rgba(0,0,0,.15)',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
            maxWidth: 180,
            boxShadow: '0 2px 6px rgba(0,0,0,.25)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            pointerEvents: 'none',
          }}
        >
          {(annotation as StickyNote).text || '📝'}
        </div>
      ) : (
        <div
          style={{
            fontSize: 18,
            lineHeight: 1,
            color: '#000000',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          ✓
        </div>
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
        aria-label="Delete annotation"
      >
        ×
      </button>
    </div>
  )
}
