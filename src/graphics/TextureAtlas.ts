// TextureAtlas: Procedural 16×16 per-block textures packed into a single atlas
// Each block type gets a unique texture with noise-based variation.
// Atlas layout: single row of 16×16 cells → atlasWidth = BLOCK_COUNT × 16, atlasHeight = 16

import * as THREE from 'three'
import { BLOCK_COUNT, ALL_BLOCKS, BlockDef } from '../data/blocks'

// Simple seeded PRNG (same as Noise.ts for consistency)
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Noise for texture variation
function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const v00 = noise2D(ix, iy, seed)
  const v10 = noise2D(ix + 1, iy, seed)
  const v01 = noise2D(ix, iy + 1, seed)
  const v11 = noise2D(ix + 1, iy + 1, seed)

  return v00 * (1 - sx) * (1 - sy) + v10 * sx * (1 - sy) + v01 * (1 - sx) * sy + v11 * sx * sy
}

// Generate a 16×16 texture for a block type
function generateBlockTexture(blockId: number, blockDef: BlockDef, seed: number): ImageData {
  const size = 16
  const data = new Uint8ClampedArray(size * size * 4)
  const [baseR, baseG, baseB] = blockDef.color

  const rng = mulberry32(blockId * 1000 + seed)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      // Base color with noise variation
      const n1 = smoothNoise(x * 0.3, y * 0.3, blockId + seed)
      const n2 = smoothNoise(x * 0.7, y * 0.7, blockId + seed + 100)
      const variation = (n1 - 0.5) * 30 + (n2 - 0.5) * 15

      let r = Math.max(0, Math.min(255, baseR + variation))
      let g = Math.max(0, Math.min(255, baseG + variation * 0.8))
      let b = Math.max(0, Math.min(255, baseB + variation * 0.6))

      // Special texture patterns
      // Stone: add speckle for ore-like appearance
      if (blockId === 3) { // Stone
        const speckle = noise2D(x, y, blockId + seed)
        if (speckle > 0.7) {
          r = Math.min(255, r + 20)
          g = Math.min(255, g + 20)
          b = Math.min(255, b + 20)
        }
      }

      // Dirt: more variation
      if (blockId === 2) {
        const d = noise2D(x, y, blockId + seed) * 40 - 20
        r += d
        g += d * 0.5
        b += d * 0.3
      }

      // Grass: green top with brownish sides (simplified - just add noise)
      if (blockId === 1) {
        const gNoise = noise2D(x, y, blockId + seed)
        r += gNoise * 20 - 10
        g += gNoise * 30 - 15
      }

      // Sand: subtle grain
      if (blockId === 4) {
        const sNoise = noise2D(x, y, blockId + seed) * 20
        r += sNoise
        g += sNoise * 0.8
        b += sNoise * 0.5
      }

      // Log: vertical stripes
      if (blockId === 6) {
        const stripe = noise2D(x * 0.5, y * 0.1, blockId + seed)
        r += stripe * 15 - 7
        g += stripe * 10 - 5
        b += stripe * 5 - 2
      }

      // Planks: horizontal lines (wood grain)
      if (blockId === 7) {
        const line = Math.sin(y * 0.8 + noise2D(x, y, blockId + seed) * 3) * 15
        r += line
        g += line * 0.7
        b += line * 0.3
      }

      // Leaves: irregular green with holes
      if (blockId === 8) {
        const leafNoise = noise2D(x, y, blockId + seed)
        if (leafNoise < 0.2) {
          // Semi-transparent hole
          data[idx + 3] = 200
        }
        r = baseR + leafNoise * 40 - 20
        g = baseG + leafNoise * 50 - 25
      }

      // Cobblestone: mixed grey tones
      if (blockId === 9) {
        const cobble = noise2D(x * 0.5, y * 0.5, blockId + seed) * 40
        r += cobble - 20
        g += cobble - 20
        b += cobble - 20
      }

      // Snow: white with slight blue tint
      if (blockId === 10) {
        const sn = noise2D(x, y, blockId + seed) * 10
        r = 255 - sn
        g = 255 - sn - 5
        b = 255 - sn
      }

      // Bedrock: dark with bright speckles
      if (blockId === 11) {
        const bed = noise2D(x, y, blockId + seed)
        r = 50 + bed * 30
        g = 50 + bed * 30
        b = 50 + bed * 30
      }

      // Ore blocks: base stone with ore speckles
      if (blockId === 12) { // Coal ore
        const ore = noise2D(x, y, blockId + seed)
        if (ore > 0.6) {
          r = 50; g = 50; b = 50
        } else {
          r = 128 + (noise2D(x + 1, y + 1, seed) * 20 - 10)
          g = 128 + (noise2D(x + 2, y + 2, seed) * 20 - 10)
          b = 128 + (noise2D(x + 3, y + 3, seed) * 20 - 10)
        }
      }

      if (blockId === 13) { // Iron ore
        const ore = noise2D(x, y, blockId + seed)
        if (ore > 0.6) {
          r = 180; g = 150; b = 130
        } else {
          r = 128 + (noise2D(x + 1, y + 1, seed) * 20 - 10)
          g = 128 + (noise2D(x + 2, y + 2, seed) * 20 - 10)
          b = 128 + (noise2D(x + 3, y + 3, seed) * 20 - 10)
        }
      }

      // Crafting table: dark with grid lines
      if (blockId === 14) {
        const grid = (Math.abs(Math.sin(x * 1.5)) < 0.15 || Math.abs(Math.sin(y * 1.5)) < 0.15) ? -20 : 0
        r += grid
        g += grid
        b += grid * 0.5
      }

      // Torch: bright with flicker
      if (blockId === 15) {
        const flicker = noise2D(x, y, blockId + seed) * 60
        r = 255
        g = 180 + flicker - 30
        b = 30 + flicker - 15
      }

      // Water: semi-transparent blue
      if (blockId === 5) {
        const wn = noise2D(x, y, blockId + seed) * 30
        data[idx] = 30 + wn
        data[idx + 1] = 100 + wn
        data[idx + 2] = 200 + wn
        data[idx + 3] = 200 // Alpha for transparency
        continue
      }

      // Air: fully transparent
      if (blockId === 0) {
        data[idx + 3] = 0
        continue
      }

      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
      data[idx + 3] = 255
    }
  }

  return new ImageData(data, size, size)
}

