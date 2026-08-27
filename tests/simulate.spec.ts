/**
 * Depth-truth specs: layerDef data + simulateToLayer reachability.
 */
import { describe, it, expect } from 'vitest'
import { LAYER_CAP, layerDef } from '../src/data/layers'
import { simulateToLayer } from './simulate'

describe('layerDef', () => {
  it('thresholds are 1e6 × 10^(N-1)', () => {
    expect(layerDef(1).threshold.toString()).toBe('1000000')
    expect(layerDef(2).threshold.toString()).toBe('10000000')
    expect(layerDef(3).threshold.toString()).toBe('100000000')
    expect(layerDef(10).threshold.toString()).toBe('1000000000000000') // 1e6 × 10^9 = 1e15
  })

  it('names are unique across 1..LAYER_CAP and ids/colors are stable', () => {
    const names = new Set<string>()
    for (let n = 1; n <= LAYER_CAP; n++) {
      const a = layerDef(n)
      const b = layerDef(n)
      names.add(a.name)
      expect(a.id).toBe(n)
      expect(a.color).toBe(b.color)
      expect(a.flavor.length).toBeGreaterThan(0)
    }
    expect(names.size).toBe(LAYER_CAP)
  })

  it('special layers are exactly the multiples of 10', () => {
    for (let n = 1; n <= LAYER_CAP; n++) {
      expect(layerDef(n).special).toBe(n % 10 === 0)
    }
  })

  it('rejects out-of-range or non-integer N', () => {
    expect(() => layerDef(0)).toThrow()
    expect(() => layerDef(LAYER_CAP + 1)).toThrow()
    expect(() => layerDef(2.5)).toThrow()
  })
})

describe('simulateToLayer', () => {
  it('reaches layer 3 from a clean state (seed 0)', () => {
    const r = simulateToLayer(3, { seed: 0 })
    expect(r.fail).toBeNull()
    expect(r.ok).toBe(true)
    expect(r.reached).toBe(3)
    expect(r.ticks).toBeGreaterThan(0)
    expect(Number.isFinite(Number(r.signal))).toBe(true)
    expect(Object.values(r.relays).reduce((a, b) => a + b, 0)).toBeGreaterThan(0)
  }, 30000)

  it('is deterministic: same target + seed → identical report', () => {
    const a = simulateToLayer(3, { seed: 42 })
    const b = simulateToLayer(3, { seed: 42 })
    expect(a).toEqual(b)
  }, 30000)

  it('still reaches layer 3 with a different seed (7)', () => {
    const r = simulateToLayer(3, { seed: 7 })
    expect(r.ok).toBe(true)
    expect(r.reached).toBe(3)
  }, 30000)

  it('rejects out-of-range targets', () => {
    expect(() => simulateToLayer(0)).toThrow()
    expect(() => simulateToLayer(LAYER_CAP + 1)).toThrow()
  })
})
