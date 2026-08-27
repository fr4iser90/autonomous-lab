/** SaveService — localStorage persistence for Ashen Delve */

const SAVE_KEY = 'ashen-delve-save-v1'

export interface GameSettings {
  masterVolume: number
  sfxVolume: number
  reduceMotion: boolean
  cameraSensitivity: number
}

export interface MetaData {
  highFloorCleared: number
  scrapCurrency: number
  unlockedItems: string[]
  runSeeds: number[]
}

export interface HighScore {
  name: string
  deepestFloor: number
  date: string
}

export interface SaveData {
  version: string
  settings: GameSettings
  meta: MetaData
  highscores: HighScore[]
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 75,
  sfxVolume: 80,
  reduceMotion: false,
  cameraSensitivity: 50,
}

const DEFAULT_META: MetaData = {
  highFloorCleared: 0,
  scrapCurrency: 0,
  unlockedItems: [],
  runSeeds: [],
}

const DEFAULT_SCORES: HighScore[] = []

const DEFAULT_SAVE: SaveData = {
  version: '1',
  settings: { ...DEFAULT_SETTINGS },
  meta: { ...DEFAULT_META },
  highscores: [...DEFAULT_SCORES],
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return { ...DEFAULT_SAVE }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      console.warn('SaveService: corrupt save data, using defaults')
      return { ...DEFAULT_SAVE }
    }
    // Validate schema
    return {
      version: parsed.version || '1',
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      meta: { ...DEFAULT_META, ...parsed.meta },
      highscores: Array.isArray(parsed.highscores) ? parsed.highscores : DEFAULT_SCORES,
    }
  } catch (e) {
    console.warn('SaveService: failed to load save:', e)
    return { ...DEFAULT_SAVE }
  }
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('SaveService: failed to save:', e)
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null
  } catch {
    return false
  }
}
