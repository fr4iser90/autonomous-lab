/**
 * Signal Ascent — SaveService stub (M4).
 * Versioned localStorage persistence so a reload restores the economy.
 * M10/M12 will extend this (offline progress, settings, migrations);
 * the schema key and version are locked in now so later milestones
 * only grow the payload, never rename it.
 */
import { Decimal } from 'decimal.js'
import type { EconomyState } from './engine'

export const SAVE_KEY = 'signal-ascent-save-v1'
export const SAVE_VERSION = 1

interface SavePayload {
  version: number
  signal: string
  relays: Record<string, number>
  meta: { savedAt: number }
}

export function saveEngineState(state: EconomyState): void {
  const payload: SavePayload = {
    version: SAVE_VERSION,
    signal: state.signal.toString(),
    relays: { ...state.relays },
    meta: { savedAt: Date.now() },
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable (private mode / quota) — a stub must never break play */
  }
}

export function loadEngineState(): Partial<EconomyState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SavePayload>
    if (parsed?.version !== SAVE_VERSION) return null
    if (typeof parsed.signal !== 'string') return null
    return {
      signal: new Decimal(parsed.signal),
      relays: parsed.relays && typeof parsed.relays === 'object' ? parsed.relays : {},
    }
  } catch {
    return null
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* noop */
  }
}
