/** UI helpers, event handlers, and button wiring for Ashen Delve */
import * as THREE from 'three'
import type { Inventory } from '../systems/Inventory'
import type { Economy } from '../systems/Economy'
import type { SkillTree } from '../systems/SkillTree'
import type { MobKit } from '../entities/MobKit'
import type { GameRenderer } from '../render/GameRenderer'
import { AudioEngine, AMBIENT_TRACKS } from '../systems/AudioEngine'
import type { ChaseAI } from '../systems/ChaseAI'
import type { LootDropManager } from '../systems/LootDrop'
import type { DungeonData } from '../systems/DungeonPCG'
import type { FloorTheme } from '../data/floors'
import type { TrapType } from '../data/traps'
import type { ShrineType } from '../data/shrines'
import type { ItemRarity, ItemDef } from '../data/items'
import type { TutorialState } from '../systems/TutorialMode'
import type { InputManager } from '../systems/input'
import { Minimap } from '../render/Minimap'
import { CombatEngine } from '../systems/CombatEngine'
import * as RunTracker from '../systems/RunTracker'
import * as GL from '../systems/GameLoop'
import { loadSave, saveSave } from '../services/SaveService'
import { updateHP, updateFloor, updateDepth, updateStealth, updateTrapHit, updateStatusEffects } from './uiHelpers'
export { updateHP, updateFloor, updateDepth, updateStatusEffects } from './uiHelpers'
import { getThemeForFloor } from '../data/floors'
import { ChaseAI as ChaseAICls } from '../systems/ChaseAI'
import { Inventory as InvCls } from '../systems/Inventory'
import { Economy as EcoCls } from '../systems/Economy'
import { SkillTree as STCls } from '../systems/SkillTree'
import { LootDropManager as LDMCls } from '../systems/LootDrop'
import { InputManager as IMCls } from '../systems/input'
import { HitEffects } from '../systems/HitEffects'
import { ScreenShake } from '../systems/ScreenShake'
import { showToast } from '../systems/ToastSystem'
import { GameRenderer as GRCls } from '../render/GameRenderer'
import { FollowCamera, FirstPersonCamera, type CameraMode } from '../render/camera'
import { PlayerKit } from '../kits/playerKit'
import { generateDungeon, buildScene, isOnStealthTile } from '../systems/DungeonPCG'
import { spawnMobs, spawnBoss, showFloorToast, advanceToFloor } from '../systems/Transition'
import type { TransitionDeps } from '../systems/Transition'
import { getShopItemsForFloor, shopIdToItemId } from '../data/shopItems'
import { getItemById } from '../data/items'
import { getSkillsForFloor, getSkillDefById } from '../systems/SkillTree'
import { TutorialDummyMob } from '../entities/MobKit'
import * as TutorialMode from '../systems/TutorialMode'

// DOM elements (same as main.ts)
const titleScreen = document.getElementById('title-screen')!
const gameScreen = document.getElementById('game-screen')!
const settingsPanel = document.getElementById('settings-panel')!
const hud = document.getElementById('hud')!
const inventoryPanel = document.getElementById('inventory-panel')!
const deathScreen = document.getElementById('death-screen')!
const pauseOverlay = document.getElementById('pause-overlay')!
const combatLog = document.getElementById('combat-log')!
const shrinePrompt = document.getElementById('shrine-prompt')!
const shopPanel = document.getElementById('shop-panel')!
const skillPanel = document.getElementById('skill-panel')!
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const quickUseBar = document.getElementById('quick-use-bar')!

// Quick-Use Hotbar (P9-2)
const _QMAX = 4
export function updateQuickUseBar(): void {
  if (!inventory || !quickUseBar) return
  const inv = inventory, slots = inv.getSlots()
  const cs = slots.filter(s => s.item.type === 'potion' || s.item.type === 'key').slice(0, _QMAX)
  quickUseBar.style.display = cs.length ? 'flex' : 'none'
  cs.forEach((slot, i) => {
    const el = quickUseBar.children[i] as HTMLElement
    if (!el) return
    const cd = inv.isOnCooldown(slot.item.id)
    el.classList.toggle('cooldown', cd)
    el.querySelector('.slot-icon')!.textContent = slot.item.icon
    el.querySelector('.slot-count')!.textContent = slot.item.type === 'key' ? String(inv.getKeyCount()) : '×1'
    el.title = slot.item.name + (cd ? ' (cd)' : '')
  })
  for (let i = cs.length; i < _QMAX; i++) {
    const el = quickUseBar.children[i] as HTMLElement
    if (el) el.classList.add('cooldown')
  }
}
export function handleQuickUse(si: number): void {
  if (!inventory) return
  const cs = inventory.getSlots().filter(s => s.item.type === 'potion' || s.item.type === 'key')
  const item = cs[si]
  if (!item) return
  if (item.item.type === 'potion') {
    const heal = inventory.tryQuickUsePotion(item.item.id)
    if (heal > 0 && playerHP !== undefined) {
      playerHP = Math.min(playerMaxHP, playerHP + heal)
      updateHP(playerHP, playerMaxHP)
      showToast(`🧪 +${heal} HP`, { type: 'heal', className: 'toast-success' })
    }
  } else if (item.item.type === 'key' && inventory.tryQuickUseKey()) {
    updateKeyCountUI()
    showToast('🔑 Key used', { type: 'info', className: 'toast-info' })
  }
}

