import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 })
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

await browser.close()
