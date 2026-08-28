/**
 * Spider — small fast arachnid that shoots webs at players from distance.
 * P2-2: New mob kit variant (mobKits 9/16).
 */
import * as THREE from 'three'
import type { GameRenderer } from '../render/GameRenderer'
import { MobKit, type MobType, type MobStats } from './MobKit'

const SPIDER_STATS: MobStats = {
  hp: 6,
  maxHp: 6,
  damage: 2,
  speed: 0.6,
  aggroRange: 10,
  chaseSpeed: 3.5,
}

export class Spider extends MobKit {
  bodyMesh!: THREE.Mesh
  legs: THREE.Mesh[] = []
  webTimer = 0

  constructor(renderer: GameRenderer, stats: MobStats = SPIDER_STATS) {
    super(renderer, 'spider', stats)
  }

  buildMesh(_renderer: GameRenderer, _type: MobType): void {
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 })
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.7 })

    // Abdomen (large rear)
    const abdomenGeo = new THREE.SphereGeometry(0.2, 8, 6)
    const abdomen = new THREE.Mesh(abdomenGeo, bodyMat)
    abdomen.position.set(0, 0.15, -0.12)
    abdomen.scale.set(1, 0.8, 1.2)
    this.bodyMesh = abdomen
    this.mesh.add(abdomen)

    // Cephalothorax (front body)
    const cephGeo = new THREE.SphereGeometry(0.12, 8, 6)
    const ceph = new THREE.Mesh(cephGeo, bodyMat)
    ceph.position.set(0, 0.2, 0.08)
    this.mesh.add(ceph)

    // Eyes (4 red emissive)
    const eyeGeo = new THREE.SphereGeometry(0.02, 4, 4)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff0000, emissiveIntensity: 1.5 })
    interface EyePos { x: number; y: number; z: number }
    const eyePositions: EyePos[] = [
      { x: -0.05, y: 0.25, z: 0.18 },
      { x: -0.02, y: 0.26, z: 0.2 },
      { x: 0.02, y: 0.26, z: 0.2 },
      { x: 0.05, y: 0.25, z: 0.18 },
    ]
    eyePositions.forEach((ep) => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat)
      eye.position.set(ep.x, ep.y, ep.z)
      this.mesh.add(eye)
    })

    // 8 legs
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const legGeo = new THREE.CylinderGeometry(0.008, 0.006, 0.3, 4)
        const leg = new THREE.Mesh(legGeo, legMat)
        leg.position.set(side * (0.1 + i * 0.05), 0.05, -0.08 + i * 0.06)
        leg.rotation.z = side * (0.4 + i * 0.2)
        leg.rotation.y = side * 0.3
        leg.userData.bob = true
        this.mesh.add(leg)
        this.legs.push(leg)
      }
    }

    // Fangs
    const fangGeo = new THREE.ConeGeometry(0.015, 0.06, 4)
    const fangMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.5 })
    const fangXs: number[] = [-0.04, 0.04]
    fangXs.forEach((fx) => {
      const fang = new THREE.Mesh(fangGeo, fangMat)
      fang.position.set(fx, 0.12, 0.18)
      fang.rotation.x = -0.3
      this.mesh.add(fang)
    })
  }

  /** Spider scuttles toward player and occasionally shoots webs */
  webAttack(dt: number, playerX: number, playerZ: number): void {
    if (!this.state.alive) return

    const dist = this.distanceTo(playerX, playerZ)
    const speed = this.state.stats

    if (dist <= speed.aggroRange && dist > 0.8) {
      const dx = playerX - this.position.x
      const dz = playerZ - this.position.z
      const len = Math.sqrt(dx * dx + dz * dz)

      const jitter = Math.sin(this.walkTime * 15) * 0.3
      this.position.x += (dx / len) * speed.chaseSpeed * dt + jitter * dt
      this.position.z += (dz / len) * speed.chaseSpeed * dt
      this.position.y = Math.sin(this.walkTime * 3) * 0.02
      this.mesh.position.copy(this.position)

      const angle = Math.atan2(dx, dz)
      this.mesh.rotation.y = angle

      this.legs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(this.walkTime * 12 + i * 0.8) * 0.3
      })

      this.webTimer -= dt
      if (dist <= 5.0 && this.webTimer <= 0) {
        this.shootWeb()
        this.webTimer = 2.5 + Math.random() * 1.5
      }
    }
  }

  private shootWeb(): void {
    const webGeo = new THREE.SphereGeometry(0.05, 4, 4)
    const webMat = new THREE.MeshStandardMaterial({ color: 0xeeddcc, emissive: 0x888877, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 })
    const web = new THREE.Mesh(webGeo, webMat)
    web.position.copy(this.mesh.position)
    web.position.y += 0.1
    web.userData.isWeb = true
    web.userData.startTime = this.renderer.getElapsedTime()
    web.userData.lifetime = 0.4
    this.renderer.scene.add(web)
  }
}
