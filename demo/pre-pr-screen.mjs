import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5179/autonomous-lab/', { waitUntil: 'networkidle' })

// Screenshot the title screen
await page.screenshot({ path: 'demo/pre-pr-title.png', fullPage: true })
console.log('Title screen captured')

// Click Play
await page.click('#play-btn')
await page.waitForTimeout(500)

// Screenshot the play screen
await page.screenshot({ path: 'demo/pre-pr-play.png', fullPage: true })
console.log('Play screen captured')

// Wait a tick for production
await page.waitForTimeout(1000)

// Click a layer chip to verify it works
const chips = page.locator('[data-layer-chip]')
if (await chips.count() > 0) {
  const count = await chips.count()
  if (count > 1) {
    // Click the second chip (layer 2)
    await chips.nth(1).click()
    await page.waitForTimeout(500)
  }
  // Click back to layer 1
  await chips.nth(0).click()
  await page.waitForTimeout(500)
}

await page.screenshot({ path: 'demo/pre-pr-layer-switch.png', fullPage: true })
console.log('Layer switch captured')

// Click Resonators tab to show upgrade list
await page.click('#tab-upgrades')
await page.waitForTimeout(300)
await page.screenshot({ path: 'demo/pre-pr-resonators.png', fullPage: true })
console.log('Resonators tab captured')

await browser.close()
console.log('PRE-PR VISUAL PASS — 4 screenshots saved')
