// BlockInteraction: Break and place blocks with mining progress

import { World } from '../world/World'
import { getBlock } from '../data/blocks'
import { getItem } from '../data/items'

export interface MinedBlock {
  position: [number, number, number]
  progress: number   // current mining progress (0..maxProgress)
  maxProgress: number // total progress needed to break
}

export interface BlockInteractionState {
  minedBlock: MinedBlock | null
  /** Whether the left mouse button is currently held (mining in progress) */
  isMining: boolean
}

// Mining speed: blocks broken per second (base speed before hardness multiplier)
const BASE_MINING_SPEED = 3 // blocks per second for hardness=1 block

export class BlockInteraction {
  public state: BlockInteractionState = {
    minedBlock: null,
    isMining: false,
  }

  constructor(
    private world: World,
    private selectedSlot: number = 0, // hotbar slot 0-8
    private inventory: Array<{ itemId: number; count: number }> = new Array(36).fill(null).map(() => ({ itemId: 0, count: 0 })),
  ) {}

  /**
   * Called continuously while the left mouse button is held.
   * Accumulates mining progress toward the targeted block.
   * @param dt Delta time in seconds
   * @returns true if the block was broken
   */
  updateMining(dt: number): boolean {
    if (!this.state.isMining || !this.state.minedBlock) return false

    const mine = this.state.minedBlock
    const blockDef = getBlock(this.world.getBlock(...mine.position))
    const hardness = blockDef ? blockDef.hardness : 1

    // Speed is inversely proportional to hardness
    const speed = BASE_MINING_SPEED / Math.max(hardness, 1)
    mine.progress += dt * speed

    if (mine.progress >= mine.maxProgress) {
      // Break the block
      this.breakBlock(mine.position)
      this.state.minedBlock = null
      return true
    }

    return false
  }

  /**
   * Start mining a block at the given world position.
   */
  startMining(position: [number, number, number]): void {
    const blockId = this.world.getBlock(...position)
    if (blockId <= 0) return

    const blockDef = getBlock(blockId)
    if (!blockDef) return

    // Bedrock is unbreakable (hardness 0)
    if (blockDef.hardness === 0) return

    const maxProgress = Math.max(1, blockDef.hardness * 3)

    this.state.minedBlock = {
      position,
      progress: 0,
      maxProgress,
    }
    this.state.isMining = true
  }

  /**
   * Cancel current mining (release mouse before block is broken).
   */
  cancelMining(): void {
    this.state.minedBlock = null
    this.state.isMining = false
  }

  /**
   * Break the block at the given world position.
   */
  breakBlock(position: [number, number, number]): void {
    this.world.setBlock(position[0], position[1], position[2], 0)
  }

  /**
   * Place a block adjacent to the given face.
   * @param hitPos World position of the hit block
   * @param normal Surface normal of the hit face (where to place)
   * @returns true if the block was placed
   */
  placeBlock(hitPos: [number, number, number], normal: [number, number, number]): boolean {
    // Get the placement position
    const placeX = hitPos[0] + normal[0]
    const placeY = hitPos[1] + normal[1]
    const placeZ = hitPos[2] + normal[2]

    // Check that there's no block already there
    const existing = this.world.getBlock(placeX, placeY, placeZ)
    if (existing !== 0) return false

    // Check inventory for a placeable block
    const item = this.inventory[this.selectedSlot]
    if (!item || item.itemId <= 0 || item.count <= 0) return false

    // Map item IDs to block IDs for placement
    // Item 1 = Dirt → Block 2, Item 2 = Stone → Block 3, etc.
    const blockId = this.itemToBlock(item.itemId)
    if (blockId <= 0) return false

    // Place the block
    this.world.setBlock(placeX, placeY, placeZ, blockId)

    // Decrease inventory count
    item.count--
    if (item.count <= 0) {
      item.itemId = 0
      item.count = 0
    }

    return true
  }

  /** Map item ID to corresponding block ID for placement */
  private itemToBlock(itemId: number): number {
    const item = getItem(itemId)
    if (!item) return 0

    // Simple mapping: dirt→1(air no), stone→3, etc.
    switch (itemId) {
      case 1: return 2   // Dirt → BlockDirt
      case 2: return 3   // Stone → BlockStone
      case 3: return 6   // Wood → BlockLog
      case 4: return 7   // Planks → BlockPlanks
      case 8: return 9   // Cobblestone item → BlockCobblestone (if it existed)
      case 11: return 15 // Torch → BlockTorch
      default:
        // For most items, assume item ID - 1 maps to block ID
        // (e.g., ItemDirt(1) → BlockGrass(1), but we need explicit mapping)
        // This is a simple fallback; proper item→block mapping belongs in M4
        return itemId > 0 ? itemId : 0
    }
  }
}
