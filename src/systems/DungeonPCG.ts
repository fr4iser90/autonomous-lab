/**
 * DungeonPCG — Seeded procedural dungeon generator.
 * M3: BSP/room-graph with FLOOR/WALL/DOOR/STAIRS/SPAWN; BFS reachability.
 */
import * as THREE from 'three'
import { createRng, hashSeed } from '../lib/seedRng'
import type { GameRenderer } from '../render/GameRenderer'
import type { FloorTheme } from '../data/floors'
import { FLOOR_THEMES } from '../data/floors'
import type { TrapType } from '../data/traps'
import { TRAP_DEFS, randomTrapType } from '../data/traps'

export enum TileType {
  FLOOR = 0,
  WALL = 1,
  DOOR = 2,
  STAIRS = 3,
  SPAWN = 4,
  STEALTH = 5,
  TRAP = 6,
}

export interface Room {
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

export interface Cell {
  type: TileType
  roomIndex: number
}

export interface DungeonData {
  width: number
  height: number
  rooms: Room[]
  cells: Cell[]
  spawnX: number
  spawnY: number
  stairsX: number
  stairsY: number
  seed: number
  theme: FloorTheme
  floorNumber: number
  stealthTiles: Set<string>
  trapPositions: Map<string, TrapType>
}

const CELL_FLOOR = TileType.FLOOR
const CELL_WALL = TileType.WALL
const CELL_DOOR = TileType.DOOR
const CELL_STAIRS = TileType.STAIRS
const CELL_SPAWN = TileType.SPAWN
const CELL_STEALTH = TileType.STEALTH
const CELL_TRAP = TileType.TRAP

export function generateDungeon(seed: number, floorNumber: number = 1, theme: FloorTheme = FLOOR_THEMES[0]): DungeonData {
  const rng = createRng(hashSeed(seed))

  // Grid dimensions
  const cols = 30 + floorNumber * 2 // Grows with depth
  const rows = 24 + floorNumber * 2

  // Initialize all walls
  const cells: Cell[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({ type: CELL_WALL, roomIndex: -1 })
    }
  }

  // Generate rooms using simple room placement
  const maxRooms = 6 + Math.floor(floorNumber * 1.5)
  const rooms: Room[] = []
  const MIN_ROOM_W = 4
  const MIN_ROOM_H = 3
  const MAX_ROOM_W = 8
  const MAX_ROOM_H = 6

  for (let attempt = 0; attempt < maxRooms * 3 && rooms.length < maxRooms; attempt++) {
    const rw = MIN_ROOM_W + Math.floor(rng() * (MAX_ROOM_W - MIN_ROOM_W))
    const rh = MIN_ROOM_H + Math.floor(rng() * (MAX_ROOM_H - MIN_ROOM_H))
    const rx = 1 + Math.floor(rng() * (cols - rw - 2))
    const ry = 1 + Math.floor(rng() * (rows - rh - 2))

    // Check overlap
    let overlap = false
    for (const room of rooms) {
      if (rx < room.x + room.w + 2 && rx + rw + 2 > room.x &&
          ry < room.y + room.h + 2 && ry + rh + 2 > room.y) {
        overlap = true
        break
      }
    }
    if (overlap) continue

    const room: Room = { x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw / 2), cy: ry + Math.floor(rh / 2) }
    rooms.push(room)

    // Carve room
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        cells[y * cols + x].type = CELL_FLOOR
        cells[y * cols + x].roomIndex = rooms.length - 1
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1]
    const b = rooms[i]
    carveCorridor(cells, cols, rows, a.cx, a.cy, b.cx, b.cy)
  }

  // Find spawn (first room) and stairs (last room)
  const spawnRoom = rooms[0]
  const stairsRoom = rooms[rooms.length - 1]
  const spawnX = spawnRoom.cx
  const spawnY = spawnRoom.cy
  const stairsX = stairsRoom.cx
  const stairsY = stairsRoom.cy

  // Mark spawn and stairs
  cells[spawnY * cols + spawnX].type = CELL_SPAWN
  cells[stairsY * cols + stairsX].type = CELL_STAIRS

  // Generate stealth tiles — shadowy patches for P4-3 stealth zones
  const stealthTiles = new Set<string>()
  const stealthChance = 0.12 + floorNumber * 0.02 // more stealth on deeper floors
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      const cell = cells[idx]
      // Only mark non-spawn, non-stairs floor/door tiles as stealth
      if ((cell.type === CELL_FLOOR || cell.type === CELL_DOOR) &&
          !(x === spawnX && y === spawnY) &&
          !(x === stairsX && y === stairsY)) {
        if (rng() < stealthChance) {
          cell.type = TileType.STEALTH
          stealthTiles.add(`${x},${y}`)
        }
      }
    }
  }

  // Generate traps — hidden hazards for P4-4
  const trapPositions = new Map<string, TrapType>()
  const trapChance = 0.04 + floorNumber * 0.01 // more traps on deeper floors
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      const cell = cells[idx]
      // Only place on non-spawn, non-stairs, non-stealth floor/door tiles
      if ((cell.type === CELL_FLOOR || cell.type === CELL_DOOR) &&
          !(x === spawnX && y === spawnY) &&
          !(x === stairsX && y === stairsY) &&
          !stealthTiles.has(`${x},${y}`)) {
        if (rng() < trapChance) {
          const trapType = randomTrapType()
          cell.type = CELL_TRAP
          trapPositions.set(`${x},${y}`, trapType)
        }
      }
    }
  }

  // Verify reachability via BFS
  const reachable = bfsReachable(cells, cols, rows, spawnX, spawnY)
  if (!reachable.has(stairsY * cols + stairsX)) {
    // Force a path if unreachable
    carvePath(cells, cols, rows, spawnX, spawnY, stairsX, stairsY)
  }

  return {
    width: cols,
    height: rows,
    rooms,
    cells,
    spawnX,
    spawnY,
    stairsX,
    stairsY,
    seed,
    theme,
    floorNumber,
    stealthTiles,
    trapPositions,
  }
}

