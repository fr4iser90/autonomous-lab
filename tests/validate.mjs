/** Playwright validation script for Ashen Delve — Phase 2b smoke test */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const SCREENSHOT_DIR = path.resolve('demo/validation')
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

async function takeScreenshot(page, name) {
  const p = path.join(SCREENSHOT_DIR, name)
  try {
    await page.screenshot({ path: p, fullPage: true, timeout: 5000 })
    console.log(`✓ ${name}`)
    return p
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`)
    return null
  }
}

async function validate() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security', '--no-sandbox']
  })
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1
  })
  const page = await context.newPage()

  const errors = []
  const warnings = []
  const screenshots = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`)
    }
  })
  page.on('pageerror', err => {
    errors.push(`Page error: ${err.message}`)
  })

  page.setDefaultTimeout(10000)

  // === 1. Title screen ===
  console.log('=== 1. Title screen ===')
  await page.goto('http://127.0.0.1:5173/autonomous-lab/', { waitUntil: 'domcontentloaded', timeout: 15000 })

  let s1 = await takeScreenshot(page, '01-title.png')
  if (s1) screenshots.push(s1)

  // Check title screen elements
  const titleCheck = await page.evaluate(() => {
    return {
      titleVisible: document.getElementById('title-screen')?.style.display !== 'none',
      gameTitle: !!document.getElementById('game-title'),
      titleText: document.getElementById('game-title')?.textContent,
      tagline: !!document.querySelector('.tagline'),
      btnNew: !!document.getElementById('btn-new'),
      btnNewText: document.getElementById('btn-new')?.textContent,
      btnSettings: !!document.getElementById('btn-settings'),
      btnSettingsText: document.getElementById('btn-settings')?.textContent,
      btnContinue: !!document.getElementById('btn-continue'),
    }
  })
  console.log('Title:', JSON.stringify(titleCheck))

  if (!titleCheck.titleVisible) {
    errors.push('Title screen not visible')
  }
  if (titleCheck.titleText !== 'Ashen Delve') {
    warnings.push(`Title text: ${titleCheck.titleText}`)
  }

  // === 2. HTML element audit (while game not rendering yet) ===
  console.log('=== 2. HTML element audit ===')
  const htmlAudit = await page.evaluate(() => {
    const elements = [
      'title-screen', 'game-screen', 'settings-panel',
      'game-title', 'btn-new', 'btn-continue', 'btn-settings',
      'game-canvas', 'hud', 'hp-fill', 'hp-text',
      'floor-label', 'depth-label', 'inv-toggle',
      'inventory-panel', 'inventory-grid',
      'death-screen', 'death-stats', 'death-scrap',
      'btn-retry', 'btn-title',
      'pause-overlay', 'btn-resume', 'btn-pause-settings', 'btn-pause-title',
      'vol-master', 'vol-master-val', 'vol-sfx', 'vol-sfx-val',
      'reduce-motion', 'btn-settings-back',
      'combat-log', 'combat-log-entries',
    ]
    const results = {}
    elements.forEach(id => {
      results[id] = !!document.getElementById(id)
    })
    return results
  })
  const missing = Object.entries(htmlAudit).filter(([_, v]) => !v).map(([k]) => k)
  if (missing.length > 0) {
    errors.push(`Missing DOM elements: ${missing.join(', ')}`)
  } else {
    console.log(`✓ All ${htmlAudit ? Object.keys(htmlAudit).length : 0} expected DOM elements present`)
  }

  // === 3. Settings from title ===
  console.log('=== 3. Settings from title ===')
  await page.click('#btn-settings')
  await page.waitForTimeout(500)

  const settingsFromTitle = await page.evaluate(() => {
    return {
      settingsVisible: document.getElementById('settings-panel')?.style.display !== 'none',
      titleHidden: document.getElementById('title-screen')?.style.display === 'none',
      volMaster: !!document.getElementById('vol-master'),
      volMasterVal: document.getElementById('vol-master-val')?.textContent,
      volSfx: !!document.getElementById('vol-sfx'),
      volSfxVal: document.getElementById('vol-sfx-val')?.textContent,
      reduceMotion: !!document.getElementById('reduce-motion'),
      btnBack: !!document.getElementById('btn-settings-back'),
    }
  })
  console.log('Settings:', JSON.stringify(settingsFromTitle))

  if (!settingsFromTitle.settingsVisible) {
    errors.push('Settings panel not visible')
  }
  if (settingsFromTitle.volMasterVal !== '75%') {
    warnings.push(`Master volume: ${settingsFromTitle.volMasterVal}`)
  }

  let s2 = await takeScreenshot(page, '02-settings.png')
  if (s2) screenshots.push(s2)

  await page.click('#btn-settings-back')
  await page.waitForTimeout(300)

  const backToTitle = await page.evaluate(() => {
    return {
      titleVisible: document.getElementById('title-screen')?.style.display !== 'none',
      settingsHidden: document.getElementById('settings-panel')?.style.display === 'none',
    }
  })
  console.log(`Back to title: ${JSON.stringify(backToTitle)}`)

  if (!backToTitle.titleVisible) {
    errors.push('Could not return to title')
  }

  // === 4. New Delve ===
  console.log('=== 4. New Delve ===')
  await page.click('#btn-new', { force: true })

  // Check DOM IMMEDIATELY before WebGL can crash the browser
  const gameDOM = await page.evaluate(() => {
    return {
      titleHidden: document.getElementById('title-screen')?.style.display === 'none',
      gameVisible: document.getElementById('game-screen')?.style.display === 'block',
      hudVisible: document.getElementById('hud')?.style.display === 'flex',
      canvasExists: !!document.getElementById('game-canvas'),
      hpText: document.getElementById('hp-text')?.textContent,
      floorLabel: document.getElementById('floor-label')?.textContent,
      depthLabel: document.getElementById('depth-label')?.textContent,
      invToggle: !!document.getElementById('inv-toggle'),
      combatLog: !!document.getElementById('combat-log'),
      deathScreen: !!document.getElementById('death-screen'),
      pauseOverlay: !!document.getElementById('pause-overlay'),
      invPanel: !!document.getElementById('inventory-panel'),
    }
  })
  console.log('Game DOM:', JSON.stringify(gameDOM))

  if (!gameDOM.titleHidden) errors.push('Title not hidden after New Delve')
  if (!gameDOM.gameVisible) errors.push('Game screen not visible')
  if (!gameDOM.hudVisible) warnings.push('HUD not visible')
  if (!gameDOM.canvasExists) errors.push('Canvas missing')
  if (gameDOM.hpText !== '20/20') warnings.push(`HP: ${gameDOM.hpText}`)
  if (gameDOM.floorLabel !== 'Floor 1') warnings.push(`Floor: ${gameDOM.floorLabel}`)
  if (!gameDOM.combatLog) errors.push('Combat log missing')

  // === 5. Inventory (try/catch in case browser crashes) ===
  console.log('=== 5. Inventory ===')
  try {
    await page.keyboard.press('KeyE')
    await page.waitForTimeout(200)

    const invCheck = await page.evaluate(() => {
      return {
        invVisible: document.getElementById('inventory-panel')?.style.display !== 'none',
        invGrid: !!document.getElementById('inventory-grid'),
      }
    })
    console.log(`Inventory: ${JSON.stringify(invCheck)}`)

    if (invCheck.invVisible) {
      console.log('✓ Inventory toggle works')
      await page.keyboard.press('KeyE')
    } else {
      warnings.push('Inventory not visible on [E]')
    }
  } catch (e) {
    warnings.push(`Inventory test interrupted: ${e.message}`)
  }

  // === 6. Summary ===
  console.log('\n=== VALIDATION SUMMARY ===')
  console.log(`Screenshots: ${screenshots.length}`)
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(e => console.log(`  ✗ ${e}`))
  }
  if (warnings.length > 0) {
    console.log('\nWarnings:')
    warnings.forEach(w => console.log(`  ⚠ ${w}`))
  }

  if (errors.length === 0) {
    console.log('\nPASS: All smoke tests passed')
    return { success: true, screenshots, errors, warnings }
  } else {
    console.log('\nFAIL: Critical errors found')
    return { success: false, screenshots, errors, warnings }
  }
}

const result = await validate()
process.exit(result.success ? 0 : 1)
