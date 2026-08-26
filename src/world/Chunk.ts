// Chunk: 16x16x96 voxel chunk with noise-based terrain generation + biomes + world features

import { fbm } from './Noise'
import { BlockGrass, BlockDirt, BlockStone, BlockSand, BlockBedrock, BlockWater, BlockSnow, BlockCoalOre, BlockIronOre, BlockLog, BlockLeaves, BlockLava } from '../data/blocks'

export const CHUNK_WIDTH = 16
export const CHUNK_HEIGHT = 96
export const CHUNK_DEPTH = 16

// Biome types determined by biome noise
export enum Biome {
  Plains = 0,
  Desert = 1,
  Snow = 2,
  Forest = 3,
  Mountains = 4,
}

/** Pre-compute a 3D noise cache at resolution NxNxN using cached 2D slices */
function precomputeNoise3D(
  worldX: number,
  worldZ: number,
  yMin: number,
  yMax: number,
  freq: number,
  seed: number,
  resolution: number,
  cache: Float32Array,
): void {
  // Pre-compute y-slices at the resolution grid
  const yStep = Math.max(1, Math.floor((yMax - yMin) / resolution))
  for (let iy = 0; iy <= resolution; iy++) {
    const y = yMin + iy * yStep
    for (let ix = 0; ix <= resolution; ix++) {
      for (let iz = 0; iz <= resolution; iz++) {
        const wx = worldX + (ix / resolution) * CHUNK_WIDTH
        const wz = worldZ + (iz / resolution) * CHUNK_DEPTH
        // Use y as part of the coordinate (shift to positive range)
        const noiseVal = fbm(wx * freq, wz * freq, y * freq + seed, 3)
        const ci = ix + iz * (resolution + 1) + iy * (resolution + 1) * (resolution + 1)
        cache[ci] = noiseVal
      }
    }
  }
}

/** Bilinearly sample the 3D noise cache at normalized coords 0-1 */
function sampleNoise3D(
  nx: number, nz: number, ny: number,
  resolution: number,
  cache: Float32Array,
): number {
  // Clamp to valid range
  nx = Math.max(0, Math.min(1, nx))
  nz = Math.max(0, Math.min(1, nz))
  ny = Math.max(0, Math.min(1, ny))

  const r = resolution
  const x0 = Math.floor(nx * r), x1 = Math.min(x0 + 1, r)
  const z0 = Math.floor(nz * r), z1 = Math.min(z0 + 1, r)
  const y0 = Math.floor(ny * r), y1 = Math.min(y0 + 1, r)

  const fx = nx * r - x0, fz = nz * r - z0, fy = ny * r - y0

  const v000 = cache[x0 + z0 * (r + 1) + y0 * (r + 1) * (r + 1)]
  const v100 = cache[x1 + z0 * (r + 1) + y0 * (r + 1) * (r + 1)]
  const v010 = cache[x0 + z1 * (r + 1) + y0 * (r + 1) * (r + 1)]
  const v110 = cache[x1 + z1 * (r + 1) + y0 * (r + 1) * (r + 1)]
  const v001 = cache[x0 + z0 * (r + 1) + y1 * (r + 1) * (r + 1)]
  const v101 = cache[x1 + z0 * (r + 1) + y1 * (r + 1) * (r + 1)]
  const v011 = cache[x0 + z1 * (r + 1) + y1 * (r + 1) * (r + 1)]
  const v111 = cache[x1 + z1 * (r + 1) + y1 * (r + 1) * (r + 1)]

  const v00 = v000 * (1 - fx) + v100 * fx
  const v10 = v010 * (1 - fx) + v110 * fx
  const v01 = v001 * (1 - fx) + v101 * fx
  const v11 = v011 * (1 - fx) + v111 * fx

  return v00 * (1 - fy) * (1 - fz) + v10 * fy * (1 - fz) + v01 * (1 - fy) * fz + v11 * fy * fz
}

export class Chunk {
  public readonly x: number
  public readonly z: number
  public readonly seed: number
  public blocks: Uint8Array
  public biome: Biome = Biome.Plains

