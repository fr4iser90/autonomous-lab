import { chromium } from 'playwright'
import { writeFileSync, appendFileSync } from 'fs'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

// Track JS errors
const pageErrors = []
page.on('pageerror', (err) => { pageErrors.push(err.message) })

await page.goto('http://127.0.0.1:5173/autonomous-lab/', { waitUntil: 'networkidle', timeout: 15000 })
await page.waitForTimeout(2000) // wait for Three.js canvas to render

const screenshot = await page.screenshot({ fullPage: false })
writeFileSync('demo/pre-pr/cycle-1.png', screenshot)
console.log('Screenshot saved: demo/pre-pr/cycle-1.png')

// Check canvas content
const canvasExists = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  return canvas ? true : false
})
console.log('Canvas exists:', canvasExists)

// Check for title screen elements
const hasTitle = await page.evaluate(() => {
  const title = document.querySelector('h1')
  return title ? title.textContent : ''
})
console.log('Title text:', hasTitle)

// UI smoke: check that buttons are present and interactive
const buttons = await page.evaluate(() => {
  const btns = document.querySelectorAll('button')
  return btns.length > 0 ? { count: btns.length, texts: [...btns].map(b => b.textContent.trim()) } : null
})
console.log('Buttons:', JSON.stringify(buttons))

if (pageErrors.length > 0) {
  console.error('PAGE ERRORS:', pageErrors.join('; '))
  process.exit(1)
}

if (!canvasExists) {
  console.error('NO CANVAS DETECTED')
  process.exit(1)
}

console.log('PRE-PR VISUAL: PASS (canvas visible, no JS errors)')
await browser.close()
