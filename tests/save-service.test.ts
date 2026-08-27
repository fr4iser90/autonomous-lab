import { describe, it, expect, beforeEach } from 'vitest'
import { loadSave, saveSave, hasSave } from '../src/services/SaveService'
import type { SaveData } from '../src/services/SaveService'

// Mock localStorage
const mockStorage = new Map<string, string>()
global.localStorage = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size },
  key: (n: number) => { const keys = [...mockStorage.keys()]; return keys[n] ?? null },
} as Storage

describe('SaveService', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('loadSave returns defaults when no save exists', () => {
    const save = loadSave()
    expect(save.version).toBe('1')
    expect(save.settings.masterVolume).toBe(75)
    expect(save.settings.sfxVolume).toBe(80)
    expect(save.settings.reduceMotion).toBe(false)
    expect(save.meta.highFloorCleared).toBe(0)
    expect(save.highscores).toEqual([])
  })

  it('saveSave and loadSave roundtrip', () => {
    const data: SaveData = {
      version: '1',
      settings: { masterVolume: 50, sfxVolume: 30, reduceMotion: true, cameraSensitivity: 80 },
      meta: { highFloorCleared: 5, scrapCurrency: 100, unlockedItems: ['rusty-sword'], runSeeds: [42, 123] },
      highscores: [{ name: 'Test', deepestFloor: 3, date: '2025-01-01' }],
    }
    saveSave(data)
    const loaded = loadSave()
    expect(loaded.settings.masterVolume).toBe(50)
    expect(loaded.meta.highFloorCleared).toBe(5)
    expect(loaded.highscores).toHaveLength(1)
  })

  it('hasSave returns false when no save', () => {
    expect(hasSave()).toBe(false)
  })

  it('hasSave returns true when save exists', () => {
    saveSave(loadSave())
    expect(hasSave()).toBe(true)
  })

  it('corrupt save falls back to defaults', () => {
    mockStorage.set('ashen-delve-save-v1', 'not-json')
    const save = loadSave()
    expect(save.version).toBe('1')
    expect(save.settings.masterVolume).toBe(75)
  })

  it('partial save merges with defaults', () => {
    const partial: SaveData = {
      version: '1',
      settings: { masterVolume: 90, sfxVolume: 80, reduceMotion: false, cameraSensitivity: 50 },
      meta: { highFloorCleared: 3, scrapCurrency: 0, unlockedItems: [], runSeeds: [] },
      highscores: [],
    }
    saveSave(partial)
    const loaded = loadSave()
    expect(loaded.settings.masterVolume).toBe(90) // custom
    expect(loaded.settings.sfxVolume).toBe(80) // default
    expect(loaded.meta.highFloorCleared).toBe(3)
  })
})
