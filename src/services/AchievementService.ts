// AchievementService: Tracks player achievements and progress milestones

export interface AchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string // emoji icon
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string // ISO timestamp
}

export interface AchievementStats {
  blocksMined: number
  mobsKilled: number
  dropsCollected: number
  blocksPlaced: number
  deepestY: number
  distanceWalked: number
  hasSwumInWater: boolean
  hasTouchedLava: boolean
}

const ACHIEVEMENTS: ReadonlyArray<AchievementDef> = [
  { id: 'first_steps', name: 'First Steps', description: 'Mine your first block', icon: '⛏️' },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Reach y=10 or below', icon: '🕳️' },
  { id: 'explorer', name: 'Explorer', description: 'Walk 500 blocks', icon: '🗺️' },
  { id: 'builder', name: 'Builder', description: 'Place your first block', icon: '🧱' },
  { id: 'survivor', name: 'Survivor', description: 'Kill your first mob', icon: '⚔️' },
  { id: 'collector', name: 'Collector', description: 'Pick up your first drop', icon: '📦' },
  { id: 'water_world', name: 'Water World', description: 'Swim in water', icon: '🌊' },
  { id: 'fire_starter', name: 'Fire Starter', description: 'Touch lava', icon: '🔥' },
  { id: 'master_miner', name: 'Master Miner', description: 'Mine 100 blocks', icon: '💎' },
  { id: 'deep_explorer', name: 'Deep Explorer', description: 'Reach y=5 or below', icon: '🏔️' },
]

export class AchievementService {
  private unlocked: UnlockedAchievement[] = []
  private stats: AchievementStats = {
    blocksMined: 0,
    mobsKilled: 0,
    dropsCollected: 0,
    blocksPlaced: 0,
    deepestY: 64,
    distanceWalked: 0,
    hasSwumInWater: false,
    hasTouchedLava: false,
  }
  private onUnlockCallbacks: Array<(achievement: UnlockedAchievement) => void> = []

  constructor() {
    // Start with no achievements unlocked
  }

  getDefinitions(): ReadonlyArray<AchievementDef> {
    return ACHIEVEMENTS
  }

  getUnlocked(): ReadonlyArray<UnlockedAchievement> {
    return [...this.unlocked]
  }

  getProgress(): ReadonlyArray<{ def: AchievementDef; unlocked: boolean }> {
    return ACHIEVEMENTS.map((def) => ({
      def,
      unlocked: this.unlocked.some((u) => u.id === def.id),
    }))
  }

  getStats(): AchievementStats {
    return { ...this.stats }
  }

  onAchievementUnlock(callback: (achievement: UnlockedAchievement) => void): void {
    this.onUnlockCallbacks.push(callback)
  }

  private notifyUnlock(achievement: UnlockedAchievement): void {
    for (const cb of this.onUnlockCallbacks) {
      cb(achievement)
    }
  }

  /** Update stats and check for new unlocks */
  updateStats(updates: Partial<AchievementStats>): void {
    if (updates.blocksMined !== undefined) this.stats.blocksMined = updates.blocksMined
    if (updates.mobsKilled !== undefined) this.stats.mobsKilled = updates.mobsKilled
    if (updates.dropsCollected !== undefined) this.stats.dropsCollected = updates.dropsCollected
    if (updates.blocksPlaced !== undefined) this.stats.blocksPlaced = updates.blocksPlaced
    if (updates.deepestY !== undefined) this.stats.deepestY = Math.min(this.stats.deepestY, updates.deepestY)
    if (updates.distanceWalked !== undefined) this.stats.distanceWalked = updates.distanceWalked
    if (updates.hasSwumInWater !== undefined) this.stats.hasSwumInWater = this.stats.hasSwumInWater || updates.hasSwumInWater
    if (updates.hasTouchedLava !== undefined) this.stats.hasTouchedLava = this.stats.hasTouchedLava || updates.hasTouchedLava

    this.checkUnlocks()
  }

  private checkUnlocks(): void {
    const checks: Record<string, () => boolean> = {
      first_steps: () => this.stats.blocksMined >= 1,
      deep_diver: () => this.stats.deepestY <= 10,
      explorer: () => this.stats.distanceWalked >= 500,
      builder: () => this.stats.blocksPlaced >= 1,
      survivor: () => this.stats.mobsKilled >= 1,
      collector: () => this.stats.dropsCollected >= 1,
      water_world: () => this.stats.hasSwumInWater,
      fire_starter: () => this.stats.hasTouchedLava,
      master_miner: () => this.stats.blocksMined >= 100,
      deep_explorer: () => this.stats.deepestY <= 5,
    }

    for (const [id, check] of Object.entries(checks)) {
      if (!this.unlocked.some((u) => u.id === id) && check()) {
        const unlock: UnlockedAchievement = {
          id,
          unlockedAt: new Date().toISOString(),
        }
        this.unlocked.push(unlock)
        this.notifyUnlock(unlock)
      }
    }
  }

  /** Serialize for saving */
  serialize(): { unlocked: UnlockedAchievement[]; stats: AchievementStats } {
    return {
      unlocked: [...this.unlocked],
      stats: { ...this.stats },
    }
  }

  /** Load from save data */
  deserialize(data: { unlocked: UnlockedAchievement[]; stats: AchievementStats }): void {
    this.unlocked = [...data.unlocked]
    this.stats = { ...data.stats }
  }

  /** Reset all progress */
  reset(): void {
    this.unlocked = []
    this.stats = {
      blocksMined: 0,
      mobsKilled: 0,
      dropsCollected: 0,
      blocksPlaced: 0,
      deepestY: 64,
      distanceWalked: 0,
      hasSwumInWater: false,
      hasTouchedLava: false,
    }
  }

  /** Count of unlocked achievements */
  getUnlockedCount(): number {
    return this.unlocked.length
  }

  /** Check if a specific achievement is unlocked */
  isUnlocked(id: string): boolean {
    return this.unlocked.some(a => a.id === id)
  }

  /** Total achievement count */
  getTotalCount(): number {
    return ACHIEVEMENTS.length
  }
}
