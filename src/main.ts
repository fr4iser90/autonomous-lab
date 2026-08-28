/**
 * Ashen Delve — Main entry point
 * M1-M12 + P2: Full game with Three.js, 16 mob kits + boss, combat, inventory, minimap, audio
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
import { Skeleton } from './entities/Skeleton'
import { Bat } from './entities/Bat'
import { Ogre } from './entities/Ogre'
import { Mummy } from './entities/Mummy'
import { Spider } from './entities/Spider'
import { Wolf } from './entities/Wolf'
import { Zombie } from './entities/Zombie'
import { Harpy } from './entities/Harpy'
import { Troll } from './entities/Troll'
import { Lich } from './entities/Lich'
import { Phantom } from './entities/Phantom'
import { Elemental } from './entities/Elemental'
import { Boss } from './entities/Boss'
import { ChaseAI } from './systems/ChaseAI'
import { CombatEngine } from './systems/CombatEngine'
import { Inventory } from './systems/Inventory'
import { AudioEngine } from './systems/AudioEngine'
import { Minimap } from './render/Minimap'
import type { MobKit } from './entities/MobKit'
import { getShopItemsForFloor, getShopItemById } from './data/shopItems'
import { Economy } from './systems/Economy'
import { SkillTree, getSkillsForFloor, getSkillDefById } from './systems/SkillTree'
import * as GL from './systems/GameLoop'

// DOM refs
const titleScreen = document.getElementById('title-screen')!
const gameScreen = document.getElementById('game-screen')!
const settingsPanel = document.getElementById('settings-panel')!
const hud = document.getElementById('hud')!
const inventoryPanel = document.getElementById('inventory-panel')!
const deathScreen = document.getElementById('death-screen')!
const pauseOverlay = document.getElementById('pause-overlay')!
const combatLog = document.getElementById('combat-log')!
const shopPanel = document.getElementById('shop-panel')!
const skillPanel = document.getElementById('skill-panel')!
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

// State
let currentScreen: 'title' | 'game' | 'settings' = 'title'
let gameState: 'menu' | 'playing' | 'paused' | 'dead' = 'menu'

// Three.js game objects
let renderer: GameRenderer | null = null
let player: PlayerKit | null = null
let camera: FollowCamera | null = null
let input: InputManager | null = null
let playerYaw = 0
let minimap: Minimap | null = null

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
let economy: Economy | null = null
let skillTree: SkillTree | null = null
let chaseAI: ChaseAI | null = null
let audio: AudioEngine | null = null

// --- Screen Management ---
function showScreen(screen: 'title' | 'game' | 'settings'): void {
  currentScreen = screen
  titleScreen.style.display = screen === 'title' ? 'flex' : 'none'
  gameScreen.style.display = screen === 'game' ? 'block' : 'none'
  settingsPanel.style.display = screen === 'settings' ? 'flex' : 'none'

  if (screen === 'game') {
    hud.style.display = 'flex'
  } else {
    hud.style.display = 'none'
    inventoryPanel.style.display = 'none'
    shopPanel.style.display = 'none'
    skillPanel.style.display = 'none'
    deathScreen.style.display = 'none'
    pauseOverlay.style.display = 'none'
    combatLog.style.display = 'none'
    if (GL.getAnimFrame()) cancelAnimationFrame(GL.getAnimFrame())
    if (audio) audio.stopAmbient()
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
  if (audio) audio.updateSettings({
    masterVolume: save.settings.masterVolume,
    sfxVolume: save.settings.sfxVolume,
    reduceMotion: save.settings.reduceMotion,
  })
}

// --- Keyboard Input ---
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (currentScreen === 'game' && gameState === 'playing' && input) {
    input.onKeyDown(e)
  }
  if (currentScreen === 'game') {
    if (gameState === 'playing') {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        gameState = 'paused'
        pauseOverlay.style.display = 'flex'
      } else if (e.key === 'e' || e.key === 'E') {
        if (inventoryPanel.style.display === 'none') {
          inventoryPanel.style.display = 'block'
          shopPanel.style.display = 'none'
          updateInventoryUI()
        } else {
          inventoryPanel.style.display = 'none'
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        if (shopPanel.style.display === 'none') {
          shopPanel.style.display = 'block'
          inventoryPanel.style.display = 'none'
          skillPanel.style.display = 'none'
          updateShopUI()
        } else {
          shopPanel.style.display = 'none'
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (skillPanel.style.display === 'none') {
          skillPanel.style.display = 'block'
          inventoryPanel.style.display = 'none'
          shopPanel.style.display = 'none'
          updateSkillUI()
        } else {
          skillPanel.style.display = 'none'
        }
      }
    } else if (gameState === 'paused') {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        gameState = 'playing'
        pauseOverlay.style.display = 'none'
      }
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
  if (audio && !audio['enabled']) audio.init()
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
  const shopToggle = document.getElementById('shop-toggle')
  const skillToggle = document.getElementById('skill-toggle')

  if (btnNew) btnNew.addEventListener('click', startNewGame)
  if (btnContinue) btnContinue.addEventListener('click', startContinueGame)
  if (btnSettings) btnSettings.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  if (btnSettingsBack) btnSettingsBack.addEventListener('click', () => { applySettingsFromUI(); showScreen('title') })
  if (btnRetry) btnRetry.addEventListener('click', () => { deathScreen.style.display = 'none'; gameState = 'playing'; playerHP = 20; playerMaxHP = 20; playerFloor = 1; if (player) player.scrap = 0; updateHP(playerHP, playerMaxHP); if (economy) economy.reset(); if (skillTree) skillTree.reset(); GL.setBaseHP(20); updateScrapUI() })
  if (btnTitle) btnTitle.addEventListener('click', () => { deathScreen.style.display = 'none'; showScreen('title'); gameState = 'menu' })
  if (btnResume) btnResume.addEventListener('click', () => { gameState = 'playing'; pauseOverlay.style.display = 'none' })
  if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  if (btnPauseTitle) btnPauseTitle.addEventListener('click', () => { pauseOverlay.style.display = 'none'; showScreen('title'); gameState = 'menu' })
  if (shopToggle) shopToggle.addEventListener('click', () => {
    if (gameState === 'playing') {
      shopPanel.style.display = shopPanel.style.display === 'block' ? 'none' : 'block'
      inventoryPanel.style.display = 'none'
      skillPanel.style.display = 'none'
      if (shopPanel.style.display === 'block') updateShopUI()
    }
  })
  if (skillToggle) skillToggle.addEventListener('click', () => {
    if (gameState === 'playing') {
      skillPanel.style.display = skillPanel.style.display === 'block' ? 'none' : 'block'
      inventoryPanel.style.display = 'none'
      shopPanel.style.display = 'none'
      if (skillPanel.style.display === 'block') updateSkillUI()
    }
  })
}

// Volume sliders
function initVolumeSliders(): void {
  const volMaster = document.getElementById('vol-master') as HTMLInputElement
  const volSfx = document.getElementById('vol-sfx') as HTMLInputElement
  if (volMaster) volMaster.addEventListener('input', () => {
    document.getElementById('vol-master-val')!.textContent = volMaster.value + '%'
  })
  if (volSfx) volSfx.addEventListener('input', () => {
    document.getElementById('vol-sfx-val')!.textContent = volSfx.value + '%'
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

// --- Scrap UI ---
function updateScrapUI(): void {
  const scrapLabel = document.getElementById('scrap-label')!
  if (scrapLabel) scrapLabel.textContent = `Scrap: ${player?.scrap ?? 0}`
}

// --- Shop UI ---
function updateShopUI(): void {
  if (!economy || !player) return
  const grid = document.getElementById('shop-grid')!
  const items = getShopItemsForFloor(playerFloor)
  grid.innerHTML = items.map(item => {
    const canAfford = economy!.scrap >= item.cost
    return `<div class="inv-slot shop-item ${canAfford ? '' : 'cant-afford'}" data-id="${item.id}">
      <span class="item-icon">${item.icon}</span>
      <span class="item-name">${item.name}</span>
      <span class="item-cost">${item.cost} scrap</span>
    </div>`
  }).join('')
  grid.querySelectorAll('.shop-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id
      const item = getShopItemById(id ?? '')
      if (!item) return
      const success = economy?.purchase(item)
      if (success) {
        addCombatLog(`🛒 Bought ${item.name} for ${item.cost} scrap`)
        updateShopUI()
        updateScrapUI()
      } else {
        addCombatLog('❌ Not enough scrap!')
      }
    })
  })
}

// --- Skill UI ---
function updateSkillUI(): void {
  if (!skillTree || !economy) return
  const grid = document.getElementById('skill-grid')!
  const skills = getSkillsForFloor(playerFloor)
  const st = skillTree
  grid.innerHTML = skills.map(sk => {
    const acquired = st.has(sk.id)
    const canAfford = economy!.scrap >= sk.cost
    return `<div class="inv-slot skill-item ${acquired ? 'skill-acquired' : canAfford ? '' : 'cant-afford'}" data-id="${sk.id}">
      <span class="item-icon">${sk.icon}</span>
      <span class="item-name">${sk.name}</span>
      <span class="item-desc">${sk.description}</span>
      <span class="item-cost">${acquired ? '✅ Owned' : sk.cost + ' scrap'}</span>
    </div>`
  }).join('')
  grid.querySelectorAll('.skill-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id
      const sk = getSkillDefById(id ?? '')
      if (!sk || st.has(sk.id)) return
      const success = economy?.purchase(sk)
      if (success) {
        st.recordAcquisition(sk.id)
        GL.setBaseHP(20 + st.getActiveEffects().hpBonus)
        addCombatLog(`✨ Learned ${sk.name}!`)
        updateSkillUI()
        updateScrapUI()
      } else {
        addCombatLog('❌ Not enough scrap!')
      }
    })
  })
}

// --- Combat UI ---
function addCombatLog(message: string): void {
  combatLogEntries.push(message)
  if (combatLogEntries.length > 10) combatLogEntries.shift()
  combatLog.innerHTML = combatLogEntries.map(e => `<div class="log-entry">${e}</div>`).join('')
  combatLog.style.display = 'block'
  clearTimeout((combatLog as any)._hideTimer)
  ;(combatLog as any)._hideTimer = setTimeout(() => { combatLog.style.display = 'none' }, 5000)
}

// --- Game Start ---
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

  const save = loadSave()
  audio = new AudioEngine(save.settings)
  combatEngine = new CombatEngine()
  inventory = new Inventory()
  economy = new Economy()
  skillTree = new SkillTree()
  chaseAI = new ChaseAI({ aggroRange: 8, retreatRange: 15, attackRange: 1.2, attackCooldown: 1.0, moveSpeed: 2.5 })

  initThreeScene(seed)
}

function initThreeScene(seed: number): void {
  const w = window.innerWidth
  const h = window.innerHeight

  renderer = new GameRenderer({
    canvas, width: w, height: h, bgColor: '#0a0a0e', fogColor: '#0a0a0e',
    floorColor: '#2a2520', wallColor: '#1a1815', wallHighlightColor: '#3a3530', torchEmissive: '#ff9944',
  })
  camera = new FollowCamera({ distance: 10, height: 7, FOV: 55, followLag: 0.08 })
  input = new InputManager()

  const theme = getThemeForFloor(1)
  const dungeon = generateDungeon(seed, 1, theme)
  buildScene(renderer, dungeon)

  // Spawn mobs
  const mobKinds = [
    () => new Goblin(renderer!), () => new Shade(renderer!), () => new Stalker(renderer!),
    () => new Skeleton(renderer!), () => new Bat(renderer!), () => new Ogre(renderer!),
    () => new Mummy(renderer!), () => new Spider(renderer!), () => new Wolf(renderer!),
    () => new Zombie(renderer!), () => new Harpy(renderer!), () => new Troll(renderer!),
    () => new Lich(renderer!), () => new Phantom(renderer!), () => new Elemental(renderer!),
  ]
  for (let i = 1; i < dungeon.rooms.length; i++) {
    const room = dungeon.rooms[i]
    const mob = mobKinds[i % mobKinds.length]()
    mob.setPosition(room.cx - dungeon.width / 2 + (Math.random() - 0.5) * 2, 0, room.cy - dungeon.height / 2 + (Math.random() - 0.5) * 2)
    mobs.push(mob)
  }

  // Boss room
  if (playerFloor >= 4 && dungeon.rooms.length > 2) {
    const bossRoom = dungeon.rooms[dungeon.rooms.length - 1]
    const boss = new Boss(renderer!)
    boss.setPosition(bossRoom.cx - dungeon.width / 2, 0, bossRoom.cy - dungeon.height / 2)
    mobs.push(boss)
  }

  // Player
  player = new PlayerKit(renderer!)
  playerX = dungeon.spawnX - dungeon.width / 2
  playerZ = dungeon.spawnY - dungeon.height / 2
  player.setPosition(playerX, 0, playerZ)
  playerYaw = 0
  minimap = new Minimap(dungeon)

  if (audio && !audio['enabled']) { audio.init(); audio.startAmbient() }
  window.addEventListener('resize', () => { if (renderer) renderer.resize(window.innerWidth, window.innerHeight) })

  // Initialize game loop module
  GL.initGameLoop(deathScreen, combatLog)
  GL.setRuntimeState(currentScreen, gameState, renderer, player, camera, input, minimap, chaseAI, audio)
  GL.setSkillTree(skillTree)
  GL.updateGameVars(playerHP, playerMaxHP, playerX, playerZ, playerYaw, playerFloor, mobs, combatLogEntries)
  GL.resetGameTime()

  // Start render loop
  gameLoop()
}

function gameLoop(timestamp = 0): void {
  GL.updateGameVars(playerHP, playerMaxHP, playerX, playerZ, playerYaw, playerFloor, mobs, combatLogEntries)
  const frame = GL.gameLoop(timestamp)

  // Sync mutable state back
  playerHP = GL.getPlayerHP()
  playerMaxHP = GL.getPlayerMaxHP()
  playerX = GL.getPlayerX()
  playerZ = GL.getPlayerZ()
  playerYaw = GL.getPlayerYaw()
  playerFloor = GL.getPlayerFloor()
  combatLogEntries = GL.getGameLog()
  mobs = GL.getMobs()

  // Update scrap UI
  updateScrapUI()

  // Check player death
  GL.checkPlayerDeath(updateHP, addCombatLog, player?.scrap ?? 0)

  // Restart loop if still alive
  if (gameState === 'playing' && frame) {
    requestAnimationFrame(gameLoop)
  }
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
export { combatEngine, inventory, chaseAI, economy, skillTree }
export { audio }
