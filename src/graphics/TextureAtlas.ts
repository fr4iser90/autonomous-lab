// TextureAtlas: Procedural per-face textures packed into a single atlas
// Layout: 3 rows × BLOCK_COUNT columns
//   Row 0 — Top face textures  (e.g., grass green, dirt top)
//   Row 1 — Side face textures (e.g., grass-on-dirt side, vertical wood grain)
//   Row 2 — Bottom face textures (e.g., dirt bottom, bark circle)
// Each cell is 16×16 pixels. NearestFilter for pixel-perfect voxel look.

import * as THREE from 'three'
import { BLOCK_COUNT, ALL_BLOCKS } from '../data/blocks'

// ─── Face types ──────────────────────────────────────────────────────────────

export type FaceType = 'top' | 'side' | 'bottom'

export const FACE_TYPES: FaceType[] = ['top', 'side', 'bottom']
export const FACE_ROW: Record<FaceType, number> = { top: 0, side: 1, bottom: 2 }
export const FACE_ROWS = FACE_TYPES.length // 3

// ─── Noise helpers ───────────────────────────────────────────────────────────

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

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// ─── Per-face texture generators ─────────────────────────────────────────────

/** Generate a single 16×16 16×16 ImageData for a specific block+face */
function generateFaceTexture(
  blockId: number,
  faceType: FaceType,
  seed: number,
  baseR: number,
  baseG: number,
  baseB: number,
): ImageData {
  const size = 16
  const data = new Uint8ClampedArray(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      const n1 = smoothNoise(x * 0.3, y * 0.3, blockId + seed)
      const n2 = smoothNoise(x * 0.7, y * 0.7, blockId + seed + 100)
      const variation = (n1 - 0.5) * 30 + (n2 - 0.5) * 15

      let r = baseR + variation
      let g = baseG + variation * 0.8
      let b = baseB + variation * 0.6

      // ── Block-specific patterns ──────────────────────────────────────

      // Grass (id 1): green top, grass-on-dirt side, brown bottom
      if (blockId === 1) {
        if (faceType === 'top') {
          // Vibrant green
          r = 34 + (n1 - 0.5) * 30
          g = 139 + (n2 - 0.5) * 30
          b = 34 + (n1 - 0.5) * 10
        } else if (faceType === 'side') {
          // Grass on top half, dirt on bottom half
          const row = (y / size)
          if (row < 0.4) {
            // Grass top
            r = 34 + (n1 - 0.5) * 20
            g = 139 + (n2 - 0.5) * 20
            b = 34 + (n1 - 0.5) * 10
          } else {
            // Dirt bottom
            r = 139 + (n1 - 0.5) * 30
            g = 90 + (n2 - 0.5) * 20
            b = 43 + (n1 - 0.5) * 10
          }
        } else {
          // Bottom = dirt
          r = 139 + (n1 - 0.5) * 30
          g = 90 + (n2 - 0.5) * 20
          b = 43 + (n1 - 0.5) * 10
        }
      }

      // Dirt (id 2): brown all around
      if (blockId === 2) {
        if (faceType === 'side') {
          // Slightly darker side
          r = clamp(r - 10, 0, 255)
          g = clamp(g - 8, 0, 255)
        }
        if (faceType === 'bottom') {
          r = clamp(r - 15, 0, 255)
          g = clamp(g - 12, 0, 255)
        }
      }

      // Stone (id 3): grey with speckle
      if (blockId === 3) {
        const speckle = noise2D(x, y, blockId + seed)
        if (speckle > 0.7) {
          r = clamp(r + 20, 0, 255)
          g = clamp(g + 20, 0, 255)
          b = clamp(b + 20, 0, 255)
        }
        if (faceType === 'bottom') {
          r = clamp(r - 10, 0, 255)
          g = clamp(g - 10, 0, 255)
          b = clamp(b - 5, 0, 255)
        }
      }

      // Sand (id 4): light yellow-brown
      if (blockId === 4) {
        const sNoise = noise2D(x, y, blockId + seed) * 15
        r = clamp(baseR + sNoise + variation * 0.3, 0, 255)
        g = clamp(baseG + sNoise * 0.7, 0, 255)
        b = clamp(baseB + sNoise * 0.4, 0, 255)
      }

      // Water (id 5): semi-transparent blue
      if (blockId === 5) {
        const wn = noise2D(x, y, blockId + seed) * 20
        data[idx] = clamp(30 + wn, 0, 255)
        data[idx + 1] = clamp(100 + wn, 0, 255)
        data[idx + 2] = clamp(200 + wn, 0, 255)
        data[idx + 3] = 200 // alpha
        continue
      }

      // Log (id 6): vertical bark, bark-ring on ends
      if (blockId === 6) {
        if (faceType === 'top' || faceType === 'bottom') {
          // Bark rings: concentric circles
          const cx = x - 7.5
          const cy = y - 7.5
          const dist = Math.sqrt(cx * cx + cy * cy)
          const ring = Math.sin(dist * 1.5) * 25
          r = 101 + ring
          g = 67 + ring * 0.7
          b = 33 + ring * 0.4
        } else {
          // Vertical bark stripes
          const stripe = noise2D(x * 0.5, y * 0.1, blockId + seed) * 20 - 10
          r = 101 + stripe
          g = 67 + stripe * 0.7
          b = 33 + stripe * 0.4
        }
      }

      // Planks (id 7): horizontal wood lines
      if (blockId === 7) {
        const line = Math.sin(y * 0.8 + noise2D(x, y, blockId + seed) * 3) * 12
        r = clamp(baseR + line, 0, 255)
        g = clamp(baseG + line * 0.7, 0, 255)
        b = clamp(baseB + line * 0.3, 0, 255)
        if (faceType === 'side') {
          // Add plank seam lines
          const seam = Math.abs(Math.sin(y * 0.5)) < 0.1 ? -15 : 0
          r += seam
          g += seam
          b += seam * 0.5
        }
      }

      // Leaves (id 8): irregular green with holes
      if (blockId === 8) {
        const leafNoise = noise2D(x, y, blockId + seed)
        if (leafNoise < 0.15) {
          data[idx + 3] = 150 // semi-transparent hole
          continue
        }
        r = baseR + leafNoise * 40 - 20
        g = baseG + leafNoise * 50 - 25
        b = baseB
        // Slightly lighter on top
        if (faceType === 'top') {
          r = clamp(r + 10, 0, 255)
          g = clamp(g + 15, 0, 255)
        }
      }

      // Cobblestone (id 9): mixed grey tones, chunky
      if (blockId === 9) {
        const cobble = noise2D(x * 0.5, y * 0.5, blockId + seed) * 40 - 20
        r = clamp(baseR + cobble, 0, 255)
        g = clamp(baseG + cobble, 0, 255)
        b = clamp(baseB + cobble * 0.9, 0, 255)
        // Chunk outline
        const chunk = noise2D(Math.floor(x / 4), Math.floor(y / 4), blockId + seed + 200)
        if (chunk < 0.3) {
          r = clamp(r - 15, 0, 255)
          g = clamp(g - 15, 0, 255)
          b = clamp(b - 10, 0, 255)
        }
      }

      // Snow (id 10): white with slight blue
      if (blockId === 10) {
        const sn = noise2D(x, y, blockId + seed) * 8
        r = clamp(255 - sn, 0, 255)
        g = clamp(255 - sn - 5, 0, 255)
        b = clamp(255 - sn + 3, 0, 255)
      }

      // Bedrock (id 11): dark grey with bright speckles
      if (blockId === 11) {
        const bed = noise2D(x, y, blockId + seed)
        r = clamp(50 + bed * 30, 0, 255)
        g = clamp(50 + bed * 30, 0, 255)
        b = clamp(50 + bed * 30, 0, 255)
      }

      // Coal ore (id 12): grey stone with black speckles
      if (blockId === 12) {
        const ore = noise2D(x, y, blockId + seed)
        if (ore > 0.6) {
          r = 40; g = 40; b = 40 // coal speckle
        } else {
          r = clamp(128 + (noise2D(x + 1, y + 1, seed) * 20 - 10), 0, 255)
          g = clamp(128 + (noise2D(x + 2, y + 2, seed) * 20 - 10), 0, 255)
          b = clamp(128 + (noise2D(x + 3, y + 3, seed) * 20 - 10), 0, 255)
        }
      }

      // Iron ore (id 13): grey stone with iron speckles
      if (blockId === 13) {
        const ore = noise2D(x, y, blockId + seed)
        if (ore > 0.6) {
          r = 180; g = 150; b = 130 // iron speckle
        } else {
          r = clamp(128 + (noise2D(x + 1, y + 1, seed) * 20 - 10), 0, 255)
          g = clamp(128 + (noise2D(x + 2, y + 2, seed) * 20 - 10), 0, 255)
          b = clamp(128 + (noise2D(x + 3, y + 3, seed) * 20 - 10), 0, 255)
        }
      }

      // Crafting table (id 14): dark wood with grid
      if (blockId === 14) {
        const grid = (Math.abs(Math.sin(x * 1.5)) < 0.15 || Math.abs(Math.sin(y * 1.5)) < 0.15) ? -20 : 0
        r = clamp(baseR + grid + variation, 0, 255)
        g = clamp(baseG + grid + variation * 0.6, 0, 255)
        b = clamp(baseB + grid * 0.5 + variation * 0.3, 0, 255)
      }

      // Torch (id 15): bright warm glow
      if (blockId === 15) {
        const flicker = noise2D(x, y, blockId + seed) * 40
        r = 255
        g = clamp(180 + flicker - 20, 0, 255)
        b = clamp(30 + flicker - 15, 0, 255)
      }

      // Air (id 0): fully transparent
      if (blockId === 0) {
        data[idx + 3] = 0
        continue
      }

      // Write final color
      data[idx] = clamp(r, 0, 255)
      data[idx + 1] = clamp(g, 0, 255)
      data[idx + 2] = clamp(b, 0, 255)
      data[idx + 3] = 255 // opaque by default (overridden per-block above)
    }
  }

  return new ImageData(data, size, size)
}

