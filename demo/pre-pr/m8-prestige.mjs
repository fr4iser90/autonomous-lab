/**
 * PRE-PR VISUAL — M8: Ascend (prestige) panel
 *
 * 1. Title screenshot (unchanged from M7)
 * 2. Play → prestige panel visible at threshold (signal = 1M, layer 1)
 * 3. Click Ascend → layer advances, harmonics granted, slice wiped
 * 4. Post-ascend layer strip shows layer 2
 */
import { chromium } from 'playwright'

const URL = 'http://127.0.0.1:5177/autonomous-lab/'
const out = 'demo/pre-pr/'

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()

// Helper: set a save and reload
async function seedSave(signal, layer = 1, harmonics = 0) {
  await page.goto(URL)
  await page.evaluate(({ signal, layer, harmonics }) => {
    localStorage.setItem('signal-ascent-save-v1', JSON.stringify({
      version: 4, signal: String(signal), relays: { whisper: 10 },
      layer, upgrades: {}, harmonics,
      meta: { savedAt: 1 },
    }))
  }, { signal, layer, harmonics })
  await page.reload()
}

// 1. Title shot
await page.goto(URL)
await page.screenshot({ path: out + 'm8-title.png' })

// 2. Play → show prestige panel at threshold
await seedSave(1000000, 1, 0) // signal at threshold
await page.click('#play-btn')
// wait for the prestige panel to appear
await page.waitForSelector('#prestige-reward', { timeout: 5000 })
await page.screenshot({ path: out + 'm8-prestige-panel.png' })

// 3. Click Ascend
await page.click('#ascend-btn')
// wait for the panel to hide and layer to change
await page.waitForSelector('#here', { timeout: 5000 })
await page.screenshot({ path: out + 'm8-post-ascend.png' })

// 4. Layer strip shows layer 2
await page.screenshot({ path: out + 'm8-layer-strip.png' })

await browser.close()
console.log('PRE-PR VISUAL M8: 4 screenshots captured')
