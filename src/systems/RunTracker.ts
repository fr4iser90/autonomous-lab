/** Persistent run tracking — tracks floor, mobs. */

const BK = 'ashen-delve-best-runs'

export interface RunSnapshot {
  floor: number
  mobsKilled: number
}

interface AR {
  floor: number
  mobsKilled: number
}

let cr: AR | null = null

function lbr(): RunSnapshot[] {
  try { const r = localStorage.getItem(BK); if (!r) return []; return JSON.parse(r) as RunSnapshot[] } catch { return [] }
}

function sbr(r: RunSnapshot[]): void { try { localStorage.setItem(BK, JSON.stringify(r)) } catch {} }

export function startRun(): void { cr = { floor: 1, mobsKilled: 0 } }

export function recordMobKill(_t: string): void { if (!cr) return; cr.mobsKilled++ }

export function recordFloor(f: number): void { if (!cr) return; cr.floor = Math.max(cr.floor, f) }

export function endRun(): RunSnapshot | null {
  if (!cr) return null
  const s: RunSnapshot = { floor: cr.floor, mobsKilled: cr.mobsKilled }
  cr = null
  const runs = lbr()
  runs.push(s)
  runs.sort((a, b) => b.floor - a.floor || b.mobsKilled - a.mobsKilled)
  sbr(runs.slice(0, 5))
  return s
}

export function getBestRun(): RunSnapshot | null { const r = lbr(); return r.length > 0 ? r[0] : null }
