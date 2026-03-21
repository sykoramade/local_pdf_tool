'use client'

import { useState, useRef, useEffect } from 'react'
import type { ExtractedTextItem, EditMap, FieldData } from '@/lib/pdf/types'
import { mapFont } from '@/lib/pdf/fonts/font-map'

interface PdfTextLayerProps {
  items: ExtractedTextItem[]
  editMap: EditMap
  onEdit: (id: string, fieldData: FieldData) => void
  onFieldSelect?: (id: string) => void
  scale: number
}

export default function PdfTextLayer({ items, editMap, onEdit, onFieldSelect, scale }: PdfTextLayerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  function handleBlur(id: string, value: string) {
    const item = items.find(i => i.id === id)
    if (!item) return

    const existing = editMap.get(id)

    // Don't record an edit if nothing actually changed
    if (!existing && value === item.str) { setActiveId(null); return }
    if (existing && value === existing.value) { setActiveId(null); return }

    const fieldData: FieldData = {
      value,
      family: existing?.family ?? 'Helvetica',
      size: existing?.size ?? item.canvasFontSize ?? 12,
      color: existing?.color ?? '#000000',
      bold: existing?.bold ?? false,
      italic: existing?.italic ?? false,
      underline: existing?.underline ?? false,
    }
    onEdit(id, fieldData)
    setActiveId(null)
  }

  return (
    <>
      {items.map(item => {
        if (!item.str.trim()) return null

        const fontMatch = mapFont(item.fontName)
        const isActive = activeId === item.id
        const currentText = editMap.get(item.id)?.value ?? item.str
        const isEdited = editMap.has(item.id) && editMap.get(item.id)?.value !== item.str

        // Minimum tap target height of 28px for mobile usability
        const tapHeight = Math.max(item.canvasFontSize * 1.2, 28)

        const style: React.CSSProperties = {
          position: 'absolute',
          left: item.canvasX,
          top: item.canvasY,
          minWidth: Math.max(item.canvasWidth, 24),
          height: tapHeight,
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
            role="button"
            tabIndex={0}
            aria-label={`Edit text: ${currentText}`}
            style={{
              ...style,
              color: isEdited ? '#1e1b4b' : 'transparent',
              backgroundColor: isEdited ? 'rgba(255,255,255,0.95)' : 'transparent',
              borderBottom: isEdited ? '1px solid rgba(79,70,229,0.4)' : 'none',
              userSelect: 'none',
            }}
            className="hover:bg-indigo-50/40 hover:border-b hover:border-indigo-300/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:rounded"
            title={isEdited ? `Edited: "${currentText}"` : 'Click to edit'}
            onClick={() => {
              setActiveId(item.id)
              onFieldSelect?.(item.id)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveId(item.id)
                onFieldSelect?.(item.id)
              }
            }}
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
