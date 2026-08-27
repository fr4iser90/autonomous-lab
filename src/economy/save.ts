/**
 * Signal Ascent — SaveService stub (M4, v2 in M5, v3 in M6, v4 in M8).
 * Versioned localStorage persistence so a reload restores the economy,
 * the stratum, owned Resonator upgrades, and permanent Harmonics. M10/M12
 * will extend this (offline progress, settings, more migrations); the
 * schema key is locked — only `version` grows.
 *
 * v1 → v2 migration: v1 payloads have no `layer`; they load at layer 1
 * (the only layer that existed when v1 shipped).
 * v2 → v3 migration: v2 payloads have no `upgrades`; they load with none
 * (no Resonators existed when v2 shipped).
 * v3 → v4 migration: v3 payloads have no `harmonics`; they load with none
 * (no Ascends existed when v3 shipped).
 */
import { Decimal } from 'decimal.js'
import { clampHarmonics, clampLayer } from './layers'
import type { EconomyState } from './engine'

export const SAVE_KEY = 'signal-ascent-save-v1'
export const SAVE_VERSION = 4

interface SavePayload {
  version: number
  signal: string
  relays: Record<string, number>
  layer?: number
  upgrades?: Record<string, boolean>
  harmonics?: number
  meta: { savedAt: number }
}

/** Everything a restored session needs. */
export interface LoadedSave {
  signal: Decimal
  relays: Record<string, number>
  layer: number
  upgrades: Record<string, boolean>
  harmonics: number
}

export function saveEngineState(state: EconomyState, layer: number, harmonics: number): void {
  const payload: SavePayload = {
    version: SAVE_VERSION,
    signal: state.signal.toString(),
    relays: { ...state.relays },
    layer: clampLayer(layer),
    upgrades: { ...state.upgrades },
    harmonics: clampHarmonics(harmonics),
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
    // v1/v2 have no upgrades field → migrate to none owned.
    const rawUpgrades =
      parsed.upgrades && typeof parsed.upgrades === 'object' ? parsed.upgrades : {}
    const upgrades: Record<string, boolean> = {}
    for (const [id, owned] of Object.entries(rawUpgrades)) {
      if (owned === true) upgrades[id] = true
    }
    // v1–v3 have no harmonics field → migrate to none earned.
    const harmonics =
      typeof parsed.harmonics === 'number' ? clampHarmonics(parsed.harmonics) : 0
    return { signal: new Decimal(parsed.signal), relays, layer, upgrades, harmonics }
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
