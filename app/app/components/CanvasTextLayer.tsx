'use client'

/**
 * CanvasTextLayer — Fabric.js canvas overlay for block-based PDF text editing.
 *
 * Renders one transparent Fabric canvas per PDF page. Detects text blocks via
 * Y-band + X-gap grouping (mirrors PdfTextLayer groupLines algorithm), places
 * invisible hit-target Rects, and converts clicked blocks to editable Textboxes.
 *
 * Exposes getTextboxes() via FabricLayerRef for canvas-save.ts to collect edits.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import type { Canvas as FabricCanvas } from 'fabric'
import type { ExtractedTextItem, FabricLayerRef, FabricTextboxExport } from '@/lib/pdf/types'

// ─── Block detection ─────────────────────────────────────────────────────────

interface Block {
  items: ExtractedTextItem[]
  left: number
  top: number
  width: number
  height: number
}

function buildBlock(items: ExtractedTextItem[]): Block {
  const left = Math.min(...items.map(i => i.canvasX))
  const top = Math.min(...items.map(i => i.canvasY))
  const right = Math.max(...items.map(i => i.canvasX + i.canvasWidth))
  const bottom = Math.max(...items.map(i => i.canvasY + i.canvasFontSize * 1.3))
  return { items, left, top, width: right - left, height: bottom - top }
}

function detectBlocks(items: ExtractedTextItem[]): Block[] {
  if (items.length === 0) return []

  const sorted = [...items].sort((a, b) =>
    a.canvasY !== b.canvasY ? a.canvasY - b.canvasY : a.canvasX - b.canvasX
  )

  // Phase 1: Y-band grouping (tolerance = fontSize * 0.6, matches PdfTextLayer)
  const yBands: ExtractedTextItem[][] = []
  for (const item of sorted) {
    const tol = item.canvasFontSize * 0.6
    const last = yBands[yBands.length - 1]
    if (last && Math.abs(item.canvasY - last[0].canvasY) <= tol) {
      last.push(item)
    } else {
      yBands.push([item])
    }
  }

  // Phase 2: X-gap splitting (gap > fontSize * 0.8 → separate table cell block)
  const blocks: Block[] = []
  for (const band of yBands) {
    const bSorted = [...band].sort((a, b) => a.canvasX - b.canvasX)
    let current = [bSorted[0]]
    for (let i = 1; i < bSorted.length; i++) {
      const prev = current[current.length - 1]
      const next = bSorted[i]
      const gap = next.canvasX - (prev.canvasX + prev.canvasWidth)
      if (gap > prev.canvasFontSize * 0.8) {
        blocks.push(buildBlock(current))
        current = [next]
      } else {
        current.push(next)
      }
    }
    blocks.push(buildBlock(current))
  }

  return blocks
}

function detectFontFamily(fontName: string): string {
  const f = fontName.toLowerCase()
  if (/times|roman|minion|garamond|palatino|georgia/.test(f)) return 'Times New Roman'
  if (/courier|mono|typewriter/.test(f)) return 'Courier New'
  return 'Helvetica'
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CanvasTextLayerProps {
  items: ExtractedTextItem[]
  pageWidth: number
  pageHeight: number
  scale: number
  searchQuery?: string
}

const CanvasTextLayer = forwardRef<FabricLayerRef, CanvasTextLayerProps>(
  function CanvasTextLayer({ items, pageWidth, pageHeight, scale, searchQuery }, ref) {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<FabricCanvas | null>(null)

    useImperativeHandle(ref, () => ({
      getTextboxes(): FabricTextboxExport[] {
        const fc = fabricRef.current
        if (!fc) return []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (fc.getObjects() as any[])
          .filter(o => o.data?.type === 'edited-text')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((tb: any) => ({
            text: (tb.text ?? '') as string,
            anchorItem: tb.data.originalItem as ExtractedTextItem,
            blockBounds: tb.data.blockBounds as FabricTextboxExport['blockBounds'],
            fontSize: (tb.fontSize ?? 12) as number,
            fontFamily: (tb.fontFamily ?? 'Helvetica') as string,
            fontWeight: (tb.fontWeight ?? 'normal') as string,
            fontStyle: (tb.fontStyle ?? 'normal') as string,
            fill: (typeof tb.fill === 'string' ? tb.fill : '#000000') as string,
          }))
      },
    }), [])

    // Search highlight effect — runs when searchQuery changes
    useEffect(() => {
      const fc = fabricRef.current
      if (!fc) return
      const canvas = fc // captured non-null reference for async use

      async function updateHighlights() {
        const { Rect } = await import('fabric')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const old = (canvas.getObjects() as any[]).filter(o => o.data?.type === 'search-highlight')
        old.forEach(o => canvas.remove(o as Parameters<typeof canvas.remove>[0]))
        if (!searchQuery || searchQuery.length < 2) { canvas.renderAll(); return }
        const q = searchQuery.toLowerCase()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(canvas.getObjects() as any[])
          .filter(o => o.data?.type === 'edited-text' && (o.text ?? '').toLowerCase().includes(q))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .forEach((o: any) => {
            const rect = new Rect({
              left: o.left as number,
              top: o.top as number,
              width: (o.width as number) || 40,
              height: (o.height as number) || (o.fontSize as number) * 1.4,
              fill: 'rgba(251,191,36,0.3)',
              stroke: 'rgba(251,191,36,0.7)',
              strokeWidth: 1,
              selectable: false,
              evented: false,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(rect as any).data = { type: 'search-highlight' }
            canvas.add(rect)
            canvas.sendObjectToBack(rect)
          })
        canvas.renderAll()
      }

      updateHighlights()
    }, [searchQuery])

    useEffect(() => {
      const el = canvasElRef.current
      if (!el) return

      let fc: FabricCanvas | null = null

      // Ctrl+L/E/R text alignment when an IText is actively being edited
      const handleKeydown = (e: KeyboardEvent) => {
        if (!(e.ctrlKey || e.metaKey)) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const active = fabricRef.current?.getActiveObject() as any
        if (!active || active.type !== 'i-text' || !active.isEditing) return
        if (e.key === 'l' || e.key === 'L') {
          e.preventDefault()
          active.set('textAlign', 'left')
          fabricRef.current?.renderAll()
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault()
          active.set('textAlign', 'center')
          fabricRef.current?.renderAll()
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault()
          active.set('textAlign', 'right')
          fabricRef.current?.renderAll()
        }
      }
      window.addEventListener('keydown', handleKeydown)

      async function init() {
        const { Canvas, IText } = await import('fabric')
        if (!canvasElRef.current) return

        fc = new Canvas(el!, {
          width: pageWidth,
          height: pageHeight,
          selection: true,
          selectionColor: 'rgba(99,102,241,0.08)',
          selectionBorderColor: '#818cf8',
          selectionLineWidth: 1,
          renderOnAddRemove: false,
        }) as FabricCanvas
        fabricRef.current = fc

        const blocks = detectBlocks(items)

        for (const block of blocks) {
          const text = block.items.map(i => i.str).join(' ')

          // Use the item nearest the center X for font/size (more representative than items[0])
          const centerX = block.left + block.width / 2
          const anchor = block.items.reduce((closest, item) => {
            const itemMid = item.canvasX + item.canvasWidth / 2
            const closestMid = closest.canvasX + closest.canvasWidth / 2
            return Math.abs(itemMid - centerX) < Math.abs(closestMid - centerX) ? item : closest
          }, block.items[0])

          const fnLower = anchor.fontName.toLowerCase()
          const bold = /bold|black|heavy/.test(fnLower)
          const italic = /italic|oblique|slant/.test(fnLower)

          // Create IText with opacity:0.001 for invisible hit zone (not 0 — Fabric v6 skips hit detection for true-zero opacity)
          const itext = new IText(text, {
            left: block.left,
            top: block.top,
            width: Math.max(block.width, 20),
            fontSize: anchor.canvasFontSize,
            fontFamily: detectFontFamily(anchor.fontName),
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fill: '#000000',
            opacity: 0.001, // invisible hit zone
            editable: false,
            selectable: false,
            hoverCursor: 'text',
            underline: true, // discoverability signal
            stroke: 'rgba(99,102,241,0.25)', // underline color
          })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(itext as any).data = {
            type: 'edited-text',
            originalItem: anchor,
            blockBounds: {
              left: block.left,
              top: block.top,
              width: block.width,
              height: block.height,
            },
          }

          fc.add(itext)
        }

        // Handle IText activation on click
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('mouse:down', (e: any) => {
          const obj = e.target
          if (!obj || obj.type !== 'i-text' || obj.data?.type !== 'edited-text') return

          // Activate inline editing
          obj.set({ opacity: 1, editable: true, selectable: true })
          fc!.setActiveObject(obj)
          obj.enterEditing()

          // Auto-grow width as user types
          obj.on('changed', function (this: typeof obj) {
            const newWidth = Math.max((this as any).calcTextWidth() + 8, obj.data.blockBounds.width)
            this.set('width', newWidth)
            fc!.renderAll()
          })

          fc!.renderAll()
        })

        // Handle deactivation on selection:cleared (click outside any object)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('selection:cleared', () => {
          fc!.forEachObject((obj: any) => {
            if (obj.type === 'i-text' && obj.data?.type === 'edited-text') {
              obj.set({ opacity: 0.001, editable: false, selectable: false })
            }
          })
          fc!.renderAll()
        })

        fc.renderAll()
      }

      init()

      return () => {
        window.removeEventListener('keydown', handleKeydown)
        try {
          fc?.dispose()
        } catch {
          // suppress dispose errors on fast unmount
        }
        fabricRef.current = null
      }
    }, [items, pageWidth, pageHeight, scale])

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: pageWidth,
          height: pageHeight,
          pointerEvents: 'all',
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    )
  }
)

export default CanvasTextLayer
