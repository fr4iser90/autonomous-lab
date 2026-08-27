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

describe('EconomyEngine (M6: Resonator upgrades)', () => {
  it('clickPower is 1 with no upgrades; click gains +1', () => {
    const engine = new EconomyEngine()
    expect(engine.clickPower().toString()).toBe('1')
    expect(engine.click().toString()).toBe('1')
  })

  it('click upgrades multiply clicks (amp ×2, overdrive ×5 → ×10)', () => {
    const engine = new EconomyEngine({ signal: new Decimal(20_000) })
    expect(engine.buyUpgrade('amp')).not.toBeNull() // -100 -> 19900
    expect(engine.clickPower().toString()).toBe('2')
    expect(engine.buyUpgrade('overdrive')).not.toBeNull() // -10000 -> 9900
    expect(engine.clickPower().toString()).toBe('10')
    engine.click()
    expect(engine.state.signal.toString()).toBe('9910') // 9900 + 10
  })

  it('buyUpgrade charges the cost once; re-buying is a no-op', () => {
    const engine = new EconomyEngine({ signal: new Decimal(100) })
    expect(engine.buyUpgrade('amp')).not.toBeNull()
    expect(engine.state.signal.toString()).toBe('0')
    expect(engine.isUpgradeOwned('amp')).toBe(true)
    expect(engine.buyUpgrade('amp')).toBeNull()
  })

  it('refuses unaffordable and unknown upgrades (no state change)', () => {
    const engine = new EconomyEngine({ signal: new Decimal(50) })
    expect(engine.buyUpgrade('amp')).toBeNull()
    expect(engine.buyUpgrade('nope')).toBeNull()
    expect(engine.state.signal.toString()).toBe('50')
    expect(Object.keys(engine.state.upgrades)).toHaveLength(0)
  })

  it('relay upgrades double only that relay (2 whisper + harmonics → 2/sec, pulse untouched)', () => {
    const engine = new EconomyEngine({
      signal: new Decimal(1_000),
      relays: { whisper: 2, pulse: 1 },
    })
    expect(engine.buyUpgrade('whisper-harmonics')).not.toBeNull() // -500
    // 2 * 0.5 * 2 + 1 * 6 = 2 + 6 = 8
    expect(engine.productionPerSec().toString()).toBe('8')
  })

  it('global upgrades scale ALL relay output (×1.5)', () => {
    const engine = new EconomyEngine({
      signal: new Decimal(30_000),
      relays: { whisper: 2, pulse: 1 },
    })
    expect(engine.productionPerSec().toString()).toBe('7') // 1 + 6
    expect(engine.buyUpgrade('global-resonance')).not.toBeNull() // -25000
    // (2 * 0.5 + 6) * 1.5 = 10.5
    expect(engine.productionPerSec().toString()).toBe('10.5')
  })

  it('relay + global multipliers compose (2 whisper, ×2 relay, ×1.5 global → 3)', () => {
    const engine = new EconomyEngine({
      signal: new Decimal(26_000),
      relays: { whisper: 2 },
    })
    engine.buyUpgrade('whisper-harmonics')
    engine.buyUpgrade('global-resonance')
    // (2 * 0.5 * 2) * 1.5 = 3
    expect(engine.productionPerSec().toString()).toBe('3')
  })
})

describe('EconomyEngine (M8: Ascend support)', () => {
  it('resetLayerSlice wipes Signal, Relays and Resonator upgrades', () => {
    const engine = new EconomyEngine({
      signal: new Decimal('12345'),
      relays: { whisper: 3, pulse: 2 },
      upgrades: { amp: true },
    })
    expect(engine.productionPerSec().gt(0)).toBe(true)
    engine.resetLayerSlice()
    expect(engine.state.signal.toString()).toBe('0')
    expect(Object.keys(engine.state.relays)).toHaveLength(0)
    expect(engine.isUpgradeOwned('amp')).toBe(false)
    expect(engine.productionPerSec().toString()).toBe('0')
  })

  it('the harmonic multiplier boosts click power and production (ACCEPT: mult > 1)', () => {
    const engine = new EconomyEngine({ relays: { whisper: 2 } }, '1.02')
    // 2 * 0.5 * 1.02 = 1.02
    expect(engine.productionPerSec().toString()).toBe('1.02')
    expect(engine.clickPower().toString()).toBe('1.02')
    engine.click()
    expect(engine.state.signal.toString()).toBe('1.02')
  })

  it('setHarmonicMult accepts finite values >= 1 and rejects corrupt input', () => {
    const engine = new EconomyEngine()
    expect(engine.harmonicMult.toString()).toBe('1')
    engine.setHarmonicMult('1.02')
    expect(engine.harmonicMult.toString()).toBe('1.02')
    engine.setHarmonicMult(Number.NaN)
    expect(engine.harmonicMult.toString()).toBe('1.02') // unchanged
    engine.setHarmonicMult('0.5')
    expect(engine.harmonicMult.toString()).toBe('1.02') // sub-1 rejected
    engine.setHarmonicMult('not-a-number')
    expect(engine.harmonicMult.toString()).toBe('1.02')
  })

  it('the harmonic multiplier is not wiped by resetLayerSlice (it persists)', () => {
    const engine = new EconomyEngine({ relays: { whisper: 1 } }, '1.06')
    engine.resetLayerSlice()
    expect(engine.harmonicMult.toString()).toBe('1.06')
  })
})
