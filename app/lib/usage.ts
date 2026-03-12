/**
 * Client-side usage gate for anonymous users.
 * Signed-in users are never gated.
 *
 * Anonymous limit: FREE_USES_PER_DAY operations per calendar day.
 * Tracked in localStorage — resets at midnight local time.
 */

export const FREE_USES_PER_DAY = 3

function todayKey(): string {
  // Use local date so the counter resets at local midnight, not UTC midnight
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `localpdf_uses_${yyyy}-${mm}-${dd}`
}

export function getUsesToday(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(todayKey()) ?? '0', 10)
}

export function incrementUses(): void {
  if (typeof window === 'undefined') return
  const key = todayKey()
  const current = parseInt(localStorage.getItem(key) ?? '0', 10)
  localStorage.setItem(key, String(current + 1))
}

export function usesRemaining(): number {
  return Math.max(0, FREE_USES_PER_DAY - getUsesToday())
}

export function canUse(): boolean {
  return usesRemaining() > 0
}
