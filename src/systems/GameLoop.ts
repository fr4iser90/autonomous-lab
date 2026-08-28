/**
 * Game loop — render/update cycle for Ashen Delve.
 * Extracted from main.ts to keep entry point thin (≤500 lines).
 */
import { GameRenderer } from '../render/GameRenderer'
import { FollowCamera } from '../render/camera'
import { InputManager } from './input'
import { PlayerKit } from '../kits/playerKit'
import type { MobKit } from '../entities/MobKit'
import { getLootTable } from '../entities/MobKit'
import type { ItemDef } from '../data/items'
import { getItemById } from '../data/items'
import { ChaseAI } from './ChaseAI'
import { AudioEngine } from './AudioEngine'
import { Minimap } from '../render/Minimap'
import { SkillTree } from './SkillTree'
import { isOnStealthTile, getTrapAt, isSealedDoor, openDoorAt, isOnStairs, getShrineAt, deactivateShrine } from './DungeonPCG'
import type { DungeonData } from './DungeonPCG'
import { TRAP_DEFS } from '../data/traps'
import { poison, burn, freeze, shield } from '../data/statusEffects'
import { SHRINE_DEFS } from '../data/shrines'

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
let _trapHitTimer = 0
let _lastTrapType: string | null = null
let _stairsCooldown = 0

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
let _inventory: { getEquippedDamage: () => number; getEquippedArmor: () => number; getKeyCount: () => number; consumeKey: () => boolean } | null = null

// Loot drop callback (set from main.ts)
let _lootSpawn: ((mobType: string, x: number, z: number, item: ItemDef) => void) | null = null

// Door opened callback (set from main.ts)
let _onDoorOpened: ((msg: string) => void) | null = null
export function setDoorOpenedCallback(cb: (msg: string) => void): void {
  _onDoorOpened = cb
}

// Floor advanced callback (set from main.ts)
let _onFloorAdvanced: ((floor: number) => void) | null = null
export function setFloorAdvancedCallback(cb: (floor: number) => void): void {
  _onFloorAdvanced = cb
}

// Shrine callbacks (set from main.ts)
let _onShrineActivated: ((msg: string) => void) | null = null
let _onShrineProximity: ((shrineType: string) => void) | null = null
export function setShrineActivatedCallback(cb: (msg: string) => void): void {
  _onShrineActivated = cb
}
export function setShrineProximityCallback(cb: (shrineType: string) => void): void {
  _onShrineProximity = cb
}

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

export function setInventory(inv: { getEquippedDamage: () => number; getEquippedArmor: () => number; getKeyCount: () => number; consumeKey: () => boolean } | null): void {
  _inventory = inv
}

/** Set the loot-drop spawn callback */
export function setLootSpawn(cb: (mobType: string, x: number, z: number, item: ItemDef) => void): void {
  _lootSpawn = cb
}

/** Apply healing to the player. Returns new HP. */
export function healPlayer(amount: number, currentMaxHP: number): number {
  if (amount <= 0) return _playerHP
  _playerHP = Math.min(currentMaxHP, _playerHP + amount)
  return _playerHP
}

// Shrine activation flag (set from ui.ts via requestShrineActivate)
let _shrineActivatePending = false
// Shrine buff tracking: +bonus damage for duration seconds
let _buffTimer = 0
let _buffBonusDmg = 0

/** Request shrine activation from UI — called when player presses R */
export function requestShrineActivate(): void {
  _shrineActivatePending = true
}

/** Get the current shrine bonus damage from active buff */
export function getShrineBuffBonus(): number {
  return _buffBonusDmg
}