// ── Shared mutable state — set by main.ts
export let gameState: 'menu' | 'playing' | 'paused' | 'dead' = 'menu'
export let currentScreen: 'title' | 'game' | 'settings' = 'title'
export let playerHP = 20, playerMaxHP = 20, playerFloor = 1
export let playerX = 0, playerZ = 0, playerYaw = 0, dungeonSeed = 0
export let minimap: Minimap | null = null
export let player: PlayerKit | null = null
export let renderer: GameRenderer | null = null
export let camera: FollowCamera | FirstPersonCamera | null = null
export let input: InputManager | null = null
export let mobs: MobKit[] = [], combatLogEntries: string[] = []
export let currentDungeon: DungeonData | null = null
export let combatEngine: CombatEngine | null = null
export let inventory: Inventory | null = null
export let economy: Economy | null = null
export let skillTree: SkillTree | null = null
export let chaseAI: ChaseAI | null = null, audio: AudioEngine | null = null, lootManager: LootDropManager | null = null
import { createTutorialState } from '../systems/TutorialMode'

// Module-level tutorial state — created once, mutated in place
export const tutorialState: TutorialState = createTutorialState()
export let tutorialDummyMesh: THREE.Object3D | null = null
export let tutorialStairsZ = 0
export let playerLastX = 0, playerLastZ = 0, playerLastYaw = 0

/** Factory: create FollowCamera or FirstPersonCamera based on mode. */
function _createCamera(mode: CameraMode): FollowCamera | FirstPersonCamera {
  return mode === 'first-person'
    ? new FirstPersonCamera({ FOV: 75, eyeHeight: 1.6 })
    : new FollowCamera({ distance: 12, height: 5, FOV: 55, followLag: 0.10 })
}
/** Apply camera mode change to the running game (called from Settings). */
function _applyCameraMode(mode: CameraMode): void {
  if (!renderer || !input) return
  camera?.reset()
  camera = _createCamera(mode)
  camera.syncYaw(playerYaw)
  if (mode === 'first-person') input.setPointerLock(canvas)
}

