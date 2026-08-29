/**
 * Pure lighting math — no Three.js dependencies.
 * P8-4: Torch flicker with organic multi-frequency + draft bursts,
 *        ambient falloff based on floor depth.
 */

// Irrational phase offset per torch index
const TORCH_PHASE_SCALE = 2.17

/**
 * Calculate a single torch's intensity multiplier at `time` for torch index `i`.
 * Uses irrational frequency ratios for non-repeating organic variation,
 * plus occasional draft-burst spikes (~1.25×) that occur every ~2–4 s.
 * Returns a value in the range [0.6, ~1.1].
 */
export function torchIntensity(time: number, torchIndex: number): number {
  const phase = torchIndex * TORCH_PHASE_SCALE

  // Multi-frequency: irrational ratios for non-repeating variation
  const freq1 = Math.sin(time * 2.33 + phase)
  const freq2 = Math.sin(time * 5.71 + phase * 1.4)
  const freq3 = Math.sin(time * 11.93 + phase * 0.7)
  const baseFlicker = 0.88 + 0.12 * (freq1 * 0.5 + freq2 * 0.3 + freq3 * 0.2)

  // Draft bursts: brief intensity spikes every ~2–4 seconds
  const burst = Math.max(0, Math.sin(time * 0.5 + phase))
  const burstThreshold = 0.92 + 0.08 * Math.sin(phase * 3.14)
  const burstMod = burst > burstThreshold ? 1.25 : 1.0

  return Math.max(0.6, baseFlicker * burstMod)
}

/**
 * Base multiplier for torch lights.  Multiply with `torchIntensity()`
 * to get the actual intensity: `baseIntensity * torchIntensity(time, index)`.
 */
export const TORCH_BASE_INTENSITY = 1.7

/**
 * Compute ambient hemisphere-light intensity from the current floor number.
 * Deeper floors get darker ambient, clamped to a minimum of 0.25.
 */
export function ambientIntensity(floor: number): number {
  return Math.max(0.25, 0.7 - (floor - 1) * 0.04)
}
