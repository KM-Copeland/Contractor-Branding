import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase4e-artwork.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase4e-artwork');
const output = path.join(root, phase);
const desktopViewports = [
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const responsiveViewports = [
  { name: '320x568', width: 320, height: 568 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '768x1140', width: 768, height: 1140 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1279x800', width: 1279, height: 800 },
];
const selectedProducts = ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series', 'Classic 80 Series Programmable', 'Classic 70 Series', '70/80 series, Sensi Smart', 'Sensi Touch Smart (black)', 'Sensi Equipment Interface Module'];
const logo = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><path fill="#3155a4" d="M400 0 800 200 400 400 0 200Z"/><path fill="#fff" d="M350 100v200l220-100z"/></svg>');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];

try {
  for (const viewport of desktopViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await openWorkflow(page, selectedProducts);
    await page.getByTestId('live-preview-panel').waitFor({ state: 'visible' });
    await capturePanel(page, viewport, 'first-disabled-empty');
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor preview sample');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('Line two remains shared');
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capturePanel(page, viewport, 'first-text-regular');
    await page.getByRole('button', { name: 'Bold Line 1' }).click();
    await capturePanel(page, viewport, 'first-text-bold');
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4e-logo.svg', mimeType: 'image/svg+xml', buffer: logo });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await capturePanel(page, viewport, 'first-logo-only');
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capturePanel(page, viewport, 'first-logo-and-text');
    await page.getByRole('button', { name: 'Next product' }).click();
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await page.getByRole('switch', { name: 'Text imprint' }).click();
    await capturePanel(page, viewport, 'second-logo-and-text');
    for (let index = 0; index < 2; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capturePanel(page, viewport, 'middle-product-specific-placement');
    for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capturePanel(page, viewport, 'wallplate-placement');
    for (let index = 0; index < 2; index++) await page.getByRole('button', { name: 'Next product' }).click();
    await capturePanel(page, viewport, 'last-product-long-name');
    await page.getByRole('textbox', { name: 'Line 1' }).fill('123456789012345678901234567890');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('A long second line of imprint');
    await capturePanel(page, viewport, 'last-long-text');
    await page.getByRole('button', { name: 'Previous product' }).click();
    await capturePanel(page, viewport, 'navigation-previous');
    await context.close();
  }

  for (const viewport of responsiveViewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await openWorkflow(page, selectedProducts.slice(0, 4));
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Responsive shared artwork');
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4e-responsive.svg', mimeType: 'image/svg+xml', buffer: logo });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'Preview' }).waitFor({ state: 'visible' });
    await page.getByRole('tab', { name: 'Preview' }).click();
    await page.getByTestId('product-preview-carousel').waitFor({ state: 'visible' });
    await captureResponsive(page, viewport, 'responsive-preview-logo-text');
    if (viewport.width === 390 || viewport.width === 320 || viewport.width === 1024) {
      await page.getByRole('button', { name: 'Next product' }).click().catch(() => undefined);
      await captureResponsive(page, viewport, 'responsive-preview-next-artwork');
    }
    await context.close();
  }

  // The 1279×800 responsive and 1280×900 desktop initial-load captures verify
  // each side of the composition breakpoint under equivalent fresh contexts.
} finally {
  await browser.close();
}

const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { desktopViewports, responsiveViewports, deviceScaleFactor: 1, browserZoom: '100%', selectedProducts, fontWait: 'document.fonts.ready', imageWait: 'HTMLImageElement.decode()', states: captures.map(item => item.state) }, captures };
await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
if (phase !== 'before') {
  const baselinePhase = phase === 'after' ? 'before' : 'after';
  const baseline = JSON.parse(await readFile(path.join(root, baselinePhase, 'metadata.json'), 'utf8'));
  const comparisons = [];
  for (const item of captures) {
    const expected = baseline.captures.find(record => record.file === item.file);
    if (!expected) throw new Error(`Missing capture counterpart: ${item.file}`);
    const [left, right] = await Promise.all([readFile(path.join(root, baselinePhase, item.file)), readFile(path.join(output, item.file))]);
    const canonical = value => JSON.stringify(value).replace(/blob:[^"\\]+/g, 'blob:<uploaded-logo>');
    comparisons.push({ file: item.file, semanticDomIdentical: canonical(expected.semanticDom) === canonical(item.semanticDom), geometryAndComputedStylesIdentical: canonical(expected.geometry) === canonical(item.geometry), pixelsIdentical: left.equals(right), baselineSha256: createHash('sha256').update(left).digest('hex'), currentSha256: createHash('sha256').update(right).digest('hex') });
  }
  await writeFile(path.join(output, 'comparisons.json'), `${JSON.stringify({ baselinePhase, comparisons }, null, 2)}\n`);
  if (phase === 'after' && comparisons.some(item => !item.semanticDomIdentical || !item.geometryAndComputedStylesIdentical || !item.pixelsIdentical)) throw new Error(`Comparison differences: ${comparisons.filter(item => !item.semanticDomIdentical || !item.geometryAndComputedStylesIdentical || !item.pixelsIdentical).length} of ${comparisons.length}`);
}
console.log(`Captured ${captures.length} Phase 4E artwork states for ${phase}.`);

async function openWorkflow(page, products) {
  await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const name of products) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL(/#brand-review$/);
}
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function snapshotGeometry(element) {
  return element.evaluate(rootNode => {
    const rect = node => { const box = node.getBoundingClientRect(); return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100); };
    const keys = ['display', 'position', 'objectFit', 'mixBlendMode', 'overflow', 'overflowWrap', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'width', 'height', 'maxHeight', 'transform', 'containerType', 'containerName', 'visibility'];
    const nodes = [rootNode, ...Array.from(rootNode.querySelectorAll('[data-testid="preview-artboard"], [data-testid="product-preview-carousel"] img, [data-testid="product-preview-carousel"] [data-testid="brand-logo-preview"], [data-testid="product-preview-carousel"] [data-testid="brand-text-preview"], [data-testid="preview-artboard"] img, [data-testid="preview-artboard"] [data-testid="brand-logo-preview"], [data-testid="preview-artboard"] [data-testid="brand-text-preview"]'))];
    return nodes.map(node => ({ tag: node.tagName, testId: node.getAttribute('data-testid'), alt: node.getAttribute('alt'), src: node.getAttribute('src'), rect: rect(node), styles: Object.fromEntries(keys.map(key => [key, getComputedStyle(node)[key]])), containerRect: (() => { const candidate = node.closest('[data-testid="preview-artboard"]'); return candidate ? rect(candidate) : null; })() }));
  });
}
async function capturePanel(page, viewport, state) {
  await settle(page);
  const file = `${viewport.name}-${state}.png`;
  const panel = page.locator('[data-testid="live-preview-panel"]');
  await panel.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const semanticDom = await panel.evaluate(element => Array.from([element, ...element.querySelectorAll('h2,h3,button,[role="switch"],img,[data-testid]')]).map(node => ({ tag: node.tagName, role: node.getAttribute('role'), label: node.getAttribute('aria-label'), checked: node.getAttribute('aria-checked'), disabled: node.getAttribute('disabled'), testId: node.getAttribute('data-testid'), alt: node.getAttribute('alt'), src: node.getAttribute('src'), text: node.children.length === 0 ? node.textContent : undefined })));
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, semanticDom, geometry: await snapshotGeometry(panel) });
}
async function captureResponsive(page, viewport, state) {
  await settle(page);
  const file = `${viewport.name}-${state}.png`;
  const rootNode = page.locator('main[data-step2-view="configure"]');
  await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
  const semanticDom = await rootNode.evaluate(element => ({ view: element.getAttribute('data-step2-view'), mode: element.getAttribute('data-configure-mode'), artwork: Array.from(element.querySelectorAll('[data-testid="preview-artboard"], img, [data-testid="brand-logo-preview"], [data-testid="brand-text-preview"]')).map(node => ({ tag: node.tagName, testId: node.getAttribute('data-testid'), src: node.getAttribute('src'), alt: node.getAttribute('alt'), text: node.children.length === 0 ? node.textContent : undefined })) }));
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, semanticDom, geometry: await snapshotGeometry(rootNode) });
}
