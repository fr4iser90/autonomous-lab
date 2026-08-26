// Particle: Simple 3D particle system for block-breaking effects

import * as THREE from 'three'

export interface ParticleEntity {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  lifetime: number // seconds remaining
  maxLifetime: number // total lifetime for alpha calculation
  scale: number // size multiplier
  mesh: THREE.Mesh | null
  dead: boolean
}

export interface ParticleConfig {
  lifetime: number // seconds
  count: number // particles per spawn
  speed: number // initial speed multiplier
  gravity: number // downward acceleration
}

export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  lifetime: 1.5,
  count: 12,
  speed: 3,
  gravity: -8,
}

export class ParticleManager {
  private particles: ParticleEntity[] = []
  private scene: THREE.Scene | null = null
  private config: ParticleConfig

  constructor(config: ParticleConfig = DEFAULT_PARTICLE_CONFIG) {
    this.config = config
  }

  /** Attach the Three.js scene for particle mesh management */
  attachScene(scene: THREE.Scene): void {
    this.scene = scene
  }

  /** Spawn block-breaking particles at the given position */
  spawnBlockBreak(x: number, y: number, z: number, color: [number, number, number]): void {
    if (!this.scene) return

    const { count, lifetime, speed } = this.config
    const baseColor = new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255)
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12)

    for (let i = 0; i < count; i++) {
      // Random direction (outward from block center)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const vx = Math.sin(phi) * Math.cos(theta) * speed * (0.5 + Math.random() * 0.5)
      const vy = Math.cos(phi) * speed * (0.3 + Math.random() * 0.5) + speed * 0.3
      const vz = Math.sin(phi) * Math.sin(theta) * speed * (0.5 + Math.random() * 0.5)

      const mat = new THREE.MeshBasicMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: 1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5)
      this.scene.add(mesh)

      this.particles.push({
        position: mesh.position.clone(),
        velocity: new THREE.Vector3(vx, vy, vz),
        color: baseColor.clone(),
        lifetime,
        maxLifetime: lifetime,
        scale: 0.8 + Math.random() * 0.4,
        mesh,
        dead: false,
      })
    }
  }

  /** Spawn mob-death particles at the given position */
  spawnMobDeath(x: number, y: number, z: number, color: [number, number, number]): void {
    if (!this.scene) return

    const count = 15
    const lifetime = 1.0
    const speed = 4
    const baseColor = new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255)
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1)

    for (let i = 0; i < count; i++) {
      // Random direction (burst from mob center)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const vx = Math.sin(phi) * Math.cos(theta) * speed * (0.6 + Math.random() * 0.4)
      const vy = Math.cos(phi) * speed * (0.4 + Math.random() * 0.6)
      const vz = Math.sin(phi) * Math.sin(theta) * speed * (0.6 + Math.random() * 0.4)

      const mat = new THREE.MeshBasicMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: 1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x + 0.5, y + 0.75, z + 0.5)
      this.scene.add(mesh)

      this.particles.push({
        position: mesh.position.clone(),
        velocity: new THREE.Vector3(vx, vy, vz),
        color: baseColor.clone(),
        lifetime,
        maxLifetime: lifetime,
        scale: 0.7 + Math.random() * 0.5,
        mesh,
        dead: false,
      })
    }
  }

  /** Update all particles — returns whether any were removed */
  update(dt: number): boolean {
    if (this.particles.length === 0) return false

    let anyRemoved = false
    const { gravity } = this.config

    for (const p of this.particles) {
      if (p.dead) continue

      p.lifetime -= dt
      if (p.lifetime <= 0) {
        p.dead = true
        p.mesh?.parent?.remove(p.mesh)
        p.mesh?.geometry?.dispose()
        const mat = p.mesh?.material
        if (mat && typeof mat === 'object' && 'dispose' in mat) {
          ;(mat as { dispose: () => void }).dispose()
        }
        anyRemoved = true
        continue
      }

      // Physics
      p.velocity.y += gravity * dt
      p.position.x += p.velocity.x * dt
      p.position.y += p.velocity.y * dt
      p.position.z += p.velocity.z * dt
      p.mesh!.position.copy(p.position)

      // Fade and shrink
      const t = p.lifetime / p.maxLifetime
      ;(p.mesh!.material as THREE.MeshBasicMaterial).opacity = Math.max(0, t)
      const s = p.scale * Math.max(0.01, t)
      p.mesh!.scale.set(s, s, s)
    }

    // Clean up dead particles
    if (anyRemoved) {
      this.particles = this.particles.filter(p => !p.dead)
    }

    return anyRemoved
  }
}
