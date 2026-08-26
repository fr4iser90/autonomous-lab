// Lighting: Sky light and torch block light propagation for voxel world

import { World } from '../world/World'
import { Chunk, CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_DEPTH } from '../world/Chunk'
import { getBlock } from '../data/blocks'

export const MAX_LIGHT = 15
export const TORCH_LIGHT = 14
export const TORCH_RANGE = 8

// Light data per chunk: sky light and block light (1 byte per block: 0-15)
export class ChunkLighting {
  readonly skyLight: Uint8Array
  readonly blockLight: Uint8Array

  constructor() {
    this.skyLight = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH)
    this.blockLight = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH)
  }

  private idx(x: number, y: number, z: number): number {
    return x + z * CHUNK_WIDTH + y * CHUNK_WIDTH * CHUNK_DEPTH
  }

  getSkyLight(x: number, y: number, z: number): number {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return 0
    return this.skyLight[this.idx(x, y, z)]
  }

  getBlockLight(x: number, y: number, z: number): number {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return 0
    return this.blockLight[this.idx(x, y, z)]
  }

  getTotalLight(x: number, y: number, z: number): number {
    // Final light level = max(sky, block) — block light supplements sky
    const sky = this.getSkyLight(x, y, z)
    const block = this.getBlockLight(x, y, z)
    return Math.max(sky, block)
  }

  setSkyLight(x: number, y: number, z: number, value: number): void {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return
    this.skyLight[this.idx(x, y, z)] = Math.min(MAX_LIGHT, Math.max(0, value))
  }

  setBlockLight(x: number, y: number, z: number, value: number): void {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) return
    this.blockLight[this.idx(x, y, z)] = Math.min(MAX_LIGHT, Math.max(0, value))
  }

  clear(): void {
    this.skyLight.fill(0)
    this.blockLight.fill(0)
  }
}

/**
 * Calculate sky light for a chunk.
 * Sky light starts at MAX_LIGHT at the top of each column and decreases
 * by 1 per block, blocked entirely by opaque blocks.
 */
function calculateSkyLight(chunk: Chunk, lighting: ChunkLighting): void {
  // Reset sky light
  lighting.skyLight.fill(0)

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    for (let z = 0; z < CHUNK_DEPTH; z++) {
      let light = MAX_LIGHT

      for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
        const blockId = chunk.getBlock(x, y, z)
        const blockDef = getBlock(blockId)

        if (light > 0) {
          lighting.setSkyLight(x, y, z, light)
        }

        if (blockId === 0) {
          // Air — light passes through
          continue
        }

        if (blockDef && blockDef.transparent) {
          // Transparent block — light passes through with slight loss
          light = Math.max(0, light - 0) // no loss for transparent
          continue
        }

        if (blockDef && !blockDef.solid) {
          // Non-solid (like torch) — light passes through
          continue
        }

        // Opaque solid block — blocks light
        light = 0
      }
    }
  }
}

/**
 * Check if a block is a light source (torch, lava, etc.)
 */
function isLightSource(blockId: number): boolean {
  return blockId === 15 // BlockTorch
}

/**
 * Get the light level emitted by a light source block
 */
function getLightSourceLevel(blockId: number): number {
  if (blockId === 15) return TORCH_LIGHT // Torch
  return 0
}

/**
 * Calculate block (torch) light for a chunk using BFS flood-fill.
 * Spreads from torches within the chunk and neighboring chunks.
 */
