/**
 * Mulberry32 seeded PRNG — deterministic, fast, 32-bit.
 * Used for all PCG so a given seed always produces the same dungeon.
 */
export function createRng(seed: number) {
  let s = seed | 0
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash any string/number to a 32-bit int */
export function hashSeed(seed: number): number {
  let h = seed | 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
  h = (h ^ (h >>> 16)) >>> 0
  return h
}
