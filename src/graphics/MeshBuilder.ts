// MeshBuilder: Voxel mesh generation with face culling and procedural texture atlas UVs

import * as THREE from 'three'
import { getBlock } from '../data/blocks'
import { TextureAtlas } from './TextureAtlas'

export class MeshBuilder {
  /** Build a textured mesh for a chunk's visible blocks using a texture atlas */
  static buildChunk(
    chunkX: number,
    chunkZ: number,
    getBlockFn: (wx: number, wy: number, wz: number) => number,
    atlas: TextureAtlas,
  ): THREE.Mesh {
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    const CHUNK_WIDTH = 16
    const CHUNK_HEIGHT = 96

    // Each face: [normalX, normalY, normalZ, i0, i1, i2, i3] where i* are vertex indices into quad vertices
    const faces: Array<[number, number, number, number, number, number, number]> = [
      // +X face (right)
      [ 1, 0, 0, 5, 6, 7, 4],
      // -X face (left)
      [-1, 0, 0, 0, 1, 2, 3],
      // +Y face (top)
      [ 0, 1, 0, 7, 6, 2, 3],
      // -Y face (bottom)
      [ 0,-1, 0, 4, 5, 1, 0],
      // +Z face (front)
      [ 0, 0, 1, 4, 5, 1, 0],
      // -Z face (back)
      [ 0, 0,-1, 7, 6, 2, 3],
    ]

    // Quad vertices: [x, y, z]
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

          // Get UVs for all 6 faces of this block
          const faceUVs = atlas.getUVsForBlock(blockId)

          // Check each face
          for (let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
            const face = faces[faceIdx]
            const nx = face[0], ny = face[1], nz = face[2]
            const vi0 = face[3], vi1 = face[4], vi2 = face[5], vi3 = face[6]

            const neighborBlock = getBlockFn(wx + nx, y + ny, wz + nz)

            // Only render face if neighbor is transparent or air
            if (neighborBlock > 0) {
              const neighborDef = getBlock(neighborBlock)
              if (neighborDef && !neighborDef.transparent) continue
            }

            // Get the UV quad for this face
            const uvQuad = atlas.getFaceUVs(blockId, faceIdx)
            const [u0, v0, u1, v1, u2, v2, u3, v3] = uvQuad

            // UV mapping for the quad: vertex order matches QUAD_VERTS indices
            const viArr = [vi0, vi1, vi2, vi3]
            const uvArr = [
              [u0, v0], [u1, v1], [u2, v2], [u3, v3]
            ]

            for (let vi_ = 0; vi_ < viArr.length; vi_++) {
              const vi = viArr[vi_]
              const v = QUAD_VERTS[vi]
              positions.push(wx + v[0], y + v[1], wz + v[2])
              uvs.push(uvArr[vi_][0], uvArr[vi_][1])
            }

            indices.push(
              vertCount, vertCount + 1, vertCount + 2,
              vertCount, vertCount + 2, vertCount + 3
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
    geometry.setIndex(indices)

    const material = new THREE.MeshBasicMaterial({ map: atlas.texture })
    return new THREE.Mesh(geometry, material)
  }

  /** Build a simple mesh for a small set of blocks (for testing) */
  static buildCube(color: [number, number, number]): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255) })
    return new THREE.Mesh(geometry, material)
  }
}
