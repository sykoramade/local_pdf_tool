/**
 * Client-side PDF compression using pdf-lib.
 *
 * What this does: removes redundant cross-reference data and re-serialises
 * the PDF, which typically reduces size by 10–30% on unoptimised files.
 *
 * What this does NOT do: recompress embedded images (requires server-side tooling).
 * We are honest about this in the UI.
 */

import { PDFDocument } from 'pdf-lib'

export interface CompressResult {
  originalBytes: number
  compressedBytes: number
  savingPercent: number
  output: Uint8Array
}

export async function compressPdf(inputBytes: Uint8Array): Promise<CompressResult> {
  const pdfDoc = await PDFDocument.load(inputBytes as unknown as ArrayBuffer, {
    updateMetadata: false,
  })

  const saved = await pdfDoc.save({ useObjectStreams: true })
  const output = new Uint8Array(saved)

  const savingPercent = Math.max(
    0,
    Math.round(((inputBytes.length - output.length) / inputBytes.length) * 100),
  )

  return {
    originalBytes: inputBytes.length,
    compressedBytes: output.length,
    savingPercent,
    output,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