/** Activate a shrine at the player's current position. Returns message or null. */
export function tryActivateShrine(): string | null {
  if (!_shrineActivatePending || !_dungeon || !_player) return null
  const shrineType = getShrineAt(_dungeon, _playerX, _playerZ)
  if (!shrineType) return null

  const def = SHRINE_DEFS[shrineType]
  let message = `${def.emoji} ${def.label}: `

  switch (shrineType) {
    case 'heal': {
      const healAmt = Math.floor(_playerMaxHP * 0.3)
      _playerHP = Math.min(_playerMaxHP, _playerHP + healAmt)
      message += `+${healAmt} HP!`
      break
    }
    case 'buff': {
      // Add damage buff for 30 seconds
      _buffBonusDmg = 2
      _buffTimer = 30
      message += `+2 DMG for 30s!`
      break
    }
    case 'shield': {
      // Add shield status effect for 20 seconds (2 dmg reduction)
      const shieldDef = shield(20, 2)
      _player.statusEffects.push(shieldDef)
      message += `+2 armor for 20s!`
      break
    }
  }

  // Deactivate the shrine
  deactivateShrine(_dungeon, _playerX, _playerZ)

  // Reset flags
  _shrineActivatePending = false
  return message
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
    let speed = 4 + effects.speedBonus
    // P7-1: Apply freeze slow factor
    const playerFreeze = _player.statusEffects.find(e => e.type === 'freeze')
    if (playerFreeze) {
      speed *= playerFreeze.slowFactor
    }
    const moveX = (Math.sin(_playerYaw) * inp.forward + Math.cos(_playerYaw) * inp.right) * speed * dt
    const moveZ = (Math.cos(_playerYaw) * inp.forward - Math.sin(_playerYaw) * inp.right) * speed * dt

    // P5-4: Sealed door collision — block movement on sealed doors unless key is consumed
    let allowMove = true
    if (_dungeon && (moveX !== 0 || moveZ !== 0)) {
      const tentX = _playerX + moveX
      const tentZ = _playerZ + moveZ
      if (isSealedDoor(_dungeon, tentX, tentZ)) {
        if (_inventory?.consumeKey()) {
          openDoorAt(_dungeon, tentX, tentZ)
          _onDoorOpened?.('🔑 Door opened!')
          // allowMove stays true — key consumed, door opened
        } else {
          allowMove = false // no key — blocked
        }
      }
    }
    if (allowMove) {
      _playerX += moveX
      _playerZ += moveZ
      _player.setPosition(_playerX, 0, _playerZ)
    }

    // P5-5: Stairs detection — advance to next floor when standing on stairs
    if (_dungeon && (inp.forward !== 0 || inp.right !== 0) && _onFloorAdvanced) {
      _stairsCooldown -= dt
      if (_stairsCooldown <= 0 && isOnStairs(_dungeon, _playerX, _playerZ)) {
        _playerFloor += 1
        _onFloorAdvanced(_playerFloor)
        _stairsCooldown = 2.0 // prevent repeated triggers
      }
    }

    // P4-4: Trap detection — deal damage when player steps on a trap
    if ((inp.forward !== 0 || inp.right !== 0) && _dungeon) {
      _trapHitTimer -= dt
      const trapType = getTrapAt(_dungeon, _playerX, _playerZ)
      if (trapType && _trapHitTimer <= 0) {
        const trapDef = TRAP_DEFS[trapType]
        let damage = trapDef.damage + Math.floor(_playerFloor * 0.5) // +0.5 damage per floor
        // P7-1: Shield reduction
        const playerShield = _player?.statusEffects.find(e => e.type === 'shield')
        const shieldRed = playerShield?.damageReduction ?? 0
        damage = Math.max(1, damage - shieldRed)
        _playerHP = Math.max(0, _playerHP - damage)
        _combatLogEntries.push(`${trapDef.label} trap! -${damage} HP`)
        _trapHitTimer = 0.5 // 0.5s cooldown to prevent repeated triggers
        _lastTrapType = trapType
        if (_audio) _audio.hit()
      }
    }

    // P4-2: Shrine proximity detection — notify UI when player stands on a shrine
    if (_dungeon) {
      const shrineType = getShrineAt(_dungeon, _playerX, _playerZ)
      if (shrineType && _onShrineProximity) {
        _onShrineProximity(shrineType)
      }
    }

    // P4-2: Shrine activation — when player presses R on a shrine
    if (_dungeon && _shrineActivatePending) {
      const msg = tryActivateShrine()
      if (msg) {
        _combatLogEntries.push(msg)
        _onShrineActivated?.(msg)
      }
    }

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
          const weaponDmg = _inventory?.getEquippedDamage() ?? 0
          const baseDmg = 2 + Math.floor(Math.random() * 3) + effects.damageBonus + weaponDmg + _buffBonusDmg
          const isCrit = Math.random() < (0.15 + effects.critChanceBonus)
          const dmg = isCrit ? baseDmg * 2 : baseDmg
          mob.takeDamage(dmg)
          // Credit scrap when mob dies
          if (!mob.state.alive && _player) {
            const scrap = Math.ceil(mob.state.stats.maxHp / 4) + _playerFloor
            _player.scrap += scrap
          }
          // Spawn loot drops on mob death
          if (!mob.state.alive && _lootSpawn) {
            const lootTable = getLootTable(mob.state.type)
            for (const entry of lootTable) {
              if (Math.random() < entry.chance) {
                const item = getItemById(entry.itemId)
                if (item) {
                  _lootSpawn(mob.state.type, mob.position.x, mob.position.z, item)
                }
              }
            }
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

      // Boss special behavior (P6: special attacks, phases, summons)
      if (mob.state.isBoss && 'bossAttack' in mob) {
        const boss = mob as any
        boss.bossAttack(dt, _playerX, _playerZ, time)

        // P6: Check fireball proximity damage
        if (boss.fireballs) {
          for (const fb of boss.fireballs) {
            const dx = _playerX - fb.mesh.position.x
            const dz = _playerZ - fb.mesh.position.z
            const dist = Math.sqrt(dx * dx + dz * dz)
            if (dist < 0.8 && !fb.hit) {
              fb.hit = true
              const armor = _inventory?.getEquippedArmor() ?? 0
              // P7-1: Shield reduction
              const playerShield = _player?.statusEffects.find(e => e.type === 'shield')
              const shieldRed = playerShield?.damageReduction ?? 0
              const netDmg = Math.max(1, fb.damage - armor - shieldRed)
              _playerHP = Math.max(0, _playerHP - netDmg)
              if (_audio) _audio.hit()
              // Remove hit fireball
              if (_renderer) {
                _renderer.scene.remove(fb.mesh)
                fb.mesh.geometry.dispose()
                fb.mesh.material.dispose()
              }
              boss.fireballs.splice(boss.fireballs.indexOf(fb), 1)
            }
          }
        }

        // P6: Check ground slam proximity damage
        if (boss.slamZones) {
          for (const zone of boss.slamZones) {
            if (zone.hit) continue
            const dx = _playerX - zone.mesh.position.x
            const dz = _playerZ - zone.mesh.position.z
            const dist = Math.sqrt(dx * dx + dz * dz)
            if (dist < zone.radius && zone.life > 0.5) { // Only damage during first half of animation
              zone.hit = true
              const armor = _inventory?.getEquippedArmor() ?? 0
              // P7-1: Shield reduction
              const playerShield = _player?.statusEffects.find(e => e.type === 'shield')
              const shieldRed = playerShield?.damageReduction ?? 0
              const netDmg = Math.max(1, zone.damage - armor - shieldRed)
              _playerHP = Math.max(0, _playerHP - netDmg)
              if (_audio) _audio.hit()
            }
          }
        }

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

      // Check if mob attacks player (cooldown-based, not damage-zeroing)
      const dist = mob.distanceTo(_playerX, _playerZ)
      const attackCooldown = mob.state.stats.attackCooldown ?? 1.0
      if (dist <= 1.2 && (time - mob.lastAttackTime) >= attackCooldown && mob.state.stats.damage > 0) {
        const armor = _inventory?.getEquippedArmor() ?? 0
        // P7-1: Apply shield damage reduction
        const playerShield = _player?.statusEffects.find(e => e.type === 'shield')
        const shieldReduction = playerShield?.damageReduction ?? 0
        const netDmg = Math.max(1, mob.state.stats.damage - armor - shieldReduction)
        _playerHP = Math.max(0, _playerHP - netDmg)
        mob.recordAttack(time)
        // P7-1: Status effects on hit
        if (_player) {
          const type = mob.state.type
          if (type === 'mummy') {
            _player.statusEffects.push(poison(4, 3)) // curse = poison
          } else if (type === 'spider') {
            _player.statusEffects.push(freeze(1.5, 0.4)) // web = freeze
          } else if (type === 'elemental') {
            _player.statusEffects.push(burn(3, 4)) // fire = burn
          } else if (type === 'stalker') {
            _player.statusEffects.push(poison(2, 2)) // poison dagger
          }
        }
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

  // P6: Boss UI updates (HP bar, warning flash)
  updateBossUI()

  // P7-1: Tick player status effects (DOT damage)
  if (_player) {
    for (let i = _player.statusEffects.length - 1; i >= 0; i--) {
      const eff = _player.statusEffects[i]
      eff.ticksLeft -= dt
      // Apply DOT damage at intervals
      if (eff.damagePerTick > 0 && _playerHP > 0) {
        const ticksSinceLast = dt / eff.tickInterval
        const ticksToApply = Math.floor(ticksSinceLast + (eff._lastTickCount || 0))
        if (ticksToApply > 0) {
          const dotDamage = eff.damagePerTick * ticksToApply
          _playerHP = Math.max(0, _playerHP - dotDamage)
          _combatLogEntries.push(`${eff.emoji} ${eff.label} deals ${dotDamage} damage`)
          eff._lastTickCount = ticksToApply
        }
      }
      // Remove expired effects
      if (eff.ticksLeft <= 0) {
        _player.statusEffects.splice(i, 1)
        _combatLogEntries.push(`${_playerHP > 0 ? '✅' : '💀'} ${eff.label} effect ended`)
      }
    }
  }

  // P4-2: Tick shrine buff timer
  if (_buffTimer > 0) {
    _buffTimer -= dt
    if (_buffTimer <= 0) {
      _buffBonusDmg = 0
    }
  }

  // P7-1: Tick mob status effects (DOT damage)
  if (_chaseAI) {
    for (const mob of _mobs) {
      if (!mob.state.alive) continue
      for (let i = mob.state.statusEffects.length - 1; i >= 0; i--) {
        const eff = mob.state.statusEffects[i]
        eff.ticksLeft -= dt
        // Apply DOT damage at intervals
        if (eff.damagePerTick > 0 && mob.state.stats.hp > 0) {
          const ticksSinceLast = dt / eff.tickInterval
          const ticksToApply = Math.floor(ticksSinceLast + (eff._lastTickCount || 0))
          if (ticksToApply > 0) {
            const dotDamage = eff.damagePerTick * ticksToApply
            mob.state.stats.hp = Math.max(0, mob.state.stats.hp - dotDamage)
            if (mob.state.stats.hp <= 0) {
              mob.state.alive = false
              _combatLogEntries.push(`${eff.emoji} ${mob.state.type} burned to ash!`)
            } else {
              _combatLogEntries.push(`${eff.emoji} ${mob.state.type} takes ${dotDamage} ${eff.label} damage`)
            }
            eff._lastTickCount = ticksToApply
          }
        }
        // Remove expired effects
        if (eff.ticksLeft <= 0) {
          mob.state.statusEffects.splice(i, 1)
        }
      }
    }
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

/** P4-4: Get the current trap hit state for UI feedback */
export function getTrapHitState(): { active: boolean; trapType: string | null } {
  const active = _trapHitTimer > 0
  return { active, trapType: active ? _lastTrapType : null }
}

// P6: Boss UI state
let _lastBossPhase: string = ''

/** Update boss HP bar and warning UI from boss state */
export function updateBossUI(): void {
  const bossMob = _mobs.find(m => m.state.isBoss && m.state.alive)
  if (!bossMob) {
    // Hide boss UI when no boss alive
    const bossBar = document.getElementById('boss-hp-bar')
    if (bossBar) bossBar.classList.remove('active')
    const bossWarning = document.getElementById('boss-warning')
    if (bossWarning) bossWarning.classList.remove('flash')
    _lastBossPhase = ''
    return
  }

  const boss = bossMob as any
  const hpFill = Math.round((bossMob.state.stats.hp / bossMob.state.stats.maxHp) * 100)
  const phase = boss.phase || 'normal'

  // Show boss HP bar
  const bossBar = document.getElementById('boss-hp-bar')
  if (bossBar) {
    bossBar.classList.add('active')
    const fillEl = document.getElementById('boss-hp-fill')
    if (fillEl) fillEl.style.width = hpFill + '%'
  }

  // Flash boss warning during special attacks
  if (boss.isWarning && boss.warningType) {
    const bossWarning = document.getElementById('boss-warning')
    if (bossWarning) {
      bossWarning.textContent = boss.warningType === 'fireball' ? '⚠ FIREBALL!' :
        boss.warningType === 'slam' ? '⚠ GROUND SLAM!' : '⚠ MINION SUMMON!'
      bossWarning.classList.add('flash')
      // Remove class after animation
      setTimeout(() => bossWarning.classList.remove('flash'), 600)
    }
  }

  // Log phase transitions
  if (phase !== _lastBossPhase) {
    _lastBossPhase = phase
    const phaseMessages: Record<string, string> = {
      normal: '',
      enrage: '🔥 Boss enrages!',
      desperate: '⚡ Boss summons minions!',
    }
    if (phaseMessages[phase]) {
      _combatLogEntries.unshift(phaseMessages[phase])
      if (_combatLogEntries.length > 10) _combatLogEntries.pop()
    }
  }
}
