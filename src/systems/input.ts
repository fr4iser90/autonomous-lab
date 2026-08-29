/**
 * InputManager — collects WASD + mouse state each frame.
 * Supports third-person (drag-rotate) and first-person (pointer-lock) mouse-look.
 */
export interface InputState {
  forward: number
  right: number
  rotate: number        // Third-person: accumulated yaw delta from mouse drag
  jump: boolean
  attack: boolean
  /** First-person: yaw delta from pointer-lock mouse movement (per-frame) */
  fpYawDelta: number
  /** First-person: pitch delta from pointer-lock mouse movement (per-frame) */
  fpPitchDelta: number
}

export class InputManager {
  private keys = new Map<string, boolean>()
  private mouseDown = false
  private _state: InputState = { forward: 0, right: 0, rotate: 0, jump: false, attack: false, fpYawDelta: 0, fpPitchDelta: 0 }
  // Accumulates mouse deltas between update() calls — cleared each frame
  private _pendingRotate = 0
  // First-person pointer-lock deltas — cleared each frame
  private _pendingFpYaw = 0
  private _pendingFpPitch = 0
  private _pointerLockCanvas: HTMLCanvasElement | null = null

  getState(): InputState {
    return this._state
  }

  update(): void {
    this._state.forward = (this.keys.get('w') || this.keys.get('W') ? 1 : 0) - (this.keys.get('s') || this.keys.get('S') ? 1 : 0)
    this._state.right = (this.keys.get('d') || this.keys.get('D') ? 1 : 0) - (this.keys.get('a') || this.keys.get('A') ? 1 : 0)
    this._state.jump = false
    this._state.attack = this.mouseDown || !!this.keys.get(' ')
    // Third-person: apply pending rotation delta then clear
    this._state.rotate = this._pendingRotate
    this._pendingRotate = 0
    // First-person: apply pointer-lock deltas then clear
    this._state.fpYawDelta = this._pendingFpYaw
    this._pendingFpYaw = 0
    this._state.fpPitchDelta = this._pendingFpPitch
    this._pendingFpPitch = 0
  }

  onKeyDown(e: KeyboardEvent): void {
    this.keys.set(e.key, true)
    // Prevent scrolling/zooming with navigation keys + WASD
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
         'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
      e.preventDefault()
    }
  }

  onKeyUp(e: KeyboardEvent): void {
    this.keys.set(e.key, false)
  }

  onMouseMove(dx: number, _dy: number): void {
    // Third-person: only accumulate rotation during mouse drag (primary button held)
    if (!this.mouseDown) return
    this._pendingRotate -= dx * 0.01
  }

  onMouseDown(): void {
    this.mouseDown = true
  }

  onMouseUp(): void {
    this.mouseDown = false
  }

  /** Enable pointer-lock mouse-look on the given canvas (FP mode only). */
  setPointerLock(canvas: HTMLCanvasElement): void {
    this._pointerLockCanvas = canvas
    // Remove stale listeners to avoid duplicates
    canvas.removeEventListener('click', this._onPointerLockRequest)
    document.removeEventListener('pointerlockchange', this._onPointerLockChange)
    // Request pointer lock on first click
    canvas.addEventListener('click', this._onPointerLockRequest)
    // Re-request when pointer lock is lost (e.g. pause, blur, Escape)
    document.addEventListener('pointerlockchange', this._onPointerLockChange)
    // Try to lock immediately (will request on click if not allowed yet)
    if (document.pointerLockElement !== canvas) {
      canvas.addEventListener('click', this._onPointerLockRequest, { once: true })
    }
  }

  private _onPointerLockRequest = (): void => {
    if (!this._pointerLockCanvas) return
    this._pointerLockCanvas.requestPointerLock?.()
  }

  private _onPointerLockChange = (): void => {
    if (!this._pointerLockCanvas) return
    if (document.pointerLockElement !== this._pointerLockCanvas) {
      // Pointer lock lost — re-attach click listener for next request
      this._pointerLockCanvas.removeEventListener('click', this._onPointerLockRequest)
      this._pointerLockCanvas.addEventListener('click', this._onPointerLockRequest)
    }
  }

  /** Called from the game's document mousemove handler when pointer lock is active. */
  onPointerLockMove(dx: number, dy: number, sensitivity: number = 50): void {
    const factor = 0.005 * (sensitivity / 50)
    this._pendingFpYaw -= dx * factor
    this._pendingFpPitch += dy * factor
  }

  reset(): void {
    this.keys.clear()
    this.mouseDown = false
    this._pendingRotate = 0
    this._pendingFpYaw = 0
    this._pendingFpPitch = 0
  }
}
