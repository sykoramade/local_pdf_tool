/**
 * Apply text edits to a PDF using pdf-lib and return the modified bytes.
 *
 * Strategy: white rectangle mask over original text + new text in matched font.
 * Validated in spike (2026-03-11).
 */

import { PDFDocument, rgb } from 'pdf-lib'
import type { ExtractedTextItem, EditMap } from './types'
import { mapFont, resolveStandardFont } from './fonts/font-map'

export async function applyEditsAndSave(
  originalBytes: Uint8Array,
  textItems: ExtractedTextItem[],
  editMap: EditMap,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes as unknown as ArrayBuffer)
  const pages = pdfDoc.getPages()

  // Deduplicate font embedding: one embedded font per unique standard font name
  const fontCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>>()
  async function getFont(standardFontName: string) {
    if (!fontCache.has(standardFontName)) {
      fontCache.set(standardFontName, await pdfDoc.embedFont(standardFontName))
    }
    return fontCache.get(standardFontName)!
  }

  for (const [id, fieldData] of Array.from(editMap.entries())) {
    if (!fieldData.value.trim()) continue

    const item = textItems.find(t => t.id === id)
    if (!item) continue

    const page = pages[item.pageNum - 1]
    if (!page) continue

    const fontMatch = mapFont(item.fontName)
    // Apply user bold/italic overrides from the toolbar (FieldData) on top of
    // the auto-detected values from the original font name.
    const effectiveBold = fieldData.bold ?? fontMatch.bold
    const effectiveItalic = fieldData.italic ?? fontMatch.italic
    const standardFont = resolveStandardFont(fontMatch.standardFont, effectiveBold, effectiveItalic)
    const font = await getFont(standardFont)

    const fs = fieldData.size || item.pdfFontSize || 12
    const originalWidth = font.widthOfTextAtSize(item.str, fs)

    // Mask original text with white rectangle.
    // Descenders (g, p, q, y, j) extend ~25% of font size below the baseline.
    // Using a fixed -2 under-covers larger font sizes — use proportional offset.
    const descenderDepth = Math.max(2, fs * 0.25)
    const ascenderHeight = fs * 0.85
    page.drawRectangle({
      x: item.pdfX - 1,
      y: item.pdfY - descenderDepth,
      width: originalWidth + 4,
      height: ascenderHeight + descenderDepth + 2,
      color: rgb(1, 1, 1),
      opacity: 1,
    })

    // Parse color: fieldData.color is hex like '#3b82f6' or '#000000'
    const hexToRgb = (hex: string) => {
      const h = hex.replace('#', '')
      return {
        r: parseInt(h.slice(0, 2), 16) / 255,
        g: parseInt(h.slice(2, 4), 16) / 255,
        b: parseInt(h.slice(4, 6), 16) / 255,
      }
    }
    const { r, g, b } = hexToRgb(fieldData.color || '#000000')

    // Draw replacement — clip to original width as a soft guard
    // (longer replacements will overflow but won't corrupt other text)
    page.drawText(fieldData.value, {
      x: item.pdfX,
      y: item.pdfY,
      size: fs,
      font,
      color: rgb(r, g, b),
      maxWidth: originalWidth * 3, // generous but bounded
    })
  }

  // useObjectStreams: false — prevents pdf-lib from repacking font resource
  // cross-references into compressed object streams, which causes some PDF
  // viewers to fall back to a default sans-serif for unedited text items. S56-P1-04 validation.
  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}
