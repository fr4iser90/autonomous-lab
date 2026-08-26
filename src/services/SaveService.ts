// SaveService: 3-slot localStorage persistence for VoxelCraft
// Slot keys: voxel-craft-slots-v2 (metadata), voxel-craft-world-v2-slot-{N} (world data)

const SLOTS_KEY = 'voxel-craft-slots-v2'
const WORLD_KEY_PREFIX = 'voxel-craft-world-v2-slot-'
export const VERSION = 2
const SLOT_COUNT = 3

export interface SlotMeta {
  version: number
  seed: number
  name: string
  lastPlayed: string | null
  blocksMined: number
  deepestY: number
  distanceWalked: number
  achievements: number // count of unlocked achievements
}

export interface WorldData {
  version: number
  seed: number
  overrides: Map<string, number> // "x,y,z" -> blockId
  inventory: InventorySlot[]
  stats: { blocksMined: number; deepestY: number; distanceWalked: number }
  achievements: {
    unlocked: Array<{ id: string; unlockedAt: string }>
    stats: {
      blocksMined: number
      mobsKilled: number
      dropsCollected: number
      blocksPlaced: number
      deepestY: number
      distanceWalked: number
      hasSwumInWater: boolean
      hasTouchedLava: boolean
    }
  }
}

export interface InventorySlot {
  itemId: number
  count: number
}

// Slot metadata: null = empty slot
export type SlotEntry = SlotMeta | null

export interface SlotsData {
  version: number
  settings: { masterVolume: number; musicVolume: number; sensitivity: number }
  activeSlot: number
  slots: [SlotEntry, SlotEntry, SlotEntry]
}

const DEFAULT_SLOTS: SlotsData = {
  version: VERSION,
  settings: { masterVolume: 1, musicVolume: 0.7, sensitivity: 1 },
  activeSlot: 0,
  slots: [null, null, null] as [SlotEntry, SlotEntry, SlotEntry],
}

export class SaveService {
  private slotsData: SlotsData

  constructor() {
    this.slotsData = this.loadSlots()
  }

  private loadSlots(): SlotsData {
    try {
      const raw = localStorage.getItem(SLOTS_KEY)
      if (!raw) return DEFAULT_SLOTS
      const data = JSON.parse(raw) as SlotsData
      if (data.version !== VERSION) {
        // Version mismatch: attempt migration
        const migrated = this.migrateSlots(data)
        if (migrated) return migrated
        return DEFAULT_SLOTS
      }
      if (!Array.isArray(data.slots) || data.slots.length !== SLOT_COUNT) {
        return DEFAULT_SLOTS
      }
      return data
    } catch {
      return DEFAULT_SLOTS
    }
  }

  private migrateSlots(oldData: SlotsData): SlotsData | null {
    try {
      // v1 slots data — just bump the version, keep existing slots
      const migrated: SlotsData = {
        ...oldData,
        version: VERSION,
      }
      this.saveSlots()
      return migrated
    } catch {
      return null
    }
  }

