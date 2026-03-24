/**
 * Coordinate conversion utilities for PDF canvas operations.
 *
 * Two coordinate systems are in play throughout this codebase:
 *
 * PDF space (pdf-lib):
 *   - Origin is BOTTOM-LEFT of the page
 *   - Y increases upward
 *   - Units are PDF user units (1 pt = 1/72 inch)
 *   - Used for all pdf-lib draw calls (drawText, drawImage, drawRectangle)
 *
 * Canvas / CSS pixel space (PDF.js, React overlay):
 *   - Origin is TOP-LEFT of the rendered canvas element
 *   - Y increases downward
 *   - Units are CSS pixels scaled by the current zoom factor
 *   - Used for overlay positioning, hit-testing, snap logic
 *
 * Percentage space (SignTool UI):
 *   - Values are 0–100, representing a fraction of page dimensions
 *   - Scale-independent — does not depend on the current zoom level
 *   - Used by the signature placement overlay
 *
 * Scale factor (canvas ↔ PDF):
 *   canvas pixels = pdf units * scale
 *   pdf units     = canvas pixels / scale
 *
 * The Y-axis flip is the trickiest part:
 *   canvasY = (pageHeightPdf - pdfY - elementHeightPdf) * scale
 *   pdfY    = pageHeightPdf - (canvasY / scale) - elementHeightPdf
 *
 * When converting a point (not a sized element), pass elementHeightCanvas = 0.
 */

// ─── Canvas ↔ PDF ────────────────────────────────────────────────────────────

/**
 * Convert a canvas X position (CSS pixels, top-left origin) to PDF X units.
 */
export function canvasToPdfX(canvasX: number, scale: number): number {
  return canvasX / scale
}

/**
 * Convert a canvas Y position (CSS pixels, top-left origin) to PDF Y units.
 *
 * PDF Y is measured from the BOTTOM of the page upward.
 * Canvas Y is measured from the TOP of the canvas downward.
 * This function accounts for the element's height so the resulting PDF Y
 * aligns with the BOTTOM edge of the element (how pdf-lib anchors drawImage).
 *
 * @param canvasY             Top edge of element in canvas/CSS pixel space
 * @param scale               Zoom scale (canvas px = pdf units * scale)
 * @param pageHeightPdf       Full page height in PDF user units
 * @param elementHeightCanvas Height of the element in canvas/CSS pixels (0 for a bare point)
 */
export function canvasToPdfY(
  canvasY: number,
  scale: number,
  pageHeightPdf: number,
  elementHeightCanvas: number,
): number {
  const elementHeightPdf = elementHeightCanvas / scale
  return pageHeightPdf - canvasY / scale - elementHeightPdf
}

/**
 * Convert a PDF X position (user units, left-edge origin) to canvas CSS pixels.
 */
export function pdfToCanvasX(pdfX: number, scale: number): number {
  return pdfX * scale
}

/**
 * Convert a PDF Y position (user units, bottom-left origin) to canvas CSS pixels.
 * Returns the TOP edge of the point in canvas space.
 */
export function pdfToCanvasY(pdfY: number, scale: number, pageHeightPdf: number): number {
  return (pageHeightPdf - pdfY) * scale
}

// ─── Percentage ↔ PDF ────────────────────────────────────────────────────────

/**
 * Convert percentage-based placement coordinates (from the SignTool UI) to
 * PDF user-unit coordinates suitable for pdf-lib drawImage().
 *
 * The UI stores placements as percentages of page dimensions so that the
 * coordinates are scale-independent (independent of the current zoom level).
 *
 * @param xPct          Centre X of element as % of page width (0–100)
 * @param yPct          Centre Y of element as % of page height (0–100)
 * @param widthPct      Element width as % of page width (0–100)
 * @param pageWidthPdf  Page width in PDF user units
 * @param pageHeightPdf Page height in PDF user units
 * @param aspectRatio   Element's natural aspect ratio (width / height).
 *                      Used to compute height from width while preserving proportions.
 * @returns             { x, y, width, height } in PDF user units, ready for drawImage()
 */
export function pctToPdfCoords(
  xPct: number,
  yPct: number,
  widthPct: number,
  pageWidthPdf: number,
  pageHeightPdf: number,
  aspectRatio: number,
): { x: number; y: number; width: number; height: number } {
  const widthPdf = (widthPct / 100) * pageWidthPdf
  const heightPdf = aspectRatio > 0 ? widthPdf / aspectRatio : widthPdf

  // xPct/yPct are the CENTRE point of the element (SigOverlay renders with
  // transform: translate(-50%, -50%) so the visual centre is at these coords).
  // pdf-lib drawImage() anchors at bottom-left, so shift by half dimensions.
  const centrePdfX = (xPct / 100) * pageWidthPdf
  const centrePdfY_fromTop = (yPct / 100) * pageHeightPdf

  const x = centrePdfX - widthPdf / 2
  const y = pageHeightPdf - centrePdfY_fromTop - heightPdf / 2

  return { x, y, width: widthPdf, height: heightPdf }
}
