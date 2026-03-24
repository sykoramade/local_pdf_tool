'use client'

import { useState, useRef } from 'react'
import type { ImageEntry } from '@/lib/pdf/types'

interface ImageOverlayProps {
  image: ImageEntry
  onMove: (id: string, xPct: number, yPct: number) => void
  onDelete: (id: string) => void
}

export default function ImageOverlay({ image, onMove, onDelete }: ImageOverlayProps) {
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
  const lastPositionRef = useRef({ xPct: image.xPct, yPct: image.yPct })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      xPct: image.xPct,
      yPct: image.yPct,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current || !containerRef.current) return
      const parent = containerRef.current.parentElement
      if (!parent) return

      const rect = parent.getBoundingClientRect()
      const dx = moveEvent.clientX - dragStartRef.current.mouseX
      const dy = moveEvent.clientY - dragStartRef.current.mouseY

      const halfW = image.widthPct / 2
      const newXPct = Math.max(halfW, Math.min(100 - halfW, dragStartRef.current.xPct + (dx / rect.width) * 100))
      const newYPct = Math.max(0, Math.min(100, dragStartRef.current.yPct + (dy / rect.height) * 100))

      containerRef.current.style.left = newXPct + '%'
      containerRef.current.style.top = newYPct + '%'
      lastPositionRef.current = { xPct: newXPct, yPct: newYPct }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
      onMove(image.id, lastPositionRef.current.xPct, lastPositionRef.current.yPct)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(image.id)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: image.xPct + '%',
        top: image.yPct + '%',
        width: image.widthPct + '%',
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'move',
        userSelect: 'none',
        zIndex: 5,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.dataUrl}
        alt="inserted image"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          outline: isHovered ? '1.5px solid rgba(129,140,248,.6)' : 'none',
        }}
        draggable={false}
      />

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
        aria-label="Delete image"
      >
        ×
      </button>
    </div>
  )
}
