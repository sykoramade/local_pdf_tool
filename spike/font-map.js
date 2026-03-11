/**
 * PDF Font Mapping — Core Logic
 * Maps PDF font names to available web fonts + pdf-lib StandardFonts.
 * This module will be reused directly in /lib/pdf/fonts/ in the main app.
 */

// Web CSS font stacks for rendering in the editor overlay
const WEB_FONT_MAP = [
  { match: ['helvetica', 'arial', 'swiss'],         bold: false, css: 'Arial, Helvetica, sans-serif' },
  { match: ['helvetica', 'arial', 'swiss'],         bold: true,  css: '"Arial Bold", "Helvetica Bold", sans-serif' },
  { match: ['times', 'roman', 'serif', 'minion'],   bold: false, css: '"Times New Roman", Times, serif' },
  { match: ['times', 'roman', 'serif', 'minion'],   bold: true,  css: '"Times New Roman Bold", Times, serif' },
  { match: ['courier', 'mono', 'typewriter'],        bold: false, css: '"Courier New", Courier, monospace' },
  { match: ['courier', 'mono', 'typewriter'],        bold: true,  css: '"Courier New Bold", Courier, monospace' },
  { match: ['georgia'],                              bold: false, css: 'Georgia, serif' },
  { match: ['verdana'],                              bold: false, css: 'Verdana, sans-serif' },
  { match: ['calibri'],                              bold: false, css: 'Calibri, sans-serif' },
  { match: ['trebuchet'],                            bold: false, css: '"Trebuchet MS", sans-serif' },
  { match: ['garamond'],                             bold: false, css: 'Garamond, serif' },
  { match: ['palatino'],                             bold: false, css: '"Palatino Linotype", Palatino, serif' },
  { match: ['futura', 'gothic', 'franklin'],         bold: false, css: '"Century Gothic", sans-serif' },
  { match: ['symbol'],                               bold: false, css: 'Symbol' },
  { match: ['zapf', 'dingbat', 'wingding'],          bold: false, css: 'Wingdings, ZapfDingbats' },
]

// pdf-lib StandardFonts mapping (used when writing the output PDF)
// Values match the PDFLib.StandardFonts enum
const STANDARD_FONT_MAP = [
  { match: ['helvetica', 'arial', 'swiss'],        bold: false, italic: false, value: 'Helvetica' },
  { match: ['helvetica', 'arial', 'swiss'],        bold: true,  italic: false, value: 'Helvetica-Bold' },
  { match: ['helvetica', 'arial', 'swiss'],        bold: false, italic: true,  value: 'Helvetica-Oblique' },
  { match: ['helvetica', 'arial', 'swiss'],        bold: true,  italic: true,  value: 'Helvetica-BoldOblique' },
  { match: ['times', 'roman', 'serif', 'minion'],  bold: false, italic: false, value: 'Times-Roman' },
  { match: ['times', 'roman', 'serif', 'minion'],  bold: true,  italic: false, value: 'Times-Bold' },
  { match: ['times', 'roman', 'serif', 'minion'],  bold: false, italic: true,  value: 'Times-Italic' },
  { match: ['times', 'roman', 'serif', 'minion'],  bold: true,  italic: true,  value: 'Times-BoldItalic' },
  { match: ['courier', 'mono', 'typewriter'],       bold: false, italic: false, value: 'Courier' },
  { match: ['courier', 'mono', 'typewriter'],       bold: true,  italic: false, value: 'Courier-Bold' },
  { match: ['courier', 'mono', 'typewriter'],       bold: false, italic: true,  value: 'Courier-Oblique' },
  { match: ['courier', 'mono', 'typewriter'],       bold: true,  italic: true,  value: 'Courier-BoldOblique' },
  { match: ['symbol'],                               bold: false, italic: false, value: 'Symbol' },
  { match: ['zapf', 'dingbat', 'wingding'],          bold: false, italic: false, value: 'ZapfDingbats' },
]

/**
 * Normalise a raw PDF font name.
 * Strips subset prefix (e.g. "ABCDEF+Helvetica-Bold" → "Helvetica-Bold")
 * Strips CID suffix (e.g. "Arial,Bold" → "Arial-Bold")
 */
function normaliseFontName(raw = '') {
  return raw
    .replace(/^[A-Z]{6}\+/, '')   // strip subset prefix
    .replace(/,/g, '-')            // normalise comma separators
    .trim()
}

/**
 * Detect bold/italic from font name heuristics.
 */
function detectStyle(name) {
  const lower = name.toLowerCase()
  return {
    bold:   /bold|heavy|black|demi|semibold/.test(lower),
    italic: /italic|oblique|slanted/.test(lower),
  }
}

/**
 * Map a raw PDF font name to a web CSS font-family string.
 * Returns { cssFont, standardFont, confidence, cleanName }
 */
function mapFont(rawName) {
  const clean = normaliseFontName(rawName)
  const lower = clean.toLowerCase()
  const { bold, italic } = detectStyle(clean)

  for (const entry of WEB_FONT_MAP) {
    if (entry.match.some(m => lower.includes(m))) {
      // For web font map, prefer bold variant when bold detected
      if (entry.bold !== bold) continue
      const stdEntry = STANDARD_FONT_MAP.find(
        s => s.match.some(m => lower.includes(m)) && s.bold === bold && s.italic === italic
      )
      return {
        rawName,
        cleanName: clean,
        cssFont: entry.css,
        standardFont: stdEntry?.value ?? 'Helvetica',
        bold,
        italic,
        confidence: 'high',
      }
    }
  }

  // Fallback — can still render, just won't be pixel-perfect
  return {
    rawName,
    cleanName: clean,
    cssFont: bold ? '"Arial Bold", Arial, sans-serif' : 'Arial, sans-serif',
    standardFont: bold ? 'Helvetica-Bold' : 'Helvetica',
    bold,
    italic,
    confidence: 'fallback',
  }
}

// Export for use in browser (window) and Node.js
if (typeof module !== 'undefined') {
  module.exports = { mapFont, normaliseFontName, detectStyle }
} else {
  window.FontMap = { mapFont, normaliseFontName, detectStyle }
}
