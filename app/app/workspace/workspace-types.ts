import { TOOL_HEX, TOOL_BG, type ToolKey } from '@/lib/ui/tool-colors'
export type { ToolKey }
export { TOOL_HEX, TOOL_BG }

export interface ToolDef {
  key: ToolKey
  label: string
  pro?: boolean
}

export type SigMode = 'idle' | 'placing'
export type AMode = 'yellow' | 'green' | 'pink' | 'note' | 'check'

export const TOOLS: ToolDef[] = [
  { key: 'edit',     label: 'Edit'     },
  { key: 'sign',     label: 'Sign'     },
  { key: 'annotate', label: 'Annotate' },
  { key: 'redact',   label: 'Redact'   },
  { key: 'compress', label: 'Compress' },
]

export const SVG_DEFS = `
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ws-edit" viewBox="0 0 16 16">
    <path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-8.5 8.5-2.83.71.71-2.83 8.5-8.5z"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-sign" viewBox="0 0 16 16">
    <path d="M2 12c2-3 4-5 5-5s1 2 2 2 2-1 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M13 12h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-annotate" viewBox="0 0 16 16">
    <rect x="2" y="5" width="8" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="2" y="11" width="6" height="1.5" rx=".75" fill="currentColor" opacity=".5"/>
    <rect x="1" y="4" width="3" height="9" rx="1.5" fill="currentColor"/>
  </symbol>
  <symbol id="ws-redact" viewBox="0 0 16 16">
    <rect x="2" y="5" width="12" height="6" rx="1.5" fill="currentColor"/>
    <line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ws-compress" viewBox="0 0 16 16">
    <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4"
      fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ws-upload" viewBox="0 0 24 24">
    <path d="M12 15V3M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </symbol>
</svg>
`
