/**
 * Soft architecture checks for overnight runs.
 * Hard CI health = lint + boundaries + typecheck + vitest + build (see package.json gate).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const MAX_FILE_LINES = 800

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walkTs(p, out)
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(p)
  }
  return out
}

describe('boilerplate architecture soft gates', () => {
  it(`no src .ts file exceeds ${MAX_FILE_LINES} lines (anti-monolith)`, () => {
    const files = walkTs(SRC)
    const offenders = files
      .map((f) => {
        const lines = readFileSync(f, 'utf8').split(/\r?\n/).length
        return { f: relative(ROOT, f), lines }
      })
      .filter((x) => x.lines > MAX_FILE_LINES)
    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([])
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
