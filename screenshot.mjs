import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

// Take screenshot of main graph view
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/home/node/.openclaw/workspace/docker-visual/screenshot.png', fullPage: true });
console.log('Main screenshot saved');

// Click on Containers tab
await page.click('button:has-text("Containers")');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/home/node/.openclaw/workspace/docker-visual/screenshot-containers.png', fullPage: true });
console.log('Containers screenshot saved');

// Click on Networks tab
await page.click('button:has-text("Networks")');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/home/node/.openclaw/workspace/docker-visual/screenshot-networks.png', fullPage: true });
console.log('Networks screenshot saved');

// Click on Images tab
await page.click('button:has-text("Images")');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/home/node/.openclaw/workspace/docker-visual/screenshot-images.png', fullPage: true });
console.log('Images screenshot saved');

await browser.close();
console.log('All screenshots saved');
