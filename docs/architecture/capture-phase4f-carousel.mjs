import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase4f-carousel.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase4f-carousel');
const output = path.join(root, phase);
const viewports = [
  { name: '320x568', width: 320, height: 568 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '768x1140', width: 768, height: 1140 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1279x800', width: 1279, height: 800 },
  { name: '767x800', width: 767, height: 800 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const selectedProducts = ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series Programmable'];
const responsiveStates = ['first-configured-logo-text-bold', 'first-logo-only', 'first-text-only', 'middle-unconfigured', 'last-long-name', 'reduced-motion'];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const name of selectedProducts) await page.getByRole('checkbox', { name, exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);

    if (viewport.width > 1279) {
      await page.getByTestId('live-preview-panel').waitFor({ state: 'visible' });
      await capture(page, viewport, 'desktop-smoke', true);
      await context.close();
      continue;
    }

    await page.getByRole('textbox', { name: 'Line 1' }).fill('Responsive preview imprint');
    await page.getByRole('button', { name: 'Bold line 1', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles({
      name: 'phase4c-logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><circle cx="300" cy="300" r="250" fill="#3155a4"/><path d="M245 150v300l240-150z" fill="#ffffff"/></svg>'),
    });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'Preview' }).click();
    await page.getByTestId('product-preview-carousel').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Logo', exact: true }).click();
    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await capture(page, viewport, responsiveStates[0]);

    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await capture(page, viewport, responsiveStates[1]);
    await page.getByRole('button', { name: 'Logo', exact: true }).click();
    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await capture(page, viewport, responsiveStates[2]);

    await page.getByRole('button', { name: 'Show 80 Series', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="preview-product-name"]')?.textContent === '80 Series');
    await capture(page, viewport, responsiveStates[3]);
    await page.getByRole('button', { name: 'Show Classic 80 Series Programmable', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="preview-product-name"]')?.textContent === 'Classic 80 Series Programmable');
    await capture(page, viewport, responsiveStates[4]);
    await page.getByRole('button', { name: 'Show Sensi Smart', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="preview-product-name"]')?.textContent === 'Sensi Smart');
    await capture(page, viewport, responsiveStates[5]);
    await context.close();
  }
} finally {
  await browser.close();
}

const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { viewports, deviceScaleFactor: 1, reducedMotion: 'reduce', browserZoom: '100%', selectedProducts, states: responsiveStates }, captures };
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
  const semanticOrGeometryChanges = comparisons.filter(item => !item.domIdentical || !item.geometryIdentical);
  console.log(`Compared with ${baselinePhase}: ${comparisons.filter(item => item.domIdentical).length}/${comparisons.length} semantic DOM matches, ${comparisons.filter(item => item.geometryIdentical).length}/${comparisons.length} geometry/style matches, ${comparisons.filter(item => item.pixelsIdentical).length}/${comparisons.length} exact screenshot matches.`);
  if (semanticOrGeometryChanges.length) throw new Error(`Semantic or geometry/style differences: ${semanticOrGeometryChanges.length} of ${comparisons.length}`);
}
console.log(`Captured ${captures.length} responsive carousel states for ${phase}.`);

async function capture(page, viewport, state, desktop = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const file = `${viewport.name}-${state}.png`;
  await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const rootSelector = desktop ? '[data-testid="live-preview-panel"]' : '[data-testid="product-preview-carousel"]';
  const root = page.locator(rootSelector);
  const dom = await root.evaluate(element => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('[class]').forEach(node => node.removeAttribute('class'));
    clone.removeAttribute('class');
    return clone.outerHTML.replace(/blob:http:\/\/[^/]+\/[0-9a-f-]+/g, 'blob:<runtime-object-url>');
  });
  const geometry = await root.evaluate(element => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const styleKeys = ['display', 'position', 'opacity', 'transform', 'overflow', 'overflowX', 'overflowY', 'touchAction', 'overscrollBehaviorX', 'overscrollBehaviorY', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'flex', 'flexBasis', 'flexGrow', 'flexShrink', 'alignItems', 'justifyContent', 'gap', 'padding', 'aspectRatio', 'containerType', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'animationName', 'visibility'];
    const selectors = ['[data-testid="product-preview-carousel"]', '[data-testid="product-image-track"]', '[aria-roledescription="slide"]:not([aria-hidden="true"])', '[data-testid="product-preview"]', '[data-testid="preview-artboard"]', '[data-testid="preview-artboard"] img', '[data-testid="brand-logo-preview"]', '[data-testid="brand-text-preview"]', '[aria-label="Preview product position"]', '[aria-label="Preview product position"] button[aria-current="true"]', '[data-testid="preview-product-summary"]', '[data-testid="preview-product-name"]', '[data-testid="preview-product-type"]', '[data-testid="product-configuration-status"]', '[data-testid="preview-option-controls"]', '[data-testid="step2-action-footer"]', '[data-testid="live-preview-panel"]'];
    const nodes = [element, ...selectors.map(selector => document.querySelector(selector)).filter(Boolean), ...Array.from(element.querySelectorAll('[data-testid],article,button,[role],img,h2,span'))];
    return { nodes: nodes.map(node => ({ tag: node.tagName, testId: node.getAttribute('data-testid'), role: node.getAttribute('role'), label: node.getAttribute('aria-label'), current: node.getAttribute('aria-current'), hidden: node.getAttribute('aria-hidden'), disabled: node.getAttribute('aria-disabled'), alt: node.getAttribute('alt'), text: node.children.length === 0 ? node.textContent : undefined, rect: rect(node), styles: Object.fromEntries(styleKeys.map(key => [key, getComputedStyle(node)[key]])) })), scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewportWidth: innerWidth, viewportHeight: innerHeight, footerBottom: document.querySelector('[data-testid="step2-action-footer"]')?.getBoundingClientRect().bottom ?? null, documentBottomGap: document.documentElement.scrollHeight - (document.querySelector('[data-testid="step2-action-footer"]')?.getBoundingClientRect().bottom ?? document.documentElement.scrollHeight) }, activeSlide: element.querySelector('[aria-roledescription="slide"]:not([aria-hidden="true"])')?.getAttribute('aria-label'), images: Array.from(element.querySelectorAll('img')).map(image => ({ alt: image.alt, src: image.getAttribute('src')?.replace(/blob:http:\/\/[^/]+\/[0-9a-f-]+/g, 'blob:<runtime-object-url>') })) };
  });
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, dom, geometry });
}
