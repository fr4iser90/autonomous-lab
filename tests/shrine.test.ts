/**
 * Shrine system unit tests
 * P4-2: Sacred shrines that grant buffs when activated.
 */
import { describe, it, expect } from 'vitest'
import { generateDungeon, getShrineAt } from '../src/systems/DungeonPCG'
import { SHRINE_DEFS, ShrineType, randomShrineType } from '../src/data/shrines'

describe('Shrine data', () => {
  it('has all three shrine types defined', () => {
    expect(SHRINE_DEFS.heal).toBeTruthy()
    expect(SHRINE_DEFS.buff).toBeTruthy()
    expect(SHRINE_DEFS.shield).toBeTruthy()
  })

  it('each shrine type has emoji, label, and color', () => {
    for (const type of ['heal', 'buff', 'shield'] as ShrineType[]) {
      const def = SHRINE_DEFS[type]
      expect(def.emoji).toBeTruthy()
      expect(def.label).toBeTruthy()
      expect(def.color).toBeTruthy()
      expect(def.emissive).toBeTruthy()
    }
  })

  it('randomShrineType returns a valid shrine type', () => {
    for (let i = 0; i < 100; i++) {
      const type = randomShrineType()
      expect(['heal', 'buff', 'shield']).toContain(type)
    }
  })
})

describe('Shrine generation', () => {
  it('generates shrine positions in dungeon', () => {
    const dungeon = generateDungeon(12345, 1)
    expect(dungeon.shrinePositions.size).toBeGreaterThan(0)
  })

  it('generates exactly one shrine per floor', () => {
    for (let floor = 1; floor <= 10; floor++) {
      const dungeon = generateDungeon(floor * 1000, floor)
      expect(dungeon.shrinePositions.size).toBe(1)
    }
  })

  it('spawn is never a shrine', () => {
    const dungeon = generateDungeon(12345, 1)
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    expect(dungeon.shrinePositions.has(spawnKey)).toBe(false)
  })

  it('stairs are never a shrine', () => {
    const dungeon = generateDungeon(12345, 1)
    const stairsKey = `${dungeon.stairsX},${dungeon.stairsY}`
    expect(dungeon.shrinePositions.has(stairsKey)).toBe(false)
  })

  it('shrines are placed in room cells', () => {
    const dungeon = generateDungeon(12345, 1)
    for (const key of dungeon.shrinePositions.keys()) {
      const [gx, gy] = key.split(',').map(Number)
      // Grid position should be within dungeon bounds
      expect(gx).toBeGreaterThanOrEqual(0)
      expect(gx).toBeLessThan(dungeon.width)
      expect(gy).toBeGreaterThanOrEqual(0)
      expect(gy).toBeLessThan(dungeon.height)
    }
  })

  it('shrines do not overlap with traps', () => {
    const dungeon = generateDungeon(12345, 1)
    for (const shrineKey of dungeon.shrinePositions.keys()) {
      expect(dungeon.trapPositions.has(shrineKey)).toBe(false)
    }
  })

  it('shrines do not overlap with stealth tiles', () => {
    const dungeon = generateDungeon(12345, 1)
    for (const shrineKey of dungeon.shrinePositions.keys()) {
      expect(dungeon.stealthTiles.has(shrineKey)).toBe(false)
    }
  })
})

describe('Shrine detection', () => {
  it('getShrineAt returns shrine type for shrine position', () => {
    const dungeon = generateDungeon(12345, 1)
    const shrineKey = dungeon.shrinePositions.keys().next().value!
    const [gx, gy] = shrineKey.split(',').map(Number)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    const shrineType = getShrineAt(dungeon, wx, wz)
    expect(shrineType).toBeTruthy()
  })

  it('getShrineAt returns null for non-shrine position', () => {
    const dungeon = generateDungeon(12345, 1)
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    const [gx, gy] = spawnKey.split(',').map(Number)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    expect(getShrineAt(dungeon, wx, wz)).toBeNull()
  })

  it('getShrineAt returns null for out-of-bounds position', () => {
    const dungeon = generateDungeon(12345, 1)
    expect(getShrineAt(dungeon, -999, -999)).toBeNull()
  })
})

describe('Shrine types', () => {
  it('heal shrine has healPct defined', () => {
    expect(SHRINE_DEFS.heal.healPct).toBe(0.3)
  })

  it('buff shrine has damageBonus defined', () => {
    expect(SHRINE_DEFS.buff.damageBonus).toBe(2)
    expect(SHRINE_DEFS.buff.duration).toBe(30)
  })

  it('shield shrine has armorBonus defined', () => {
    expect(SHRINE_DEFS.shield.armorBonus).toBe(2)
    expect(SHRINE_DEFS.shield.duration).toBe(20)
  })
})
