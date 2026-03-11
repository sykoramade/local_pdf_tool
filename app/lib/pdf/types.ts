/**
 * Shared types for PDF text extraction and editing.
 */

export interface ExtractedTextItem {
  id: string         // stable key: `p${pageNum}-${index}`
  pageNum: number
  str: string        // original text string

  // PDF coordinate space (bottom-left origin) — used by pdf-lib for save
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfFontSize: number

  // Canvas coordinate space (top-left origin) — used by overlay positioning
  canvasX: number
  canvasY: number
  canvasWidth: number
  canvasFontSize: number

  fontName: string   // raw PDF font name — passed to font-map
}

// Map of text item id → replacement string
export type EditMap = Map<string, string>
