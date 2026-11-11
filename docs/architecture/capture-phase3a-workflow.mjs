import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase3a-workflow.mjs before|after');
const directory = path.resolve(`docs/architecture/evidence/phase3a/${phase}`);
await mkdir(directory, { recursive: true });
const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    captures.push(await capture(page, viewport, 'step1'));
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor imprint sample');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    captures.push(await capture(page, viewport, 'step2'));
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(directory, 'metadata.json'), `${JSON.stringify({ phase, browser: `Chromium ${browser.version()}`, deviceScaleFactor: 1, reducedMotion: 'reduce', selectedProducts: ['Sensi Smart'], imprintLine1: 'Contractor imprint sample', captures }, null, 2)}\n`);
console.log(`Captured ${captures.length} Step 1/Step 2 screenshots for ${phase}.`);

async function capture(page, viewport, step) {
  const file = `${viewport.name}-${step}.png`;
  await page.screenshot({ path: path.join(directory, file), fullPage: true, animations: 'disabled' });
  const geometry = await page.evaluate(() => {
    const selectors = {
      main: 'main[data-active-screen="true"] main, main#main, main',
      heading: 'main h1',
      rail: '[data-testid="selected-products-rail"]',
      firstProduct: '[data-testid="selected-products-rail"] [data-product-id], [data-testid="selected-products-rail"] [data-testid^="selected-product"]',
      line1: 'input[aria-label="Line 1"], input[name="line1"]',
    };
    return Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
      const element = document.querySelector(selector);
      if (!element || (element instanceof HTMLElement && element.getClientRects().length === 0)) return [name, null];
      const rect = element.getBoundingClientRect();
      return [name, { rect: [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value * 100) / 100), text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100) }];
    }));
  });
  return { file, step, viewport: { width: viewport.width, height: viewport.height }, geometry, visibleHeading: await page.locator('main h1').first().innerText(), continueDisabled: await page.getByRole('button', { name: 'Continue', exact: true }).first().isDisabled() };
}