function carveCorridor(cells: Cell[], cols: number, rows: number, x1: number, y1: number, x2: number, y2: number): void {
  let x = x1
  let y = y1

  while (x !== x2) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      if (cells[y * cols + x].type === CELL_WALL) {
        cells[y * cols + x].type = CELL_DOOR
      }
    }
    x += x < x2 ? 1 : -1
  }
  while (y !== y2) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      if (cells[y * cols + x].type === CELL_WALL) {
        cells[y * cols + x].type = CELL_DOOR
      }
    }
    y += y < y2 ? 1 : -1
  }
  // End point
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    if (cells[y * cols + x].type === CELL_WALL) {
      cells[y * cols + x].type = CELL_DOOR
    }
  }
}

function carvePath(cells: Cell[], cols: number, rows: number, x1: number, y1: number, x2: number, y2: number): void {
  let x = x1
  let y = y1

  // First go horizontal
  while (x !== x2) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      cells[y * cols + x].type = CELL_DOOR
    }
    x += x < x2 ? 1 : -1
  }
  // Then vertical
  while (y !== y2) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      cells[y * cols + x].type = CELL_DOOR
    }
    y += y < y2 ? 1 : -1
  }
}

function bfsReachable(cells: Cell[], cols: number, rows: number, sx: number, sy: number): Set<number> {
  const visited = new Set<number>()
  const queue = [sy * cols + sx]
  visited.add(sy * cols + sx)
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  while (queue.length > 0) {
    const idx = queue.shift()!
    const cx = idx % cols
    const cy = Math.floor(idx / cols)

    for (const [dx, dy] of dirs) {
      const nx = cx + dx
      const ny = cy + dy
      const nidx = ny * cols + nx
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(nidx)) {
        const ncell = cells[nidx]
        if (ncell.type === CELL_FLOOR || ncell.type === CELL_DOOR || ncell.type === CELL_STAIRS || ncell.type === CELL_SPAWN || ncell.type === CELL_STEALTH || ncell.type === CELL_TRAP) {
          visited.add(nidx)
          queue.push(nidx)
        }
      }
    }
  }

  return visited
}

/** Build the 3D scene from dungeon data */
export function buildScene(renderer: GameRenderer, dungeon: DungeonData): void {
  const { cells, width, height, rooms, spawnX, spawnY, stairsX, stairsY, theme } = dungeon

  // Color palette from theme
  const floorColor = theme.floorColors.floor
  // wallColor and wallHighlightColor are available via renderer config

  // Floor tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y * width + x]
      const worldX = x - width / 2
      const worldZ = y - height / 2

      if (cell.type === CELL_FLOOR || cell.type === CELL_DOOR || cell.type === CELL_SPAWN || cell.type === CELL_STAIRS || cell.type === CELL_STEALTH || cell.type === CELL_TRAP) {
        // Floor tile (stealth tiles rendered darker for shadowy effect, traps sit on floor)
        const tileGeo = new THREE.BoxGeometry(0.95, 0.1, 0.95)
        const isStealth = cell.type === CELL_STEALTH
        const isTrap = cell.type === CELL_TRAP
        const baseColor = isStealth ? new THREE.Color(floorColor).multiplyScalar(0.55) : new THREE.Color(floorColor)
        const tileMat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: isTrap ? 0.7 : 0.95, // slightly smoother for trap surfaces
        })
        const tile = new THREE.Mesh(tileGeo, tileMat)
        tile.position.set(worldX, isTrap ? 0.06 : 0.05, worldZ)
        tile.receiveShadow = true
        renderer.scene.add(tile)
      }

      if (cell.type === CELL_WALL) {
        renderer.addWallBlock(worldX, worldZ)
        renderer.addWallHighlight(worldX, worldZ)
      }

      if (cell.type === CELL_DOOR) {
        // Door tile (no wall above)
        const tileGeo = new THREE.BoxGeometry(0.95, 0.1, 0.95)
        const tileMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(floorColor),
          roughness: 0.85,
        })
        const tile = new THREE.Mesh(tileGeo, tileMat)
        tile.position.set(worldX, 0.05, worldZ)
        tile.receiveShadow = true
        renderer.scene.add(tile)
      }
    }
  }

  // Stairs
  const stairGeo = new THREE.BoxGeometry(0.6, 0.15, 0.6)
  const stairMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.7,
    metalness: 0.2,
  })
  const stairs = new THREE.Mesh(stairGeo, stairMat)
  stairs.position.set(stairsX - width / 2, 0.15, stairsY - height / 2)
  stairs.castShadow = true
  renderer.scene.add(stairs)

  // Spawn marker
  const spawnGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8)
  const spawnMat = new THREE.MeshStandardMaterial({
    color: 0x44ff44,
    emissive: 0x22aa22,
    emissiveIntensity: 0.5,
  })
  const spawnMarker = new THREE.Mesh(spawnGeo, spawnMat)
  spawnMarker.position.set(spawnX - width / 2, 0.12, spawnY - height / 2)
  renderer.scene.add(spawnMarker)

  // Place torches in rooms
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i]
    const tx = room.cx - width / 2
    const tz = room.cy - height / 2
    renderer.addTorchVisual(tx + 0.5, tz + 0.5)
  }

  // Render trap visuals (spikes, poison pools, fire patches)
  renderTrapVisuals(renderer, dungeon)
}

