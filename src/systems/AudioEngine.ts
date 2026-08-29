/**
 * AudioEngine — procedural audio via Web Audio API.
 * M10: Footsteps, mob growls, ambient dungeon, attack swoosh.
 * P8-2: critHit(), playerHit(), death() for combat audio feedback.
 * P10-1: 3 ambient jukebox tracks with cycling.
 */
export interface AudioSettings {
  masterVolume: number
  sfxVolume: number
  reduceMotion: boolean
}

/** Jukebox ambient track definitions. */
export interface AmbientTrack {
  /** Human-readable label */
  name: string
  /** Oscillator type */
  oscType: OscillatorType
  /** Base frequency in Hz */
  freq: number
  /** Harmonic frequency (0 = none) */
  harmonics: { type: OscillatorType; freq: number }[]
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  { name: 'Dungeon Drone', oscType: 'sine', freq: 55, harmonics: [] },
  { name: 'Crypt Echo', oscType: 'triangle', freq: 73, harmonics: [{ type: 'sine', freq: 110 }] },
  { name: 'Abyssal Hum', oscType: 'sawtooth', freq: 40, harmonics: [{ type: 'sine', freq: 82 }] },
]

export class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private settings: AudioSettings
  private enabled = false

  constructor(settings: AudioSettings) {
    this.settings = { ...settings }
  }

  private ensureContext(): void {
    if (this.ctx) return
    if (this.settings.reduceMotion || !('AudioContext' in window)) return

    try {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.settings.masterVolume * this.settings.sfxVolume / 100
      this.masterGain.connect(this.ctx.destination)
      this.enabled = true
    } catch {
      // Audio not supported
    }
  }

  /** Must be called from a user gesture first */
  init(): void {
    this.ensureContext()
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings }
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume * this.settings.sfxVolume / 100
    }
    if (settings.reduceMotion && this.settings.reduceMotion) {
      this.ctx?.suspend()
      this.enabled = false
    }
  }

  /** Play a short procedural footstep */
  step(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 80 + Math.random() * 40
    gain.gain.setValueAtTime(0.06 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.08)
  }

  /** Play a mob growl */
  growl(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, this.ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.04 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.3)
  }

  /** Play an attack swoosh */
  attack(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.05 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.15)
  }

  /** Play a hit thud */
  hit(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.08 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.12)
  }

  /** Play a sharp critical hit — square wave descending ramp */
  critHit(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(600, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.12 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.18)
  }

  /** Play a dull player damage thud — triangle wave descending ramp */
  playerHit(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(120, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.1 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.2)
  }

  /** Play a descending death rumble — sawtooth descending ramp */
  death(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5)
    gain.gain.setValueAtTime(0.12 * this.settings.sfxVolume / 100, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.5)
  }

  /** Current ambient track index (0-based) */
  currentAmbientTrack = 0

  /** Play ambient dungeon drone for the given track index */
  startAmbient(trackIndex?: number): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    if (trackIndex !== undefined) {
      this.currentAmbientTrack = trackIndex
    }
    const track = AMBIENT_TRACKS[this.currentAmbientTrack] ?? AMBIENT_TRACKS[0]
    this._playAmbientTrack(track)
  }

  /** Restart ambient using the current track */
  private _playAmbientTrack(track: AmbientTrack): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    // Stop any existing oscillators
    const prev = (this as any)._ambient as
      | { oscillators: OscillatorNode[]; gains: GainNode[] }
      | undefined
    if (prev) {
      prev.gains.forEach(g => {
        try {
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.3)
        } catch { /* ignore */ }
      })
      prev.oscillators.forEach(o => { try { o.stop(this.ctx!.currentTime + 0.4) } catch { /* ignore */ } })
    }
    // Create main oscillator
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = track.oscType
    osc.frequency.value = track.freq
    gain.gain.value = 0.02 * this.settings.sfxVolume / 100
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    // Harmonics
    const oscillators = [osc]
    const gains = [gain]
    for (const h of track.harmonics) {
      const hOsc = this.ctx.createOscillator()
      const hGain = this.ctx.createGain()
      hOsc.type = h.type
      hOsc.frequency.value = h.freq
      hGain.gain.value = 0.01 * this.settings.sfxVolume / 100
      hOsc.connect(hGain)
      hGain.connect(this.masterGain)
      hOsc.start()
      oscillators.push(hOsc)
      gains.push(hGain)
    }
    ;(this as any)._ambient = { oscillators, gains }
  }

  /** Stop ambient drone */
  stopAmbient(): void {
    const a = (this as any)._ambient as
      | { oscillators: OscillatorNode[]; gains: GainNode[] }
      | undefined
    if (a) {
      a.gains.forEach(g => {
        try { g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1) } catch { /* ignore */ }
      })
      a.oscillators.forEach(o => { try { o.stop(this.ctx!.currentTime + 1.1) } catch { /* ignore */ } })
      ;(this as any)._ambient = undefined
    }
  }

  /** Cycle to the next ambient track; returns track name or undefined if audio off */
  cycleAmbientTrack(): string | undefined {
    const wasEnabled = this.enabled
    this.currentAmbientTrack = (this.currentAmbientTrack + 1) % AMBIENT_TRACKS.length
    if (!wasEnabled || !this.ctx) return undefined
    const newTrack = AMBIENT_TRACKS[this.currentAmbientTrack]
    this._playAmbientTrack(newTrack)
    return newTrack.name
  }

  dispose(): void {
    this.stopAmbient()
    this.ctx?.close()
    this.ctx = null
  }
}
