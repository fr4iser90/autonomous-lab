// WaterSystem: Simulates water and lava flow, converts lava+water to stone, rebuilds affected chunks

import { World } from '../world/World'
import { BlockWater, BlockLava, BlockStone, getBlock } from '../data/blocks'

// Water level for ocean generation
export const WATER_LEVEL = 48

export class WaterSystem {
  private world: World

  constructor(world: World) {
    this.world = world
  }

  /** Check if a block position is at or above the water level */
  isAtWaterLevel(_wx: number, wy: number, _wz: number): boolean {
    return wy <= WATER_LEVEL
  }

  /** Simulate water flow: water spreads to adjacent empty blocks above water level */
  simulateWaterFlow(): void {
    // Simple one-pass: water flows to adjacent air blocks above water level
    // Only process blocks near the water surface for efficiency
    for (const chunk of this.world.getLoadedChunks()) {
      const { x, z } = chunk
      for (let ly = Math.max(1, WATER_LEVEL - 3); ly <= WATER_LEVEL + 2; ly++) {
        for (let lz = 0; lz < 16; lz++) {
          for (let lx = 0; lx < 16; lx++) {
            const wx = x * 16 + lx
            const wz = z * 16 + lz
            const block = this.world.getBlock(wx, ly, wz)

            if (block === BlockWater.id) {
              // Try to spread water to adjacent empty blocks
              this.trySpreadWater(wx, ly, wz)
            }
          }
        }
      }
    }
  }

  private trySpreadWater(wx: number, wy: number, wz: number): void {
    // Spread to adjacent horizontal/above air blocks above water level
    const dirs: Array<[number, number, number]> = [
      [-1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1], // horizontal
      [0, 1, 0], // up
    ]

    for (const [dx, dy, dz] of dirs) {
      const nx = wx + dx, ny = wy + dy, nz = wz + dz
      if (this.world.getBlock(nx, ny, nz) === 0) {
        // Only flow up if this water is below or at target height
        if (wy <= ny) {
          this.world.setBlock(nx, ny, nz, BlockWater.id)
        }
      }
    }
  }

  /** Simulate lava flow: lava flows downward, then horizontally */
  simulateLavaFlow(): void {
    // Process from bottom up so lava flows naturally downward first
    for (const chunk of this.world.getLoadedChunks()) {
      const { x, z } = chunk
      for (let ly = 1; ly < 15; ly++) {
        for (let lz = 0; lz < 16; lz++) {
          for (let lx = 0; lx < 16; lx++) {
            const wx = x * 16 + lx
            const wz = z * 16 + lz
            const block = this.world.getBlock(wx, ly, wz)

            if (block === BlockLava.id) {
              this.tryFlowLava(wx, ly, wz)
            }
          }
        }
      }
    }
  }

  private tryFlowLava(wx: number, wy: number, wz: number): void {
    // Lava flows downward first
    if (wy > 1 && this.world.getBlock(wx, wy - 1, wz) === 0) {
      this.world.setBlock(wx, wy - 1, wz, BlockLava.id)
      this.world.setBlock(wx, wy, wz, BlockWater.id) // Lava source becomes water after flowing
      return
    }

    // Then horizontally
    const dirs: Array<[number, number, number]> = [
      [-1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1],
    ]

    for (const [dx, , dz] of dirs) {
      const nx = wx + dx, nz = wz + dz
      if (this.world.getBlock(nx, wy, nz) === 0) {
        this.world.setBlock(nx, wy, nz, BlockLava.id)
        return // Only flow one step per tick
      }
    }
  }

  /** Convert lava touching water to stone (obsidian-like behavior: lava → stone) */
  convertLavaWaterToStone(): void {
    for (const chunk of this.world.getLoadedChunks()) {
      const { x, z } = chunk
      for (let ly = 1; ly < CHUNK_HEIGHT; ly++) {
        for (let lz = 0; lz < 16; lz++) {
          for (let lx = 0; lx < 16; lx++) {
            const wx = x * 16 + lx
            const wz = z * 16 + lz
            const block = this.world.getBlock(wx, ly, wz)

            if (block === BlockLava.id) {
              // Check all 6 neighbors for water
              const dirs: Array<[number, number, number]> = [
                [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
              ]
              for (const [dx, dy, dz] of dirs) {
                if (this.world.getBlock(wx + dx, ly + dy, wz + dz) === BlockWater.id) {
                  this.world.setBlock(wx, ly, wz, BlockStone.id)
                  this.world.setBlock(wx + dx, ly + dy, wz + dz, BlockStone.id)
                  break
                }
              }
            }
          }
        }
      }
    }
  }

  /** Check if a block position contains flowable liquid (water or lava) */
  isLiquid(wx: number, wy: number, wz: number): boolean {
    const block = this.world.getBlock(wx, wy, wz)
    const def = getBlock(block)
    return def?.flowable === true
  }

  /** Check if a position is submerged in water */
  isSubmergedInWater(wx: number, wy: number, wz: number): boolean {
    return this.world.getBlock(wx, wy, wz) === BlockWater.id
  }

  /** Check if a position contains lava */
  isLava(wx: number, wy: number, wz: number): boolean {
    return this.world.getBlock(wx, wy, wz) === BlockLava.id
  }
}

// Keep CHUNK_HEIGHT accessible for the service
const CHUNK_HEIGHT = 96