// Re-export floor themes for convenience
export { FLOOR_THEMES } from '../data/floors'
export type { FloorTheme } from '../data/floors'

/** Check if a world-space position is on a stealth tile */
export function isOnStealthTile(dungeon: DungeonData, worldX: number, worldZ: number): boolean {
  const gridX = Math.floor(worldX + dungeon.width / 2)
  const gridY = Math.floor(worldZ + dungeon.height / 2)
  return dungeon.stealthTiles.has(`${gridX},${gridY}`)
}

/** Check if a world-space position is on a trap, and return the trap type */
export function getTrapAt(dungeon: DungeonData, worldX: number, worldZ: number): TrapType | null {
  const gridX = Math.floor(worldX + dungeon.width / 2)
  const gridY = Math.floor(worldZ + dungeon.height / 2)
  return dungeon.trapPositions.get(`${gridX},${gridY}`) ?? null
}

/** Convert world position to dungeon grid coordinates */
export function getGridPosition(dungeon: DungeonData, worldX: number, worldZ: number): [number, number] {
  return [Math.floor(worldX + dungeon.width / 2), Math.floor(worldZ + dungeon.height / 2)]
}

/** P5-4: Check if a dungeon tile at world position is a sealed door */
export function isSealedDoor(dungeon: DungeonData, worldX: number, worldZ: number): boolean {
  const [gx, gy] = getGridPosition(dungeon, worldX, worldZ)
  const cell = dungeon.cells[gy * dungeon.width + gx]
  return cell !== undefined && cell.type === TileType.DOOR
}

/** P5-4: Open a sealed door by changing its tile type to FLOOR */
export function openDoorAt(dungeon: DungeonData, worldX: number, worldZ: number): boolean {
  const [gx, gy] = getGridPosition(dungeon, worldX, worldZ)
  const idx = gy * dungeon.width + gx
  const cell = dungeon.cells[idx]
  if (cell && cell.type === TileType.DOOR) {
    cell.type = TileType.FLOOR
    return true
  }
  return false
}

/** Render trap visuals as 3D objects on the dungeon floor */
export function renderTrapVisuals(renderer: GameRenderer, dungeon: DungeonData): void {
  const trapGroup = new THREE.Group()
  trapGroup.name = 'traps'

  for (const [key, trapType] of dungeon.trapPositions) {
    const [gx, gy] = key.split(',').map(Number)
    const worldX = gx - dungeon.width / 2 + 0.5
    const worldZ = gy - dungeon.height / 2 + 0.5
    const def = TRAP_DEFS[trapType]

    if (trapType === 'spike') {
      // Spike: upward-pointing pyramid
      const geo = new THREE.ConeGeometry(0.15, 0.3, 4)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(def.color),
        emissive: new THREE.Color(def.emissive),
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.6,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(worldX, 0.15, worldZ)
      trapGroup.add(mesh)
    } else if (trapType === 'poison') {
      // Poison: flat green pool
      const geo = new THREE.CircleGeometry(0.25, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(def.color),
        emissive: new THREE.Color(def.emissive),
        emissiveIntensity: 0.2,
        roughness: 0.8,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(worldX, 0.02, worldZ)
      trapGroup.add(mesh)
    } else if (trapType === 'fire') {
      // Fire: flat orange-red patch with emissive glow
      const geo = new THREE.CircleGeometry(0.3, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(def.color),
        emissive: new THREE.Color(def.emissive),
        emissiveIntensity: 0.6,
        roughness: 1.0,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(worldX, 0.02, worldZ)
      trapGroup.add(mesh)
    }
  }

  renderer.scene.add(trapGroup)
}
