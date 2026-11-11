import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase4h-responsive.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase4h/responsive');
const output = path.join(root, phase);
const viewports = [
  { name: '320x568', width: 320, height: 568 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '414x896', width: 414, height: 896 },
  { name: '767x800', width: 767, height: 800 },
  { name: '768x1140', width: 768, height: 1140 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1279x800', width: 1279, height: 800 },
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const transitions = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByTestId('imprint-details-panel').waitFor({ state: 'visible' });
    await capture(page, viewport, 'empty');

    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor imprint sample');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('Shared across all products');
    await page.getByRole('button', { name: 'Bold line 1' }).click();
    await page.getByRole('button', { name: 'Bold line 2' }).click();
    await capture(page, viewport, 'text-bold');

    const goodPng = pngWithDpi(await rasterBuffer(page, 600, 240), 300);
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4a-success.png', mimeType: 'image/png', buffer: goodPng });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor({ state: 'visible' });
    if (viewport.width >= 1280) await page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' }).waitFor();
    await capture(page, viewport, 'upload-success');

    const warningSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#3155a4" d="M10 10h80v80H10z"/></svg>';
    await page.locator('input[type=file]').setInputFiles({ name: 'phase4a-warning.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(warningSvg) });
    await page.getByRole('status').filter({ hasText: 'Logo may require print review' }).waitFor();
    await capture(page, viewport, 'upload-warning');

    await page.locator('input[type=file]').setInputFiles({ name: 'phase4a-error.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await page.getByRole('alert').waitFor();
    await capture(page, viewport, 'upload-error');

    if (viewport.width <= 1279) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.locator('[data-step2-view="configure"][data-configure-mode="list"]').waitFor();
      await capture(page, viewport, 'configure-list');
      await page.locator('[data-testid="configuration-card-sensi-smart"]').getByRole('button', { name: 'Text', exact: true }).click();
      await capture(page, viewport, 'configure-list-configured');
      await page.getByRole('tab', { name: 'Preview' }).click();
      await page.locator('[data-step2-view="configure"][data-configure-mode="preview"]').waitFor();
      await capture(page, viewport, 'configure-preview');
    }

    if (viewport.width === 1279) {
      await page.getByRole('button', { name: 'Back to imprint details' }).click();
      await expectImprintState(page, 'Contractor imprint sample', 'Logo does not meet upload requirements');
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.getByRole('heading', { name: 'Imprint details', exact: true }).waitFor({ state: 'visible' });
      await expectImprintState(page, 'Contractor imprint sample', 'Logo does not meet upload requirements');
      const desktopPanelPresent = await page.getByRole('heading', { name: 'Imprint details', exact: true }).isVisible();
      await page.setViewportSize({ width: 1279, height: 800 });
      await page.getByRole('heading', { name: 'Logo (optional)', exact: true }).waitFor({ state: 'visible' });
      await expectImprintState(page, 'Contractor imprint sample', 'Logo does not meet upload requirements');
      const responsivePanelPresent = await page.getByRole('heading', { name: 'Logo (optional)', exact: true }).isVisible();
      transitions.push({ sequence: '1279-to-1280-to-1279', inputValuePreserved: true, errorAnnouncementPreserved: true, breakpointComposition: { desktopPanelPresent, responsivePanelPresent } });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { viewports, deviceScaleFactor: 1, browserZoom: '100% default', reducedMotion: 'reduce', products: ['Sensi Smart'], lines: ['Contractor imprint sample', 'Shared across all products'] }, captures, transitions };
await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

if (phase !== 'before') {
  const baselinePhase = phase === 'after' ? 'before' : 'after';
  const baseline = JSON.parse(await readFile(path.join(root, baselinePhase, 'metadata.json'), 'utf8'));
  const comparisons = [];
  for (const item of captures) {
    const expected = baseline.captures.find(record => record.file === item.file);
    if (!expected) throw new Error(`Missing capture counterpart: ${item.file}`);
    const [left, right] = await Promise.all([readFile(path.join(root, baselinePhase, item.file)), readFile(path.join(output, item.file))]);
    const pixels = comparePngPixels(left, right);
    comparisons.push({ file: item.file, domIdentical: normalizeDOM(expected.dom) === normalizeDOM(item.dom), geometryIdentical: JSON.stringify(expected.geometry) === JSON.stringify(item.geometry), pixelsIdentical: pixels.differentPixels === 0, ...pixels, baselineSha256: createHash('sha256').update(left).digest('hex'), currentSha256: createHash('sha256').update(right).digest('hex') });
  }
  await writeFile(path.join(output, 'comparisons.json'), `${JSON.stringify({ baselinePhase, comparisons }, null, 2)}\n`);
  if (phase === 'after' && comparisons.some(item => !item.domIdentical || !item.geometryIdentical || !item.pixelsIdentical)) throw new Error(`Visual comparison differences: ${comparisons.filter(item => !item.domIdentical || !item.geometryIdentical || !item.pixelsIdentical).length} of ${comparisons.length}`);
}
console.log(`Captured ${captures.length} screenshots for ${phase}; breakpoint transitions checked: ${transitions.length}.`);

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
  const snapshot = await panelSnapshot(page);
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="imprint-details-panel"]');
    const main = document.querySelector('#main');
    const elements = [{ name: 'panel', element: panel }, { name: 'heading', element: panel?.querySelector('h2, h3') }];
    panel?.querySelectorAll('input[aria-label^="Line "]').forEach((input, index) => {
      const wrap = input.parentElement;
      const controls = wrap?.parentElement;
      const row = controls?.parentElement;
      const label = row?.querySelector('label');
      elements.push({ name: `line-${index + 1}-row`, element: row }, { name: `line-${index + 1}-label`, element: label }, { name: `line-${index + 1}-counter`, element: label?.lastElementChild }, { name: `line-${index + 1}-controls`, element: controls }, { name: `line-${index + 1}-input-wrap`, element: wrap }, { name: `line-${index + 1}-input`, element: input }, { name: `line-${index + 1}-bold`, element: row?.querySelector('button[aria-label^="Bold line"]') });
    });
    const dropzone = panel?.querySelector('button[aria-label="Upload logo"]');
    elements.push({ name: 'dropzone', element: dropzone }, { name: 'dropzone-icon', element: dropzone?.querySelector('svg') }, { name: 'dropzone-copy', element: dropzone?.querySelector('span') }, { name: 'dropzone-guidance', element: panel?.querySelector('#logo-guidance') });
    const remove = panel?.querySelector('button[aria-label="Remove logo"]');
    const fileCard = remove?.parentElement;
    elements.push({ name: 'uploaded-file-card', element: fileCard }, { name: 'logo-thumbnail', element: fileCard?.firstElementChild }, { name: 'remove-logo', element: remove });
    const note = Array.from(panel?.querySelectorAll('p') ?? []).find(item => item.textContent?.startsWith('These details are shared.') || item.textContent?.startsWith('Your imprint details are saved'));
    const validation = panel?.querySelector('[role="status"], [role="alert"]');
    const validationContent = validation?.querySelector('div');
    const details = validation?.querySelector('details');
    elements.push({ name: 'validation-progress-or-message', element: validation }, { name: 'validation-icon', element: validation?.querySelector('[aria-hidden="true"]') }, { name: 'validation-content', element: validationContent }, { name: 'validation-title', element: validationContent?.querySelector('p') }, { name: 'validation-details', element: details }, { name: 'validation-summary', element: details?.querySelector('summary') }, { name: 'shared-note', element: note });
    const visible = elements.filter(item => item.element);
    const rect = element => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return [box.x, box.y, box.width, box.height].map(value => Math.round(value * 100) / 100);
    };
    const styleKeys = ['display', 'position', 'color', 'backgroundColor', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderColor', 'borderStyle', 'outlineColor', 'outlineWidth', 'outlineOffset', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'gap', 'width', 'height', 'minWidth', 'maxWidth', 'flexGrow', 'flexShrink', 'alignItems', 'justifyContent', 'textAlign', 'whiteSpace', 'cursor', 'opacity'];
    return { main: rect(main), elements: visible.map(({ name, element }) => ({ name, tag: element.tagName, ariaLabel: element.getAttribute('aria-label'), role: element.getAttribute('role'), id: element.id, rect: rect(element), style: Object.fromEntries(styleKeys.map(key => [key, getComputedStyle(element)[key]])) })), scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth };
  });
  const lineValues = await page.locator('input[aria-label^="Line "]').evaluateAll(inputs => inputs.map(input => input.value));
  captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, dom: snapshot, geometry, lineValues });
}

