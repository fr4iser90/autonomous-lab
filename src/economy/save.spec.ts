import { afterEach, describe, expect, it } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine } from './engine'
import { LAYER_CAP } from '../data/layers'
import { clearSave, loadEngineState, saveEngineState, SAVE_KEY } from './save'

afterEach(() => {
  clearSave()
})

describe('save stub (M4, v2 in M5, v3 in M6, v4 in M8)', () => {
  it('returns null with empty storage', () => {
    expect(loadEngineState()).toBeNull()
  })

  it('round-trips engine state + layer + upgrades through localStorage', () => {
    const engine = new EconomyEngine()
    engine.click()
    engine.click()
    engine.state.relays.whisper = 3
    engine.state.upgrades.amp = true
    saveEngineState(engine.state, 2, 0)

    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.signal?.toString()).toBe('2')
    expect(loaded?.relays).toEqual({ whisper: 3 })
    expect(loaded?.layer).toBe(2)
    expect(loaded?.upgrades).toEqual({ amp: true })
    expect(loaded?.harmonics).toBe(0)

    // The engine can be rebuilt from a loaded state (M6: upgrades too).
    const next = new EconomyEngine(
      loaded
        ? { signal: loaded.signal, relays: loaded.relays, upgrades: loaded.upgrades }
        : {},
    )
    expect(next.state.signal.toString()).toBe('2')
    expect(next.state.relays.whisper).toBe(3)
    expect(next.clickPower().toString()).toBe('2')
  })

  it('writes SAVE_VERSION 4 payloads with the harmonics field', () => {
    const engine = new EconomyEngine()
    saveEngineState(engine.state, 1, 0)
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY)!) as {
      version: number
      upgrades: Record<string, boolean>
      harmonics: number
    }
    expect(parsed.version).toBe(4)
    expect(parsed.upgrades).toEqual({})
    expect(parsed.harmonics).toBe(0)
  })

  it('migrates v2 payloads (no upgrades field) to none owned', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 2,
        signal: '5',
        relays: { whisper: 2 },
        layer: 3,
        meta: { savedAt: 1 },
      }),
    )
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.signal?.toString()).toBe('5')
    expect(loaded?.layer).toBe(3)
    expect(loaded?.upgrades).toEqual({})
    expect(loaded?.harmonics).toBe(0) // v2 predates M8 ascends
  })

  it('migrates v1 payloads (no layer field) to layer 1', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 1, signal: '5', relays: { whisper: 2 }, meta: { savedAt: 1 } }),
    )
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.signal?.toString()).toBe('5')
    expect(loaded?.relays).toEqual({ whisper: 2 })
    expect(loaded?.layer).toBe(1)
    expect(loaded?.harmonics).toBe(0) // v1 predates M8 ascends
  })

  it('rejects a corrupted payload', () => {
    localStorage.setItem(SAVE_KEY, '{not-json')
    expect(loadEngineState()).toBeNull()
  })

  it('rejects a wrong version', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 99, signal: '5' }))
    expect(loadEngineState()).toBeNull()
  })

  it('rejects a missing signal field (v1 or v2)', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, relays: {} }))
    expect(loadEngineState()).toBeNull()
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, relays: {}, layer: 1 }))
    expect(loadEngineState()).toBeNull()
  })

  it('clamps an out-of-range stored layer', () => {
    const engine = new EconomyEngine()
    saveEngineState(engine.state, LAYER_CAP + 100, 0)
    expect(loadEngineState()?.layer).toBe(LAYER_CAP)
    saveEngineState(engine.state, -3, 0)
    expect(loadEngineState()?.layer).toBe(1)
  })

  it('survives an engine state with a big Decimal', () => {
    const engine = new EconomyEngine({ signal: new Decimal('1234567') })
    saveEngineState(engine.state, 1, 0)
    const loaded = loadEngineState()
    expect(loaded?.signal?.toString()).toBe('1234567')
  })
})

describe('harmonics persistence (M8, v4)', () => {
  it('round-trips harmonics through localStorage', () => {
    const engine = new EconomyEngine()
    saveEngineState(engine.state, 3, 5)
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.layer).toBe(3)
    expect(loaded?.harmonics).toBe(5)
  })

  it('migrates v3 payloads (no harmonics field) to 0', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
        signal: '42',
        relays: {},
        layer: 2,
        upgrades: {},
        meta: { savedAt: 1 },
      }),
    )
    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.layer).toBe(2)
    expect(loaded?.harmonics).toBe(0)
  })

  it('clamps corrupt stored harmonics (negative / NaN / fractional)', () => {
    const engine = new EconomyEngine()
    saveEngineState(engine.state, 1, -7)
    expect(loadEngineState()?.harmonics).toBe(0)
    saveEngineState(engine.state, 1, Number.NaN)
    expect(loadEngineState()?.harmonics).toBe(0)
    saveEngineState(engine.state, 1, 4.9)
    expect(loadEngineState()?.harmonics).toBe(4)
  })

  it('rejects a v4 payload with missing signal', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 4, relays: {}, layer: 1, upgrades: {}, harmonics: 2, meta: { savedAt: 1 } }),
    )
    expect(loadEngineState()).toBeNull()
  })
})
