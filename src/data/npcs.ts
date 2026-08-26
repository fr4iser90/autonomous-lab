// NPC (mob) definitions for VoxelCraft

export interface NPCDef {
  readonly id: number
  readonly name: string
  readonly hostile: boolean
  readonly hp: number
  readonly speed: number
  readonly damage: number
  readonly dropItemId: number
  readonly dropCount: number
  readonly color: [number, number, number]
  readonly spawnBiomes: string[]
  readonly size: number // width/height scale
}

// Passive mobs
export const NPCCow: NPCDef = {
  id: 1, name: 'Cow', hostile: false, hp: 10, speed: 0.5, damage: 0,
  dropItemId: 14, dropCount: 1, color: [139, 90, 43], spawnBiomes: ['plains', 'forest'], size: 1.4
}

export const NPCPig: NPCDef = {
  id: 2, name: 'Pig', hostile: false, hp: 4, speed: 0.5, damage: 0,
  dropItemId: 14, dropCount: 1, color: [255, 182, 193], spawnBiomes: ['plains', 'forest', 'jungle'], size: 1.2
}

export const NPCSheep: NPCDef = {
  id: 3, name: 'Sheep', hostile: false, hp: 4, speed: 0.5, damage: 0,
  dropItemId: 8, dropCount: 1, color: [245, 245, 220], spawnBiomes: ['plains', 'highlands', 'snow'], size: 1.2
}

export const NPCCChicken: NPCDef = {
  id: 4, name: 'Chicken', hostile: false, hp: 2, speed: 0.6, damage: 0,
  dropItemId: 13, dropCount: 1, color: [255, 255, 255], spawnBiomes: ['plains', 'forest', 'jungle', 'desert'], size: 0.6
}

// Passive mobs
export const NPCRabbit: NPCDef = {
  id: 7, name: 'Rabbit', hostile: false, hp: 3, speed: 0.8, damage: 0,
  dropItemId: 14, dropCount: 1, color: [200, 200, 200], spawnBiomes: ['plains', 'forest', 'snow'], size: 0.5
}

// Hostile mobs
export const NPCZombie: NPCDef = {
  id: 8, name: 'Zombie', hostile: true, hp: 20, speed: 0.7, damage: 3,
  dropItemId: 10, dropCount: 1, color: [34, 120, 34], spawnBiomes: ['plains', 'forest', 'desert', 'highlands', 'snow'], size: 1.0
}

export const NPCCreeper: NPCDef = {
  id: 9, name: 'Creeper', hostile: true, hp: 20, speed: 0.6, damage: 10,
  dropItemId: 10, dropCount: 2, color: [34, 150, 34], spawnBiomes: ['plains', 'forest', 'desert', 'highlands', 'snow'], size: 1.0
}

export const ALL_NPCS: ReadonlyArray<NPCDef> = [
  NPCCow, NPCPig, NPCSheep, NPCCChicken,
  NPCRabbit,
  NPCZombie, NPCCreeper,
]

export function getNPC(id: number): NPCDef | undefined {
  return ALL_NPCS[id]
}

export const NPC_COUNT = ALL_NPCS.length
