/**
 * ChaseAI — AI controller for mob pursuit behavior.
 * M5: Simple chase logic with aggro range and attack cooldown.
 */
import type { MobKit } from '../entities/MobKit'

export interface ChaseAIConfig {
  aggroRange: number
  retreatRange: number
  attackRange: number
  attackCooldown: number
  moveSpeed: number
}

export class ChaseAI {
  readonly config: ChaseAIConfig
  private cooldownTimer = 0
  private isChasing = false

  constructor(config: ChaseAIConfig) {
    this.config = config
  }

  /** Decide action based on distance to player */
  decide(mob: MobKit, playerX: number, playerZ: number, dt: number): { action: 'idle' | 'chase' | 'attack'; targetX: number; targetZ: number } {
    const dist = mob.distanceTo(playerX, playerZ)

    this.cooldownTimer -= dt
    if (this.cooldownTimer < 0) this.cooldownTimer = 0

    // Attack if in range and cooldown ready
    if (dist <= this.config.attackRange && this.cooldownTimer <= 0) {
      this.cooldownTimer = this.config.attackCooldown
      return { action: 'attack', targetX: mob.position.x, targetZ: mob.position.z }
    }

    // Chase if in aggro range and not too close
    if (dist <= this.config.aggroRange && dist > this.config.attackRange + 0.5) {
      this.isChasing = true
      const dx = playerX - mob.position.x
      const dz = playerZ - mob.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      return {
        action: 'chase',
        targetX: mob.position.x + (dx / len) * this.config.moveSpeed * dt,
        targetZ: mob.position.z + (dz / len) * this.config.moveSpeed * dt,
      }
    }

    if (dist > this.config.retreatRange) {
      this.isChasing = false
    }

    return { action: 'idle', targetX: mob.position.x, targetZ: mob.position.z }
  }

  isAggro(): boolean {
    return this.isChasing
  }

  reset(): void {
    this.cooldownTimer = 0
    this.isChasing = false
  }
}
