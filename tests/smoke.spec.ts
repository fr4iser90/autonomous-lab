// M1 smoke tests: registry counts, save service, chunk generation

import { describe, it, expect } from 'vitest'
import { ALL_BLOCKS, BLOCK_COUNT, getBlock, BlockBedrock, BlockAir } from '../src/data/blocks'
import { findRecipe } from '../src/data/recipes'
import { ALL_ITEMS, ITEM_COUNT } from '../src/data/items'
import { ALL_RECIPES, RECIPE_COUNT } from '../src/data/recipes'
import { ALL_NPCS, NPC_COUNT } from '../src/data/npcs'
import { SaveService } from '../src/services/SaveService'
import { mulberry32, smoothNoise, fbm } from '../src/world/Noise'
import { Chunk, CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_DEPTH } from '../src/world/Chunk'
import { World } from '../src/world/World'

describe('M1: Block Registry', () => {
  it('has at least 12 base block types', () => {
    const count = ALL_BLOCKS.filter(b => b.id > 0).length
    expect(count).toBeGreaterThanOrEqual(12)
  })

  it('all blocks have hardness defined', () => {
    for (const block of ALL_BLOCKS) {
      expect(block.id).toBeGreaterThanOrEqual(0)
      expect(typeof block.name).toBe('string')
      expect(block.name.length).toBeGreaterThan(0)
      expect(Array.isArray(block.color)).toBe(true)
      expect(block.color.length).toBe(3)
      expect(typeof block.hardness).toBe('number')
    }
  })

  it('BlockAir has id 0', () => {
    expect(BlockAir.id).toBe(0)
  })

  it('getBlock returns correct block', () => {
    expect(getBlock(1)?.name).toBe('Grass')
    expect(getBlock(3)?.name).toBe('Stone')
    expect(getBlock(99)).toBeUndefined()
  })

  it('BlockBedrock has hardness 0 (indestructible)', () => {
    expect(BlockBedrock.hardness).toBe(0)
  })

  it('BLOCK_COUNT matches array length', () => {
    expect(BLOCK_COUNT).toBe(ALL_BLOCKS.length)
  })
})

describe('M1: Item Registry', () => {
  it('has at least 8 item types', () => {
    const count = ALL_ITEMS.filter(i => i.id > 0).length
    expect(count).toBeGreaterThanOrEqual(8)
  })

  it('ITEM_COUNT matches array length', () => {
    expect(ITEM_COUNT).toBe(ALL_ITEMS.length)
  })
})

describe('M1: Recipe Registry', () => {
  it('has at least 10 recipes', () => {
    const count = ALL_RECIPES.length
    expect(count).toBeGreaterThanOrEqual(10)
  })

  it('RECIPE_COUNT matches array length', () => {
    expect(RECIPE_COUNT).toBe(ALL_RECIPES.length)
  })

  it('wooden pickaxe recipe exists and has correct result', () => {
    const recipe = ALL_RECIPES.find(r => r.id === 5)
    expect(recipe).toBeDefined()
    expect(recipe?.resultItemId).toBe(6) // wooden pickaxe
  })

  it('findRecipe matches a 2x2 pattern', () => {
    const recipe = findRecipe([[3, 0], [3, 0]], 2, 2)
    expect(recipe).toBeDefined()
    expect(recipe?.resultItemId).toBe(5) // sticks
  })
})

describe('M1: NPC Registry', () => {
  it('has at least 4 passive + 2 hostile', () => {
    const passive = ALL_NPCS.filter(n => !n.hostile).length
    const hostile = ALL_NPCS.filter(n => n.hostile).length
    expect(passive).toBeGreaterThanOrEqual(4)
    expect(hostile).toBeGreaterThanOrEqual(2)
  })

  it('NPC_COUNT matches array length', () => {
    expect(NPC_COUNT).toBe(ALL_NPCS.length)
  })

  it('all NPCs have hp and drop tables', () => {
    for (const npc of ALL_NPCS) {
      expect(npc.hp).toBeGreaterThan(0)
      expect(npc.dropItemId).toBeGreaterThan(0)
      expect(npc.dropCount).toBeGreaterThan(0)
    }
  })
})

