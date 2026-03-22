/**
 * Apply annotations (highlights and sticky notes) to a PDF using pdf-lib.
 *
 * Highlights: semi-transparent rectangle drawn over text item bounding box.
 * Sticky notes: small yellow rectangle + text at the anchored position.
 *
 * Coordinates are stored as % of page dimensions (0–100) for scale-independence.
 * Conversion to PDF user units happens here at save time.
 *
 * useObjectStreams: false — same rule as save.ts — prevents font regression.
 */

import { PDFDocument, rgb } from 'pdf-lib'
import type { Annotation, TextHighlight, StickyNote, CheckAnnotation } from './types'

const HIGHLIGHT_COLORS = [
  rgb(1, 0.93, 0.2),      // yellow
  rgb(0.37, 0.93, 0.5),   // green
  rgb(0.98, 0.4, 0.7),    // pink
] as const

const HIGHLIGHT_OPACITY = 0.4
const STICKY_BG = rgb(1, 0.95, 0.28)
const STICKY_TEXT_COLOR = rgb(0.1, 0.1, 0.1)

export async function applyAnnotations(
  originalBytes: Uint8Array,
  annotations: Annotation[],
): Promise<Uint8Array> {
  if (annotations.length === 0) return originalBytes

  const pdfDoc = await PDFDocument.load(originalBytes as unknown as ArrayBuffer)
  const pages = pdfDoc.getPages()

  // Embed Helvetica once only when sticky notes are present
  const hasStickyNotes = annotations.some(a => a.type === 'sticky-note')
  const stickyFont = hasStickyNotes ? await pdfDoc.embedFont('Helvetica') : null

  for (const ann of annotations) {
    const page = pages[ann.pageNum - 1]
    if (!page) continue

    const { width: pageW, height: pageH } = page.getSize()

    if (ann.type === 'highlight') {
      const hl = ann as TextHighlight
      const x = (hl.xPct / 100) * pageW
      const w = (hl.widthPct / 100) * pageW
      const h = (hl.heightPct / 100) * pageH
      // yPct is from top; PDF Y origin is bottom-left
      const y = pageH - (hl.yPct / 100) * pageH - h

      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: HIGHLIGHT_COLORS[hl.colorIndex] ?? HIGHLIGHT_COLORS[0],
        opacity: HIGHLIGHT_OPACITY,
      })
    } else if (ann.type === 'sticky-note') {
      const note = ann as StickyNote
      // Fixed note size: 15% of page width, 9% of page height
      const noteW = pageW * 0.15
      const noteH = pageH * 0.09
      const x = (note.xPct / 100) * pageW
      // yPct from top → PDF bottom-left anchor
      const y = pageH - (note.yPct / 100) * pageH - noteH

      // Yellow background rect
      page.drawRectangle({
        x,
        y,
        width: noteW,
        height: noteH,
        color: STICKY_BG,
        opacity: 0.92,
      })

      // Text content (if any)
      if (stickyFont && note.text.trim()) {
        const fs = Math.max(noteH * 0.18, 6)
        page.drawText(note.text.slice(0, 120), {
          x: x + 4,
          y: y + noteH - fs - 4,
          size: fs,
          font: stickyFont,
          color: STICKY_TEXT_COLOR,
          maxWidth: noteW - 8,
          lineHeight: fs * 1.3,
        })
      }
    } else if (ann.type === 'check') {
      const ck = ann as CheckAnnotation
      const cx = (ck.xPct / 100) * pageW
      const cy = pageH - (ck.yPct / 100) * pageH
      const sz = 14 // checkmark size in PDF points
      // Draw ✓ as two lines: short down-left stroke + long up-right stroke
      page.drawLine({
        start: { x: cx, y: cy + sz * 0.35 },
        end: { x: cx + sz * 0.38, y: cy },
        thickness: 2.2,
        color: rgb(0.08, 0.55, 0.18),
      })
      page.drawLine({
        start: { x: cx + sz * 0.38, y: cy },
        end: { x: cx + sz, y: cy + sz * 0.75 },
        thickness: 2.2,
        color: rgb(0.08, 0.55, 0.18),
      })
    }
  }

  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}
