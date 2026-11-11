import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase4d-preview.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase4d-preview');
const output = path.join(root, phase);
const viewports = [
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const selectedProducts = ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series', 'Classic 80 Series Programmable', 'Sensi Equipment Interface Module'];
const logo = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><path fill="#3155a4" d="M400 0 800 200 400 400 0 200Z"/><path fill="#fff" d="M350 100v200l220-100z"/></svg>');
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
    await page.getByTestId('live-preview-panel').waitFor({ state: 'visible' });

    await capture(page, viewport, 'first-disabled-empty');
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor preview sample');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('Line two remains shared');
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capture(page, viewport, 'first-text-only');

    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4d-logo.svg', mimeType: 'image/svg+xml', buffer: logo });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await capture(page, viewport, 'first-logo-only');

    await page.getByRole('button', { name: 'Next product' }).click();
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capture(page, viewport, 'second-logo-text');
    for (let index = 0; index < 2; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capture(page, viewport, 'middle-navigation');
    for (let index = 0; index < selectedProducts.length - 1 - 3; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capture(page, viewport, 'last-long-name');

    await page.getByRole('textbox', { name: 'Line 1' }).fill('');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('');
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4d-warning.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#3155a4"/></svg>') });
    await page.getByRole('status').filter({ hasText: 'Logo may require print review' }).waitFor({ state: 'visible' });
    await capture(page, viewport, 'last-warning-disabled-switches');
    await page.getByRole('button', { name: 'Previous product' }).click();
    await capture(page, viewport, 'navigation-previous');
    await context.close();
  }

  for (const viewport of [
    { name: '390x844', width: 390, height: 844 },
    { name: '768x1140', width: 768, height: 1140 },
    { name: '1279x800', width: 1279, height: 800 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const name of selectedProducts.slice(0, 4)) await page.getByRole('checkbox', { name, exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Responsive preview baseline');
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4d-responsive.svg', mimeType: 'image/svg+xml', buffer: logo });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'List' }).waitFor({ state: 'visible' });
    await captureResponsive(page, viewport, 'list');
    await page.getByRole('tab', { name: 'Preview' }).click();
    await page.getByTestId('product-preview-carousel').waitFor({ state: 'visible' });
    await captureResponsive(page, viewport, 'preview');
    await context.close();
  }
} finally {
  await browser.close();
}

const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { desktopViewports: viewports, responsiveViewports: [{ width: 390, height: 844 }, { width: 768, height: 1140 }, { width: 1279, height: 800 }], deviceScaleFactor: 1, browserZoom: '100%', selectedProducts, desktopStates: ['first-disabled-empty', 'first-text-only', 'first-logo-only', 'middle-logo-text', 'last-long-name', 'last-warning-disabled-switches', 'navigation-previous'], responsiveStates: ['list', 'preview'] }, captures };
await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

if (phase !== 'before') {
  const baselinePhase = phase === 'after' ? 'before' : 'after';
  const baseline = JSON.parse(await readFile(path.join(root, baselinePhase, 'metadata.json'), 'utf8'));
  const comparisons = [];
  for (const item of captures) {
    const expected = baseline.captures.find(record => record.file === item.file);
    if (!expected) throw new Error(`Missing capture counterpart: ${item.file}`);
    const [left, right] = await Promise.all([readFile(path.join(root, baselinePhase, item.file)), readFile(path.join(output, item.file))]);
    comparisons.push({ file: item.file, semanticDomIdentical: JSON.stringify(expected.semanticDom) === JSON.stringify(item.semanticDom), computedStylesAndGeometryIdentical: JSON.stringify(expected.geometry) === JSON.stringify(item.geometry), pixelsIdentical: left.equals(right), baselineSha256: createHash('sha256').update(left).digest('hex'), currentSha256: createHash('sha256').update(right).digest('hex') });
  }
  await writeFile(path.join(output, 'comparisons.json'), `${JSON.stringify({ baselinePhase, comparisons }, null, 2)}\n`);
  if (phase === 'after' && comparisons.some(item => !item.semanticDomIdentical || !item.computedStylesAndGeometryIdentical || !item.pixelsIdentical)) throw new Error(`Visual comparison differences: ${comparisons.filter(item => !item.semanticDomIdentical || !item.computedStylesAndGeometryIdentical || !item.pixelsIdentical).length} of ${comparisons.length}`);
}
console.log(`Captured ${captures.length} Phase 4D comparison states for ${phase}.`);

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function capture(page, viewport, state) {
  await settle(page);
  const file = `${viewport.name}-${state}.png`;
  const panel = page.locator('[data-testid="live-preview-panel"]');
  await panel.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const semanticDom = await panel.evaluate(element => {
    const describe = node => ({ tag: node.tagName, role: node.getAttribute('role'), label: node.getAttribute('aria-label'), checked: node.getAttribute('aria-checked'), disabled: node.getAttribute('disabled'), testId: node.getAttribute('data-testid'), alt: node.getAttribute('alt'), text: node.children.length === 0 ? node.textContent : undefined, attributes: Array.from(node.attributes).filter(attribute => ['id', 'type', 'aria-labelledby', 'aria-describedby', 'aria-pressed'].includes(attribute.name)).map(attribute => [attribute.name, attribute.value]) });
    return [describe(element), ...Array.from(element.querySelectorAll('h2,h3,button,[role="switch"],img,[data-testid]')).map(describe)];
  });
  const geometry = await panel.evaluate(element => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const keys = ['display', 'position', 'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'columnGap', 'rowGap', 'width', 'height', 'minHeight', 'overflow', 'zIndex', 'transitionProperty', 'transitionDuration', 'animationDuration'];
    const nodes = [element, ...Array.from(element.querySelectorAll('h2,h3,button,[role="switch"],label,span,i,img,[data-testid]'))];
    return nodes.map(node => ({ role: node.getAttribute('role') || node.tagName, label: node.getAttribute('aria-label') || node.getAttribute('data-testid') || node.textContent?.trim().slice(0, 48), rect: rect(node), styles: Object.fromEntries(keys.map(key => [key, getComputedStyle(node)[key]])) }));
  });
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, semanticDom, geometry });
}

async function captureResponsive(page, viewport, state) {
  await settle(page);
  const file = `${viewport.name}-${state}.png`;
  const root = page.locator('main[data-step2-view="configure"]');
  await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const semanticDom = await root.evaluate(element => ({ view: element.getAttribute('data-step2-view'), mode: element.getAttribute('data-configure-mode'), testIds: Array.from(element.querySelectorAll('[data-testid]')).map(node => [node.tagName, node.getAttribute('data-testid'), node.getAttribute('aria-label')]) }));
  const geometry = await root.evaluate(element => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const nodes = [element, ...Array.from(element.querySelectorAll('[data-testid], [role="tab"], button, img'))];
    return nodes.map(node => ({ testId: node.getAttribute('data-testid'), role: node.getAttribute('role') || node.tagName, rect: rect(node), display: getComputedStyle(node).display, color: getComputedStyle(node).color, backgroundColor: getComputedStyle(node).backgroundColor }));
  });
  captures.push({ file, state: `responsive-${state}`, viewport: { width: viewport.width, height: viewport.height }, semanticDom, geometry });
}
