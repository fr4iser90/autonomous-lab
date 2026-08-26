// Block types for VoxelCraft
// Each block has: id, name, color (for atlas placeholder), hardness (mining speed divisor)

export interface BlockDef {
  readonly id: number
  readonly name: string
  readonly color: [number, number, number] // RGB for placeholder rendering
  readonly hardness: number // 0 = unbreakable, 1-10 = mining speed divisor
  readonly transparent: boolean
  readonly solid: boolean
  readonly flowable?: boolean // True for water and lava
  readonly flammable?: boolean // True for lava
}

// Block IDs: 0 = air, 1+ = solid blocks
export const BlockAir: BlockDef = { id: 0, name: 'Air', color: [0, 0, 0], hardness: 0, transparent: true, solid: false }

export const BlockGrass: BlockDef = { id: 1, name: 'Grass', color: [34, 139, 34], hardness: 1, transparent: false, solid: true }
export const BlockDirt: BlockDef = { id: 2, name: 'Dirt', color: [139, 90, 43], hardness: 1, transparent: false, solid: true }
export const BlockStone: BlockDef = { id: 3, name: 'Stone', color: [128, 128, 128], hardness: 3, transparent: false, solid: true }
export const BlockSand: BlockDef = { id: 4, name: 'Sand', color: [210, 180, 140], hardness: 1, transparent: false, solid: true }
export const BlockWater: BlockDef = { id: 5, name: 'Water', color: [30, 144, 255], hardness: 0, transparent: true, solid: false, flowable: true }
export const BlockLog: BlockDef = { id: 6, name: 'Log', color: [101, 67, 33], hardness: 2, transparent: false, solid: true }
export const BlockPlanks: BlockDef = { id: 7, name: 'Planks', color: [205, 133, 63], hardness: 2, transparent: false, solid: true }
export const BlockLeaves: BlockDef = { id: 8, name: 'Leaves', color: [34, 139, 34], hardness: 1, transparent: true, solid: true }
export const BlockCobblestone: BlockDef = { id: 9, name: 'Cobblestone', color: [105, 105, 105], hardness: 3, transparent: false, solid: true }
export const BlockSnow: BlockDef = { id: 10, name: 'Snow', color: [255, 255, 255], hardness: 1, transparent: false, solid: true }
export const BlockBedrock: BlockDef = { id: 11, name: 'Bedrock', color: [50, 50, 50], hardness: 0, transparent: false, solid: true }
export const BlockCoalOre: BlockDef = { id: 12, name: 'Coal Ore', color: [70, 70, 70], hardness: 4, transparent: false, solid: true }
export const BlockIronOre: BlockDef = { id: 13, name: 'Iron Ore', color: [180, 150, 130], hardness: 5, transparent: false, solid: true }
export const BlockCraftingTable: BlockDef = { id: 14, name: 'Crafting Table', color: [180, 120, 60], hardness: 2, transparent: false, solid: true }
export const BlockTorch: BlockDef = { id: 15, name: 'Torch', color: [255, 200, 50], hardness: 1, transparent: true, solid: false }
export const BlockLava: BlockDef = { id: 16, name: 'Lava', color: [255, 69, 0], hardness: 0, transparent: true, solid: false, flowable: true, flammable: true }

export const ALL_BLOCKS: ReadonlyArray<BlockDef> = [
  BlockAir, BlockGrass, BlockDirt, BlockStone, BlockSand,
  BlockWater, BlockLog, BlockPlanks, BlockLeaves, BlockCobblestone,
  BlockSnow, BlockBedrock, BlockCoalOre, BlockIronOre,
  BlockCraftingTable, BlockTorch, BlockLava,
]

export function getBlock(id: number): BlockDef | undefined {
  return ALL_BLOCKS[id]
}

export const BLOCK_COUNT = ALL_BLOCKS.length
