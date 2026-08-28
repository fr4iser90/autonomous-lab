/**
 * Game loop — render/update cycle for Ashen Delve.
 * Extracted from main.ts to keep entry point thin (≤500 lines).
 */
import { GameRenderer } from '../render/GameRenderer'
import { FollowCamera } from '../render/camera'
import { InputManager } from './input'
import { PlayerKit } from '../kits/playerKit'
import type { MobKit } from '../entities/MobKit'
import { ChaseAI } from './ChaseAI'
import { AudioEngine } from './AudioEngine'
import { Minimap } from '../render/Minimap'
import { SkillTree } from './SkillTree'
import { isOnStealthTile } from './DungeonPCG'
import type { DungeonData } from './DungeonPCG'

// DOM refs (injected at init)
let _deathScreen!: HTMLElement
// State (injected at init)
let _playerHP = 20
let _playerMaxHP = 20
let _playerX = 0
let _playerZ = 0
let _playerYaw = 0
let _playerFloor = 1
let _mobs: MobKit[] = []
let _combatLogEntries: string[] = []
let _lastGrowlTime = 0

// Systems (injected at init)
let _renderer: GameRenderer | null = null
let _player: PlayerKit | null = null
let _camera: FollowCamera | null = null
let _input: InputManager | null = null
let _minimap: Minimap | null = null
let _chaseAI: ChaseAI | null = null
let _audio: AudioEngine | null = null
let _skillTree: SkillTree | null = null
let _dungeon: DungeonData | null = null

// Game state (injected)
let _currentScreen: 'title' | 'game' | 'settings' = 'title'
let _gameState: 'menu' | 'playing' | 'paused' | 'dead' = 'menu'
let _animFrame = 0

// Timing
let _lastTime = 0
let _attackCooldown = 0
let _stepCooldown = 0

/** Inject runtime references into the game loop module */
export function initGameLoop(
  deathScreen: HTMLElement,
  _combatLog: HTMLElement,
): void {
  _deathScreen = deathScreen
  void _combatLog
}

export function setRuntimeState(
  currentScreen: 'title' | 'game' | 'settings',
  gameState: 'menu' | 'playing' | 'paused' | 'dead',
  renderer: GameRenderer | null,
  player: PlayerKit | null,
  camera: FollowCamera | null,
  input: InputManager | null,
  minimap: Minimap | null,
  chaseAI: ChaseAI | null,
  audio: AudioEngine | null,
): void {
  _currentScreen = currentScreen
  _gameState = gameState
  _renderer = renderer
  _player = player
  _camera = camera
  _input = input
  _minimap = minimap
  _chaseAI = chaseAI
  _audio = audio
}

export function setDungeonData(dungeon: DungeonData | null): void {
  _dungeon = dungeon
}

export function resetGameTime(): void {
  _lastGrowlTime = 0
}

export function setSkillTree(st: SkillTree | null): void {
  _skillTree = st
}

export function updateGameVars(
  playerHP: number,
  playerMaxHP: number,
  playerX: number,
  playerZ: number,
  playerYaw: number,
  playerFloor: number,
  mobs: MobKit[],
  combatLogEntries: string[],
): void {
  _playerHP = playerHP
  _playerMaxHP = playerMaxHP
  _playerX = playerX
  _playerZ = playerZ
  _playerYaw = playerYaw
  _playerFloor = playerFloor
  _mobs = mobs
  _combatLogEntries = combatLogEntries
}

