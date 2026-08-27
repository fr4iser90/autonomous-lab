/**
 * Signal Ascent — M12 spec tests (vitest).
 *
 * Covers:
 *  - Check-back: offline progress calculation, 8h cap, 25% rate
 *  - Settings persistence (autoAscend in save)
 *  - Clear save
 *  - simulateToLayer(20) soak (≤ 2M ticks)
 *  - v5 → v6 migration
 */
import { describe, it, expect, afterEach } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine } from '../src/economy/engine'
import { simulateToLayer } from './simulate'
import { clearSave, loadEngineState, saveEngineState, computeCheckBack, SAVE_KEY, SAVE_VERSION, CHECK_BACK_MAX_SECONDS, CHECK_BACK_RATE } from '../src/economy/save'

afterEach(() => {
  clearSave()
})

/* ------------------------------------------------------------------ */
/*  Save v6                                                             */
/* ------------------------------------------------------------------ */

describe('save v6 (M12)', () => {
  it('writes settings.autoAscend in payload', () => {
    const engine = new EconomyEngine()
    engine.state.autoAscend = true
    saveEngineState(engine.state, 1, 0, undefined, true)
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY)!) as { version: number; settings: { autoAscend: boolean } }
    expect(parsed.version).toBe(6)
    expect(parsed.settings.autoAscend).toBe(true)
  })

  it('loads settings.autoAscend from payload', () => {
    saveEngineState(new EconomyEngine().state, 1, 0, undefined, true)
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.settings.autoAscend).toBe(true)
  })

  it('migrates v5 payloads (no settings) to autoAscend false', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 5,
        signal: '100',
        relays: { whisper: 2 },
        layer: 3,
        upgrades: {},
        harmonics: 1,
        stats: { totalRelaysBought: 5, totalClicks: 10, playTime: 1000 },
        meta: { savedAt: 1 },
      }),
    )
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.settings.autoAscend).toBe(false)
    expect(loaded?.signal.toString()).toBe('100')
    expect(loaded?.layer).toBe(3)
    expect(loaded?.harmonics).toBe(1)
  })

  it('exports SAVE_VERSION === 6', () => {
    expect(SAVE_VERSION).toBe(6)
  })

  it('exports constants for check-back caps', () => {
    expect(CHECK_BACK_MAX_SECONDS).toBe(8 * 3600)
    expect(CHECK_BACK_RATE).toBe(0.25)
  })

  it('clearSave removes the key', () => {
    saveEngineState(new EconomyEngine().state, 1, 0)
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull()
    clearSave()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/*  Check-back: offline progress (M12)                                    */
/* ------------------------------------------------------------------ */

describe('check-back (M12)', () => {
  it('returns zero signal when savedAt equals currentAt', () => {
    const now = Date.now()
    const result = computeCheckBack(now, now, new Decimal(10))
    expect(result.signalDelta.isZero()).toBe(true)
    expect(result.elapsedSeconds).toBe(0)
    expect(result.applied).toBe(false)
  })

  it('returns zero signal when production is zero', () => {
    const result = computeCheckBack(0, 3600000, new Decimal(0)) // 1 hour later
    expect(result.signalDelta.isZero()).toBe(true)
    expect(result.elapsedSeconds).toBe(3600)
    expect(result.applied).toBe(false)
  })

  it('applies 25 % of 1-hour at 10/s production', () => {
    const result = computeCheckBack(0, 3600000, new Decimal(10)) // 1 hour later
    // gain = 10 * 3600 * 0.25 = 9000
    expect(result.signalDelta.toString()).toBe('9000')
    expect(result.elapsedSeconds).toBe(3600)
    expect(result.applied).toBe(true)
  })

  it('caps at 8 hours (28800 seconds)', () => {
    const result = computeCheckBack(0, 48 * 3600000, new Decimal(100)) // 48 hours later
    // gain = 100 * 28800 * 0.25 = 720000
    expect(result.signalDelta.toString()).toBe('720000')
    expect(result.elapsedSeconds).toBe(28800)
  })

  it('returns not-applied when gain < 0.5', () => {
    const result = computeCheckBack(0, 1000, new Decimal(0.1)) // 1 sec at 0.1/s
    // gain = 0.1 * 1 * 0.25 = 0.025
    expect(result.applied).toBe(false)
  })

  it('returns applied when gain >= 0.5', () => {
    const result = computeCheckBack(0, 10000, new Decimal(10)) // 10 sec at 10/s
    // gain = 10 * 10 * 0.25 = 25
    expect(result.applied).toBe(true)
  })

  it('handles negative elapsed (future savedAt) gracefully', () => {
    const result = computeCheckBack(Date.now() + 1000, Date.now(), new Decimal(10))
    expect(result.signalDelta.isZero()).toBe(true)
    expect(result.applied).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  simulateToLayer(20) soak (M12)                                        */
/* ------------------------------------------------------------------ */

describe('simulateToLayer(20) soak (M12)', () => {
  it('reaches layer 20 within 2M ticks', () => {
    const r = simulateToLayer(20, { seed: 0 })
    expect(r.ok).toBe(true)
    expect(r.reached).toBe(20)
    expect(r.ticks).toBeLessThanOrEqual(2_000_000)
    expect(Number.isFinite(Number(r.signal))).toBe(true)
    expect(r.totalRelays).toBeGreaterThan(0)
    expect(r.harmonics).toBeGreaterThan(0)
    expect(r.fail).toBeNull()
  }, 60000)
})
