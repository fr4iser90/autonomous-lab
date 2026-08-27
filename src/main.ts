/**
 * Ashen Delve — Main entry point
 * M1-M9: Visual Spec + Shell + Three.js + DungeonPCG + Mobs + Combat + Loot
 */
import { loadSave, saveSave } from './services/SaveService'
import { updateHP, updateFloor, updateDepth } from './app/uiHelpers'
import { GameRenderer } from './render/GameRenderer'
import { FollowCamera } from './render/camera'
import { InputManager } from './systems/input'
import { PlayerKit } from './kits/playerKit'
import { generateDungeon, buildScene } from './systems/DungeonPCG'
import { getThemeForFloor } from './data/floors'
import { Goblin } from './entities/Goblin'
import { Shade } from './entities/Shade'
import { Stalker } from './entities/Stalker'
import { ChaseAI } from './systems/ChaseAI'
import { CombatEngine } from './systems/CombatEngine'
import { Inventory } from './systems/Inventory'
import type { MobKit } from './entities/MobKit'

// DOM refs
const titleScreen = document.getElementById('title-screen')!
const gameScreen = document.getElementById('game-screen')!
const settingsPanel = document.getElementById('settings-panel')!
const hud = document.getElementById('hud')!
const inventoryPanel = document.getElementById('inventory-panel')!
const deathScreen = document.getElementById('death-screen')!
const pauseOverlay = document.getElementById('pause-overlay')!
const combatLog = document.getElementById('combat-log')!
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

// State
let currentScreen: 'title' | 'game' | 'settings' = 'title'
let gameState: 'menu' | 'playing' | 'paused' | 'dead' = 'menu'

// Three.js game objects
let renderer: GameRenderer | null = null
let player: PlayerKit | null = null
let camera: FollowCamera | null = null
let input: InputManager | null = null
let animFrame: number = 0
let playerYaw = 0

// Game state
let playerHP = 20
let playerMaxHP = 20
let playerFloor = 1
let playerX = 0
let playerZ = 0
let dungeonSeed = 0
let mobs: MobKit[] = []
let combatLogEntries: string[] = []

// Systems
let combatEngine: CombatEngine | null = null
let inventory: Inventory | null = null
let chaseAI: ChaseAI | null = null

// --- Screen Management ---
function showScreen(screen: 'title' | 'game' | 'settings') {
  currentScreen = screen
  titleScreen.style.display = screen === 'title' ? 'flex' : 'none'
  gameScreen.style.display = screen === 'game' ? 'block' : 'none'
  settingsPanel.style.display = screen === 'settings' ? 'flex' : 'none'

  if (screen === 'game') {
    hud.style.display = 'flex'
  } else {
    hud.style.display = 'none'
    inventoryPanel.style.display = 'none'
    deathScreen.style.display = 'none'
    pauseOverlay.style.display = 'none'
    combatLog.style.display = 'none'
    if (animFrame) cancelAnimationFrame(animFrame)
    animFrame = 0
  }
}

// --- Title Screen ---
function initTitleScreen(): void {
  const save = loadSave()
  const continueBtn = document.getElementById('btn-continue')!
  if (save.meta.highFloorCleared > 0) {
    continueBtn.style.display = 'block'
  } else {
    continueBtn.style.display = 'none'
  }
  showScreen('title')
}

// --- Settings ---
function loadSettingsIntoUI(): void {
  const save = loadSave()
  const vm = document.getElementById('vol-master') as HTMLInputElement
  const vs = document.getElementById('vol-sfx') as HTMLInputElement
  const rm = document.getElementById('reduce-motion') as HTMLInputElement
  const vmv = document.getElementById('vol-master-val')!
  const vsv = document.getElementById('vol-sfx-val')!
  if (vm) vm.value = String(save.settings.masterVolume)
  if (vs) vs.value = String(save.settings.sfxVolume)
  if (rm) rm.checked = save.settings.reduceMotion
  if (vmv) vmv.textContent = save.settings.masterVolume + '%'
  if (vsv) vsv.textContent = save.settings.sfxVolume + '%'
}