async function panelSnapshot(page) {
  return page.locator('[data-testid="imprint-details-panel"], #main').first().evaluate(element => element.outerHTML.replace(/blob:http:\/\/[^/]+\/[0-9a-f-]+/g, 'blob:<runtime-object-url>'));
}

function normalizeDOM(markup) {
  return markup.replace(/\sclass="[^"]*"/g, '');
}

async function expectImprintState(page, line, validation) {
  const input = page.getByRole('textbox', { name: 'Line 1' });
  await input.waitFor({ state: 'visible' });
  if (await input.inputValue() !== line) throw new Error('Line 1 value changed across the breakpoint');
  await page.getByRole('alert').filter({ hasText: validation }).waitFor({ state: 'visible' });
}

async function rasterBuffer(page, width, height) {
  const dataUrl = await page.evaluate(({ width, height }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d'); context.fillStyle = '#3155a4'; context.fillRect(0, 0, width, height);
    return canvas.toDataURL('image/png');
  }, { width, height });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

function pngWithDpi(png, dpi) {
  const data = Buffer.alloc(9), pixelsPerMeter = Math.round(dpi * 39.37007874);
  data.writeUInt32BE(pixelsPerMeter, 0); data.writeUInt32BE(pixelsPerMeter, 4); data[8] = 1;
  const chunk = Buffer.alloc(21); chunk.writeUInt32BE(data.length, 0); chunk.write('pHYs', 4); data.copy(chunk, 8); chunk.writeUInt32BE(crc32(chunk.subarray(4, 17)), 17);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1; }
  return (crc ^ 0xffffffff) >>> 0;
}

