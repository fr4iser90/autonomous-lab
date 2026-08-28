/** TutorialMode — guided onboarding for Ashen Delve
 *
 * ACCEPT criteria:
 * 1. Title shows Tutorial button
 * 2. Scripted steps with readable on-screen hints
 * 3. Completing tutorial sets meta.tutorialDone in SaveService
 * 4. Skippable (press Space/Esc to skip)
 * 5. Replayable from title
 */
import { saveSave, loadSave } from '../services/SaveService'

/** A single tutorial step with its prompt and completion check */
export interface TutorialStep {
  /** Unique step ID */
  id: string
  /** Text shown in the tutorial overlay */
  prompt: string
  /** Icon/emoji for this step */
  emoji: string
  /** Key binding hint */
  keyHint?: string
}

/** Steps that teach the core loop */
export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'move', prompt: 'Move forward with W, backward with S, strafe with A/D', emoji: '🚶', keyHint: 'WASD' },
  { id: 'look', prompt: 'Drag mouse or use Q/E to rotate your view', emoji: '👀', keyHint: 'Mouse' },
  { id: 'attack', prompt: 'Press Space or left-click to attack', emoji: '⚔️', keyHint: 'Space' },
  { id: 'inventory', prompt: 'Press E to open your inventory', emoji: '🎒', keyHint: 'E' },
  { id: 'combat', prompt: 'Attack the training dummy (the grey figure ahead)', emoji: '💥', keyHint: 'Space' },
  { id: 'stairs', prompt: 'Walk to the glowing stairs to finish the tutorial', emoji: '🌀', keyHint: 'WASD' },
]

/** State of the tutorial runtime */
export interface TutorialState {
  /** Current step index (0 = first step) */
  stepIndex: number
  /** Has the player been marked as moving? */
  hasMoved: boolean
  /** Has the player rotated? */
  hasRotated: boolean
  /** Has the player attacked? */
  hasAttacked: boolean
  /** Has the player opened inventory? */
  hasOpenedInventory: boolean
  /** Has the player killed the dummy? */
  hasKilledDummy: boolean
  /** Has the player reached the stairs? */
  hasReachedStairs: boolean
  /** Tutorial started */
  active: boolean
}

/** Create a fresh tutorial state */
export function createTutorialState(): TutorialState {
  return {
    stepIndex: 0,
    hasMoved: false,
    hasRotated: false,
    hasAttacked: false,
    hasOpenedInventory: false,
    hasKilledDummy: false,
    hasReachedStairs: false,
    active: false,
  }
}

/** Check if the player has started the tutorial by pressing a key */
export function checkTutorialStart(state: TutorialState, key: string): boolean {
  if (!state.active) return false
  return ['w', 'a', 's', 'd', 'q', 'e', ' ', ' ', 'Escape'].includes(key.toLowerCase())
}

/** Mark movement — call when player moves */
export function markMoved(state: TutorialState, x: number, z: number, lastX: number, lastZ: number): void {
  if (!state.active) return
  const dx = x - lastX
  const dz = z - lastZ
  if (Math.sqrt(dx * dx + dz * dz) > 0.5) {
    state.hasMoved = true
    state.stepIndex = Math.max(state.stepIndex, 1) // advance past move step
  }
}

/** Mark rotation */
export function markRotated(state: TutorialState, yaw: number, lastYaw: number): void {
  if (!state.active) return
  if (Math.abs(yaw - lastYaw) > 0.3) {
    state.hasRotated = true
    state.stepIndex = Math.max(state.stepIndex, 1)
  }
}

/** Mark attack */
export function markAttacked(state: TutorialState): void {
  if (!state.active) return
  state.hasAttacked = true
  state.stepIndex = Math.max(state.stepIndex, 2)
}

/** Mark inventory open */
export function markInventoryOpened(state: TutorialState): void {
  if (!state.active) return
  state.hasOpenedInventory = true
  state.stepIndex = Math.max(state.stepIndex, 3)
}

/** Mark dummy killed */
export function markDummyKilled(state: TutorialState): void {
  if (!state.active) return
  state.hasKilledDummy = true
  state.stepIndex = Math.max(state.stepIndex, 4)
}

/** Check if player is near stairs (z distance) */
export function checkStairsNearby(state: TutorialState, playerZ: number, stairsZ: number): boolean {
  if (!state.active) return false
  if (Math.abs(playerZ - stairsZ) < 2.5) {
    state.hasReachedStairs = true
    state.stepIndex = Math.max(state.stepIndex, 5)
    return true
  }
  return false
}

/** Skip tutorial */
export function skipTutorial(state: TutorialState): void {
  state.active = false
  state.stepIndex = TUTORIAL_STEPS.length
  completeTutorial()
}

/** Complete the tutorial and persist */
export function completeTutorial(): void {
  const save = loadSave()
  save.meta.tutorialDone = true
  saveSave(save)
}

/** Get the current step text */
export function getCurrentStep(state: TutorialState): TutorialStep {
  if (state.stepIndex >= TUTORIAL_STEPS.length) {
    return { id: 'complete', prompt: 'Tutorial complete! You may now explore freely.', emoji: '✨', keyHint: '' }
  }
  return TUTORIAL_STEPS[state.stepIndex]
}

/** Check if tutorial is complete */
export function isTutorialComplete(state: TutorialState): boolean {
  return state.stepIndex >= TUTORIAL_STEPS.length
}

/** Render the tutorial overlay as HTML string */
export function renderTutorialOverlay(state: TutorialState): string {
  if (!state.active && state.stepIndex >= TUTORIAL_STEPS.length) return ''
  if (state.stepIndex >= TUTORIAL_STEPS.length) {
    return `<div class="tutorial-overlay tutorial-complete">
      <div class="tutorial-box">
        <span class="tutorial-emoji">✨</span>
        <h2>Tutorial Complete!</h2>
        <p>You are ready to delve into the Ashen Catacombs.</p>
        <p class="tutorial-skip-hint">Press Esc or Space to continue</p>
      </div>
    </div>`
  }
  const step = getCurrentStep(state)
  return `<div class="tutorial-overlay" data-step="${step.id}">
    <div class="tutorial-box">
      <span class="tutorial-emoji">${step.emoji}</span>
      <h3>Step ${state.stepIndex + 1} / ${TUTORIAL_STEPS.length}</h3>
      <p>${step.prompt}</p>
      ${step.keyHint ? `<div class="tutorial-key-hint">${step.keyHint}</div>` : ''}
      <p class="tutorial-skip-hint">Press Esc or Space to skip</p>
    </div>
  </div>`
}

/** Start the tutorial */
export function startTutorial(state: TutorialState): void {
  state.active = true
  state.stepIndex = 0
  state.hasMoved = false
  state.hasRotated = false
  state.hasAttacked = false
  state.hasOpenedInventory = false
  state.hasKilledDummy = false
  state.hasReachedStairs = false
}
