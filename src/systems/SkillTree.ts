/**
 * SkillTree — passive upgrades purchasable with scrap.
 * P4-2: Skill tree layer for Ashen Delve.
 */

export interface SkillDef {
  id: string
  name: string
  description: string
  icon: string
  cost: number // cost in scrap
  floorReq: number // minimum floor to purchase
}

export interface AcquiredSkill {
  def: SkillDef
  acquiredAt: number
}

export interface SkillEffects {
  damageBonus: number
  hpBonus: number
  speedBonus: number
  critChanceBonus: number
}

export const SKILL_DEFS: SkillDef[] = [
  { id: 'iron-fists', name: 'Iron Fists', description: '+2 base damage.', icon: '👊', cost: 20, floorReq: 1 },
  { id: 'steel-core', name: 'Steel Core', description: '+5 max HP.', icon: '💪', cost: 25, floorReq: 1 },
  { id: 'swift-feet', name: 'Swift Feet', description: '+0.5 move speed.', icon: '👟', cost: 15, floorReq: 1 },
  { id: 'keen-eye', name: 'Keen Eye', description: '+10% crit chance.', icon: '👁️', cost: 20, floorReq: 2 },
  { id: 'battle-hardened', name: 'Battle-Hardened', description: '+10 max HP.', icon: '🛡️', cost: 40, floorReq: 2 },
  { id: 'whirlwind', name: 'Whirlwind', description: '+4 base damage.', icon: '⚔️', cost: 45, floorReq: 3 },
  { id: 'stone-skin', name: 'Stone Skin', description: '+15 max HP.', icon: '🪨', cost: 55, floorReq: 4 },
  { id: 'berserker', name: 'Berserker', description: '+6 base damage.', icon: '🔥', cost: 60, floorReq: 4 },
]

export function getSkillDefById(id: string): SkillDef | undefined {
  return SKILL_DEFS.find(s => s.id === id)
}

export function getSkillsForFloor(floor: number): SkillDef[] {
  return SKILL_DEFS.filter(s => s.floorReq <= floor)
}

export class SkillTree {
  private acquired: Map<string, AcquiredSkill>

  constructor() {
    this.acquired = new Map()
  }

  /** Get all acquired skill IDs */
  getAcquired(): string[] {
    return [...this.acquired.keys()]
  }

  /** Check if a skill is acquired */
  has(skillId: string): boolean {
    return this.acquired.has(skillId)
  }

  /** Try to acquire a skill. Returns true if successful. */
  acquire(skillId: string): boolean {
    const def = getSkillDefById(skillId)
    if (!def) return false
    if (this.acquired.has(skillId)) return false
    return true // cost checked by caller (economy)
  }

  /** Record acquisition after economy purchase */
  recordAcquisition(skillId: string): boolean {
    const def = getSkillDefById(skillId)
    if (!def) return false
    if (this.acquired.has(skillId)) return false
    this.acquired.set(skillId, { def, acquiredAt: Date.now() })
    return true
  }

  /** Get combined passive effects from all acquired skills */
  getActiveEffects(): SkillEffects {
    let damageBonus = 0
    let hpBonus = 0
    let speedBonus = 0
    let critChanceBonus = 0

    for (const [, skill] of this.acquired) {
      switch (skill.def.id) {
        case 'iron-fists': damageBonus += 2; break
        case 'steel-core': hpBonus += 5; break
        case 'swift-feet': speedBonus += 0.5; break
        case 'keen-eye': critChanceBonus += 0.10; break
        case 'battle-hardened': hpBonus += 10; break
        case 'whirlwind': damageBonus += 4; break
        case 'stone-skin': hpBonus += 15; break
        case 'berserker': damageBonus += 6; break
      }
    }

    return { damageBonus, hpBonus, speedBonus, critChanceBonus }
  }

  /** Reset for a new delve */
  reset(): void {
    this.acquired.clear()
  }

  /** Save state for persistence */
  saveState(): string[] {
    return [...this.acquired.keys()]
  }

  /** Restore state from save */
  loadState(skillIds: string[]): void {
    this.acquired.clear()
    for (const id of skillIds) {
      const def = getSkillDefById(id)
      if (def) {
        this.acquired.set(id, { def, acquiredAt: 0 })
      }
    }
  }
}
