// Drop types for items that can appear on the ground

export interface DropType {
  readonly id: number
  readonly itemId: number // maps to items.ts
  readonly name: string
  readonly color: [number, number, number] // RGB for rendering
  readonly defaultCount: number // typical spawn count
  readonly minCount: number
  readonly maxCount: number
}

// Placeholder at index 0 so ID maps directly to array index (like items.ts)
export const DropNone: DropType = {
  id: 0,
  itemId: 0,
  name: 'None',
  color: [0, 0, 0],
  defaultCount: 0,
  minCount: 0,
  maxCount: 0,
}

export const DropBeef: DropType = {
  id: 1,
  itemId: 14, // Beef
  name: 'Beef',
  color: [150, 50, 50],
  defaultCount: 2,
  minCount: 1,
  maxCount: 3,
}

export const DropApple: DropType = {
  id: 2,
  itemId: 13, // Apple
  name: 'Apple',
  color: [200, 50, 50],
  defaultCount: 1,
  minCount: 1,
  maxCount: 1,
}

export const DropStone: DropType = {
  id: 3,
  itemId: 2, // Stone
  name: 'Stone',
  color: [128, 128, 128],
  defaultCount: 1,
  minCount: 1,
  maxCount: 1,
}

export const DropDirt: DropType = {
  id: 4,
  itemId: 1, // Dirt
  name: 'Dirt',
  color: [139, 90, 43],
  defaultCount: 1,
  minCount: 1,
  maxCount: 1,
}

export const DropCoal: DropType = {
  id: 5,
  itemId: 9, // Coal
  name: 'Coal',
  color: [50, 50, 50],
  defaultCount: 1,
  minCount: 1,
  maxCount: 1,
}

export const DropIronIngot: DropType = {
  id: 6,
  itemId: 10, // Iron Ingot
  name: 'Iron Ingot',
  color: [200, 180, 160],
  defaultCount: 1,
  minCount: 1,
  maxCount: 1,
}

export const DropStick: DropType = {
  id: 7,
  itemId: 5, // Stick
  name: 'Stick',
  color: [160, 82, 45],
  defaultCount: 2,
  minCount: 1,
  maxCount: 3,
}

export const ALL_DROPS: ReadonlyArray<DropType> = [
  DropNone,
  DropBeef,
  DropApple,
  DropStone,
  DropDirt,
  DropCoal,
  DropIronIngot,
  DropStick,
]

export const DROP_COUNT = ALL_DROPS.length

/** Get a drop type by ID (direct array access, ID = index) */
export function getDropType(id: number): DropType | undefined {
  return ALL_DROPS[id]
}
