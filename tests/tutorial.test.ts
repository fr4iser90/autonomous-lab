/** Tests for TutorialMode — guided onboarding system */
import { describe, it, expect } from 'vitest'
import {
  createTutorialState,
  startTutorial,
  markMoved,
  markRotated,
  markAttacked,
  markInventoryOpened,
  markDummyKilled,
  checkStairsNearby,
  skipTutorial,
  getCurrentStep,
  isTutorialComplete,
  TUTORIAL_STEPS,
  checkTutorialStart,
} from '../src/systems/TutorialMode'

describe('TutorialMode', () => {
  describe('createTutorialState', () => {
    it('returns fresh state with all flags false', () => {
      const state = createTutorialState()
      expect(state.stepIndex).toBe(0)
      expect(state.active).toBe(false)
      expect(state.hasMoved).toBe(false)
      expect(state.hasRotated).toBe(false)
      expect(state.hasAttacked).toBe(false)
      expect(state.hasOpenedInventory).toBe(false)
      expect(state.hasKilledDummy).toBe(false)
      expect(state.hasReachedStairs).toBe(false)
    })
  })

  describe('TUTORIAL_STEPS', () => {
    it('has 6 steps', () => {
      expect(TUTORIAL_STEPS.length).toBe(6)
    })

    it('each step has id, prompt, emoji', () => {
      for (const step of TUTORIAL_STEPS) {
        expect(step.id).toBeDefined()
        expect(step.prompt).toBeDefined()
        expect(step.prompt.length).toBeGreaterThan(0)
        expect(step.emoji).toBeDefined()
      }
    })

    it('steps are in correct order', () => {
      expect(TUTORIAL_STEPS[0].id).toBe('move')
      expect(TUTORIAL_STEPS[1].id).toBe('look')
      expect(TUTORIAL_STEPS[2].id).toBe('attack')
      expect(TUTORIAL_STEPS[3].id).toBe('inventory')
      expect(TUTORIAL_STEPS[4].id).toBe('combat')
      expect(TUTORIAL_STEPS[5].id).toBe('stairs')
    })
  })

  describe('startTutorial', () => {
    it('activates tutorial and resets all flags', () => {
      const state = createTutorialState()
      state.stepIndex = 4
      state.hasMoved = true
      state.hasAttacked = true
      startTutorial(state)
      expect(state.active).toBe(true)
      expect(state.stepIndex).toBe(0)
      expect(state.hasMoved).toBe(false)
      expect(state.hasAttacked).toBe(false)
    })
  })

  describe('markMoved', () => {
    it('advances stepIndex when player moves 0.5+ units', () => {
      const state = createTutorialState()
      startTutorial(state)
      markMoved(state, 0, 0, -1, 0) // 1 unit displacement
      expect(state.hasMoved).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(1)
    })

    it('does not advance for small movement (< 0.5 units)', () => {
      const state = createTutorialState()
      startTutorial(state)
      markMoved(state, 0.1, 0, 0, 0) // 0.1 unit displacement
      expect(state.hasMoved).toBe(false)
    })

    it('does nothing when tutorial not active', () => {
      const state = createTutorialState()
      markMoved(state, 10, 10, 0, 0)
      expect(state.hasMoved).toBe(false)
    })

    it('moves in z axis too', () => {
      const state = createTutorialState()
      startTutorial(state)
      markMoved(state, 0, 1, 0, 0)
      expect(state.hasMoved).toBe(true)
    })
  })

  describe('markRotated', () => {
    it('advances stepIndex when rotation > 0.3 radians', () => {
      const state = createTutorialState()
      startTutorial(state)
      markRotated(state, 0.5, 0)
      expect(state.hasRotated).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(1)
    })

    it('does not advance for small rotation (< 0.3 radians)', () => {
      const state = createTutorialState()
      startTutorial(state)
      markRotated(state, 0.1, 0)
      expect(state.hasRotated).toBe(false)
    })

    it('does nothing when tutorial not active', () => {
      const state = createTutorialState()
      markRotated(state, 1.0, 0)
      expect(state.hasRotated).toBe(false)
    })
  })

  describe('markAttacked', () => {
    it('sets hasAttacked and advances to step 2', () => {
      const state = createTutorialState()
      startTutorial(state)
      markAttacked(state)
      expect(state.hasAttacked).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(2)
    })

    it('does nothing when tutorial not active', () => {
      const state = createTutorialState()
      markAttacked(state)
      expect(state.hasAttacked).toBe(false)
    })
  })

  describe('markInventoryOpened', () => {
    it('sets hasOpenedInventory and advances to step 3', () => {
      const state = createTutorialState()
      startTutorial(state)
      markInventoryOpened(state)
      expect(state.hasOpenedInventory).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(3)
    })
  })

  describe('markDummyKilled', () => {
    it('sets hasKilledDummy and advances to step 4', () => {
      const state = createTutorialState()
      startTutorial(state)
      markDummyKilled(state)
      expect(state.hasKilledDummy).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(4)
    })
  })

  describe('checkStairsNearby', () => {
    it('returns true when player is within 2.5 units of stairs', () => {
      const state = createTutorialState()
      startTutorial(state)
      const result = checkStairsNearby(state, 0, 2)
      expect(result).toBe(true)
      expect(state.hasReachedStairs).toBe(true)
      expect(state.stepIndex).toBeGreaterThanOrEqual(5)
    })

    it('returns false when player is too far', () => {
      const state = createTutorialState()
      startTutorial(state)
      const result = checkStairsNearby(state, 0, 10)
      expect(result).toBe(false)
      expect(state.hasReachedStairs).toBe(false)
    })

    it('does nothing when tutorial not active', () => {
      const state = createTutorialState()
      const result = checkStairsNearby(state, 0, 1)
      expect(result).toBe(false)
    })
  })

  describe('skipTutorial', () => {
    it('deactivates tutorial and sets stepIndex to end', () => {
      const state = createTutorialState()
      startTutorial(state)
      skipTutorial(state)
      expect(state.active).toBe(false)
      expect(state.stepIndex).toBe(TUTORIAL_STEPS.length)
    })
  })

  describe('getCurrentStep', () => {
    it('returns correct step for each index', () => {
      const state = createTutorialState()
      startTutorial(state)
      expect(getCurrentStep(state).id).toBe('move')

      markMoved(state, 1, 0, 0, 0)
      expect(getCurrentStep(state).id).toBe('look')

      markRotated(state, 0.5, 0)
      expect(getCurrentStep(state).id).toBe('look') // rotation advances same step

      markAttacked(state)
      expect(getCurrentStep(state).id).toBe('attack')

      markInventoryOpened(state)
      expect(getCurrentStep(state).id).toBe('inventory')

      markDummyKilled(state)
      expect(getCurrentStep(state).id).toBe('combat')

      checkStairsNearby(state, 0, 2)
      expect(getCurrentStep(state).id).toBe('stairs')
    })

    it('returns complete step when stepIndex >= TUTORIAL_STEPS.length', () => {
      const state = createTutorialState()
      state.stepIndex = TUTORIAL_STEPS.length
      const step = getCurrentStep(state)
      expect(step.id).toBe('complete')
      expect(step.prompt).toContain('Tutorial complete')
    })
  })

  describe('isTutorialComplete', () => {
    it('returns false when tutorial in progress', () => {
      const state = createTutorialState()
      startTutorial(state)
      expect(isTutorialComplete(state)).toBe(false)
    })

    it('returns true when all steps completed', () => {
      const state = createTutorialState()
      state.stepIndex = TUTORIAL_STEPS.length
      expect(isTutorialComplete(state)).toBe(true)
    })

    it('returns true after skip', () => {
      const state = createTutorialState()
      startTutorial(state)
      skipTutorial(state)
      expect(isTutorialComplete(state)).toBe(true)
    })
  })

  describe('checkTutorialStart', () => {
    it('returns true when active and key pressed', () => {
      const state = createTutorialState()
      startTutorial(state)
      expect(checkTutorialStart(state, 'w')).toBe(true)
      expect(checkTutorialStart(state, 'a')).toBe(true)
      expect(checkTutorialStart(state, 's')).toBe(true)
      expect(checkTutorialStart(state, 'd')).toBe(true)
      expect(checkTutorialStart(state, ' ')).toBe(true)
      expect(checkTutorialStart(state, 'q')).toBe(true)
      expect(checkTutorialStart(state, 'e')).toBe(true)
      expect(checkTutorialStart(state, 'escape')).toBe(true)
    })

    it('returns false when not active', () => {
      const state = createTutorialState()
      expect(checkTutorialStart(state, 'w')).toBe(false)
    })

    it('is case insensitive', () => {
      const state = createTutorialState()
      startTutorial(state)
      expect(checkTutorialStart(state, 'W')).toBe(true)
      expect(checkTutorialStart(state, 'WASD')).toBe(false) // multi-char key doesn't match any single entry
    })
  })
})
