/**
 * Signal Ascent — SaveService stub (M4, v2 in M5).
 * Versioned localStorage persistence so a reload restores the economy
 * AND the stratum. M10/M12 will extend this (offline progress, settings,
 * more migrations); the schema key is locked — only `version` grows.
 *
 * v1 → v2 migration: v1 payloads have no `layer`; they load at layer 1
 * (the only layer that existed when v1 shipped).
 */
import { Decimal } from 'decimal.js'
import { clampLayer } from './layers'
import type { EconomyState } from './engine'

export const SAVE_KEY = 'signal-ascent-save-v1'
export const SAVE_VERSION = 2

interface SavePayload {
  version: number
  signal: string
  relays: Record<string, number>
  layer?: number
  meta: { savedAt: number }
}

/** Everything a restored session needs. */
export interface LoadedSave {
  signal: Decimal
  relays: Record<string, number>
  layer: number
}

export function saveEngineState(state: EconomyState, layer: number): void {
  const payload: SavePayload = {
    version: SAVE_VERSION,
    signal: state.signal.toString(),
    relays: { ...state.relays },
    layer: clampLayer(layer),
    meta: { savedAt: Date.now() },
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable (private mode / quota) — a stub must never break play */
  }
}

export function loadEngineState(): LoadedSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SavePayload>
    if (typeof parsed?.version !== 'number') return null
    if (parsed.version < 1 || parsed.version > SAVE_VERSION) return null
    if (typeof parsed.signal !== 'string') return null
    const relays = parsed.relays && typeof parsed.relays === 'object' ? parsed.relays : {}
    // v1 has no layer field → migrate to layer 1.
    const layer = typeof parsed.layer === 'number' ? clampLayer(parsed.layer) : 1
    return { signal: new Decimal(parsed.signal), relays, layer }
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
