/**
 * Page management utilities — add blank pages to an existing PDF.
 * All processing is client-side (pdf-lib, no server).
 */

import { PDFDocument, PageSizes } from 'pdf-lib'

/**
 * Insert a blank A4 page after `afterPageIndex` (0-based).
 * Pass `afterPageIndex = pageCount - 1` to append at the end.
 *
 * Returns new PDF bytes with the blank page inserted.
 */
export async function addBlankPage(
  originalBytes: Uint8Array,
  afterPageIndex: number,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes as unknown as ArrayBuffer)
  const [width, height] = PageSizes.A4
  pdfDoc.insertPage(afterPageIndex + 1, [width, height])
  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}
