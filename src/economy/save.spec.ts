import { afterEach, describe, expect, it } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine } from './engine'
import { clearSave, loadEngineState, saveEngineState, SAVE_KEY } from './save'

afterEach(() => {
  clearSave()
})

describe('save stub (M4)', () => {
  it('returns null with empty storage', () => {
    expect(loadEngineState()).toBeNull()
  })

  it('round-trips engine state through localStorage', () => {
    const engine = new EconomyEngine()
    engine.click()
    engine.click()
    engine.state.relays.whisper = 3
    saveEngineState(engine.state)

    const loaded = loadEngineState()
    expect(loaded).not.toBeNull()
    expect(loaded?.signal?.toString()).toBe('2')
    expect(loaded?.relays).toEqual({ whisper: 3 })

    // The engine can be rebuilt from a loaded state.
    const next = new EconomyEngine(loaded ?? {})
    expect(next.state.signal.toString()).toBe('2')
    expect(next.state.relays.whisper).toBe(3)
  })

  it('rejects a corrupted payload', () => {
    localStorage.setItem(SAVE_KEY, '{not-json')
    expect(loadEngineState()).toBeNull()
  })

  it('rejects a wrong version', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 99, signal: '5' }))
    expect(loadEngineState()).toBeNull()
  })

  it('rejects a missing signal field', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, relays: {} }))
    expect(loadEngineState()).toBeNull()
  })

  it('survives an engine state with a big Decimal', () => {
    const engine = new EconomyEngine({ signal: new Decimal('1234567') })
    saveEngineState(engine.state)
    const loaded = loadEngineState()
    expect(loaded?.signal?.toString()).toBe('1234567')
  })
})
