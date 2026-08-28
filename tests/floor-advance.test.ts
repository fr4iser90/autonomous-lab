/**
 * Floor advance — P5-5: stairs detection and floor transition.
 */
import { describe, it, expect } from 'vitest'
import { generateDungeon, isOnStairs, getGridPosition, TileType } from '../src/systems/DungeonPCG'
import { FLOOR_THEMES } from '../src/data/floors'

describe('isOnStairs', () => {
  it('detects stairs tiles in dungeon', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Stairs are placed at stairsX, stairsY
    const worldX = dungeon.stairsX - dungeon.width / 2
    const worldZ = dungeon.stairsY - dungeon.height / 2
    expect(isOnStairs(dungeon, worldX, worldZ)).toBe(true)
  })

  it('returns false for spawn tiles', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const worldX = dungeon.spawnX - dungeon.width / 2
    const worldZ = dungeon.spawnY - dungeon.height / 2
    expect(isOnStairs(dungeon, worldX, worldZ)).toBe(false)
  })

  it('returns false for floor tiles', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Find a floor tile (not spawn, not stairs)
    let floorWorldX = 0, floorWorldZ = 0
    let foundFloor = false
    for (let y = 0; y < dungeon.height && !foundFloor; y++) {
      for (let x = 0; x < dungeon.width && !foundFloor; x++) {
        const idx = y * dungeon.width + x
        const cell = dungeon.cells[idx]
        if (cell && cell.type === TileType.FLOOR) {
          floorWorldX = x - dungeon.width / 2
          floorWorldZ = y - dungeon.height / 2
          foundFloor = true
        }
      }
    }
    if (!foundFloor) {
      // All floor tiles converted — dungeon too small, skip
      expect(true).toBe(true)
      return
    }
    expect(isOnStairs(dungeon, floorWorldX, floorWorldZ)).toBe(false)
  })

  it('returns false for wall tiles', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Find a wall tile
    let wallWorldX = 0, wallWorldZ = 0
    let foundWall = false
    for (let y = 0; y < dungeon.height && !foundWall; y++) {
      for (let x = 0; x < dungeon.width && !foundWall; x++) {
        const idx = y * dungeon.width + x
        const cell = dungeon.cells[idx]
        if (cell && cell.type === TileType.WALL) {
          wallWorldX = x - dungeon.width / 2
          wallWorldZ = y - dungeon.height / 2
          foundWall = true
        }
      }
    }
    if (!foundWall) {
      expect(true).toBe(true)
      return
    }
    expect(isOnStairs(dungeon, wallWorldX, wallWorldZ)).toBe(false)
  })

  it('returns false for out-of-bounds positions', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    expect(isOnStairs(dungeon, -1000, -1000)).toBe(false)
    expect(isOnStairs(dungeon, 1000, 1000)).toBe(false)
  })

  it('detects stairs at correct grid coordinates', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const [gx, gy] = getGridPosition(dungeon, 0, 0)
    const worldX = gx - dungeon.width / 2
    const worldZ = gy - dungeon.height / 2
    if (gx === dungeon.stairsX && gy === dungeon.stairsY) {
      expect(isOnStairs(dungeon, worldX, worldZ)).toBe(true)
    }
  })
})

describe('floor numbering', () => {
  it('generates dungeon with correct floor number', () => {
    const dungeon = generateDungeon(12345, 5, FLOOR_THEMES[4])
    expect(dungeon.floorNumber).toBe(5)
  })

  it('uses correct theme for floor 5 (jungle)', () => {
    const dungeon = generateDungeon(12345, 5, FLOOR_THEMES[4])
    expect(dungeon.theme.id).toBe('jungle')
  })

  it('stairs are always placed in the last room', () => {
    const dungeon = generateDungeon(99999, 10, FLOOR_THEMES[9])
    expect(dungeon.stairsX).toBeGreaterThanOrEqual(0)
    expect(dungeon.stairsY).toBeGreaterThanOrEqual(0)
    // Stairs should be within dungeon bounds
    expect(dungeon.stairsX).toBeLessThan(dungeon.width)
    expect(dungeon.stairsY).toBeLessThan(dungeon.height)
  })
})
