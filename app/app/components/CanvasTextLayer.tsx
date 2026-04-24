'use client'

/**
 * CanvasTextLayer — Fabric.js canvas overlay for block-based PDF text editing.
 *
 * Interaction model (S36):
 *   select mode → canvas is passive, no text interaction
 *   text mode   → 1st click: white occluder + enterEditing() + selectAll() via rAF
 *                  2nd click: cursor placed at pointer position
 *                  Escape → dormant; Click away → dormant
 *
 * Z-order within Fabric canvas (bottom → top):
 *   [0] white occluder  — covers PDF-rendered text at block bounds
 *   [1..N] IText objects — text rendered on top of occluder
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import type { Canvas as FabricCanvas } from 'fabric'
import type { ExtractedTextItem, FabricLayerRef, FabricTextboxExport, CommittedEdit } from '@/lib/pdf/types'

// ─── Undo/Redo types ──────────────────────────────────────────────────────
type UndoItem =
  | { kind: 'text'; blockKey: string; before: string; after: string }
  | { kind: 'move'; blockKey: string; bLeft: number; bTop: number; aLeft: number; aTop: number }

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

  // Phase 1: Y-band grouping (tolerance = fontSize * 0.6)
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

// Sample PDF canvas background color at a given pixel position.
// Falls back to white if the canvas is unavailable or tainted.
function sampleBgColor(cvs: HTMLCanvasElement | null | undefined, x: number, y: number): string {
  try {
    if (!cvs) return '#ffffff'
    const ctx = cvs.getContext('2d')
    if (!ctx) return '#ffffff'
    const px = Math.max(0, Math.min(Math.round(x), cvs.width - 1))
    const py = Math.max(0, Math.min(Math.round(y), cvs.height - 1))
    const d = ctx.getImageData(px, py, 1, 1).data
    return `rgb(${d[0]},${d[1]},${d[2]})`
  } catch {
    return '#ffffff'
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CanvasTextLayerProps {
  items: ExtractedTextItem[]
  pageWidth: number
  pageHeight: number
  scale: number
  searchQuery?: string
  editMode?: 'select' | 'text'
  committedEdits?: Map<string, CommittedEdit>
  onCommit?: (blockKey: string, edit: CommittedEdit) => void
  pdfCanvas?: HTMLCanvasElement | null
}

// ─── Component ───────────────────────────────────────────────────────────────

const CanvasTextLayer = forwardRef<FabricLayerRef, CanvasTextLayerProps>(
  function CanvasTextLayer({ items, pageWidth, pageHeight, searchQuery, editMode, committedEdits, onCommit, pdfCanvas }, ref) {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<FabricCanvas | null>(null)

    // editMode ref — synced without triggering canvas re-init
    const editModeRef = useRef<'select' | 'text'>(editMode ?? 'text')
    // committedEdits ref — only read at canvas init time (when component mounts)
    const committedEditsRef = useRef(committedEdits)
    // onCommit ref — always points to latest version (called from event handlers)
    const onCommitRef = useRef(onCommit)

    // pdfCanvas ref — kept current for color sampling without re-triggering init
    const pdfCanvasRef = useRef(pdfCanvas)
    useEffect(() => { pdfCanvasRef.current = pdfCanvas }, [pdfCanvas])

    // Selection state refs — read/written in Fabric event handlers (no re-render needed)
    const selectedBlockKeyRef = useRef<string | null>(null)
    const occluderRectRef = useRef<object | null>(null)    // white rect covers PDF text while editing
    const hoverRectRef = useRef<object | null>(null)       // kept for clearSelectionState compat

    // Undo/Redo stacks — capped at 50 entries
    const undoStackRef = useRef<UndoItem[]>([])
    const redoStackRef = useRef<UndoItem[]>([])
    // Pre-edit state for text: saved on text:editing:entered
    const preEditTextRef = useRef<{ blockKey: string; text: string } | null>(null)
    // Pre-move state: saved on mouse:down before dragging
    const prePositionRef = useRef<{ blockKey: string; left: number; top: number } | null>(null)
    // Rect class cached from import for redo occluder creation
    const rectClassRef = useRef<typeof import('fabric').Rect | null>(null)

    // Sync editMode prop to ref without triggering canvas re-init
    useEffect(() => {
      editModeRef.current = editMode ?? 'text'
    }, [editMode])

    // Sync onCommit prop to ref so event handlers always call the latest version
    useEffect(() => {
      onCommitRef.current = onCommit
    }, [onCommit])

    useImperativeHandle(ref, () => ({
      getTextboxes(): FabricTextboxExport[] {
        const fc = fabricRef.current
        if (!fc) return []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (fc.getObjects() as any[])
          // Only export blocks where text actually changed from the original PDF text
          .filter(o => o.data?.type === 'edited-text' && o.text !== o.data?.originalText)
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
      const canvas = fc

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

      let cancelled = false
      let fc: FabricCanvas | null = null

      // ── Helper: full reset to dormant state ─────────────────────────────────
      // Committed blocks (text changed from original) keep their occluder + opacity=1.
      function clearSelectionState(canvas: FabricCanvas) {
        if (hoverRectRef.current) {
          canvas.remove(hoverRectRef.current as Parameters<typeof canvas.remove>[0])
          hoverRectRef.current = null
        }
        if (occluderRectRef.current) {
          canvas.remove(occluderRectRef.current as Parameters<typeof canvas.remove>[0])
          occluderRectRef.current = null
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.forEachObject((obj: any) => {
          if (obj.type === 'i-text' && obj.data?.type === 'edited-text') {
            // Skip committed blocks — they have a persistent occluder and must stay visible
            if (obj.data.committedOccluder) return
            obj.set({ opacity: 0.001, editable: false, selectable: false })
          }
        })
        selectedBlockKeyRef.current = null
        canvas.discardActiveObject()
        canvas.renderAll()
      }

      // ── Keyboard shortcuts + Undo/Redo ──────────────────────────────────────
      const handleKeydown = (e: KeyboardEvent) => {
        // Escape while in selection state (not editing) → go dormant.
        // Escape while editing → Fabric handles it natively; text:editing:exited restores selection.
        if (e.key === 'Escape') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const active = fabricRef.current?.getActiveObject() as any
          if (!active?.isEditing && selectedBlockKeyRef.current !== null) {
            e.preventDefault()
            clearSelectionState(fabricRef.current!)
          }
          return
        }

        // Undo: Ctrl+Z (not while IText is in edit mode — let Fabric handle per-char undo)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const active = fabricRef.current?.getActiveObject() as any
          if (active?.type === 'i-text' && active.isEditing) {
            // Fabric handles per-char undo internally
            return
          }
          // Check if active element is an input/textarea
          if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
            return
          }
          e.preventDefault()
          e.stopPropagation()
          applyUndo()
          return
        }

        // Redo: Ctrl+Shift+Z
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && e.shiftKey) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const active = fabricRef.current?.getActiveObject() as any
          if (active?.type === 'i-text' && active.isEditing) {
            // Fabric handles per-char undo internally
            return
          }
          // Check if active element is an input/textarea
          if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
            return
          }
          e.preventDefault()
          e.stopPropagation()
          applyRedo()
          return
        }

        // Ctrl+L/E/R text alignment — only while IText is in edit mode
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

      // Apply an undo item: restore canvas state
      const applyUndo = () => {
        if (undoStackRef.current.length === 0) return
        const item = undoStackRef.current.pop()!
        redoStackRef.current.push(item)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc?.forEachObject((o: any) => {
          if (o.data?.blockKey === item.blockKey && o.data?.type === 'edited-text') obj = o
        })
        if (!obj) return

        if (item.kind === 'text') {
          // Restore text
          obj.set({ text: item.before })
          if (item.before === obj.data.originalText) {
            // Text reverted to original — remove occluder, set dormant
            if (obj.data.committedOccluder) {
              fc!.remove(obj.data.committedOccluder)
              obj.data.committedOccluder = null
            }
            obj.set({ opacity: 0.001, editable: false, selectable: false })
          } else {
            // Text still modified — keep visible (edge case)
            obj.set({ opacity: 1 })
          }
        } else if (item.kind === 'move') {
          // Restore IText to pre-move position.
          // The occluder stays at the original block position (covers original PDF text — never moves).
          obj.set({ left: item.bLeft, top: item.bTop })
        }
        fc?.renderAll()
      }

      // Apply a redo item: restore canvas state from redo stack
      const applyRedo = () => {
        if (redoStackRef.current.length === 0) return
        const item = redoStackRef.current.pop()!
        undoStackRef.current.push(item)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc?.forEachObject((o: any) => {
          if (o.data?.blockKey === item.blockKey && o.data?.type === 'edited-text') obj = o
        })
        if (!obj) return

        if (item.kind === 'text') {
          // Restore text to "after" state
          obj.set({ text: item.after })
          if (item.after === obj.data.originalText) {
            // Text reverted to original — remove occluder, set dormant
            if (obj.data.committedOccluder) {
              fc!.remove(obj.data.committedOccluder)
              obj.data.committedOccluder = null
            }
            obj.set({ opacity: 0.001, editable: false, selectable: false })
          } else {
            // Text modified — keep visible; create occluder if missing
            const RectClass = rectClassRef.current
            if (!obj.data.committedOccluder && RectClass) {
              const bounds = obj.data.blockBounds as { left: number; top: number; width: number; height: number }
              const occ = new RectClass({
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height,
                fill: sampleBgColor(pdfCanvasRef.current, bounds.left, bounds.top),
                strokeWidth: 0,
                selectable: false,
                evented: false,
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(occ as any).data = { type: 'edit-occluder' }
              fc!.add(occ)
              fc!.sendObjectToBack(occ)
              obj.data.committedOccluder = occ
            }
            obj.set({ opacity: 1 })
          }
        } else if (item.kind === 'move') {
          // Restore IText to "after" position.
          // The occluder stays at the original block position (covers original PDF text — never moves).
          obj.set({ left: item.aLeft, top: item.aTop })
        }
        fc?.renderAll()
      }

      async function init() {
        const { Canvas, IText, Rect } = await import('fabric')
        if (cancelled || !canvasElRef.current) return

        rectClassRef.current = Rect

        fc = new Canvas(el!, {
          width: pageWidth,
          height: pageHeight,
          selection: false, // no rubber-band selection — we manage selection ourselves
          renderOnAddRemove: false,
        }) as FabricCanvas
        fabricRef.current = fc

        const blocks = detectBlocks(items)

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i]
          const text = block.items.map(item => item.str).join(' ')
          const blockKey = `block_${i}`

          // Use the item nearest the block's center X for font/size metadata
          const centerX = block.left + block.width / 2
          const anchor = block.items.reduce((closest, item) => {
            const itemMid = item.canvasX + item.canvasWidth / 2
            const closestMid = closest.canvasX + closest.canvasWidth / 2
            return Math.abs(itemMid - centerX) < Math.abs(closestMid - centerX) ? item : closest
          }, block.items[0])

          const fnLower = anchor.fontName.toLowerCase()
          const bold = /bold|black|heavy/.test(fnLower)
          const italic = /italic|oblique|slant/.test(fnLower)
          const detectedFamily = detectFontFamily(anchor.fontName)
          const fontDetected = detectedFamily !== 'Helvetica'

          const itext = new IText(text, {
            left: block.left,
            top: block.top,
            width: Math.max(block.width, 20),
            fontSize: anchor.canvasFontSize,
            fontFamily: detectedFamily,
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fill: '#000000',
            opacity: 0.001,
            editable: false,
            selectable: false,
            hoverCursor: 'text',
            // Suppress all Fabric object-manipulation chrome
            hasControls: false,
            hasBorders: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
          })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(itext as any).data = {
            type: 'edited-text',
            blockKey,
            fontDetected,
            detectedFamily,
            originalItem: anchor,
            originalText: text,          // used to detect committed edits on exit
            committedOccluder: null,      // set when edit exits with changed text; keeps block visible
            blockBounds: {
              left: block.left,
              top: block.top,
              width: block.width,
              height: block.height,
            },
          }

          // Rehydrate committed edit from before last unmount (tool switch)
          const committed = committedEditsRef.current?.get(blockKey)
          if (committed) {
            itext.set({
              text: committed.text,
              fontSize: committed.fontSize,
              fontFamily: committed.fontFamily,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fontWeight: committed.fontWeight as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fontStyle: committed.fontStyle as any,
              fill: committed.fill,
              opacity: 1,
            })
            const rehydratedOccluder = new Rect({
              left: block.left,
              top: block.top,
              width: block.width,
              height: block.height,
              fill: sampleBgColor(pdfCanvasRef.current, block.left, block.top),
              strokeWidth: 0,
              selectable: false,
              evented: false,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(rehydratedOccluder as any).data = { type: 'edit-occluder' }
            fc!.add(rehydratedOccluder)
            fc!.sendObjectToBack(rehydratedOccluder)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(itext as any).data.committedOccluder = rehydratedOccluder
          }

          // Auto-grow width on typing — registered once at init, not on every click
          itext.on('changed', function (this: typeof itext) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const self = this as any
            const newWidth = Math.max(self.calcTextWidth() + 8, self.data.blockBounds.width)
            self.set('width', newWidth)
            fc!.renderAll()
          })

          fc.add(itext)
        }

        // ── Single-click → immediate editing ─────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.on('mouse:down', (e: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = e.target as any

          // Capture pre-position for move undo — must happen before select-mode early return
          // so that drags initiated in Select mode (Fix 3) are also tracked
          if (obj && obj.type === 'i-text' && obj.data?.type === 'edited-text') {
            prePositionRef.current = {
              blockKey: obj.data.blockKey as string,
              left: obj.left as number,
              top: obj.top as number,
            }
          }

          // Select mode — canvas is passive for text interaction
          if (editModeRef.current === 'select') return

          if (!obj || obj.type !== 'i-text' || obj.data?.type !== 'edited-text') {
            // Clicked empty canvas → dormant (committed blocks stay visible)
            if (selectedBlockKeyRef.current !== null) {
              clearSelectionState(fc!)
            }
            return
          }

          // Already editing this block — place cursor at click position (not selectAll)
          if (obj.isEditing) {
            obj.setCursorByClick(e.e)
            fc!.renderAll()
            return
          }

          const blockKey = obj.data.blockKey as string
          // Is this a committed block being re-clicked?
          const isCommitted = !!obj.data.committedOccluder

          // Clear hover rect
          if (hoverRectRef.current) {
            fc!.remove(hoverRectRef.current as any)
            hoverRectRef.current = null
          }

          // Clear any previous active session's occluder (skip if re-editing committed block's own occluder)
          if (occluderRectRef.current) {
            fc!.remove(occluderRectRef.current as any)
            occluderRectRef.current = null
          }

          // Reset other non-committed IText objects to dormant
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fc!.forEachObject((o: any) => {
            if (o.type === 'i-text' && o.data?.type === 'edited-text' && o.data.blockKey !== blockKey) {
              if (!o.data.committedOccluder) {
                o.set({ opacity: 0.001, editable: false, selectable: false })
              }
            }
          })

          selectedBlockKeyRef.current = blockKey

          if (isCommitted) {
            // Re-editing a committed block: reuse its existing occluder (already on canvas)
            occluderRectRef.current = obj.data.committedOccluder
            obj.data.committedOccluder = null // transfer ownership back to ref
          } else {
            // Fresh edit: create a new occluder sampled from the PDF canvas background
            const bounds = obj.data.blockBounds as Block
            const occluder = new Rect({
              left: bounds.left,
              top: bounds.top,
              width: bounds.width,
              height: bounds.height,
              fill: sampleBgColor(pdfCanvasRef.current, bounds.left, bounds.top),
              strokeWidth: 0,
              selectable: false,
              evented: false,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(occluder as any).data = { type: 'edit-occluder' }
            fc!.add(occluder)
            fc!.sendObjectToBack(occluder)
            occluderRectRef.current = occluder
          }

          // Make IText visible and enter editing immediately
          obj.set({ opacity: 1, selectable: true, editable: true })
          fc!.setActiveObject(obj)
          obj.enterEditing()
          fc!.renderAll()
          // Bug 4 fix: defer selectAll to after mouse:up so Fabric doesn't override it with cursor placement
          requestAnimationFrame(() => {
            if (obj.isEditing) {
              obj.selectAll()
              fc!.renderAll()
            }
          })
        })

        // ── Text editing started: capture pre-edit text for undo ──────────────
        fc.on('text:editing:entered', () => {
          const obj = fc!.getActiveObject()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itext = obj as any
          if (itext && itext.type === 'i-text' && itext.data?.type === 'edited-text') {
            preEditTextRef.current = {
              blockKey: itext.data.blockKey as string,
              text: (itext.text ?? '') as string,
            }
          }
        })

        // ── Object modified: push move to undo stack if position changed ─────
        fc.on('object:modified', (e: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const o = e.target as any
          if (!o || o.type !== 'i-text' || o.data?.type !== 'edited-text') return
          if (!prePositionRef.current) return

          const blockKey = o.data.blockKey as string
          const newLeft = o.left as number
          const newTop = o.top as number
          const prevLeft = prePositionRef.current.left
          const prevTop = prePositionRef.current.top

          // Only push if position actually changed
          if (newLeft !== prevLeft || newTop !== prevTop) {
            const item: UndoItem = {
              kind: 'move',
              blockKey,
              bLeft: prevLeft,
              bTop: prevTop,
              aLeft: newLeft,
              aTop: newTop,
            }
            undoStackRef.current.push(item)
            if (undoStackRef.current.length > 50) undoStackRef.current.shift()
            redoStackRef.current = [] // Clear redo stack on new action
          }
          prePositionRef.current = null
        })

        // ── Edit exited: commit if text changed, else go dormant ─────────────
        fc.on('text:editing:exited', () => {
          const blockKey = selectedBlockKeyRef.current
          if (blockKey === null) return

          // Find the IText for the block that just exited editing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let editedObj: any = null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fc!.forEachObject((o: any) => {
            if (o.data?.blockKey === blockKey && o.data?.type === 'edited-text') editedObj = o
          })

          if (editedObj && editedObj.text !== editedObj.data.originalText) {
            // Text was changed — commit: keep occluder + IText visible
            editedObj.set({ opacity: 1, editable: false, selectable: false })
            // Transfer occluder ownership to IText.data so it persists across dormant state
            if (occluderRectRef.current) {
              editedObj.data.committedOccluder = occluderRectRef.current
              occluderRectRef.current = null
            }
            if (hoverRectRef.current) {
              fc!.remove(hoverRectRef.current as any)
              hoverRectRef.current = null
            }
            // Push text edit to undo stack
            if (preEditTextRef.current && preEditTextRef.current.blockKey === blockKey) {
              const item: UndoItem = {
                kind: 'text',
                blockKey,
                before: preEditTextRef.current.text,
                after: editedObj.text as string,
              }
              undoStackRef.current.push(item)
              if (undoStackRef.current.length > 50) undoStackRef.current.shift()
              redoStackRef.current = [] // Clear redo stack on new action
              preEditTextRef.current = null
            }
            // Persist committed edit so it survives tool switches (CanvasTextLayer unmount)
            onCommitRef.current?.(blockKey, {
              text: editedObj.text as string,
              fontSize: editedObj.fontSize as number,
              fontFamily: editedObj.fontFamily as string,
              fontWeight: editedObj.fontWeight as string,
              fontStyle: editedObj.fontStyle as string,
              fill: typeof editedObj.fill === 'string' ? editedObj.fill : '#000000',
              anchorItem: editedObj.data.originalItem as ExtractedTextItem,
              blockBounds: editedObj.data.blockBounds as CommittedEdit['blockBounds'],
            })
            selectedBlockKeyRef.current = null
            fc!.discardActiveObject()
            fc!.renderAll()
          } else {
            // No change (or block not found) — full dormant
            clearSelectionState(fc!)
          }
        })

        fc.renderAll()
      }

      init()

      return () => {
        cancelled = true
        window.removeEventListener('keydown', handleKeydown)
        try {
          fc?.dispose()
        } catch {
          // suppress dispose errors on fast unmount
        }
        fabricRef.current = null
      }
    }, [items, pageWidth, pageHeight])

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
