import { describe, expect, it } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine, initialState } from './engine'

describe('EconomyEngine (M2)', () => {
  it('starts with zero Signal', () => {
    const engine = new EconomyEngine()
    expect(engine.state.signal.toString()).toBe('0')
  })

  it('100 clicks -> Signal == 100', () => {
    const engine = new EconomyEngine()
    for (let i = 0; i < 100; i++) engine.click()
    expect(engine.state.signal.toString()).toBe('100')
  })

  it('accepts a starting state (load path)', () => {
    const engine = new EconomyEngine({ signal: new Decimal('777') })
    engine.click()
    expect(engine.state.signal.toString()).toBe('778')
  })

  it('step is a no-op before M3 (no production yet)', () => {
    const engine = new EconomyEngine({ signal: new Decimal('5') })
    for (let i = 0; i < 200; i++) engine.step(0.05)
    expect(engine.state.signal.toString()).toBe('5')
  })

  it('initialState returns fresh Decimals', () => {
    const a = initialState()
    a.signal = a.signal.plus(10)
    expect(initialState().signal.toString()).toBe('0')
  })
})
