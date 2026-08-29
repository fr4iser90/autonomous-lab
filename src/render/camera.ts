/**
 * FollowCamera — smooth follow camera for third-person view.
 * M2: Camera stub with distance, FOV, follow lag, clamp.
 */
import * as THREE from 'three'
import type { GameRenderer } from './GameRenderer'

export interface CameraSettings {
  distance: number   // Behind player
  height: number     // Above player
  FOV: number
  followLag: number  // 0-1 interpolation factor
  yawClamp?: [number, number]
  pitchClamp?: [number, number]
}

export class FollowCamera {
  private currentPos = new THREE.Vector3(0, 8, 12)

  readonly settings: CameraSettings

  constructor(settings: CameraSettings) {
    this.settings = settings
  }

  /** Update camera to follow the target (with optional shake offset) */
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

    // Look target
    const lookX = target.x
    const lookY = target.y + 1.5
    const lookZ = target.z

    renderer.camera.position.copy(this.currentPos)
    renderer.camera.lookAt(lookX, lookY, lookZ)
  }

  /** Handle mouse drag to adjust yaw */
  onPointerDown(clientX: number): void {
    this._lastMouseX = clientX
  }

  private _lastMouseX = 0

  onPointerMove(clientX: number, _clientY: number, sensitivity: number = 50): void {
    const dx = clientX - this._lastMouseX
    this._yawAngle -= dx * 0.003 * (sensitivity / 50)
    this._lastMouseX = clientX
  }

  private _yawAngle = 0

  reset(): void {
    this.currentPos.set(0, 8, 12)
    this._yawAngle = 0
  }
}