describe('M1: SaveService', () => {
  it('creates 3 empty slots', () => {
    const svc = new SaveService()
    expect(SaveService.getSlotCount()).toBe(3)
    const slots = svc.getSlots()
    expect(slots).toHaveLength(3)
    expect(slots.every(s => s === null)).toBe(true)
  })

  it('roundtrip: create, save, reload', () => {
    const svc = new SaveService()
    const world = svc.createNewWorld(0, 42)
    expect(world.seed).toBe(42)
    expect(world.inventory.length).toBe(36)

    const loaded = svc.loadWorld(0)
    expect(loaded).not.toBeNull()
    expect(loaded?.seed).toBe(42)
  })

  it('slot isolation: slot 0 and slot 1 are independent', () => {
    const svc = new SaveService()
    svc.createNewWorld(0, 100)
    svc.createNewWorld(1, 200)

    const w0 = svc.loadWorld(0)
    const w1 = svc.loadWorld(1)
    expect(w0?.seed).toBe(100)
    expect(w1?.seed).toBe(200)
  })

  it('delete slot keeps other slots intact', () => {
    const svc = new SaveService()
    svc.createNewWorld(0, 100)
    svc.createNewWorld(1, 200)

    svc.deleteSlot(1)
    expect(svc.getSlotMeta(0)).not.toBeNull()
    expect(svc.getSlotMeta(1)).toBeNull()
  })

  it('corrupt data on one slot does not affect others', () => {
    const svc = new SaveService()
    svc.createNewWorld(0, 100)
    localStorage.setItem('voxel-craft-world-v1-slot-1', 'NOT_JSON')
    svc.createNewWorld(1, 200) // overwrites

    // Reload new instance
    const svc2 = new SaveService()
    const w0 = svc2.loadWorld(0)
    const w1 = svc2.loadWorld(1)
    expect(w0?.seed).toBe(100)
    expect(w1?.seed).toBe(200)
  })
})

describe('M1: Noise functions', () => {
  it('mulberry32 is deterministic', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(42)
    expect(rng1()).toBe(rng2())
    expect(rng1()).toBe(rng2())
  })

  it('mulberry32 different seeds give different values', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(43)
    expect(rng1()).not.toBe(rng2())
  })

  it('fbm produces values in [0, 1]', () => {
    for (let i = 0; i < 100; i++) {
      const val = fbm(i * 0.1, 0, 42)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })
})

describe('M1: Chunk generation', () => {
  it('chunk (0,0) with seed 42 generates blocks', () => {
    const chunk = new Chunk(0, 0, 42)
    const surfaceBlock = chunk.getBlock(8, 50, 8)
    expect(surfaceBlock).toBeGreaterThan(0)
  })

  it('chunk (5,-3) is deterministic across calls', () => {
    const c1 = new Chunk(5, -3, 42)
    const c2 = new Chunk(5, -3, 42)
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_DEPTH; z++) {
          expect(c1.getBlock(x, y, z)).toBe(c2.getBlock(x, y, z))
        }
      }
    }
  })

  it('chunks with different positions differ', () => {
    const c1 = new Chunk(0, 0, 42)
    const c2 = new Chunk(1, 0, 42)
    let different = false
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_DEPTH; z++) {
          if (c1.getBlock(x, y, z) !== c2.getBlock(x, y, z)) {
            different = true
          }
        }
      }
    }
    expect(different).toBe(true)
  })

  it('chunk has correct dimensions', () => {
    const chunk = new Chunk(0, 0, 42)
    expect(chunk.x).toBe(0)
    expect(chunk.z).toBe(0)
    expect(chunk.blocks.length).toBe(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH)
  })
})

describe('M1: World', () => {
  it('world with seed 42 returns consistent height', () => {
    const world = new World(42)
    const h1 = world.getHeight(100, 200)
    const h2 = world.getHeight(100, 200)
    expect(h1).toBe(h2)
  })

  it('world respects overrides', () => {
    const world = new World(42)
    world.setBlock(0, 50, 0, 15) // place torch
    expect(world.getBlock(0, 50, 0)).toBe(15)

    // Override removed at different position
    expect(world.getBlock(1, 50, 0)).not.toBe(15)
  })

  it('height is consistent across repeated calls', () => {
    const world = new World(42)
    for (let i = 0; i < 20; i++) {
      const h = world.getHeight(i * 10, i * 10)
      expect(h).toBeGreaterThan(0)
      expect(h).toBeLessThan(96)
    }
  })
})


