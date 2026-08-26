// DayNightCycle: Time of day, sky colors, and ambient light

export interface DayNightState {
  timeOfDay: number // 0-24000 (Minecraft-style: 0=noon, 6000=sunset, 12000=midnight, 18000=sunrise)
  skyColor: [number, number, number] // RGB [0-255]
  ambientLight: number // 0-1 brightness factor
  sunAngle: number // radians from horizon
}

export class DayNightCycle {
  private timeOfDay: number = 0 // 0-24000
  private cycleDuration: number = 24000 // total ticks per full cycle

  /** Get current day/night state */
  getState(): DayNightState {
    const t = this.timeOfDay / this.cycleDuration // 0-1
    const { skyColor, ambientLight, sunAngle } = this.calculateColors(t)
    return {
      timeOfDay: this.timeOfDay,
      skyColor,
      ambientLight,
      sunAngle,
    }
  }

  /** Update time by delta (in ticks) */
  update(deltaTicks: number): void {
    this.timeOfDay = (this.timeOfDay + deltaTicks) % this.cycleDuration
  }

  /** Get time of day directly */
  getTimeOfDay(): number {
    return this.timeOfDay
  }

  /** Set time of day directly */
  setTimeOfDay(t: number): void {
    this.timeOfDay = t % this.cycleDuration
  }

  /** Check if it's currently night */
  isNight(): boolean {
    return this.timeOfDay > 13000 && this.timeOfDay < 23000
  }

  /** Check if it's currently day */
  isDay(): boolean {
    return this.timeOfDay > 2000 && this.timeOfDay < 13000
  }

  /** Check if it's dawn/dusk (transition period) */
  isDawn(): boolean {
    return this.timeOfDay >= 23000 || this.timeOfDay <= 2000
  }

  /** Check if it's sunset */
  isSunset(): boolean {
    return this.timeOfDay >= 13000 && this.timeOfDay <= 14000
  }

  /** Get current phase name */
  getPhase(): string {
    if (this.timeOfDay < 2000) return 'dawn'
    if (this.timeOfDay < 8000) return 'morning'
    if (this.timeOfDay < 13000) return 'afternoon'
    if (this.timeOfDay < 14000) return 'sunset'
    if (this.timeOfDay < 23000) return 'night'
    return 'midnight'
  }

  private calculateColors(t: number): { skyColor: [number, number, number]; ambientLight: number; sunAngle: number } {
    // t goes from 0 (dawn) to 1 (next dawn)
    // Key points:
    // 0.0 - dawn (orange/pink sky, low ambient)
    // 0.25 - noon (bright blue, high ambient)
    // 0.5 - afternoon (blue sky, medium ambient)
    // 0.55 - sunset (orange/red sky, decreasing ambient)
    // 0.7 - twilight (dark purple, low ambient)
    // 0.85 - night (black, minimal ambient)
    // 1.0 - dawn again

    const sunAngle = (t * Math.PI * 2) - Math.PI / 2 // -PI/2 to 3PI/2

    // Ambient light: 1.0 at noon, 0.0 at midnight
    let ambientLight = 0
    if (t < 0.2 || t > 0.8) {
      // Night/dawn: low ambient
      const nightFactor = t < 0.2 ? (0.2 - t) / 0.2 : (t - 0.8) / 0.2
      ambientLight = 0.1 + nightFactor * 0.2
    } else if (t < 0.25) {
      // Dawn to morning: increasing
      const progress = (t - 0.2) / 0.05
      ambientLight = 0.3 + progress * 0.7
    } else if (t < 0.55) {
      // Morning to afternoon: high ambient
      ambientLight = 0.9 + Math.sin((t - 0.25) / 0.3 * Math.PI) * 0.1
    } else if (t < 0.7) {
      // Sunset to twilight: decreasing
      const progress = (t - 0.55) / 0.15
      ambientLight = 1.0 - progress * 0.7
    } else {
      // Night: minimal ambient
      const nightFactor = Math.min(1, (t - 0.7) / 0.1)
      ambientLight = 0.1 + nightFactor * 0.1
    }

    // Sky color
    let skyColor: [number, number, number] = [0, 0, 0]

    if (t < 0.2) {
      // Dawn: orange/pink to blue
      const progress = t / 0.2
      skyColor = [
        Math.floor(255 * (1 - progress) + 135 * progress),
        Math.floor(170 * (1 - progress) + 206 * progress),
        Math.floor(100 * (1 - progress) + 235 * progress),
      ]
    } else if (t < 0.55) {
      // Day: blue sky
      const dayFactor = t < 0.25 ? (t - 0.2) / 0.05 : Math.min(1, (0.55 - t) / 0.05)
      skyColor = [
        Math.floor(135 * (1 - dayFactor) + 135 * dayFactor),
        Math.floor(206 * (1 - dayFactor) + 206 * dayFactor),
        Math.floor(235 * (1 - dayFactor) + 235 * dayFactor),
      ]
    } else if (t < 0.7) {
      // Sunset: blue to orange/red
      const progress = (t - 0.55) / 0.15
      skyColor = [
        Math.floor(135 * (1 - progress) + 255 * progress),
        Math.floor(206 * (1 - progress) + 120 * progress),
        Math.floor(235 * (1 - progress) + 50 * progress),
      ]
    } else if (t < 0.85) {
      // Twilight: orange to dark purple
      const progress = (t - 0.7) / 0.15
      skyColor = [
        Math.floor(255 * (1 - progress) + 20 * progress),
        Math.floor(120 * (1 - progress) + 10 * progress),
        Math.floor(50 * (1 - progress) + 60 * progress),
      ]
    } else {
      // Night: dark to dawn
      const progress = (t - 0.85) / 0.15
      skyColor = [
        Math.floor(20 * (1 - progress) + 255 * progress),
        Math.floor(10 * (1 - progress) + 170 * progress),
        Math.floor(60 * (1 - progress) + 100 * progress),
      ]
    }

    return { skyColor, ambientLight, sunAngle }
  }
}
