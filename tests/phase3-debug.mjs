/** Quick debug: click New Delve and see what happens */
import { chromium } from 'playwright'

const URL = 'http://127.0.0.1:5173/autonomous-lab/'

async function debug() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  const pageErrors = []
  const consoleErrors = []

  page.on('pageerror', e => pageErrors.push(e.message))
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
    else if (msg.type() === 'log') console.log(`  [console] ${msg.text()}`)
  })
  page.on('load', () => console.log('  [load event fired]'))
  page.on('framenavigated', () => console.log('  [frame navigated]'))
  page.on('crash', () => console.log('  [PAGE CRASHED]'))

  page.setDefaultTimeout(10000)

  // Step 0: Title Screen
  console.log('=== Title Screen ===')
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(2000)

  // Step 1: Settings
  console.log('\n=== Click Settings ===')
  await page.click('#btn-settings', { force: true, noWaitAfter: true })
  await page.waitForTimeout(500)
  let check = await page.evaluate(() => ({
    settingsVisible: document.getElementById('settings-panel')?.style.display !== 'none',
    titleHidden: document.getElementById('title-screen')?.style.display === 'none',
  }))
  console.log('Settings:', JSON.stringify(check))

  await page.click('#btn-settings-back')
  await page.waitForTimeout(300)

  // Step 2: New Delve
  console.log('\n=== Click New Delve ===')
  try {
    const btn = await page.$('#btn-new')
    if (!btn) { console.log('  ✗ btn-new not found'); throw new Error('btn-new missing') }
    const rect = await btn.boundingBox()
    console.log(`  btn-new rect: ${JSON.stringify(rect)}`)
    await btn.click({ force: true, noWaitAfter: true })
    console.log('  Click fired')
    await page.waitForTimeout(100)
    
    // Check immediate state
    check = await page.evaluate(() => ({
      titleHidden: document.getElementById('title-screen')?.style.display,
      gameVisible: document.getElementById('game-screen')?.style.display,
      hudVisible: document.getElementById('hud')?.style.display,
      hpText: document.getElementById('hp-text')?.textContent,
      url: location.href,
    }))
    console.log('  Immediate:', JSON.stringify(check))
    
    await page.waitForTimeout(2000)
    // Check after 2s
    check = await page.evaluate(() => ({
      titleHidden: document.getElementById('title-screen')?.style.display,
      gameVisible: document.getElementById('game-screen')?.style.display,
      hudVisible: document.getElementById('hud')?.style.display,
      hpText: document.getElementById('hp-text')?.textContent,
      floorLabel: document.getElementById('floor-label')?.textContent,
      depthLabel: document.getElementById('depth-label')?.textContent,
      gameOverScreen: document.getElementById('game-over-screen')?.style.display,
      url: location.href,
    }))
    console.log('  After 2s:', JSON.stringify(check))
  } catch (e) {
    console.log(`  ✗ Error: ${e.message}`)
    // Check if page still alive
    const alive = await page.evaluate(() => document.readyState).catch(() => 'DEAD')
    console.log(`  Page alive: ${alive}`)
  }

  // Check inventory even if page is still alive
  try {
    await page.keyboard.press('KeyE')
    await page.waitForTimeout(300)
    check = await page.evaluate(() => ({
      invVisible: document.getElementById('inventory-panel')?.style.display !== 'none',
      invGrid: !!document.getElementById('inventory-grid'),
      url: location.href,
    }))
    console.log('\n=== Inventory after KeyE ===')
    console.log('  ', JSON.stringify(check))
  } catch (e) {
    console.log('\n=== Inventory ===')
    console.log(`  ✗ ${e.message}`)
  }

  // Step 4: Death Screen DOM
  try {
    const check = await page.evaluate(() => ({
      deathScreen: !!document.getElementById('game-over-screen'),
      deathStats: !!document.getElementById('death-stats'),
      btnRetry: !!document.getElementById('btn-retry'),
      btnTitle: !!document.getElementById('btn-title'),
      url: location.href,
    }))
    console.log('\n=== Death Screen DOM ===')
    console.log('  ', JSON.stringify(check))
  } catch (e) {
    console.log('\n=== Death Screen DOM ===')
    console.log(`  ✗ ${e.message}`)
  }

  console.log('\n=== Errors ===')
  console.log(`Page errors: ${pageErrors.length} - ${pageErrors.join(', ')}`)
  console.log(`Console errors: ${consoleErrors.length} - ${consoleErrors.join(', ')}`)

  // Screenshot
  await page.screenshot({ path: 'demo/validation/phase3-debug-new-delve.png', timeout: 3000 }).catch(() => {})
  
  await browser.close()
}

await debug()
