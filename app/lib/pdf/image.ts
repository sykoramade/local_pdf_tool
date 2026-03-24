/**
 * Embed raster images into a PDF using pdf-lib.
 * Supports PNG and JPEG. All processing is client-side.
 */

import { PDFDocument } from 'pdf-lib'
import type { ImageEntry } from './types'
import { pctToPdfCoords } from './coords'

export async function embedImages(
  originalBytes: Uint8Array,
  images: ImageEntry[],
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes as unknown as ArrayBuffer)
  const pages = pdfDoc.getPages()

  for (const img of images) {
    const page = pages[img.page - 1]
    if (!page) continue

    const { width: pageW, height: pageH } = page.getSize()

    // Decode base64 data URL to bytes
    const base64 = img.dataUrl.split(',')[1]
    const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

    const embedded = img.mimeType === 'png'
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes)

    const aspectRatio = embedded.width / embedded.height
    const { x, y, width, height } = pctToPdfCoords(
      img.xPct,
      img.yPct,
      img.widthPct,
      pageW,
      pageH,
      aspectRatio,
    )

    page.drawImage(embedded, { x, y, width, height })
  }

  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}
