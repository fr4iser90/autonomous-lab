// SoundService: Procedural sound effects via Web Audio API

export type SoundName =
  | 'blockBreak'
  | 'blockPlace'
  | 'mobDeath'
  | 'mobAmbient'
  | 'pickup'
  | 'hit'

/** Unique ambient sounds per mob type */
export type MobAmbientType = 'cow' | 'pig' | 'chicken' | 'sheep' | 'zombie' | 'skeleton' | 'wolf' | 'bee'

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
    hit: 0.35,
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
      case 'hit':
        this.playHit(volume)
        break
      case 'mobAmbient':
        // mobAmbient is dispatched via playMobAmbient(mobType) — this path handles direct calls
        this.playMobAmbient('cow', volume)
        break
    }
  }

  /** Start ambient mob sounds — unique per mob type */
  startAmbient(): void {
    if (!this.enabled) return
    this.scheduleAmbient('cow', 'cow')
    this.scheduleAmbient('pig', 'pig')
    this.scheduleAmbient('chicken', 'chicken')
    this.scheduleAmbient('zombie', 'zombie')
    this.scheduleAmbient('skeleton', 'skeleton')
    this.scheduleAmbient('sheep', 'sheep')
    this.scheduleAmbient('wolf', 'wolf')
    this.scheduleAmbient('bee', 'bee')
  }

  /** Stop all ambient sounds */
  stopAllAmbient(): void {
    for (const [, timerId] of this.ambientTimers) {
      clearTimeout(timerId)
    }
    this.ambientTimers.clear()
  }

  /** Schedule an ambient sound for a specific mob type */
  scheduleAmbient(id: string, mobType: MobAmbientType): void {
    if (!this.enabled) return
    const delay = 3000 + Math.random() * 9000 // 3–12 seconds
    this.ambientTimers.set(id, setTimeout(() => {
      this.playMobAmbient(mobType, this.config.soundVolumes.mobAmbient ?? 0.3)
      // Reschedule
      this.scheduleAmbient(id, mobType)
    }, delay))
  }

  /** Play a unique ambient sound for a specific mob type */
  playMobAmbient(mobType: MobAmbientType, volume: number = 0.3): void {
    if (!this.enabled || !this.ctx || this.ctx.state === 'closed') return
    if (volume <= 0) return

    switch (mobType) {
      case 'cow':    this.playCowMoo(volume); break
      case 'pig':    this.playPigSnort(volume); break
      case 'chicken': this.playChickenPeep(volume); break
      case 'sheep':  this.playSheepBaa(volume); break
      case 'zombie': this.playZombieGroan(volume); break
      case 'skeleton': this.playSkeletonRattle(volume); break
      case 'wolf':   this.playWolfHowl(volume); break
      case 'bee':    this.playBeeBuzz(volume); break
    }
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

  /** Hit: short punchy thud for mob damage */
  private playHit(volume: number): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const duration = 0.08

    // Low thud — short sine pulse with fast decay
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
  }

  // ---------------------------------------------------------------------------
  // Mob-specific ambient sounds (P4-7: unique per mob type)
  // ---------------------------------------------------------------------------

  /** Cow moo: low descending saw with vibrato */
  private playCowMoo(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.6

    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + duration)

    // Vibrato LFO
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 5
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 8
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05)
    gain.gain.setValueAtTime(volume * 0.15, now + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
    lfo.start(now)
    lfo.stop(now + duration)
  }

  /** Pig snort: short noise burst with bandpass */
  private playPigSnort(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.15

    const bufferSize = this.ctx.sampleRate * duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5)
    }

    const noiseSource = this.ctx.createBufferSource()
    noiseSource.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 400
    filter.Q.value = 2

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    noiseSource.start(now)
    noiseSource.stop(now + duration)
  }

  /** Chicken peep: short high sine chirp */
  private playChickenPeep(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.12

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
  }

  /** Sheep baa: mid sawtooth with vibrato */
  private playSheepBaa(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.5

    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(250, now)
    osc.frequency.setValueAtTime(280, now + 0.15)
    osc.frequency.setValueAtTime(220, now + duration)

    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 6
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 10
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.12, now + 0.04)
    gain.gain.setValueAtTime(volume * 0.12, now + duration * 0.6)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
    lfo.start(now)
    lfo.stop(now + duration)
  }

  /** Zombie groan: low detuned sawtooth, slow decay */
  private playZombieGroan(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.8

    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(70, now)
    osc1.frequency.linearRampToValueAtTime(55, now + duration)

    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(73, now)
    osc2.frequency.linearRampToValueAtTime(58, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.1, now + 0.08)
    gain.gain.setValueAtTime(volume * 0.1, now + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc1.start(now)
    osc1.stop(now + duration)
    osc2.start(now)
    osc2.stop(now + duration)
  }

  /** Skeleton rattle: fast noise pulses */
  private playSkeletonRattle(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.4
    const pulses = 12

    const bufferSize = this.ctx.sampleRate * duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.ctx.sampleRate
      const pulse = Math.sin(t * pulses * Math.PI * 2 * 20)
      data[i] = (Math.random() * 2 - 1) * Math.abs(pulse) * Math.pow(1 - i / bufferSize, 0.5)
    }

    const noiseSource = this.ctx.createBufferSource()
    noiseSource.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 3

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    noiseSource.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    noiseSource.start(now)
    noiseSource.stop(now + duration)
  }

  /** Wolf howl: mid-high sine with slow pitch sweep and vibrato */
  private playWolfHowl(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 1.2

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.linearRampToValueAtTime(600, now + duration * 0.3)
    osc.frequency.linearRampToValueAtTime(550, now + duration * 0.7)
    osc.frequency.linearRampToValueAtTime(400, now + duration)

    // Vibrato
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 4
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 12
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.18, now + 0.15)
    gain.gain.setValueAtTime(volume * 0.18, now + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
    lfo.start(now)
    lfo.stop(now + duration)
  }

  /** Bee buzz: low-frequency square with harmonic buzz */
  private playBeeBuzz(volume: number): void {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    const duration = 0.3

    const osc = this.ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.setValueAtTime(220, now + duration * 0.5)

    // Sub harmonic
    const sub = this.ctx.createOscillator()
    sub.type = 'sawtooth'
    sub.frequency.value = 100

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(volume * 0.08, now)
    gain.gain.setValueAtTime(volume * 0.08, now + duration * 0.6)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    // LP filter to tame the square wave harshness
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600

    osc.connect(filter)
    sub.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
    sub.start(now)
    sub.stop(now + duration)
  }
}
