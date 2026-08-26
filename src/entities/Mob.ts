// Mob: AI-driven entity with physics, states, and Three.js mesh

import * as THREE from 'three'
import type { MobDef } from '../data/mobs'
import { getMobDef } from '../data/mobs'
import { getBlock } from '../data/blocks'
import { World } from '../world/World'

export type MobState = 'idle' | 'wander' | 'chase' | 'flee' | 'hurt'

export interface MobEntity {
  id: number
  def: MobDef
  type: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: number // yaw in radians
  hp: number
  maxHp: number
  state: MobState
  wanderTarget: THREE.Vector3 | null
  wanderTimer: number
  hurtTimer: number
  shootCooldown: number // for skeleton ranged attacks
  mesh: THREE.Group | null
  spawnX: number
  spawnZ: number
}

export class Mob {
  private static nextId = 0

  static create(defId: number, x: number, y: number, z: number, world: World): MobEntity | null {
    const def = getMobDef(defId)
    if (!def) return null

    // Find ground level at this position
    let groundY = y
    for (let cy = 95; cy >= 0; cy--) {
      if (world.getBlock(Math.floor(x), cy, Math.floor(z)) > 0) {
        groundY = cy + 1
        break
      }
    }

    return {
      id: Mob.nextId++,
      def,
      type: def.type,
      position: new THREE.Vector3(x, groundY, z),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: Math.random() * Math.PI * 2,
      hp: def.hp,
      maxHp: def.hp,
      state: 'wander',
      wanderTarget: null,
      wanderTimer: 0,
      hurtTimer: 0,
      shootCooldown: 0,
      mesh: null,
      spawnX: x,
      spawnZ: z,
    }
  }

  static createMesh(def: MobDef, _hp: number, _maxHp: number): THREE.Group {
    const group = new THREE.Group()

    // Body
    const bodyGeo = new THREE.BoxGeometry(def.width, def.height * 0.5, def.width)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color[0] / 255, def.color[1] / 255, def.color[2] / 255),
      roughness: 0.8,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = def.height * 0.5
    group.add(body)