export function showScreen(screen: 'title' | 'game' | 'settings'): void {
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
// ── UI helpers ──────────────────────────────────────────
export function rarityClass(rarity: ItemRarity): string { return `rarity-${rarity}` }
export function rarityLabel(rarity: ItemRarity): string { return rarity.charAt(0).toUpperCase() + rarity.slice(1) }
export function showLootToast(item: ItemDef): void {
  const rarityClass = `rarity-${item.rarity}`
  showToast(`${item.icon} ${item.name}`, { type: 'loot', duration: 2500, className: rarityClass })
}
export function showDoorToast(msg: string): void {
  showToast(msg, { type: 'door', duration: 2000 })
}

export function updateInventoryUI(): void {
  if (!inventory) return
  const slotEls = inventoryPanel.querySelectorAll('.slot')
  const slots = inventory.getSlots()
  slotEls.forEach((el, i) => {
    if (i < slots.length) {
      const slot = slots[i]
      const equipped = slot.equipped ? ' [E]' : ''
      const label = slot.item.type === 'potion' ? '[U]se' : slot.equipped ? '[U]nequip' : '[E]quip'
      ;(el as HTMLElement).innerHTML = `<span class="item-icon">${slot.item.icon}</span><span class="item-name">${slot.item.name}</span>${equipped}<br><span class="item-rarity-label">${rarityLabel(slot.item.rarity)}</span><br><span class="item-action" data-id="${slot.item.id}">${label}</span>`
      ;(el as HTMLElement).className = `slot has-item ${rarityClass(slot.item.rarity)}`
      const actionEl = (el as HTMLElement).querySelector('.item-action')
      if (actionEl) actionEl.addEventListener('click', () => handleItemAction(slot))
    } else {
      ;(el as HTMLElement).innerHTML = ''; (el as HTMLElement).className = 'slot'
    }
  })
}

export function handleItemAction(slot: { item: ItemDef; equipped: boolean }): void {
  if (!inventory) return
  if (slot.item.type === 'potion') {
    const heal = inventory.usePotion(slot.item)
    if (heal > 0) {
      GL.healPlayer(heal, playerMaxHP)
      playerHP = Math.min(playerMaxHP, playerHP + heal)
      addCombatLog(`🧪 Used ${slot.item.name}! +${heal} HP`)
    }
  } else {
    const bonus = inventory.equip(slot.item)
    addCombatLog(`${slot.equipped ? 'Unequipped' : 'Equipped'} ${slot.item.name}${bonus > 0 ? ` (+${bonus} HP)` : ''}`)
  }
  updateInventoryUI()
  updateHP(playerHP, playerMaxHP)
}
export function updateScrapUI(): void {
  const el = document.getElementById('scrap-label')
  if (el) el.textContent = `Scrap: ${player?.scrap ?? 0}`
}

export function updateKeyCountUI(): void {
  const el = document.getElementById('key-count-label')
  if (!el) return
  if (!inventory) { el.textContent = '🔑 0'; return }
  el.textContent = `🔑 ${inventory.getKeyCount()}`
}

/** P12: Update trophy counter in HUD */
export function updateTrophyUI(): void { const el = document.getElementById('trophy-label'); if (el) el.textContent = `👑 ${RunTracker.getBossKills()}` }
// ── P10-1: Jukebox (ambient track cycling) ──
/** Update HUD jukebox label */
export function updateJukeboxUI(): void {
  const el = document.getElementById('jukebox-label')
  if (!el || !audio) return
  const track = AMBIENT_TRACKS[audio.currentAmbientTrack]
  el.textContent = `🎵 ${track.name}`
}

/** P10-1: Cycle ambient track + persist + update HUD */
export function cycleAmbientTrack(): void {
  if (!audio) return
  const name = audio.cycleAmbientTrack()
  if (name) showToast(`🎵 ${name}`, { type: 'toast-info', duration: 1500 })
  const save = loadSave(); save.settings.ambientTrack = audio.currentAmbientTrack; saveSave(save)
  updateJukeboxUI()
}
/** P10-1: Initialize ambient audio with saved track */
function initAmbientAudio(save: ReturnType<typeof loadSave>): void {
  if (!audio || (audio as any)['enabled']) return
  audio.init()
  audio.currentAmbientTrack = save.settings.ambientTrack ?? 0
  audio.startAmbient(audio.currentAmbientTrack)
  updateJukeboxUI()
}
export function updateShopUI(): void {
  if (!economy || !player) return
  const grid = document.getElementById('shop-grid')!
  const ec = economy, inv = inventory
  getShopItemsForFloor(playerFloor).forEach(shopItem => {
    const canAfford = ec.scrap >= shopItem.cost
    const invItem = getItemById(shopIdToItemId(shopItem.id) ?? '')
    const rarity = invItem?.rarity ?? 'common'
    const el = document.createElement('div')
    el.className = `inv-slot shop-item ${rarityClass(rarity)} ${canAfford ? '' : 'cant-afford'}`
    el.dataset.id = shopItem.id
    el.innerHTML = `<span class="item-icon">${shopItem.icon}</span><span class="item-name">${shopItem.name}</span><span class="item-rarity-label">${rarityLabel(rarity)}</span><span class="item-cost">${shopItem.cost} scrap</span>`
    el.addEventListener('click', () => {
      if (!ec.purchase(shopItem)) return addCombatLog('❌ Not enough scrap!')
      addCombatLog(`🛒 Bought ${shopItem.name} for ${shopItem.cost} scrap`)
      const itemId = shopIdToItemId(shopItem.id), invItem2 = itemId ? getItemById(itemId) : null
      if (invItem2 && inv?.addItem(invItem2)) {
        addCombatLog(`  → Added ${invItem2.name} to inventory`)
        showLootToast(invItem2)
      }
      if (invItem2?.id === 'dungeon-key' && inv?.addKeys) { inv.addKeys(1); updateKeyCountUI() }
      updateShopUI(); updateScrapUI()
    })
    grid.appendChild(el)
  })
}

export function updateSkillUI(): void {
  if (!skillTree || !economy) return
  const grid = document.getElementById('skill-grid')!, st = skillTree, ec = economy
  getSkillsForFloor(playerFloor).forEach(sk => {
    const acquired = st.has(sk.id), canAfford = ec.scrap >= sk.cost
    const el = document.createElement('div')
    el.className = `inv-slot skill-item ${acquired ? 'skill-acquired' : canAfford ? '' : 'cant-afford'}`
    el.dataset.id = sk.id
    el.innerHTML = `<span class="item-icon">${sk.icon}</span><span class="item-name">${sk.name}</span><span class="item-desc">${sk.description}</span><span class="item-cost">${acquired ? '✅ Owned' : sk.cost + ' scrap'}</span>`
    el.addEventListener('click', () => {
      if (acquired || !canAfford) return
      const def = getSkillDefById(sk.id)
      if (!def) return addCombatLog('❌ Unknown skill!')
      if (ec.purchase(def) && st.recordAcquisition(def.id)) {
        GL.setBaseHP(20 + st.getActiveEffects().hpBonus)
        addCombatLog(`✨ Learned ${def.name}!`); updateSkillUI(); updateScrapUI()
      } else { addCombatLog('❌ Not enough scrap!') }
    })
    grid.appendChild(el)
  })
}
let _combatLogHideTimer: ReturnType<typeof setTimeout> | undefined = undefined
export function addCombatLog(message: string): void {
  combatLogEntries.push(message)
  if (combatLogEntries.length > 10) combatLogEntries.shift()
  combatLog.innerHTML = combatLogEntries.map(e => `<div class="log-entry">${e}</div>`).join('')
  combatLog.style.display = 'block'
  clearTimeout(_combatLogHideTimer)
  _combatLogHideTimer = setTimeout(() => { combatLog.style.display = 'none' }, 5000)
}
// ── Settings helpers ────────────────────────────────────
export function loadSettingsIntoUI(): void {
  const save = loadSave()
  const vm = document.getElementById('vol-master') as HTMLInputElement
  const vs = document.getElementById('vol-sfx') as HTMLInputElement
  const rm = document.getElementById('reduce-motion') as HTMLInputElement
  const cm = document.getElementById('camera-mode') as HTMLSelectElement
  const vmv = document.getElementById('vol-master-val')!
  const vsv = document.getElementById('vol-sfx-val')!
  if (vm) vm.value = String(save.settings.masterVolume)
  if (vs) vs.value = String(save.settings.sfxVolume)
  if (rm) rm.checked = save.settings.reduceMotion
  if (cm) cm.value = save.settings.cameraMode ?? 'first-person'
  if (vmv) vmv.textContent = save.settings.masterVolume + '%'
  if (vsv) vsv.textContent = save.settings.sfxVolume + '%'
}

export function applySettingsFromUI(): void {
  const save = loadSave()
  const vm = document.getElementById('vol-master') as HTMLInputElement
  const vs = document.getElementById('vol-sfx') as HTMLInputElement
  const rm = document.getElementById('reduce-motion') as HTMLInputElement
  const cm = document.getElementById('camera-mode') as HTMLSelectElement
  if (vm) save.settings.masterVolume = parseInt(vm.value, 10)
  if (vs) save.settings.sfxVolume = parseInt(vs.value, 10)
  if (rm) save.settings.reduceMotion = rm.checked
  if (cm) save.settings.cameraMode = cm.value as 'first-person' | 'third-person'
  saveSave(save)
  if (audio) audio.updateSettings({
    masterVolume: save.settings.masterVolume,
    sfxVolume: save.settings.sfxVolume,
    reduceMotion: save.settings.reduceMotion,
  })
}
// ── Button handlers ─────────────────────────────────────
export function initButtonHandlers(startGameFn: (seed: number) => void, startTutorialFn: (seed: number) => void): void {
  const $ = (id: string) => document.getElementById(id)
  const seed = () => { dungeonSeed = Date.now() % 100000; return dungeonSeed }
  $('btn-tutorial')?.addEventListener('click', () => { seed(); startTutorialFn(dungeonSeed) })
  $('btn-new')?.addEventListener('click', () => { seed(); startGameFn(dungeonSeed) })
  $('btn-continue')?.addEventListener('click', () => startGameFn(dungeonSeed || 12345))
  $('btn-settings')?.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  $('btn-settings-back')?.addEventListener('click', () => {
    applySettingsFromUI()
    // Apply camera mode change mid-run if in game
    if (gameState === 'playing') {
      const save = loadSave()
      _applyCameraMode(save.settings.cameraMode ?? 'first-person')
    }
    showScreen(gameState === 'menu' || gameState === 'dead' ? 'title' : 'game')
  })
  $('btn-retry')?.addEventListener('click', () => {
    deathScreen.style.display = 'none'; gameState = 'playing'; playerHP = playerMaxHP = 20; playerFloor = 1
    if (player) player.scrap = 0
    updateHP(playerHP, playerMaxHP); economy?.reset(); skillTree?.reset(); GL.setBaseHP(20); GL.resetTickCount(); updateScrapUI()
  })
  $('btn-title')?.addEventListener('click', () => { deathScreen.style.display = 'none'; showScreen('title'); gameState = 'menu' })
  $('btn-resume')?.addEventListener('click', () => { gameState = 'playing'; pauseOverlay.style.display = 'none' })
  $('btn-pause-settings')?.addEventListener('click', () => { loadSettingsIntoUI(); showScreen('settings') })
  $('btn-pause-title')?.addEventListener('click', () => { pauseOverlay.style.display = 'none'; showScreen('title'); gameState = 'menu' })
  $('shop-toggle')?.addEventListener('click', () => {
    if (gameState !== 'playing') return
    const open = shopPanel.style.display !== 'block'
    shopPanel.style.display = open ? 'block' : 'none'
    inventoryPanel.style.display = 'none'; skillPanel.style.display = 'none'
    if (open) updateShopUI()
  })
  $('skill-toggle')?.addEventListener('click', () => {
    if (gameState !== 'playing') return
    const open = skillPanel.style.display !== 'block'
    skillPanel.style.display = open ? 'block' : 'none'
    inventoryPanel.style.display = 'none'; shopPanel.style.display = 'none'
    if (open) updateSkillUI()
  })
}

// ── Title screen ────────────────────────────────────────

export function initTitleScreen(): void {
  const save = loadSave()
  document.getElementById('btn-continue')!.style.display = save.meta.highFloorCleared > 0 ? 'block' : 'none'
  showScreen('title')
}
// ── Event listeners ─────────────────────────────────────
let mouseDownPos = { x: 0, y: 0 }
export function initEventListeners(_startGameFn: (seed: number) => void): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (currentScreen === 'game' && gameState === 'playing' && input) {
      input.onKeyDown(e)
    }
    if (currentScreen === 'game' && tutorialState?.active) {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault()
        if (tutorialState && TutorialMode.isTutorialComplete(tutorialState)) {
          TutorialMode.completeTutorial()
          if (gameState === 'playing') transitionFromTutorial()
        } else {
          tutorialState.active = false
          addCombatLog('⏭️ Tutorial skipped')
        }
        return
      }
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        TutorialMode.markMoved(tutorialState!, playerX, playerZ, playerLastX, playerLastZ)
      }
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
            if (tutorialState) TutorialMode.markInventoryOpened(tutorialState)
          } else {
            inventoryPanel.style.display = 'none'
          }
        } else if (e.key === 'o' || e.key === 'O') {
          if (shopPanel.style.display === 'none') {
            shopPanel.style.display = 'block'
            inventoryPanel.style.display = 'none'
            skillPanel.style.display = 'none'
            updateShopUI()
          } else {
            shopPanel.style.display = 'none'
          }
        } else if (e.key === 't' || e.key === 'T') {
          if (skillPanel.style.display === 'none') {
            skillPanel.style.display = 'block'
            inventoryPanel.style.display = 'none'
            shopPanel.style.display = 'none'
            updateSkillUI()
          } else {
            skillPanel.style.display = 'none'
          }
        } else if (e.key === 'r' || e.key === 'R') {
          // Shrine activation
          e.preventDefault()
          if (gameState === 'playing') {
            GL.requestShrineActivate()
          }
        } else if (e.key === 'j' || e.key === 'J') {
          e.preventDefault()
          if (gameState === 'playing') cycleAmbientTrack()
        } else {
          // P9-2: Quick-use hotbar (1-4)
          const num = parseInt(e.key, 10)
          if (num >= 1 && num <= 4) {
            e.preventDefault()
            handleQuickUse(num - 1)
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
  document.addEventListener('keyup', (e) => { if (input) input.onKeyUp(e) })
  canvas.addEventListener('mousedown', (e) => {
    if (input) input.onMouseDown()
    if (camera) camera.onPointerDown(e.clientX, e.clientY)
    if (audio && !(audio as any)['enabled']) audio.init()
  })
  canvas.addEventListener('mouseup', () => {
    if (input) input.onMouseUp()
    if (camera) camera.onPointerUp()
  })
  canvas.addEventListener('mousemove', (e) => {
    // Pointer-lock mouse-look (FP mode): deltas fed to InputManager,
    // then GameLoop applies yaw to player and pitch to camera
    if (document.pointerLockElement === canvas && camera instanceof FirstPersonCamera) {
      const sens = loadSave().settings.cameraSensitivity ?? 50
      if (input) input.onPointerLockMove(e.movementX, e.movementY, sens)
    } else {
      const dx = e.clientX - mouseDownPos.x
      if (input) input.onMouseMove(dx, 0)
      if (camera) camera.onPointerMove(e.clientX, e.clientY)
      mouseDownPos = { x: e.clientX, y: e.clientY }
    }
  })
  // P9-2: Hotbar slot click handlers (event delegation)
  quickUseBar.addEventListener('click', (e) => {
    const el = e.target as Element | null
    const slot = el?.closest('.quick-use-slot') as HTMLElement | null
    if (slot) handleQuickUse(+slot.dataset.slot!)
  })
}
// ── Start game ──────────────────────────────────────────
export function startGame(seed: number): void {
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
  inventory = new InvCls()
  economy = new EcoCls()
  skillTree = new STCls()
  chaseAI = new ChaseAICls({ aggroRange: 8, retreatRange: 15, attackRange: 1.2, attackCooldown: 1.0, moveSpeed: 2.5, stealthMultiplier: 0.35 })
  const w = window.innerWidth, h = window.innerHeight
  renderer = new GRCls({
    canvas, width: w, height: h, bgColor: '#0a0a0e', fogColor: '#0a0a0e',
    floorColor: '#2a2520', wallColor: '#1a1815', wallHighlightColor: '#3a3530', torchEmissive: '#ff9944',
  })
  // Mode-dependent camera: first-person by default (SaveService default)
  camera = _createCamera(save.settings.cameraMode ?? 'first-person')
  lootManager = new LDMCls(renderer!, (item) => inventory!.addItem(item), addCombatLog)
  input = new IMCls()
  camera?.syncYaw(playerYaw)
  const theme = getThemeForFloor(1)
  const dungeon = generateDungeon(seed, 1, theme)
  currentDungeon = dungeon
  buildScene(renderer, dungeon)
  spawnMobs(renderer, dungeon, mobs)
  spawnBoss(renderer!, playerFloor, dungeon, mobs)
  player = new PlayerKit(renderer!)
  playerX = dungeon.spawnX - dungeon.width / 2
  playerZ = dungeon.spawnY - dungeon.height / 2
  player.setPosition(playerX, 0, playerZ)
  playerYaw = 0
  minimap = new Minimap(dungeon)
  initAmbientAudio(save)
  window.addEventListener('resize', () => { if (renderer) renderer.resize(window.innerWidth, window.innerHeight) })
  // P8-1: Init hit effects & screen shake
  const hitEffects = new HitEffects()
  const screenShake = new ScreenShake()
  GL.setHitEffects(hitEffects)
  GL.setScreenShake(screenShake)
  GL.initGameLoop(deathScreen, combatLog)
  GL.setRuntimeState(currentScreen, gameState, renderer, player, camera, input, minimap, chaseAI, audio)
  GL.setSkillTree(skillTree)
  GL.setInventory(inventory)
  GL.setDungeonData(dungeon)
  GL.setDoorOpenedCallback(showDoorToast)
  GL.setFloorAdvancedCallback((floor: number) => {
    showFloorToast(floor, addCombatLog)
    if (!renderer || !player) return
    RunTracker.recordFloor(floor)
    const deps: TransitionDeps = { renderer, player, dungeonSeed, playerHP, playerMaxHP, playerX, playerZ, playerFloor, mobs, combatLogEntries, minimap: minimap || null }
    advanceToFloor(floor, deps)
  })
  GL.setLootSpawn((_mobType: string, x: number, z: number, item: ItemDef) => {
    if (lootManager) lootManager.spawn(item, x, z)
  })
  GL.setShrineProximityCallback((_shrineType: string) => {
    shrinePrompt.style.display = 'block'
    shrinePrompt.textContent = `✨ Shrine — Press [R]`
  })
  GL.setShrineActivatedCallback((msg: string) => {
    addCombatLog(msg)
    shrinePrompt.style.display = 'none'
    if (audio) audio.hit()
  })
  // P9-2: Quick-use hotbar
  GL.setQuickUseUpdate(() => updateQuickUseBar())
  GL.updateGameVars(playerHP, playerMaxHP, playerX, playerZ, playerYaw, playerFloor, mobs, combatLogEntries)
  GL.resetGameTime()
  // Start render loop
  gameLoop()
  // P9-1: Start run tracking
  RunTracker.startRun()
}
// ── Tutorial functions ──────────────────────────────────
export function startTutorialGame(seed: number): void {
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
  inventory = new InvCls()
  inventory.addItem({ id: 'iron-axe', name: 'Iron Axe', type: 'weapon', description: 'A sturdy axe for chipping through ash-stone.', value: 5, icon: '🪓', rarity: 'common' })
  economy = new EcoCls()
  skillTree = new STCls()
  chaseAI = new ChaseAICls({ aggroRange: 8, retreatRange: 15, attackRange: 1.2, attackCooldown: 1.0, moveSpeed: 2.5, stealthMultiplier: 0.35 })
  const w = window.innerWidth, h = window.innerHeight
  renderer = new GRCls({
    canvas, width: w, height: h, bgColor: '#0a0a0e', fogColor: '#0a0a0e',
    floorColor: '#2a2520', wallColor: '#1a1815', wallHighlightColor: '#3a3530', torchEmissive: '#ff9944',
  })
  // Mode-dependent camera: first-person by default (SaveService default)
  camera = _createCamera(save.settings.cameraMode ?? 'first-person')
  lootManager = new LDMCls(renderer!, (item) => inventory!.addItem(item), addCombatLog)
  input = new IMCls()
  camera?.syncYaw(playerYaw)
  const theme = getThemeForFloor(1)
  currentDungeon = buildTutorialDungeon(seed, theme)
  buildScene(renderer, currentDungeon)
  spawnTutorialDummy(renderer!)
  player = new PlayerKit(renderer!)
  playerX = currentDungeon.spawnX - currentDungeon.width / 2
  playerZ = currentDungeon.spawnY - currentDungeon.height / 2
  tutorialStairsZ = playerZ + currentDungeon.height / 2 - 3
  player.setPosition(playerX, 0, playerZ)
  playerYaw = 0
  minimap = new Minimap(currentDungeon)
  initAmbientAudio(save)
  window.addEventListener('resize', () => { if (renderer) renderer.resize(window.innerWidth, window.innerHeight) })
  // P8-1: Init hit effects & screen shake
  const hitEffects2 = new HitEffects()
  const screenShake2 = new ScreenShake()
  GL.setHitEffects(hitEffects2)
  GL.setScreenShake(screenShake2)
  GL.initGameLoop(deathScreen, combatLog)
  GL.setRuntimeState(currentScreen, gameState, renderer, player, camera, input, minimap, chaseAI, audio)
  GL.setSkillTree(skillTree)
  GL.setInventory(inventory)
  GL.setDungeonData(currentDungeon)
  GL.setDoorOpenedCallback(showDoorToast)
  GL.setFloorAdvancedCallback((floor: number) => {
    showFloorToast(floor, addCombatLog)
    RunTracker.recordFloor(floor)
  })
  GL.setLootSpawn((_mobType: string, x: number, z: number, item: ItemDef) => {
    if (lootManager) lootManager.spawn(item, x, z)
  })
  GL.setShrineProximityCallback((_shrineType: string) => {
    shrinePrompt.style.display = 'block'
    shrinePrompt.textContent = `✨ Shrine — Press [R]`
  })
  GL.setShrineActivatedCallback((msg: string) => {
    addCombatLog(msg)
    shrinePrompt.style.display = 'none'
    if (audio) audio.hit()
  })
  // P9-2: Quick-use hotbar
  GL.setQuickUseUpdate(() => updateQuickUseBar())
  GL.updateGameVars(playerHP, playerMaxHP, playerX, playerZ, playerYaw, playerFloor, mobs, combatLogEntries)
  GL.resetGameTime()
  TutorialMode.startTutorial(tutorialState)
  playerLastX = playerX; playerLastZ = playerZ; playerLastYaw = playerYaw
  gameLoop()
}
function buildTutorialDungeon(seed: number, theme: FloorTheme): DungeonData {
  const w = 14, h = 10
  const spawnX = 3, spawnY = Math.floor(h / 2)
  const stairsX = w - 3, stairsY = Math.floor(h / 2)
  return {
    width: w, height: h,
    rooms: [{ x: 1, y: 1, w: w - 2, h: h - 2, cx: Math.floor(w / 2), cy: Math.floor(h / 2) }],
    cells: [],
    spawnX, spawnY,
    stairsX, stairsY,
    seed,
    theme,
    floorNumber: 1,
    stealthTiles: new Set<string>(),
    trapPositions: new Map<string, TrapType>(),
    shrinePositions: new Map<string, ShrineType>(),
  }
}

function spawnTutorialDummy(renderer: GameRenderer): void {
  const dummy = new TutorialDummyMob(renderer)
  tutorialDummyMesh = dummy.mesh
  mobs.push(dummy)
}

function isDummyMob(mob: MobKit): boolean {
  return mob.state.type === 'tutorial-dummy'
}
// ── Game loop ───────────────────────────────────────────
export function gameLoop(timestamp = 0): void {
  // Single rAF driver — update input and run GL's game loop
  input?.update()
  GL.gameLoop(timestamp)
  ;[playerHP, playerMaxHP, playerX, playerZ, playerYaw, playerFloor] = [GL.getPlayerHP(), GL.getPlayerMaxHP(), GL.getPlayerX(), GL.getPlayerZ(), GL.getPlayerYaw(), GL.getPlayerFloor()]
  combatLogEntries = GL.getGameLog()
  mobs = GL.getMobs()
  updateScrapUI(); updateKeyCountUI(); updateTrophyUI()
  if (lootManager) {
    const time = renderer?.getElapsedTime() ?? 0
    const collected = lootManager.update(0.016, time, playerX, playerZ)
    if (collected.length > 0) showLootToast(collected[collected.length - 1])
  }
  if (currentDungeon) { updateStealth(isOnStealthTile(currentDungeon, playerX, playerZ)); document.getElementById('stealth-label')!.style.display = '' }
  const trapState = GL.getTrapHitState()
  const trapEl = document.getElementById('trap-hit-label')!
  if (trapState.active) { trapEl.style.display = 'block'; updateTrapHit(true, trapState.trapType) } else { trapEl.style.display = 'none' }
  if (player) updateStatusEffects(player.statusEffects)
  GL.checkPlayerDeath(updateHP, addCombatLog, player?.scrap ?? 0, (data) => {
    const statsEl = document.getElementById('death-stats')
    const scrapEl = document.getElementById('death-scrap')
    const mobsEl = document.getElementById('mobs-killed')
    const bossEl = document.getElementById('boss-kills')
    const durationEl = document.getElementById('run-duration')
    const bestEl = document.getElementById('best-run')
    if (statsEl) statsEl.textContent = `Deepest Floor: ${data.floor}`
    if (scrapEl) scrapEl.textContent = `Scrap Collected: ${data.scrap}`
    if (mobsEl) { mobsEl.textContent = data.mobsKilled; mobsEl.style.display = '' }
    if (bossEl) { bossEl.textContent = data.bossKills; bossEl.style.display = '' }
    if (durationEl) { durationEl.textContent = data.duration; durationEl.style.display = '' }
    if (bestEl) { bestEl.textContent = data.bestRun; bestEl.style.display = data.bestRun ? '' : 'none' }
  })
  // Tutorial tracking
  if (tutorialState?.active && input) {
    const state = input.getState()
    if (state.forward !== 0 || state.right !== 0) {
      TutorialMode.markMoved(tutorialState, playerX, playerZ, playerLastX, playerLastZ)
    }
    if (camera) {
      TutorialMode.markRotated(tutorialState, playerYaw, playerLastYaw)
    }
    if (state.attack) {
      TutorialMode.markAttacked(tutorialState)
    }
    const dummy = mobs.find(m => isDummyMob(m))
    if (dummy && !dummy.state.alive) {
      TutorialMode.markDummyKilled(tutorialState)
    }
    if (TutorialMode.checkStairsNearby(tutorialState, playerZ, tutorialStairsZ)) {
      TutorialMode.completeTutorial()
      addCombatLog('🌀 Tutorial complete! You may now explore freely.')
      setTimeout(() => { transitionFromTutorial() }, 1500)
    }
    playerLastX = playerX; playerLastZ = playerZ; playerLastYaw = playerYaw
    const gameEl = document.getElementById('game-screen')!
    const existingOverlay = document.querySelector('.tutorial-overlay')
    const overlayHTML = TutorialMode.renderTutorialOverlay(tutorialState)
    if (overlayHTML) {
      if (!existingOverlay) {
        const overlayDiv = document.createElement('div')
        overlayDiv.className = 'tutorial-overlay-container'
        overlayDiv.innerHTML = overlayHTML
        gameEl.appendChild(overlayDiv)
      } else {
        existingOverlay.outerHTML = overlayHTML
      }
    } else if (existingOverlay) {
      existingOverlay.parentElement?.remove()
    }
  } else {
    const existingOverlay = document.querySelector('.tutorial-overlay')
    if (existingOverlay) existingOverlay.parentElement?.remove()
  }

  if (gameState === 'playing') {
    GL.setAnimFrame(requestAnimationFrame(gameLoop))
  }
}
function transitionFromTutorial(): void {
  const overlay = document.querySelector('.tutorial-overlay')
  overlay?.parentElement?.remove()
  if (tutorialState) tutorialState.active = false
  if (tutorialDummyMesh && renderer) {
    renderer.scene.remove(tutorialDummyMesh)
    tutorialDummyMesh = null
  }
  mobs = mobs.filter(m => !isDummyMob(m))
  dungeonSeed = Date.now() % 100000
  startGame(dungeonSeed)
}
// ── Boss summon event ───────────────────────────────────
import { Boss } from '../entities/Boss'
export function initBossSummon(): void {
  window.addEventListener('boss-summon', () => {
    if (!renderer || !player) return
    const bossMob = mobs.find(m => m.state.isBoss && m.state.alive)
    if (!bossMob) return
    const angle = Math.random() * Math.PI * 2
    const m = Boss.spawnMinionMob(renderer, new THREE.Vector3(
      bossMob.position.x + Math.cos(angle) * 2, 0,
      bossMob.position.z + Math.sin(angle) * 2,
    ), mobs) as any
    if (m && !(m as any).initialized) {
      (m as any).initialized = true
      ;(m as any).buildMesh(renderer, 'goblin' as any)
      m.mesh.position.set(m.position.x, 0, m.position.z)
    }
    addCombatLog('⚔️ Boss summons a goblin minion!')
  })
}
export { GL }