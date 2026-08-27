/**
 * PropField — InstancedMesh-based procedural prop rendering.
 * M9: Rubble, torches, bones as InstancedMesh for performance.
 */
import * as THREE from 'three'
import type { GameRenderer } from './GameRenderer'

export interface PropInstance {
  x: number
  z: number
  scale: number
  rotation: number
}

export type PropKind = 'rubble' | 'bone' | 'torch-pole'

export class PropField {
  private readonly renderer: GameRenderer
  private readonly props = new Map<PropKind, THREE.InstancedMesh>()
  private readonly propData = new Map<PropKind, PropInstance[]>()
  private readonly maxProps = 200

  constructor(renderer: GameRenderer) {
    this.renderer = renderer
  }

  /** Add a single prop instance */
  addProp(kind: PropKind, x: number, z: number, scale: number = 1, rotation: number = 0): void {
    let instances = this.propData.get(kind)
    if (!instances) {
      instances = []
      this.propData.set(kind, instances)
    }

    if (instances.length >= this.maxProps) return

    instances.push({ x, z, scale, rotation })

    // Update or create instanced mesh
    this.updatePropMesh(kind)
  }

  /** Build InstancedMesh for a prop kind */
  private updatePropMesh(kind: PropKind): void {
    // Remove existing
    const existing = this.props.get(kind)
    if (existing) {
      this.renderer.scene.remove(existing)
      existing.geometry.dispose()
      ;(existing.material as THREE.Material).dispose()
    }

    const instances = this.propData.get(kind) || []
    if (instances.length === 0) {
      this.props.delete(kind)
      return
    }

    const geo = this.getPropGeometry(kind)
    const mat = this.getPropMaterial(kind)
    const instancedMesh = new THREE.InstancedMesh(geo, mat, instances.length)

    const matrix = new THREE.Matrix4()
    const pos = new THREE.Vector3()
    const rot = new THREE.Euler()
    const scl = new THREE.Vector3()

    instances.forEach((inst, i) => {
      pos.set(inst.x, inst.z > 0 ? 0.1 : 0.05, inst.z)
      rot.set(0, inst.rotation, 0)
      scl.set(inst.scale, inst.scale, inst.scale)
      matrix.compose(pos, new THREE.Quaternion().setFromEuler(rot), scl)
      instancedMesh.setMatrixAt(i, matrix)
    })

    instancedMesh.instanceMatrix.needsUpdate = true
    instancedMesh.castShadow = true
    instancedMesh.receiveShadow = true
    this.renderer.scene.add(instancedMesh)
    this.props.set(kind, instancedMesh)
  }

  private getPropGeometry(kind: PropKind): THREE.BufferGeometry {
    switch (kind) {
      case 'rubble':
        return new THREE.DodecahedronGeometry(0.2, 0)
      case 'bone':
        return new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6)
      case 'torch-pole':
        return new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4)
    }
  }

  private getPropMaterial(kind: PropKind): THREE.MeshStandardMaterial {
    switch (kind) {
      case 'rubble':
        return new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.95 })
      case 'bone':
        return new THREE.MeshStandardMaterial({ color: 0xccbbaa, roughness: 0.8 })
      case 'torch-pole':
        return new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 })
    }
  }

  /** Clear all props */
  clearAll(): void {
    this.props.forEach((mesh) => {
      this.renderer.scene.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    })
    this.props.clear()
    this.propData.clear()
  }
}
