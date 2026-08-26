// HighlightMesh: Wireframe box overlay for the targeted block position

import * as THREE from 'three'

/**
 * Creates a wireframe box outline at the given world position.
 * Useful for showing which block the player is targeting.
 */
export function createHighlightBox(color: number = 0x000000): THREE.LineSegments {
  // Unit cube edges
  const vertices = new Float32Array([
    // Front face
    0, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 1,
    1, 0, 1,  0, 0, 1,
    0, 0, 1,  0, 0, 0,
    // Back face
    0, 1, 0,  1, 1, 0,
    1, 1, 0,  1, 1, 1,
    1, 1, 1,  0, 1, 1,
    0, 1, 1,  0, 1, 0,
    // Connecting edges
    0, 0, 0,  0, 1, 0,
    1, 0, 0,  1, 1, 0,
    1, 0, 1,  1, 1, 1,
    0, 0, 1,  0, 1, 1,
  ])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  const material = new THREE.LineBasicMaterial({
    color,
    linewidth: 2,
    transparent: true,
    opacity: 0.5,
  })

  return new THREE.LineSegments(geometry, material)
}

/**
 * Position the highlight box at the given world coordinates.
 */
export function positionHighlightBox(
  highlight: THREE.LineSegments,
  position: [number, number, number],
): void {
  // The highlight box geometry is a unit cube [0,1]³,
  // so we just translate it to the target position
  highlight.position.set(position[0], position[1], position[2])
}
