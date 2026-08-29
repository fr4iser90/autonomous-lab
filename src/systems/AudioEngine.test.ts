/**
 * Unit tests for AudioEngine — procedural audio via Web Audio API.
 * P8-2: Tests for new critHit(), playerHit(), and death() methods.
 * P10-1: Tests for ambient jukebox track cycling.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AudioEngine, AMBIENT_TRACKS } from './AudioEngine'

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

  describe('P10-1 ambient jukebox', () => {
    it('AMBIENT_TRACKS has 3 tracks', () => {
      expect(AMBIENT_TRACKS.length).toBe(3)
    })

    it('AMBIENT_TRACKS names are distinct', () => {
      const names = AMBIENT_TRACKS.map(t => t.name)
      expect(new Set(names).size).toBe(3)
    })

    it('currentAmbientTrack defaults to 0', () => {
      expect(engine.currentAmbientTrack).toBe(0)
    })

    it('has cycleAmbientTrack method', () => {
      expect(typeof engine.cycleAmbientTrack).toBe('function')
    })

    it('cycleAmbientTrack returns undefined when audio is disabled', () => {
      const result = engine.cycleAmbientTrack()
      expect(result).toBeUndefined()
    })

    it('cycleAmbientTrack increments track index when called', () => {
      const initial = engine.currentAmbientTrack
      engine.cycleAmbientTrack()
      expect(engine.currentAmbientTrack).toBe(initial + 1)
    })

    it('cycleAmbientTrack wraps after cycling through all tracks', () => {
      // With 3 tracks, cycle 3 times to wrap back
      engine.currentAmbientTrack = 0
      engine.cycleAmbientTrack() // -> 1
      engine.cycleAmbientTrack() // -> 2
      engine.cycleAmbientTrack() // -> 0 (wrapped)
      expect(engine.currentAmbientTrack).toBe(0)
    })

    it('all tracks have required properties', () => {
      for (const track of AMBIENT_TRACKS) {
        expect(track.name).toBeDefined()
        expect(typeof track.name).toBe('string')
        expect(track.oscType).toBeDefined()
        expect(['sine', 'triangle', 'square', 'sawtooth']).toContain(track.oscType)
        expect(typeof track.freq).toBe('number')
        expect(track.freq).toBeGreaterThan(0)
        expect(track.harmonics).toBeDefined()
        expect(Array.isArray(track.harmonics)).toBe(true)
      }
    })
  })
})
