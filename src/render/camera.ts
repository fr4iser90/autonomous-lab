/**
 * Camera module — FollowCamera (third-person) and FirstPersonCamera (ego).
 * M2: Camera stub with distance, FOV, follow lag, clamp.
 */
import * as THREE from 'three'
import type { GameRenderer } from './GameRenderer'

// ── Shared types ──────────────────────────────────────────

export type CameraMode = 'first-person' | 'third-person'

export interface CameraSettings {
  distance: number   // Behind player (3rd-person)
  height: number     // Above player (3rd-person)
  FOV: number
  followLag: number  // 0-1 interpolation factor
  yawClamp?: [number, number]
  pitchClamp?: [number, number]
}

// ── Interface (both cameras share these methods) ──────────

export interface ICamera {
  update(renderer: GameRenderer, target: THREE.Vector3, yaw: number, shakeOffset: THREE.Vector3 | null): void
  syncYaw(playerYaw: number): void
  getYaw(): number
  onPointerDown(clientX: number, clientY: number): void
  onPointerMove(clientX: number, clientY: number, sensitivity: number): void
  onPointerUp(): void
  reset(): void
  setFOV(fov: number): void
  getFov(): number
}

// ── Third-person follow camera ────────────────────────────

export class FollowCamera implements ICamera {
  private currentPos = new THREE.Vector3(0, 5, 12)

  readonly settings: CameraSettings
  private _yawAngle = 0
  private _mouseDown = false
  private _lastMouseX = 0

  constructor(settings: CameraSettings) {
    this.settings = settings
  }

  /** Update camera to follow the target (with optional shake offset). */
  update(renderer: GameRenderer, target: THREE.Vector3, yaw: number, shakeOffset: THREE.Vector3 | null = null): void {
    const { distance, height, followLag } = this.settings

    // Target camera position based on yaw
    const targetCamX = target.x - Math.sin(yaw) * distance
    const targetCamZ = target.z + Math.cos(yaw) * distance
    const targetCamY = target.y + height

    // Smooth interpolation
    const lag = followLag
    this.currentPos.x += (targetCamX - this.currentPos.x) * lag
    this.currentPos.y += (targetCamY - this.currentPos.y) * lag
    this.currentPos.z += (targetCamZ - this.currentPos.z) * lag

    // Apply shake offset (P8-1: combat feedback)
    if (shakeOffset) {
      this.currentPos.x += shakeOffset.x
      this.currentPos.y += shakeOffset.y
      this.currentPos.z += shakeOffset.z
    }

    // Look target (slightly above player for angled view)
    const lookX = target.x
    const lookY = target.y + 1.0
    const lookZ = target.z

    renderer.camera.position.copy(this.currentPos)
    renderer.camera.lookAt(lookX, lookY, lookZ)
  }

  /** Sync camera yaw with player yaw (called once at game start and on floor load). */
  syncYaw(playerYaw: number): void {
    this._yawAngle = playerYaw
  }

  /** Return the current camera yaw for debug / logging. */
  getYaw(): number {
    return this._yawAngle
  }

  /** Handle mouse down — start accumulating rotation. */
  onPointerDown(clientX: number, _clientY: number): void {
    this._mouseDown = true
    this._lastMouseX = clientX
  }

  /** Handle mouse move — accumulate rotation while mouse is down. */
  onPointerMove(clientX: number, _clientY: number, sensitivity: number = 50): void {
    if (!this._mouseDown) return
    const dx = clientX - this._lastMouseX
    this._yawAngle -= dx * 0.005 * (sensitivity / 50)
    this._lastMouseX = clientX
  }

  /** Handle mouse up — stop accumulating rotation. */
  onPointerUp(): void {
    this._mouseDown = false
  }

  setFOV(_fov: number): void {
    // FollowCamera uses settings.FOV; no-op for external override
  }

  getFov(): number {
    return this.settings.FOV
  }

  reset(): void {
    this.currentPos.set(0, 5, 12)
    this._yawAngle = 0
    this._mouseDown = false
  }
}

