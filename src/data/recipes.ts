// Crafting recipes for VoxelCraft
// Supports 2x2 (inventory) and 3x3 (crafting table) grids

export interface Recipe {
  readonly id: number
  readonly resultItemId: number
  readonly resultCount: number
  readonly width: number
  readonly height: number
  // Pattern: each row is an array of item ids (0 = empty), length = width
  readonly pattern: number[][]
}

export const RECIPE_PLANKS: Recipe = {
  id: 1, resultItemId: 4, resultCount: 4, width: 1, height: 1,
  pattern: [[3]] // 1 log -> 4 planks
}

export const RECIPE_STICKS: Recipe = {
  id: 2, resultItemId: 5, resultCount: 4, width: 2, height: 2,
  pattern: [[3, 0], [3, 0]] // 2 planks (vertical) -> 4 sticks
}

export const RECIPE_CRAFTING_TABLE: Recipe = {
  id: 3, resultItemId: 12, resultCount: 1, width: 2, height: 2,
  pattern: [[4, 4], [4, 4]] // 4 planks -> crafting table
}

export const RECIPE_TORCHES: Recipe = {
  id: 4, resultItemId: 11, resultCount: 4, width: 2, height: 2,
  pattern: [[5, 0], [10, 0]] // stick + coal -> 4 torches
}

export const RECIPE_WOODEN_PICKAXE: Recipe = {
  id: 5, resultItemId: 6, resultCount: 1, width: 3, height: 2,
  pattern: [[4, 4, 4], [0, 5, 0], [0, 5, 0]] // 3 planks top + 2 sticks
}

export const RECIPE_STONE_PICKAXE: Recipe = {
  id: 6, resultItemId: 7, resultCount: 1, width: 3, height: 2,
  pattern: [[2, 2, 2], [0, 5, 0], [0, 5, 0]] // 3 stone top + 2 sticks
}

export const RECIPE_IRON_PICKAXE: Recipe = {
  id: 7, resultItemId: 8, resultCount: 1, width: 3, height: 2,
  pattern: [[10, 10, 10], [0, 5, 0], [0, 5, 0]] // 3 iron ingots + 2 sticks
}

export const RECIPE_WOODEN_AXE: Recipe = {
  id: 8, resultItemId: 20, resultCount: 1, width: 3, height: 3,
  pattern: [[4, 4, 0], [4, 5, 0], [0, 5, 0]]
}

export const RECIPE_WOODEN_SWORD: Recipe = {
  id: 9, resultItemId: 21, resultCount: 1, width: 2, height: 3,
  pattern: [[4, 0], [4, 0], [5, 0]]
}

export const RECIPE_COOKED_BEEF: Recipe = {
  id: 10, resultItemId: 15, resultCount: 1, width: 1, height: 1,
  pattern: [[14]] // raw beef -> cooked beef (smelting placeholder)
}

export const ALL_RECIPES: ReadonlyArray<Recipe> = [
  RECIPE_PLANKS, RECIPE_STICKS, RECIPE_CRAFTING_TABLE, RECIPE_TORCHES,
  RECIPE_WOODEN_PICKAXE, RECIPE_STONE_PICKAXE, RECIPE_IRON_PICKAXE,
  RECIPE_WOODEN_AXE, RECIPE_WOODEN_SWORD, RECIPE_COOKED_BEEF,
]

export function getRecipe(id: number): Recipe | undefined {
  return ALL_RECIPES[id]
}

export function findRecipe(pattern: number[][], pw: number, ph: number): Recipe | undefined {
  for (const recipe of ALL_RECIPES) {
    if (recipe.width !== pw || recipe.height !== ph) continue
    let match = true
    for (let y = 0; y < ph && match; y++) {
      for (let x = 0; x < pw && match; x++) {
        if (recipe.pattern[y]?.[x] !== pattern[y]?.[x]) match = false
      }
    }
    if (match) return recipe
  }
  return undefined
}

export const RECIPE_COUNT = ALL_RECIPES.length
