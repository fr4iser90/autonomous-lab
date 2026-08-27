/**
 * Minimap — 2D top-down overlay of the current dungeon.
 * M11: Canvas-based minimap rendered on top of the game canvas.
 */
import type { DungeonData } from '../systems/DungeonPCG'

export interface PlayerPos {
  x: number
  z: number
}

export class Minimap {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly cellSize = 3
  private readonly padding = 2
  private dungeon: DungeonData | null = null
  private playerPos: PlayerPos = { x: 0, z: 0 }

  constructor(dungeon: DungeonData) {
    const w = dungeon.width * (this.cellSize + this.padding) + this.padding
    const h = dungeon.height * (this.cellSize + this.padding) + this.padding

    this.canvas = document.createElement('canvas')
    this.canvas.width = w
    this.canvas.height = h
    this.canvas.style.cssText = `
      position: absolute; bottom: 10px; right: 10px;
      border: 1px solid #3a3530; border-radius: 4px;
      background: rgba(10,10,14,0.85); z-index: 10;
    `

    // Make sure canvas element exists in DOM
    const container = document.getElementById('game-canvas')?.parentElement
    if (container) container.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.dungeon = dungeon
  }

  /** Update minimap with dungeon data */
  setDungeon(dungeon: DungeonData): void {
    this.dungeon = dungeon
    this.draw()
  }

  /** Set player position for the red dot */
  setPlayerPos(x: number, z: number): void {
    this.playerPos = { x, z }
    this.draw()
  }

  private draw(): void {
    if (!this.dungeon || !this.dungeon.width) return
    const { width, height, cells, spawnX, spawnY, stairsX, stairsY } = this.dungeon
    const cs = this.cellSize
    const p = this.padding

    this.ctx.fillStyle = '#0a0a0e'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y * width + x]
        if (!cell) continue
        const px = x * (cs + p) + p
        const py = y * (cs + p) + p

        switch (cell.type) {
          case 0: // FLOOR
            this.ctx.fillStyle = '#2a2520'
            this.ctx.fillRect(px, py, cs, cs)
            break
          case 2: // DOOR
            this.ctx.fillStyle = '#4a4540'
            this.ctx.fillRect(px, py, cs, cs)
            break
          case 3: // STAIRS
            this.ctx.fillStyle = '#666666'
            this.ctx.fillRect(px, py, cs, cs)
            break
        }
      }
    }

    // Draw spawn point (green)
    const sx = spawnX * (cs + p) + p + cs / 2
    const sy = spawnY * (cs + p) + p + cs / 2
    this.ctx.fillStyle = '#44aa44'
    this.ctx.fillRect(sx - 1, sy - 1, 3, 3)

    // Draw stairs (white)
    const dx = stairsX * (cs + p) + p + cs / 2
    const dy = stairsY * (cs + p) + p + cs / 2
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(dx - 1, dy - 1, 3, 3)

    // Draw player (red)
    const px = this.playerPos.x * (cs + p) + p + cs / 2
    const py = this.playerPos.z * (cs + p) + p + cs / 2
    this.ctx.fillStyle = '#ff3333'
    this.ctx.fillRect(px - 2, py - 2, 4, 4)
  }

  /** Hide minimap */
  hide(): void {
    this.canvas.style.display = 'none'
  }

  /** Show minimap */
  show(): void {
    this.canvas.style.display = 'block'
  }

  dispose(): void {
    this.canvas.remove()
  }
}
