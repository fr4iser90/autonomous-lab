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

export const NPCFox: NPCDef = {
  id: 5, name: 'Fox', hostile: false, hp: 5, speed: 1.0, damage: 0,
  dropItemId: 14, dropCount: 1, color: [205, 127, 50], spawnBiomes: ['forest', 'highlands', 'snow'], size: 0.7
}

export const NPCBee: NPCDef = {
  id: 6, name: 'Bee', hostile: false, hp: 1, speed: 1.2, damage: 1,
  dropItemId: 13, dropCount: 1, color: [255, 215, 0], spawnBiomes: ['plains', 'forest', 'jungle'], size: 0.2
}

export const NPCRabbit: NPCDef = {
  id: 7, name: 'Rabbit', hostile: false, hp: 3, speed: 0.8, damage: 0,
  dropItemId: 14, dropCount: 1, color: [200, 200, 200], spawnBiomes: ['plains', 'forest', 'snow'], size: 0.5
}

export const NPCDonkey: NPCDef = {
  id: 11, name: 'Donkey', hostile: false, hp: 15, speed: 0.7, damage: 0,
  dropItemId: 14, dropCount: 2, color: [180, 160, 140], spawnBiomes: ['plains', 'highlands', 'desert'], size: 1.5
}

export const NPCOcelot: NPCDef = {
  id: 12, name: 'Ocelot', hostile: false, hp: 4, speed: 1.3, damage: 0,
  dropItemId: 13, dropCount: 1, color: [200, 180, 120], spawnBiomes: ['jungle', 'forest'], size: 0.6
}

export const NPCPanda: NPCDef = {
  id: 13, name: 'Panda', hostile: false, hp: 6, speed: 0.4, damage: 0,
  dropItemId: 13, dropCount: 1, color: [60, 60, 60], spawnBiomes: ['forest', 'jungle'], size: 1.3
}

export const NPCParrot: NPCDef = {
  id: 14, name: 'Parrot', hostile: false, hp: 2, speed: 1.5, damage: 0,
  dropItemId: 13, dropCount: 1, color: [200, 50, 50], spawnBiomes: ['jungle', 'forest'], size: 0.2
}

export const NPCTurtle: NPCDef = {
  id: 15, name: 'Turtle', hostile: false, hp: 3, speed: 0.3, damage: 0,
  dropItemId: 14, dropCount: 1, color: [50, 150, 50], spawnBiomes: ['beach'], size: 0.4
}

export const NPCCat: NPCDef = {
  id: 16, name: 'Cat', hostile: false, hp: 5, speed: 0.9, damage: 0,
  dropItemId: 13, dropCount: 1, color: [60, 60, 60], spawnBiomes: ['plains', 'village'], size: 0.5
}

export const NPCMooshroom: NPCDef = {
  id: 17, name: 'Mooshroom', hostile: false, hp: 10, speed: 0.5, damage: 0,
  dropItemId: 15, dropCount: 1, color: [200, 50, 50], spawnBiomes: ['forest', 'highlands'], size: 1.4
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

export const NPCWolf: NPCDef = {
  id: 10, name: 'Wolf', hostile: true, hp: 8, speed: 1.1, damage: 2,
  dropItemId: 14, dropCount: 1, color: [169, 169, 169], spawnBiomes: ['forest', 'highlands', 'snow'], size: 0.9
}

export const NPCSkeleton: NPCDef = {
  id: 18, name: 'Skeleton', hostile: true, hp: 15, speed: 0.6, damage: 2,
  dropItemId: 9, dropCount: 2, color: [200, 200, 200], spawnBiomes: ['plains', 'forest', 'desert', 'highlands', 'snow'], size: 1.0
}

export const NPCSpider: NPCDef = {
  id: 19, name: 'Spider', hostile: true, hp: 8, speed: 1.0, damage: 2,
  dropItemId: 14, dropCount: 1, color: [100, 100, 100], spawnBiomes: ['plains', 'forest', 'highlands', 'snow'], size: 0.5
}

export const NPCWitch: NPCDef = {
  id: 20, name: 'Witch', hostile: true, hp: 25, speed: 0.5, damage: 5,
  dropItemId: 11, dropCount: 2, color: [50, 30, 80], spawnBiomes: ['swamp', 'village'], size: 1.0
}

export const ALL_NPCS: ReadonlyArray<NPCDef> = [
  NPCCow, NPCPig, NPCSheep, NPCCChicken,
  NPCFox, NPCBee, NPCRabbit,
  NPCZombie, NPCCreeper, NPCWolf,
  NPCDonkey, NPCOcelot, NPCPanda, NPCParrot,
  NPCTurtle, NPCCat, NPCMooshroom,
  NPCSkeleton, NPCSpider, NPCWitch,
]

export function getNPC(id: number): NPCDef | undefined {
  return ALL_NPCS.find(n => n.id === id)
}

export const NPC_COUNT = ALL_NPCS.length