function comparePngPixels(leftBytes, rightBytes) {
  const decode = bytes => {
    let width, height, bitDepth, colorType;
    const imageData = [];
    for (let offset = 8; offset < bytes.length;) {
      const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8), data = bytes.subarray(offset + 8, offset + 8 + length);
      if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
      else if (type === 'IDAT') imageData.push(data);
      offset += length + 12;
      if (type === 'IEND') break;
    }
    if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`Unsupported PNG ${bitDepth}/${colorType}`);
    const channels = colorType === 6 ? 4 : 3, stride = width * channels, filtered = inflateSync(Buffer.concat(imageData)), pixels = Buffer.alloc(height * stride);
    const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
    for (let y = 0; y < height; y++) {
      const filter = filtered[y * (stride + 1)], input = y * (stride + 1) + 1, outputOffset = y * stride;
      for (let x = 0; x < stride; x++) {
        const raw = filtered[input + x], left = x >= channels ? pixels[outputOffset + x - channels] : 0, above = y ? pixels[outputOffset + x - stride] : 0, upperLeft = y && x >= channels ? pixels[outputOffset + x - stride - channels] : 0;
        const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : paeth(left, above, upperLeft);
        pixels[outputOffset + x] = (raw + predictor) & 255;
      }
    }
    return { width, height, channels, pixels };
  };
  const left = decode(leftBytes), right = decode(rightBytes);
  if (left.width !== right.width || left.height !== right.height) return { differentPixels: Math.max(left.width * left.height, right.width * right.height) };
  let differentPixels = 0, minX = left.width, minY = left.height, maxX = -1, maxY = -1;
  for (let offset = 0; offset < left.pixels.length; offset += left.channels) {
    let differs = false;
    for (let channel = 0; channel < left.channels; channel++) differs ||= left.pixels[offset + channel] !== right.pixels[offset + channel];
    if (differs) { differentPixels++; const pixel = offset / left.channels, x = pixel % left.width, y = Math.floor(pixel / left.width); minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  }
  return { differentPixels, bounds: differentPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null };
}

