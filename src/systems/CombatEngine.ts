/**
 * CombatEngine — melee combat, damage, death.
 * M6: Attack resolution, health management, death.
 */
export interface CombatHit {
  damage: number
  attackerName: string
  targetName: string
  isCritical: boolean
  scrapReward?: number // scrap dropped when target dies
}

export interface Entity {
  name: string
  hp: number
  maxHp: number
  damage: number
  isDead: boolean
  x: number
  z: number
  scrapReward?: number // scrap dropped on death
}

export interface CombatLog {
  message: string
  timestamp: number
}

export class CombatEngine {
  private logs: CombatLog[] = []
  private readonly maxLogs = 20

  /** Melee attack — attacker hits target */
  meleeAttack(attacker: Entity, target: Entity): CombatHit | null {
    if (attacker.isDead || target.isDead) return null

    const baseDamage = attacker.damage
    const variation = Math.floor(Math.random() * 3) - 1 // -1 to +1
    const isCritical = Math.random() < 0.15 // 15% crit chance
    const damage = isCritical ? baseDamage * 2 + variation : baseDamage + variation

    target.hp = Math.max(0, target.hp - damage)
    if (target.hp <= 0) {
      target.isDead = true
    }

    const hit: CombatHit = {
      damage,
      attackerName: attacker.name,
      targetName: target.name,
      isCritical,
      scrapReward: target.isDead ? target.scrapReward ?? 0 : undefined,
    }

    this.addLog(`${isCritical ? '💥 CRIT! ' : ''}${attacker.name} hits ${target.name} for ${damage} damage${target.isDead ? ` — KILLED! (+${target.scrapReward ?? 0} scrap)` : ''}`)

    return hit
  }

  /** Player takes damage */
  takeDamage(entity: Entity, damage: number): boolean {
    if (entity.isDead) return false

    entity.hp = Math.max(0, entity.hp - damage)
    if (entity.hp <= 0) {
      entity.isDead = true
      this.addLog(`💀 ${entity.name} has perished!`)
      return true
    }
    this.addLog(`${entity.name} takes ${damage} damage (${entity.hp}/${entity.maxHp} HP)`)
    return false
  }

  /** Heal an entity */
  heal(entity: Entity, amount: number): number {
    if (entity.isDead) return 0
    const healed = Math.min(amount, entity.maxHp - entity.hp)
    entity.hp += healed
    this.addLog(`${entity.name} heals for ${healed} HP (${entity.hp}/${entity.maxHp})`)
    return healed
  }

  private addLog(message: string): void {
    this.logs.push({ message, timestamp: Date.now() })
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  /** Get combat log entries */
  getLogs(): CombatLog[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  /** Check if player died */
  isDead(entity: Entity): boolean {
    return entity.isDead
  }
}
