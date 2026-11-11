import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) {
  throw new Error('Usage: node docs/architecture/capture-phase1-baseline.mjs before|after');
}

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const root = path.resolve('docs/architecture/evidence');
const output = path.join(root, label);
const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1140', width: 768, height: 1140 },
  { name: 'desktop-1280x900', width: 1280, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];
const productNames = ['Sensi Smart', '80 Series'];
const styleProperties = [
  'color', 'backgroundColor', 'borderTopColor', 'borderTopWidth', 'borderRightColor',
  'borderRightWidth', 'borderBottomColor', 'borderBottomWidth', 'borderLeftColor',
  'borderLeftWidth', 'width', 'height', 'minHeight', 'paddingTop', 'paddingRight',
  'paddingBottom', 'paddingLeft', 'borderRadius', 'fontFamily', 'fontSize',
  'fontWeight', 'lineHeight', 'outlineColor', 'outlineStyle', 'outlineWidth', 'filter',
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const controlStyles = {};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const capture = async (state, route, productSettings = { logoEnabled: false, textEnabled: false }) => {
      const readiness = await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const visibleImages = Array.from(document.images).filter(image => {
          const box = image.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        });
        return {
          fontsReady: document.fonts.status === 'loaded',
          visibleImages: visibleImages.length,
          visibleImagesLoaded: visibleImages.filter(image => image.complete && image.naturalWidth > 0).length,
        };
      });
      const file = `${viewport.name}-${state}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: false, animations: 'disabled' });
      captures.push({
        file: `evidence/${label}/${file}`,
        browser: `Chromium ${browser.version()}`,
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        browserZoom: '100% (default Playwright context)',
        route,
        selectedProducts: productNames,
        sharedImprint: route === '#brand-review' ? { line1: 'Phase 1 baseline', line2: '', logo: 'none' } : null,
        productSettings: Object.fromEntries(productNames.map(name => [name, productSettings])),
        workflowState: state,
        ...readiness,
        reducedMotion: 'reduce',
      });
    };

    await page.goto(`${baseUrl}/#select-products`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    controlStyles[viewport.name] = await captureControlStyles(page, styleProperties);
    await page.getByRole('checkbox', { name: productNames[0], exact: true }).check();
    await page.getByRole('checkbox', { name: productNames[1], exact: true }).check();
    await capture('step1-selection', '#select-products');

    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Phase 1 baseline');

    if (viewport.width < 1280) {
      await capture('step2-imprint-details', '#brand-review');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      for (const id of ['sensi-smart', '80-series']) {
        const card = page.getByTestId(`configuration-card-${id}`);
        await card.getByRole('button', { name: 'Text', exact: true }).click();
      }
      await capture('step2-configure-list', '#brand-review', { logoEnabled: false, textEnabled: true });
      await page.getByRole('tab', { name: 'Preview' }).click();
      await capture('step2-configure-preview', '#brand-review', { logoEnabled: false, textEnabled: true });
    } else {
      await capture('step2-desktop-workspace', '#brand-review');
    }
    await context.close();
  }

  const metadata = {
    label,
    capturedAt: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    testConditions: { deviceScaleFactor: 1, browserZoom: '100% (default Playwright context)', reducedMotion: 'reduce' },
    controls: controlStyles,
    screenshots: captures,
  };
  await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  if (label === 'after') {
    const before = JSON.parse(await readFile(path.join(root, 'before', 'metadata.json'), 'utf8'));
    const differences = compare(before.controls, controlStyles);
    await writeFile(path.join(output, 'computed-style-differences.json'), `${JSON.stringify(differences, null, 2)}\n`);
    if (differences.length) throw new Error(`Computed control styles changed: ${differences.length} difference(s). See ${path.join(output, 'computed-style-differences.json')}`);
    const screenshotComparisons = await Promise.all(captures.map(async capture => {
      const beforeName = path.basename(capture.file);
      const [beforeBytes, afterBytes] = await Promise.all([
        readFile(path.join(root, 'before', beforeName)),
        readFile(path.join(output, beforeName)),
      ]);
      const beforeHash = createHash('sha256').update(beforeBytes).digest('hex');
      const afterHash = createHash('sha256').update(afterBytes).digest('hex');
      return { file: beforeName, identical: beforeHash === afterHash, beforeSha256: beforeHash, afterSha256: afterHash };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify(screenshotComparisons, null, 2)}\n`);
    const changedScreenshots = screenshotComparisons.filter(item => !item.identical);
    if (changedScreenshots.length) throw new Error(`Screenshot pixels differ for ${changedScreenshots.length} capture(s). See ${path.join(output, 'screenshot-comparisons.json')}`);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captures.length} screenshots to ${output}`);

async function captureControlStyles(page, properties) {
  const read = async locator => locator.evaluate((element, names) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return Object.fromEntries([
      ...names.map(name => [name, style[name]]),
      ['x', box.x], ['y', box.y], ['computedWidth', box.width], ['computedHeight', box.height],
    ]);
  }, properties);
  const searchInput = page.getByRole('searchbox', { name: 'Search product families' });
  const searchFrame = searchInput.locator('xpath=..');
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  const backButton = page.getByRole('button', { name: 'Back to home' }).first();
  const allPill = page.getByRole('button', { name: 'All', exact: true });
  const styles = {
    disabledPrimaryButton: await read(continueButton),
    backButton: await read(backButton),
    activeFilterPill: await read(allPill),
    searchFrame: await read(searchFrame),
    searchInput: await read(searchInput),
  };

  await continueButton.evaluate(element => element.focus({ focusVisible: true }));
  styles.disabledPrimaryButtonFocus = await read(continueButton);
  await backButton.hover();
  styles.backButtonHover = await read(backButton);
  await backButton.evaluate(element => element.focus({ focusVisible: true }));
  styles.backButtonFocus = await read(backButton);
  await allPill.hover();
  styles.activeFilterPillHover = await read(allPill);
  await searchInput.evaluate(element => element.focus({ focusVisible: true }));
  styles.searchFrameFocus = await read(searchFrame);
  styles.searchInputFocus = await read(searchInput);

  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  const enabledButton = page.getByRole('button', { name: 'Continue', exact: true });
  styles.enabledPrimaryButton = await read(enabledButton);
  await enabledButton.hover();
  styles.enabledPrimaryButtonHover = await read(enabledButton);
  await enabledButton.evaluate(element => element.focus({ focusVisible: true }));
  styles.enabledPrimaryButtonFocus = await read(enabledButton);
  return styles;
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
