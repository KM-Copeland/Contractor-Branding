import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('Usage: node docs/architecture/capture-phase2a-selection-css.mjs before|after');

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const root = path.resolve('docs/architecture/evidence/phase2a');
const output = path.join(root, label);
const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1140', width: 768, height: 1140 },
  { name: 'tablet-1279x800', width: 1279, height: 800 },
  { name: 'desktop-1280x900', width: 1280, height: 900 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];
const names = ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Equipment Interface Module'];
const styleProperties = [
  'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'opacity', 'fontFamily', 'fontSize',
  'fontWeight', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'width', 'height',
  'minWidth', 'display', 'position', 'alignItems', 'justifyContent', 'flex', 'textDecorationLine', 'textUnderlineOffset',
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const computed = {};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/#select-products`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const clearAll = page.getByRole('button', { name: 'Clear All' });
    if (await clearAll.isVisible()) await clearAll.click();
    let mode = 'selection';
    let rail = page.locator(`[data-testid="selected-products-rail"][data-mode="${mode}"]`);

    const capture = async (state, fullPage = false) => {
      await page.mouse.move(0, 0);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const railBox = await rail.isVisible() ? await rail.boundingBox() : null;
      const file = `${viewport.name}-${state}.png`;
      if (fullPage || !railBox) await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
      else await page.screenshot({ path: path.join(output, file), clip: { x: railBox.x, y: railBox.y, width: railBox.width, height: railBox.height }, animations: 'disabled' });
      const inspection = railBox ? await inspectSidebar(page, mode) : await inspectResponsivePage(page);
      computed[`${viewport.name}/${state}`] = inspection;
      captures.push({
        file,
        state,
        route: new URL(page.url()).hash,
        viewport: { width: viewport.width, height: viewport.height },
        browser: `Chromium ${browser.version()}`,
        deviceScaleFactor: 1,
        browserZoom: '100% (default Playwright context)',
        reducedMotion: 'reduce',
        fontsReady: await page.evaluate(() => document.fonts.status === 'loaded'),
        visibleImagesLoaded: railBox ? await rail.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)) : await page.locator('main img:visible').evaluateAll(images => images.every(image => (image).complete && (image).naturalWidth > 0)),
        sidebarBounds: railBox,
      });
    };

    await capture('step1-empty');
    await page.getByRole('checkbox', { name: names[0], exact: true }).check();
    await capture('step1-single');
    for (const name of names.slice(1)) await page.getByRole('checkbox', { name, exact: true }).check();
    await capture('step1-multiple-categories');
    if (await rail.isVisible()) {
      await page.getByRole('button', { name: 'Remove 80 Series', exact: true }).click();
      await capture('step1-after-removal');
      await page.getByRole('checkbox', { name: names[1], exact: true }).check();
    }
    await page.getByRole('button', { name: 'Wallplates', exact: true }).click();
    await page.getByRole('searchbox').fill('Touch');
    await capture('step1-filtered-search', true);
    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    mode = 'branding';
    rail = page.locator(`[data-testid="selected-products-rail"][data-mode="${mode}"]`);
    await page.getByRole('heading', { name: 'Create your imprint' }).waitFor();
    if (!(await rail.isVisible())) {
      await capture('step2-unconfigured');
      await context.close();
      continue;
    }
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Company branding');
    const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#123456" d="M10 10h80v80H10z"/><circle fill="#fff" cx="50" cy="50" r="20"/></svg>';
    await page.locator('input[type=file]').setInputFiles({ name: 'phase1c-logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(logo) });

    const selectActive = async (productId, name) => {
      await rail.locator(`[data-product-id="${productId}"] [data-selection-product-pick]`).click();
      await page.getByRole('heading', { name: 'Create your imprint' }).waitFor();
      const row = rail.locator(`[data-product-id="${productId}"]`);
      await row.waitFor();
      const previewName = page.locator('[aria-labelledby="preview-heading"]').getByText(name, { exact: true });
      await previewName.waitFor();
      if ((await previewName.textContent())?.trim() !== name) throw new Error(`Active preview did not update to ${name}`);
    };

    if (await page.getByRole('switch', { name: 'logo imprint' }).count()) await page.getByRole('switch', { name: 'logo imprint' }).click();
    else await page.locator('[data-testid="configuration-card-sensi-smart"]').getByRole('button', { name: 'Logo', exact: true }).click();
    if (await page.getByRole('switch', { name: 'Text imprint' }).count()) await page.getByRole('switch', { name: 'Text imprint' }).click();
    else await page.locator('[data-testid="configuration-card-sensi-smart"]').getByRole('button', { name: 'Text', exact: true }).click();
    await capture('step2-mixed-sensi-active');

    if (await rail.isVisible()) {
      await selectActive('80-series', '80 Series');
      await page.getByRole('switch', { name: 'Text imprint' }).click();
    } else {
      await page.getByRole('tab', { name: 'Preview' }).click();
      await page.getByRole('button', { name: 'Show 80 Series' }).click();
    }
    await capture('step2-mixed-80-series-active');
    await capture('step2-configured', true);

    if (await rail.isVisible()) {
      await selectActive('wallplate-80-70-sensi', '70/80 series, Sensi Smart');
      await page.getByRole('switch', { name: 'Logo imprint' }).click();
      await capture('step2-mixed-wallplate-active');

      await selectActive('sensi-module', 'Sensi Equipment Interface Module');
      await page.getByRole('switch', { name: 'logo imprint' }).click();
      await page.getByRole('switch', { name: 'Text imprint' }).click();
      await capture('step2-mixed-module-active');
    }
    await context.close();
  }

  const metadata = {
    label,
    capturedAt: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    conditions: { deviceScaleFactor: 1, browserZoom: '100% (default Playwright context)', reducedMotion: 'reduce', deterministicProducts: names },
    computed,
    screenshots: captures,
  };
  await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  if (label === 'after') {
    const before = JSON.parse(await readFile(path.join(root, 'before', 'metadata.json'), 'utf8'));
    const styleDifferences = compare(before.computed, computed);
    await writeFile(path.join(output, 'computed-style-differences.json'), `${JSON.stringify(styleDifferences, null, 2)}\n`);
    if (styleDifferences.length) throw new Error(`Selected-product computed styles changed in ${styleDifferences.length} field(s).`);
    const screenshotComparisons = await Promise.all(captures.map(async capture => {
      const [beforeBytes, afterBytes] = await Promise.all([
        readFile(path.join(root, 'before', capture.file)),
        readFile(path.join(output, capture.file)),
      ]);
      const beforeSha256 = createHash('sha256').update(beforeBytes).digest('hex');
      const afterSha256 = createHash('sha256').update(afterBytes).digest('hex');
      const pixelComparison = comparePngPixels(beforeBytes, afterBytes);
      return { file: capture.file, identicalPixels: pixelComparison.differentPixels === 0, ...pixelComparison, beforeSha256, afterSha256 };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify(screenshotComparisons, null, 2)}\n`);
    const changed = screenshotComparisons.filter(item => !item.identicalPixels);
    if (changed.length) throw new Error(`Selected-product screenshot pixels differ for ${changed.length} capture(s).`);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captures.length} selected-product screenshots to ${output}`);

async function inspectSidebar(page, mode) {
  return page.locator(`[data-testid="selected-products-rail"][data-mode="${mode}"]`).evaluate((rail, properties) => {
    const getStyle = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        ...Object.fromEntries(properties.map(property => [property, style[property]])),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    };
    const groups = Array.from(rail.querySelectorAll('[data-selected-product-groups] h3'));
    const rows = Array.from(rail.querySelectorAll('[data-product-id]'));
    const result = {
      rail: getStyle(rail),
      headings: groups.map(heading => ({ text: heading.textContent, style: getStyle(heading) })),
      rows: rows.map(row => ({
        productId: row.getAttribute('data-product-id'),
        row: getStyle(row),
        productName: getStyle(row.querySelector('[class*="productName"]')),
        statusGroup: getStyle(row.querySelector('[data-testid="imprint-status-indicators"]')),
        mutedStatus: row.querySelector('[data-muted="true"]') ? getStyle(row.querySelector('[data-muted="true"]')) : null,
        removeButton: getStyle(row.querySelector('[data-product-remove]')),
        activeVisibility: row.querySelector('[aria-label="Shown in preview"]') ? getStyle(row.querySelector('[aria-label="Shown in preview"]')) : null,
        active: row.className.includes('activeRow'),
      })),
    };
    const removeTextClass = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules); } catch { return []; }
    }).map(rule => rule.selectorText).filter(Boolean).flatMap(selector => selector.match(/\.[\w-]*removeText[\w-]*/g) ?? [])[0];
    if (removeTextClass) {
      const probe = document.createElement('button');
      probe.className = removeTextClass.slice(1);
      probe.textContent = 'Remove';
      probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;';
      document.body.append(probe);
      result.removeTextVariant = getStyle(probe);
      probe.remove();
    }
    return result;
  }, styleProperties);
}

