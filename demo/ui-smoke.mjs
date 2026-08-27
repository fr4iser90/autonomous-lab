/**
 * Signal Ascent — UI smoke (M2).
 * Pre-PR visual check: title loads, Play works, Harvest click raises Signal,
 * zero page/console errors.
 * Screenshots: demo/pre-pr/m1-title.png, m1-play.png, m2-play.png
 * Requires dev server on the port in .game.port (5173 fallback). Exits 1 on any failure.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

// Dev server port: .game.port when present (5173 preferred by preview protocol;
// foreign runs may hold 5173, in which case vite falls back and we follow it).
const portFile = path.resolve('.game.port')
const port = existsSync(portFile) ? readFileSync(portFile, 'utf8').trim() : '5173'
const BASE = `http://127.0.0.1:${port}/autonomous-lab/`
const outDir = path.resolve('demo/pre-pr')
mkdirSync(outDir, { recursive: true })

const failures = []
const errors = []

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
})

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })

  const title = await page.title()
  if (!title.includes('Signal Ascent')) failures.push(`document title is "${title}"`)

  const titleVisible = await page.locator('#title-view').isVisible()
  const playVisible = await page.locator('#play-view').isVisible()
  if (!titleVisible) failures.push('title view not visible on load')
  if (playVisible) failures.push('play view visible before Play was clicked')

  await page.screenshot({ path: path.join(outDir, 'm1-title.png'), fullPage: true })

  await page.click('#play-btn')
  await page.waitForSelector('#economy-panel', { state: 'visible' })
  const signalText = await page.locator('#signal').textContent()
  if (signalText !== '0') failures.push(`#signal is "${signalText}", expected "0"`)

  if (errors.length > 0) failures.push(`${errors.length} page errors: ${errors.join(' | ')}`)

  await page.screenshot({ path: path.join(outDir, 'm1-play.png'), fullPage: true })

  // M2: live economy — Harvest click must raise Signal through the engine.
  for (let i = 0; i < 5; i++) await page.click('#click-signal')
  const clickedText = await page.locator('#signal').textContent()
  if (clickedText !== '5') failures.push(`#signal is "${clickedText}" after 5 clicks, expected "5"`)

  if (errors.length > 0) failures.push(`${errors.length} page errors after clicks: ${errors.join(' | ')}`)

  await page.screenshot({ path: path.join(outDir, 'm2-play.png'), fullPage: true })
} catch (err) {
  failures.push(`exception: ${err.message}`)
} finally {
  await browser.close()
}

if (failures.length > 0) {
  console.error('UI SMOKE FAIL (M2)')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log('UI SMOKE PASS (M2: title + play + 5 clicks -> Signal 5, zero pageerror)')
