/**
 * Signal Ascent — SaveService (M4 stub, v2 in M5, v3 in M6, v4 in M8,
 * v5 in M11, v6 in M12).
 *
 * Versioned localStorage persistence so a reload restores the economy,
 * the stratum, owned Resonator upgrades, permanent Harmonics, cumulative
 * stats, and settings (auto-ascend). M12: offline check-back (25 % of
 * 8 h cap), settings, clearSave.
 *
 * Migrations:
 *   v1 → v2: v1 payloads have no `layer`; they load at layer 1.
 *   v2 → v3: v2 payloads have no `upgrades`; they load with none.
 *   v3 → v4: v3 payloads have no `harmonics`; they load with none.
 *   v4 → v5: v4 payloads have no `stats`; they load with stats zeroes.
 *   v5 → v6: v5 payloads have no `settings`; they load with defaults.
 */
import { Decimal } from 'decimal.js'
import { clampHarmonics, clampLayer } from './layers'
import type { EconomyState } from './engine'

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

export const SAVE_KEY = 'signal-ascent-save-v1'
export const SAVE_VERSION = 6

/** Maximum offline seconds for check-back. */
export const CHECK_BACK_MAX_SECONDS = 8 * 3600 // 8 hours
/** Fraction of offline gain applied as check-back. */
export const CHECK_BACK_RATE = 0.25

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface SavePayload {
  version: number
  signal: string
  relays: Record<string, number>
  layer?: number
  upgrades?: Record<string, boolean>
  harmonics?: number
  stats?: {
    totalRelaysBought: number
    totalClicks: number
    playTime: number
  }
  settings?: {
    autoAscend: boolean
  }
  meta: { savedAt: number }
}

/** Everything a restored session needs. */
export interface LoadedSave {
  signal: Decimal
  relays: Record<string, number>
  layer: number
  upgrades: Record<string, boolean>
  harmonics: number
  stats: { totalRelaysBought: number; totalClicks: number; playTime: number }
  settings: { autoAscend: boolean }
  /** Timestamp the save was written (for check-back). */
  savedAt: number
}

export interface CheckBackResult {
  /** Signal gained from offline progress (null if no valid save existed). */
  signalDelta: Decimal
  /** Seconds elapsed since last save (capped at CHECK_BACK_MAX_SECONDS). */
  elapsedSeconds: number
  /** Whether check-back was applied at all. */
  applied: boolean
}

/* ------------------------------------------------------------------ */
/*  Check-back: offline progress calculation (M12)                        */
/* ------------------------------------------------------------------ */

/**
 * Compute how much Signal a player should gain for time spent offline.
 *
 * The check-back rate is `CHECK_BACK_RATE` of a capped 8-hour session,
 * computed at the last saved production-per-second.  If the player has
 * no relays (0 production), no check-back is given — idle time without
 * generators produces nothing.
 *
 * This function is pure: it does NOT mutate state.
 */
export function computeCheckBack(
  savedAt: number,
  currentAt: number,
  perSec: Decimal,
): CheckBackResult {
  const elapsedMs = currentAt - savedAt
  if (elapsedMs <= 0) return { signalDelta: new Decimal(0), elapsedSeconds: 0, applied: false }

  // Cap at 8 hours.
  const cappedMs = Math.min(elapsedMs, CHECK_BACK_MAX_SECONDS * 1000)
  const cappedSecs = cappedMs / 1000

  // If no production, no offline gain.
  if (perSec.lte(0)) return { signalDelta: new Decimal(0), elapsedSeconds: cappedSecs, applied: false }

  const gain = perSec.times(cappedSecs).times(CHECK_BACK_RATE)
  return {
    signalDelta: gain,
    elapsedSeconds: cappedSecs,
    applied: gain.gte(0.5), // only show if ≥ 0.5 signal
  }
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                         */
/* ------------------------------------------------------------------ */

export function saveEngineState(
  state: EconomyState,
  layer: number,
  harmonics: number,
  stats?: { totalRelaysBought: number; totalClicks: number; playTime: number },
  autoAscend?: boolean,
): void {
  const payload: SavePayload = {
    version: SAVE_VERSION,
    signal: state.signal.toString(),
    relays: { ...state.relays },
    layer: clampLayer(layer),
    upgrades: { ...state.upgrades },
    harmonics: clampHarmonics(harmonics),
    stats,
    settings: { autoAscend: autoAscend ?? false },
    meta: { savedAt: Date.now() },
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable — a stub must never break play */
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
    const layer = typeof parsed.layer === 'number' ? clampLayer(parsed.layer) : 1
    const rawUpgrades =
      parsed.upgrades && typeof parsed.upgrades === 'object' ? parsed.upgrades : {}
    const upgrades: Record<string, boolean> = {}
    for (const [id, owned] of Object.entries(rawUpgrades)) {
      if (owned === true) upgrades[id] = true
    }
    const harmonics =
      typeof parsed.harmonics === 'number' ? clampHarmonics(parsed.harmonics) : 0
    const stats = parsed.stats && typeof parsed.stats === 'object'
      ? {
          totalRelaysBought: typeof parsed.stats.totalRelaysBought === 'number'
            ? parsed.stats.totalRelaysBought : 0,
          totalClicks: typeof parsed.stats.totalClicks === 'number'
            ? parsed.stats.totalClicks : 0,
          playTime: typeof parsed.stats.playTime === 'number'
            ? parsed.stats.playTime : 0,
        }
      : { totalRelaysBought: 0, totalClicks: 0, playTime: 0 }

    // v6: settings (auto-ascend).
    const autoAscend = parsed.settings && typeof parsed.settings === 'object'
      ? !!parsed.settings.autoAscend
      : false

    return {
      signal: new Decimal(parsed.signal),
      relays,
      layer,
      upgrades,
      harmonics,
      stats,
      settings: { autoAscend },
      savedAt: typeof parsed.meta?.savedAt === 'number' ? parsed.meta.savedAt : Date.now(),
    }
  } catch {
    return null
  }
}

/**
 * Clear the localStorage save (M12).  This does NOT destroy the shell —
 * the next load simply starts fresh.
 */
export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* noop */
  }
}
