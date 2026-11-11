import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) {
  throw new Error('Usage: node docs/architecture/capture-phase1b-footer.mjs before|after');
}

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const root = path.resolve('docs/architecture/evidence/phase1b');
const output = path.join(root, label);
const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1140', width: 768, height: 1140 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'tablet-1279x800', width: 1279, height: 800 },
  { name: 'desktop-1280x900', width: 1280, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const screenshots = [];
const geometry = {};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const capture = async (state, route, testId) => {
      const details = await page.evaluate(testId => {
        const element = document.querySelector(`[data-testid="${testId}"]`);
        if (!element) return { display: 'absent', documentScrollWidth: document.documentElement.scrollWidth };
        const box = node => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        };
        const style = getComputedStyle(element);
        const buttons = Array.from(element.querySelectorAll('button')).map(button => {
          const buttonStyle = getComputedStyle(button);
          return {
            ...box(button),
            backgroundColor: buttonStyle.backgroundColor,
            color: buttonStyle.color,
            borderColor: buttonStyle.borderColor,
            borderWidth: buttonStyle.borderWidth,
            disabled: button.disabled,
          };
        });
        return {
          ...box(element),
          display: style.display,
          position: style.position,
          backgroundColor: style.backgroundColor,
          borderTopColor: style.borderTopColor,
          borderTopWidth: style.borderTopWidth,
          paddingTop: style.paddingTop,
          paddingRight: style.paddingRight,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          gridTemplateColumns: style.gridTemplateColumns,
          gap: style.gap,
          buttons,
          documentScrollWidth: document.documentElement.scrollWidth,
        };
      }, testId);
      const readiness = await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {
          fontsReady: document.fonts.status === 'loaded',
          visibleImagesLoaded: Array.from(document.images).filter(image => {
            const rect = image.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }).every(image => image.complete && image.naturalWidth > 0),
        };
      });
      const file = `${viewport.name}-${state}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: false, animations: 'disabled' });
      geometry[`${viewport.name}/${state}`] = details;
      screenshots.push({
        file,
        route,
        state,
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        browserZoom: '100% (default Playwright context)',
        browser: `Chromium ${browser.version()}`,
        reducedMotion: 'reduce',
        ...readiness,
      });
    };

    await page.goto(`${baseUrl}/#select-products`, { waitUntil: 'networkidle' });
    await capture('step1-disabled', '#select-products', 'step1-action-footer');
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await capture('step1-enabled', '#select-products', 'step1-action-footer');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL(/#brand-review$/);
    await page.getByRole('heading', { name: 'Create your imprint' }).waitFor();
    await capture('step2-imprint', '#brand-review', 'step2-action-footer');
    await context.close();
  }

  const metadata = {
    label,
    capturedAt: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    conditions: { deviceScaleFactor: 1, browserZoom: '100% (default Playwright context)', reducedMotion: 'reduce' },
    geometry,
    screenshots,
  };
  await writeFile(path.join(output, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  if (label === 'after') {
    const before = JSON.parse(await readFile(path.join(root, 'before', 'metadata.json'), 'utf8'));
    if (JSON.stringify(before.geometry) !== JSON.stringify(geometry)) {
      const differences = [];
      for (const key of Object.keys(geometry)) {
        if (JSON.stringify(before.geometry[key]) !== JSON.stringify(geometry[key])) differences.push({ state: key, before: before.geometry[key], after: geometry[key] });
      }
      await writeFile(path.join(output, 'geometry-differences.json'), `${JSON.stringify(differences, null, 2)}\n`);
      throw new Error(`Footer computed style or geometry changed in ${differences.length} state(s).`);
    }
    const comparisons = await Promise.all(screenshots.map(async screenshot => {
      const [beforeBytes, afterBytes] = await Promise.all([
        readFile(path.join(root, 'before', screenshot.file)),
        readFile(path.join(output, screenshot.file)),
      ]);
      const beforeSha256 = createHash('sha256').update(beforeBytes).digest('hex');
      const afterSha256 = createHash('sha256').update(afterBytes).digest('hex');
      return { file: screenshot.file, identical: beforeSha256 === afterSha256, beforeSha256, afterSha256 };
    }));
    await writeFile(path.join(output, 'screenshot-comparisons.json'), `${JSON.stringify(comparisons, null, 2)}\n`);
    const changed = comparisons.filter(item => !item.identical);
    if (changed.length) throw new Error(`Screenshot pixels differ for ${changed.length} capture(s).`);
  }
} finally {
  await browser.close();
}

console.log(`Captured ${screenshots.length} footer screenshots to ${output}`);
