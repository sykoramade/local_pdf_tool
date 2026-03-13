/**
 * Client-side PDF split using pdf-lib.
 *
 * Two modes:
 *   'all-pages' — produce one PDF per page, named page-1.pdf, page-2.pdf, etc.
 *   'range'     — produce a single PDF containing a contiguous range of pages
 *                 (1-indexed, inclusive on both ends).
 *
 * Uses the same PDFDocument.create() + copyPages() pattern as merge.ts so the
 * two utilities stay consistent.
 *
 * All processing is in-browser — no files leave the device.
 */

import { PDFDocument } from 'pdf-lib'

// ------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------

export interface SplitResult {
  files: { name: string; bytes: Uint8Array }[]
}

// ------------------------------------------------------------------
// splitPdf
// ------------------------------------------------------------------

/**
 * Split a PDF into one or more output documents.
 *
 * @param pdfBytes  Source PDF as Uint8Array.
 * @param mode      'all-pages' or 'range'.
 * @param range     Required when mode='range'. 1-indexed, inclusive.
 *                  E.g. { start: 2, end: 4 } extracts pages 2, 3, 4.
 * @returns         SplitResult containing output file names and byte arrays.
 *
 * @throws If the PDF cannot be loaded, range is invalid, or range references
 *         pages outside the document.
 */
export async function splitPdf(
  pdfBytes: Uint8Array,
  mode: 'all-pages' | 'range',
  range?: { start: number; end: number },
): Promise<SplitResult> {
  const srcDoc = await PDFDocument.load(pdfBytes as unknown as ArrayBuffer)
  const totalPages = srcDoc.getPageCount()

  if (totalPages === 0) {
    throw new Error('splitPdf: source PDF has no pages.')
  }

  if (mode === 'range') {
    if (!range) {
      throw new Error("splitPdf: 'range' mode requires a range argument.")
    }

    const { start, end } = range

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error('splitPdf: range start and end must be integers.')
    }

    if (start < 1 || end < 1) {
      throw new Error('splitPdf: range start and end are 1-indexed and must be ≥ 1.')
    }

    if (start > end) {
      throw new Error(
        `splitPdf: range start (${start}) must be ≤ end (${end}).`,
      )
    }

    if (end > totalPages) {
      throw new Error(
        `splitPdf: range end (${end}) exceeds total pages (${totalPages}).`,
      )
    }

    // Build 0-indexed array for copyPages
    const indices: number[] = []
    for (let p = start; p <= end; p++) {
      indices.push(p - 1)
    }

    const outDoc = await PDFDocument.create()
    const copied = await outDoc.copyPages(srcDoc, indices)
    copied.forEach(page => outDoc.addPage(page))

    const saved = await outDoc.save()
    const name =
      start === end ? `page-${start}.pdf` : `pages-${start}-${end}.pdf`

    return { files: [{ name, bytes: new Uint8Array(saved) }] }
  }

  // mode === 'all-pages'
  const files: { name: string; bytes: Uint8Array }[] = []

  for (let i = 0; i < totalPages; i++) {
    const outDoc = await PDFDocument.create()
    const [copied] = await outDoc.copyPages(srcDoc, [i])
    outDoc.addPage(copied)

    const saved = await outDoc.save()
    files.push({
      name: `page-${i + 1}.pdf`,
      bytes: new Uint8Array(saved),
    })
  }

  return { files }
}