function calculateBlockLight(chunk: Chunk, lighting: ChunkLighting, world: World): void {
  lighting.blockLight.fill(0)

  // Collect all torch positions in the chunk + adjacent chunks (within range)
  // A torch at edge of chunk affects neighbors up to TORCH_RANGE blocks away
  const cx = chunk.x
  const cz = chunk.z
  const range = TORCH_RANGE

  // Collect torch sources: check this chunk and neighbors within range
  const torchSources: Array<{ lx: number; ly: number; lz: number; level: number }> = []

  // Check chunks that could affect this chunk
  const chunkRange = Math.ceil(range / CHUNK_WIDTH) + 1
  for (let dx = -chunkRange; dx <= chunkRange; dx++) {
    for (let dz = -chunkRange; dz <= chunkRange; dz++) {
      const ncx = cx + dx
      const ncz = cz + dz
      const nchunk = world.getChunk(ncx, ncz)
      if (!nchunk) continue

      // Determine the relevant region of the neighbor chunk
      let xStart = 0, xEnd = CHUNK_WIDTH
      let zStart = 0, zEnd = CHUNK_DEPTH

      // Clamp to chunks that are far enough to matter
      if (dx > 0) {
        xStart = Math.max(0, CHUNK_WIDTH - range)
      } else if (dx < 0) {
        xEnd = Math.min(CHUNK_WIDTH, range + 1)
      }
      if (dz > 0) {
        zStart = Math.max(0, CHUNK_DEPTH - range)
      } else if (dz < 0) {
        zEnd = Math.min(CHUNK_DEPTH, range + 1)
      }

      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = zStart; z < zEnd; z++) {
          for (let x = xStart; x < xEnd; x++) {
            const blockId = nchunk.getBlock(x, y, z)
            if (isLightSource(blockId)) {
              const level = getLightSourceLevel(blockId)
              // Convert neighbor chunk local coords to this chunk's local coords
              const localX = x + dx * CHUNK_WIDTH
              const localZ = z + dz * CHUNK_WIDTH
              torchSources.push({ lx: localX, ly: y, lz: localZ, level })
            }
          }
        }
      }
    }
  }

  // BFS from each torch source
  // Use a queue: [x, y, z, lightLevel]
  // Simple approach: iterate outward from each source
  for (const source of torchSources) {
    // BFS flood fill from torch
    const queue: Array<{ x: number; y: number; z: number; level: number }> = []
    const visited = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH)

    // Start at torch position
    const sx = source.lx, sy = source.ly, sz = source.lz
    if (sx >= 0 && sx < CHUNK_WIDTH && sy >= 0 && sy < CHUNK_HEIGHT && sz >= 0 && sz < CHUNK_DEPTH) {
      queue.push({ x: sx, y: sy, z: sz, level: source.level })
      const sidx = sx + sz * CHUNK_WIDTH + sy * CHUNK_WIDTH * CHUNK_DEPTH
      visited[sidx] = 1
    }

    // 4-directional cardinal + vertical (6-neighbor) flood fill
    const dirs = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1],
    ]

    let qi = 0
    while (qi < queue.length) {
      const { x, y, z, level } = queue[qi++]
      if (level <= 0) continue

      // Set block light at this position
      const idx = x + z * CHUNK_WIDTH + y * CHUNK_WIDTH * CHUNK_DEPTH
      lighting.blockLight[idx] = Math.max(lighting.blockLight[idx], level)

      if (level <= 1) continue

      // Spread to neighbors
      for (const [dx, dy, dz] of dirs) {
        const nx = x + dx, ny = y + dy, nz = z + dz
        if (nx < 0 || nx >= CHUNK_WIDTH || nz < 0 || nz >= CHUNK_DEPTH || ny < 0 || ny >= CHUNK_HEIGHT) continue

        const nidx = nx + nz * CHUNK_WIDTH + ny * CHUNK_WIDTH * CHUNK_DEPTH
        if (visited[nidx]) continue

        // Check if neighbor is opaque (blocks light)
        const worldX = chunk.x * CHUNK_WIDTH + nx
        const worldZ = chunk.z * CHUNK_WIDTH + nz
        const neighborBlockId = world.getBlock(worldX, ny, worldZ)
        const neighborDef = getBlock(neighborBlockId)

        if (neighborBlockId === 0) {
          // Air — light passes through
          visited[nidx] = 1
          queue.push({ x: nx, y: ny, z: nz, level: level - 1 })
        } else if (neighborDef && neighborDef.transparent) {
          // Transparent — light passes through
          visited[nidx] = 1
          queue.push({ x: nx, y: ny, z: nz, level: level - 1 })
        } else if (neighborDef && isLightSource(neighborBlockId)) {
          // Another light source — passes through
          visited[nidx] = 1
          queue.push({ x: nx, y: ny, z: nz, level: Math.max(level - 1, getLightSourceLevel(neighborBlockId)) })
        }
        // Opaque solid blocks block light — don't add to queue
      }
    }
  }
}

/**
 * Main lighting update: calculate both sky and block light for a chunk.
 */
function updateChunkLighting(chunk: Chunk, world: World, lighting: ChunkLighting): void {
  lighting.clear()
  calculateSkyLight(chunk, lighting)
  calculateBlockLight(chunk, lighting, world)
}

/**
 * Get the combined light level at a world position.
 * Queries the appropriate chunk's lighting data.
 */
function getLightAt(wx: number, wy: number, wz: number, chunkLightings: Map<string, ChunkLighting>): number {
  const cx = Math.floor(wx / 16)
  const cz = Math.floor(wz / 16)
  const localX = ((wx % 16) + 16) % 16
  const localZ = ((wz % 16) + 16) % 16

  const key = `${cx},${cz}`
  const lighting = chunkLightings.get(key)
  if (!lighting) return 0

  return lighting.getTotalLight(localX, wy, localZ)
}

export {
  calculateSkyLight,
  calculateBlockLight,
  updateChunkLighting,
  getLightAt,
  isLightSource,
  getLightSourceLevel,
}
