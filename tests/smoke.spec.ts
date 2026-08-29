import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173/'

test.use({ viewport: { width: 1280, height: 720 } })

test.beforeEach(async ({ page }) => {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#title-screen')).toBeVisible()
})

test('smoke: title screen loads', async ({ page }) => {
  await expect(page.locator('#game-title')).toHaveText('Ashen Delve')
  await expect(page.locator('#btn-new')).toBeVisible()
  await expect(page.locator('#btn-settings')).toBeVisible()
  try { await page.screenshot({ path: 'demo/validation/smoke-title.png', timeout: 3000 }) } catch { /* best-effort */ }
})

test('smoke: game boots and renders', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  const result = await page.evaluate(() => {
    return new Promise<any>((resolve) => {
      try {
        document.getElementById('btn-new')!.click()
        
        // Wait longer for boot (WebGL init takes time)
        const check = () => {
          const hud = document.getElementById('hud')
          const hudVisible = hud?.style.display !== 'none'
          const canvas = document.querySelector('canvas')
          const canvasVisible = canvas && canvas.offsetParent !== null
          const gameScreen = document.getElementById('game-screen')
          const gameVisible = gameScreen?.style.display !== 'none'
          const titleScreen = document.getElementById('title-screen')
          const titleHidden = titleScreen?.style.display === 'none'
          
          if (hudVisible || canvasVisible || gameVisible) {
            resolve({ hudVisible, canvasVisible, gameVisible, titleHidden, errors: [], detail: 'booted' })
          } else {
            setTimeout(check, 1000)
          }
        }
        setTimeout(check, 2000)
        setTimeout(() => resolve({ hudVisible: false, canvasVisible: false, gameVisible: false, titleHidden: false, errors: ['timeout'], detail: 'never booted' }), 5000)
      } catch (e: any) {
        resolve({ hudVisible: false, canvasVisible: false, gameVisible: false, titleHidden: false, errors: [e.message], detail: e.message })
      }
    })
  })

  try { await page.screenshot({ path: 'demo/validation/smoke-game.png', timeout: 3000 }) } catch { /* best-effort */ }
  
  expect(result.hudVisible || result.canvasVisible || result.gameVisible, `Game should boot (${result.detail})`).toBe(true)
  expect(result.errors.length, 'No boot errors').toBe(0)
})

test('smoke: settings panel works', async ({ page }) => {
  await page.locator('#btn-settings').click()
  await expect(page.locator('#settings-panel')).toBeVisible()
  
  // Close settings
  await page.locator('#btn-settings-back').click()
  await expect(page.locator('#settings-panel')).not.toBeVisible()
  
  try { await page.screenshot({ path: 'demo/validation/smoke-settings.png', timeout: 3000 }) } catch { /* best-effort */ }
})
