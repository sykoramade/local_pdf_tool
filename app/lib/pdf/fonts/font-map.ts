/**
 * PDF Font Mapping
 * Maps raw PDF font names to web CSS font stacks + pdf-lib StandardFont strings.
 * Validated in spike: ~85% high-confidence coverage on real-world PDFs.
 *
 * Known gaps (tracked in docs/lessons-learned.md):
 * - Bold/italic not yet preserved in output PDF (editor overlay shows it, save doesn't)
 * - Heavily subsetted custom corporate fonts fall back to Arial
 */

export interface FontMatch {
  rawName: string
  cleanName: string
  cssFont: string       // for the editor overlay (CSS font-family)
  standardFont: string  // pdf-lib StandardFont string value
  bold: boolean
  italic: boolean
  confidence: 'high' | 'fallback'
}

const WEB_FONT_RULES: Array<{
  match: string[]
  bold: boolean
  css: string
  standard: string
}> = [
  // Arimo/Tinos/Cousine are metric-compatible with Arial/Times/Courier — loaded via next/font CSS vars
  { match: ['helvetica', 'arial', 'swiss'],        bold: false, css: 'var(--font-arimo), Arial, Helvetica, sans-serif',               standard: 'Helvetica' },
  { match: ['helvetica', 'arial', 'swiss'],        bold: true,  css: 'var(--font-arimo), "Arial Bold", "Helvetica Bold", sans-serif',  standard: 'Helvetica-Bold' },
  { match: ['times', 'roman', 'minion'],           bold: false, css: 'var(--font-tinos), "Times New Roman", Times, serif',             standard: 'Times-Roman' },
  { match: ['times', 'roman', 'minion'],           bold: true,  css: 'var(--font-tinos), "Times New Roman", Times, serif',             standard: 'Times-Bold' },
  { match: ['courier', 'mono', 'typewriter'],      bold: false, css: 'var(--font-cousine), "Courier New", Courier, monospace',         standard: 'Courier' },
  { match: ['courier', 'mono', 'typewriter'],      bold: true,  css: 'var(--font-cousine), "Courier New", Courier, monospace',         standard: 'Courier-Bold' },
  { match: ['georgia'],                            bold: false, css: 'Georgia, serif',                             standard: 'Times-Roman' },
  { match: ['verdana'],                            bold: false, css: 'Verdana, Geneva, sans-serif',                standard: 'Helvetica' },
  { match: ['calibri'],                            bold: false, css: 'Calibri, "Gill Sans", sans-serif',           standard: 'Helvetica' },
  { match: ['trebuchet'],                          bold: false, css: '"Trebuchet MS", sans-serif',                 standard: 'Helvetica' },
  { match: ['garamond', 'palatino', 'book'],       bold: false, css: 'Garamond, Palatino, serif',                 standard: 'Times-Roman' },
  { match: ['futura', 'gothic', 'franklin'],       bold: false, css: '"Century Gothic", Futura, sans-serif',      standard: 'Helvetica' },
  { match: ['symbol'],                             bold: false, css: 'Symbol',                                     standard: 'Symbol' },
  { match: ['zapf', 'dingbat', 'wingding'],        bold: false, css: 'Wingdings, ZapfDingbats',                   standard: 'ZapfDingbats' },
]

/**
 * Given a base standard font name (from mapFont) and user-specified bold/italic
 * overrides, return the correct pdf-lib standard font string.
 * Respects the Oblique/Italic rule for Helvetica/Courier vs Times.
 */
export function resolveStandardFont(
  baseStandardFont: string,
  bold: boolean,
  italic: boolean,
): string {
  // Identify family from the base name
  let family: string
  if (baseStandardFont.startsWith('Times')) family = 'Times'
  else if (baseStandardFont.startsWith('Courier')) family = 'Courier'
  else if (baseStandardFont.startsWith('Symbol')) return 'Symbol'
  else if (baseStandardFont.startsWith('ZapfDingbats')) return 'ZapfDingbats'
  else family = 'Helvetica'

  // Helvetica and Courier use Oblique; Times uses Italic
  const italicSuffix = family === 'Times' ? 'Italic' : 'Oblique'

  if (!bold && !italic) return family === 'Times' ? 'Times-Roman' : family
  if (bold && !italic) return `${family}-Bold`
  if (!bold && italic) return `${family}-${italicSuffix}`
  return `${family}-Bold${italicSuffix}`
}

/** Strip subset prefix (ABCDEF+FontName → FontName) and normalise separators */
function normaliseName(raw: string): string {
  return raw.replace(/^[A-Z]{6}\+/, '').replace(/,/g, '-').trim()
}

function detectStyle(name: string) {
  const l = name.toLowerCase()
  return {
    bold:   /bold|heavy|black|demi|semibold/.test(l),
    italic: /italic|oblique|slanted/.test(l),
  }
}

export function mapFont(rawName: string): FontMatch {
  const clean = normaliseName(rawName)
  const lower = clean.toLowerCase()
  const { bold, italic } = detectStyle(clean)

  for (const rule of WEB_FONT_RULES) {
    if (!rule.match.some(m => lower.includes(m))) continue
    if (rule.bold !== bold) continue
    // pdf-lib uses 'Oblique' for Helvetica/Courier italic, 'Italic' for Times
    const isObliqueFamily = rule.standard.startsWith('Helvetica') || rule.standard.startsWith('Courier')
    const italicSuffix = isObliqueFamily ? 'Oblique' : 'Italic'
    let standardFont = rule.standard
    if (italic) {
      standardFont = rule.standard.includes('Bold')
        ? rule.standard.replace('Bold', `Bold${isObliqueFamily ? 'Oblique' : 'Italic'}`)
        : rule.standard + `-${italicSuffix}`
    }

    return {
      rawName,
      cleanName: clean,
      cssFont: rule.css,
      standardFont,
      bold,
      italic,
      confidence: 'high',
    }
  }

  // Fallback
  return {
    rawName,
    cleanName: clean,
    cssFont: bold ? 'var(--font-arimo), "Arial Bold", Arial, sans-serif' : 'var(--font-arimo), Arial, sans-serif',
    standardFont: bold ? 'Helvetica-Bold' : 'Helvetica',
    bold,
    italic,
    confidence: 'fallback',
  }
}
