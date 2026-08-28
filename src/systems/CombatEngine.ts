/**
 * CombatEngine — melee combat, damage, death, status effects.
 * M6: Attack resolution, health management, death.
 * P7-1: Status effects (poison, burn, freeze, shield).
 */
import type { StatusEffect } from '../data/statusEffects'

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
  statusEffects: StatusEffect[] // active status effects
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

  /** Apply a status effect to an entity */
  applyStatusEffect(entity: Entity, effect: StatusEffect): void {
    // Remove existing effect of same type (refresh duration)
    const idx = entity.statusEffects.findIndex(e => e.type === effect.type)
    if (idx >= 0) {
      entity.statusEffects[idx] = effect
    } else {
      entity.statusEffects.push(effect)
    }
    this.addLog(`${effect.emoji} ${effect.label} applied to ${entity.name} (${effect.ticksLeft}s)`)
  }

  /** Remove a specific status effect by type */
  removeStatusEffect(entity: Entity, type: string): void {
    entity.statusEffects = entity.statusEffects.filter(e => e.type !== type)
  }

  /** Tick all status effects — returns damage dealt (DOT) or 0 */
  tickStatusEffects(entity: Entity, dt: number): number {
    if (entity.statusEffects.length === 0) return 0
    let totalDotDamage = 0

    for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
      const eff = entity.statusEffects[i]
      eff.ticksLeft -= dt

      // Apply DOT at intervals
      if (eff.damagePerTick > 0 && entity.hp > 0) {
        // We track remaining ticks; apply damage at intervals
        const dotApplied = Math.floor(eff.ticksLeft / eff.tickInterval)
        if (dotApplied > 0 && eff._lastTickCount !== dotApplied) {
          eff._lastTickCount = dotApplied
          totalDotDamage += eff.damagePerTick
          this.addLog(`${eff.emoji} ${entity.name} takes ${eff.damagePerTick} ${eff.label} damage`)
        }
      }

      // Remove expired effects
      if (eff.ticksLeft <= 0) {
        entity.statusEffects.splice(i, 1)
        this.addLog(`${entity.name} is no longer affected by ${eff.label}`)
      }
    }

    return totalDotDamage
  }

  /** Get the active freeze slow factor */
  getSlowFactor(entity: Entity): number {
    const freeze = entity.statusEffects.find(e => e.type === 'freeze')
    return freeze ? freeze.slowFactor : 1
  }

  /** Get flat damage reduction from shield */
  getDamageReduction(entity: Entity): number {
    const shield = entity.statusEffects.find(e => e.type === 'shield')
    return shield ? shield.damageReduction : 0
  }
}

// Extend StatusEffect for internal tick tracking
declare module '../data/statusEffects' {
  interface StatusEffect { _lastTickCount?: number }
}