// ─── UV helpers ──────────────────────────────────────────────────────────────

export interface UVRange {
  uMin: number
  uMax: number
  vMin: number
  vMax: number
}

/**
 * UV range for a cell in the 3×N atlas grid.
 * @param blockId  Block index (0..BLOCK_COUNT-1)
 * @param row      0=top, 1=side, 2=bottom
 * @param cellSize Number of columns in the grid (= BLOCK_COUNT)
 */
function uvForCell(blockId: number, row: number, cellSize: number, numRows: number): UVRange {
  const uMin = blockId / cellSize
  const uMax = (blockId + 1) / cellSize
  const vMax = 1 - row / numRows
  const vMin = vMax - 1 / numRows
  return { uMin, uMax, vMin, vMax }
}

// ─── TextureAtlas class ──────────────────────────────────────────────────────

export class TextureAtlas {
  private readonly atlasTexture: THREE.CanvasTexture
  private readonly atlasCanvas: HTMLCanvasElement
  private readonly atlasWidth: number
  private readonly atlasHeight: number
  private readonly cellSize = 16 // pixels per cell
  private readonly blockCount: number
  private readonly uvCache: Map<number, { top: UVRange; side: UVRange; bottom: UVRange }> = new Map()

  constructor(seed: number = 42) {
    this.blockCount = BLOCK_COUNT
    this.atlasWidth = this.blockCount * this.cellSize       // e.g. 16 × 16 = 256
    this.atlasHeight = FACE_ROWS * this.cellSize             // 3 × 16 = 48

    // Create the atlas canvas
    this.atlasCanvas = document.createElement('canvas')
    this.atlasCanvas.width = this.atlasWidth
    this.atlasCanvas.height = this.atlasHeight
    const ctx = this.atlasCanvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')

    // Generate face-specific textures into the 3-row atlas
    for (let i = 0; i < this.blockCount; i++) {
      const blockDef = ALL_BLOCKS[i]
      const [br, bg, bb] = blockDef.color

      for (let row = 0; row < FACE_ROWS; row++) {
        const faceType = FACE_TYPES[row]
        const texture = generateFaceTexture(i, faceType, seed, br, bg, bb)
        ctx.putImageData(texture, i * this.cellSize, row * this.cellSize)
      }

      // Cache UV ranges for all 3 face types
      this.uvCache.set(i, {
        top:    uvForCell(i, FACE_ROW.top,    this.blockCount, FACE_ROWS),
        side:   uvForCell(i, FACE_ROW.side,   this.blockCount, FACE_ROWS),
        bottom: uvForCell(i, FACE_ROW.bottom, this.blockCount, FACE_ROWS),
      })
    }

    // Create the Three.js texture
    this.atlasTexture = new THREE.CanvasTexture(this.atlasCanvas)
    this.atlasTexture.minFilter = THREE.NearestFilter
    this.atlasTexture.magFilter = THREE.NearestFilter
    this.atlasTexture.generateMipmaps = false
  }

