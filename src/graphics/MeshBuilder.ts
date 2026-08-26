// MeshBuilder: Voxel mesh generation with face culling, per-face UVs, and lighting-aware vertex colors

import * as THREE from 'three'
import { getBlock } from '../data/blocks'
import { TextureAtlas, type FaceType } from './TextureAtlas'
import { ChunkLighting, MAX_LIGHT } from '../physics/Lighting'

export class MeshBuilder {
  /**
   * Build a textured mesh for a chunk's visible blocks using a texture atlas
   * with per-face UV mapping (top / side / bottom) and lighting-aware vertex colors.
   */
  static buildChunk(
    chunkX: number,
    chunkZ: number,
    getBlockFn: (wx: number, wy: number, wz: number) => number,
    atlas: TextureAtlas,
    lighting: ChunkLighting | null = null,
    chunkLocalX: number = 0, // block x within chunk for torch lookup
    chunkLocalZ: number = 0,
  ): THREE.Mesh {
    const positions: number[] = []
    const uvs: number[] = []
    const colors: number[] = []
    const indices: number[] = []

    const CHUNK_WIDTH = 16
    const CHUNK_HEIGHT = 96

    // Each face: [normalX, normalY, normalZ, i0, i1, i2, i3]
    const faces: Array<{ normal: [number, number, number]; verts: [number, number, number, number]; faceType: FaceType }> = [
      { normal: [ 1, 0, 0], verts: [5, 6, 7, 4], faceType: 'side' },   // +X
      { normal: [-1, 0, 0], verts: [0, 1, 2, 3], faceType: 'side' },   // -X
      { normal: [ 0, 1, 0], verts: [7, 6, 2, 3], faceType: 'top'  },   // +Y
      { normal: [ 0,-1, 0], verts: [4, 5, 1, 0], faceType: 'bottom' }, // -Y
      { normal: [ 0, 0, 1], verts: [4, 5, 1, 0], faceType: 'side' },   // +Z
      { normal: [ 0, 0,-1], verts: [7, 6, 2, 3], faceType: 'side' },   // -Z
    ]

    // Quad vertices: [x, y, z] — local block space
    const QUAD_VERTS: [number, number, number][] = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
    ]

    let vertCount = 0

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_WIDTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const wx = chunkX * CHUNK_WIDTH + x
          const wz = chunkZ * CHUNK_WIDTH + z
          const blockId = getBlockFn(wx, y, wz)
          if (blockId === 0) continue // Air

          const blockDef = getBlock(blockId)
          if (!blockDef) continue

          // Skip torches from mesh (rendered separately or as glow)
          if (blockId === 15) continue // BlockTorch

          // Check each face
          for (const face of faces) {
            const [nx, ny, nz] = face.normal
            const [vi0, vi1, vi2, vi3] = face.verts
            const faceType = face.faceType

            const neighborBlock = getBlockFn(wx + nx, y + ny, wz + nz)

            // Only render face if neighbor is transparent or air
            if (neighborBlock > 0) {
              const neighborDef = getBlock(neighborBlock)
              if (neighborDef && !neighborDef.transparent) continue
            }

            // Get the UV quad for this face type
            const uvQuad = atlas.getFaceUVQuad(blockId, faceType)
            const [u0, v0, u1, v1, u2, v2, u3, v3] = uvQuad
            const uvArr: [number, number][] = [[u0, v0], [u1, v1], [u2, v2], [u3, v3]]

            // Get light level for vertex color (same for all 4 vertices of this face)
            let brightness = 1.0
            if (lighting) {
              const lightLevel = lighting.getTotalLight(chunkLocalX + x, y, chunkLocalZ + z)
              // Map light level 0-15 to brightness 0.25-1.0
              brightness = 0.25 + (lightLevel / MAX_LIGHT) * 0.75
            }

            // Write vertices with color
            const viArr = [vi0, vi1, vi2, vi3]
            for (let i = 0; i < 4; i++) {
              const vi = viArr[i]
              const v = QUAD_VERTS[vi]
              positions.push(wx + v[0], y + v[1], wz + v[2])
              uvs.push(uvArr[i][0], uvArr[i][1])
              colors.push(brightness, brightness, brightness)
            }

            indices.push(
              vertCount, vertCount + 1, vertCount + 2,
              vertCount, vertCount + 2, vertCount + 3,
            )
            vertCount += 4
          }
        }
      }
    }

    if (positions.length === 0) {
      return new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }))
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setIndex(indices)

    // Use MeshStandardMaterial with vertex colors and map
    const material = new THREE.MeshStandardMaterial({
      map: atlas.texture,
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.0,
    })
    return new THREE.Mesh(geometry, material)
  }

  /** Build a simple unit cube with a solid color (for testing) */
  static buildCube(color: [number, number, number]): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255),
    })
    return new THREE.Mesh(geometry, material)
  }
}
