import { describe, it, expect } from 'vitest'
import { createRng, hashSeed } from '../src/lib/seedRng'

describe('seedRng', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBeCloseTo(rng2(), 10)
    }
  })

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(43)
    expect(rng1()).not.toBeCloseTo(rng2(), 10)
  })

  it('values are in [0, 1)', () => {
    const rng = createRng(123)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('hashSeed produces deterministic output', () => {
    expect(hashSeed(42)).toBe(hashSeed(42))
    expect(hashSeed(42)).not.toBe(hashSeed(43))
  })

  it('hashSeed works with various inputs', () => {
    expect(hashSeed(0)).toBe(hashSeed(0))
    expect(hashSeed(-1)).toBe(hashSeed(-1))
    expect(hashSeed(999999)).toBe(hashSeed(999999))
  })
})