  private saveSlots(): void {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(this.slotsData))
  }

  getSlots(): readonly (SlotMeta | null)[] {
    return [...this.slotsData.slots]
  }

  getActiveSlot(): number {
    return this.slotsData.activeSlot
  }

  setActiveSlot(index: number): void {
    if (index < 0 || index >= SLOT_COUNT) throw new Error('Invalid slot')
    this.slotsData.activeSlot = index
    this.saveSlots()
  }

  getSlotMeta(slot: number): SlotMeta | null {
    return this.slotsData.slots[slot]
  }

  updateSlotMeta(slot: number, meta: SlotMeta): void {
    if (slot < 0 || slot >= SLOT_COUNT) throw new Error('Invalid slot')
    this.slotsData.slots[slot] = meta
    this.saveSlots()
  }

  deleteSlot(slot: number): void {
    if (slot < 0 || slot >= SLOT_COUNT) throw new Error('Invalid slot')
    localStorage.removeItem(WORLD_KEY_PREFIX + slot)
    this.slotsData.slots[slot] = null
    this.saveSlots()
  }

  createNewWorld(slot: number, seed: number): WorldData {
    if (slot < 0 || slot >= SLOT_COUNT) throw new Error('Invalid slot')
    const world: WorldData = {
      version: VERSION,
      seed,
      overrides: new Map(),
      inventory: Array.from({ length: 36 }, () => ({ itemId: 0, count: 0 })),
      stats: { blocksMined: 0, deepestY: 64, distanceWalked: 0 },
      achievements: {
        unlocked: [],
        stats: {
          blocksMined: 0,
          mobsKilled: 0,
          dropsCollected: 0,
          blocksPlaced: 0,
          deepestY: 64,
          distanceWalked: 0,
          hasSwumInWater: false,
          hasTouchedLava: false,
        },
      },
    }
    const meta: SlotMeta = {
      version: VERSION,
      seed,
      name: `World ${slot + 1}`,
      lastPlayed: new Date().toISOString(),
      blocksMined: 0,
      deepestY: 64,
      distanceWalked: 0,
      achievements: 0,
    }
    this.saveWorld(slot, world)
    this.updateSlotMeta(slot, meta)
    return world
  }

  saveWorld(slot: number, world: WorldData): void {
    if (slot < 0 || slot >= SLOT_COUNT) throw new Error('Invalid slot')
    // Convert Map to serializable form
    const data = {
      ...world,
      overrides: Array.from(world.overrides.entries()),
    }
    localStorage.setItem(WORLD_KEY_PREFIX + slot, JSON.stringify(data))
  }

  loadWorld(slot: number): WorldData | null {
    if (slot < 0 || slot >= SLOT_COUNT) throw new Error('Invalid slot')
    try {
      const raw = localStorage.getItem(WORLD_KEY_PREFIX + slot)
      if (!raw) return null
      const data = JSON.parse(raw) as {
        version: number
        seed: number
        overrides: [string, number][]
        inventory: InventorySlot[]
        stats: { blocksMined: number; deepestY: number; distanceWalked: number }
        achievements?: {
          unlocked?: Array<{ id: string; unlockedAt: string }>
          stats?: {
            blocksMined?: number
            mobsKilled?: number
            dropsCollected?: number
            blocksPlaced?: number
            deepestY?: number
            distanceWalked?: number
            hasSwumInWater?: boolean
            hasTouchedLava?: boolean
          }
        }
      }

      // Migration: if version is 1, upgrade to 2 and add default achievements
      if (data.version === 1) {
        data.version = VERSION
        data.achievements = {
          unlocked: [],
          stats: {
            blocksMined: 0,
            mobsKilled: 0,
            dropsCollected: 0,
            blocksPlaced: 0,
            deepestY: 64,
            distanceWalked: 0,
            hasSwumInWater: false,
            hasTouchedLava: false,
          },
        }
      }

      // Ensure achievements field exists (for v1 saves that were already upgraded in slots)
      if (!data.achievements) {
        data.achievements = {
          unlocked: [],
          stats: {
            blocksMined: 0,
            mobsKilled: 0,
            dropsCollected: 0,
            blocksPlaced: 0,
            deepestY: 64,
            distanceWalked: 0,
            hasSwumInWater: false,
            hasTouchedLava: false,
          },
        }
      }

      if (data.version !== VERSION) return null
      return {
        version: data.version,
        seed: data.seed,
        overrides: new Map(data.overrides),
        inventory: data.inventory,
        stats: data.stats,
        achievements: {
          unlocked: data.achievements?.unlocked ?? [],
          stats: {
            blocksMined: data.achievements?.stats?.blocksMined ?? 0,
            mobsKilled: data.achievements?.stats?.mobsKilled ?? 0,
            dropsCollected: data.achievements?.stats?.dropsCollected ?? 0,
            blocksPlaced: data.achievements?.stats?.blocksPlaced ?? 0,
            deepestY: data.achievements?.stats?.deepestY ?? 0,
            distanceWalked: data.achievements?.stats?.distanceWalked ?? 0,
            hasSwumInWater: data.achievements?.stats?.hasSwumInWater ?? false,
            hasTouchedLava: data.achievements?.stats?.hasTouchedLava ?? false,
          },
        },
      }
    } catch {
      return null
    }
  }

  getSettings(): { masterVolume: number; musicVolume: number; sensitivity: number } {
    return { ...this.slotsData.settings }
  }

  saveSettings(settings: { masterVolume: number; musicVolume: number; sensitivity: number }): void {
    this.slotsData.settings = settings
    this.saveSlots()
  }

  static getSlotCount(): number {
    return SLOT_COUNT
  }
}
