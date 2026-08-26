// SoundService: Procedural sound effects via Web Audio API

export type SoundName =
  | 'blockBreak'
  | 'blockPlace'
  | 'mobDeath'
  | 'mobAmbient'
  | 'pickup'

export interface SoundConfig {
  /** Master volume 0..1 */
  masterVolume: number
  /** Per-sound volume multiplier 0..1 */
  soundVolumes: Record<SoundName, number>
}

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  masterVolume: 0.6,
  soundVolumes: {
    blockBreak: 0.5,
    blockPlace: 0.4,
    mobDeath: 0.6,
    mobAmbient: 0.3,
    pickup: 0.3,
  },
}

export class SoundService {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private enabled: boolean = false
  private config: SoundConfig
  private ambientTimers: Map<string, number> = new Map()

  constructor(config: SoundConfig = DEFAULT_SOUND_CONFIG) {
    this.config = { ...config }
  }

  /** Initialize the audio context (must be called from a user gesture) */
  init(): boolean {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.config.masterVolume
      this.masterGain.connect(this.ctx.destination)
      this.enabled = true
      return true
    } catch {
      return false
    }
  }

  /** Check if audio is initialized and enabled */
  isEnabled(): boolean {
    return this.enabled && this.ctx?.state !== 'closed'
  }

  /** Mute/unmute all sounds */
  setMuted(muted: boolean): void {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.config.masterVolume
    }
    if (muted) {
      this.stopAllAmbient()
    }
  }

  isMuted(): boolean {
    return this.masterGain?.gain.value === 0
  }

  /** Set a per-sound volume */
  setSoundVolume(name: SoundName, volume: number): void {
    this.config.soundVolumes[name] = Math.max(0, Math.min(1, volume))
  }

  /** Set master volume */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      const muted = this.isMuted()
      this.masterGain.gain.value = muted ? 0 : this.config.masterVolume
    }
  }

  /** Get current master volume */
  getMasterVolume(): number {
    return this.config.masterVolume
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------

  /** Play a sound effect */
  play(name: SoundName): void {
    if (!this.enabled) return
    if (!this.ctx || this.ctx.state === 'closed') return

    const volume = this.config.soundVolumes[name] ?? 0.5
    if (volume <= 0) return

    switch (name) {
      case 'blockBreak':
        this.playBlockBreak(volume)
        break
      case 'blockPlace':
        this.playBlockPlace(volume)
        break
      case 'mobDeath':
        this.playMobDeath(volume)
        break
      case 'pickup':
        this.playPickup(volume)
        break
    }
  }

  /** Start ambient mob sounds */
  startAmbient(): void {
    if (!this.enabled) return
    this.scheduleAmbient('cow', 'blockPlace') // re-use blockPlace-like for cow moo
    this.scheduleAmbient('pig', 'blockPlace')
    this.scheduleAmbient('chicken', 'blockPlace')
    this.scheduleAmbient('zombie', 'mobDeath') // re-use mobDeath-like for zombie groan
    this.scheduleAmbient('skeleton', 'blockBreak') // re-use blockBreak-like for skeleton rattle
  }

  /** Stop all ambient sounds */
  stopAllAmbient(): void {
    for (const [, timerId] of this.ambientTimers) {
      clearTimeout(timerId)
    }
    this.ambientTimers.clear()
  }

  /** Schedule an ambient sound */
  scheduleAmbient(id: string, sound: SoundName): void {
    if (!this.enabled) return
    const delay = 2000 + Math.random() * 8000 // 2–10 seconds
    this.ambientTimers.set(id, setTimeout(() => {
      this.play(sound)
      // Reschedule
      this.scheduleAmbient(id, sound)
    }, delay))
  }

  // ---------------------------------------------------------------------------
  // Procedural sound synthesis
  // ---------------------------------------------------------------------------

  /** Block break: noise burst with quick frequency decay */
  private playBlockBreak(volume: number): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const duration = 0.12

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }

    const noiseSource = this.ctx.createBufferSource()
    noiseSource.buffer = buffer

    // Bandpass filter to shape the noise
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + duration)
    filter.Q.value = 0.8

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.6, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    noiseSource.start(now)
    noiseSource.stop(now + duration)
  }

  /** Block place: short thud, low oscillator with quick decay */
  private playBlockPlace(volume: number): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const duration = 0.08

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
  }

  /** Mob death: rising then falling screech */
  private playMobDeath(volume: number): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const duration = 0.3

    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.35, now)
    gain.gain.setValueAtTime(volume * 0.35, now + duration * 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
  }

  /** Pickup: short ascending chime */
  private playPickup(volume: number): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const duration = 0.15

    // Two-tone ascending chime
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523, now) // C5

    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659, now + 0.05) // E5

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.3, now)
    gain.gain.setValueAtTime(0, now + 0.05)
    gain.gain.setValueAtTime(volume * 0.25, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc1.start(now)
    osc1.stop(now + duration)
    osc2.start(now + 0.05)
    osc2.stop(now + duration)
  }
}
