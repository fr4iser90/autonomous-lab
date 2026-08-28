/**
 * Economy system — scrap currency, mob drops, shop purchases.
 * P4-1: Economy layer for Ashen Delve.
 */
import type { ShopItemDef } from '../data/shopItems'

export interface ShopPurchase {
  item: ShopItemDef
  quantity: number
  cost: number
  purchasedAt: number
}

export class Economy {
  private _scrap: number
  private _totalScrapCollected: number
  private _highScoreScrap: number

  constructor(initialScrap: number = 0) {
    this._scrap = initialScrap
    this._totalScrapCollected = initialScrap
    this._highScoreScrap = initialScrap
  }

  get scrap(): number { return this._scrap }
  get totalScrapCollected(): number { return this._totalScrapCollected }
  get highScoreScrap(): number { return this._highScoreScrap }

  /** Register scrap earned from a mob kill */
  onMobKill(scrapAmount: number): void {
    this._scrap += scrapAmount
    this._totalScrapCollected += scrapAmount
    if (this._scrap > this._highScoreScrap) {
      this._highScoreScrap = this._scrap
    }
  }

  /** Register scrap found in a chest or environment */
  onScrapFound(amount: number): void {
    this.onMobKill(amount)
  }

  /** Try to purchase a shop item. Returns true if successful. */
  purchase(item: ShopItemDef, quantity: number = 1): boolean {
    const cost = item.cost * quantity
    if (this._scrap < cost) return false
    this._scrap -= cost
    return true
  }

  /** Get cost for a quantity of an item */
  getCost(item: ShopItemDef, quantity: number = 1): number {
    return item.cost * quantity
  }

  /** Reset economy for a new delve */
  reset(): void {
    this._scrap = 0
  }

  /** Save state for persistence */
  saveState(): { scrap: number; totalScrapCollected: number; highScoreScrap: number } {
    return {
      scrap: this._scrap,
      totalScrapCollected: this._totalScrapCollected,
      highScoreScrap: this._highScoreScrap,
    }
  }

  /** Restore state from save */
  loadState(state: { scrap: number; totalScrapCollected: number; highScoreScrap: number }): void {
    this._scrap = state.scrap
    this._totalScrapCollected = state.totalScrapCollected
    this._highScoreScrap = state.highScoreScrap
  }
}
