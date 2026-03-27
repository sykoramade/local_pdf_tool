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
}

const CanvasTextLayer = forwardRef<FabricLayerRef, CanvasTextLayerProps>(
  function CanvasTextLayer({ items, pageWidth, pageHeight, scale }, ref) {
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

    useEffect(() => {
      const el = canvasElRef.current
      if (!el) return

      let fc: FabricCanvas | null = null

      async function init() {
        const { Canvas, Rect, Textbox } = await import('fabric')
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
          const rect = new Rect({
            left: block.left,
            top: block.top,
            width: block.width,
            height: block.height,
            fill: 'transparent',
            stroke: 'rgba(99,102,241,0.35)',
            strokeWidth: 1,
            selectable: false,
            hoverCursor: 'pointer',
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(rect as any).data = { type: 'block-rect', block }
          fc.add(rect)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('mouse:over', (e: any) => {
          const obj = e.target
          if (!obj || obj.data?.type !== 'block-rect') return
          obj.set('fill', 'rgba(99,102,241,0.12)')
          fc!.renderAll()
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('mouse:out', (e: any) => {
          const obj = e.target
          if (!obj || obj.data?.type !== 'block-rect') return
          obj.set('fill', 'transparent')
          fc!.renderAll()
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('mouse:down', (e: any) => {
          const obj = e.target
          if (!obj || obj.data?.type !== 'block-rect') return

          const block = obj.data.block as Block
          fc!.remove(obj)

          const text = block.items.map(i => i.str).join(' ')

          // Use the item nearest the click X for font/size — more accurate than always taking items[0]
          const clickX = (e.pointer?.x ?? block.left) as number
          const anchor = block.items.reduce((closest, item) => {
            const itemMid = item.canvasX + item.canvasWidth / 2
            const closestMid = closest.canvasX + closest.canvasWidth / 2
            return Math.abs(itemMid - clickX) < Math.abs(closestMid - clickX) ? item : closest
          }, block.items[0])

          const fnLower = anchor.fontName.toLowerCase()
          const bold = /bold|black|heavy/.test(fnLower)
          const italic = /italic|oblique|slant/.test(fnLower)

          const tb = new Textbox(text, {
            left: block.left,
            top: block.top,
            width: Math.max(block.width, 20),
            fontSize: anchor.canvasFontSize,
            fontFamily: detectFontFamily(anchor.fontName),
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fill: '#000000',
            editable: true,
            selectable: true,
          })

          // Auto-grow width as user types
          tb.on('changed', function (this: typeof tb) {
            const newWidth = Math.max((this as any).calcTextWidth() + 8, block.width)
            this.set('width', newWidth)
            fc!.renderAll()
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(tb as any).data = {
            type: 'edited-text',
            originalItem: anchor,
            blockBounds: {
              left: block.left,
              top: block.top,
              width: block.width,
              height: block.height,
            },
          }

          fc!.add(tb)
          fc!.setActiveObject(tb)
          tb.enterEditing()
          fc!.renderAll()
        })

        fc.renderAll()
      }

      init()

      return () => {
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
