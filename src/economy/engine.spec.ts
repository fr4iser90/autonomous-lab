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

describe('EconomyEngine (M3: Relays)', () => {
  it('buyRelay charges the base cost and increments the count', () => {
    const engine = new EconomyEngine({ signal: new Decimal(100) })
    const spent = engine.buyRelay('whisper')
    expect(spent).not.toBeNull()
    expect(spent!.toString()).toBe('15')
    expect(engine.state.signal.toString()).toBe('85')
    expect(engine.state.relays.whisper).toBe(1)
  })

  it('relay cost rises by costGrowth^owned', () => {
    const engine = new EconomyEngine({ signal: new Decimal(1000000) })
    engine.buyRelay('whisper')
    // 15 * 1.15 = 17.25
    expect(engine.relayCost('whisper').toString()).toBe('17.25')
    engine.buyRelay('whisper')
    // 15 * 1.15^2 = 19.8375
    expect(engine.relayCost('whisper').toString()).toBe('19.8375')
  })

  it('refuses an unaffordable relay (no negative Signal)', () => {
    const engine = new EconomyEngine({ signal: new Decimal(10) })
    const spent = engine.buyRelay('beam')
    expect(spent).toBeNull()
    expect(engine.state.signal.toString()).toBe('10')
    expect(engine.state.relays.beam ?? 0).toBe(0)
  })

  it('ACCEPT M3: buy generator; after 20 ticks Signal increases by the expected amount', () => {
    const engine = new EconomyEngine({ signal: new Decimal(100) })
    expect(engine.buyRelay('whisper')).not.toBeNull() // -15 -> 85, rate 0.5/sec
    for (let i = 0; i < 20; i++) engine.step(0.05) // 20 x 50 ms = 1 s
    // 85 + 0.5/sec * 1s = 85.5
    expect(engine.state.signal.toString()).toBe('85.5')
  })

  it('productionPerSec sums owned relays', () => {
    const engine = new EconomyEngine({ signal: new Decimal(0), relays: { whisper: 2, beam: 1 } })
    // 2 * 0.5 + 1 * 80 = 81
    expect(engine.productionPerSec().toString()).toBe('81')
  })

  it('throws on unknown relay id', () => {
    const engine = new EconomyEngine()
    expect(() => engine.relayCost('nope')).toThrow()
    expect(engine.buyRelay('nope')).toBeNull()
  })
})