// Face indices for the 6 faces of a block
// +X, -X, +Y, -Y, +Z, -Z
const FACE_INDICES = [0, 1, 2, 3, 4, 5] as const
export type FaceIndex = typeof FACE_INDICES[number]

export interface UVRange {
  uMin: number
  uMax: number
  vMin: number
  vMax: number
}

export class TextureAtlas {
  private readonly atlasTexture: THREE.CanvasTexture
  private readonly atlasCanvas: HTMLCanvasElement
  private readonly atlasWidth: number
  private readonly atlasHeight: number
  private readonly cellSize = 16 // pixels per block texture
  private readonly blockCount: number
  private readonly uvCache: Map<number, UVRange> = new Map()

  constructor(seed: number = 42) {
    this.blockCount = BLOCK_COUNT
    this.atlasWidth = this.blockCount * this.cellSize // e.g., 16 * 16 = 256
    this.atlasHeight = this.cellSize // 16

    // Create the atlas canvas
    this.atlasCanvas = document.createElement('canvas')
    this.atlasCanvas.width = this.atlasWidth
    this.atlasCanvas.height = this.atlasHeight
    const ctx = this.atlasCanvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')

    // Generate each block texture into the atlas
    for (let i = 0; i < this.blockCount; i++) {
      const blockDef = ALL_BLOCKS[i]
      const texture = generateBlockTexture(i, blockDef, seed)

      // Place the 16×16 texture at position (i * 16, 0) in the atlas
      ctx.putImageData(texture, i * this.cellSize, 0)

      // Cache UV range for this block
      const uMin = i / this.blockCount
      const uMax = (i + 1) / this.blockCount
      this.uvCache.set(i, { uMin, uMax, vMin: 0, vMax: 1 })
    }

    // Create the Three.js texture
    this.atlasTexture = new THREE.CanvasTexture(this.atlasCanvas)
    this.atlasTexture.minFilter = THREE.NearestFilter
    this.atlasTexture.magFilter = THREE.NearestFilter
    this.atlasTexture.generateMipmaps = false
  }

  /** Get the Three.js atlas texture */
  get texture(): THREE.CanvasTexture {
    return this.atlasTexture
  }

  /** Get canvas element for inspection (testing) */
  get canvas(): HTMLCanvasElement {
    return this.atlasCanvas
  }

  /** Get atlas dimensions */
  get width(): number { return this.atlasWidth }
  get height(): number { return this.atlasHeight }

  /** Get the UV range for a block in the atlas */
  getUVForBlock(blockId: number): UVRange {
    const uv = this.uvCache.get(blockId)
    if (!uv) throw new Error(`Block ${blockId} not found in atlas`)
    return uv
  }

  /** Get UV coordinates for all 6 faces of a block */
  getUVsForBlock(blockId: number): UVRange[] {
    const uv = this.getUVForBlock(blockId)
    // All 6 faces use the same UV range (the full 16×16 cell)
    // In a more advanced version, we'd split into top/bottom/sides
    return [uv, uv, uv, uv, uv, uv]
  }

  /**
   * Get UV quad for a single face of a block.
   * Returns 4 UV pairs for the quad vertices.
   */
  getFaceUVs(blockId: number, faceIndex: FaceIndex = 0): [number, number, number, number, number, number, number, number] {
    const uv = this.getUVForBlock(blockId)

    // For a simple atlas (one cell per block), all faces use the full cell
    // In a future enhancement, we'd use different cells for top/bottom/sides
    const [u0, v0, u1, v1, u2, v2, u3, v3] = [
      uv.uMin, uv.vMax,
      uv.uMax, uv.vMax,
      uv.uMax, uv.vMin,
      uv.uMin, uv.vMin,
    ]
    return [u0, v0, u1, v1, u2, v2, u3, v3]
  }

  /** Dispose of the underlying texture */
  dispose(): void {
    this.atlasTexture.dispose()
  }
}
