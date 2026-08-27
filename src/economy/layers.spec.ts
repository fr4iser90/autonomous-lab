import { describe, expect, it } from 'vitest'
import { LAYER_CAP, layerDef } from '../data/layers'
import { HARMONIC_BONUS, LayerEngine, clampHarmonics, clampLayer, harmonicReward } from './layers'

describe('LayerEngine (M5)', () => {
  it('starts at layer 1 with the 1e6 ascend threshold', () => {
    const layers = new LayerEngine()
    expect(layers.state.layer).toBe(1)
    expect(layers.def.id).toBe(1)
    expect(layers.def.threshold.toString()).toBe('1000000')
    expect(layers.next?.id).toBe(2)
    // layer 2 threshold: 1e6 × 1.1 = 1.1e6
    expect(layers.next?.threshold.toString()).toBe('1100000')
  })

  it('only ascends once the threshold is met', () => {
    const layers = new LayerEngine()
    expect(layers.canAscend('999999')).toBe(false)
    expect(layers.canAscend('1000000')).toBe(true)
    expect(layers.ascend('999999')).toBe(false)
    expect(layers.state.layer).toBe(1)
    expect(layers.ascend('1000000')).toBe(true)
    expect(layers.state.layer).toBe(2)
    // Next threshold is 1.1e6 — the 1e6 total is not enough.
    expect(layers.canAscend('1000000')).toBe(false)
    expect(layers.ascend('1000000')).toBe(false)
    expect(layers.ascend('1100000')).toBe(true)
    // After ascending to layer 3, threshold is 1.21e6
    expect(layers.canAscend('1200000')).toBe(false)
    expect(layers.ascend('1210000')).toBe(true)
    expect(layers.state.layer).toBe(4)
  })

  it('stops at LAYER_CAP: next is null, ascend is a no-op', () => {
    const layers = new LayerEngine({ layer: LAYER_CAP })
    expect(layers.next).toBeNull()
    // Layer 50's threshold is 1e6 × 1.1^49 ≈ 118 billion — plenty of Signal…
    expect(layers.canAscend('1e60')).toBe(true)
    // …but the cap holds: ascend is still a no-op.
    expect(layers.ascend('1e60')).toBe(false)
    expect(layers.state.layer).toBe(LAYER_CAP)
  })

  it('clamps constructor layer values', () => {
    expect(new LayerEngine({ layer: 0 }).state.layer).toBe(1)
    expect(new LayerEngine({ layer: -4 }).state.layer).toBe(1)
    expect(new LayerEngine({ layer: LAYER_CAP + 5 }).state.layer).toBe(LAYER_CAP)
    expect(new LayerEngine({ layer: 2.9 }).state.layer).toBe(2)
    expect(clampLayer(Number.NaN)).toBe(1)
    expect(clampLayer(Number.POSITIVE_INFINITY)).toBe(LAYER_CAP)
  })
})

