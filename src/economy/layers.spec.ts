import { describe, expect, it } from 'vitest'
import { LAYER_CAP } from '../data/layers'
import { HARMONIC_BONUS, LayerEngine, clampHarmonics, clampLayer, harmonicReward } from './layers'

describe('LayerEngine (M5)', () => {
  it('starts at layer 1 with the 1e6 ascend threshold', () => {
    const layers = new LayerEngine()
    expect(layers.state.layer).toBe(1)
    expect(layers.def.id).toBe(1)
    expect(layers.def.threshold.toString()).toBe('1000000')
    expect(layers.next?.id).toBe(2)
  })

  it('only ascends once the threshold is met', () => {
    const layers = new LayerEngine()
    expect(layers.canAscend('999999')).toBe(false)
    expect(layers.canAscend('1000000')).toBe(true)
    expect(layers.ascend('999999')).toBe(false)
    expect(layers.state.layer).toBe(1)
    expect(layers.ascend('1000000')).toBe(true)
    expect(layers.state.layer).toBe(2)
    // Next threshold is 1e7 — the old 1e6 total is not enough.
    expect(layers.canAscend('1000000')).toBe(false)
    expect(layers.ascend('1000000')).toBe(false)
    expect(layers.ascend('10000000')).toBe(true)
    expect(layers.state.layer).toBe(3)
  })

  it('stops at LAYER_CAP: next is null, ascend is a no-op', () => {
    const layers = new LayerEngine({ layer: LAYER_CAP })
    expect(layers.next).toBeNull()
    // Layer 50's threshold is 1e6 × 10^49 = 1e55 — plenty of Signal…
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
  it('harmonicReward is floor(sqrt(signal / threshold))', () => {
    expect(harmonicReward('1000000', '1000000')).toBe(1) // exactly at threshold
    expect(harmonicReward('999999', '1000000')).toBe(0) // below
    expect(harmonicReward('4000000', '1000000')).toBe(2)
    expect(harmonicReward('15999999', '1000000')).toBe(3)
    expect(harmonicReward('16000000', '1000000')).toBe(4)
    expect(harmonicReward('100000000', '1000000')).toBe(10)
  })

  it('ascend grants harmonics > 0 and a permanent mult > 1 (ACCEPT)', () => {
    const layers = new LayerEngine()
    expect(layers.state.harmonics).toBe(0)
    expect(layers.harmonicMult().toString()).toBe('1')
    expect(layers.ascend('1000000')).toBe(true)
    expect(layers.state.layer).toBe(2)
    expect(layers.state.harmonics).toBeGreaterThan(0)
    expect(layers.harmonicMult().gt(1)).toBe(true)
    expect(layers.harmonicMult().toString()).toBe('1.02')
  })

  it('harmonics accumulate across ascends and the multiplier stacks linearly', () => {
    const layers = new LayerEngine()
    layers.ascend('1000000') // layer 1 → 2, +1
    layers.ascend('40000000') // layer 2 → 3: 4e7 / 1e7 = 4 → +2
    expect(layers.state.layer).toBe(3)
    expect(layers.state.harmonics).toBe(3)
    expect(layers.harmonicMult().toString()).toBe('1.06')
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

  it('HARMONIC_BONUS is the documented +2% per Harmony', () => {
    expect(HARMONIC_BONUS.toString()).toBe('0.02')
  })
})
