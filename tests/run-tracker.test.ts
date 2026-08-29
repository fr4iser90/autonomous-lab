/**
 * RunTracker unit tests — P12: boss kill tracking integration.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as RunTracker from '../src/systems/RunTracker'

beforeEach(() => {
  // Reset localStorage and in-memory state for each test
  localStorage.clear()
  RunTracker._reset()
})

// ─── Run lifecycle ──────────────────────────────────────────────────

describe('RunTracker', () => {
  it('startRun initializes with zero counters', () => {
    RunTracker.startRun()
    const snapshot = RunTracker.endRun()
    expect(snapshot).not.toBeNull()
    expect(snapshot!.floor).toBe(1)
    expect(snapshot!.mobsKilled).toBe(0)
    expect(snapshot!.bossKills).toBe(0)
  })

  it('recordMobKill increments mobsKilled', () => {
    RunTracker.startRun()
    RunTracker.recordMobKill('goblin')
    RunTracker.recordMobKill('shade')
    const snapshot = RunTracker.endRun()
    expect(snapshot!.mobsKilled).toBe(2)
    expect(snapshot!.bossKills).toBe(0)
  })

  it('recordBossKill increments bossKills', () => {
    RunTracker.startRun()
    RunTracker.recordBossKill()
    const snapshot = RunTracker.endRun()
    expect(snapshot!.bossKills).toBe(1)
    expect(snapshot!.mobsKilled).toBe(0)
  })

  it('recordBossKill can be called multiple times', () => {
    RunTracker.startRun()
    RunTracker.recordBossKill()
    RunTracker.recordBossKill()
    RunTracker.recordBossKill()
    const snapshot = RunTracker.endRun()
    expect(snapshot!.bossKills).toBe(3)
  })

  it('records both mob kills and boss kills', () => {
    RunTracker.startRun()
    RunTracker.recordMobKill('goblin')
    RunTracker.recordBossKill()
    RunTracker.recordMobKill('lich')
    RunTracker.recordBossKill()
    RunTracker.recordMobKill('ogre')
    const snapshot = RunTracker.endRun()
    expect(snapshot!.mobsKilled).toBe(3)
    expect(snapshot!.bossKills).toBe(2)
  })
})

// ─── Floor tracking ─────────────────────────────────────────────────

describe('Floor tracking', () => {
  it('recordFloor updates the floor', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(5)
    const snapshot = RunTracker.endRun()
    expect(snapshot!.floor).toBe(5)
  })

  it('recordFloor only increases floor', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(5)
    RunTracker.recordFloor(3) // should not go back
    const snapshot = RunTracker.endRun()
    expect(snapshot!.floor).toBe(5)
  })
})

// ─── Best runs ──────────────────────────────────────────────────────

describe('Best runs', () => {
  it('getBestRun returns the top run', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(3)
    RunTracker.recordMobKill('goblin')
    RunTracker.endRun()

    RunTracker.startRun()
    RunTracker.recordFloor(5)
    RunTracker.recordMobKill('goblin')
    RunTracker.recordMobKill('shade')
    RunTracker.recordMobKill('lich')
    RunTracker.endRun()
    const best = RunTracker.getBestRun()

    expect(best).not.toBeNull()
    expect(best!.floor).toBe(5)
    expect(best!.mobsKilled).toBe(3)
    expect(best!.bossKills).toBe(0)
  })

  it('best runs are sorted by floor then mobs', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(2)
    RunTracker.recordMobKill('goblin')
    RunTracker.endRun()

    RunTracker.startRun()
    RunTracker.recordFloor(5)
    RunTracker.recordMobKill('goblin')
    RunTracker.endRun()
    const best = RunTracker.getBestRun()

    expect(best!.floor).toBe(5) // higher floor wins even with fewer mobs
  })
})

// ─── Persistent boss kills ──────────────────────────────────────────

describe('Persistent boss kills', () => {
  it('getBossKills returns zero before any boss kills', () => {
    expect(RunTracker.getBossKills()).toBe(0)
  })

  it('getBossKills persists across runs', () => {
    RunTracker.startRun()
    RunTracker.recordBossKill()
    RunTracker.endRun()

    RunTracker.startRun()
    RunTracker.recordMobKill('goblin')
    RunTracker.endRun()

    RunTracker.startRun()
    RunTracker.recordBossKill()
    RunTracker.endRun()

    expect(RunTracker.getBossKills()).toBe(2)
  })

  it('getBossKills survives localStorage clear between calls', () => {
    RunTracker.startRun()
    RunTracker.recordBossKill()
    RunTracker.endRun()

    expect(RunTracker.getBossKills()).toBe(1)
    localStorage.clear()
    expect(RunTracker.getBossKills()).toBe(0) // cleared
  })
})

// ─── Snapshot shape ─────────────────────────────────────────────────

describe('Snapshot shape', () => {
  it('endRun returns correct snapshot shape', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(7)
    RunTracker.recordMobKill('goblin')
    RunTracker.recordMobKill('lich')
    RunTracker.recordBossKill()
    RunTracker.recordBossKill()

    const snapshot = RunTracker.endRun()

    expect(snapshot).toEqual({
      floor: 7,
      mobsKilled: 2,
      bossKills: 2,
    })
  })

  it('getBestRun includes bossKills field', () => {
    RunTracker.startRun()
    RunTracker.recordFloor(4)
    RunTracker.recordBossKill()
    RunTracker.endRun()

    const best = RunTracker.getBestRun()
    expect(best!.bossKills).toBe(1)
  })
})
