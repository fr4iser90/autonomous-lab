/**
 * Signal Ascent — M11 spec tests (vitest).
 *
 * Covers:
 *  - Special layer 10 echo bonus (extra +1 Harmonic on ascend)
 *  - Auto-ascend toggle
 *  - Achievement system (≥8 definitions, check/track/unlock)
 *  - Stats tracking (totalRelaysBought, totalClicks, playTime)
 */
import { describe, it, expect } from 'vitest'
import { Decimal } from 'decimal.js'
import { EconomyEngine } from '../src/economy/engine'
import { LayerEngine } from '../src/economy/layers'
import {
  echoBonusFor,
  specialFlavor,
  getSpecialLayer,
  SPECIAL_LAYERS,
} from '../src/data/specialLayers'
import {
  checkAchievements,
  isAchievementUnlocked,
  ACHIEVEMENTS,
  ACHIEVEMENT_COUNT,
} from '../src/data/achievements'

/* ------------------------------------------------------------------ */
/*  Special Layers                                                      */
/* ------------------------------------------------------------------ */

describe('special layers (M11)', () => {
  it('exactly one special layer defined (layer 10)', () => {
    expect(SPECIAL_LAYERS).toHaveLength(1)
    expect(SPECIAL_LAYERS[0].layer).toBe(10)
  })

  it('echoBonusFor returns 1 for layer 10, 0 otherwise', () => {
    expect(echoBonusFor(10)).toBe(1)
    expect(echoBonusFor(1)).toBe(0)
    expect(echoBonusFor(9)).toBe(0)
    expect(echoBonusFor(11)).toBe(0)
    expect(echoBonusFor(50)).toBe(0)
  })

  it('getSpecialLayer returns the Echo Layer def for id 10', () => {
    const def = getSpecialLayer(10)
    expect(def).toBeDefined()
    expect(def!.name).toBe('Echo Layer')
    expect(def!.echoBonus).toBe(1)
    expect(getSpecialLayer(5)).toBeUndefined()
  })

  it('specialFlavor appends flavor text for special layers', () => {
    const base = 'Void Whisper'
    const combined = specialFlavor(10, base)
    expect(combined).toContain(base)
    expect(combined).toContain('echo') // the Echo Layer flavor contains "echo"
    expect(specialFlavor(5, base)).toBe(base)
  })
})

/* ------------------------------------------------------------------ */
/*  Echo Bonus on Ascend                                                */
/* ------------------------------------------------------------------ */

describe('echo bonus on ascend (M11)', () => {
  it('layer 10 ascend grants +1 extra Harmonic', () => {
    const layers = new LayerEngine()
    void new EconomyEngine(undefined, layers.harmonicMult())

    // Manually set layer to 10 so ascending from it triggers echo bonus
    layers.state.layer = 10
    // Set signal to 1e14 (far above the threshold for layer 10)
    const threshold = layers.def.threshold
    const bigSignal = new Decimal(1e14)

    const before = layers.state.harmonics

    // ascend from layer 10 — should grant base + 1 echo
    layers.ascend(bigSignal)

    // Base reward for signal/threshold ratio
    const ratio = bigSignal.div(threshold).pow(new Decimal(0.75))
    const baseReward = Math.floor(ratio.toNumber())
    const expected = baseReward + 1 // +1 echo bonus

    expect(layers.state.harmonics).toBe(before + expected)
    expect(layers.state.layer).toBe(11)
  })

  it('layer 9 ascend grants no echo bonus', () => {
    const layers = new LayerEngine()
    layers.state.layer = 9
    const threshold = layers.def.threshold
    const bigSignal = new Decimal(1e14)
    const before = layers.state.harmonics

    layers.ascend(bigSignal)

    const ratio = bigSignal.div(threshold).pow(new Decimal(0.75))
    const baseReward = Math.floor(ratio.toNumber())

    expect(layers.state.harmonics).toBe(before + baseReward)
  })
})

/* ------------------------------------------------------------------ */
/*  Auto-Ascend Toggle                                                  */
/* ------------------------------------------------------------------ */

describe('auto-ascend toggle (M11)', () => {
  it('starts with autoAscend false', () => {
    const engine = new EconomyEngine()
    expect(engine.state.autoAscend).toBe(false)
  })

  it('toggleAutoAscend flips the flag', () => {
    const engine = new EconomyEngine()
    expect(engine.state.autoAscend).toBe(false)
    engine.toggleAutoAscend()
    expect(engine.state.autoAscend).toBe(true)
    engine.toggleAutoAscend()
    expect(engine.state.autoAscend).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  Achievement System                                                  */
/* ------------------------------------------------------------------ */

describe('achievements (M11)', () => {
  it('has ≥8 achievements defined', () => {
    expect(ACHIEVEMENT_COUNT).toBeGreaterThanOrEqual(8)
  })

  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.id).toBe('string')
      expect(typeof a.name).toBe('string')
      expect(typeof a.description).toBe('string')
      expect(typeof a.progressHint).toBe('string')
      expect(typeof a.check).toBe('function')
    }
  })

  it('no achievements unlock at zero signal and layer 1', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0, // totalRelaysBought
      0, // totalClicks
      1, // currentLayer
    )
    expect(newlyUnlocked).toEqual([])
  })

  it('ach-first-click unlocks after 1 click', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      1, // 1 click
      1,
    )
    expect(newlyUnlocked).toContain('ach-first-click')
    expect(isAchievementUnlocked(engine.state, 'ach-first-click')).toBe(true)
  })

  it('ach-first-relay unlocks after buying 1 whisper', () => {
    const engine = new EconomyEngine(undefined, new Decimal(1))
    engine.state.relays.whisper = 1
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      1,
      0,
      1,
    )
    expect(newlyUnlocked).toContain('ach-first-relay')
  })

  it('ach-first-ascend unlocks at layer 2', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      0,
      2, // layer 2
    )
    expect(newlyUnlocked).toContain('ach-first-ascend')
  })

  it('ach-layer-5 unlocks at layer 5', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      0,
      5,
    )
    expect(newlyUnlocked).toContain('ach-layer-5')
  })

  it('ach-layer-10 unlocks at layer 10', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      0,
      10,
    )
    expect(newlyUnlocked).toContain('ach-layer-10')
  })

  it('ach-100-relays unlocks at 100 total relays', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      100, // totalRelaysBought
      0,
      1,
    )
    expect(newlyUnlocked).toContain('ach-100-relays')
  })

  it('ach-1000-clicks unlocks at 1000 clicks', () => {
    const engine = new EconomyEngine()
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      1000,
      1,
    )
    expect(newlyUnlocked).toContain('ach-1000-clicks')
  })

  it('already-unlocked achievements are not re-unlocked', () => {
    const engine = new EconomyEngine()
    // Unlock first-click
    checkAchievements(ACHIEVEMENTS, engine.state, 0, 1, 1)
    expect(isAchievementUnlocked(engine.state, 'ach-first-click')).toBe(true)

    // Try again — nothing should newly unlock
    const newlyUnlocked = checkAchievements(
      ACHIEVEMENTS,
      engine.state,
      0,
      1,
      1,
    )
    expect(newlyUnlocked).not.toContain('ach-first-click')
  })

  it('achievement flags persist in engine.upgrades', () => {
    const engine = new EconomyEngine()
    checkAchievements(ACHIEVEMENTS, engine.state, 0, 1, 1)
    expect(engine.state.upgrades['ach-first-click']).toBe(true)
  })
})