async function inspectResponsivePage(page) {
  return page.evaluate(() => {
    const targets = ['main', '[data-testid="step1-action-footer"]', '[data-testid="step2-action-footer"]', '[data-testid="product-configuration-list"]', '[data-testid="configure-products-panel"]'];
    return Object.fromEntries(targets.map(selector => {
      const element = document.querySelector(selector);
      if (!element) return [selector, null];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return [selector, { display: style.display, position: style.position, overflow: style.overflow, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } }];
    }));
  });
}

function compare(before, after, prefix = '') {
  const differences = [];
  for (const key of new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])) {
    const name = prefix ? `${prefix}.${key}` : key;
    const left = before?.[key];
    const right = after?.[key];
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
      if (type === 'IHDR') {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        bitDepth = data[8];
        colorType = data[9];
      } else if (type === 'IDAT') imageData.push(data);
      offset += length + 12;
      if (type === 'IEND') break;
    }
    if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`Unsupported screenshot PNG format: bit depth ${bitDepth}, color type ${colorType}.`);
    const channels = colorType === 6 ? 4 : 3;
    const stride = width * channels;
    const filtered = inflateSync(Buffer.concat(imageData));
    const pixels = Buffer.alloc(height * stride);
    const paeth = (a, b, c) => {
      const p = a + b - c;
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    };
    for (let y = 0; y < height; y++) {
      const filter = filtered[y * (stride + 1)];
      const inputOffset = y * (stride + 1) + 1;
      const outputOffset = y * stride;
      for (let x = 0; x < stride; x++) {
        const raw = filtered[inputOffset + x];
        const left = x >= channels ? pixels[outputOffset + x - channels] : 0;
        const above = y > 0 ? pixels[outputOffset + x - stride] : 0;
        const upperLeft = y > 0 && x >= channels ? pixels[outputOffset + x - stride - channels] : 0;
        const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : filter === 4 ? paeth(left, above, upperLeft) : NaN;
        if (!Number.isFinite(predictor)) throw new Error(`Unsupported PNG row filter: ${filter}.`);
        pixels[outputOffset + x] = (raw + predictor) & 255;
      }
    }
    return { width, height, pixels };
  };
  const left = decode(leftBytes), right = decode(rightBytes);
  if (left.width !== right.width || left.height !== right.height) return { differentPixels: Math.max(left.width * left.height, right.width * right.height) };
  let differentPixels = 0;
  let minX = left.width, minY = left.height, maxX = -1, maxY = -1;
  const channels = left.pixels.length / (left.width * left.height);
  for (let offset = 0; offset < left.pixels.length; offset += channels) {
    let differs = false;
    for (let channel = 0; channel < channels; channel++) differs ||= left.pixels[offset + channel] !== right.pixels[offset + channel];
    if (differs) {
      differentPixels++;
      const pixel = offset / channels;
      const x = pixel % left.width, y = Math.floor(pixel / left.width);
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  return { differentPixels, bounds: differentPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null };
}
