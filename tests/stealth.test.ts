/**
 * Stealth zone unit tests
 * P4-3: Stealth tiles reduce mob aggro range.
 */
import { describe, it, expect } from 'vitest'
import { generateDungeon, isOnStealthTile, TileType } from '../src/systems/DungeonPCG'
import { ChaseAI } from '../src/systems/ChaseAI'
import { FLOOR_THEMES } from '../src/data/floors'
import type { MobKit } from '../src/entities/MobKit'

describe('Stealth zones', () => {
  it('generates stealth tiles in dungeon', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    expect(dungeon.stealthTiles.size).toBeGreaterThan(0)
  })

  it('generates more stealth tiles on deeper floors', () => {
    const d1 = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const d10 = generateDungeon(12345, 10, FLOOR_THEMES[9])
    expect(d10.stealthTiles.size).toBeGreaterThan(d1.stealthTiles.size)
  })

  it('spawn is never a stealth tile', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    expect(dungeon.stealthTiles.has(spawnKey)).toBe(false)
  })

  it('stairs are never a stealth tile', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const stairsKey = `${dungeon.stairsX},${dungeon.stairsY}`
    expect(dungeon.stealthTiles.has(stairsKey)).toBe(false)
  })

  it('isOnStealthTile returns true for stealth grid position', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    // Pick a known stealth tile key
    const stealthKey = dungeon.stealthTiles.values().next().value!
    const [gx, gy] = stealthKey.split(',').map(Number)
    // World position = grid - width/2 + 0.5 (center of tile)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    expect(isOnStealthTile(dungeon, wx, wz)).toBe(true)
  })

  it('isOnStealthTile returns false for non-stealth position', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    const spawnKey = `${dungeon.spawnX},${dungeon.spawnY}`
    const [gx, gy] = spawnKey.split(',').map(Number)
    const wx = gx - dungeon.width / 2 + 0.5
    const wz = gy - dungeon.height / 2 + 0.5
    expect(isOnStealthTile(dungeon, wx, wz)).toBe(false)
  })

  it('isOnStealthTile returns false for out-of-bounds position', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    expect(isOnStealthTile(dungeon, -999, -999)).toBe(false)
  })

  it('stealth tiles have STEALTH type', () => {
    const dungeon = generateDungeon(12345, 1, FLOOR_THEMES[0])
    for (const key of dungeon.stealthTiles) {
      const [gx, gy] = key.split(',').map(Number)
      const cell = dungeon.cells[gy * dungeon.width + gx]
      expect(cell.type).toBe(TileType.STEALTH)
    }
  })

  it('ChaseAI reduces aggro range when player is in stealth', () => {
    const ai = new ChaseAI({
      aggroRange: 8,
      retreatRange: 15,
      attackRange: 1.2,
      attackCooldown: 1.0,
      moveSpeed: 2.5,
      stealthMultiplier: 0.35,
    })

    const fakeMob: MobKit = {
      position: { x: 0, y: 0, z: 0 },
      distanceTo: (x: number, z: number) => Math.sqrt(x * x + z * z),
      state: { type: 'goblin', alive: true, stats: { maxHp: 10, damage: 2 } },
    } as unknown as MobKit

    // Without stealth: aggro range is 8
    const decisionNoStealth = ai.decide(fakeMob, 6, 0, 0.01, false)
    expect(decisionNoStealth.action).toBe('chase')

    // With stealth: effective aggro = 8 * 0.35 = 2.8
    ai.reset()
    const decisionStealth = ai.decide(fakeMob, 5, 0, 0.01, true)
    expect(decisionStealth.action).toBe('idle')
  })

  it('ChaseAI stealth does not affect attack range', () => {
    const ai = new ChaseAI({
      aggroRange: 8,
      retreatRange: 15,
      attackRange: 1.2,
      attackCooldown: 0.5,
      moveSpeed: 2.5,
      stealthMultiplier: 0.35,
    })

    const fakeMob: MobKit = {
      position: { x: 0, y: 0, z: 0 },
      distanceTo: (x: number, z: number) => Math.sqrt(x * x + z * z),
      state: { type: 'goblin', alive: true, stats: { maxHp: 10, damage: 2 } },
    } as unknown as MobKit

    // Within attack range — should attack regardless of stealth
    const decision = ai.decide(fakeMob, 1.0, 0, 0.01, true)
    expect(decision.action).toBe('attack')
  })
})
