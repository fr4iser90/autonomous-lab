/**
 * HitEffects — visual combat feedback.
 * P8-1: Hit flash, floating damage numbers, hit particles.
 */
import * as THREE from 'three'

/** Configuration for a floating damage number */
export interface FloatingNumber {
  value: number
  position: THREE.Vector3
  isCritical: boolean
  bornTime: number // game time when spawned
}

/** Configuration for a hit particle burst */
export interface HitParticle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: number
  bornTime: number
  lifeTime: number // seconds to live
}

/** Configuration for a mob hit flash */
export interface HitFlash {
  mesh: THREE.Object3D
  bornTime: number
  lifeTime: number
  originalColor: number
  flashColor: number
}

export class HitEffects {
  private floatingNumbers: FloatingNumber[] = []
  private particles: HitParticle[] = []
  private flashMeshes: Map<THREE.Object3D, HitFlash> = new Map()

  /** Temporary geometry reused across particles */
  private _particleGeo: THREE.SphereGeometry = new THREE.SphereGeometry(0.04, 4, 3)

  constructor() {
    // No dependencies — all methods take scene as parameter
  }

  /** Spawn floating damage number above a mob */
  spawnDamageNumber(value: number, position: THREE.Vector3, isCritical: boolean): void {
    this.floatingNumbers.push({
      value,
      position: position.clone(),
      isCritical,
      bornTime: performance.now() / 1000,
    })
  }

  /** Spawn a hit particle burst at a position */
  spawnHitBurst(position: THREE.Vector3, count: number = 6, color: number = 0xffaa33): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 1.5 + Math.random() * 2
      this.particles.push({
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          1 + Math.random() * 2,
          Math.sin(angle) * speed,
        ),
        color,
        bornTime: performance.now() / 1000,
        lifeTime: 0.3 + Math.random() * 0.3,
      })
    }
  }

  /** Trigger flash effect on an object when hit */
  triggerHitFlash(obj: THREE.Object3D, flashColor: number = 0xffffff, lifeTime: number = 0.12): void {
    // Flash all child meshes
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material
        if (Array.isArray(mat)) {
          for (const m of mat) {
            if (m instanceof THREE.MeshStandardMaterial && m.color) {
              const origColor = m.color.getHex()
              this.flashMeshes.set(child, {
                mesh: child,
                bornTime: performance.now() / 1000,
                lifeTime,
                originalColor: origColor,
                flashColor,
              })
            }
          }
        } else if (mat instanceof THREE.MeshStandardMaterial && mat.color) {
          const origColor = mat.color.getHex()
          this.flashMeshes.set(child, {
            mesh: child,
            bornTime: performance.now() / 1000,
            lifeTime,
            originalColor: origColor,
            flashColor,
          })
        }
      }
    })
  }

  /** Update all hit effects for the current frame */
  update(currentTime: number, dt: number, _scene: THREE.Scene): void {
    // Update floating damage numbers — move up and fade
    this.floatingNumbers = this.floatingNumbers.filter(fn => {
      const age = currentTime - fn.bornTime
      if (age > 1.0) return false // expire after 1 second
      // Float upward
      fn.position.y += dt * 1.5
      return true
    })

    // Update particles — move and expire
    this.particles = this.particles.filter(p => {
      const age = currentTime - p.bornTime
      if (age > p.lifeTime) return false
      p.velocity.y -= dt * 5 // gravity
      p.position.add(p.velocity.clone().multiplyScalar(dt))
      return true
    })

    // Update flash meshes — restore original color over time
    const expiredFlash: THREE.Object3D[] = []
    for (const [obj, flash] of this.flashMeshes) {
      const age = currentTime - flash.bornTime
      const progress = Math.min(age / flash.lifeTime, 1)
      const mat = (obj as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (mat && mat.color) {
        // Interpolate from flash back to original
        const flashVec = new THREE.Color(flash.flashColor)
        const origVec = new THREE.Color(flash.originalColor)
        const currentColor = flashVec.lerp(origVec, progress)
        mat.color.copy(currentColor)
      }
      if (progress >= 1) {
        expiredFlash.push(obj)
      }
    }
    for (const obj of expiredFlash) {
      this.flashMeshes.delete(obj)
    }
  }

  /** Render floating damage numbers as 3D sprite labels in the scene */
  renderFloatingNumbers(scene: THREE.Scene): void {
    // Remove old labels
    const existingLabels = scene.children.filter(c => c.userData.isDamageLabel)
    for (const label of existingLabels) {
      scene.remove(label)
      if (label instanceof THREE.Mesh) {
        label.geometry.dispose()
        ;(label.material as THREE.Material).dispose()
      }
    }

    // Spawn new labels
    const currentTime = performance.now() / 1000
    for (const fn of this.floatingNumbers) {
      const age = currentTime - fn.bornTime
      if (age > 1.0) continue

      const opacity = Math.max(0, 1 - age / 1.0)
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 128, 64)
      ctx.font = `bold ${fn.isCritical ? 48 : 36}px Arial`
      ctx.textAlign = 'center'
      ctx.fillStyle = fn.isCritical ? '#ff4444' : '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = fn.isCritical ? 4 : 2
      ctx.strokeText(`-${fn.value}`, 64, 44)
      ctx.fillText(`-${fn.value}`, 64, 44)

      const texture = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.position.copy(fn.position)
      sprite.position.y += 1.5
      sprite.scale.set(0.5, 0.25, 1)
      sprite.userData.isDamageLabel = true
      scene.add(sprite)
    }
  }

  /** Render particles as small spheres in the scene */
  renderParticles(scene: THREE.Scene): void {
    // Remove old particles
    const existing = scene.children.filter(c => c.userData.isHitParticle)
    for (const p of existing) {
      scene.remove(p)
      if (p instanceof THREE.Mesh) {
        p.geometry.dispose()
        ;(p.material as THREE.Material).dispose()
      }
    }

    const currentTime = performance.now() / 1000
    for (const pt of this.particles) {
      const age = currentTime - pt.bornTime
      const lifeRatio = 1 - age / pt.lifeTime
      const mat = new THREE.MeshBasicMaterial({
        color: pt.color,
        transparent: true,
        opacity: lifeRatio,
      })
      const mesh = new THREE.Mesh(this._particleGeo, mat)
      mesh.position.copy(pt.position)
      mesh.userData.isHitParticle = true
      scene.add(mesh)
    }
  }

  /** Clear all effects */
  clear(): void {
    this.floatingNumbers = []
    this.particles = []
    this.flashMeshes.clear()
  }
}
