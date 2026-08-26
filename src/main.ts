// Main entry point for VoxelCraft
// Handles title screen -> game loop transition, plus M3 raycast break/place, M4 inventory

import * as THREE from 'three'
import { SaveService, VERSION } from './services/SaveService'
import { DayNightCycle } from './services/DayNightCycle'
import { SoundService } from './services/SoundService'
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
import { DropManager } from './entities/DropManager'
import { MobManager } from './entities/MobManager'
import { WaterSystem } from './services/WaterSystem'
import { AchievementService } from './services/AchievementService'

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
  // M11: Water and lava simulation
  private waterSystem?: WaterSystem
  // M8: Day/night cycle
  private dayNightCycle?: DayNightCycle
  // M8: Autosave
  private autosaveTimer: number = 0
  // M11: Water/lava simulation throttle
  private waterSimTimer: number = 0
  // M12: Achievement tracking
  private achievementService = new AchievementService()
  // M12: Player position for distance tracking
  private lastPlayerPos?: THREE.Vector3
  // M12: Block counters for achievements
  private blocksMinedCount = 0
  private blocksPlacedCount = 0
  // M12: Achievement notification throttle
  private lastAchievementTime = 0
  private readonly autosaveInterval: number = 60 // seconds
  // M9: Drop items on ground
  private dropManager?: DropManager
  // M10: Sound effects
  private soundService?: SoundService
  private mobManager?: MobManager

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
    // M12: Subscribe to achievement unlocks
    this.achievementService.onAchievementUnlock((achievement) => {
      const now = performance.now()
      if (now - this.lastAchievementTime < 5000) return // throttle to one per 5 seconds
      this.lastAchievementTime = now
      const def = this.achievementService.getDefinitions().find((d) => d.id === achievement.id)
      if (def) {
        this.hud?.showAchievementUnlock(def.icon, def.name)
      }
    })
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
    // M10: Initialize audio on user gesture
    this.soundService = new SoundService()
    this.soundService.init()
    if (this.hud) this.hud.setSoundMuted(this.soundService.isMuted())
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

    // M11: Initialize water system
    this.waterSystem = new WaterSystem(this.world)

    // Find spawn point
    const spawnX = 0
    const spawnZ = 0
    const spawnY = this.world.getHeight(spawnX, spawnZ) + 2

    this.player = new Player(spawnX, spawnY, spawnZ)
    this.lastPlayerPos = this.player.state.position.clone()
    // M4: Populate inventory with default items
    for (const item of this.defaultInventoryItems) {
      insertItem(this.inventory, item.itemId, item.count)
    }

    // Initialize block interaction system with shared inventory
    this.blockInteraction = new BlockInteraction(
      this.world,
      this.selectedSlot,
      this.inventory, // shared reference
      this.soundService, // M10: sound effects
    )

    // M7/M10: Spawn mobs
    const seed = this.world.seed
    this.mobManager = new MobManager(this.renderer!.scene)
    if (this.dropManager) this.mobManager.setDropManager(this.dropManager)
    if (this.soundService) {
      this.soundService.init()
      this.mobManager.setSoundService(this.soundService)
    }
    this.mobManager.spawn(this.world, seed)

    // Create block highlight wireframe
    this.blockHighlight = createHighlightBox(0xffffff)
    this.renderer = new Renderer(this.canvas, this.world?.seed ?? 42)
    this.renderer.scene.add(this.blockHighlight)

    // M8: Initialize day/night cycle
    this.dayNightCycle = new DayNightCycle()

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

    // M10: Sync HUD with sound service
    if (this.soundService) {
      this.hud.setSoundService(this.soundService)
    }

    // M10: Start ambient sounds (mobManager already created in loadWorld)
    this.soundService?.startAmbient()

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
        const ach = this.achievementService.serialize()
        this.saveService.saveWorld(slot, {
          version: VERSION,
          seed: this.world.seed,
          overrides,
          inventory: this.inventory,
          stats: { blocksMined: 0, deepestY: 0, distanceWalked: 0 },
          achievements: ach,
        })
      }

      this.renderer.dispose()
      this.renderer = undefined
    }

    // M9: Clear drops
    this.dropManager?.clear()
    this.dropManager = undefined

    // M10: Stop ambient sounds and clear mobs
    this.soundService?.stopAllAmbient()
    this.mobManager?.clear()
    this.mobManager = undefined

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

  // M11: Rebuild all loaded chunk meshes (used after water/lava simulation)
  private rebuildAllChunks(): void {
    for (const key of this.loadedChunks) {
      this.rebuildChunkMesh(key)
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
        this.blocksPlacedCount++
        this.achievementService.updateStats({ blocksPlaced: this.blocksPlacedCount })
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
  /** M9: Insert a dropped item into the player's inventory. Returns count inserted. */
  private insertItem(name: string, count: number): number {
    // Simple item name to ID mapping
    const nameToId: Record<string, number> = {
      'Dirt': 1,
      'Stone': 2,
      'Wood': 3,
      'Planks': 4,
      'Stick': 5,
      'Wooden Pickaxe': 6,
      'Stone Pickaxe': 7,
      'Iron Pickaxe': 8,
      'Coal': 9,
      'Iron Ingot': 10,
      'Torch': 11,
      'Crafting Table': 12,
      'Apple': 13,
      'Beef': 14,
      'Cooked Beef': 15,
    }
    const itemId = nameToId[name] ?? 0
    if (itemId <= 0 || count <= 0) return 0

    const remaining = insertItem(this.inventory, itemId, count)
    const inserted = count - remaining
    if (inserted > 0) this.updateHotbarUI()
    return inserted
  }

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
    const isLiquid = (x: number, y: number, z: number) => this.waterSystem?.isLiquid(x, y, z) ?? false
    const isLava = (x: number, y: number, z: number) => this.waterSystem?.isLava(x, y, z) ?? false
    player.update(dt, this.keys, (x, y, z) => {
      const ix = Math.floor(x)
      const iy = Math.floor(y)
      const iz = Math.floor(z)
      return world.getBlock(ix, iy, iz) > 0
    }, isLiquid, isLava)

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

    // M7/M10: Update mobs
    if (this.mobManager) {
      this.mobManager.update(dt, player.state.position, world)
    }

    // M3/M9: Update mining progress
    if (this.mouseDownLeft && this.blockInteraction) {
      const broken = this.blockInteraction.updateMining(dt)
      if (broken) {
        this.blocksMinedCount++
        this.achievementService.updateStats({ blocksMined: this.blocksMinedCount })
        // Spawn a drop item at the broken block's position
        if (this.dropManager) {
          const drop = this.blockInteraction.getAndClearLastDrop()
          if (drop) {
            const bx = drop.position[0] + 0.5
            const by = drop.position[1] + 0.5
            const bz = drop.position[2] + 0.5
            this.dropManager.spawnDrop(drop.itemId, bx, by, bz, drop.count)
          }
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

    // M9: Update drops and handle collection
    if (this.dropManager && this.player) {
      const playerPos = this.player.state.position
      const playerBounds = this.player.getBounds()
      this.dropManager.update(dt, playerPos, { minY: playerBounds.minY, maxY: playerBounds.maxY })

      // Check for collection
      const collected = this.dropManager.getLatestCollection()
      if (collected && collected.count > 0) {
        // Insert into inventory
        const inserted = this.insertItem(collected.name, collected.count)
        if (inserted > 0) {
          this.hud?.showDropNotification(collected.name, inserted)
          // M10: Play pickup sound
          this.soundService?.play('pickup')
          this.achievementService.updateStats({ dropsCollected: this.achievementService.getStats().dropsCollected + collected.count })
        }
      }
    }

    // M11: Water/lava simulation (throttled to avoid frame cost)
    if (this.waterSystem) {
      this.waterSimTimer += dt
      if (this.waterSimTimer >= 2.0) {
        this.waterSimTimer = 0
        this.waterSystem.simulateWaterFlow()
        this.waterSystem.simulateLavaFlow()
        this.waterSystem.convertLavaWaterToStone()
        // Rebuild affected chunks
        this.rebuildAllChunks()
      }
    }

    // M12: Update achievement stats
    if (this.player) {
      const ppos = this.player.state.position
      // Distance walked
      if (this.lastPlayerPos) {
        const dx = ppos.x - this.lastPlayerPos.x
        const dz = ppos.z - this.lastPlayerPos.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist > 0.1) {
          this.achievementService.updateStats({ distanceWalked: this.achievementService.getStats().distanceWalked + dist })
        }
      }
      this.lastPlayerPos = ppos.clone()

      // Deepest Y
      this.achievementService.updateStats({ deepestY: Math.floor(ppos.y) })

      // Liquid checks
      const checkX = Math.round(ppos.x)
      const checkY = Math.round(ppos.y)
      if (this.waterSystem) {
        const inWater = this.waterSystem.isLiquid(checkX, checkY, Math.round(ppos.z))
        const inLava = this.waterSystem.isLava(checkX, checkY, Math.round(ppos.z))
        this.achievementService.updateStats({
          hasSwumInWater: inWater,
          hasTouchedLava: inLava,
        })
        // M11: Show liquid status
        this.hud?.showLiquidStatus(inWater, inLava)
      }
    }

    // M8: Update day/night cycle
    if (this.renderer && this.dayNightCycle) {
      const state = this.dayNightCycle.getState()
      this.renderer.updateLighting(state.skyColor, state.ambientLight)
      // M8: Update HUD with time of day
      this.hud?.updateTimeOfDay(state.timeOfDay)
    }

    // M8: Autosave
    this.autosaveTimer += dt
    if (this.autosaveTimer >= this.autosaveInterval && this.world && this.player) {
      this.autosaveTimer = 0
      const slot = this.saveService.getActiveSlot()
      const overrides = this.world.getOverrides()
      const ach = this.achievementService.serialize()
      this.saveService.saveWorld(slot, {
        version: VERSION,
        seed: this.world.seed,
        overrides,
        inventory: this.inventory,
        stats: { blocksMined: 0, deepestY: 0, distanceWalked: 0 },
        achievements: ach,
      })
      // Show autosave notification
      this.hud?.setDebug(`Auto-saved at ${this.dayNightCycle?.getPhase()}`)
    }

    // Debug info
    const pos = player.state.position
    if (!this.dayNightCycle || this.autosaveTimer < this.autosaveInterval) {
      const mobCount = this.mobManager ? this.mobManager.getMobs().length : 0
      const achStats = this.achievementService.getStats()
      const achUnlocked = this.achievementService.getUnlockedCount()
      this.hud?.updateAchievementStats(achUnlocked, this.achievementService.getDefinitions().length, { ...achStats })
      this.hud?.setDebug(
        `VoxelCraft M12\n` +
        `Pos: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}\n` +
        `Chunks: ${this.loadedChunks.size}\n` +
        `Drops: ${this.dropManager ? this.dropManager.getDrops().length : 0}\n` +
        `Mobs: ${mobCount}\n` +
        `FPS: ${(1 / dt).toFixed(0)}\n` +
        `Slot: ${this.selectedSlot + 1} | E=Inv`
      )
    }

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
