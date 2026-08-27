/**
 * Soft architecture checks for overnight runs (part of `pnpm run gate` / vitest).
 * Genre-agnostic: no game/mob/app-specific heuristics.
 * When these fail: FIX/Feature must split modules — do not raise the limits.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const MAX_FILE_LINES = 800
/** Entry orchestrator stays thin; behavior/data live in modules. */
const MAX_MAIN_LINES = 500

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walkTs(p, out)
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(p)
  }
  return out
}

function lineCount(path: string): number {
  return readFileSync(path, 'utf8').split(/\r?\n/).length
}

describe('boilerplate architecture soft gates', () => {
  it(`no src .ts file exceeds ${MAX_FILE_LINES} lines (anti-monolith)`, () => {
    const files = walkTs(SRC)
    const offenders = files
      .map((f) => {
        const lines = lineCount(f)
        return { f: relative(ROOT, f), lines }
      })
      .filter((x) => x.lines > MAX_FILE_LINES)
    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([])
  })

  it(`src/main.ts stays ≤ ${MAX_MAIN_LINES} lines (thin entry)`, () => {
    const mainPath = join(SRC, 'main.ts')
    if (!existsSync(mainPath)) return
    const lines = lineCount(mainPath)
    expect(
      lines,
      `main.ts has ${lines} lines — split modules out of the entry (≤${MAX_MAIN_LINES})`,
    ).toBeLessThanOrEqual(MAX_MAIN_LINES)
  })

  it('package.json gate runs typecheck, lint, boundaries, test, build', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const gate = pkg.scripts.gate ?? ''
    for (const part of ['typecheck', 'lint', 'boundaries', 'test', 'build']) {
      expect(gate, `gate missing ${part}`).toContain(part)
    }
  })
})
