/**
 * Persist and retrieve drawn/typed signatures in localStorage.
 * Max 5 stored; oldest trimmed automatically.
 */

export interface StoredSignature {
  id: string
  text?: string
  drawingDataUrl?: string
  createdAt: number
}

const KEY = 'localpdf_signatures'
const MAX = 5

function load(): StoredSignature[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(sigs: StoredSignature[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sigs))
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

export function getSavedSignatures(): StoredSignature[] {
  return load()
}

export function saveSignature(sig: Pick<StoredSignature, 'text' | 'drawingDataUrl'>): StoredSignature {
  const entry: StoredSignature = {
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...sig,
    createdAt: Date.now(),
  }
  const existing = load()
  const updated = [entry, ...existing].slice(0, MAX)
  persist(updated)
  return entry
}

export function deleteSignature(id: string): void {
  const updated = load().filter(s => s.id !== id)
  persist(updated)
}
