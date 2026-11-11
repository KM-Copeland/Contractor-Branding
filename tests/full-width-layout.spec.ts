import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const widths = [1280, 1440, 1920, 2048, 2560];
const screenshotWidths = new Set([1440, 1920, 2048]);
const selectedProducts = [
  'Sensi Smart',
  '80 Series',
  '70 Series',
  '70/80 series, Sensi Smart',
  'Sensi Touch 2, Sensi Lite',
  'Sensi Equipment Interface Module',
];

async function capture(page: Page, step: 'step1' | 'step2' | 'step2-imprint', width: number) {
  if (!screenshotWidths.has(width)) return;
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
  });
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: `docs/validation/full-width-correction/${step}-${width}.png` });
}

test('Step 1 and Step 2 use the available desktop width without distorting artwork', async ({ page }) => {
  await mkdir('docs/validation/full-width-correction', { recursive: true });
  await page.setViewportSize({ width: 1280, height: 1080 });
  await page.goto('/#select-products');
  for (const name of selectedProducts) await page.getByRole('checkbox', { name, exact: true }).check();

  const stepOneWidths: number[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1080 });
    const metrics = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const { x, y, width, height, right } = element.getBoundingClientRect();
        return { x, y, width, height, right };
      };
      const grid = document.querySelector('[class*="grid"]');
      const firstProductImage = document.querySelector('[class*="imageSlot"] img') as HTMLImageElement | null;
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        main: bounds('main#main'),
        catalog: bounds('[class*="catalogColumn"]'),
        rail: bounds('aside[aria-labelledby="selection-heading"]'),
        progress: bounds('[role="progressbar"]'),
        progressFillWidth: document.querySelector('[role="progressbar"] span')?.getBoundingClientRect().width ?? 0,
        columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
        image: firstProductImage ? {
          width: firstProductImage.getBoundingClientRect().width,
          height: firstProductImage.getBoundingClientRect().height,
          naturalRatio: firstProductImage.naturalWidth / firstProductImage.naturalHeight,
          renderedRatio: firstProductImage.getBoundingClientRect().width / firstProductImage.getBoundingClientRect().height,
        } : null,
      };
    });
    expect(metrics.main.width).toBe(width);
    expect(metrics.documentWidth).toBeLessThanOrEqual(width);
    expect(metrics.rail.width).toBe(360);
    expect(metrics.rail.right).toBe(width - 50);
    expect(metrics.catalog.width).toBe(width - 500);
    expect(metrics.progress.x).toBe(0);
    expect(metrics.progress.width).toBe(width - 410);
    expect(metrics.progress.right).toBeCloseTo(metrics.rail.x, 0);
    expect(metrics.progressFillWidth).toBeCloseTo(Math.min(580, (width - 410) * 0.384106), 0);
    expect(metrics.columns).toBe(width >= 1920 ? 4 : 3);
    expect(metrics.image).not.toBeNull();
    expect(metrics.image!.renderedRatio).toBeCloseTo(metrics.image!.naturalRatio, 1);
    if (width >= 1920) stepOneWidths.push((await page.locator('[class*="card"]').first().boundingBox())!.width);
    await capture(page, 'step1', width);
  }
  expect(stepOneWidths[0]).toBeLessThan(stepOneWidths[1]);
  expect(stepOneWidths[1]).toBeLessThan(stepOneWidths[2]);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const previewWidths: number[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1080 });
    await capture(page, 'step2', width);
    await expect(page.getByRole('progressbar', { name: 'Setup progress' })).toBeVisible();
    await expect.poll(async () => (await page.getByRole('progressbar', { name: 'Setup progress' }).locator('span').boundingBox())?.width ?? 0)
      .toBeCloseTo(Math.min(1035, (width - 410) * 0.68543), 0);
    const form = await page.getByTestId('imprint-details-panel').boundingBox();
    const preview = await page.getByTestId('live-preview-panel').boundingBox();
    const artboard = await page.getByTestId('preview-artboard').boundingBox();
    const progressTrack = await page.getByRole('progressbar', { name: 'Setup progress' }).boundingBox();
    const progressFill = await page.getByRole('progressbar', { name: 'Setup progress' }).locator('span').boundingBox();
    const metrics = await page.evaluate(() => {
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    expect(metrics.documentWidth).toBeLessThanOrEqual(width);
    expect(progressTrack).toMatchObject({ x: 0, width: width - 410, height: 8 });
    expect(progressTrack!.x + progressTrack!.width).toBeCloseTo((await page.locator('aside[data-mode="branding"]').boundingBox())!.x, 0);
    expect(progressFill?.width).toBeCloseTo(Math.min(1035, (width - 410) * 0.68543), 0);
    expect(form!.x).toBe(50);
    expect(preview!.x).toBeGreaterThan(form!.x + form!.width);
    expect(preview!.x + preview!.width).toBeCloseTo(width - 450, 0);
    expect(artboard!.width / artboard!.height).toBeCloseTo(693.333 / 400, 1);
    if (width >= 1920) previewWidths.push(preview!.width);
  }
  expect(previewWidths[0]).toBeLessThan(previewWidths[1]);
  expect(previewWidths[1]).toBeLessThan(previewWidths[2]);

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><circle cx="300" cy="300" r="230" fill="#14883e"/></svg>';
  await page.locator('input[type=file]').setInputFiles({ name: 'fluid-test.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await expect(page.getByRole('button', { name: 'Remove logo' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Fluid imprint text');
  await page.getByRole('switch', { name: 'Text imprint' }).click();
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  const brandedBoardWidths: number[] = [];
  for (const width of [1440, 1920, 2048]) {
    await page.setViewportSize({ width, height: 1080 });
    await capture(page, 'step2-imprint', width);
    const overlays = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="preview-artboard"]')!.getBoundingClientRect();
      const text = document.querySelector('[data-testid="brand-text-preview"]')!;
      const logo = document.querySelector('[data-testid="brand-logo-preview"]')!;
      return {
        boardWidth: board.width,
        fontSize: Number.parseFloat(getComputedStyle(text).fontSize),
        textLeftRatio: (text.getBoundingClientRect().left - board.left) / board.width,
        logoLeftRatio: (logo.getBoundingClientRect().left - board.left) / board.width,
        logoWidthRatio: logo.getBoundingClientRect().width / board.width,
      };
    });
    expect(overlays.fontSize / overlays.boardWidth).toBeCloseTo(0.0173, 2);
    expect(overlays.textLeftRatio).toBeCloseTo(0.2861, 2);
    expect(overlays.logoLeftRatio).toBeCloseTo(0.0697, 2);
    expect(overlays.logoWidthRatio).toBeCloseTo(0.1529, 2);
    brandedBoardWidths.push(overlays.boardWidth);
  }
  expect(brandedBoardWidths[0]).toBeLessThan(brandedBoardWidths[1]);
  expect(brandedBoardWidths[1]).toBeLessThan(brandedBoardWidths[2]);
});

