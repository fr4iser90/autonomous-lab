// Player: First-person player controller with WASD, jump, sprint, collision

import * as THREE from 'three'

export interface PlayerState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Vector2 // [yaw, pitch]
  onGround: boolean
  hp: number
}

export class Player {
  public state: PlayerState
  public speed: number
  public sprintMultiplier: number
  public jumpForce: number
  public gravity: number
  public width: number
  public height: number
  public waterDrag: number
  public lavaDamageTimer: number

  constructor(x: number, y: number, z: number) {
    this.state = {
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Vector2(0, 0),
      onGround: false,
      hp: 20,
    }
    this.speed = 5
    this.sprintMultiplier = 1.5
    this.jumpForce = 8
    this.gravity = 20
    this.width = 0.6
    this.height = 1.8
    this.waterDrag = 0.8 // Speed reduction factor in water
    this.lavaDamageTimer = 0
  }

  reset(x: number, y: number, z: number): void {
    this.state.position.set(x, y, z)
    this.state.velocity.set(0, 0, 0)
    this.state.onGround = false
  }

  /** Get bounding box */
  getBounds(): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
    const p = this.state.position
    return {
      minX: p.x - this.width / 2,
      maxX: p.x + this.width / 2,
      minY: p.y,
      maxY: p.y + this.height,
      minZ: p.z - this.width / 2,
      maxZ: p.z + this.width / 2,
    }
  }

  update(dt: number, keys: Set<string>, worldHasBlock: (x: number, y: number, z: number) => boolean, isLiquid: (x: number, y: number, z: number) => boolean, isLava: (x: number, y: number, z: number) => boolean): void {
    const s = this.state

    // M11: Check if player is in water or lava
    const checkX = Math.round(s.position.x)
    const checkY = Math.round(s.position.y)
    const checkZ = Math.round(s.position.z)
    const inWater = isLiquid(checkX, checkY, checkZ)
    const inLava = isLava(checkX, checkY, checkZ)
    const headY = Math.round(s.position.y + this.height - 0.1)
    const headInWater = isLiquid(checkX, headY, checkZ)

    // M11: Input with water drag
    let moveX = 0, moveZ = 0
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1
    if (keys.has('KeyW') || keys.has('ArrowUp')) moveZ -= 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveZ += 1

    const sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight')
    let speed = this.speed * (sprinting ? this.sprintMultiplier : 1)
    let gravity = this.gravity
    let jumpForce = this.jumpForce

    // M11: Water physics - drag and reduced gravity
    if (inWater || headInWater) {
      speed *= (1 - this.waterDrag)
      gravity *= 0.3
      jumpForce = this.jumpForce * 1.5 // Stronger jump in water
    }
    // M11: Lava physics - heavy drag
    if (inLava) {
      speed *= 0.2
      gravity *= 0.5
    }

    // Normalize diagonal
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ)
    if (len > 0) {
      moveX /= len
      moveZ /= len
    }

    // Apply rotation to movement
    const yaw = s.rotation.y
    const dx = (moveX * Math.cos(yaw) - moveZ * Math.sin(yaw)) * speed * dt
    const dz = (moveX * Math.sin(yaw) + moveZ * Math.cos(yaw)) * speed * dt

    // Horizontal collision
    const newPos = s.position.clone()
    newPos.x += dx
    if (!this.collidesAt(newPos, worldHasBlock, isLiquid)) {
      s.position.x = newPos.x
    }
    newPos.set(s.position.x, s.position.y, s.position.z)
    newPos.z += dz
    if (!this.collidesAt(newPos, worldHasBlock, isLiquid)) {
      s.position.z = newPos.z
    }

    // Vertical (gravity + jump)
    if (!s.onGround) {
      s.velocity.y -= gravity * dt
    }
    if ((keys.has('Space') || keys.has('KeyJ')) && s.onGround) {
      s.velocity.y = jumpForce
      s.onGround = false
    }

    const newPos2 = s.position.clone()
    newPos2.y += s.velocity.y * dt
    if (!this.collidesAt(newPos2, worldHasBlock, isLiquid)) {
      s.position.y = newPos2.y
      s.onGround = false
    } else {
      if (s.velocity.y < 0) s.onGround = true
      s.velocity.y = 0
    }

    // M11: Lava damage
    if (inLava) {
      this.lavaDamageTimer += dt
      if (this.lavaDamageTimer >= 0.5) {
        this.lavaDamageTimer = 0
        s.hp = Math.max(0, s.hp - 1)
      }
    } else {
      this.lavaDamageTimer = 0
    }

    // M11: Drowning in water (slowly lose hp)
    if (inWater && !headInWater) {
      // Player's head is out, they can breathe
    } else if (inWater && headInWater) {
      // Head submerged - could add drowning timer here
    }

    // Clamp to world
    if (s.position.y < -10) {
      s.position.y = 80
      s.velocity.y = 0
    }
  }

  private collidesAt(
    pos: THREE.Vector3,
    worldHasBlock: (x: number, y: number, z: number) => boolean,
    isLiquid: (x: number, y: number, z: number) => boolean,
  ): boolean {
    const b = {
      minX: pos.x - this.width / 2,
      maxX: pos.x + this.width / 2,
      minY: pos.y,
      maxY: pos.y + this.height,
      minZ: pos.z - this.width / 2,
      maxZ: pos.z + this.width / 2,
    }

    for (let ix = Math.floor(b.minX); ix <= Math.floor(b.maxX); ix++) {
      for (let iy = Math.floor(b.minY); iy <= Math.floor(b.maxY); iy++) {
        for (let iz = Math.floor(b.minZ); iz <= Math.floor(b.maxZ); iz++) {
          const hasBlock = worldHasBlock(ix + 0.5, iy + 0.5, iz + 0.5)
          if (hasBlock && !isLiquid(ix + 0.5, iy + 0.5, iz + 0.5)) {
            return true // Solid block (liquids are passable)
          }
        }
      }
    }
    return false
  }
}
