/**
 * Trap system unit tests
 * P4-4: Floor traps with damage and visual feedback.
 */
import { describe, it, expect } from 'vitest'
import { generateDungeon, getTrapAt, TileType } from '../src/systems/DungeonPCG'
import { TRAP_DEFS, TrapType, randomTrapType } from '../src/data/traps'

describe('Trap data', () => {
  it('has all three trap types defined', () => {
    expect(TRAP_DEFS[TrapType.SPIKE]).toBeTruthy()
    expect(TRAP_DEFS[TrapType.POISON]).toBeTruthy()
    expect(TRAP_DEFS[TrapType.FIRE]).toBeTruthy()
  })

  it('each trap type has a damage value', () => {
    expect(TRAP_DEFS[TrapType.SPIKE].damage).toBe(5)
    expect(TRAP_DEFS[TrapType.POISON].damage).toBe(3)
    expect(TRAP_DEFS[TrapType.FIRE].damage).toBe(7)
  })

  it('randomTrapType returns a valid trap type', () => {
    const type = randomTrapType()
    expect(Object.values(TrapType)).toContain(type)
  })
})

describe('Trap generation', () => {
  it('generates trap positions in dungeon', () => {
    const dungeon = generateDungeon(12345, 1, TRAP_DEFS[TrapType.SPIKE].emissive as any)
    expect(dungeon.trapPositions.size).toBeGreaterThan(0)
  })

  it('generates more traps on deeper floors', () => {
    const d1 = generateDungeon(12345, 1)
    const d10 = generateDungeon(12345, 10)
    expect(d10.trapPositions.size).toBeGreaterThan(d1.trapPositions.size)
  })

  it('spawn is never a trap', () => {
    const dungeon = generateDungeon(12345, 1)
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    expect(dungeon.trapPositions.has(spawnKey)).toBe(false)
  })

  it('stairs are never a trap', () => {
    const dungeon = generateDungeon(12345, 1)
    const stairsKey = `${dungeon.stairsX},${dungeon.stairsY}`
    expect(dungeon.trapPositions.has(stairsKey)).toBe(false)
  })

  it('traps have TRAP type in cells', () => {
    const dungeon = generateDungeon(12345, 1)
    for (const key of dungeon.trapPositions.keys()) {
      const [gx, gy] = key.split(',').map(Number)
      const cell = dungeon.cells[gy * dungeon.width + gx]
      expect(cell.type).toBe(TileType.TRAP)
    }
  })

  it('traps and stealth do not overlap', () => {
    const dungeon = generateDungeon(12345, 1)
    for (const trapKey of dungeon.trapPositions.keys()) {
      expect(dungeon.stealthTiles.has(trapKey)).toBe(false)
    }
  })
})

describe('Trap detection', () => {
  it('getTrapAt returns trap type for trap position', () => {
    const dungeon = generateDungeon(12345, 1)
    const trapKey = dungeon.trapPositions.keys().next().value!
    const [gx, gy] = trapKey.split(',').map(Number)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    const trapType = getTrapAt(dungeon, wx, wz)
    expect(trapType).toBeTruthy()
  })

  it('getTrapAt returns null for non-trap position', () => {
    const dungeon = generateDungeon(12345, 1)
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    const [gx, gy] = spawnKey.split(',').map(Number)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    expect(getTrapAt(dungeon, wx, wz)).toBeNull()
  })

  it('getTrapAt returns null for out-of-bounds position', () => {
    const dungeon = generateDungeon(12345, 1)
    expect(getTrapAt(dungeon, -999, -999)).toBeNull()
  })
})
