import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch({
  args: ['--disable-font-subpixel-positioning', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });

// Load title screen
await page.goto('http://127.0.0.1:5173/autonomous-lab/');
await page.screenshot({ path: '/tmp/screenshot-title.png' });
console.log('Title screenshot saved');

// Click new delve
await page.click('#btn-new');

// Wait for game to boot
await new Promise(r => setTimeout(r, 30000));

// Get game info
const gameInfo = await page.evaluate(() => {
  const gs = document.getElementById('game-screen');
  const hud = document.getElementById('hud');
  const hp = document.getElementById('hp-text');
  const fl = document.getElementById('floor-label');
  const sc = document.getElementById('scrap-label');
  const dp = document.getElementById('depth-label');
  const mm = document.getElementById('minimap');
  const canvases = document.querySelectorAll('canvas');
  return {
    gs: gs?.style.display || 'none',
    hud: hud?.style.display || 'none',
    hp: hp?.textContent || 'N/A',
    floor: fl?.textContent || 'N/A',
    scrap: sc?.textContent || 'N/A',
    depth: dp?.textContent || 'N/A',
    minimap: !!mm,
    canvasCount: canvases.length,
    canvasWidth: canvases[0]?.width || 0,
    canvasHeight: canvases[0]?.height || 0,
  };
});
console.log('Game info:', JSON.stringify(gameInfo, null, 2));

// Try to screenshot the canvas element directly
try {
  const canvas = page.locator('canvas').first();
  await canvas.screenshot({ path: '/tmp/screenshot-game.png' });
  console.log('Canvas screenshot saved');
} catch (e) {
  console.log('Canvas element screenshot failed:', e.message);
}

// Also try full page screenshot
try {
  await page.screenshot({ path: '/tmp/screenshot-game-full.png', timeout: 180000, fullPage: true });
  console.log('Full page screenshot saved');
} catch (e) {
  console.log('Full page screenshot failed:', e.message);
}

// Check for console errors
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await browser.close();

if (errors.length) {
  console.log('Console errors:');
  errors.forEach(e => console.log('  -', e));
}

console.log('Validation complete');
