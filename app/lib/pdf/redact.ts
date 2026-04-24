/**
 * True PDF redaction via content stream surgery.
 *
 * Strategy: FlateDecode decompress → blank matching text operators (Tj/TJ/'/" )
 * → write back as uncompressed stream. Removes text from the PDF data layer,
 * not just visually. Proven in S30A HTML prototype.
 *
 * Uses native browser DecompressionStream (no pako dependency).
 */

import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib'

export interface RedactResult {
  bytes: Uint8Array
  totalStreams: number
  totalReplacements: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Re-encode a latin-1 string as bytes (TextEncoder doesn't support latin-1). */
function strToBytes(str: string): Uint8Array {
  const out = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff
  return out
}

/** Decompress a zlib/FlateDecode buffer using the native browser API. */
async function inflateZlib(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  const reader = ds.readable.getReader()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writer.write(data as any)
  writer.close()

  const chunks: Uint8Array[] = []
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

// ─── Text operator blanking ───────────────────────────────────────────────────

/**
 * Blank occurrences of each target string inside a PDF content stream string.
 *
 * Handles:
 *   (text) Tj / ' / "
 *   [(text) n (text)] TJ
 *
 * Replacement fills matched content with spaces to preserve glyph-advance budget.
 */
function blankTextOps(
  streamStr: string,
  targetList: string[],
): { result: string; count: number } {
  let result = streamStr
  let totalCount = 0

  for (const target of targetList) {
    const targetLower = target.toLowerCase()

    // Tj / ' / " — literal string operand
    result = result.replace(
      /\(([^\\)]*(?:\\.[^\\)]*)*)\)\s*(Tj|'|")/g,
      (match, content: string, op: string) => {
        if (content.toLowerCase().includes(targetLower)) {
          totalCount++
          return `(${content.replace(/[^ ]/g, ' ')}) ${op}`
        }
        return match
      },
    )

    // TJ — array of string/number pairs
    result = result.replace(
      /\[([^\]]*)\]\s*TJ/g,
      (match, arr: string) => {
        let modified = arr
        let changed = false
        modified = modified.replace(
          /\(([^\\)]*(?:\\.[^\\)]*)*)\)/g,
          (m, content: string) => {
            if (content.toLowerCase().includes(targetLower)) {
              changed = true
              totalCount++
              return `(${content.replace(/[^ ]/g, ' ')})`
            }
            return m
          },
        )
        return changed ? `[${modified}] TJ` : match
      },
    )
  }

  return { result, count: totalCount }
}

// ─── Stream ref resolution ────────────────────────────────────────────────────

/**
 * Get content stream PDFRawStream objects for a page.
 * Handles single-ref and array-of-refs Contents entries.
 */
function getPageStreams(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: PDFDocument,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: ReturnType<PDFDocument['getPages']>[0],
): PDFRawStream[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (pdfDoc as any).context
  const contentsVal = page.node.get(PDFName.of('Contents'))
  if (!contentsVal) return []

  const typeName = contentsVal.constructor?.name

  const collectRefs = (obj: unknown): PDFRawStream[] => {
    if (!obj) return []
    const name = (obj as { constructor?: { name?: string } }).constructor?.name
    if (name === 'PDFRef') {
      const resolved = ctx.lookup(obj)
      if (!resolved) return []
      const resolvedName = resolved.constructor?.name
      if (resolvedName === 'PDFArray') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (resolved as unknown as { asArray: () => unknown[] })
          .asArray()
          .flatMap(r => collectRefs(r))
      }
      if (resolvedName === 'PDFRawStream') return [resolved as unknown as PDFRawStream]
    }
    if (name === 'PDFArray') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (contentsVal as unknown as { asArray: () => unknown[] })
        .asArray()
        .flatMap(r => collectRefs(r))
    }
    return []
  }

  if (typeName === 'PDFRef') return collectRefs(contentsVal)
  if (typeName === 'PDFArray') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (contentsVal as unknown as { asArray: () => unknown[] })
      .asArray()
      .flatMap(r => collectRefs(r))
  }
  return []
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Redact a PDF by surgically blanking text operators in content streams.
 * Returns modified bytes and diagnostic counts.
 */
export async function redactPdf(
  bytes: Uint8Array,
  targetList: string[],
): Promise<RedactResult> {
  const pdfDoc = await PDFDocument.load(bytes as unknown as ArrayBuffer, {
    ignoreEncryption: true,
  })
  const pages = pdfDoc.getPages()

  let totalStreams = 0
  let totalReplacements = 0
  let skippedStreams = 0

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi]
    const streams = getPageStreams(pdfDoc, page)

    for (const stream of streams) {
      totalStreams++

      const filterVal = stream.dict.get(PDFName.of('Filter'))
      const filterName =
        filterVal?.constructor?.name === 'PDFName'
          ? (filterVal as unknown as { asString: () => string }).asString()
          : null

      let rawBytes = stream.contents
      let decompressed: Uint8Array

      if (filterName === 'FlateDecode') {
        try {
          decompressed = await inflateZlib(rawBytes)
        } catch {
          skippedStreams++
          continue
        }
      } else if (!filterName) {
        decompressed = rawBytes
      } else {
        skippedStreams++
        continue
      }

      const streamText = new TextDecoder('latin1').decode(decompressed)
      const { result, count } = blankTextOps(streamText, targetList)
      totalReplacements += count

      if (count > 0) {
        const modifiedBytes = strToBytes(result)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(stream as any).contents = modifiedBytes
        stream.dict.delete(PDFName.of('Filter'))
        stream.dict.delete(PDFName.of('DecodeParms'))
        stream.dict.set(
          PDFName.of('Length'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pdfDoc as any).context.obj(modifiedBytes.length),
        )
      }
    }
  }

  if (skippedStreams > 0) {
    throw new Error(
      `Redaction incomplete: ${skippedStreams} stream(s) could not be processed (unsupported filter or decompression failure). The output PDF may still contain the content you attempted to redact. See docs/F008-redaction-silent-failure.md.`
    )
  }

  const saved = await pdfDoc.save({ useObjectStreams: false })
  return { bytes: new Uint8Array(saved), totalStreams, totalReplacements }
}
