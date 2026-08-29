/** Persistent run tracking — tracks floor, mobs, and boss kills. */

const BK = 'ashen-delve-best-runs'
const BBK = 'ashen-delve-boss-kills' // total boss kills across runs

export interface RunSnapshot {
  floor: number
  mobsKilled: number
  bossKills: number
}

interface AR {
  floor: number
  mobsKilled: number
  bossKills: number
}

let cr: AR | null = null
let _totalBossKills: number = 0

function lbr(): RunSnapshot[] {
  try { const r = localStorage.getItem(BK); if (!r) return []; return JSON.parse(r) as RunSnapshot[] } catch { return [] }
}

function sbr(r: RunSnapshot[]): void { try { localStorage.setItem(BK, JSON.stringify(r)) } catch {/* storage full or disabled */} }

function lbk(): number {
  try { const v = localStorage.getItem(BBK); if (!v) return 0; return parseInt(v, 10) || 0 } catch { return 0 }
}

function sbk(v: number): void { try { localStorage.setItem(BBK, String(v)) } catch {/* storage full or disabled */} }

export function startRun(): void { cr = { floor: 1, mobsKilled: 0, bossKills: 0 } }

export function recordMobKill(_t: string): void { if (!cr) return; cr.mobsKilled++ }

export function recordBossKill(): void {
  if (!cr) return
  cr.bossKills++
  _totalBossKills++
  sbk(_totalBossKills)
}

export function getBossKills(): number { return lbk() }

export function recordFloor(f: number): void { if (!cr) return; cr.floor = Math.max(cr.floor, f) }

export function endRun(): RunSnapshot | null {
  if (!cr) return null
  const s: RunSnapshot = { floor: cr.floor, mobsKilled: cr.mobsKilled, bossKills: cr.bossKills }
  cr = null
  const runs = lbr()
  runs.push(s)
  runs.sort((a, b) => b.floor - a.floor || b.mobsKilled - a.mobsKilled || b.bossKills - a.bossKills)
  sbr(runs.slice(0, 5))
  return s
}

export function getBestRun(): RunSnapshot | null { const r = lbr(); return r.length > 0 ? r[0] : null }

/** Reset all in-memory state (for testing). */
export function _reset(): void { cr = null; _totalBossKills = 0; try { localStorage.removeItem(BK); localStorage.removeItem(BBK) } catch {/* */} }
