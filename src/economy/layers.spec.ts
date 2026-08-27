import { describe, expect, it } from 'vitest'
import { LAYER_CAP } from '../data/layers'
import { LayerEngine, clampLayer } from './layers'

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
