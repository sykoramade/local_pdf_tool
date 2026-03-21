/**
 * Canonical tool accent colours — single source of truth.
 * Consumed by WorkspaceShell (selector rail + L3 strips) and HomepageHub (cards).
 * Matches V2 spec exactly.
 */

export type ToolKey = 'edit' | 'sign' | 'annotate' | 'redact' | 'compress'

/** Primary hex accent per tool. */
export const TOOL_HEX: Record<ToolKey, string> = {
  edit:     '#818cf8',
  sign:     '#22d3a0',
  annotate: '#fbbf24',
  redact:   '#f97066',
  compress: '#60a5fa',
}

/** Low-opacity background tint for pill selectors and strip headers. */
export const TOOL_BG: Record<ToolKey, string> = {
  edit:     'rgba(129,140,248,.20)',
  sign:     'rgba(34,211,160,.20)',
  annotate: 'rgba(251,191,36,.20)',
  redact:   'rgba(249,112,102,.20)',
  compress: 'rgba(96,165,250,.20)',
}
