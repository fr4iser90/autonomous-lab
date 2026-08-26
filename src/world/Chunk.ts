// Chunk: 16x16x96 voxel chunk with noise-based terrain generation

import { fbm } from './Noise'
import { BlockGrass, BlockDirt, BlockStone, BlockSand, BlockBedrock, BlockWater, BlockSnow, BlockCoalOre, BlockIronOre } from '../data/blocks'

export const CHUNK_WIDTH = 16
export const CHUNK_HEIGHT = 96
export const CHUNK_DEPTH = 16

export class Chunk {
  public readonly x: number
  public readonly z: number
  public readonly seed: number
  public blocks: Uint8Array // flat array, index = x + z * CHUNK_WIDTH + y * CHUNK_WIDTH * CHUNK_DEPTH

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

  generate(): void {
    // Height map using FBM
    const heightMap = new Float32Array(CHUNK_WIDTH * CHUNK_DEPTH)
    for (let z = 0; z < CHUNK_DEPTH; z++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        const wx = this.x * CHUNK_WIDTH + x
        const wz = this.z * CHUNK_DEPTH + z

        // Multi-octave noise for terrain
        const baseHeight = 48
        const terrainH = Math.floor(
          baseHeight + fbm(wx * 0.01, wz * 0.01, this.seed, 6) * 30 +
          fbm(wx * 0.05, wz * 0.05, this.seed + 5000, 3) * 5
        )

        heightMap[z * CHUNK_WIDTH + x] = Math.max(10, Math.min(90, terrainH))
      }
    }

    // Biome determination
    const biomeNoise = fbm(this.x * 0.02, this.z * 0.02, this.seed + 10000, 3)

    // Fill chunks
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const height = heightMap[z * CHUNK_WIDTH + x]
          const idx = this.idx(x, y, z)

          if (y === 0) {
            this.blocks[idx] = BlockBedrock.id
          } else if (y < height - 4) {
            // Deep underground: stone with ores
            let blockId = BlockStone.id
            const oreNoise = fbm(x + this.x * 16, y + this.z * 16, this.seed + 20000, 2)
            if (y < 40 && oreNoise > 0.65) {
              blockId = BlockCoalOre.id
            } else if (y < 30 && oreNoise > 0.75) {
              blockId = BlockIronOre.id
            }
            this.blocks[idx] = blockId
          } else if (y < height) {
            // Sub-surface
            if (biomeNoise > 0.6) {
              this.blocks[idx] = BlockSand.id // desert biome
            } else if (height > 70) {
              this.blocks[idx] = BlockSnow.id // snowy peaks
            } else {
              this.blocks[idx] = BlockDirt.id
            }
          } else if (y === height) {
            // Surface
            if (biomeNoise > 0.6) {
              this.blocks[idx] = BlockSand.id
            } else if (height > 70) {
              this.blocks[idx] = BlockSnow.id
            } else {
              this.blocks[idx] = BlockGrass.id
            }
          } else if (y <= 48 && y > height) {
            // Water fill
            this.blocks[idx] = BlockWater.id
          }
          // else: air
        }
      }
    }
  }

  /** Convert chunk-local coords to world coords */
  static chunkToLocal(cx: number, cz: number, lx: number, lz: number): [number, number] {
    return [cx * CHUNK_WIDTH + lx, cz * CHUNK_DEPTH + lz]
  }
}