  /** Get the Three.js atlas texture */
  get texture(): THREE.CanvasTexture { return this.atlasTexture }

  /** Get canvas element for inspection (testing) */
  get canvas(): HTMLCanvasElement { return this.atlasCanvas }

  /** Atlas pixel dimensions */
  get width(): number { return this.atlasWidth }
  get height(): number { return this.atlasHeight }

  /** Number of face types (rows in the atlas grid) */
  get faceRows(): number { return FACE_ROWS }

  /**
   * Get the cached UV ranges for all 3 face types of a block.
   */
  getFaceUVs(blockId: number): { top: UVRange; side: UVRange; bottom: UVRange } {
    const uv = this.uvCache.get(blockId)
    if (!uv) throw new Error(`Block ${blockId} not found in atlas`)
    return uv
  }

  /**
   * Get the UV quad for a single face of a block.
   * @param blockId Block type
   * @param faceType Top / Side / Bottom
   * @returns [u0,v0, u1,v1, u2,v2, u3,v3] for the 4 vertices
   */
  getFaceUVQuad(blockId: number, faceType: FaceType): [number, number, number, number, number, number, number, number] {
    const uv = this.getFaceUVs(blockId)[faceType]
    // UV quad: bottom-left→top-left→top-right→bottom-right in UV space
    // v increases upward in Three.js, atlas v=0 is at top
    return [
      uv.uMin, uv.vMax,
      uv.uMax, uv.vMax,
      uv.uMax, uv.vMin,
      uv.uMin, uv.vMin,
    ]
  }

  /**
   * Get UV range for a specific face type of a block.
   */
  getUVForFace(blockId: number, faceType: FaceType): UVRange {
    return this.getFaceUVs(blockId)[faceType]
  }

  /** Dispose of the underlying texture */
  dispose(): void { this.atlasTexture.dispose() }
}