function applySettingsFromUI(): void {
  const save = loadSave()
  const vm = document.getElementById('vol-master') as HTMLInputElement
  const vs = document.getElementById('vol-sfx') as HTMLInputElement
  const rm = document.getElementById('reduce-motion') as HTMLInputElement
  if (vm) save.settings.masterVolume = parseInt(vm.value, 10)
  if (vs) save.settings.sfxVolume = parseInt(vs.value, 10)
  if (rm) save.settings.reduceMotion = rm.checked
  saveSave(save)
}

// --- Keyboard Input ---
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (currentScreen === 'game' && gameState === 'playing' && input) {
    input.onKeyDown(e)
  }
  if (currentScreen === 'game' && gameState === 'playing') {
    if (e.key === 'e' || e.key === 'E') {
      if (inventoryPanel.style.display === 'none') {
        inventoryPanel.style.display = 'block'
        updateInventoryUI()
      } else {
        inventoryPanel.style.display = 'none'
      }
    }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      gameState = 'paused'
      pauseOverlay.style.display = 'flex'
    }
  }
  if (currentScreen === 'game' && gameState === 'paused') {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      gameState = 'playing'
      pauseOverlay.style.display = 'none'
    }
  }
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  if (input) input.onKeyUp(e)
})

// Mouse
canvas.addEventListener('mousedown', (e) => {
  if (input) input.onMouseDown()
  if (camera) camera.onPointerDown(e.clientX)
})
canvas.addEventListener('mouseup', () => { if (input) input.onMouseUp() })
let mouseDownPos = { x: 0, y: 0 }
canvas.addEventListener('mousemove', (e) => {
  const dx = e.clientX - mouseDownPos.x
  if (input) input.onMouseMove(dx, 0)
  if (camera) camera.onPointerMove(e.clientX, e.clientY)
  mouseDownPos = { x: e.clientX, y: e.clientY }
})

function initButtonHandlers(): void {
  const btnNew = document.getElementById('btn-new')
  const btnContinue = document.getElementById('btn-continue')
  const btnSettings = document.getElementById('btn-settings')
  const btnSettingsBack = document.getElementById('btn-settings-back')
  const btnRetry = document.getElementById('btn-retry')
  const btnTitle = document.getElementById('btn-title')
  const btnResume = document.getElementById('btn-resume')
  const btnPauseSettings = document.getElementById('btn-pause-settings')
  const btnPauseTitle = document.getElementById('btn-pause-title')

  if (btnNew) btnNew.addEventListener('click', startNewGame)
  if (btnContinue) btnContinue.addEventListener('click', startContinueGame)
  if (btnSettings) btnSettings.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  if (btnSettingsBack) btnSettingsBack.addEventListener('click', () => { applySettingsFromUI(); showScreen('title') })
  if (btnRetry) btnRetry.addEventListener('click', () => { deathScreen.style.display = 'none'; gameState = 'playing'; playerHP = playerMaxHP; updateHP(playerHP, playerMaxHP) })
  if (btnTitle) btnTitle.addEventListener('click', () => { deathScreen.style.display = 'none'; showScreen('title'); gameState = 'menu' })
  if (btnResume) btnResume.addEventListener('click', () => { gameState = 'playing'; pauseOverlay.style.display = 'none' })
  if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  if (btnPauseTitle) btnPauseTitle.addEventListener('click', () => { pauseOverlay.style.display = 'none'; showScreen('title'); gameState = 'menu' })
}

// Volume sliders
function initVolumeSliders(): void {
  const volMaster = document.getElementById('vol-master') as HTMLInputElement
  const volSfx = document.getElementById('vol-sfx') as HTMLInputElement
  if (volMaster) volMaster.addEventListener('input', () => {
    const val = document.getElementById('vol-master-val')!
    val.textContent = volMaster.value + '%'
  })
  if (volSfx) volSfx.addEventListener('input', () => {
    const val = document.getElementById('vol-sfx-val')!
    val.textContent = volSfx.value + '%'
  })
}

