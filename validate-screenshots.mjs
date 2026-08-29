import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/');
await page.waitForLoadState('networkidle');

// Screenshot 1: Title screen
await page.screenshot({ path: 'demo/validation/title.png', fullPage: true });
console.log('Title screenshot saved');

// Click Tutorial to boot
const btn = page.locator('text=Tutorial');
if (await btn.count() > 0) await btn.click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(5000);

// Screenshot 2: Game screen after boot
await page.screenshot({ path: 'demo/validation/game.png', fullPage: true });
console.log('Game screenshot saved');

// Press E for inventory
await page.keyboard.press('KeyE');
await page.waitForTimeout(500);

// Screenshot 3: Inventory
await page.screenshot({ path: 'demo/validation/inventory.png', fullPage: true });
console.log('Inventory screenshot saved');

// Press ESC twice for pause
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// Screenshot 4: Pause overlay
await page.screenshot({ path: 'demo/validation/pause.png', fullPage: true });
console.log('Pause screenshot saved');

await browser.close();
