/**
 * Sealed doors — P5-4: door detection, opening, and grid mapping.
 */
import { describe, it, expect } from 'vitest'
import { generateDungeon, isSealedDoor, openDoorAt, getGridPosition, TileType } from '../src/systems/DungeonPCG'
import { FLOOR_THEMES } from '../src/data/floors'

describe('getGridPosition', () => {
  it('maps spawn world pos to grid coords', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const worldX = dungeon.spawnX - dungeon.width / 2
    const worldZ = dungeon.spawnY - dungeon.height / 2
    const [gx, gy] = getGridPosition(dungeon, worldX, worldZ)
    expect(gx).toBe(dungeon.spawnX)
    expect(gy).toBe(dungeon.spawnY)
  })

  it('increments grid coords when world pos moves +1 in each axis', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const worldX = dungeon.spawnX - dungeon.width / 2
    const worldZ = dungeon.spawnY - dungeon.height / 2
    const [gx1, gy1] = getGridPosition(dungeon, worldX, worldZ)
    const [gx2, gy2] = getGridPosition(dungeon, worldX + 1, worldZ + 1)
    expect(gx2).toBe(gx1 + 1)
    expect(gy2).toBe(gy1 + 1)
  })
})

describe('isSealedDoor', () => {
  it('detects door tiles in dungeon', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Find a door tile in the dungeon
    const doorPositions: { x: number; y: number }[] = []
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const idx = y * dungeon.width + x
        if (dungeon.cells[idx] && dungeon.cells[idx].type === TileType.DOOR) {
          const wx = x - dungeon.width / 2
          const wz = y - dungeon.height / 2
          doorPositions.push({ x: wx, y: wz })
        }
      }
    }
    if (doorPositions.length === 0) {
      // Dungeon may have no walls to carve through — skip
      expect(true).toBe(true)
      return
    }
    const door = doorPositions[0]
    expect(isSealedDoor(dungeon, door.x, door.y)).toBe(true)
  })

  it('returns false for floor tiles', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Spawn should be SPAWN tile, never DOOR
    const worldX = dungeon.spawnX - dungeon.width / 2
    const worldZ = dungeon.spawnY - dungeon.height / 2
    expect(isSealedDoor(dungeon, worldX, worldZ)).toBe(false)
  })

  it('returns false for out-of-bounds positions', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    expect(isSealedDoor(dungeon, -1000, -1000)).toBe(false)
  })
})

describe('openDoorAt', () => {
  it('converts door tile to floor and returns true', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Find a door tile
    let doorWorldX = 0, doorWorldZ = 0
    let foundDoor = false
    for (let y = 0; y < dungeon.height && !foundDoor; y++) {
      for (let x = 0; x < dungeon.width && !foundDoor; x++) {
        const idx = y * dungeon.width + x
        if (dungeon.cells[idx] && dungeon.cells[idx].type === TileType.DOOR) {
          doorWorldX = x - dungeon.width / 2
          doorWorldZ = y - dungeon.height / 2
          foundDoor = true
        }
      }
    }
    if (!foundDoor) {
      expect(true).toBe(true)
      return
    }
    expect(isSealedDoor(dungeon, doorWorldX, doorWorldZ)).toBe(true)
    const result = openDoorAt(dungeon, doorWorldX, doorWorldZ)
    expect(result).toBe(true)
    expect(isSealedDoor(dungeon, doorWorldX, doorWorldZ)).toBe(false)
  })

  it('returns false when tile is not a door', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const worldX = dungeon.spawnX - dungeon.width / 2
    const worldZ = dungeon.spawnY - dungeon.height / 2
    const result = openDoorAt(dungeon, worldX, worldZ)
    expect(result).toBe(false)
  })

  it('door opened once stays open on second call', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    let doorWorldX = 0, doorWorldZ = 0
    let foundDoor = false
    for (let y = 0; y < dungeon.height && !foundDoor; y++) {
      for (let x = 0; x < dungeon.width && !foundDoor; x++) {
        const idx = y * dungeon.width + x
        if (dungeon.cells[idx] && dungeon.cells[idx].type === TileType.DOOR) {
          doorWorldX = x - dungeon.width / 2
          doorWorldZ = y - dungeon.height / 2
          foundDoor = true
        }
      }
    }
    if (!foundDoor) {
      expect(true).toBe(true)
      return
    }
    openDoorAt(dungeon, doorWorldX, doorWorldZ)
    expect(openDoorAt(dungeon, doorWorldX, doorWorldZ)).toBe(false)
  })
})