// --- Inventory UI ---
function updateInventoryUI(): void {
  if (!inventory) return
  const slotEls = inventoryPanel.querySelectorAll('.slot')
  const slots = inventory.getSlots()
  slotEls.forEach((el, i) => {
    if (i < slots.length) {
      const slot = slots[i]
      ;(el as HTMLElement).innerHTML = `<span class="item-icon">${slot.item.icon}</span><span class="item-name">${slot.item.name}</span>`
      ;(el as HTMLElement).classList.add('has-item')
    } else {
      ;(el as HTMLElement).innerHTML = ''
      ;(el as HTMLElement).classList.remove('has-item')
    }
  })
}

// --- Combat UI ---
function addCombatLog(message: string): void {
  combatLogEntries.push(message)
  if (combatLogEntries.length > 10) combatLogEntries.shift()
  combatLog.innerHTML = combatLogEntries.map(e => `<div class="log-entry">${e}</div>`).join('')
  combatLog.style.display = 'block'
  // Auto-hide after 5 seconds
  clearTimeout((combatLog as any)._hideTimer)
  ;(combatLog as any)._hideTimer = setTimeout(() => { combatLog.style.display = 'none' }, 5000)
}

// --- Game Loop ---
function startNewGame(): void {
  dungeonSeed = Date.now() % 100000
  startGame(dungeonSeed)
}

function startContinueGame(): void {
  startGame(dungeonSeed || 12345)
}

function startGame(seed: number): void {
  gameState = 'playing'
  playerHP = 20
  playerMaxHP = 20
  playerFloor = 1
  playerX = 0
  playerZ = 0
  combatLogEntries = []
  mobs = []
  showScreen('game')
  updateHP(playerHP, playerMaxHP)
  updateFloor(1)
  updateDepth(0)

  // Init systems
  combatEngine = new CombatEngine()
  inventory = new Inventory()
  chaseAI = new ChaseAI({
    aggroRange: 8,
    retreatRange: 15,
    attackRange: 1.2,
    attackCooldown: 1.0,
    moveSpeed: 2.5,
  })

  // Initialize Three.js scene
  initThreeScene(seed)
}

function initThreeScene(seed: number): void {
  const w = window.innerWidth
  const h = window.innerHeight

  // Renderer
  renderer = new GameRenderer({
    canvas,
    width: w,
    height: h,
    bgColor: '#0a0a0e',
    fogColor: '#0a0a0e',
    floorColor: '#2a2520',
    wallColor: '#1a1815',
    wallHighlightColor: '#3a3530',
    torchEmissive: '#ff9944',
  })

  // Camera
  camera = new FollowCamera({
    distance: 10,
    height: 7,
    FOV: 55,
    followLag: 0.08,
  })

  // Input
  input = new InputManager()

  // Generate dungeon
  const theme = getThemeForFloor(1)
  const dungeon = generateDungeon(seed, 1, theme)

  // Build 3D scene
  buildScene(renderer, dungeon)

  // Spawn mobs in non-first rooms
  const mobKinds = [
    () => new Goblin(renderer!),
    () => new Shade(renderer!),
    () => new Stalker(renderer!),
  ]

  for (let i = 1; i < dungeon.rooms.length; i++) {
    const room = dungeon.rooms[i]
    const kindIdx = i % mobKinds.length
    const mob = mobKinds[kindIdx]()
    mob.setPosition(room.cx - dungeon.width / 2 + (Math.random() - 0.5) * 2, 0, room.cy - dungeon.height / 2 + (Math.random() - 0.5) * 2)
    mobs.push(mob)
  }

  // Player
  player = new PlayerKit(renderer)
  playerX = dungeon.spawnX - dungeon.width / 2
  playerZ = dungeon.spawnY - dungeon.height / 2
  player.setPosition(playerX, 0, playerZ)
  playerYaw = 0

  // Resize handler
  window.addEventListener('resize', () => {
    if (renderer) {
      renderer.resize(window.innerWidth, window.innerHeight)
    }
  })

  // Start render loop
  gameLoop()
}

