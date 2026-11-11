import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase5b-closeout.mjs before|after');
const root = path.resolve('docs/architecture/evidence/phase5b-final-cleanup');
const output = path.join(root, phase);
const step2Viewports = [
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const completionViewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1140', width: 768, height: 1140 },
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of step2Viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await startStep2(page);
    await capture(page, viewport, 'step2');
    await context.close();
  }

  for (const viewport of completionViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await startStep2(page);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Phase 5B visual check');
    if (viewport.width < 1280) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.locator('#main[data-step2-view="configure"]').waitFor();
      await page.getByTestId('configuration-card-sensi-smart').getByRole('button', { name: 'Text', exact: true }).click();
      await page.getByTestId('step2-action-footer').getByRole('button', { name: 'Continue', exact: true }).click();
    } else {
      await page.getByRole('switch', { name: 'Text imprint' }).click();
      await page.getByTestId('selected-products-rail').getByRole('button', { name: 'Continue', exact: true }).click();
    }
    await page.waitForURL(/#complete$/);
    await page.getByRole('heading', { name: 'Your imprint is ready for review' }).waitFor();
    await capture(page, viewport, 'completion');
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify({ phase, browser: `Chromium ${browser.version()}`, deviceScaleFactor: 1, browserZoom: '100%', reducedMotion: 'reduce', step2Scenario: { selectedProducts: ['Sensi Smart'], viewportSet: step2Viewports }, completionScenario: { selectedProducts: ['Sensi Smart'], imprintLine1: 'Phase 5B visual check', textEnabled: true, viewportSet: completionViewports }, captures }, null, 2)}\n`);

if (phase === 'after') {
  const baselineDirectory = path.join(root, 'before');
  const baseline = JSON.parse(await readFile(path.join(baselineDirectory, 'metadata.json'), 'utf8'));
  const comparisons = [];
  for (const item of captures) {
    const expected = baseline.captures.find(record => record.file === item.file);
    if (!expected) throw new Error(`Missing capture counterpart: ${item.file}`);
    const [left, right] = await Promise.all([readFile(path.join(baselineDirectory, item.file)), readFile(path.join(output, item.file))]);
    comparisons.push({ file: item.file, semanticDomIdentical: expected.semanticDom === item.semanticDom, geometryAndStylesIdentical: JSON.stringify(expected.geometryAndStyles) === JSON.stringify(item.geometryAndStyles), pixelsIdentical: left.equals(right), baselineSha256: createHash('sha256').update(left).digest('hex'), currentSha256: createHash('sha256').update(right).digest('hex') });
  }
  await writeFile(path.join(output, 'comparisons.json'), `${JSON.stringify({ baselinePhase: 'before', comparisons }, null, 2)}\n`);
  const failures = comparisons.filter(item => !item.semanticDomIdentical || !item.geometryAndStylesIdentical || !item.pixelsIdentical);
  if (failures.length) throw new Error(`Visual comparison differences: ${failures.map(item => item.file).join(', ')}`);
}
console.log(`Captured ${captures.length} Step 2 and completion screens for ${phase}.`);

async function startStep2(page) {
  await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL(/#brand-review$/);
  await page.locator('[data-active-screen="true"] main#main').waitFor({ state: 'visible' });
  await waitForAssets(page);
}

async function capture(page, viewport, state) {
  await waitForAssets(page);
  const file = `${viewport.name}-${state}.png`;
  await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const main = page.locator('[data-active-screen="true"] main#main');
  const semanticDom = await main.evaluate(element => {
    const copy = element.cloneNode(true);
    copy.removeAttribute('class');
    for (const child of copy.querySelectorAll('[class]')) child.removeAttribute('class');
    return copy.outerHTML.replace(/blob:http:\/\/[^/]+\/[0-9a-f-]+/g, 'blob:<runtime-object-url>');
  });
  const geometryAndStyles = await main.evaluate(element => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const properties = ['display', 'position', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'overflow', 'overflowX', 'overflowY'];
    const nodes = [element, ...Array.from(element.querySelectorAll('*')).filter(node => node.getClientRects().length)];
    return nodes.map(node => {
      const style = getComputedStyle(node);
      return { tag: node.tagName, id: node.id, role: node.getAttribute('role'), aria: node.getAttribute('aria-label'), text: ['H1', 'H2', 'H3', 'BUTTON'].includes(node.tagName) ? node.textContent.trim() : '', rect: rect(node), style: Object.fromEntries(properties.map(property => [property, style[property]])) };
    });
  });
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, semanticDom, geometryAndStyles });
}

async function waitForAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
