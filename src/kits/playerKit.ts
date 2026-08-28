/**
 * PlayerKit — creates the hero mesh from primitives.
 * M4: Player kit (capsule + simple helm/cloak).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import type { StatusEffect } from '../data/statusEffects'

export class PlayerKit {
  readonly mesh: THREE.Group
  readonly position = new THREE.Vector3(0, 0, 0)
  scrap: number = 0
  statusEffects: StatusEffect[] = [] // active status effects
  private readonly bodyMesh: THREE.Mesh
  private readonly headMesh: THREE.Mesh
  private readonly cloakMesh: THREE.Mesh

  constructor(renderer: GameRenderer) {
    this.mesh = new THREE.Group()

    // Body (capsule-like: cylinder + hemispheres)
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 8)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.8,
      metalness: 0.1,
    })
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    this.bodyMesh.position.y = 0.6
    this.bodyMesh.castShadow = true
    this.mesh.add(this.bodyMesh)

    // Head (sphere with helm)
    const headGeo = new THREE.SphereGeometry(0.22, 8, 8)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xc8a882,
      roughness: 0.7,
    })
    this.headMesh = new THREE.Mesh(headGeo, headMat)
    this.headMesh.position.y = 1.4
    this.headMesh.castShadow = true
    this.mesh.add(this.headMesh)

    // Helm (cone)
    const helmGeo = new THREE.ConeGeometry(0.25, 0.25, 8)
    const helmMat = new THREE.MeshStandardMaterial({
      color: 0x4a3a2a,
      roughness: 0.6,
      metalness: 0.3,
    })
    const helm = new THREE.Mesh(helmGeo, helmMat)
    helm.position.y = 1.55
    helm.castShadow = true
    this.mesh.add(helm)

    // Cloak (inverted cone)
    const cloakGeo = new THREE.ConeGeometry(0.35, 0.8, 8)
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x2a2530,
      roughness: 0.9,
    })
    this.cloakMesh = new THREE.Mesh(cloakGeo, cloakMat)
    this.cloakMesh.position.y = 0.4
    this.cloakMesh.castShadow = true
    this.mesh.add(this.cloakMesh)

    renderer.scene.add(this.mesh)
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z)
    this.mesh.position.copy(this.position)
  }

  /** Animate walk bob */
  animateWalk(time: number, intensity: number = 1): void {
    const bob = Math.sin(time * 8) * 0.03 * intensity
    this.bodyMesh.position.y = 0.6 + bob
    this.headMesh.position.y = 1.4 + bob
  }

  /** Set animation state: idle, walk, attack */
  setAnimation(state: 'idle' | 'walk' | 'attack'): void {
    switch (state) {
      case 'idle':
        this.bodyMesh.scale.y = 1
        this.cloakMesh.rotation.x = 0
        break
      case 'walk':
        // handled by animateWalk
        break
      case 'attack':
        // Lean forward
        this.bodyMesh.rotation.x = 0.1
        this.cloakMesh.rotation.x = 0.15
        break
    }
  }

  resetAnimation(): void {
    this.bodyMesh.rotation.x = 0
    this.cloakMesh.rotation.x = 0
  }

  dispose(): void {
    this.mesh.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    })
  }
}