    // Head
    const headSize = def.width * 0.8
    const headGeo = new THREE.BoxGeometry(headSize, headSize, headSize)
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color[0] / 255, def.color[1] / 255, def.color[2] / 255),
      roughness: 0.8,
    })
    const head = new THREE.Mesh(headGeo, headMat)
    head.position.y = def.height * 0.85
    group.add(head)

    // Legs (2)
    const legGeo = new THREE.BoxGeometry(def.width * 0.35, def.height * 0.25, def.width * 0.35)
    const legMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(80, 60, 40),
      roughness: 0.9,
    })
    const leg1 = new THREE.Mesh(legGeo, legMat)
    leg1.position.set(-def.width * 0.25, def.height * 0.125, 0)
    group.add(leg1)
    const leg2 = new THREE.Mesh(legGeo, legMat)
    leg2.position.set(def.width * 0.25, def.height * 0.125, 0)
    group.add(leg2)

    // HP bar background
    const hpBarBgGeo = new THREE.PlaneGeometry(def.width + 0.2, 0.15)
    const hpBarBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
    const hpBarBg = new THREE.Mesh(hpBarBgGeo, hpBarBgMat)
    hpBarBg.position.y = def.height + 0.3
    group.add(hpBarBg)

    // HP bar
    const hpBarGeo = new THREE.PlaneGeometry(def.width, 0.1)
    const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    const hpBar = new THREE.Mesh(hpBarGeo, hpBarMat)
    hpBar.position.y = def.height + 0.3
    group.add(hpBar)
    group.userData.hpBar = hpBar
    group.userData.hpBarBg = hpBarBg

    return group
  }

  static updateHPBar(mesh: THREE.Group | null, def: { width: number }, hp: number, _maxHp: number, cameraPos?: THREE.Vector3): void {
    if (!mesh || !mesh.userData.hpBar) return
    const ratio = Math.max(0, hp / _maxHp)
    const hpBar = mesh.userData.hpBar as THREE.Mesh
    const hpBarBg = mesh.userData.hpBarBg as THREE.Mesh
    const mat = hpBar.material as THREE.MeshBasicMaterial
    // Billboard: make HP bar face the camera so it's always readable
    if (cameraPos) {
      hpBar.lookAt(cameraPos)
      hpBarBg.lookAt(cameraPos)
    }
    // Update fill
    hpBar.scale.x = ratio
    hpBar.position.x = -(def.width + 0.2) * (1 - ratio) / 2
    // Color: green (full) -> yellow (mid) -> red (low)
    if (ratio > 0.6) {
      mat.color.setRGB(0, 1, 0)
    } else if (ratio > 0.3) {
      mat.color.setRGB(1, 1, 0)
    } else {
      mat.color.setRGB(1, 0, 0)
    }
    hpBar.visible = ratio > 0
    hpBarBg.visible = true
  }

  static isLightSource(blockId: number): boolean {
    return blockId === 15 // BlockTorch
  }

  static getLightSourceLevel(blockId: number): number {
    if (blockId === 15) return 14
    return 0
  }

  /** Check if block at world position is solid */
  static isSolid(world: World, x: number, y: number, z: number): boolean {
    const blockId = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z))
    if (blockId === 0) return false
    const def = getBlock(blockId)
    return def ? def.solid : false
  }

  /** Simple collision check: does the mob's bounding box overlap solid blocks? */
  static hasCollision(world: World, entity: MobEntity): boolean {
    const w = entity.def.width
    const h = entity.def.height
    const minX = entity.position.x - w / 2
    const maxX = entity.position.x + w / 2
    const minY = entity.position.y
    const maxY = entity.position.y + h
    const minZ = entity.position.z - w / 2
    const maxZ = entity.position.z + w / 2

    for (let ix = Math.floor(minX); ix <= Math.floor(maxX); ix++) {
      for (let iy = Math.floor(minY); iy <= Math.floor(maxY); iy++) {
        for (let iz = Math.floor(minZ); iz <= Math.floor(maxZ); iz++) {
          if (this.isSolid(world, ix, iy, iz)) return true
        }
      }
    }
    return false
  }

  /** Move entity toward target with collision avoidance and obstacle steering */
  static moveToward(entity: MobEntity, targetX: number, targetZ: number, dt: number, world: World, speed: number): void {
    const dx = targetX - entity.position.x
    const dz = targetZ - entity.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 0.1) return

    const moveSpeed = Math.min(speed * dt, dist)
    const nx = dx / dist * moveSpeed
    const nz = dz / dist * moveSpeed

    entity.rotation = Math.atan2(dx, dz)

    // Try X movement
    const testX = entity.position.clone()
    testX.x += nx
    const savedX = entity.position.x
    entity.position.x = testX.x
    let blockedX = false
    if (this.hasCollision(world, entity)) {
      entity.position.x = savedX
      blockedX = true
    }

    // Try Z movement
    const savedZ = entity.position.z
    entity.position.z += nz
    let blockedZ = false
    if (this.hasCollision(world, entity)) {
      entity.position.z = savedZ
      blockedZ = true
    }

    // Phase 4 P4-1: When blocked in both axes, try sliding along the wall
    // by checking adjacent positions perpendicular to the blockage
    if (blockedX && blockedZ) {
      // Try moving along X first, then Z (and vice versa) to find a path
      const slideOptions = [
        { sx: savedX + nx * 0.5, sz: savedZ },  // partial X slide
        { sx: savedX, sz: savedZ + nz * 0.5 },   // partial Z slide
        { sx: savedX, sz: savedZ + nz },          // full Z slide (try after partial)
        { sx: savedX + nx, sz: savedZ },          // full X slide (try after partial)
      ]
      for (const opt of slideOptions) {
        entity.position.x = opt.sx
        entity.position.z = opt.sz
        if (!this.hasCollision(world, entity)) {
          break
        }
      }
    }
  }

  /** Jump if blocked below */
  static tryJump(entity: MobEntity, dt: number, world: World): void {
    const feetY = entity.position.y
    const checkY = feetY - 0.2
    const belowBlock = this.isSolid(world, entity.position.x, checkY, entity.position.z)
    const frontBlock = this.isSolid(world, entity.position.x, feetY + 0.5, entity.position.z)

    if (frontBlock && !belowBlock) {
      entity.velocity.y = 4 * dt
    }
  }

  /** Phase 4 P4-1: Try to climb 1-block steps when approaching a target */
  static tryJumpOnStairs(entity: MobEntity, dt: number, world: World, dirX: number, dirZ: number): void {
    const feetY = entity.position.y
    const headY = feetY + entity.def.height
    // Check 1 block ahead
    const aheadX = entity.position.x + dirX * entity.def.width * 0.6
    const aheadZ = entity.position.z + dirZ * entity.def.width * 0.6
    // Check if there's a block at feet level ahead
    const blockAhead = this.isSolid(world, aheadX, feetY, aheadZ)
    // Check if the space above that block is empty (can climb it)
    const aboveBlockAhead = this.isSolid(world, aheadX, headY, aheadZ)
    // Check if below us is solid (ground)
    const belowUs = this.isSolid(world, entity.position.x, feetY - 0.1, entity.position.z)

    if (blockAhead && !aboveBlockAhead && belowUs) {
      // There's a 1-block wall ahead — jump to climb it
      entity.velocity.y = 5 * dt
    }
  }

  /** AI update for a single tick */
  static updateAI(entity: MobEntity, dt: number, playerPos: THREE.Vector3, world: World): void {
    const speed = entity.def.speed

    // Countdown timers
    if (entity.hurtTimer > 0) {
      entity.hurtTimer -= dt
      if (entity.hurtTimer <= 0) {
        entity.state = entity.type === 'hostile' ? 'chase' : 'wander'
      }
    }
    if (entity.shootCooldown > 0) {
      entity.shootCooldown -= dt
    }

    // Hurt timer state
    if (entity.hurtTimer > 0) {
      this.applyPhysics(entity, dt, world)
      return
    }

    const distToPlayer = entity.position.distanceTo(playerPos)

    if (entity.type === 'hostile') {
      // Hostile mobs chase player when close
      if (distToPlayer < 16) {
        entity.state = 'chase'
        this.moveToward(entity, playerPos.x, playerPos.z, dt, world, speed * 1.2)
        // Phase 4 P4-1: Face player even when not actively moving
        entity.rotation = Math.atan2(playerPos.x - entity.position.x, playerPos.z - entity.position.z)
        // Try to climb steps toward player
        const ddx = playerPos.x - entity.position.x
        const ddz = playerPos.z - entity.position.z
        const dd = Math.sqrt(ddx * ddx + ddz * ddz)
        if (dd > 0) {
          this.tryJumpOnStairs(entity, dt, world, ddx / dd, ddz / dd)
        }
        this.tryJump(entity, dt, world)
      } else {
        // Wander when far — still face toward player
        entity.rotation = Math.atan2(playerPos.x - entity.position.x, playerPos.z - entity.position.z)
        if (entity.state !== 'wander' || entity.wanderTimer <= 0) {
          entity.wanderTarget = new THREE.Vector3(
            entity.spawnX + (Math.random() - 0.5) * 20,
            0,
            entity.spawnZ + (Math.random() - 0.5) * 20
          )
          entity.wanderTimer = 3 + Math.random() * 4
        }
        if (entity.wanderTarget) {
          this.moveToward(entity, entity.wanderTarget.x, entity.wanderTarget.z, dt, world, speed)
          this.tryJump(entity, dt, world)
        }
        entity.state = 'wander'
      }
    } else {
      // Passive mobs
      if (distToPlayer < 6) {
        entity.state = 'flee'
        // Flee from player
        const fleeX = entity.position.x - (playerPos.x - entity.position.x)
        const fleeZ = entity.position.z - (playerPos.z - entity.position.z)
        this.moveToward(entity, fleeX, fleeZ, dt, world, speed * 1.5)
        // Face away from player while fleeing
        entity.rotation = Math.atan2(entity.position.x - playerPos.x, entity.position.z - playerPos.z)
        this.tryJump(entity, dt, world)
      } else {
        // Wander
        if (entity.state !== 'wander' || entity.wanderTimer <= 0) {
          entity.wanderTarget = new THREE.Vector3(
            entity.spawnX + (Math.random() - 0.5) * 20,
            0,
            entity.spawnZ + (Math.random() - 0.5) * 20
          )
          entity.wanderTimer = 3 + Math.random() * 4
        }
        if (entity.wanderTarget) {
          this.moveToward(entity, entity.wanderTarget.x, entity.wanderTarget.z, dt, world, speed)
          this.tryJump(entity, dt, world)
        }
        entity.state = 'wander'
      }
    }

    // Wander timer countdown
    if (entity.wanderTimer > 0) {
      entity.wanderTimer -= dt
    }

    this.applyPhysics(entity, dt, world)
  }

  /** Apply knockback away from a source position */
  static applyKnockback(entity: MobEntity, fromX: number, fromZ: number, force: number): void {
    const dx = entity.position.x - fromX
    const dz = entity.position.z - fromZ
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 0.001) return

    const nx = dx / dist
    const nz = dz / dist

    entity.velocity.x += nx * force
    entity.velocity.z += nz * force
    entity.velocity.y += force * 0.3 // slight upward pop
  }

  /** Apply gravity and ground detection */
  static applyPhysics(entity: MobEntity, dt: number, world: World): void {
    // Gravity
    entity.velocity.y -= 15 * dt

    const newPos = entity.position.clone()
    newPos.y += entity.velocity.y * dt

    // Ground check
    const feetY = newPos.y - 0.1
    const blockBelow = this.isSolid(world, entity.position.x, feetY, entity.position.z)

    if (blockBelow && entity.velocity.y <= 0) {
      entity.position.y = Math.floor(feetY) + 1 + entity.def.height
      entity.velocity.y = 0
    } else {
      entity.position.y = newPos.y
    }

    // Fall into void
    if (entity.position.y < -20) {
      entity.position.set(entity.spawnX, 64, entity.spawnZ)
      entity.velocity.set(0, 0, 0)
    }
  }

  /** Deal damage to mob, return true if killed */
  static damage(entity: MobEntity, amount: number): boolean {
    entity.hp -= amount
    entity.hurtTimer = 0.5
    entity.state = 'hurt'
    return entity.hp <= 0
  }

  /** Check if mob damages player on contact */
  static checkPlayerContact(entity: MobEntity, playerPos: THREE.Vector3, playerHp: number): { damage: number; newHp: number } | null {
    if (entity.def.damage <= 0) return null

    const dist = entity.position.distanceTo(playerPos)
    if (dist < entity.def.width + 0.6) {
      const newHp = Math.max(0, playerHp - entity.def.damage)
      return { damage: entity.def.damage, newHp }
    }
    return null
  }

  /** Get drops when mob dies */
  static getDrops(entity: MobEntity): Array<{ itemId: number; count: number }> {
    const drops: Array<{ itemId: number; count: number }> = []
    for (const drop of entity.def.drops) {
      const count = drop.minCount + Math.floor(Math.random() * (drop.maxCount - drop.minCount + 1))
      if (count > 0) {
        drops.push({ itemId: drop.itemId, count })
      }
    }
    return drops
  }
}
