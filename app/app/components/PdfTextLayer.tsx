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
  annotateMode?: 'yellow' | 'green' | 'pink' | null
  onHighlight?: (item: ExtractedTextItem) => void
}

interface LineGroup {
  items: ExtractedTextItem[]
  anchorId: string
}

/**
 * Group text items into lines by Y-proximity.
 * Items within `canvasFontSize * 0.6` of the group's first item Y are on the same line.
 * Items are sorted left-to-right within each line.
 */
function groupLines(items: ExtractedTextItem[]): LineGroup[] {
  if (items.length === 0) return []

  const sorted = [...items].sort((a, b) =>
    a.canvasY !== b.canvasY ? a.canvasY - b.canvasY : a.canvasX - b.canvasX
  )

  const groups: LineGroup[] = []

  for (const item of sorted) {
    const last = groups[groups.length - 1]
    const tolerance = item.canvasFontSize * 0.6

    if (last && Math.abs(item.canvasY - last.items[0].canvasY) <= tolerance) {
      last.items.push(item)
    } else {
      groups.push({ items: [item], anchorId: item.id })
    }
  }

  return groups
}

export default function PdfTextLayer({
  items,
  editMap,
  onEdit,
  onFieldSelect,
  scale,
  annotateMode,
  onHighlight,
}: PdfTextLayerProps) {
  // activeId = anchorId of the active line group (first item in that group)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Build line groups (memoised by reference equality of items is good enough here)
  const lineGroups = groupLines(items.filter(i => i.str.trim()))

  // Quick lookup: item.id → its line group
  const itemToGroup = new Map<string, LineGroup>()
  for (const group of lineGroups) {
    for (const item of group.items) {
      itemToGroup.set(item.id, group)
    }
  }

  const activeGroup = activeId
    ? lineGroups.find(g => g.anchorId === activeId) ?? null
    : null

  function handleLineBlur(group: LineGroup, value: string) {
    const anchor = group.items[0]
    const existing = editMap.get(anchor.id)

    // Check if value actually changed
    const currentValue = group.items
      .map(i => editMap.get(i.id)?.value ?? i.str)
      .join('')
    if (value === currentValue) {
      setActiveId(null)
      return
    }

    const fontMatch = mapFont(anchor.fontName)

    // First item carries the full replacement value
    onEdit(anchor.id, {
      value,
      family: existing?.family ?? 'Helvetica',
      size: existing?.size ?? anchor.canvasFontSize ?? 12,
      color: existing?.color ?? '#000000',
      bold: existing?.bold ?? fontMatch.bold,
      italic: existing?.italic ?? fontMatch.italic,
      underline: existing?.underline ?? false,
    })

    // Remaining items in the group are cleared so they don't produce orphan text
    for (const item of group.items.slice(1)) {
      const itemExisting = editMap.get(item.id)
      const itemFont = mapFont(item.fontName)
      onEdit(item.id, {
        value: '',
        family: itemExisting?.family ?? 'Helvetica',
        size: itemExisting?.size ?? item.canvasFontSize ?? 12,
        color: itemExisting?.color ?? '#000000',
        bold: itemExisting?.bold ?? itemFont.bold,
        italic: itemExisting?.italic ?? itemFont.italic,
        underline: itemExisting?.underline ?? false,
      })
    }

    setActiveId(null)
  }

  // Compute bounding box for a line group
  function groupBounds(group: LineGroup) {
    const xs = group.items.map(i => i.canvasX)
    const xe = group.items.map(i => i.canvasX + Math.max(i.canvasWidth, 24))
    const left = Math.min(...xs)
    const right = Math.max(...xe)
    const top = Math.min(...group.items.map(i => i.canvasY))
    const anchor = group.items[0]
    const tapHeight = Math.max(anchor.canvasFontSize * 1.2, 28)
    return { left, top, width: right - left, tapHeight, anchor }
  }

  return (
    <>
      {lineGroups.map(group => {
        const { left, top, width, tapHeight, anchor } = groupBounds(group)
        const fontMatch = mapFont(anchor.fontName)
        const isActive = activeId === group.anchorId

        if (isActive) {
          const currentValue = group.items
            .map(i => editMap.get(i.id)?.value ?? i.str)
            .join('')

          return (
            <LineEditInput
              key={group.anchorId}
              defaultValue={currentValue}
              style={{
                position: 'absolute',
                left,
                top,
                width: Math.max(width, 80),
                height: tapHeight,
                fontSize: anchor.canvasFontSize,
                fontFamily: fontMatch.cssFont,
                fontWeight: fontMatch.bold ? 'bold' : 'normal',
                fontStyle: fontMatch.italic ? 'italic' : 'normal',
                lineHeight: 1,
                boxSizing: 'border-box',
                color: '#1e1b4b',
                background: 'rgba(238,242,255,0.95)',
                border: '1.5px solid #6366f1',
                borderRadius: 2,
                outline: 'none',
                padding: '0 2px',
                resize: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onBlur={value => handleLineBlur(group, value)}
              onEscape={() => setActiveId(null)}
            />
          )
        }

        // Inactive: render each item individually so per-item edit badges show
        return group.items.map(item => {
          const itemFontMatch = mapFont(item.fontName)
          const isEdited =
            editMap.has(item.id) && editMap.get(item.id)?.value !== item.str
          const currentText = editMap.get(item.id)?.value ?? item.str
          const itemTapHeight = Math.max(item.canvasFontSize * 1.2, 28)

          const style: React.CSSProperties = {
            position: 'absolute',
            left: item.canvasX,
            top: item.canvasY,
            minWidth: Math.max(item.canvasWidth, 24),
            height: itemTapHeight,
            fontSize: item.canvasFontSize,
            fontFamily: itemFontMatch.cssFont,
            fontWeight: itemFontMatch.bold ? 'bold' : 'normal',
            fontStyle: itemFontMatch.italic ? 'italic' : 'normal',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            cursor: annotateMode ? 'crosshair' : 'text',
            boxSizing: 'border-box',
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
                backgroundColor: isEdited
                  ? 'rgba(255,255,255,0.95)'
                  : 'transparent',
                borderBottom: isEdited
                  ? '2px solid rgba(79,70,229,0.7)'
                  : '1px solid rgba(99,102,241,0.25)',
                userSelect: 'none',
              }}
              className="hover:bg-indigo-100/60 hover:border-b-2 hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:rounded"
              title={isEdited ? `Edited: "${currentText}"` : 'Click to edit'}
              onClick={() => {
                if (
                  annotateMode === 'yellow' ||
                  annotateMode === 'green' ||
                  annotateMode === 'pink'
                ) {
                  onHighlight?.(item)
                  return
                }
                const group = itemToGroup.get(item.id)
                if (!group) return
                setActiveId(group.anchorId)
                onFieldSelect?.(group.anchorId)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (
                    annotateMode === 'yellow' ||
                    annotateMode === 'green' ||
                    annotateMode === 'pink'
                  ) {
                    onHighlight?.(item)
                    return
                  }
                  const group = itemToGroup.get(item.id)
                  if (!group) return
                  setActiveId(group.anchorId)
                  onFieldSelect?.(group.anchorId)
                }
              }}
            >
              {isEdited ? currentText : item.str}
            </div>
          )
        })
      })}
    </>
  )
}

// Separate component so we can autofocus reliably
function LineEditInput({
  defaultValue,
  style,
  onBlur,
  onEscape,
}: {
  defaultValue: string
  style: React.CSSProperties
  onBlur: (value: string) => void
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
      style={style}
      onBlur={e => onBlur(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          onEscape()
          e.preventDefault()
        }
      }}
    />
  )
}
