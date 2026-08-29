/**
 * ScreenShake — camera shake effect on player damage.
 * P8-1: Shake camera when player is hit or takes trap/boss damage.
 */
import { Vector3 } from 'three'

export class ScreenShake {
  private intensity = 0
  private duration = 0
  private elapsed = 0
  private _shakeOffset = new Vector3()

  /** Current shake offset applied to camera */
  get shakeOffset(): Vector3 {
    return this._shakeOffset
  }

  /** Trigger a screen shake event */
  trigger(intensity: number = 0.15, duration: number = 0.3): void {
    this.intensity = Math.max(this.intensity, intensity)
    this.duration = Math.max(this.duration, duration)
    this.elapsed = 0
  }

  /** Update shake offset for current frame. Returns the offset vector to apply. */
  update(dt: number, _cameraPos: Vector3): Vector3 {
    this.elapsed += dt
    if (this.elapsed >= this.duration) {
      this.intensity = 0
      this.elapsed = this.duration // ensure clean stop
    }

    if (this.intensity <= 0) {
      this._shakeOffset.set(0, 0, 0)
      return this._shakeOffset
    }

    const progress = this.elapsed / this.duration
    // Fade: linear then sharp drop at end
    const fade = 1 - progress
    const shakeMag = this.intensity * fade

    // Random shake using deterministic-ish noise
    const t = performance.now() / 1000
    this._shakeOffset.set(
      Math.sin(t * 37.7) * shakeMag,
      Math.sin(t * 53.3) * shakeMag * 0.6, // less vertical
      Math.sin(t * 71.1) * shakeMag * 0.3, // minimal Z
    )

    return this._shakeOffset
  }

  /** Get current shake magnitude for testing */
  getMagnitude(): number {
    if (this.intensity <= 0) return 0
    return this.intensity * (1 - this.elapsed / this.duration)
  }
}