  constructor(x: number, z: number, seed: number) {
    this.x = x
    this.z = z
    this.seed = seed
    this.blocks = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH)
    this.generate()
  }

  private idx(x: number, y: number, z: number): number {
    return x + z * CHUNK_WIDTH + y * CHUNK_WIDTH * CHUNK_DEPTH
  }

  getBlock(x: number, y: number, z: number): number {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return -1
    return this.blocks[this.idx(x, y, z)]
  }

  setBlock(x: number, y: number, z: number, blockId: number): void {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return
    this.blocks[this.idx(x, y, z)] = blockId
  }

  private getBiome(): Biome {
    const bx = this.x * 0.015
    const bz = this.z * 0.015
    const biomeVal = fbm(bx, bz, this.seed + 50000, 4)
    const heightVal = fbm(bx * 2, bz * 2, this.seed + 60000, 3)

    if (biomeVal > 0.55 && heightVal > 0.4) return Biome.Mountains
    if (biomeVal > 0.35) return Biome.Forest
    if (biomeVal > 0.15) return Biome.Plains
    if (heightVal > 0.45) return Biome.Snow
    return Biome.Desert
  }

  private placeTree(x: number, y: number, z: number, surfaceBlockId: number): void {
    if (surfaceBlockId !== BlockGrass.id && surfaceBlockId !== BlockSnow.id && surfaceBlockId !== BlockSand.id) return

    const treeHeight = 3 + Math.floor(Math.abs(fbm(x * 0.1, z * 0.1, this.seed + 70000, 2)) * 3)

    // Place log trunk ABOVE surface
    for (let ty = 0; ty < treeHeight; ty++) {
      const localY = y + 1 + ty
      if (localY < CHUNK_HEIGHT) this.setBlock(x, localY, z, BlockLog.id)
    }

    // Place leaf canopy above trunk (centered on top of trunk)
    const canopyY = y + 1 + treeHeight - 1
    for (let lx = -1; lx <= 1; lx++) {
      for (let ly = -1; ly <= 2; ly++) {
        for (let lz = -1; lz <= 1; lz++) {
          const absLx = Math.abs(lx), absLy = Math.abs(ly), absLz = Math.abs(lz)
          // Skip top/bottom corners for rounded canopy
          if ((absLx === 1 && absLz === 1) && (absLy === 2 || absLy === -1)) continue

          const leafX = x + lx, leafY = canopyY + ly, leafZ = z + lz
          if (leafX >= 0 && leafX < CHUNK_WIDTH && leafZ >= 0 && leafZ < CHUNK_DEPTH && leafY >= 0 && leafY < CHUNK_HEIGHT) {
            const idx = this.idx(leafX, leafY, leafZ)
            if (this.blocks[idx] === 0) this.blocks[idx] = BlockLeaves.id
          }
        }
      }
    }
  }

  generate(): void {
    this.biome = this.getBiome()

    // Height map using FBM — biome-aware terrain shape
    const heightMap = new Float32Array(CHUNK_WIDTH * CHUNK_DEPTH)
    const terrainVariation = new Float32Array(CHUNK_WIDTH * CHUNK_DEPTH)

    for (let z = 0; z < CHUNK_DEPTH; z++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        const wx = this.x * CHUNK_WIDTH + x
        const wz = this.z * CHUNK_DEPTH + z

        let baseHeight = 48, amplitude = 30
        if (this.biome === Biome.Mountains) { baseHeight = 55; amplitude = 45 }
        else if (this.biome === Biome.Desert) { baseHeight = 44; amplitude = 12 }
        else if (this.biome === Biome.Forest) { baseHeight = 50; amplitude = 25 }

        const terrainH = Math.floor(
          baseHeight + fbm(wx * 0.01, wz * 0.01, this.seed, 6) * amplitude +
          fbm(wx * 0.05, wz * 0.05, this.seed + 5000, 3) * 5
        )

        heightMap[z * CHUNK_WIDTH + x] = Math.max(10, Math.min(90, terrainH))
        terrainVariation[z * CHUNK_WIDTH + x] = fbm(wx * 0.03, wz * 0.03, this.seed + 40000, 3)
      }
    }

    // Fill chunks with biome-dependent terrain
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const height = heightMap[z * CHUNK_WIDTH + x]
          const idx = this.idx(x, y, z)

          if (y === 0) {
            this.blocks[idx] = BlockBedrock.id
          } else if (y < height - 4) {
            this.blocks[idx] = BlockStone.id
          } else if (y < height) {
            if (this.biome === Biome.Desert) this.blocks[idx] = BlockSand.id
            else if (this.biome === Biome.Snow) this.blocks[idx] = BlockSnow.id
            else this.blocks[idx] = BlockDirt.id
          } else if (y === height) {
            if (this.biome === Biome.Desert) this.blocks[idx] = BlockSand.id
            else if (this.biome === Biome.Snow) this.blocks[idx] = BlockSnow.id
            else if (this.biome === Biome.Mountains) this.blocks[idx] = BlockStone.id
            else this.blocks[idx] = BlockGrass.id
          } else if (y <= 48 && y > height) {
            this.blocks[idx] = BlockWater.id
          }
        }
      }
    }

    // Pre-compute noise caches for caves and ores (coarse resolution: 8x8x8)
    const CAVE_RES = 8
    const caveCacheSize = (CAVE_RES + 1) * (CAVE_RES + 1) * (CAVE_RES + 1)
    const caveCache1 = new Float32Array(caveCacheSize)
    const caveCache2 = new Float32Array(caveCacheSize)
    const oreCache = new Float32Array(caveCacheSize)

    precomputeNoise3D(this.x * CHUNK_WIDTH, this.z * CHUNK_DEPTH, 5, 30, 0.04, this.seed + 80000, CAVE_RES, caveCache1)
    precomputeNoise3D(this.x * CHUNK_WIDTH, this.z * CHUNK_DEPTH, 5, 30, 0.06, this.seed + 80100, CAVE_RES, caveCache2)
    precomputeNoise3D(this.x * CHUNK_WIDTH, this.z * CHUNK_DEPTH, 5, 50, 0.1, this.seed + 100000, CAVE_RES, oreCache)

    // Cave + ore pass: sample from pre-computed caches
    for (let y = 5; y < 30; y++) {
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const nx = x / CHUNK_WIDTH
          const nz = z / CHUNK_DEPTH
          const ny = y / CHUNK_HEIGHT

          const caveNoise = sampleNoise3D(nx, nz, ny, CAVE_RES, caveCache1)
          const caveNoise2 = sampleNoise3D(nx, nz, ny, CAVE_RES, caveCache2)

          const idx = this.idx(x, y, z)
          const block = this.blocks[idx]
          if (caveNoise > 0.42 && caveNoise2 > 0.42) {
            if (block === BlockStone.id || block === BlockDirt.id || block === BlockCoalOre.id || block === BlockIronOre.id) {
              this.blocks[idx] = 0 // carve cave
            }
          } else if (block === BlockStone.id) {
            // Ore check (only if not in a cave)
            const oreNoise = sampleNoise3D(nx, nz, ny, CAVE_RES, oreCache)
            if (y < 20 && oreNoise > 0.6) this.blocks[idx] = BlockIronOre.id
            else if (y < 40 && oreNoise > 0.55) this.blocks[idx] = BlockCoalOre.id
          }
          // M11: Lava pools in deep caves (y < 15)
          if (y < 15 && block === BlockStone.id) {
            const lavaNoise = sampleNoise3D(nx, nz, ny, CAVE_RES, caveCache1)
            if (lavaNoise > 0.55) {
              this.blocks[idx] = BlockLava.id
            }
          }
        }
      }
    }

    // Upper caves (shallow, near surface) — 4x4 cache for speed
    const UPPER_RES = 4
    const upperCacheSize = (UPPER_RES + 1) * (UPPER_RES + 1) * (UPPER_RES + 1)
    const upperCache1 = new Float32Array(upperCacheSize)
    const upperCache2 = new Float32Array(upperCacheSize)
    precomputeNoise3D(this.x * CHUNK_WIDTH, this.z * CHUNK_DEPTH, 25, 45, 0.08, this.seed + 90000, UPPER_RES, upperCache1)
    precomputeNoise3D(this.x * CHUNK_WIDTH, this.z * CHUNK_DEPTH, 25, 45, 0.1, this.seed + 90100, UPPER_RES, upperCache2)

    for (let y = 25; y < 45; y++) {
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const nx = x / CHUNK_WIDTH
          const nz = z / CHUNK_DEPTH
          const ny = y / CHUNK_HEIGHT

          const c1 = sampleNoise3D(nx, nz, ny, UPPER_RES, upperCache1)
          const c2 = sampleNoise3D(nx, nz, ny, UPPER_RES, upperCache2)

          if (c1 > 0.55 && c2 > 0.55) {
            const idx = this.idx(x, y, z)
            const b = this.blocks[idx]
            if (b === BlockStone.id || b === BlockDirt.id) this.blocks[idx] = 0
          }
        }
      }
    }

    // Trees: only on plains and forest biomes
    if (this.biome === Biome.Forest || this.biome === Biome.Plains) {
      const treeDensity = this.biome === Biome.Forest ? 0.15 : 0.05
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          if (terrainVariation[z * CHUNK_WIDTH + x] > 0 && fbm(x * 0.5, z * 0.5, this.seed + 77777, 2) < treeDensity) {
            const height = heightMap[z * CHUNK_WIDTH + x]
            const surfaceBlock = this.getBlock(x, height, z)
            if (surfaceBlock === BlockGrass.id || surfaceBlock === BlockSnow.id) {
              this.placeTree(x, height, z, surfaceBlock)
            }
          }
        }
      }
    }
  }

  static chunkToLocal(cx: number, cz: number, lx: number, lz: number): [number, number] {
    return [cx * CHUNK_WIDTH + lx, cz * CHUNK_DEPTH + lz]
  }
}
