/**
 * Embed one or more hand-drawn signature PNGs into a PDF document.
 *
 * All processing happens in the browser — the PDF bytes never leave the device.
 *
 * Usage flow (from SignTool UI):
 *  1. User draws signature on an HTML <canvas> element.
 *  2. UI calls canvas.toDataURL('image/png') to get a data URL.
 *  3. UI records the placement as percentage coordinates (xPct, yPct, widthPct).
 *  4. UI calls applySignatures(originalPdfBytes, placements).
 *  5. Return value is downloaded directly in the browser.
 *
 * Coordinate conversion:
 *  - Placement coordinates from the UI are percentages of page dimensions (0–100).
 *    This makes them scale-independent (no zoom factor required).
 *  - pdf-lib drawImage() expects PDF user-unit coordinates (bottom-left origin).
 *  - pctToPdfCoords from coords.ts handles this conversion.
 *    No coordinate math is inlined here — coords.ts is the single source of truth.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { pctToPdfCoords } from './coords'

// ─── Public interface ─────────────────────────────────────────────────────────

export interface SignaturePlacementInput {
  /** 1-indexed page number (matches SignTool's pageNum field). */
  pageNum: number

  /** Centre X of the signature as % of page width (0–100). */
  xPct: number

  /** Centre Y of the signature as % of page height (0–100). */
  yPct: number

  /** Signature width as % of page width (0–100). */
  widthPct: number

  /** canvas.toDataURL('image/png') from the signature drawing canvas. */
  dataUrl: string
}

// ─── applySignatures ──────────────────────────────────────────────────────────

/**
 * Embed signature images into a PDF document at the specified positions.
 *
 * @param pdfBytes    Original PDF as a Uint8Array (not mutated).
 * @param placements  One entry per committed signature from the SignTool UI.
 * @returns           Modified PDF bytes ready for download.
 *
 * @throws If pdfBytes is not a valid PDF or a placement references a page
 *         that does not exist.
 */
export async function applySignatures(
  pdfBytes: Uint8Array,
  placements: SignaturePlacementInput[],
): Promise<Uint8Array> {
  if (placements.length === 0) return pdfBytes

  const pdfDoc = await PDFDocument.load(pdfBytes as unknown as ArrayBuffer)
  const pages = pdfDoc.getPages()

  for (const placement of placements) {
    const pageIndex = placement.pageNum - 1   // convert 1-indexed → 0-indexed
    const page = pages[pageIndex]

    if (!page) {
      throw new Error(
        `applySignatures: pageNum ${placement.pageNum} does not exist ` +
        `(PDF has ${pages.length} page(s)).`,
      )
    }

    // Decode the data URL → raw PNG bytes
    const pngBytes = dataUrlToUint8Array(placement.dataUrl)

    // Embed the PNG (pdf-lib deduplicates identical images internally)
    const img = await pdfDoc.embedPng(pngBytes)

    // Compute aspect ratio from the embedded image's natural dimensions
    const { width: natW, height: natH } = img.size()
    const aspectRatio = natH > 0 ? natW / natH : 1

    // Convert percentage placement to PDF user-unit coordinates.
    // pctToPdfCoords handles Y-axis flip and centre → bottom-left conversion.
    const { width: pageWidthPdf, height: pageHeightPdf } = page.getSize()
    const { x, y, width, height } = pctToPdfCoords(
      placement.xPct,
      placement.yPct,
      placement.widthPct,
      pageWidthPdf,
      pageHeightPdf,
      aspectRatio,
    )

    page.drawImage(img, { x, y, width, height })
  }

  // useObjectStreams: false — prevents font cross-reference corruption in some
  // PDF viewers (same fix as save.ts). Object streams are a PDF 1.5 feature
  // that certain viewers misparse when resolving embedded font resources.
  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}

// ─── embedTypedSignature ──────────────────────────────────────────────────────

export interface TypedSignatureEntry {
  /** 1-indexed page number. */
  pageNum: number
  /** Centre X as % of page width (0–100). */
  xPct: number
  /** Centre Y as % of page height (0–100). */
  yPct: number
  /** The typed name to render. */
  text: string
  /** Signature width as % of page width (default 30). */
  widthPct?: number
}

/**
 * Embed typed-name signatures into a PDF using Times Roman Italic.
 * Font size is computed so the text fits within widthPct of the page width.
 */
export async function embedTypedSignature(
  pdfBytes: Uint8Array,
  entries: TypedSignatureEntry[],
): Promise<Uint8Array> {
  if (entries.length === 0) return pdfBytes

  const pdfDoc = await PDFDocument.load(pdfBytes as unknown as ArrayBuffer)
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
  const pages = pdfDoc.getPages()

  for (const entry of entries) {
    const page = pages[entry.pageNum - 1]
    if (!page) {
      throw new Error(
        `embedTypedSignature: pageNum ${entry.pageNum} does not exist ` +
        `(PDF has ${pages.length} page(s)).`,
      )
    }

    if (!entry.text.trim()) continue

    const { width: pw, height: ph } = page.getSize()
    const targetW = ((entry.widthPct ?? 30) / 100) * pw

    // Shrink font until text fits target width
    let size = 48
    while (size > 8 && font.widthOfTextAtSize(entry.text, size) > targetW) size -= 2

    const textW = font.widthOfTextAtSize(entry.text, size)
    const textH = font.heightAtSize(size)

    // Convert % centre coords to PDF user units (origin = bottom-left)
    const cx = (entry.xPct / 100) * pw
    const cy = ph - (entry.yPct / 100) * ph

    page.drawText(entry.text, {
      x: cx - textW / 2,
      y: cy - textH / 2,
      size,
      font,
      color: rgb(0.1, 0.1, 0.14),
    })
  }

  const saved = await pdfDoc.save({ useObjectStreams: false })
  return new Uint8Array(saved)
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Strip the data URL prefix (e.g. "data:image/png;base64,") and decode
 * the remaining base64 string to a Uint8Array.
 *
 * Works in both browser (atob) and Node.js (Buffer) environments.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '')

  if (typeof atob === 'function') {
    const binaryStr = atob(base64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    return bytes
  }

  // Node.js (test runner)
  return new Uint8Array(Buffer.from(base64, 'base64'))
}
