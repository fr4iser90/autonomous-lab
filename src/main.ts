// Main entry point for VoxelCraft
// Handles title screen -> game loop transition, plus M3 raycast break/place, M4 inventory

import * as THREE from 'three'
import { SaveService } from './services/SaveService'
import { TitleScreen } from './ui/TitleScreen'
import { InstructionsOverlay } from './ui/InstructionsOverlay'
import { HUD } from './ui/HUD'
import { Renderer } from './graphics/Renderer'
import { MeshBuilder } from './graphics/MeshBuilder'
import { createHighlightBox, positionHighlightBox } from './graphics/HighlightMesh'
import { World } from './world/World'
import { Player } from './player/Player'
import { raycast, getRayFromCamera } from './physics/Raycaster'
import { BlockInteraction } from './physics/BlockInteraction'
import { InventoryScreen } from './ui/InventoryScreen'
import {
  createInventory,
  insertItem,
  getHotbarSnapshot,
  HOTBAR_SIZE,
} from './data/inventory'

import { CHUNK_WIDTH } from './world/Chunk'
import { ChunkLighting, updateChunkLighting as calcLighting } from './physics/Lighting'

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
  private blockInteraction?: BlockInteraction
  private inventoryScreen?: InventoryScreen
  private inventoryOpen = false
  private canvas: HTMLCanvasElement
  private keys = new Set<string>()
  private animationId: number = 0
  private lastTime = 0
  private renderDistance: number = 6 // chunks
  private loadedChunks = new Set<string>()
  private chunkMeshes = new Map<string, THREE.Mesh>()

  // M3: Block interaction state
  private blockHighlight?: THREE.LineSegments
  private mouseDownLeft = false
  private selectedSlot = 0 // hotbar slot 0-8
  // M4: Shared inventory (36 slots)
  private inventory: Array<{ itemId: number; count: number }> = createInventory()
  // M6: Per-chunk lighting data
  private chunkLightings = new Map<string, ChunkLighting>()

  // M4: Default starting inventory (items for testing)
  private readonly defaultInventoryItems = [
    { itemId: 2, count: 64 },  // Stone
    { itemId: 1, count: 64 },  // Dirt
    { itemId: 4, count: 64 },  // Planks
    { itemId: 11, count: 64 }, // Torch
  ]

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

    // M4: Populate inventory with default items
    for (const item of this.defaultInventoryItems) {
      insertItem(this.inventory, item.itemId, item.count)
    }

    // Initialize block interaction system with shared inventory
    this.blockInteraction = new BlockInteraction(
      this.world,
      this.selectedSlot,
      this.inventory, // shared reference
    )

    // Create block highlight wireframe
    this.blockHighlight = createHighlightBox(0xffffff)
    this.renderer = new Renderer(this.canvas, this.world?.seed ?? 42)
    this.renderer.scene.add(this.blockHighlight)

    this.startGame()
  }

  private setupInputHandlers(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code)

      // M4: E key toggles inventory screen
      if (e.code === 'KeyE' && this.state === 'playing' && !e.repeat) {
        e.preventDefault()
        this.toggleInventory()
        return
      }

      if (e.code === 'Escape') {
        if (this.inventoryOpen) {
          // Close inventory, don't pause game
          this.toggleInventory()
          return
        }
        if (this.state === 'playing') {
          this.pauseGame()
        }
      }

      // Number keys select hotbar slot (1-9 → 0-8)
      if (this.state === 'playing' && !this.inventoryOpen) {
        const num = parseInt(e.code.replace('Digit', ''))
        if (num >= 1 && num <= 9) {
          this.selectedSlot = num - 1
          // Update BlockInteraction's selected slot
          this.blockInteraction?.updateSelectedSlot(this.selectedSlot)
          if (this.hud) {
            this.updateHotbarUI()
          }
        }
      }
    })
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)

      // Release left mouse on number key press cancels mining
      if (e.code.startsWith('Digit') && this.state === 'playing' && !this.inventoryOpen) {
        const num = parseInt(e.code.replace('Digit', ''))
        if (num >= 1 && num <= 9) {
          this.blockInteraction?.cancelMining()
        }
      }
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

    // Mouse click for block interaction (M3)
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state !== 'playing' || !this.world || !this.player) return
      if (document.pointerLockElement !== this.canvas) return

      if (e.button === 0) {
        // Left click: start mining
        this.mouseDownLeft = true
        this.performBreak()
      } else if (e.button === 2) {
        // Right click: place block
        this.performPlace()
      }
    })

    this.canvas.addEventListener('mouseup', (e) => {
      if (this.state !== 'playing') return
      if (e.button === 0) {
        this.mouseDownLeft = false
        this.blockInteraction?.cancelMining()
      }
    })

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())

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

    // Initialize HUD
    this.hud = new HUD()

    // Show instructions on first play
    const hasPlayed = sessionStorage.getItem('voxelcraft-has-played')
    if (!hasPlayed) {
      new InstructionsOverlay(() => {
        sessionStorage.setItem('voxelcraft-has-played', 'true')
      })
    }

    this.updateHotbarUI()

    // Start game loop
    this.lastTime = performance.now()
    this.gameLoop()
  }

  private pauseGame(): void {
    // M4: Close inventory if open
    if (this.inventoryOpen) {
      this.closeInventory()
    }

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
          inventory: this.inventory,
          stats: { blocksMined: 0, deepestY: 0, distanceWalked: 0 },
        })
      }

      this.renderer.dispose()
      this.renderer = undefined
    }

    // Clear chunk meshes from scene
    for (const [, mesh] of this.chunkMeshes) {
      mesh.geometry.dispose()
    }
    this.chunkMeshes.clear()
    this.loadedChunks.clear()
    this.chunkLightings.clear()

    if (this.hud) {
      this.hud.remove()
      this.hud = undefined
    }

    if (this.blockHighlight) {
      if (this.blockHighlight.parent) {
        this.blockHighlight.parent.remove(this.blockHighlight)
      }
      this.blockHighlight.geometry.dispose()
      ;(this.blockHighlight.material as THREE.Material).dispose()
      this.blockHighlight = undefined
    }

    // Show title screen
    if (this.titleScreen) {
      this.titleScreen.remove()
      this.setupTitleScreen()
    }

    this.canvas.style.display = 'none'
    if (this.animationId) cancelAnimationFrame(this.animationId)
  }

  /** M4: Toggle inventory screen visibility */
  private toggleInventory(): void {
    if (this.inventoryOpen) {
      this.closeInventory()
    } else {
      this.openInventory()
    }
  }

  /** M4: Open the inventory screen */
  private openInventory(): void {
    if (!this.hud) return
    this.inventoryOpen = true
    document.exitPointerLock()

    // Update BlockInteraction with current selected slot
    this.blockInteraction?.updateSelectedSlot(this.selectedSlot)

    this.inventoryScreen = new InventoryScreen({
      onClose: () => this.closeInventory(),
      onSlotClick: (index, itemId, count) => this.handleInventorySlotClick(index, itemId, count),
    })
    this.inventoryScreen.update(this.inventory)

    // Update HUD to show inventory-open hint
    this.hud.setDebug('Inventory open (E to close)')
  }

  /** M4: Close the inventory screen */
  private closeInventory(): void {
    if (!this.inventoryScreen) return
    this.inventoryScreen.remove()
    this.inventoryScreen = undefined
    this.inventoryOpen = false

    // Re-request pointer lock for gameplay
    if (this.canvas) this.canvas.requestPointerLock()

    this.updateHotbarUI()
  }

  /** M4: Handle slot clicks in the inventory screen */
  private handleInventorySlotClick(index: number, _itemId: number, _count: number): void {
    // Simple click-to-select: move clicked slot to selected hotbar slot
    if (index < HOTBAR_SIZE) {
      this.selectedSlot = index
      this.blockInteraction?.updateSelectedSlot(this.selectedSlot)
    } else {
      // Find the nearest hotbar slot with the same item or an empty slot
      const sourceSlot = this.inventory[index]
      if (sourceSlot.itemId > 0) {
        // Try to stack into existing hotbar slots first
        for (let i = 0; i < HOTBAR_SIZE; i++) {
          const target = this.inventory[i]
          if (target.itemId === sourceSlot.itemId) {
            this.selectedSlot = i
            this.blockInteraction?.updateSelectedSlot(this.selectedSlot)
            return
          }
        }
        // Find first empty hotbar slot
        for (let i = 0; i < HOTBAR_SIZE; i++) {
          if (this.inventory[i].itemId <= 0) {
            // Move entire stack from main inventory to hotbar
            this.inventory[i] = { ...sourceSlot }
            this.inventory[index] = { itemId: 0, count: 0 }
            this.selectedSlot = i
            this.blockInteraction?.updateSelectedSlot(this.selectedSlot)
            if (this.inventoryScreen) this.inventoryScreen.update(this.inventory)
            return
          }
        }
      }
    }
    // Refresh inventory display
    if (this.inventoryScreen) this.inventoryScreen.update(this.inventory)
  }

  private updateHotbarUI(): void {
    if (!this.hud) return
    const items = getHotbarSnapshot(this.inventory)
    this.hud.updateHotbar(this.selectedSlot, items)
  }

  private rebuildChunkMesh(chunkKey: string): void {
    if (!this.renderer || !this.world) return

    const [cx, cz] = chunkKey.split(',').map(Number)
    const atlas = this.renderer.textureAtlas

    // Remove old mesh if exists
    const oldMesh = this.chunkMeshes.get(chunkKey)
    if (oldMesh) {
      this.renderer.scene.remove(oldMesh)
      oldMesh.geometry.dispose()
    }

    const getBlockFn = (wx: number, wy: number, wz: number) => this.world!.getBlock(wx, wy, wz)
    const lighting = this.chunkLightings.get(chunkKey) || null
    const mesh = MeshBuilder.buildChunk(cx, cz, getBlockFn, atlas, lighting, 0, 0)

    if (mesh.geometry.getAttribute('position') && mesh.geometry.getAttribute('position').count > 0) {
      this.renderer.scene.add(mesh)
      this.chunkMeshes.set(chunkKey, mesh)
    }
  }

  /**
   * M3: Perform block break via raycast
   */
  private performBreak(): void {
    if (!this.world || !this.player || !this.renderer) return

    const ray = getRayFromCamera(
      [this.player.state.position.x, this.player.state.position.y, this.player.state.position.z],
      this.player.state.rotation.y,
      this.player.state.rotation.x,
    )

    const hit = raycast(ray, (wx, wy, wz) => this.world!.getBlock(wx, wy, wz))
    if (hit) {
      this.blockInteraction?.startMining(hit.position)
    }
  }

  /**
   * M3: Perform block placement via raycast
   */
  private performPlace(): void {
    if (!this.world || !this.player || !this.renderer) return

    const ray = getRayFromCamera(
      [this.player.state.position.x, this.player.state.position.y, this.player.state.position.z],
      this.player.state.rotation.y,
      this.player.state.rotation.x,
    )

    const hit = raycast(ray, (wx, wy, wz) => this.world!.getBlock(wx, wy, wz))
    if (hit) {
      const placed = this.blockInteraction?.placeBlock(hit.position, hit.normal)
      if (placed) {
        // Rebuild affected chunks
        const [px, py, pz] = hit.position
        const n = hit.normal
        const placeX = px + n[0]
        const placeY = py + n[1]
        const placeZ = pz + n[2]
        this.markChunkDirty(placeX, placeY, placeZ)
        this.markChunkDirty(px, py, pz)
      }
    }
  }

  /**
   * Mark a chunk as needing rebuild when a block changes.
   * Also updates lighting for affected chunks.
   */
  private markChunkDirty(wx: number, _wy: number, wz: number): void {
    if (!this.renderer || !this.world) return
    const cx = Math.floor(wx / CHUNK_WIDTH)
    const cz = Math.floor(wz / CHUNK_WIDTH)
    const key = `${cx},${cz}`
    if (this.loadedChunks.has(key)) {
      this.updateChunkLighting(cx, cz)
      this.rebuildChunkMesh(key)
      // Also rebuild neighbor chunks if torch was placed/broken
      const [ncx, ncz] = [cx + 1, cz], [ncx2, ncz2] = [cx - 1, cz], [ncx3, ncz3] = [cx, cz + 1], [ncx4, ncz4] = [cx, cz - 1]
      for (const [nx, nz] of [[ncx, ncz], [ncx2, ncz2], [ncx3, ncz3], [ncx4, ncz4]] as [number, number][]) {
        const nkey = `${nx},${nz}`
        if (this.loadedChunks.has(nkey)) {
          this.updateChunkLighting(nx, nz)
          this.rebuildChunkMesh(nkey)
        }
      }
    }
  }

  /**
   * M6: Calculate lighting for a chunk.
   */
  private updateChunkLighting(cx: number, cz: number): void {
    if (!this.world) return
    const key = `${cx},${cz}`
    const chunk = this.world.getChunk(cx, cz)
    if (!chunk) return

    let lighting = this.chunkLightings.get(key)
    if (!lighting) {
      lighting = new ChunkLighting()
      this.chunkLightings.set(key, lighting)
    }

    calcLighting(chunk, this.world!, lighting)
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
    for (const key of toRemove) {
      this.loadedChunks.delete(key)
      const mesh = this.chunkMeshes.get(key)
      if (mesh) {
        this.renderer.scene.remove(mesh)
        mesh.geometry.dispose()
        this.chunkMeshes.delete(key)
      }
    }

    // Add nearby chunks
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const cx = pcx + dx
        const cz = pcz + dz
        const key = `${cx},${cz}`
        if (!this.loadedChunks.has(key)) {
          world.loadChunk(cx, cz)
          this.loadedChunks.add(key)
          // M6: Calculate lighting for new chunk
          this.updateChunkLighting(cx, cz)
          this.rebuildChunkMesh(key)
        }
      }
    }

    // Update camera
    this.renderer.camera.position.copy(player.state.position)
    this.renderer.camera.rotation.order = 'YXZ'
    this.renderer.camera.rotation.y = player.state.rotation.y
    this.renderer.camera.rotation.x = player.state.rotation.x

    // M3: Raycast for block highlight
    if (this.blockHighlight) {
      const ray = getRayFromCamera(
        [player.state.position.x, player.state.position.y, player.state.position.z],
        player.state.rotation.y,
        player.state.rotation.x,
      )
      const hit = raycast(ray, (wx, wy, wz) => world.getBlock(wx, wy, wz))
      if (hit) {
        positionHighlightBox(this.blockHighlight, hit.position)
        this.blockHighlight.visible = true
        // Update highlight color based on mining progress
        if (this.blockInteraction?.state.minedBlock) {
          const progress = this.blockInteraction.state.minedBlock
          const ratio = progress.progress / progress.maxProgress
          // Red when almost broken, yellow when midway, white when just started
          const r = Math.min(1, ratio * 2)
          const g = 1 - ratio * 0.5
          const b = 1 - ratio
          ;(this.blockHighlight.material as THREE.LineBasicMaterial).color.setRGB(r, g, b)
        } else {
          ;(this.blockHighlight.material as THREE.LineBasicMaterial).color.setRGB(1, 1, 1)
        }
      } else {
        this.blockHighlight.visible = false
      }
    }

    // M3: Update mining progress
    if (this.mouseDownLeft && this.blockInteraction) {
      const broken = this.blockInteraction.updateMining(dt)
      if (broken) {
        // Rebuild the chunk where the block was broken
        if (this.blockInteraction.state.minedBlock) {
          const [bx, by, bz] = this.blockInteraction.state.minedBlock.position
          this.markChunkDirty(bx, by, bz)
        }
        this.mouseDownLeft = false
      }
    }

    // Update mining progress UI
    if (this.hud && this.blockInteraction?.state.minedBlock) {
      const mine = this.blockInteraction.state.minedBlock
      this.hud.updateMiningProgress(mine.progress, mine.maxProgress)
    } else if (this.hud) {
      this.hud.updateMiningProgress(0, 0)
    }

    // Debug info
    const pos = player.state.position
    this.hud?.setDebug(
      `VoxelCraft M4\n` +
      `Pos: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}\n` +
      `Chunks: ${this.loadedChunks.size}\n` +
      `FPS: ${(1 / dt).toFixed(0)}\n` +
      `Slot: ${this.selectedSlot + 1} | E=Inv`
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
