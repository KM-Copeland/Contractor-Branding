import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const phase = process.argv[2];
if (!['before', 'after', 'repeat'].includes(phase)) throw new Error('Usage: node docs/architecture/capture-phase2d-step2-css.mjs before|after|repeat');
const root = path.resolve('docs/architecture/evidence/phase2d');
const output = path.join(root, phase);
const allViewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1140', width: 768, height: 1140 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1279x800', width: 1279, height: 800 },
  { name: '1280x900', width: 1280, height: 900 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const requestedWidths = process.env.PHASE2D_WIDTHS?.split(',').map(Number);
const viewports = requestedWidths ? allViewports.filter(viewport => requestedWidths.includes(viewport.width)) : allViewports;
const productNames = ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Equipment Interface Module'];
const styleProperties = ['display', 'position', 'color', 'backgroundColor', 'borderColor', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'marginTop', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'overflow', 'overflowX', 'overflowY', 'touchAction', 'opacity', 'transform', 'boxSizing', 'alignItems', 'justifyContent', 'gridTemplateColumns', 'flex'];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const computed = {};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#select-products', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const name of productNames) await page.getByRole('checkbox', { name, exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);

    const capture = async state => {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const file = `${viewport.name}-${state}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
      computed[`${viewport.name}/${state}`] = await page.evaluate(properties => {
        const roots = [document.querySelector('main'), document.querySelector('[data-testid="selected-products-rail"][data-mode="branding"]')].filter(Boolean);
        const records = [];
        const serialize = element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          records.push({ selector: element.tagName.toLowerCase(), testId: element.getAttribute('data-testid'), role: element.getAttribute('role'), text: (element.innerText || '').trim().slice(0, 90), classes: element.className?.baseVal ?? element.className ?? '', rect: [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value * 100) / 100), scroll: [element.scrollWidth, element.scrollHeight], style: Object.fromEntries(properties.map(property => [property, style[property]])) });
        };
        for (const root of roots) {
          serialize(root);
          root.querySelectorAll('*').forEach(serialize);
        }
        return records;
      }, styleProperties);
      captures.push({ file, state, viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce', fontsReady: await page.evaluate(() => document.fonts.status === 'loaded') });
    };

    await capture('imprint-empty');
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor branding');
    await page.getByRole('textbox', { name: 'Line 2' }).fill('Configured for review');
    await page.getByRole('button', { name: 'Bold line 1' }).click();
    const generatedPng = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 240;
      const context = canvas.getContext('2d'); context.fillStyle = '#3155a4'; context.fillRect(0, 0, 600, 240);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    const goodPng = pngWithDpi(Buffer.from(generatedPng, 'base64'), 300);
    await page.locator('input[type=file]').setInputFiles({ name: 'phase2d-success.png', mimeType: 'image/png', buffer: goodPng });
    await page.getByRole('button', { name: 'Remove logo' }).waitFor();
    if (viewport.width >= 1280) await page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' }).waitFor();
    await capture('imprint-success-text-bold');

    const warningSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#3155a4" d="M10 10h80v80H10z"/></svg>';
    await page.locator('input[type=file]').setInputFiles({ name: 'phase2d-warning.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(warningSvg) });
    await page.getByRole('status').filter({ hasText: 'Logo may require print review' }).waitFor();
    await capture('imprint-warning');

    await page.locator('input[type=file]').setInputFiles({ name: 'phase2d-error.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await page.getByRole('alert').waitFor();
    await capture('imprint-error');

    if (viewport.width <= 1279) {
      await page.locator('input[type=file]').setInputFiles({ name: 'phase2d-valid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(warningSvg) });
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByRole('tab', { name: 'List' }).waitFor();
      await capture('configure-list');
      const firstCard = page.locator('[data-testid="configuration-card-sensi-smart"]');
      await firstCard.getByRole('button', { name: 'Logo', exact: true }).click();
      await capture('configure-list-configured');
      await page.getByRole('tab', { name: 'Preview' }).click();
      await page.getByRole('heading', { name: 'Preview products' }).waitFor().catch(() => undefined);
      await page.locator('[data-testid="preview-product-summary"]').waitFor();
      await capture('configure-preview');
    }
    await context.close();
  }

  const metadata = { phase, browser: `Chromium ${browser.version()}`, conditions: { viewports, productNames, deviceScaleFactor: 1, browserZoom: '100% default', reducedMotion: 'reduce' }, captures, computed };
  await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  if (phase === 'after') {
    const before = JSON.parse(await readFile(path.join(root, 'before', 'metadata.json'), 'utf8'));
    const styleDifferences = compare(before.computed, computed).filter(difference => !difference.path.endsWith('.classes'));
    await writeFile(path.join(output, 'computed-style-differences.json'), `${JSON.stringify(styleDifferences, null, 2)}\n`);
    const screenshotComparisons = await Promise.all(captures.map(async item => {
      const [left, right] = await Promise.all([readFile(path.join(root, 'before', item.file)), readFile(path.join(output, item.file))]);
      const pixels = comparePngPixels(left, right);
      return { file: item.file, identicalPixels: pixels.differentPixels === 0, ...pixels, beforeSha256: createHash('sha256').update(left).digest('hex'), afterSha256: createHash('sha256').update(right).digest('hex') };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify(screenshotComparisons, null, 2)}\n`);
    if (styleDifferences.length || screenshotComparisons.some(item => !item.identicalPixels)) throw new Error(`Detected ${styleDifferences.length} computed-style differences and ${screenshotComparisons.filter(item => !item.identicalPixels).length} pixel-different screenshots.`);
  }
  if (phase === 'repeat') {
    const previous = JSON.parse(await readFile(path.join(root, 'after', 'metadata.json'), 'utf8'));
    const screenshotComparisons = await Promise.all(captures.map(async item => {
      const [left, right] = await Promise.all([readFile(path.join(root, 'after', item.file)), readFile(path.join(output, item.file))]);
      const pixels = comparePngPixels(left, right);
      return { file: item.file, identicalPixels: pixels.differentPixels === 0, ...pixels };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify({ referencePhase: 'after', referenceCaptureCount: previous.captures.length, comparisons: screenshotComparisons }, null, 2)}\n`);
  }
} finally {
  await browser.close();
}
console.log(`Captured ${captures.length} screenshots for ${phase}.`);

function compare(before, after, prefix = '') {
  const differences = [];
  for (const key of new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])) {
    const name = prefix ? `${prefix}.${key}` : key;
    const left = before?.[key], right = after?.[key];
    if (left && right && typeof left === 'object' && typeof right === 'object') differences.push(...compare(left, right, name));
    else if (JSON.stringify(left) !== JSON.stringify(right)) differences.push({ path: name, before: left, after: right });
  }
  return differences;
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
    if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`Unsupported PNG: ${bitDepth}/${colorType}`);
    const channels = colorType === 6 ? 4 : 3, stride = width * channels, filtered = inflateSync(Buffer.concat(imageData)), pixels = Buffer.alloc(height * stride);
    const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
    for (let y = 0; y < height; y++) {
      const filter = filtered[y * (stride + 1)], input = y * (stride + 1) + 1, output = y * stride;
      for (let x = 0; x < stride; x++) {
        const raw = filtered[input + x], left = x >= channels ? pixels[output + x - channels] : 0, above = y ? pixels[output + x - stride] : 0, upperLeft = y && x >= channels ? pixels[output + x - stride - channels] : 0;
        const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : paeth(left, above, upperLeft);
        pixels[output + x] = (raw + predictor) & 255;
      }
    }
    return { width, height, pixels, channels };
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

function pngWithDpi(png, dpi) {
  const data = Buffer.alloc(9);
  const pixelsPerMeter = Math.round(dpi * 39.37007874);
  data.writeUInt32BE(pixelsPerMeter, 0);
  data.writeUInt32BE(pixelsPerMeter, 4);
  data[8] = 1;
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write('pHYs', 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 17)), 17);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