// ── First-person ego camera ───────────────────────────────

export class FirstPersonCamera implements ICamera {
  /** Eye height above player feet (units) */
  readonly eyeHeight: number
  /** Current FOV in degrees */
  private _fov: number
  /** Current pitch (vertical angle) in radians, clamped */
  private _pitch = 0
  private _pitchClamp: [number, number]
  private _yawAngle = 0
  private _mouseDown = false
  private _lastMouseX = 0
  private _lastMouseY = 0

  constructor(options?: {
    eyeHeight?: number
    FOV?: number
    pitchClamp?: [number, number]
  }) {
    this.eyeHeight = options?.eyeHeight ?? 1.6
    this._fov = options?.FOV ?? 75
    this._pitchClamp = options?.pitchClamp ?? [-(Math.PI / 2) + 0.01, (Math.PI / 2) - 0.01]
  }

  /** Position camera at eye height, look along yaw ± pitch. */
  update(renderer: GameRenderer, target: THREE.Vector3, yaw: number, shakeOffset: THREE.Vector3 | null = null): void {
    this._yawAngle = yaw

    // Camera sits at player eye height
    const camY = target.y + this.eyeHeight

    // Look direction from yaw (horizontal) and pitch (vertical)
    const lookX = target.x + Math.sin(yaw) * Math.cos(this._pitch)
    const lookY = camY + Math.sin(this._pitch)
    const lookZ = target.z + Math.cos(yaw) * Math.cos(this._pitch)

    const pos = renderer.camera.position
    pos.set(target.x, camY, target.z)

    // Apply shake offset to camera position (P8-1: combat feedback)
    if (shakeOffset) {
      pos.x += shakeOffset.x
      pos.y += shakeOffset.y
      pos.z += shakeOffset.z
    }

    renderer.camera.lookAt(lookX, lookY, lookZ)
  }

  /** Sync camera yaw with player yaw (called once at game start and on floor load). */
  syncYaw(playerYaw: number): void {
    this._yawAngle = playerYaw
  }

  /** Return the current camera yaw for debug / logging. */
  getYaw(): number {
    return this._yawAngle
  }

  /** Handle mouse down — start accumulating look rotation. */
  onPointerDown(clientX: number, clientY: number): void {
    this._mouseDown = true
    this._lastMouseX = clientX
    this._lastMouseY = clientY
  }

  /** Handle mouse move — accumulate yaw (horizontal) and pitch (vertical) rotation. */
  onPointerMove(clientX: number, clientY: number, sensitivity: number = 50): void {
    if (!this._mouseDown) return

    const factor = 0.005 * (sensitivity / 50)

    // Horizontal drag → yaw
    const dx = clientX - this._lastMouseX
    this._yawAngle -= dx * factor

    // Vertical drag → pitch
    const dy = clientY - this._lastMouseY
    this._pitch += dy * factor

    // Clamp pitch to prevent flipping
    if (this._pitch < this._pitchClamp[0]) this._pitch = this._pitchClamp[0]
    if (this._pitch > this._pitchClamp[1]) this._pitch = this._pitchClamp[1]

    this._lastMouseX = clientX
    this._lastMouseY = clientY
  }

  /** Handle mouse up — stop accumulating rotation. */
  onPointerUp(): void {
    this._mouseDown = false
  }

  /** Set FOV (called by GameRenderer on resize/settings change). */
  setFOV(fov: number): void {
    this._fov = fov
  }

  /** Get current FOV. */
  getFov(): number {
    return this._fov
  }

  /** Apply a pitch delta from GameLoop (pointer-lock accumulates in InputManager). */
  onPitchDelta(delta: number): void {
    this._pitch += delta
    if (this._pitch < this._pitchClamp[0]) this._pitch = this._pitchClamp[0]
    if (this._pitch > this._pitchClamp[1]) this._pitch = this._pitchClamp[1]
  }

  reset(): void {
    this._yawAngle = 0
    this._pitch = 0
    this._mouseDown = false
  }
}
