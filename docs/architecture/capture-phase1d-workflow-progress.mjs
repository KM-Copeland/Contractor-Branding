import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('Usage: node docs/architecture/capture-phase1d-workflow-progress.mjs before|after');

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const root = path.resolve('docs/architecture/evidence/phase1d');
const output = path.join(root, label);
const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1140', width: 768, height: 1140 },
  { name: 'tablet-1279x800', width: 1279, height: 800 },
  { name: 'desktop-1280x900', width: 1280, height: 900 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];
const styleProperties = [
  'backgroundColor', 'animationName', 'animationDuration', 'animationTimingFunction', 'animationIterationCount',
  'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'height', 'width', 'position', 'overflow',
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshots = [];
const states = {};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/#select-products`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const capture = async state => {
      const progress = page.getByRole('progressbar', { name: 'Setup progress' });
      await progress.waitFor({ state: 'visible' });
      await expectReady(progress);
      await page.mouse.move(0, 0);
      await page.evaluate(async () => {
        await document.fonts.ready;
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const geometry = await progress.evaluate((element, properties) => {
        const trackStyle = getComputedStyle(element);
        const fill = element.querySelector('span');
        const fillStyle = getComputedStyle(fill);
        const rect = target => {
          const box = target.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
        };
        return {
          aria: {
            role: element.getAttribute('role'),
            label: element.getAttribute('aria-label'),
            min: element.getAttribute('aria-valuemin'),
            max: element.getAttribute('aria-valuemax'),
            now: element.getAttribute('aria-valuenow'),
          },
          track: { ...Object.fromEntries(properties.map(property => [property, trackStyle[property]])), rect: rect(element) },
          fill: { ...Object.fromEntries(properties.map(property => [property, fillStyle[property]])), rect: rect(fill) },
        };
      }, styleProperties);
      states[`${viewport.name}/${state}`] = geometry;
      const file = `${viewport.name}-${state}.png`;
      await progress.screenshot({ path: path.join(output, file), animations: 'disabled' });
      screenshots.push({ file, state, route: new URL(page.url()).hash, viewport: { width: viewport.width, height: viewport.height }, browser: `Chromium ${browser.version()}`, deviceScaleFactor: 1, browserZoom: '100% (default Playwright context)', reducedMotion: 'reduce', bounds: geometry.track.rect });
    };

    await capture('step1');
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await capture('step2');
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Configured');
    if (viewport.width < 1280) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByTestId('configuration-card-sensi-smart').getByRole('button', { name: 'Text', exact: true }).click();
    } else {
      await page.getByRole('switch', { name: 'Text imprint' }).click();
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#complete$/);
    await capture('complete');
    await context.close();
  }

  const metadata = {
    label,
    capturedAt: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    conditions: { deviceScaleFactor: 1, browserZoom: '100% (default Playwright context)', reducedMotion: 'reduce', selectedProducts: ['Sensi Smart'] },
    states,
    screenshots,
  };
  await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  if (label === 'after') {
    const before = JSON.parse(await readFile(path.join(root, 'before', 'metadata.json'), 'utf8'));
    const styleDifferences = compare(before.states, states);
    await writeFile(path.join(output, 'computed-style-differences.json'), `${JSON.stringify(styleDifferences, null, 2)}\n`);
    if (styleDifferences.length) throw new Error(`Progress computed styles or geometry changed in ${styleDifferences.length} field(s).`);
    const comparisons = await Promise.all(screenshots.map(async capture => {
      const [beforeBytes, afterBytes] = await Promise.all([readFile(path.join(root, 'before', capture.file)), readFile(path.join(output, capture.file))]);
      const pixelComparison = comparePngPixels(beforeBytes, afterBytes);
      return { file: capture.file, identicalPixels: pixelComparison.differentPixels === 0, ...pixelComparison, beforeSha256: createHash('sha256').update(beforeBytes).digest('hex'), afterSha256: createHash('sha256').update(afterBytes).digest('hex') };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify(comparisons, null, 2)}\n`);
    const changed = comparisons.filter(result => !result.identicalPixels);
    if (changed.length) throw new Error(`Progress screenshot pixels differ for ${changed.length} capture(s).`);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${screenshots.length} workflow-progress screenshots to ${output}`);

async function expectReady(progress) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await progress.getAttribute('data-ready') === 'true') return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error('Workflow progress did not finish its initial readiness handling.');
}

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
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!bytes.subarray(0, 8).equals(signature)) throw new Error('Screenshot is not a PNG.');
    let width, height, bitDepth, colorType;
    const imageData = [];
    for (let offset = 8; offset < bytes.length;) {
      const length = bytes.readUInt32BE(offset);
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      const data = bytes.subarray(offset + 8, offset + 8 + length);
      if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
      else if (type === 'IDAT') imageData.push(data);
      offset += length + 12;
      if (type === 'IEND') break;
    }
    if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`Unsupported PNG format: bit depth ${bitDepth}, color type ${colorType}.`);
    const channels = colorType === 6 ? 4 : 3;
    const stride = width * channels;
    const filtered = inflateSync(Buffer.concat(imageData));
    const pixels = Buffer.alloc(height * stride);
    const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
    for (let y = 0; y < height; y++) {
      const filter = filtered[y * (stride + 1)], inputOffset = y * (stride + 1) + 1, outputOffset = y * stride;
      for (let x = 0; x < stride; x++) {
        const raw = filtered[inputOffset + x], left = x >= channels ? pixels[outputOffset + x - channels] : 0;
        const above = y > 0 ? pixels[outputOffset + x - stride] : 0;
        const upperLeft = y > 0 && x >= channels ? pixels[outputOffset + x - stride - channels] : 0;
        const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : filter === 4 ? paeth(left, above, upperLeft) : NaN;
        if (!Number.isFinite(predictor)) throw new Error(`Unsupported PNG row filter: ${filter}.`);
        pixels[outputOffset + x] = (raw + predictor) & 255;
      }
    }
    return { width, height, channels, pixels };
  };
  const left = decode(leftBytes), right = decode(rightBytes);
  if (left.width !== right.width || left.height !== right.height) return { differentPixels: Math.max(left.width * left.height, right.width * right.height) };
  let differentPixels = 0;
  for (let offset = 0; offset < left.pixels.length; offset += left.channels) {
    for (let channel = 0; channel < left.channels; channel++) if (left.pixels[offset + channel] !== right.pixels[offset + channel]) { differentPixels++; break; }
  }
  return { differentPixels };
}
