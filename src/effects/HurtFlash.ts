// HurtFlash: Red screen flash overlay when player takes damage

import * as THREE from 'three'

export interface HurtFlashConfig {
  color: [number, number, number] // RGB flash color
  duration: number // seconds to stay visible
  opacity: number // max opacity at start
}

export const DEFAULT_HURT_FLASH_CONFIG: HurtFlashConfig = {
  color: [255, 0, 0],
  duration: 0.3,
  opacity: 0.4,
}

export class HurtFlash {
  private overlay: THREE.Mesh | null = null
  private timer: number = 0
  private active: boolean = false
  private config: HurtFlashConfig

  constructor(config: HurtFlashConfig = DEFAULT_HURT_FLASH_CONFIG) {
    this.config = config
  }

  /** Attach the Three.js scene for overlay mesh management */
  attachScene(scene: THREE.Scene, width: number, height: number): void {
    const { color } = this.config
    const geo = new THREE.PlaneGeometry(width, height)
    const mat = new THREE.MeshBasicMaterial({
      color: color[0] / 255,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.overlay = new THREE.Mesh(geo, mat)
    this.overlay.renderOrder = 999 // render on top
    this.overlay.position.z = 100 // in front of everything
    scene.add(this.overlay)
  }

  /** Trigger the flash — resets any active timer */
  trigger(): void {
    if (!this.overlay) return
    this.active = true
    this.timer = this.config.duration
    ;(this.overlay.material as THREE.MeshBasicMaterial).opacity = this.config.opacity
  }

  /** Update flash — returns whether it's still active */
  update(dt: number): boolean {
    if (!this.active || !this.overlay) return false

    this.timer -= dt
    if (this.timer <= 0) {
      this.active = false
      ;(this.overlay.material as THREE.MeshBasicMaterial).opacity = 0
      return false
    }

    // Fade linearly from max to 0
    const t = this.timer / this.config.duration
    ;(this.overlay.material as THREE.MeshBasicMaterial).opacity = this.config.opacity * t
    return true
  }
}