test('desktop progress follows the sidebar boundary and both step headings share the Figma top spacing', async ({ page }) => {
  const outputDir = 'docs/validation/desktop-header-spacing';
  await mkdir(outputDir, { recursive: true });

  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto('/#select-products');
    await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
    const checkedProducts = page.locator('input[type="checkbox"]:checked');
    while (await checkedProducts.count()) await checkedProducts.first().uncheck();
    await expect(checkedProducts).toHaveCount(0);
    await expect(page.getByText('0 selected', { exact: true })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));

    const stepOne = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const { x, y, width, height, bottom, right } = element.getBoundingClientRect();
        return { x, y, width, height, bottom, right };
      };
      return {
        nav: bounds('[data-testid="app-navigation"]'),
        progress: bounds('[role="progressbar"]'),
        heading: bounds('main#main h1'),
        subheading: bounds('main#main [class*="intro"] p'),
        rail: bounds('aside[data-mode="selection"]'),
      };
    });
    expect(stepOne.progress.x).toBe(0);
    expect(stepOne.progress.y).toBe(50);
    expect(stepOne.progress.height).toBe(8);
    expect(stepOne.progress.right).toBeCloseTo(stepOne.rail.x, 0);
    expect(stepOne.heading.y).toBeCloseTo(90, 0);
    expect(stepOne.heading.x).toBe(50);
    expect(stepOne.subheading.y - stepOne.heading.bottom).toBeCloseTo(10, 0);
    if (width === 1280 || width === 1920) {
      await expect.poll(async () => (await page.getByRole('progressbar').boundingBox())?.width ?? 0).toBe(width - 410);
      await expect.poll(async () => (await page.getByRole('progressbar').locator('span').boundingBox())?.width ?? 0)
        .toBeCloseTo(Math.min(580, (width - 410) * 0.384106), 0);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined))); });
      await page.setViewportSize({ width, height: width === 1280 ? 2115 : 2127 });
      await page.screenshot({ path: `${outputDir}/step1-${width}.png` });
      await page.setViewportSize({ width, height: 1080 });
    }

    await page.getByRole('checkbox', { name: 'Classic 80 Series', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
    const stepTwo = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        const { x, y, width, height, bottom, right } = element.getBoundingClientRect();
        return { x, y, width, height, bottom, right };
      };
      return {
        nav: bounds('[data-testid="app-navigation"]'),
        progress: bounds('[role="progressbar"]'),
        heading: bounds('main#main h1'),
        subheading: bounds('main#main [class*="intro"] p'),
        rail: bounds('aside[data-mode="branding"]'),
      };
    });
    expect(stepTwo.progress).toMatchObject({ x: 0, y: 50, height: 8 });
    expect(stepTwo.progress.right).toBeCloseTo(stepTwo.rail.x, 0);
    expect(stepTwo.heading.x).toBe(50);
    expect(stepTwo.heading.y).toBeCloseTo(90, 0);
    expect(stepTwo.subheading.y - stepTwo.heading.bottom).toBeCloseTo(10, 0);
    expect(stepTwo.heading.y).toBeCloseTo(stepOne.heading.y, 0);
    expect(stepTwo.progress.width).toBeCloseTo(stepOne.progress.width, 0);
    if (width === 1280 || width === 1920) {
      await expect.poll(async () => (await page.getByRole('progressbar').locator('span').boundingBox())?.width ?? 0)
        .toBeCloseTo(Math.min(1035, (width - 410) * 0.68543), 0);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined))); });
      await page.setViewportSize({ width, height: width === 1280 ? 1721 : 1080 });
      await page.screenshot({ path: `${outputDir}/step2-${width}.png` });
      await page.setViewportSize({ width, height: 1080 });
    }
  }
});

