/**
 * Animator — character animation controller.
 * M5: Idle, walk, attack animations for mobs and player.
 */
import * as THREE from 'three'

export type AnimationState = 'idle' | 'walk' | 'attack' | 'dead'

export class Animator {
  private state: AnimationState = 'idle'
  private time = 0
  private attackTimer = 0
  private readonly target: THREE.Object3D

  constructor(target: THREE.Object3D) {
    this.target = target
  }

  setState(state: AnimationState): void {
    this.state = state
    this.attackTimer = 0
  }

  /** Update animation each frame */
  update(dt: number): void {
    this.time += dt

    switch (this.state) {
      case 'idle':
        this.animateIdle()
        break
      case 'walk':
        this.animateWalk()
        break
      case 'attack':
        this.attackTimer += dt
        this.animateAttack()
        if (this.attackTimer > 0.5) {
          this.setState('idle')
        }
        break
      case 'dead':
        // Fade to ground
        this.target.rotation.x = THREE.MathUtils.lerp(this.target.rotation.x, Math.PI / 2, dt * 2)
        this.target.position.y = THREE.MathUtils.lerp(this.target.position.y, 0.1, dt * 2)
        break
    }
  }

  private animateIdle(): void {
    // Subtle breathing
    const breathe = Math.sin(this.time * 2) * 0.01
    this.target.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.userData.breath) {
        child.scale.y = 1 + breathe
      }
    })
  }

  private animateWalk(): void {
    const bob = Math.sin(this.time * 8) * 0.05
    this.target.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        if (child.userData.breath) {
          child.position.y += bob
        }
        // Slight sway
        if (child === this.target) {
          child.rotation.z = Math.sin(this.time * 4) * 0.03
        }
      }
    })
  }

  private animateAttack(): void {
    const t = this.attackTimer / 0.5 // 0 to 1
    // Lunge forward
    const lunge = t < 0.5 ? t * 2 : (1 - t) * 2
    this.target.position.z += lunge * 0.1
  }

  triggerAttack(): void {
    if (this.state === 'idle') {
      this.setState('attack')
    }
  }
}
