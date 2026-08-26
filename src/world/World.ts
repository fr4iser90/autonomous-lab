// World: Manages chunks and block overrides for the infinite world

import { Chunk, CHUNK_HEIGHT } from './Chunk'
import { getBlock } from '../data/blocks'

export class World {
  public readonly seed: number
  private chunks: Map<string, Chunk> = new Map()
  private overrides: Map<string, number> // "wx,wy,wz" -> blockId

  constructor(seed: number, overrides?: Map<string, number>) {
    this.seed = seed
    this.overrides = overrides ? new Map(overrides) : new Map()
  }

  private chunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`
  }

  private worldKey(wx: number, wy: number, wz: number): string {
    return `${wx},${wy},${wz}`
  }

  getBlock(wx: number, wy: number, wz: number): number {
    // Check overrides first
    const overrideKey = this.worldKey(wx, wy, wz)
    if (this.overrides.has(overrideKey)) {
      return this.overrides.get(overrideKey)!
    }

    const cx = Math.floor(wx / 16)
    const cz = Math.floor(wz / 16)
    const localX = ((wx % 16) + 16) % 16
    const localZ = ((wz % 16) + 16) % 16

    const chunk = this.chunks.get(this.chunkKey(cx, cz))
    if (!chunk) return 0 // Air for unloaded chunks

    const blockId = chunk.getBlock(localX, wy, localZ)
    if (blockId < 0) return 0

    return blockId
  }

  setBlock(wx: number, wy: number, wz: number, blockId: number): void {
    this.overrides.set(this.worldKey(wx, wy, wz), blockId)
  }

  removeOverride(wx: number, wy: number, wz: number): void {
    this.overrides.delete(this.worldKey(wx, wy, wz))
  }

  loadChunk(cx: number, cz: number): Chunk {
    const key = this.chunkKey(cx, cz)
    let chunk = this.chunks.get(key)
    if (!chunk) {
      chunk = new Chunk(cx, cz, this.seed)
      this.chunks.set(key, chunk)
    }
    return chunk
  }

  getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(this.chunkKey(cx, cz))
  }

  /** Get height at world position (highest solid block) */
  getHeight(wx: number, wz: number): number {
    // Ensure the relevant chunks are loaded
    const cx = Math.floor(wx / 16)
    const cz = Math.floor(wz / 16)
    this.loadChunk(cx, cz)

    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      const block = this.getBlock(wx, y, wz)
      const def = getBlock(block)
      if (def && def.solid) return y
    }
    return 0
  }

  /** Get all loaded chunks */
  getLoadedChunks(): Chunk[] {
    return Array.from(this.chunks.values())
  }

  getOverrides(): Map<string, number> {
    return new Map(this.overrides)
  }
}
