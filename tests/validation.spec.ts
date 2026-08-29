import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173/autonomous-lab/'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#title-screen')).toBeVisible()
})

test('title screen loads and shows game title', async ({ page }) => {
  await expect(page.locator('#game-title')).toHaveText('Ashen Delve')
  await expect(page.locator('#btn-new')).toBeVisible()
  await expect(page.locator('#btn-settings')).toBeVisible()
  const hudDisplay = await page.evaluate(() => {
    return document.getElementById('hud')?.style.display
  })
  expect(hudDisplay).toBe('none')
})

// After boot, the rAF game loop blocks ALL Playwright CDP protocol operations.
// Every check after boot must be done inside a single browser-context evaluate()
// that includes boot + key press + verification. Zero CDP round-trips.
async function runGameTest(
  page: ReturnType<typeof test>,
  key: string,
  code: string,
  checkLabel: string,
  checkExpr: string,
): Promise<void> {
  const result = await page.evaluate(({ key, code, checkExpr }: { key: string; code: string; checkExpr: string }) => {
    return new Promise<Record<string, any>>((resolve) => {
      try {
        document.getElementById('btn-new')!.click()
        setTimeout(() => {
          // Press the test key
          const e = new KeyboardEvent('keydown', { key, code, bubbles: true })
          document.dispatchEvent(e)
          setTimeout(() => {
            // Run the test-specific check expression
            const val = eval(checkExpr)
            const ok = val === true || val === 'block' || val === 'flex'
            resolve({ ok, logs: [`check=${val}`], detail: String(val) })
          }, 300)
        }, 5000)
      } catch (e: any) {
        resolve({ ok: false, logs: [e.message], detail: e.message })
      }
    })
  }, { key, code, checkExpr })
  expect(result.ok, `Test failed (${checkLabel}): ${result.logs.join('; ')} | ${result.detail}`).toBe(true)
}

test('new delve boots to game screen', async ({ page }) => {
  const result = await page.evaluate(() => {
    return new Promise<{ ok: boolean }>((resolve) => {
      document.getElementById('btn-new')!.click()
      setTimeout(() => {
        const gs = document.getElementById('game-screen')
        const hud = document.getElementById('hud')
        const hp = document.getElementById('hp-text')
        const floor = document.getElementById('floor-label')
        const scrap = document.getElementById('scrap-label')
        const depth = document.getElementById('depth-label')
        resolve({
          ok: gs?.style.display === 'block' &&
              hud?.style.display === 'flex' &&
              !!hp?.offsetWidth &&
              !!floor?.offsetWidth &&
              !!scrap?.offsetWidth &&
              !!depth?.offsetWidth,
        })
      }, 5000)
    })
  })
  expect(result.ok).toBe(true)
})

test('inventory panel opens with E key', async ({ page }) => {
  await runGameTest(page, 'e', 'KeyE', 'inventory',
    "document.getElementById('inventory-panel')?.style.display")
})

test('shop panel opens with O key', async ({ page }) => {
  const result = await page.evaluate(() => {
    return new Promise<Record<string, any>>((resolve) => {
      try {
        document.getElementById('btn-new')!.click()
        setTimeout(() => {
          const e = new KeyboardEvent('keydown', { key: 'o', code: 'KeyO', bubbles: true })
          document.dispatchEvent(e)
          setTimeout(() => {
            const panel = document.getElementById('shop-panel')?.style.display
            const grid = document.getElementById('shop-grid')
            const ok = panel === 'block' && !!grid?.offsetWidth
            resolve({ ok, logs: [`shop-panel=${panel} shop-grid=${!!grid}`], detail: String(panel) })
          }, 300)
        }, 5000)
      } catch (e: any) {
        resolve({ ok: false, logs: [e.message], detail: e.message })
      }
    })
  }, {})
  expect(result.ok, `Shop test failed: ${result.detail} | ${result.logs.join('; ')}`).toBe(true)
})

test('skill panel opens with T key', async ({ page }) => {
  const result = await page.evaluate(() => {
    return new Promise<Record<string, any>>((resolve) => {
      try {
        document.getElementById('btn-new')!.click()
        setTimeout(() => {
          const e = new KeyboardEvent('keydown', { key: 't', code: 'KeyT', bubbles: true })
          document.dispatchEvent(e)
          setTimeout(() => {
            const panel = document.getElementById('skill-panel')?.style.display
            const grid = document.getElementById('skill-grid')
            const ok = panel === 'block' && !!grid?.offsetWidth
            resolve({ ok, logs: [`skill-panel=${panel} skill-grid=${!!grid}`], detail: String(panel) })
          }, 300)
        }, 5000)
      } catch (e: any) {
        resolve({ ok: false, logs: [e.message], detail: e.message })
      }
    })
  }, {})
  expect(result.ok, `Skill test failed: ${result.detail} | ${result.logs.join('; ')}`).toBe(true)
})

test('pause overlay works with ESC', async ({ page }) => {
  await runGameTest(page, 'Escape', 'Escape', 'pause',
    "document.getElementById('pause-overlay')?.style.display")
})