export function gameLoop(timestamp = 0): number {
  if (_currentScreen !== 'game' || _gameState !== 'playing') return 0
  _animFrame = requestAnimationFrame(gameLoop) as unknown as number

  const dt = Math.min((timestamp - _lastTime) / 1000, 0.05)
  _lastTime = timestamp
  const time = _renderer?.getElapsedTime() || 0

  // Update input
  _input?.update()
  const inp = _input?.getState() ?? { forward: 0, right: 0, rotate: 0, jump: false, attack: false }

  // Move player
  if (_player && _renderer) {
    const effects = _skillTree?.getActiveEffects() ?? { damageBonus: 0, hpBonus: 0, speedBonus: 0, critChanceBonus: 0 }
    const speed = 4 + effects.speedBonus
    const moveX = (Math.sin(_playerYaw) * inp.forward + Math.cos(_playerYaw) * inp.right) * speed * dt
    const moveZ = (Math.cos(_playerYaw) * inp.forward - Math.sin(_playerYaw) * inp.right) * speed * dt

    _playerX += moveX
    _playerZ += moveZ
    _player.setPosition(_playerX, 0, _playerZ)

    // Footstep sounds
    if ((inp.forward !== 0 || inp.right !== 0) && _audio) {
      _stepCooldown -= dt
      if (_stepCooldown <= 0) {
        _audio.step()
        _stepCooldown = 0.4
      }
    }

    // Attack (left-click)
    _attackCooldown -= dt
    if (inp.attack && _attackCooldown <= 0) {
      _attackCooldown = 0.5
      if (_audio) _audio.attack()

      // Attack nearby mobs
      _mobs.forEach(mob => {
        const dist = mob.distanceTo(_playerX, _playerZ)
        if (dist <= 2.0 && mob.state.alive) {
          const effects = _skillTree?.getActiveEffects() ?? { damageBonus: 0, hpBonus: 0, speedBonus: 0, critChanceBonus: 0 }
          const baseDmg = 2 + Math.floor(Math.random() * 3) + effects.damageBonus
          const isCrit = Math.random() < (0.15 + effects.critChanceBonus)
          const dmg = isCrit ? baseDmg * 2 : baseDmg
          mob.takeDamage(dmg)
          // Credit scrap when mob dies
          if (!mob.state.alive && _player) {
            const scrap = Math.ceil(mob.state.stats.maxHp / 4) + _playerFloor
            _player.scrap += scrap
          }
          if (_audio) _audio.hit()
        }
      })
    }

    // Rotation
    _playerYaw += inp.rotate * 2 * dt
    _player.mesh.rotation.y = _playerYaw

    // Animation state
    if (inp.forward !== 0 || inp.right !== 0) {
      _player.setAnimation('walk')
      _player.animateWalk(time)
    } else {
      _player.setAnimation('idle')
      _player.resetAnimation()
    }
  }

  // Update mobs
  if (_chaseAI) {
    for (const mob of _mobs) {
      if (!mob.state.alive) continue

      // Boss special behavior
      if (mob.state.type === 'stalker' && mob.state.stats.maxHp === 60 && 'bossAttack' in mob) {
        ;(mob as any).bossAttack(dt, _playerX, _playerZ)
        continue
      }

      // Update AI (P4-3: pass stealth status)
      const playerStealth = _dungeon ? isOnStealthTile(_dungeon, _playerX, _playerZ) : false
      const decision = _chaseAI.decide(mob, _playerX, _playerZ, dt, playerStealth)
      if (decision.action === 'chase') {
        mob.setPosition(decision.targetX, mob.position.y, decision.targetZ)
        mob.update(dt, _playerX, _playerZ)
      } else if (decision.action === 'attack') {
        mob.update(dt, _playerX, _playerZ)
      }

      // Mob-specific AI behavior
      const type = mob.state.type
      if (type === 'skeleton' && 'rangedAttack' in mob) {
        ;(mob as any).rangedAttack(dt, _playerX, _playerZ)
      } else if (type === 'bat' && 'swarmAI' in mob) {
        ;(mob as any).swarmAI(dt, _playerX, _playerZ)
      } else if (type === 'ogre' && 'chargeAI' in mob) {
        ;(mob as any).chargeAI(dt, _playerX, _playerZ)
      } else if (type === 'mummy' && 'curseAura' in mob) {
        ;(mob as any).curseAura(dt, _playerX, _playerZ)
      } else if (type === 'spider' && 'webAttack' in mob) {
        ;(mob as any).webAttack(dt, _playerX, _playerZ)
      } else if (type === 'wolf' && 'chargeAI' in mob) {
        ;(mob as any).chargeAI(dt, _playerX, _playerZ)
      } else if (type === 'zombie' && 'regenerate' in mob) {
        ;(mob as any).regenerate(dt)
      } else if (type === 'harpy' && 'swoopAttack' in mob) {
        ;(mob as any).swoopAttack(dt, _playerX, _playerZ)
      } else if (type === 'troll' && ('groundSlam' in mob || 'regenerate' in mob)) {
        if ('groundSlam' in mob) (mob as any).groundSlam(dt, _playerX, _playerZ)
        if ('regenerate' in mob) (mob as any).regenerate(dt)
      } else if (type === 'lich' && ('summonMinion' in mob || 'updateCurseAura' in mob || 'castSpell' in mob)) {
        if ('summonMinion' in mob) (mob as any).summonMinion()
        if ('updateCurseAura' in mob) (mob as any).updateCurseAura(dt, _playerX, _playerZ)
        if ('castSpell' in mob) (mob as any).castSpell(dt)
      } else if (type === 'phantom' && ('phaseShift' in mob || 'floatMovement' in mob)) {
        if ('phaseShift' in mob) (mob as any).phaseShift(dt)
        if ('floatMovement' in mob) (mob as any).floatMovement(dt, _playerX, _playerZ)
      } else if (type === 'elemental' && ('burnAura' in mob || 'flameBurst' in mob)) {
        if ('burnAura' in mob) (mob as any).burnAura(dt, _playerX, _playerZ)
        if ('flameBurst' in mob) (mob as any).flameBurst()
      }

      // Mob growl when chasing
      if (decision.action === 'chase' && _audio && time - _lastGrowlTime > 3) {
        _audio.growl()
        _lastGrowlTime = time
      }

      // Check if mob attacks player
      const dist = mob.distanceTo(_playerX, _playerZ)
      if (dist <= 1.2 && mob.state.stats.damage > 0) {
        mob.state.stats.damage = 0
        _playerHP = Math.max(0, _playerHP - mob.state.stats.damage)
        if (_audio) _audio.hit()
      }
    }
  }

  // Update minimap
  if (_minimap && _player) {
    _minimap.setPlayerPos(_playerX, _playerZ)
  }

  // Update camera
  if (_camera && _player && _renderer) {
    _camera.update(_renderer, _player.position, _playerYaw)
  }

  // Animate torch flicker
  if (_renderer) {
    _renderer.updateTorchFlicker(time)
  }

  // Render
  _renderer?.render()
  return _animFrame
}

