/**
 * AudioEngine — procedural audio via Web Audio API.
 * M10: Footsteps, mob growls, ambient dungeon, attack swoosh.
 * P8-2: critHit(), playerHit(), death() for combat audio feedback.
 */
export interface AudioSettings {
  masterVolume: number
  sfxVolume: number
  reduceMotion: boolean
}

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

  /** Play ambient dungeon drone */
  startAmbient(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return
    // Low ambient drone
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 55
    gain.gain.value = 0.02 * this.settings.sfxVolume / 100
    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start()
    ;(this as any)._ambient = { osc, gain }
  }

  /** Stop ambient drone */
  stopAmbient(): void {
    const a = (this as any)._ambient as { osc: OscillatorNode; gain: GainNode } | undefined
    if (a) {
      a.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1)
      a.osc.stop(this.ctx!.currentTime + 1.1)
      ;(this as any)._ambient = undefined
    }
  }

  dispose(): void {
    this.stopAmbient()
    this.ctx?.close()
    this.ctx = null
  }
}
