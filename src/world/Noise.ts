// Simple seeded PRNG (mulberry32) and noise functions

export function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Simple value noise
export function valueNoise(x: number, y: number, seed: number): number {
  const rng = mulberry32(seed + Math.floor(x) * 374761393 + Math.floor(y) * 668265263)
  return rng()
}

// Smoothed noise for terrain
export function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const v00 = valueNoise(ix, iy, seed)
  const v10 = valueNoise(ix + 1, iy, seed)
  const v01 = valueNoise(ix, iy + 1, seed)
  const v11 = valueNoise(ix + 1, iy + 1, seed)

  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  return v00 * (1 - sx) * (1 - sy) + v10 * sx * (1 - sy) + v01 * (1 - sx) * sy + v11 * sx * sy
}

// Fractal Brownian Motion for terrain height
export function fbm(x: number, y: number, seed: number, octaves: number = 4): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxVal = 0

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 1000) * amplitude
    maxVal += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / maxVal
}
