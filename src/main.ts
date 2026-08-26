// Main entry point for VoxelCraft
// Handles title screen -> game loop transition

import { SaveService } from './services/SaveService'
import { TitleScreen } from './ui/TitleScreen'
import { InstructionsOverlay } from './ui/InstructionsOverlay'
import { HUD } from './ui/HUD'
import { Renderer } from './graphics/Renderer'
import { World } from './world/World'
import { Player } from './player/Player'

import { CHUNK_WIDTH } from './world/Chunk'

// Game states
type GameState = 'title' | 'playing'

class VoxelCraftGame {
  private state: GameState = 'title'
  private saveService: SaveService
  private titleScreen?: TitleScreen
  private hud?: HUD
  private renderer?: Renderer
  private world?: World
  private player?: Player
  private canvas: HTMLCanvasElement
  private keys = new Set<string>()
  private animationId: number = 0
  private lastTime = 0
  private renderDistance: number = 6 // chunks
  private loadedChunks = new Set<string>()

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'game-canvas'
    this.canvas.width = 800
    this.canvas.height = 600
    this.canvas.style.display = 'none'
    document.body.appendChild(this.canvas)

    this.saveService = new SaveService()
    this.setupTitleScreen()
    this.setupInputHandlers()
  }

  private setupTitleScreen(): void {
    this.titleScreen = new TitleScreen(this.saveService, {
      onNewWorld: (slot: number) => this.startNewWorld(slot),
      onContinue: (slot: number) => this.continueWorld(slot),
      onDelete: (slot: number) => this.deleteWorld(slot),
    })
  }

  private startNewWorld(slot: number): void {
    const seed = Math.floor(Math.random() * 2147483647)
    this.saveService.createNewWorld(slot, seed)
    this.saveService.setActiveSlot(slot)
    this.loadWorld(slot)
  }

  private continueWorld(slot: number): void {
    const meta = this.saveService.getSlotMeta(slot)
    if (!meta) return
    this.saveService.setActiveSlot(slot)
    this.loadWorld(slot)
  }

  private deleteWorld(slot: number): void {
    this.saveService.deleteSlot(slot)
    if (this.titleScreen) this.titleScreen.refreshSlots()
  }

  private loadWorld(slot: number): void {
    const worldData = this.saveService.loadWorld(slot)
    if (!worldData) return

    this.world = new World(worldData.seed, worldData.overrides)

    // Find spawn point
    const spawnX = 0
    const spawnZ = 0
    const spawnY = this.world.getHeight(spawnX, spawnZ) + 2

    this.player = new Player(spawnX, spawnY, spawnZ)

    this.startGame()
  }

  private setupInputHandlers(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code)

      if (e.code === 'Escape' && this.state === 'playing') {
        this.pauseGame()
      }
    })
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })

    // Pointer lock
    this.canvas.addEventListener('click', () => {
      if (this.state === 'playing') {
        this.canvas.requestPointerLock()
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (this.state === 'playing' && document.pointerLockElement === this.canvas) {
        if (!this.player) return
        this.player.state.rotation.y -= e.movementX * 0.002
        this.player.state.rotation.x -= e.movementY * 0.002
        this.player.state.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.state.rotation.x))
      }
    })

    // Mouse click for block interaction (stubs)
    this.canvas.addEventListener('mousedown', () => {
      if (this.state !== 'playing') return
      // Left click = break, right click = place
      // Stub: no raycasting yet in M1
    })

    window.addEventListener('resize', () => {
      if (this.renderer) {
        const rect = this.canvas.getBoundingClientRect()
        this.renderer.setSize(Math.floor(rect.width), Math.floor(rect.height))
      }
    })
  }

  private startGame(): void {
    this.state = 'playing'

    // Hide title, show canvas
    if (this.titleScreen) this.titleScreen.remove()
    this.canvas.style.display = 'block'

    // Initialize renderer
    this.renderer = new Renderer(this.canvas)

    // Initialize HUD
    this.hud = new HUD()

    // Show instructions on first play
    const hasPlayed = sessionStorage.getItem('voxelcraft-has-played')
    if (!hasPlayed) {
      new InstructionsOverlay(() => {
        sessionStorage.setItem('voxelcraft-has-played', 'true')
      })
    }

    // Start game loop
    this.lastTime = performance.now()
    this.gameLoop()
  }

  private pauseGame(): void {
    this.state = 'title'
    document.exitPointerLock()

    if (this.renderer) {
      // Save world data
      if (this.world && this.player) {
        const slot = this.saveService.getActiveSlot()
        const overrides = this.world.getOverrides()
        this.saveService.saveWorld(slot, {
          version: 1,
          seed: this.world.seed,
          overrides,
          inventory: Array.from({ length: 36 }, () => ({ itemId: 0, count: 0 })),
          stats: { blocksMined: 0, deepestY: 0, distanceWalked: 0 },
        })
      }

      this.renderer.dispose()
      this.renderer = undefined
    }

    if (this.hud) {
      this.hud.remove()
      this.hud = undefined
    }

    // Show title screen
    if (this.titleScreen) {
      this.titleScreen.remove()
      this.setupTitleScreen()
    }

    this.canvas.style.display = 'none'
    if (this.animationId) cancelAnimationFrame(this.animationId)
  }

  private gameLoop = (): void => {
    this.animationId = requestAnimationFrame(this.gameLoop)

    if (this.state !== 'playing' || !this.renderer || !this.world || !this.player) return

    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now

    const world = this.world!
    const player = this.player!

    // Update player
    player.update(dt, this.keys, (x, y, z) => {
      const ix = Math.floor(x)
      const iy = Math.floor(y)
      const iz = Math.floor(z)
      return world.getBlock(ix, iy, iz) > 0
    })

    // Manage chunk loading
    const pcx = Math.floor(player.state.position.x / CHUNK_WIDTH)
    const pcz = Math.floor(player.state.position.z / CHUNK_WIDTH)

    // Remove far chunks
    const toRemove: string[] = []
    for (const key of this.loadedChunks) {
      const [cx, cz] = key.split(',').map(Number)
      if (Math.abs(cx - pcx) > this.renderDistance || Math.abs(cz - pcz) > this.renderDistance) {
        toRemove.push(key)
      }
    }
    for (const key of toRemove) this.loadedChunks.delete(key)

    // Add nearby chunks
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const cx = pcx + dx
        const cz = pcz + dz
        const key = `${cx},${cz}`
        if (!this.loadedChunks.has(key)) {
          world.loadChunk(cx, cz)
          this.loadedChunks.add(key)
        }
      }
    }

    // Update camera
    this.renderer.camera.position.copy(player.state.position)
    this.renderer.camera.rotation.order = 'YXZ'
    this.renderer.camera.rotation.y = player.state.rotation.y
    this.renderer.camera.rotation.x = player.state.rotation.x

    // Debug info
    const pos = player.state.position
    this.hud?.setDebug(
      `VoxelCraft M1\n` +
      `Pos: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}\n` +
      `Chunks: ${this.loadedChunks.size}\n` +
      `FPS: ${(1 / dt).toFixed(0)}`
    )

    // Render
    this.renderer.render()
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new VoxelCraftGame()
  // Expose for debugging
  ;(window as any).__voxelCraft = game
})
