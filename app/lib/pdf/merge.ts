/**
 * Client-side PDF merge using pdf-lib.
 * Loads each input PDF, copies all pages into a new document, and serialises.
 * All processing is in-browser — no files leave the device.
 */

import { PDFDocument } from 'pdf-lib'

export interface MergeResult {
  output: Uint8Array
  pageCount: number
}

export async function mergePdfs(inputs: Uint8Array[]): Promise<MergeResult> {
  if (inputs.length < 2) throw new Error('Provide at least 2 PDF files to merge.')

  const merged = await PDFDocument.create()

  for (const bytes of inputs) {
    const doc = await PDFDocument.load(bytes as unknown as ArrayBuffer)
    const indices = doc.getPageIndices()
    const copied = await merged.copyPages(doc, indices)
    copied.forEach(page => merged.addPage(page))
  }

  const saved = await merged.save()
  return {
    output: new Uint8Array(saved),
    pageCount: merged.getPageCount(),
  }
}
