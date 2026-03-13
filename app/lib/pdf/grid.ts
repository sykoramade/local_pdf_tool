/**
 * Layout grid extraction and snap logic for PDF pages.
 *
 * Purpose: scan the text items on a page, infer the implicit grid of baselines
 * and column positions, and provide a snap function so the UI can align user
 * placements (e.g. signature, text box) to the existing document structure.
 *
 * All coordinates in the returned PageGrid are in CANVAS space (CSS pixels,
 * top-left origin) so the UI can use them without further conversion.
 *
 * AcroForm field detection is intentionally left for a later sprint — formFields
 * is always an empty array for now (see task spec note).
 */

import type { ExtractedTextItem } from './types'
import { pdfToCanvasY, pdfToCanvasX } from './coords'

// ------------------------------------------------------------------
// Public interfaces
// ------------------------------------------------------------------

export interface PageGrid {
  /** Distinct text baseline Y positions in canvas space (top-left origin, pixels). */
  baselines: number[]
  /** Distinct column start X positions in canvas space (pixels). */
  columns: number[]
  /** AcroForm fields — reserved for a later enhancement; always [] for now. */
  formFields: FormFieldRegion[]
}

export interface FormFieldRegion {
  x: number
  y: number
  width: number
  height: number
  name: string
}

// ------------------------------------------------------------------
// extractPageGrid
// ------------------------------------------------------------------

/**
 * Derive a layout grid from the text items on a single PDF page.
 *
 * Algorithm:
 *  1. Baselines: for each text item, convert its PDF Y to canvas Y (this gives
 *     the TOP of the glyph in canvas space; the baseline is typically ~80% of
 *     font size below that, but for snap purposes the top edge is consistent
 *     enough and avoids needing per-glyph descent data). Deduplicate within
 *     BASELINE_CLUSTER_PX pixels — items on the same visual line cluster together.
 *
 *  2. Columns: a text item is a "line start" if there is no other item whose
 *     right edge falls within COLUMN_GAP_PX pixels to the item's left. These
 *     left-edge X values, after deduplication within COLUMN_CLUSTER_PX, become
 *     column markers.
 *
 * @param textItems     Extracted text items for ONE page (all same pageNum).
 * @param pageHeightPdf Page height in PDF user units (from page.getHeight()).
 * @param scale         Current zoom scale (canvas px = pdf units * scale).
 */
export function extractPageGrid(
  textItems: ExtractedTextItem[],
  pageHeightPdf: number,
  scale: number,
): PageGrid {
  if (textItems.length === 0) {
    return { baselines: [], columns: [], formFields: [] }
  }

  // --- Baselines ---

  // Convert each item's PDF Y to canvas Y (top edge of the glyph box).
  // pdfToCanvasY gives the top edge of the element when pdfY is the bottom
  // of the glyph (which is how pdf-lib/PDF.js report Y). We use the raw
  // canvas Y without the font-size offset because clustering handles variation.
  const rawBaselines = textItems.map(item =>
    pdfToCanvasY(item.pdfY, scale, pageHeightPdf),
  )

  const baselines = clusterAndSort(rawBaselines, BASELINE_CLUSTER_PX)

  // --- Columns ---

  // Build a list of right-edge X positions in canvas space for all items.
  // An item is a column-start if nothing else ends within COLUMN_GAP_PX px
  // immediately to its left.
  const rightEdges = textItems.map(item =>
    pdfToCanvasX(item.pdfX, scale) + item.canvasWidth,
  )

  const columnStarts: number[] = []

  for (let i = 0; i < textItems.length; i++) {
    const itemLeft = pdfToCanvasX(textItems[i].pdfX, scale)
    let hasNeighbourToLeft = false

    for (let j = 0; j < textItems.length; j++) {
      if (i === j) continue
      const gap = itemLeft - rightEdges[j]
      if (gap >= 0 && gap <= COLUMN_GAP_PX) {
        hasNeighbourToLeft = true
        break
      }
    }

    if (!hasNeighbourToLeft) {
      columnStarts.push(itemLeft)
    }
  }

  const columns = clusterAndSort(columnStarts, COLUMN_CLUSTER_PX)

  return { baselines, columns, formFields: [] }
}

// ------------------------------------------------------------------
// snapToGrid
// ------------------------------------------------------------------

/**
 * Snap a canvas-space point to the nearest grid line within threshold pixels.
 *
 * @param x         Candidate X in canvas space (CSS pixels).
 * @param y         Candidate Y in canvas space (CSS pixels).
 * @param grid      PageGrid returned by extractPageGrid.
 * @param threshold Max distance in CSS pixels to snap (default 12px).
 * @returns         Snapped coordinates, whether snap occurred, and snap type.
 */
export function snapToGrid(
  x: number,
  y: number,
  grid: PageGrid,
  threshold = 12,
): { x: number; y: number; snapped: boolean; snapType: 'baseline' | 'column' | 'both' | 'none' } {
  const snappedX = nearestWithin(x, grid.columns, threshold)
  const snappedY = nearestWithin(y, grid.baselines, threshold)

  const didX = snappedX !== null
  const didY = snappedY !== null

  if (didX && didY) {
    return { x: snappedX!, y: snappedY!, snapped: true, snapType: 'both' }
  }
  if (didX) {
    return { x: snappedX!, y, snapped: true, snapType: 'column' }
  }
  if (didY) {
    return { x, y: snappedY!, snapped: true, snapType: 'baseline' }
  }
  return { x, y, snapped: false, snapType: 'none' }
}

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Pixels within which two Y positions are considered the same baseline.
 * 4px tolerates sub-pixel rendering differences between adjacent words on a line.
 */
const BASELINE_CLUSTER_PX = 4

/**
 * Pixels within which two column left edges are considered the same column.
 */
const COLUMN_CLUSTER_PX = 6

/**
 * Max gap (in canvas pixels) between the right edge of one item and the left
 * edge of the next for them to be considered part of the same inline flow.
 * 20px is enough to bridge normal word spacing at most zoom levels.
 */
const COLUMN_GAP_PX = 20

/**
 * Deduplicate a list of values by clustering: values within `clusterPx` of an
 * existing cluster representative are merged into that cluster (averaged).
 * Returns sorted unique representatives.
 */
function clusterAndSort(values: number[], clusterPx: number): number[] {
  if (values.length === 0) return []

  const sorted = [...values].sort((a, b) => a - b)
  const clusters: { sum: number; count: number }[] = []

  for (const v of sorted) {
    const existing = clusters.find(c => Math.abs(c.sum / c.count - v) <= clusterPx)
    if (existing) {
      existing.sum += v
      existing.count++
    } else {
      clusters.push({ sum: v, count: 1 })
    }
  }

  return clusters.map(c => Math.round(c.sum / c.count)).sort((a, b) => a - b)
}

/**
 * Find the nearest value in `candidates` within `threshold` of `target`.
 * Returns null if nothing is close enough.
 */
function nearestWithin(
  target: number,
  candidates: number[],
  threshold: number,
): number | null {
  let best: number | null = null
  let bestDist = Infinity

  for (const c of candidates) {
    const dist = Math.abs(c - target)
    if (dist < bestDist && dist <= threshold) {
      bestDist = dist
      best = c
    }
  }

  return best
}
