/**
 * Apply text edits to a PDF using pdf-lib and return the modified bytes.
 *
 * Strategy: white rectangle mask over original text + new text in matched font.
 * Validated in spike (2026-03-11).
 */

import { PDFDocument, rgb } from 'pdf-lib'
import type { ExtractedTextItem, EditMap } from './types'
import { mapFont } from './fonts/font-map'

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

  for (const [id, newText] of Array.from(editMap.entries())) {
    if (!newText.trim()) continue

    const item = textItems.find(t => t.id === id)
    if (!item) continue

    const page = pages[item.pageNum - 1]
    if (!page) continue

    const fontMatch = mapFont(item.fontName)
    const font = await getFont(fontMatch.standardFont)

    const fs = item.pdfFontSize || 12
    const originalWidth = font.widthOfTextAtSize(item.str, fs)

    // Mask original text with white rectangle sized to original text
    page.drawRectangle({
      x: item.pdfX - 1,
      y: item.pdfY - 2,
      width: originalWidth + 4,
      height: fs + 4,
      color: rgb(1, 1, 1),
      opacity: 1,
    })

    // Draw replacement — clip to original width as a soft guard
    // (longer replacements will overflow but won't corrupt other text)
    page.drawText(newText, {
      x: item.pdfX,
      y: item.pdfY,
      size: fs,
      font,
      color: rgb(0, 0, 0),
      maxWidth: originalWidth * 3, // generous but bounded
    })
  }

  const saved = await pdfDoc.save()
  return new Uint8Array(saved)
}
