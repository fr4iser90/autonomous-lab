// Mob types for VoxelCraft — passive and hostile entity definitions

export interface MobDef {
  readonly id: number
  readonly name: string
  readonly type: 'passive' | 'hostile'
  readonly color: [number, number, number] // RGB for mesh
  readonly hp: number
  readonly speed: number // blocks per second
  readonly damage: number // damage to player on contact
  readonly drops: Array<{ itemId: number; minCount: number; maxCount: number }>
  readonly height: number
  readonly width: number
}

// Mob IDs: 0 = none, 1+ = mob types
export const MobCow: MobDef = {
  id: 1, name: 'Cow', type: 'passive', color: [139, 69, 19], hp: 10,
  speed: 1.5, damage: 0,
  drops: [{ itemId: 14, minCount: 1, maxCount: 3 }], // Beef
  height: 1.4, width: 0.9,
}

export const MobPig: MobDef = {
  id: 2, name: 'Pig', type: 'passive', color: [240, 128, 128], hp: 10,
  speed: 1.2, damage: 0,
  drops: [{ itemId: 14, minCount: 1, maxCount: 2 }], // Beef
  height: 0.9, width: 0.8,
}

export const MobChicken: MobDef = {
  id: 3, name: 'Chicken', type: 'passive', color: [255, 255, 255], hp: 4,
  speed: 1.8, damage: 0,
  drops: [{ itemId: 13, minCount: 1, maxCount: 1 }], // Apple (fallback loot)
  height: 0.7, width: 0.4,
}

export const MobZombie: MobDef = {
  id: 4, name: 'Zombie', type: 'hostile', color: [34, 139, 34], hp: 20,
  speed: 1.8, damage: 3,
  drops: [],
  height: 1.9, width: 0.6,
}

export const MobSkeleton: MobDef = {
  id: 5, name: 'Skeleton', type: 'hostile', color: [211, 211, 211], hp: 16,
  speed: 1.6, damage: 4,
  drops: [],
  height: 1.9, width: 0.5,
}

export const ALL_MOBS: ReadonlyArray<MobDef> = [
  MobCow, MobPig, MobChicken, MobZombie, MobSkeleton,
]

export function getMobDef(id: number): MobDef | undefined {
  // Mob IDs start at 1, array is 0-indexed
  return ALL_MOBS[id - 1]
}

export const MOB_COUNT = ALL_MOBS.length