let lastTime = 0
let attackCooldown = 0

function gameLoop(timestamp = 0): void {
  if (currentScreen !== 'game' || gameState !== 'playing') return
  animFrame = requestAnimationFrame(gameLoop)

  const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
  lastTime = timestamp
  const time = renderer?.getElapsedTime() || 0

  // Update input
  input?.update()
  const inp = input?.getState() ?? { forward: 0, right: 0, rotate: 0, jump: false, attack: false }

  // Move player
  if (player && renderer) {
    const speed = 4
    const moveX = (Math.sin(playerYaw) * inp.forward + Math.cos(playerYaw) * inp.right) * speed * dt
    const moveZ = (Math.cos(playerYaw) * inp.forward - Math.sin(playerYaw) * inp.right) * speed * dt

    playerX += moveX
    playerZ += moveZ
    player.setPosition(playerX, 0, playerZ)

    // Attack (left-click)
    attackCooldown -= dt
    if (inp.attack && attackCooldown <= 0 && combatEngine) {
      attackCooldown = 0.5
      // Attack nearby mobs
      mobs.forEach(mob => {
        const dist = mob.distanceTo(playerX, playerZ)
        if (dist <= 2.0 && mob.state.alive) {
          const dmg = 2 + Math.floor(Math.random() * 3) // base player damage
          mob.takeDamage(dmg)
          addCombatLog(`You hit ${mob.state.type} for ${dmg} damage!`)
        }
      })
    }

    // Rotation
    playerYaw += inp.rotate * 2 * dt
    player.mesh.rotation.y = playerYaw

    // Animation state
    if (inp.forward !== 0 || inp.right !== 0) {
      player.setAnimation('walk')
      player.animateWalk(time)
    } else {
      player.setAnimation('idle')
      player.resetAnimation()
    }

    // Update HUD
    updateHP(playerHP, playerMaxHP)
  }

  // Update mobs
  if (chaseAI) {
    const ai = chaseAI
    mobs.forEach(mob => {
      if (!mob.state.alive) return

      // Update AI
      const decision = ai.decide(mob, playerX, playerZ, dt)
      if (decision.action === 'chase') {
        mob.setPosition(decision.targetX, mob.position.y, decision.targetZ)
        mob.update(dt, playerX, playerZ)
      } else if (decision.action === 'attack') {
        mob.update(dt, playerX, playerZ)
      }

      // Check if mob attacks player
      const dist = mob.distanceTo(playerX, playerZ)
      if (dist <= 1.2 && mob.state.stats.damage > 0) {
        mob.state.stats.damage = 0 // One-shot per frame
        playerHP = Math.max(0, playerHP - mob.state.stats.damage)
        updateHP(playerHP, playerMaxHP)
        if (playerHP <= 0) {
          gameState = 'dead'
          deathScreen.style.display = 'flex'
          addCombatLog('💀 You have fallen!')
        }
      }
    })
  }

  // Update camera
  if (camera && player && renderer) {
    camera.update(renderer, player.position, playerYaw)
  }

  // Animate torch flicker
  if (renderer) {
    renderer.updateTorchFlicker(time)
  }

  // Render
  renderer?.render()
}

// --- Init ---
initTitleScreen()
initButtonHandlers()
initVolumeSliders()

// Export for testing
export { showScreen, gameState, currentScreen }
export { updateHP, updateFloor, updateDepth } from './app/uiHelpers'
export { playerHP, playerMaxHP, playerFloor }
export { combatLogEntries, mobs }
export { combatEngine, inventory, chaseAI }
