/**
 * Apply canvas-layer edits to a PDF using pdf-lib.
 *
 * Strategy: white rectangle mask over the original block bounds (canvas coords
 * converted to PDF coords), then draw replacement text at the anchor item's
 * original pdfX/pdfY (no reverse-computation needed — already in PDF space).
 *
 * Used by PdfEditor when canvasMode is active (S29 canvas pivot).
 */

import { PDFDocument, rgb } from 'pdf-lib'
import type { FabricTextboxExport } from './types'
import { mapFont, resolveStandardFont } from './fonts/font-map'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = (hex.startsWith('#') ? hex.slice(1) : hex).padEnd(6, '0')
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  }
}

export async function applyCanvasEditsAndSave(
  originalBytes: Uint8Array,
  textboxes: FabricTextboxExport[],
  viewportScale: number,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes as unknown as ArrayBuffer)
  const pages = pdfDoc.getPages()

  // Deduplicate font embeddings across all edits
  const fontCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>>()
  async function getFont(name: string) {
    if (!fontCache.has(name)) fontCache.set(name, await pdfDoc.embedFont(name))
    return fontCache.get(name)!
  }

  for (const tb of textboxes) {
    if (!tb.text.trim()) continue

    const item = tb.anchorItem
    const page = pages[item.pageNum - 1]
    if (!page) continue

    const { height: pageH } = page.getSize()

    // White cover rect: convert block canvas bounds → PDF coordinate space.
    // Canvas is top-left origin; PDF is bottom-left origin.
    const coverX = tb.blockBounds.left / viewportScale
    const coverY = pageH - (tb.blockBounds.top + tb.blockBounds.height) / viewportScale
    const coverW = tb.blockBounds.width / viewportScale
    const coverH = tb.blockBounds.height / viewportScale

    page.drawRectangle({
      x: coverX - 1,
      y: coverY - 1,
      width: coverW + 2,
      height: coverH + 2,
      color: rgb(1, 1, 1),
      opacity: 1,
    })

    // Resolve font from original PDF font name + user bold/italic state
    const fontMatch = mapFont(item.fontName)
    const bold = tb.fontWeight === 'bold'
    const italic = tb.fontStyle === 'italic'
    const standardFont = resolveStandardFont(fontMatch.standardFont, bold, italic)
    const font = await getFont(standardFont)

    const fs = tb.fontSize != null ? tb.fontSize / viewportScale : item.pdfFontSize
    const { r, g, b } = hexToRgb(tb.fill)

    // Place text at block start (coverX already computed above), not anchor item center
    page.drawText(tb.text, {
      x: coverX,
      y: item.pdfY,
      size: fs,
      font,
      color: rgb(r, g, b),
      maxWidth: coverW * 2,
    })
  }

  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}
