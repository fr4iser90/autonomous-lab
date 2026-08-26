// Raycaster: First-person DDA raycast through the voxel world

import { getBlock } from '../data/blocks'

export interface Ray {
  origin: [number, number, number]
  direction: [number, number, number]
}

export interface BlockHit {
  /** World coordinates of the hit block */
  position: [number, number, number]
  /** Surface normal at the hit face (pointing outward from the hit block) */
  normal: [number, number, number]
  /** Parametric distance along the ray to the hit face */
  distance: number
}

export interface RayOptions {
  /** Maximum distance to search (default: 6) */
  maxDistance?: number
}

/**
 * DDA voxel raycast.
 * Traces a ray through the integer grid, returning the first solid block
 * intersected. Transparent blocks that are also solid (e.g. leaves) are
 * included; truly transparent blocks (air, water) are skipped.
 *
 * Uses the Amanatides & Woo DDA algorithm for efficient voxel traversal.
 */
export function raycast(
  ray: Ray,
  getBlockFn: (wx: number, wy: number, wz: number) => number,
  options: RayOptions = {},
): BlockHit | null {
  const maxDistance = options.maxDistance ?? 6

  const [ox, oy, oz] = ray.origin
  const [dx, dy, dz] = ray.direction

  // Normalise direction
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (len === 0) return null

  const nx = dx / len
  const ny = dy / len
  const nz = dz / len

  // Starting voxel
  const startX = Math.floor(ox)
  const startY = Math.floor(oy)
  const startZ = Math.floor(oz)

  // Step directions (+1 or -1)
  const stepX = nx > 0 ? 1 : -1
  const stepY = ny > 0 ? 1 : -1
  const stepZ = nz > 0 ? 1 : -1

  // Next voxel boundary on each axis
  let tMaxX: number
  let tMaxY: number
  let tMaxZ: number

  if (nx !== 0) {
    tMaxX = nx > 0 ? (startX + 1 - ox) / nx : (startX - ox) / nx
  } else {
    tMaxX = Infinity
  }
  if (ny !== 0) {
    tMaxY = ny > 0 ? (startY + 1 - oy) / ny : (startY - oy) / ny
  } else {
    tMaxY = Infinity
  }
  if (nz !== 0) {
    tMaxZ = nz > 0 ? (startZ + 1 - oz) / nz : (startZ - oz) / nz
  } else {
    tMaxZ = Infinity
  }

  // Delta (distance to advance per step on each axis)
  const tDeltaX = nx !== 0 ? Math.abs(1 / nx) : Infinity
  const tDeltaY = ny !== 0 ? Math.abs(1 / ny) : Infinity
  const tDeltaZ = nz !== 0 ? Math.abs(1 / nz) : Infinity

  // Current and previous voxel positions
  let cx = startX
  let cy = startY
  let cz = startZ
  let px = cx
  let py = cy
  let pz = cz
  let t = 0

  while (t <= maxDistance) {
    // Check the current voxel
    const blockId = getBlockFn(cx, cy, cz)
    if (blockId > 0) {
      const blockDef = getBlock(blockId)
      // Skip truly transparent (non-solid) blocks like air/water
      if (blockDef && !blockDef.solid) {
        // step through
      } else {
        // Solid block found. Compute surface normal.
        const normal: [number, number, number] = [
          cx - px,
          cy - py,
          cz - pz,
        ]
        const absN = Math.abs(normal[0]) + Math.abs(normal[1]) + Math.abs(normal[2])
        if (absN > 0) {
          normal[0] = Math.round(normal[0] / absN)
          normal[1] = Math.round(normal[1] / absN)
          normal[2] = Math.round(normal[2] / absN)
        }

        return {
          position: [cx, cy, cz],
          normal,
          distance: t,
        }
      }
    }

    // Advance to next voxel
    px = cx
    py = cy
    pz = cz

    if (tMaxX < tMaxY) {
      if (tMaxX < tMaxZ) {
        cx += stepX
        t = tMaxX
        tMaxX += tDeltaX
      } else {
        cz += stepZ
        t = tMaxZ
        tMaxZ += tDeltaZ
      }
    } else {
      if (tMaxY < tMaxZ) {
        cy += stepY
        t = tMaxY
        tMaxY += tDeltaY
      } else {
        cz += stepZ
        t = tMaxZ
        tMaxZ += tDeltaZ
      }
    }

    if (cx < -1000 || cx > 1000 || cy < -100 || cy > 200 || cz < -1000 || cz > 1000) {
      return null
    }
  }

  return null
}

/**
 * Get the ray direction from camera position and yaw/pitch angles.
 * Matches the Player.rotation convention: yaw is Y rotation, pitch is X rotation.
 */
export function getRayFromCamera(
  position: [number, number, number],
  yaw: number,
  pitch: number,
): Ray {
  const cosYaw = Math.cos(yaw)
  const sinYaw = Math.sin(yaw)
  const cosPitch = Math.cos(pitch)
  const sinPitch = Math.sin(pitch)

  // Three.js camera: looking down -Z by default; yaw rotates around Y, pitch around X
  const dx = sinYaw * cosPitch
  const dy = sinPitch
  const dz = -cosYaw * cosPitch

  return {
    origin: position,
    direction: [dx, dy, dz],
  }
}
