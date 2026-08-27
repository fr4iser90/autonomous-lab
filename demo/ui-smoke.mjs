/**
 * Signal Ascent — UI smoke (M4, M6 shop tabs, M7 layer strip).
 * Title loads, Play works, Harvest click raises Signal, the layer strip shows
 * the live stratum, the Resonators tab
 * reveals the upgrade list (6 upgrades) and back, relay list renders,
 * a Whisper Relay purchase deducts Signal + updates the count, the 20 Hz loop
 * then produces Signal, zero page/console errors.
 * Screenshots: demo/pre-pr/m1-title.png, m1-play.png, m2-play.png, m4-play.png
 *
 * Server: reuses the dev server on .game.port when it responds; otherwise
 * (e.g. CI) it spawns its own `vite --port 5173 --strictPort` and kills it
 * on exit. Browsers: if chromium is missing (fresh CI runner) it runs
 * `npx playwright install chromium` once and retries.
 * Exits 1 on any failure.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { spawn, execFileSync } from 'node:child_process'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE_PATH = '/autonomous-lab/'

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path: BASE_PATH, timeout: 1500 }, (res) => {
      res.resume()
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

// --- resolve a working dev server port -------------------------------------
let port = existsSync('.game.port') ? readFileSync('.game.port', 'utf8').trim() : '5173'
let ownedServer = null
if (!(await probe(port))) {
  port = '5173'
  const viteBin = path.resolve('node_modules/vite/bin/vite.js')
  ownedServer = spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
    stdio: 'ignore',
  })
  const deadline = Date.now() + 60_000
  while (!(await probe('5173')) && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500))
  }
  if (!(await probe('5173'))) {
    ownedServer.kill()
    console.error('UI SMOKE FAIL: could not start a dev server on 5173')
    process.exit(1)
  }
}
const BASE = `http://127.0.0.1:${port}${BASE_PATH}`
const outDir = path.resolve('demo/pre-pr')
mkdirSync(outDir, { recursive: true })

const failures = []
const errors = []

async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (err) {
    const msg = String(err?.message ?? '')
    if (!/Executable doesn't exist|Failed to launch|browserType/i.test(msg)) throw err
    console.log('Playwright chromium not installed — running `npx playwright install chromium` ...')
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' })
    return await chromium.launch()
  }
}

const browser = await launchBrowser()
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

  // M7: layer strip is visible with the live stratum + next threshold.
  if (!(await page.locator('#layer-strip').isVisible())) failures.push('#layer-strip not visible in the play view')
  const stripText = await page.locator('#layer-strip').textContent()
  if (!stripText.includes('Echo Hollow')) failures.push(`layer strip missing current layer: "${stripText}"`)
  if (!stripText.includes('1.10M')) failures.push(`layer strip missing next threshold: "${stripText}"`)

  if (errors.length > 0) failures.push(`${errors.length} page errors: ${errors.join(' | ')}`)

  await page.screenshot({ path: path.join(outDir, 'm1-play.png'), fullPage: true })

  // M2: live economy — Harvest click must raise Signal through the engine.
  for (let i = 0; i < 5; i++) await page.click('#click-signal')
  const clickedText = await page.locator('#signal').textContent()
  if (clickedText !== '5') failures.push(`#signal is "${clickedText}" after 5 clicks, expected "5"`)

  if (errors.length > 0) failures.push(`${errors.length} page errors after clicks: ${errors.join(' | ')}`)

  await page.screenshot({ path: path.join(outDir, 'm2-play.png'), fullPage: true })

  // M6: shop tabs — Resonators tab reveals the upgrade list, then back.
  await page.click('#tab-upgrades')
  if (!(await page.locator('#upgrades-panel').isVisible())) failures.push('#upgrades-panel not visible on the Resonators tab')
  if (await page.locator('#generators-panel').isVisible()) failures.push('#generators-panel still visible on the Resonators tab')
  const upgRows = await page.locator('#upgrade-list .upgrade-row').count()
  if (upgRows !== 6) failures.push(`upgrade list has ${upgRows} rows, expected 6`)
  if (!(await page.locator('#buy-amp').isDisabled())) failures.push('#buy-amp enabled at Signal 5 (cost 100)')
  await page.click('#tab-relays')
  if (!(await page.locator('#generators-panel').isVisible())) failures.push('#generators-panel not visible after switching back to the Relays tab')
  if (await page.locator('#upgrades-panel').isVisible()) failures.push('#upgrades-panel still visible after switching back')

  // M4: relay list — buy a Whisper Relay (cost 15), then watch production.
  const rows = await page.locator('#relay-list .relay-row').count()
  if (rows !== 4) failures.push(`relay list has ${rows} rows, expected 4`)

  for (let i = 0; i < 10; i++) await page.click('#click-signal') // 5 -> 15
  const buyBtn = page.locator('#buy-whisper')
  if (await buyBtn.isDisabled()) failures.push('#buy-whisper is disabled at Signal 15 (cost 15)')
  await buyBtn.click()

  const owned = await page.locator('.relay-row[data-relay-id="whisper"] .relay-owned').textContent()
  if (owned !== '1') failures.push(`whisper owned count is "${owned}", expected "1"`)
  const afterBuy = await page.locator('#signal').textContent()
  if (afterBuy !== '0') failures.push(`#signal is "${afterBuy}" after buying Whisper @15, expected "0"`)
  const rate = await page.locator('#rate').textContent()
  if (rate !== '+0.5 / sec') failures.push(`#rate is "${rate}", expected "+0.5 / sec"`)

  // real-time 20 Hz loop: 1 Whisper Relay produces 0.5/s
  await page.waitForTimeout(1500)
  const live = await page.locator('#signal').textContent()
  if (live === '0') failures.push(`#signal still "0" after 1.5 s with 1 Whisper Relay (production not ticking)`)

  if (errors.length > 0) failures.push(`${errors.length} page errors during M4: ${errors.join(' | ')}`)

  await page.screenshot({ path: path.join(outDir, 'm4-play.png'), fullPage: true })
} catch (err) {
  failures.push(`exception: ${err.message}`)
} finally {
  await browser.close()
  if (ownedServer) ownedServer.kill()
}

if (failures.length > 0) {
  console.error('UI SMOKE FAIL (M4)')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log('UI SMOKE PASS (M4+M6+M7: title + play + layer strip shows Echo Hollow + 1.00M, 5 clicks -> Signal 5, Resonators tab shows 6 upgrades / back, buy Whisper @15 -> owned 1, rate +0.5/sec, production ticking, zero pageerror)')
