import { describe, it, expect, beforeEach } from 'vitest'
import { Economy } from '../src/systems/Economy'
import { SHOP_ITEMS, getShopItemsForFloor, getShopItemById } from '../src/data/shopItems'

describe('Economy', () => {
  let economy: Economy

  beforeEach(() => {
    economy = new Economy()
  })

  it('starts with zero scrap', () => {
    expect(economy.scrap).toBe(0)
    expect(economy.totalScrapCollected).toBe(0)
    expect(economy.highScoreScrap).toBe(0)
  })

  it('credits scrap on mob kill', () => {
    economy.onMobKill(10)
    expect(economy.scrap).toBe(10)
    expect(economy.totalScrapCollected).toBe(10)
    expect(economy.highScoreScrap).toBe(10)
  })

  it('accumulates scrap across multiple kills', () => {
    economy.onMobKill(10)
    economy.onMobKill(5)
    economy.onMobKill(3)
    expect(economy.scrap).toBe(18)
    expect(economy.totalScrapCollected).toBe(18)
  })

  it('tracks high score scrap', () => {
    economy.onMobKill(100)
    expect(economy.highScoreScrap).toBe(100)
    // Purchase reduces scrap but not high score
    economy.purchase(SHOP_ITEMS[0]!)
    expect(economy.scrap).toBe(85)
    expect(economy.highScoreScrap).toBe(100)
  })

  it('purchases item when enough scrap', () => {
    economy.onMobKill(20)
    const potion = SHOP_ITEMS[0]!
    expect(economy.purchase(potion, 1)).toBe(true)
    expect(economy.scrap).toBe(5)
  })

  it('rejects purchase when insufficient scrap', () => {
    economy.onMobKill(5)
    const potion = SHOP_ITEMS[0]!
    expect(economy.purchase(potion, 1)).toBe(false)
    expect(economy.scrap).toBe(5)
  })

  it('handles multi-item purchase', () => {
    economy.onMobKill(50)
    const potion = SHOP_ITEMS[0]!
    expect(economy.purchase(potion, 3)).toBe(true)
    expect(economy.scrap).toBe(5)
  })

  it('rejects multi-item purchase when insufficient', () => {
    economy.onMobKill(30)
    const potion = SHOP_ITEMS[0]!
    expect(economy.purchase(potion, 3)).toBe(false)
    expect(economy.scrap).toBe(30)
  })

  it('getCost returns correct total', () => {
    const potion = SHOP_ITEMS[0]!
    expect(economy.getCost(potion, 1)).toBe(15)
    expect(economy.getCost(potion, 3)).toBe(45)
  })

  it('resets scrap on new delve', () => {
    economy.onMobKill(100)
    expect(economy.scrap).toBe(100)
    economy.reset()
    expect(economy.scrap).toBe(0)
    // totalScrapCollected and highScoreScrap persist
    expect(economy.totalScrapCollected).toBe(100)
    expect(economy.highScoreScrap).toBe(100)
  })

  it('saveState returns current state', () => {
    economy.onMobKill(50)
    economy.purchase(SHOP_ITEMS[0]!)
    const state = economy.saveState()
    expect(state.scrap).toBe(35)
    expect(state.totalScrapCollected).toBe(50)
    expect(state.highScoreScrap).toBe(50)
  })

  it('loadState restores state', () => {
    economy.onMobKill(50)
    const state = economy.saveState()
    expect(state.scrap).toBe(50)
    economy.reset()
    expect(economy.scrap).toBe(0)
    economy.loadState(state)
    expect(economy.scrap).toBe(50)
    expect(economy.totalScrapCollected).toBe(50)
    expect(economy.highScoreScrap).toBe(50)
  })

  it('onScrapFound delegates to onMobKill', () => {
    economy.onScrapFound(25)
    expect(economy.scrap).toBe(25)
    expect(economy.totalScrapCollected).toBe(25)
  })
})

describe('Shop Items', () => {
  it('has 8 shop items', () => {
    expect(SHOP_ITEMS).toHaveLength(8)
  })

  it('getShopItemsForFloor returns potions only on floor 1', () => {
    const items = getShopItemsForFloor(1)
    expect(items).toHaveLength(3)
    expect(items[0].id).toBe('health-potion-shop')
    expect(items[2].id).toBe('mega-potion-shop')
  })

  it('getShopItemsForFloor returns potions + shield on floors 2-3', () => {
    const itemsF2 = getShopItemsForFloor(2)
    const itemsF3 = getShopItemsForFloor(3)
    expect(itemsF2).toHaveLength(5)
    expect(itemsF3).toHaveLength(5)
    expect(itemsF2[3].id).toBe('iron-shield-shop')
  })

  it('getShopItemsForFloor returns all items on floor 4+', () => {
    const itemsF4 = getShopItemsForFloor(4)
    const itemsF10 = getShopItemsForFloor(10)
    expect(itemsF4).toHaveLength(8)
    expect(itemsF10).toHaveLength(8)
  })

  it('getShopItemById finds item', () => {
    const item = getShopItemById('health-potion-shop')
    expect(item?.name).toBe('Health Potion')
    expect(item?.cost).toBe(15)
  })

  it('getShopItemById returns undefined for unknown id', () => {
    expect(getShopItemById('nonexistent')).toBeUndefined()
  })
})
