import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase4g-desktop.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase4g/desktop');
const output = path.join(root, phase);
const viewports = [
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const name of ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Touch 2, Sensi Lite']) {
      await page.getByRole('checkbox', { name, exact: true }).check();
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByTestId('live-preview-panel').waitFor({ state: 'visible' });
    await capture(page, viewport, 'empty');

    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor preview sample');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('Line two remains shared');
    await page.getByRole('button', { name: 'Bold line 1' }).click();
    await page.getByRole('button', { name: 'Bold line 2' }).click();
    await capture(page, viewport, 'text-bold');

    const logo = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#3155a4" d="M50 0 100 50 50 100 0 50Z"/></svg>');
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4b-logo.svg', mimeType: 'image/svg+xml', buffer: logo });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capture(page, viewport, 'logo-text');

    for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capture(page, viewport, 'navigation-last');
    await page.getByRole('button', { name: 'Previous product' }).click();
    await capture(page, viewport, 'navigation-middle');
    await context.close();
  }
} finally {
  await browser.close();
}

const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { viewports, deviceScaleFactor: 1, browserZoom: '100%', selectedProducts: ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Touch 2, Sensi Lite'], states: ['empty', 'text-bold', 'logo-text', 'navigation-last', 'navigation-middle'] }, captures };
await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

if (phase !== 'before') {
  const baselinePhase = phase === 'after' ? 'before' : 'after';
  const baseline = JSON.parse(await readFile(path.join(root, baselinePhase, 'metadata.json'), 'utf8'));
  const comparisons = [];
  for (const item of captures) {
    const expected = baseline.captures.find(record => record.file === item.file);
    if (!expected) throw new Error(`Missing capture counterpart: ${item.file}`);
    const [left, right] = await Promise.all([readFile(path.join(root, baselinePhase, item.file)), readFile(path.join(output, item.file))]);
    comparisons.push({ file: item.file, domIdentical: expected.dom === item.dom, geometryIdentical: JSON.stringify(expected.geometry) === JSON.stringify(item.geometry), pixelsIdentical: left.equals(right), baselineSha256: createHash('sha256').update(left).digest('hex'), currentSha256: createHash('sha256').update(right).digest('hex') });
  }
  await writeFile(path.join(output, 'comparisons.json'), `${JSON.stringify({ baselinePhase, comparisons }, null, 2)}\n`);
  if (phase === 'after' && comparisons.some(item => !item.domIdentical || !item.geometryIdentical || !item.pixelsIdentical)) throw new Error(`Visual comparison differences: ${comparisons.filter(item => !item.domIdentical || !item.geometryIdentical || !item.pixelsIdentical).length} of ${comparisons.length}`);
}
console.log(`Captured ${captures.length} desktop preview states for ${phase}.`);

async function capture(page, viewport, state) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const file = `${viewport.name}-${state}.png`;
  await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
  const panel = page.locator('[data-testid="live-preview-panel"]');
  const dom = await panel.evaluate(element => element.outerHTML.replace(/blob:http:\/\/[^/]+\/[0-9a-f-]+/g, 'blob:<runtime-object-url>'));
  const geometry = await panel.evaluate(element => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const nodes = [element, ...Array.from(element.querySelectorAll('h2,button,[role="switch"],img,[data-testid="preview-artboard"]'))];
    return nodes.map(node => ({ tag: node.tagName, label: node.getAttribute('aria-label'), rect: rect(node), display: getComputedStyle(node).display, position: getComputedStyle(node).position, fontSize: getComputedStyle(node).fontSize, color: getComputedStyle(node).color, backgroundColor: getComputedStyle(node).backgroundColor }));
  });
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, dom, geometry });
}

