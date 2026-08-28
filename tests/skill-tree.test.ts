/**
 * SkillTree unit tests
 * P4-2: Passive skill tree system.
 */
import { describe, it, expect } from 'vitest'
import { SkillTree, SKILL_DEFS, getSkillDefById, getSkillsForFloor } from '../src/systems/SkillTree'

describe('SkillTree', () => {
  it('starts with no skills', () => {
    const tree = new SkillTree()
    expect(tree.getAcquired()).toEqual([])
    expect(tree.has('iron-fists')).toBe(false)
  })

  it('records acquisition', () => {
    const tree = new SkillTree()
    const result = tree.recordAcquisition('iron-fists')
    expect(result).toBe(true)
    expect(tree.has('iron-fists')).toBe(true)
    expect(tree.getAcquired()).toContain('iron-fists')
  })

  it('rejects duplicate acquisition', () => {
    const tree = new SkillTree()
    tree.recordAcquisition('iron-fists')
    expect(tree.recordAcquisition('iron-fists')).toBe(false)
  })

  it('rejects invalid skill', () => {
    const tree = new SkillTree()
    expect(tree.recordAcquisition('nonexistent')).toBe(false)
  })

  it('computes effects correctly', () => {
    const tree = new SkillTree()
    expect(tree.getActiveEffects()).toEqual({ damageBonus: 0, hpBonus: 0, speedBonus: 0, critChanceBonus: 0 })

    tree.recordAcquisition('iron-fists')
    expect(tree.getActiveEffects().damageBonus).toBe(2)

    tree.recordAcquisition('swift-feet')
    expect(tree.getActiveEffects().speedBonus).toBe(0.5)

    tree.recordAcquisition('keen-eye')
    expect(tree.getActiveEffects().critChanceBonus).toBeCloseTo(0.10)

    tree.recordAcquisition('steel-core')
    expect(tree.getActiveEffects().hpBonus).toBe(5)
  })

  it('combines multiple damage skills', () => {
    const tree = new SkillTree()
    tree.recordAcquisition('iron-fists')
    tree.recordAcquisition('whirlwind')
    tree.recordAcquisition('berserker')
    expect(tree.getActiveEffects().damageBonus).toBe(12)
  })

  it('combines multiple HP skills', () => {
    const tree = new SkillTree()
    tree.recordAcquisition('steel-core')
    tree.recordAcquisition('battle-hardened')
    tree.recordAcquisition('stone-skin')
    expect(tree.getActiveEffects().hpBonus).toBe(30)
  })

  it('resets state', () => {
    const tree = new SkillTree()
    tree.recordAcquisition('iron-fists')
    tree.reset()
    expect(tree.getAcquired()).toEqual([])
    expect(tree.getActiveEffects().damageBonus).toBe(0)
  })

  it('saves and restores state', () => {
    const tree = new SkillTree()
    tree.recordAcquisition('iron-fists')
    tree.recordAcquisition('swift-feet')
    const saved = tree.saveState()
    expect(saved).toContain('iron-fists')
    expect(saved).toContain('swift-feet')

    const tree2 = new SkillTree()
    tree2.loadState(saved)
    expect(tree2.has('iron-fists')).toBe(true)
    expect(tree2.has('swift-feet')).toBe(true)
  })

  it('loadState handles invalid skill gracefully', () => {
    const tree = new SkillTree()
    tree.loadState(['nonexistent', 'iron-fists'])
    expect(tree.has('iron-fists')).toBe(true)
    expect(tree.has('nonexistent')).toBe(false)
  })
})

describe('SKILL_DEFS', () => {
  it('has 8 skills', () => {
    expect(SKILL_DEFS.length).toBe(8)
  })

  it('has unique IDs', () => {
    const ids = SKILL_DEFS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has valid costs and floor requirements', () => {
    SKILL_DEFS.forEach(sk => {
      expect(sk.cost).toBeGreaterThan(0)
      expect(sk.floorReq).toBeGreaterThanOrEqual(1)
      expect(sk.floorReq).toBeLessThanOrEqual(10)
    })
  })
})

describe('getSkillDefById', () => {
  it('finds existing skill', () => {
    const def = getSkillDefById('iron-fists')
    expect(def).toBeDefined()
    expect(def?.name).toBe('Iron Fists')
  })

  it('returns undefined for missing skill', () => {
    expect(getSkillDefById('nonexistent')).toBeUndefined()
  })
})

describe('getSkillsForFloor', () => {
  it('returns 3 skills for floor 1', () => {
    const skills = getSkillsForFloor(1)
    expect(skills.length).toBe(3)
    expect(skills.every(s => s.floorReq <= 1)).toBe(true)
  })

  it('returns 5 skills for floor 2', () => {
    const skills = getSkillsForFloor(2)
    expect(skills.length).toBe(5)
  })

  it('returns 6 skills for floor 3', () => {
    const skills = getSkillsForFloor(3)
    expect(skills.length).toBe(6)
  })

  it('returns all 8 for floor 4+', () => {
    expect(getSkillsForFloor(4).length).toBe(8)
    expect(getSkillsForFloor(10).length).toBe(8)
  })
})
