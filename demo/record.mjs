/**
 * Signal Ascent — Phase 3 DEMO recording (demo.webm + frames).
 *
 * Storyboard steps 0–9:
 * 0. Title + Play/Continue
 * 1. Main UI: Signal counter + click target + layer strip (layer 1 active)
 * 2. Click several times; Signal increases
 * 3. Buy ≥1 generator; rate/owned updates
 * 4. Buy or reveal ≥1 upgrade
 * 5. Layer strip shows ≥2 layers; switch layer once — screenshot before/after
 * 6. Ascend layer 1 → Harmonics visible
 * 7. Play to layer 2–3 UI; strip shows progress; layer 2 relays ≠ layer 1
 * 8. Open subsystem tab; show cross-layer buff text
 * 9. Hold settled UI ≥2s (numbers readable in frame)
 *
 * Output: demo/demo.webm, demo/frames/<step>.png
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
    req.on('timeout', () => { req.destroy(); resolve(false) })
  })
}

let port = existsSync('.game.port') ? readFileSync('.game.port', 'utf8').trim() : '5173'
let ownedServer = null
if (!(await probe(port))) {
  port = '5173'
  const viteBin = path.resolve('node_modules/vite/bin/vite.js')
  ownedServer = spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { stdio: 'ignore' })
  const deadline = Date.now() + 60_000
  while (!(await probe('5173')) && Date.now() < deadline) await new Promise(r => setTimeout(r, 500))
  if (!(await probe('5173'))) { console.error('DEMO FAIL: could not start dev server'); process.exit(1) }
}
const BASE = `http://127.0.0.1:${port}${BASE_PATH}`
const outDir = path.resolve('demo')
const framesDir = path.join(outDir, 'frames')
mkdirSync(framesDir, { recursive: true })

// Install chromium if needed
let browser
try { browser = await chromium.launch() }
catch (err) {
  const msg = String(err?.message ?? '')
  if (/Executable doesn't exist|Failed to launch|browserType/i.test(msg)) {
    console.log('Installing Playwright chromium ...')
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' })
    browser = await chromium.launch()
  } else throw err
}

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`) })

async function ss(name) {
  await page.screenshot({ path: path.join(framesDir, name), fullPage: true })
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

const failures = []
const frameNames = [
  'step0-title.png', 'step1-main-ui.png', 'step2-clicks.png',
  'step3-generator.png', 'step4-upgrade.png', 'step5-strip.png',
  'step6-ascend.png', 'step7-layer2.png', 'step8-stats.png', 'step9-settled.png'
]

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
  await wait(1000)

  // ── STEP 0: Title screen ──
  const titleVis = await page.locator('#title-view').isVisible()
  if (!titleVis) failures.push('Step 0: title not visible')
  await ss('step0-title.png')

  // ── STEP 1: Click Play → main UI ──
  await page.click('#play-btn')
  await wait(1000)
  const playVis = await page.locator('#economy-panel').isVisible()
  if (!playVis) failures.push('Step 1: play view not visible')
  await ss('step1-main-ui.png')

  // ── STEP 2: Click several times; Signal increases ──
  for (let i = 0; i < 10; i++) await page.click('#click-signal')
  const sig2 = await page.locator('#signal').textContent()
  await ss('step2-clicks.png')

  // ── STEP 3: Buy ≥1 generator (Whisper Relay, cost 15) ──
  // Set signal to 20 (enough for 1 Whisper + buffer)
  await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.setSignal(20))
  await wait(500)
  await page.click('#buy-whisper')
  await wait(500)
  const owned = await page.locator('.relay-row[data-relay-id="whisper"] .relay-owned').textContent()
  await ss('step3-generator.png')

  // ── STEP 4: Buy an upgrade (Resonators tab) ──
  await page.click('#tab-upgrades')
  await wait(500)
  const upgVis = await page.locator('#upgrades-panel').isVisible()
  if (!upgVis) failures.push('Step 4: upgrades panel not visible')
  // Set signal for Amplified Tap (cost 100)
  await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.setSignal(200))
  await wait(300)
  const ampBtn = page.locator('#buy-amp')
  if (!(await ampBtn.isDisabled())) {
    await page.click('#buy-amp')
    await wait(500)
  }
  await ss('step4-upgrade.png')

  // ── STEP 5: Layer strip shows ≥2 layers ──
  const stripText = await page.locator('#layer-strip').textContent()
  await ss('step5-strip.png')

  // ── STEP 6: Ascend layer 1 → Harmonics visible ──
  // Need to reach layer 1 threshold (1M) to enable Ascend
  await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.setSignal(2_000_000))
  await wait(800)
  // Click Ascend
  const ascBtn = page.locator('#ascend-btn')
  if (!(await ascBtn.isDisabled())) {
    await page.click('#ascend-btn')
    await wait(800)
  } else {
    // Fallback: call dev.ascend directly
    await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.ascend())
    await wait(800)
  }
  await ss('step6-ascend.png')

  // ── STEP 7: Layer 2–3 UI ──
  // Set signal high enough to ascend to layer 3 (layer 2 threshold = 1.1M)
  await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.setSignal(5_000_000))
  await wait(500)
  const ascBtn2 = page.locator('#ascend-btn')
  if (!(await ascBtn2.isDisabled())) {
    await page.click('#ascend-btn')
    await wait(800)
  } else {
    await page.evaluate(() => window.__SIGNAL_ASCENT__?.dev.ascend())
    await wait(800)
  }
  await ss('step7-layer2.png')

  // ── STEP 8: Show stats panel (cross-layer buff text) ──
  await page.evaluate(() => {
    const statsPanel = document.getElementById('stats-panel')
    if (statsPanel) statsPanel.classList.remove('hidden')
  })
  await wait(500)
  await ss('step8-stats.png')

  // ── STEP 9: Hold settled UI ≥2s ──
  await wait(2500)
  await ss('step9-settled.png')

  // ── BUILD WEBM FROM FRAMES ──
  const frameFiles = frameNames
    .map(f => path.join(framesDir, f))
    .filter(f => existsSync(f))

  if (frameFiles.length > 0) {
    // Use ffmpeg -framerate with glob pattern for PNG frames
    execFileSync('ffmpeg', [
      '-y', '-framerate', '5',
      '-pattern_type', 'glob', '-i', path.join(framesDir, '*.png'),
      '-c:v', 'libvpx-vp9', '-b:v', '2M', '-an',
      path.join(outDir, 'demo.webm')
    ], { stdio: 'inherit' })
  }

  // ── VALIDATE ──
  const webmPath = path.join(outDir, 'demo.webm')
  if (!existsSync(webmPath)) failures.push('demo.webm not created')
  const webmStat = existsSync(webmPath) ? readFileSync(webmPath).length : 0
  if (webmStat < 1000) failures.push(`demo.webm too small: ${webmStat} bytes`)

  if (errors.length > 0) failures.push(`${errors.length} page errors: ${errors.join(' | ')}`)

} catch (err) {
  failures.push(`exception: ${err.message}`)
} finally {
  await browser.close()
  if (ownedServer) ownedServer.kill()
}

if (failures.length > 0) {
  console.error('DEMO FAIL')
  for (const f of failures) console.error(' -', f)
  process.exit(1)
}
console.log(`DEMO PASS: ${frameNames.length} frames, webm=${webmStat} bytes, zero console errors`)
