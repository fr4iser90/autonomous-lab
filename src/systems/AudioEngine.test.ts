/**
 * Unit tests for AudioEngine — procedural audio via Web Audio API.
 * P8-2: Tests for new critHit(), playerHit(), and death() methods.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AudioEngine } from './AudioEngine'

describe('AudioEngine', () => {
  let engine: AudioEngine

  beforeEach(() => {
    // Create engine with reduceMotion=true so audio stays disabled (no mock needed)
    engine = new AudioEngine({ masterVolume: 50, sfxVolume: 50, reduceMotion: true })
  })

  afterEach(() => {
    engine.dispose()
  })

  describe('with reduceMotion=true (audio disabled)', () => {
    it('does not enable audio', () => {
      engine.init()
      // All methods should be no-ops when audio is disabled
      expect(() => engine.step()).not.toThrow()
      expect(() => engine.growl()).not.toThrow()
      expect(() => engine.attack()).not.toThrow()
      expect(() => engine.hit()).not.toThrow()
      expect(() => engine.critHit()).not.toThrow()
      expect(() => engine.playerHit()).not.toThrow()
      expect(() => engine.death()).not.toThrow()
    })

    it('init() does not throw', () => {
      expect(() => engine.init()).not.toThrow()
    })
  })

  describe('updateSettings', () => {
    it('updates volumes without throwing', () => {
      engine.updateSettings({ masterVolume: 80, sfxVolume: 30 })
      expect(() => engine.step()).not.toThrow()
    })

    it('reduceMotion setting disables audio', () => {
      engine.updateSettings({ reduceMotion: true })
      expect(() => engine.hit()).not.toThrow()
    })
  })

  describe('dispose', () => {
    it('does not throw', () => {
      expect(() => engine.dispose()).not.toThrow()
    })
  })

  describe('new P8-2 sound methods exist', () => {
    it('has critHit method', () => {
      expect(typeof engine.critHit).toBe('function')
    })

    it('has playerHit method', () => {
      expect(typeof engine.playerHit).toBe('function')
    })

    it('has death method', () => {
      expect(typeof engine.death).toBe('function')
    })
  })

  describe('existing P10 sound methods exist', () => {
    it('has step method', () => {
      expect(typeof engine.step).toBe('function')
    })

    it('has growl method', () => {
      expect(typeof engine.growl).toBe('function')
    })

    it('has attack method', () => {
      expect(typeof engine.attack).toBe('function')
    })

    it('has hit method', () => {
      expect(typeof engine.hit).toBe('function')
    })

    it('has startAmbient method', () => {
      expect(typeof engine.startAmbient).toBe('function')
    })

    it('has stopAmbient method', () => {
      expect(typeof engine.stopAmbient).toBe('function')
    })
  })
})
