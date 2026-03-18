/**
 * pending-file.ts
 *
 * Module-level singleton that passes a File object from the HomepageHub
 * drop zone to the tool page that Next.js navigates to.
 *
 * Because Next.js client-side navigation does NOT re-load JS modules,
 * this module-level state survives the router.push() transition and can
 * be read by the tool component on mount.
 *
 * Usage:
 *   // In HomepageHub
 *   setPendingFile(file)
 *   router.push('/compress')
 *
 *   // In CompressTool (on mount)
 *   const f = consumePendingFile()
 *   if (f) handleFile(f)
 */

let _pending: File | null = null

export function setPendingFile(file: File) {
  _pending = file
}

/** Returns and clears the pending file (call once per tool mount). */
export function consumePendingFile(): File | null {
  const f = _pending
  _pending = null
  return f
}