describe('Harmonics + Ascend (M8)', () => {
  it('harmonicReward is floor((signal / threshold)^0.75) (M12)', () => {
    expect(harmonicReward('1000000', '1000000')).toBe(1) // exactly at threshold
    expect(harmonicReward('999999', '1000000')).toBe(0) // below
    expect(harmonicReward('4000000', '1000000')).toBe(2) // 4^0.75 ≈ 2.83
    expect(harmonicReward('15999999', '1000000')).toBe(7) // 15.999999^0.75 ≈ 7.99
    expect(harmonicReward('16000000', '1000000')).toBe(8) // 16^0.75 = 8
    expect(harmonicReward('100000000', '1000000')).toBe(31) // 100^0.75 ≈ 31.62
  })

  it('ascend grants harmonics > 0 and a permanent mult > 1 (ACCEPT)', () => {
    const layers = new LayerEngine()
    expect(layers.state.harmonics).toBe(0)
    expect(layers.harmonicMult().toString()).toBe('1')
    expect(layers.ascend('1000000')).toBe(true)
    expect(layers.state.layer).toBe(2)
    expect(layers.state.harmonics).toBeGreaterThan(0)
    expect(layers.harmonicMult().gt(1)).toBe(true)
    expect(layers.harmonicMult().toString()).toBe('1.05')
  })

  it('harmonics accumulate across ascends and the multiplier compounds exponentially', () => {
    const layers = new LayerEngine()
    layers.ascend('1000000') // layer 1 → 2: 1e6/1e6=1 → +1
    layers.ascend('10000000') // layer 2 → 3: 10e6/1.1e6≈9.09 → pow(0.75)≈4.84 → +5
    expect(layers.state.layer).toBe(3)
    expect(layers.state.harmonics).toBe(6)
    // exponential: 1.05^6 ≈ 1.340
    expect(layers.harmonicMult().gt(1.33)).toBe(true)
  })

  it('below the threshold ascend grants nothing', () => {
    const layers = new LayerEngine()
    expect(layers.ascend('999999')).toBe(false)
    expect(layers.state.layer).toBe(1)
    expect(layers.state.harmonics).toBe(0)
  })

  it('the constructor restores and clamps stored harmonics', () => {
    expect(new LayerEngine({ layer: 2, harmonics: 7 }).state.harmonics).toBe(7)
    expect(new LayerEngine({ harmonics: -3 }).state.harmonics).toBe(0)
    expect(new LayerEngine({ harmonics: 2.9 }).state.harmonics).toBe(2)
    expect(new LayerEngine({ harmonics: Number.NaN }).state.harmonics).toBe(0)
    expect(clampHarmonics(Number.NEGATIVE_INFINITY)).toBe(0)
    expect(clampHarmonics(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('HARMONIC_BONUS is the +5% base for exponential harmonic compounding (M12)', () => {
    expect(HARMONIC_BONUS.toString()).toBe('0.05')
  })
})

describe('Layer switch / check-back (P4-1)', () => {
  it('switchLayer allows check-back to a previously reached layer', () => {
    const layers = new LayerEngine()
    // Start at layer 1
    expect(layers.state.layer).toBe(1)
    // Switch to layer 1 or higher: no-op (must go down)
    expect(layers.switchLayer(1)).toBe(false)
    expect(layers.switchLayer(2)).toBe(false)
    // Ascend to layer 3
    layers.ascend('1000000') // 1 → 2
    layers.ascend('1100000') // 2 → 3
    expect(layers.state.layer).toBe(3)
    // Now can switch back to layer 1 or 2
    expect(layers.switchLayer(2)).toBe(true)
    expect(layers.state.layer).toBe(2)
    expect(layers.switchLayer(1)).toBe(true)
    expect(layers.state.layer).toBe(1)
    // Switching back up or to current: no-op
    expect(layers.switchLayer(2)).toBe(false)
    expect(layers.switchLayer(3)).toBe(false)
  })

  it('switchLayer clamps out-of-range targets', () => {
    const layers = new LayerEngine()
    layers.ascend('1000000') // 1 → 2
    // 0 → clamped to 1, which is < 2 so switch is allowed
    expect(layers.switchLayer(0)).toBe(true)
    expect(layers.state.layer).toBe(1)
    // 9999 → clamped to LAYER_CAP, which is >= 1, so no-op
    expect(layers.switchLayer(9999)).toBe(false)
  })

  it('switchLayer preserves harmonics across check-backs', () => {
    const layers = new LayerEngine()
    layers.ascend('1000000')
    const h = layers.state.harmonics
    expect(h).toBeGreaterThan(0)
    layers.switchLayer(1)
    expect(layers.state.harmonics).toBe(h)
    layers.switchLayer(2)
    expect(layers.state.harmonics).toBe(h)
  })

  it('layerDef names are unique for N ≤ LAYER_CAP', () => {
    const names = new Set<string>()
    for (let i = 1; i <= LAYER_CAP; i++) {
      const def = layerDef(i)
      expect(names.has(def.name)).toBe(false)
      names.add(def.name)
    }
  })

  it('layerDef threshold grows by GROWTH per layer', () => {
    const d1 = layerDef(1)
    const d2 = layerDef(2)
    const d50 = layerDef(50)
    // d2 should be d1 × 1.1
    expect(d2.threshold.div(d1.threshold).toString()).toBe('1.1')
    // d50 should be d1 × 1.1^49 ≈ 106.72
    const ratio = d50.threshold.div(d1.threshold)
    expect(ratio.toString()).toBe('106.71895716335937864')
  })
})