export function checkPlayerDeath(updateHP: (hp: number, maxHp: number) => void, addCombatLog: (msg: string) => void, playerScrap = 0): void {
  if (_gameState !== 'playing') return
  updateHP(_playerHP, _playerMaxHP)
  if (_playerHP <= 0) {
    _gameState = 'dead'
    _deathScreen.style.display = 'flex'
    if (_audio) _audio.stopAmbient()
    addCombatLog('💀 You have fallen!')
    const statsEl = document.getElementById('death-stats')
    const scrapEl = document.getElementById('death-scrap')
    if (statsEl) statsEl.textContent = `Deepest Floor: ${_playerFloor}`
    if (scrapEl) scrapEl.textContent = `Scrap Collected: ${playerScrap}`
  }
}

export function getAnimFrame(): number { return _animFrame }
export function getPlayerX(): number { return _playerX }
export function getPlayerZ(): number { return _playerZ }
export function getPlayerYaw(): number { return _playerYaw }
export function setPlayerX(v: number) { _playerX = v }
export function setPlayerZ(v: number) { _playerZ = v }
export function setPlayerYaw(v: number) { _playerYaw = v }
export function getPlayerHP(): number { return _playerHP }
export function getPlayerMaxHP(): number { return _playerMaxHP }
export function setPlayerHP(v: number) { _playerHP = v }
export function setPlayerMaxHP(v: number) { _playerMaxHP = v }
export function getGameLog(): string[] { return _combatLogEntries }
export function getMobs(): MobKit[] { return _mobs }
export function getPlayerFloor(): number { return _playerFloor }
export function setBaseHP(baseHP: number): void { _playerMaxHP = baseHP }