test('desktop and responsive Step 1/Step 2 preserve their distinct progress and heading geometry', async ({ page }) => {
  for (const width of [390, 768, 1024, 1279, 1280]) {
    const height = width === 768 ? 1140 : width === 390 ? 844 : 900;
    await page.setViewportSize({ width, height });
    await page.goto('/#select-products');
    await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
    const expectedTop = width < 1280 ? 74 : 90;
    const expectedTrackWidth = width < 1280 ? width : width - 410;
    const stepOne = await page.evaluate(() => {
      const progress = document.querySelector('[role="progressbar"]')!.getBoundingClientRect();
      const heading = document.querySelector('main#main h1')!.getBoundingClientRect();
      return { progress: { x: progress.x, y: progress.y, width: progress.width, height: progress.height }, headingTop: heading.top, documentWidth: document.documentElement.scrollWidth };
    });
    expect(stepOne.progress).toEqual({ x: 0, y: 50, width: expectedTrackWidth, height: width < 1280 ? 4 : 8 });
    expect(stepOne.headingTop).toBeCloseTo(expectedTop, 0);
    expect(stepOne.documentWidth).toBe(width);
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
    const stepTwo = await page.evaluate(() => {
      const progress = document.querySelector('[role="progressbar"]')!.getBoundingClientRect();
      const heading = document.querySelector('main#main h1')!.getBoundingClientRect();
      return { progress: { x: progress.x, y: progress.y, width: progress.width, height: progress.height }, headingTop: heading.top, documentWidth: document.documentElement.scrollWidth };
    });
    expect(stepTwo.progress).toEqual(stepOne.progress);
    expect(stepTwo.headingTop).toBeCloseTo(expectedTop, 0);
    expect(stepTwo.documentWidth).toBe(width);
    if (width < 1280) await expect(page.getByTestId('step2-action-footer')).toHaveCSS('position', 'fixed');
  }
});

test('workflow progress starts immediately below the navigation border at desktop and responsive widths', async ({ page }) => {
  for (const width of [390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#select-products');
    await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();

    for (const step of ['select-products', 'brand-review'] as const) {
      const geometry = await page.evaluate(() => {
        const navigation = document.querySelector('[data-testid="app-navigation"]')!;
        const track = document.querySelector('[role="progressbar"]')!;
        const navBounds = navigation.getBoundingClientRect();
        const trackBounds = track.getBoundingClientRect();
        return {
          navBottom: navBounds.bottom,
          navHeight: navBounds.height,
          borderBottomWidth: getComputedStyle(navigation).borderBottomWidth,
          trackTop: trackBounds.top,
          trackHeight: trackBounds.height,
          trackWidth: trackBounds.width,
          trackRight: trackBounds.right,
          sidebarLeft: Array.from(document.querySelectorAll('aside[data-mode="selection"], aside[data-mode="branding"]'))
            .map(element => element.getBoundingClientRect().left).find(left => left > 0) ?? null,
        };
      });
      expect(geometry.navHeight).toBe(50);
      expect(geometry.borderBottomWidth).toBe('1px');
      expect(geometry.trackTop).toBe(geometry.navBottom);
      expect(geometry.trackHeight).toBe(width < 1280 ? 4 : 8);
      expect(geometry.trackWidth).toBe(width < 1280 ? width : width - 410);
      if (width >= 1280) expect(geometry.trackRight).toBe(geometry.sidebarLeft);

      if (step === 'select-products') {
        await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
      }
    }
  }
});
