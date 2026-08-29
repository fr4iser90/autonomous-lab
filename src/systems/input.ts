/**
 * InputManager — collects WASD + mouse state each frame.
 */
export interface InputState {
  forward: number
  right: number
  rotate: number
  jump: boolean
  attack: boolean
}

export class InputManager {
  private keys = new Map<string, boolean>()
  private mouseDown = false
  private _state: InputState = { forward: 0, right: 0, rotate: 0, jump: false, attack: false }

  getState(): InputState {
    return this._state
  }

  update(): void {
    this._state.forward = (this.keys.get('w') || this.keys.get('W') ? 1 : 0) - (this.keys.get('s') || this.keys.get('S') ? 1 : 0)
    this._state.right = (this.keys.get('d') || this.keys.get('D') ? 1 : 0) - (this.keys.get('a') || this.keys.get('A') ? 1 : 0)
    // Rotation via mouse drag only (no keyboard conflict with UI keys)
    this._state.jump = false
    this._state.attack = this.mouseDown || !!this.keys.get(' ')
  }

  onKeyDown(e: KeyboardEvent): void {
    this.keys.set(e.key, true)
    // Prevent scrolling with space/arrows
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

  onKeyUp(e: KeyboardEvent): void {
    this.keys.set(e.key, false)
  }

  onMouseMove(dx: number, _dy: number): void {
    if (!this.mouseDown) return
    this._state.rotate -= dx * 0.01
  }

  onMouseDown(): void {
    this.mouseDown = true
  }

  onMouseUp(): void {
    this.mouseDown = false
  }

  reset(): void {
    this.keys.clear()
    this.mouseDown = false
  }
}
