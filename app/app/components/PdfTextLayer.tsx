'use client'

import { useState, useRef, useEffect } from 'react'
import type { ExtractedTextItem, EditMap } from '@/lib/pdf/types'
import { mapFont } from '@/lib/pdf/fonts/font-map'

interface PdfTextLayerProps {
  items: ExtractedTextItem[]
  editMap: EditMap
  onEdit: (id: string, text: string) => void
  scale: number
}

export default function PdfTextLayer({ items, editMap, onEdit, scale }: PdfTextLayerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  function handleBlur(id: string, value: string) {
    onEdit(id, value)
    setActiveId(null)
  }

  return (
    <>
      {items.map(item => {
        if (!item.str.trim()) return null

        const fontMatch = mapFont(item.fontName)
        const isActive = activeId === item.id
        const currentText = editMap.get(item.id) ?? item.str
        const isEdited = editMap.has(item.id) && editMap.get(item.id) !== item.str

        const style: React.CSSProperties = {
          position: 'absolute',
          left: item.canvasX,
          top: item.canvasY - item.canvasFontSize * 0.2, // small offset to align baseline
          minWidth: Math.max(item.canvasWidth, 4),
          height: item.canvasFontSize * 1.2,
          fontSize: item.canvasFontSize,
          fontFamily: fontMatch.cssFont,
          fontWeight: fontMatch.bold ? 'bold' : 'normal',
          fontStyle: fontMatch.italic ? 'italic' : 'normal',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          cursor: 'text',
          boxSizing: 'border-box',
        }

        if (isActive) {
          return (
            <EditInput
              key={item.id}
              id={item.id}
              defaultValue={currentText}
              style={style}
              onBlur={handleBlur}
              onEscape={() => setActiveId(null)}
            />
          )
        }

        return (
          <div
            key={item.id}
            style={{
              ...style,
              color: isEdited ? 'rgba(79,70,229,0.15)' : 'transparent',
              backgroundColor: isEdited ? 'rgba(79,70,229,0.08)' : 'transparent',
              borderBottom: isEdited ? '1px solid rgba(79,70,229,0.4)' : 'none',
              userSelect: 'none',
            }}
            className="hover:bg-indigo-50/40 hover:border-b hover:border-indigo-300/50 transition-colors"
            title={isEdited ? `Edited: "${currentText}"` : 'Click to edit'}
            onClick={() => setActiveId(item.id)}
          >
            {isEdited ? currentText : item.str}
          </div>
        )
      })}
    </>
  )
}

// Separate component so we can autofocus reliably
function EditInput({
  id,
  defaultValue,
  style,
  onBlur,
  onEscape,
}: {
  id: string
  defaultValue: string
  style: React.CSSProperties
  onBlur: (id: string, value: string) => void
  onEscape: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <input
      ref={ref}
      defaultValue={defaultValue}
      style={{
        ...style,
        color: '#1e1b4b',
        background: 'rgba(238,242,255,0.95)',
        border: '1.5px solid #6366f1',
        borderRadius: 2,
        outline: 'none',
        padding: '0 2px',
      }}
      onBlur={e => onBlur(id, e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') { onEscape(); e.preventDefault() }
      }}
    />
  )
}
