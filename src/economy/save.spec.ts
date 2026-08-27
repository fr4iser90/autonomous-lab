import { afterEach, describe, expect, it } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine } from './engine'
import { LAYER_CAP } from '../data/layers'
import { clearSave, loadEngineState, saveEngineState, SAVE_KEY } from './save'

afterEach(() => {
  clearSave()
})

describe('save stub (M4, v2 in M5)', () => {
  it('returns null with empty storage', () => {
    expect(loadEngineState()).toBeNull()
  })

  it('round-trips engine state + layer through localStorage', () => {
    const engine = new EconomyEngine()
    engine.click()
    engine.click()
    engine.state.relays.whisper = 3
    saveEngineState(engine.state, 2)

    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.signal?.toString()).toBe('2')
    expect(loaded?.relays).toEqual({ whisper: 3 })
    expect(loaded?.layer).toBe(2)

    // The engine can be rebuilt from a loaded state.
    const next = new EconomyEngine(loaded ? { signal: loaded.signal, relays: loaded.relays } : {})
    expect(next.state.signal.toString()).toBe('2')
    expect(next.state.relays.whisper).toBe(3)
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
    saveEngineState(engine.state, LAYER_CAP + 100)
    expect(loadEngineState()?.layer).toBe(LAYER_CAP)
    saveEngineState(engine.state, -3)
    expect(loadEngineState()?.layer).toBe(1)
  })

  it('survives an engine state with a big Decimal', () => {
    const engine = new EconomyEngine({ signal: new Decimal('1234567') })
    saveEngineState(engine.state, 1)
    const loaded = loadEngineState()
    expect(loaded?.signal?.toString()).toBe('1234567')
  })
})
