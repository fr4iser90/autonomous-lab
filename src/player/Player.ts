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

  update(dt: number, keys: Set<string>, worldHasBlock: (x: number, y: number, z: number) => boolean): void {
    const s = this.state

    // Input
    let moveX = 0, moveZ = 0
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1
    if (keys.has('KeyW') || keys.has('ArrowUp')) moveZ -= 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveZ += 1

    const sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = this.speed * (sprinting ? this.sprintMultiplier : 1)

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
    if (!this.collidesAt(newPos, worldHasBlock)) {
      s.position.x = newPos.x
    }
    newPos.set(s.position.x, s.position.y, s.position.z)
    newPos.z += dz
    if (!this.collidesAt(newPos, worldHasBlock)) {
      s.position.z = newPos.z
    }

    // Vertical (gravity + jump)
    if (!s.onGround) {
      s.velocity.y -= this.gravity * dt
    }
    if ((keys.has('Space') || keys.has('KeyJ')) && s.onGround) {
      s.velocity.y = this.jumpForce
      s.onGround = false
    }

    const newPos2 = s.position.clone()
    newPos2.y += s.velocity.y * dt
    if (!this.collidesAt(newPos2, worldHasBlock)) {
      s.position.y = newPos2.y
      s.onGround = false
    } else {
      if (s.velocity.y < 0) s.onGround = true
      s.velocity.y = 0
    }

    // Clamp to world
    if (s.position.y < -10) {
      s.position.y = 80
      s.velocity.y = 0
    }
  }

  private collidesAt(pos: THREE.Vector3, worldHasBlock: (x: number, y: number, z: number) => boolean): boolean {
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
          if (hasBlock) return true // Solid block
        }
      }
    }
    return false
  }
}
