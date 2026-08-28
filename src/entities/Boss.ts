/**
 * Boss — large boss mob with special attacks, phases, and summons.
 * P6: Boss special attacks — fireball, AOE slam, phases, minions.
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const BOSS_STATS: MobStats = {
  hp: 60,
  maxHp: 60,
  damage: 8,
  speed: 0.4,
  aggroRange: 12,
  chaseSpeed: 2.0,
  attackCooldown: 0.8,
}

export type BossPhase = 'normal' | 'enrage' | 'desperate'

interface FireballProjectile {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  life: number
  damage: number
}

interface GroundSlamZone {
  mesh: THREE.Mesh
  life: number
  maxLife: number
  damage: number
  radius: number
  hit: boolean
}

interface MinionSpawnEffect {
  mesh: THREE.Mesh
  life: number
}

export class Boss extends MobKit {
  bodyMesh!: THREE.Mesh
  crownMesh!: THREE.Mesh
  headMesh!: THREE.Mesh
  cloakMesh!: THREE.Mesh
  leftEyeMesh!: THREE.Mesh

  // P6: Attack timers
  private fireballTimer = 0
  private fireballCooldown = 3.0 // fireball every 3s
  private slamTimer = 0
  private slamCooldown = 5.0 // slam every 5s
  private phaseTimer = 0
  private summonTimer = 0
  private summonCooldown = 8.0 // summon every 8s in desperate mode

  // P6: Active projectiles and effects
  fireballs: FireballProjectile[] = []
  slamZones: GroundSlamZone[] = []
  spawnEffects: MinionSpawnEffect[] = []

  // P6: Phase tracking
  phase: BossPhase = 'normal'
  isWarning = false
  warningType: 'fireball' | 'slam' | 'summon' | '' = ''
  warningTimer = 0

  // Scene reference for managing projectiles
  private scene!: THREE.Scene

  constructor(renderer: GameRenderer, stats: MobStats = BOSS_STATS) {
    super(renderer, 'stalker', stats, 100)
    this.state.isBoss = true
    this.state.scrapReward = 100
    this.scene = renderer.scene
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    // Massive body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.8, 12)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3a1a1a,
      roughness: 0.7,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.9
    this.bodyMesh.castShadow = true
    this.bodyMesh.userData.bob = true
    this.mesh.add(this.bodyMesh)

    // Large head
    const headGeo = new THREE.SphereGeometry(0.3, 12, 12)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a2a,
      roughness: 0.6,
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.y = 2.1
    this.headMesh.userData.bob = true
    this.mesh.add(this.headMesh)

    // Crown (spiky) — gold, will change color at 50% HP
    const crownGeo = new THREE.ConeGeometry(0.35, 0.3, 8)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xff9944,
      emissive: 0xff6600,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    })
    this.crownMesh = new THREE.Mesh(crownGeo, crownMat)
    this.crownMesh.position.y = 2.5
    this.mesh.add(this.crownMesh)

    // Eyes (burning red)
    const eyeGeo = new THREE.SphereGeometry(0.05, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.0,
    })
    this.leftEyeMesh = new THREE.Mesh(eyeGeo, eyeMat)
    this.leftEyeMesh.position.set(-0.1, 2.15, 0.25)
    this.mesh.add(this.leftEyeMesh)
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.1, 2.15, 0.25)
    this.mesh.add(rightEye)

    // Cloak
    const cloakGeo = new THREE.ConeGeometry(0.5, 0.8, 12)
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a1a,
      roughness: 0.95,
    })
    this.cloakMesh = new THREE.Mesh(cloakGeo, cloakMat)
    this.cloakMesh.position.y = 0.4
    this.cloakMesh.userData.bob = true
    this.mesh.add(this.cloakMesh)
  }

  /** Get current HP percentage (0–1) */
  hpPercent(): number {
    return this.state.stats.hp / this.state.stats.maxHp
  }

  /** Check if boss should change phase and apply phase effects */
  checkPhases(): void {
    const hp = this.hpPercent()
    if (this.phase === 'normal' && hp <= 0.5 && hp > 0.25) {
      this.enterPhase('enrage')
    } else if (this.phase === 'enrage' && hp <= 0.25) {
      this.enterPhase('desperate')
    }
  }

  /** Apply phase transition effects */
  enterPhase(newPhase: BossPhase): void {
    this.phase = newPhase
    const mat = this.crownMesh.material as THREE.MeshStandardMaterial

    switch (newPhase) {
      case 'enrage':
        // Crown turns red, attack speed +50%, chase speed +30%
        mat.color.setHex(0xcc0000)
        mat.emissive.setHex(0xff0000)
        mat.emissiveIntensity = 1.0
        this.state.stats.aggroRange = 15 // +3 aggro range
        this.state.stats.chaseSpeed = 2.6 // +30% chase speed
        this.fireballCooldown = 2.0 // -33% cooldown
        this.slamCooldown = 3.5 // -30% cooldown
        this._addCombatLog('🔥 Boss enrages! Attacks faster!')
        break
      case 'desperate':
        // Damage doubled, begins summoning
        mat.color.setHex(0x880000)
        mat.emissive.setHex(0xff0000)
        mat.emissiveIntensity = 1.5
        this.state.stats.damage = 16 // double from 8
        this.summonTimer = 0 // start summoning immediately
        this._addCombatLog('⚡ Boss is desperate! Summoning minions!')
        break
    }
  }

  /** Add combat log message (P6: boss phase alerts) */
  private _addCombatLog(msg: string): void {
    const logEl = document.getElementById('combat-log')
    if (logEl) {
      const entry = document.createElement('div')
      entry.textContent = msg
      entry.className = 'phase-alert'
      logEl.prepend(entry)
      // Limit log entries
      while (logEl.children.length > 20) {
        logEl.removeChild(logEl.lastChild!)
      }
    }
  }

  /** Cast fireball toward player (P6-1: ranged attack) */
  castFireball(playerX: number, playerZ: number): void {
    const dx = playerX - this.position.x
    const dz = playerZ - this.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist <= 0) return

    // Damage scales with phase
    const dmg = this.phase === 'desperate' ? 8 : this.phase === 'enrage' ? 6 : 5
    const speed = 5 // units per second

    // Fireball mesh
    const fbGeo = new THREE.SphereGeometry(0.12, 8, 8)
    const fbMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff4400,
      emissiveIntensity: 2.0,
      roughness: 0.5,
    })
    const fbMesh = new THREE.Mesh(fbGeo, fbMat)
    fbMesh.position.copy(this.position)
    fbMesh.position.y = 2.0
    this.scene.add(fbMesh)

    const velocity = new THREE.Vector3(
      (dx / dist) * speed,
      0,
      (dz / dist) * speed,
    )

    this.fireballs.push({ mesh: fbMesh, velocity, life: 4.0, damage: dmg })
  }

  /** Cast ground slam AOE (P6-2: area attack) */
  castGroundSlam(): void {
    const radius = 3.0
    const dmg = this.phase === 'desperate' ? 10 : this.phase === 'enrage' ? 8 : 6

    // Visual: expanding ring at boss feet
    const ringGeo = new THREE.RingGeometry(radius * 0.8, radius, 32)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff2200,
      emissiveIntensity: 1.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.set(this.position.x, 0.02, this.position.z)
    this.scene.add(ringMesh)

    this.slamZones.push({
      mesh: ringMesh,
      life: 1.0,
      maxLife: 1.0,
      damage: dmg,
      radius,
      hit: false,
    })

    // Visual: raise boss body up
    this.bodyMesh.position.y = 1.2 // lift body
    this.headMesh.position.y = 2.4
    this.crownMesh.position.y = 2.8
  }

  /** Spawn particle effect at boss location (P6-4: minion summoning) */
  spawnMinionEffect(): void {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.05, 4, 4)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x440066,
        emissive: 0x330044,
        emissiveIntensity: 1.0,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(this.position)
      mesh.position.y = 0.5
      this.scene.add(mesh)

      const angle2 = (Math.PI * 2 * i) / 8 + Math.random() * 0.5
      const speed = 0.5 + Math.random() * 0.5
      const vel = new THREE.Vector3(
        Math.cos(angle2) * speed,
        0.5 + Math.random() * 0.5,
        Math.sin(angle2) * speed,
      )
      const life = 0.8 + Math.random() * 0.4

      this.spawnEffects.push({ mesh, life })

      // Animate particles outward
      const startTime = performance.now() / 1000
      const animateParticle = () => {
        const elapsed = performance.now() / 1000 - startTime
        if (elapsed >= life) {
          this.scene.remove(mesh)
          geo.dispose()
          mat.dispose()
          return
        }
        const t = elapsed / life
        mesh.position.x += vel.x * 0.016
        mesh.position.z += vel.z * 0.016
        mesh.position.y += vel.y * 0.016
        mesh.material.opacity = 1 - t
        requestAnimationFrame(animateParticle)
      }
      requestAnimationFrame(animateParticle)
    }
  }

  /** P6: Main boss behavior — movement, attacks, phases, summons */
  bossAttack(dt: number, playerX: number, playerZ: number, _gameTime: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    const chaseSpeed = this.state.stats.chaseSpeed * dt

    // 1. Move toward player if in range
    if (dist <= this.state.stats.aggroRange && dist > 1.5) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)
      this.position.x += (dx / len) * chaseSpeed
      this.position.z += (dz / len) * chaseSpeed
      this.mesh.position.copy(this.position)

      // Face player
      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle
    }

    // 2. Check for phase transitions
    this.phaseTimer += dt
    if (this.phaseTimer >= 0.5) {
      this.phaseTimer = 0
      this.checkPhases()
    }

    // 3. Fireball attack (every fireballCooldown seconds)
    this.fireballTimer += dt
    if (this.fireballTimer >= this.fireballCooldown) {
      this.fireballTimer = 0

      // Warning indicator (0.5s before fireball)
      this.warningType = 'fireball'
      this.isWarning = true
      this.warningTimer = 0.5

      // Cast fireball after warning
      setTimeout(() => {
        if (this.state.alive) this.castFireball(playerX, playerZ)
      }, 500)
    }

    // 4. Ground slam attack (every slamCooldown seconds)
    this.slamTimer += dt
    if (this.slamTimer >= this.slamCooldown) {
      this.slamTimer = 0

      // Warning indicator (1s before slam — boss raises body)
      this.warningType = 'slam'
      this.isWarning = true
      this.warningTimer = 1.0

      // Visual: raise body up during warning
      this.bodyMesh.position.y = 1.2
      this.headMesh.position.y = 2.4
      this.crownMesh.position.y = 2.8

      // Cast slam after warning
      setTimeout(() => {
        if (this.state.alive) {
          this.castGroundSlam()
          this.bodyMesh.position.y = 0.9
          this.headMesh.position.y = 2.1
          this.crownMesh.position.y = 2.5
        }
      }, 1000)
    }

    // 5. Minion summoning (desperate mode only)
    if (this.phase === 'desperate') {
      this.summonTimer += dt
      if (this.summonTimer >= this.summonCooldown) {
        this.summonTimer = 0
        this.warningType = 'summon'
        this.isWarning = true
        this.warningTimer = 1.0
        this.spawnMinionEffect()

        // Notify main.ts via DOM event for actual mob spawning
        const event = new CustomEvent('boss-summon', { detail: {} })
        window.dispatchEvent(event)
      }
    }

    // 6. Update warning timer
    if (this.isWarning) {
      this.warningTimer -= dt
      if (this.warningTimer <= 0) {
        this.isWarning = false
        this.warningType = ''
      }
    }

    // 7. Update fireball projectiles
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i]
      fb.life -= dt
      fb.mesh.position.x += fb.velocity.x * dt
      fb.mesh.position.z += fb.velocity.z * dt

      // Fade and shrink
      const t = 1 - fb.life / 4.0
      const fbMat = fb.mesh.material as THREE.MeshStandardMaterial
      fbMat.opacity = 1 - t
      fb.mesh.scale.setScalar(1 - t * 0.5)

      if (fb.life <= 0) {
        this.scene.remove(fb.mesh)
        fb.mesh.geometry.dispose()
        fbMat.dispose()
        this.fireballs.splice(i, 1)
      }
    }

    // 8. Update slam zones
    for (let i = this.slamZones.length - 1; i >= 0; i--) {
      const zone = this.slamZones[i]
      zone.life -= dt
      const t = 1 - zone.life / zone.maxLife

      // Expand ring
      zone.mesh.scale.setScalar(1 + t * 0.3)
      const zoneMat = zone.mesh.material as THREE.MeshStandardMaterial
      zoneMat.opacity = 0.8 * (1 - t)

      if (zone.life <= 0) {
        this.scene.remove(zone.mesh)
        zone.mesh.geometry.dispose()
        zoneMat.dispose()
        this.slamZones.splice(i, 1)
      }
    }

    // 9. Crown glow pulse (always)
    const pulse = this.isWarning
      ? 1.5 + Math.sin(this.walkTime * 8) * 0.5 // faster pulse during warning
      : 0.5 + Math.sin(this.walkTime * 3) * 0.3
    const mat = this.crownMesh.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = pulse

    // Warning glow: make eyes flash
    if (this.isWarning) {
      const eyeFlash = 2.0 + Math.sin(this.walkTime * 10) * 1.5
      const eyeMat = this.leftEyeMesh.material as THREE.MeshStandardMaterial
      eyeMat.emissiveIntensity = eyeFlash
    } else {
      const eyeMat = this.leftEyeMesh.material as THREE.MeshStandardMaterial
      eyeMat.emissiveIntensity = 2.0
    }
  }

  /** P6-4: Called when a boss minion actually spawns (from main.ts) */
  static spawnMinionMob(renderer: GameRenderer, pos: THREE.Vector3, mobs: MobKit[]): MobKit {
    // Create a small goblin-like minion
    const minion = new Boss(renderer, {
      hp: 10,
      maxHp: 10,
      damage: 2,
      speed: 0.6,
      aggroRange: 10,
      chaseSpeed: 3.0,
      attackCooldown: 0.8,
    })
    minion.setPosition(pos.x, 0, pos.z)
    // Scale down minion
    minion.mesh.scale.setScalar(0.4)
    mobs.push(minion)
    return minion
  }

  /** Cleanup all projectiles and effects when boss dies */
  cleanup(): void {
    for (const fb of this.fireballs) {
      this.scene.remove(fb.mesh)
      fb.mesh.geometry.dispose()
      ;(fb.mesh.material as THREE.MeshStandardMaterial).dispose()
    }
    this.fireballs = []
    for (const zone of this.slamZones) {
      this.scene.remove(zone.mesh)
      zone.mesh.geometry.dispose()
      ;(zone.mesh.material as THREE.MeshStandardMaterial).dispose()
    }
    this.slamZones = []
  }
}
