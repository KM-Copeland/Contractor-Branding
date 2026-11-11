import { test, expect, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const products = ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series'];
const screenshotPath = 'docs/validation/step2-redesign/browser';
const motionPath = 'docs/validation/step2-redesign/motion';

async function enterStep2(page: Page, width = 390, height = 797, selectedProducts = products) {
  await page.setViewportSize({ width, height });
  await page.goto('/#select-products');
  if (width <= 767) {
    const search = page.getByRole('searchbox', { name: 'Search product families' });
    expect(Number.parseFloat(await search.evaluate(element => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
  }
  for (const name of selectedProducts) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
}

async function uploadSvg(page: Page, name = 'test-logo.svg') {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="white"/><circle cx="300" cy="300" r="230" fill="#14883e"/><text x="300" y="330" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="78" font-weight="700">TEST</text></svg>';
  await page.locator('input[type=file]').setInputFiles({ name, mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await expect(page.getByText('Upload complete')).toBeVisible();
}

async function uploadReferencePng(page: Page) {
  const image = await readFile('docs/figma-source/sample-logo.png');
  const png = await page.evaluate(async jpeg => {
    const source = new Image();
    source.src = `data:image/jpeg;base64,${jpeg}`;
    await source.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const context = canvas.getContext('2d')!;
    context.drawImage(source, 0, 0, 600, 600);
    return canvas.toDataURL('image/png').split(',')[1];
  }, image.toString('base64'));
  await page.locator('input[type=file]').setInputFiles({ name: 'mylogo.png', mimeType: 'image/png', buffer: addPngDpi(Buffer.from(png, 'base64'), 300) });
  await expect(page.getByText('Upload complete')).toBeVisible();
}

function addPngDpi(png: Buffer, dpi: number) {
  const data = Buffer.alloc(9);
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  data.writeUInt32BE(pixelsPerMeter, 0);
  data.writeUInt32BE(pixelsPerMeter, 4);
  data[8] = 1;
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(9, 0);
  chunk.write('pHYs', 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 17)), 17);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function rect(page: Page, selector: string) {
  return page.locator(selector).evaluate(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  });
}

async function saveOverlay(page: Page, figmaPath: string, browserPath: string, outputPath: string) {
  const [figmaImage, browserImage] = await Promise.all([readFile(figmaPath), readFile(browserPath)]);
  const png = await page.evaluate(async ({ figma, browser }) => {
    const load = (data: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `data:image/png;base64,${data}`;
    });
    const [reference, actual] = await Promise.all([load(figma), load(browser)]);
    const canvas = document.createElement('canvas');
    canvas.width = reference.width;
    canvas.height = reference.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create comparison canvas.');
    context.drawImage(reference, 0, 0);
    context.globalAlpha = 0.5;
    context.drawImage(actual, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { figma: figmaImage.toString('base64'), browser: browserImage.toString('base64') });
  await writeFile(outputPath, Buffer.from(png, 'base64'));
}

async function saveRegionOverlay(page: Page, figmaPath: string, browserPath: string, clip: { x:number; y:number; width:number; height:number }, outputPath: string) {
  const [figmaImage, browserImage] = await Promise.all([readFile(figmaPath), readFile(browserPath)]);
  const png = await page.evaluate(async ({ figma, browser, region }) => {
    const load = (data: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = `data:image/png;base64,${data}`;
    });
    const [reference, actual] = await Promise.all([load(figma), load(browser)]);
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create focused comparison canvas.');
    context.drawImage(reference, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
    context.globalAlpha = 0.5;
    context.drawImage(actual, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { figma: figmaImage.toString('base64'), browser: browserImage.toString('base64'), region: clip });
  await writeFile(outputPath, Buffer.from(png, 'base64'));
}

test('mobile Step 2 keeps List and Preview as modes in Configure Products and captures the Figma states', async ({ page }) => {
  await enterStep2(page, 390, 844, ['80 Series', '70 Series', 'Classic 80 Series']);
  await expect(page.locator('[data-step2-view="imprint"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
  expect((await page.getByRole('heading', { name: 'Create your imprint' }).boundingBox())?.y).toBe(74);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View selected products' })).toHaveCount(0);
  await expect(page.locator('[data-testid="step2-action-footer"]')).toHaveCSS('position', 'fixed');
  const footer = await rect(page, '[data-testid="step2-action-footer"]');
  expect(footer.x).toBe(0);
  expect(footer.width).toBe(390);
  expect(footer.height).toBe(87);
  await page.screenshot({ path: `${screenshotPath}/01-imprint-empty.png` });

  await uploadReferencePng(page);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('This is an example');
  await page.getByRole('textbox', { name: 'Line 2' }).fill('Placeholder text for context');
  await page.getByRole('button', { name: 'Bold line 1' }).click();
  await expect(page.getByRole('button', { name: 'Bold line 1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('18 / 30')).toBeVisible();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.screenshot({ path: `${screenshotPath}/02-imprint-populated.png` });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('product-configuration-list').locator('[data-testid^="configuration-card-"]')).toHaveCount(3);
  await expect(page.getByTestId('configuration-card-80-series')).toHaveAttribute('data-configured', 'false');
  await page.getByTestId('configuration-card-80-series').getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('configuration-card-80-series')).toHaveAttribute('data-configured', 'true');
  await page.getByTestId('configuration-card-80-series').getByRole('button', { name: 'Logo', exact: true }).click();
  await page.getByTestId('configuration-card-70-series').getByRole('button', { name: 'Text', exact: true }).click();
  await page.getByTestId('configuration-card-classic-80').getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await page.screenshot({ path: `${screenshotPath}/03-configure-products.png` });
  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('This is an example');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  await expect(page.getByTestId('configuration-card-80-series')).toHaveAttribute('data-configured', 'true');

  await expect(page.getByRole('button', { name: /^Preview / })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'List' }).getByTestId('configure-tab-icon')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Preview' }).click();
  await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Configured');
  await expect(page.getByRole('button', { name: 'Text', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Logo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Logo', exact: true })).toHaveAttribute('aria-pressed', 'false');
  const pagination = page.getByRole('group', { name: 'Preview product position' }).getByRole('button');
  await expect(pagination).toHaveCount(3);
  await expect(pagination.nth(0)).toHaveAttribute('aria-current', 'true');
  await expect(pagination.nth(0)).toBeInViewport();
  const paginationBox = await pagination.evaluateAll(buttons => {
    const boxes = buttons.map(button => button.getBoundingClientRect());
    return { top: Math.min(...boxes.map(box => box.top)), bottom: Math.max(...boxes.map(box => box.bottom)) };
  });
  const footerBox = await rect(page, '[data-testid="step2-action-footer"]');
  expect(paginationBox.top).toBeGreaterThanOrEqual(0);
  expect(paginationBox.bottom).toBeLessThanOrEqual(footerBox.y);
  await page.screenshot({ path: `${screenshotPath}/04-product-preview.png` });
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Not configured');
  await page.screenshot({ path: `${screenshotPath}/05-product-preview-unconfigured.png` });
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Configured');
  await expect(page.getByRole('button', { name: 'Show 70 Series' })).toHaveCount(1);
  await expect(page.locator('[data-testid="product-preview-carousel"] [aria-roledescription="slide"]')).toHaveCount(3);
  await page.getByRole('tab', { name: 'List' }).click();
  await expect(page.getByTestId('configuration-card-80-series')).toHaveAttribute('data-configured', 'true');
  await page.getByRole('tab', { name: 'Preview' }).click();
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator('[data-testid="preview-artboard"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit your imprint' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('This is an example');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#complete$/);

  // Revisit the existing Step 1 selection to confirm the responsive workflow remains reachable.
  await page.goto('/#select-products');
  await expect(page.getByRole('checkbox', { name: '80 Series', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: '70 Series', exact: true })).toBeChecked();

  for (const [reference, browser] of [
    ['574-2752.png', '01-imprint-empty.png'],
    ['574-2822.png', '02-imprint-populated.png'],
    ['574-2891.png', '03-configure-products.png'],
    ['574-3010.png', '04-product-preview.png'],
    ['585-1613.png', '05-product-preview-unconfigured.png'],
  ]) {
    await saveOverlay(page, `docs/validation/step2-redesign/figma/${reference}`, `${screenshotPath}/${browser}`, `${screenshotPath}/${browser.replace('.png', '-overlay.png')}`);
  }
  const overlayPath = 'docs/validation/step2-redesign/overlays';
  await mkdir(overlayPath, { recursive: true });
  const regions = [
    ['574-2891.png', '03-configure-products.png', 'list-card-header-status', { x:20, y:221, width:350, height:58 }],
    ['574-2891.png', '03-configure-products.png', 'logo-text-controls', { x:20, y:309, width:350, height:38 }],
    ['574-3010.png', '04-product-preview.png', 'list-preview-control', { x:20, y:163, width:350, height:38 }],
    ['574-3010.png', '04-product-preview.png', 'carousel-artwork-pagination', { x:20, y:260, width:350, height:340 }],
    ['574-3010.png', '04-product-preview.png', 'preview-product-information', { x:20, y:590, width:350, height:64 }],
    ['574-3010.png', '04-product-preview.png', 'header-progress-spacing', { x:0, y:50, width:390, height:110 }],
  ] as const;
  for (const [reference, browser, name, region] of regions) {
    await saveRegionOverlay(page, `docs/validation/step2-redesign/figma/${reference}`, `${screenshotPath}/${browser}`, region, `${overlayPath}/${name}.png`);
  }
});

test('List and Preview icons use the selected tab color in either direction', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Ready');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const listTab = page.getByRole('tab', { name: 'List' });
  const previewTab = page.getByRole('tab', { name: 'Preview' });
  const iconColor = (tab: typeof listTab) => tab.getByTestId('configure-tab-icon').evaluate(icon => getComputedStyle(icon).backgroundColor);
  for (const [active, inactive] of [[listTab, previewTab], [previewTab, listTab], [listTab, previewTab], [previewTab, listTab]] as const) {
    await active.click();
    await expect(active).toHaveAttribute('aria-selected', 'true');
    expect(await iconColor(active)).toBe('rgb(12, 48, 204)');
    expect(await iconColor(inactive)).toBe('rgb(42, 42, 38)');
  }
});

test('preview product information crossfades without movement and resolves rapid navigation', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart', '80 Series', '70 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Ready');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  const summary = page.getByTestId('preview-product-summary');
  const before = await summary.boundingBox();
  expect(await summary.evaluate(element => getComputedStyle(element).transitionProperty)).toBe('opacity');
  expect(await summary.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  const pagination = page.getByRole('group', { name: 'Preview product position' }).getByRole('button');
  await pagination.nth(1).click();
  await expect(summary).toHaveAttribute('data-transition-state', 'out');
  await expect(summary.getByRole('heading')).toHaveText('Sensi Smart');
  await expect.poll(() => summary.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(1);
  await pagination.nth(2).click();
  await expect(summary.getByRole('heading')).toHaveText('70 Series');
  await expect(summary).toHaveAttribute('data-transition-state', 'visible');
  await expect.poll(() => summary.evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
  expect(await summary.boundingBox()).toEqual(before);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pagination.nth(1).click();
  await expect(summary.getByRole('heading')).toHaveText('80 Series');
  await expect(summary).toHaveAttribute('data-transition-state', 'visible');
  expect(await summary.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
});

test('responsive Preview fits the viewport, scales its artboard, and captures short and tall layouts', async ({ page }) => {
  await mkdir(screenshotPath, { recursive: true });
  const viewportCases = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 797 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1140 },
    { width: 1024, height: 768 },
  ];
  const measured = [];
  for (const viewport of viewportCases) {
    await enterStep2(page, viewport.width, viewport.height, ['Sensi Smart']);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Ready');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'Preview' }).click();
    await expect(page.getByTestId('preview-artboard')).toBeVisible();
    await expect(page.getByTestId('preview-option-controls')).toBeVisible();
    const geometry = await page.evaluate(() => {
      const box = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing geometry target: ${selector}`);
        const { x, y, width, height, bottom } = element.getBoundingClientRect();
        return { x, y, width, height, bottom };
      };
      const main = document.querySelector<HTMLElement>('[data-step2-view="configure"][data-configure-mode="preview"]')!;
      const shell = document.querySelector<HTMLElement>('[class*="shell"]')!;
      return {
        viewport: { width: innerWidth, height: innerHeight, visualHeight: visualViewport?.height ?? null, visualOffsetTop: visualViewport?.offsetTop ?? null },
        progressBottom: box('[role="progressbar"]').bottom,
        headingTop: box('[data-step2-view="configure"] h1').y,
        appShell: box('[class*="shell"]'),
        appShellMinHeight: getComputedStyle(shell).minHeight,
        previewTop: box('[data-testid="product-preview-carousel"]').y,
        artworkRegionHeight: box('[data-testid="product-preview-carousel"]').height,
        main: box('[data-step2-view="configure"][data-configure-mode="preview"]'),
        previewWorkspace: box('[data-testid="configure-products-panel"]'),
        artboard: box('[data-testid="preview-artboard"]'),
        pagination: box('[aria-label="Preview product position"]'),
        productInformation: box('[data-testid="preview-product-summary"]'),
        controls: box('[data-testid="preview-option-controls"]'),
        footerTop: box('[data-testid="step2-action-footer"]').y,
        footerGap: box('[data-testid="step2-action-footer"]').y - box('[data-testid="preview-option-controls"]').bottom,
        documentScrollHeight: document.documentElement.scrollHeight,
        documentClientHeight: document.documentElement.clientHeight,
        bodyScrollHeight: document.body.scrollHeight,
        scrollingElementTop: document.scrollingElement?.scrollTop ?? 0,
        documentScrollY: scrollY,
        mainClientHeight: main.clientHeight,
        mainScrollHeight: main.scrollHeight,
        mainScrollTop: main.scrollTop,
      };
    });
    const scrollAttempts: Array<{ window: number; document: number; main: number }> = [];
    expect(geometry.footerGap).toBeCloseTo(24, 0);
    expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.progressBottom);
    expect(geometry.artboard.width / geometry.artboard.height).toBeCloseTo(693.333 / 400, 1);
    expect(geometry.documentScrollHeight).toBeLessThanOrEqual(geometry.documentClientHeight + 1);
    expect(geometry.bodyScrollHeight).toBeLessThanOrEqual(geometry.documentClientHeight + 1);
    expect(geometry.documentScrollY).toBe(0);
    expect(geometry.scrollingElementTop).toBe(0);
    expect(geometry.mainScrollHeight).toBeLessThanOrEqual(geometry.mainClientHeight);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await expect(page.getByRole('heading', { name: 'Configure products' })).toBeInViewport();
    await expect(page.getByRole('group', { name: 'Preview product position' })).toBeInViewport();
    await expect(page.getByTestId('preview-product-summary')).toBeInViewport();
    await expect(page.getByTestId('product-configuration-status')).toBeInViewport();
    await expect(page.getByTestId('preview-option-controls')).toBeInViewport();
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.mouse.move(viewport.width / 2, Math.min(viewport.height - 40, geometry.previewTop + 80));
      await page.mouse.wheel(0, attempt % 2 === 0 ? 160 : -160);
      await page.waitForTimeout(30);
      const scrollState = await page.evaluate(() => ({ window: scrollY, document: document.scrollingElement?.scrollTop ?? 0, main: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')?.scrollTop ?? 0 }));
      expect(scrollState).toEqual({ window: 0, document: 0, main: 0 });
      expect((await page.getByRole('heading', { name: 'Configure products' }).boundingBox())?.y).toBe(geometry.headingTop);
      scrollAttempts.push(scrollState);
    }
    measured.push({ ...geometry, afterVerticalAttempts: scrollAttempts });
    if (viewport.width === 375 && viewport.height === 667) {
      await page.screenshot({ path: `${screenshotPath}/07-preview-height-short-375x667.png` });
    }
    if (viewport.width === 390 && viewport.height === 797) {
      await page.screenshot({ path: `${screenshotPath}/06-preview-height-reference-390x797.png` });
    }
    if (viewport.width === 390 && viewport.height === 844) {
      await page.screenshot({ path: `${screenshotPath}/08-preview-height-tall-390x844.png` });
      await page.screenshot({ path: `${screenshotPath}/11-preview-after-vertical-wheel-attempts-390x844.png` });
      await page.setViewportSize({ width: viewport.width, height: viewport.height - 60 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
      const resizedViewport = await page.evaluate(() => ({ height: innerHeight, visualHeight: visualViewport?.height ?? null, scrollY, scrollHeight: document.documentElement.scrollHeight, clientHeight: document.documentElement.clientHeight, headingTop: document.querySelector('[data-step2-view="configure"] h1')!.getBoundingClientRect().top, progressBottom: document.querySelector('[role="progressbar"]')!.getBoundingClientRect().bottom, footerTop: document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect().top, controlsBottom: document.querySelector('[data-testid="preview-option-controls"]')!.getBoundingClientRect().bottom }));
      expect(resizedViewport.scrollY).toBe(0);
      expect(resizedViewport.headingTop).toBeGreaterThanOrEqual(resizedViewport.progressBottom);
      expect(resizedViewport.controlsBottom).toBeLessThanOrEqual(resizedViewport.footerTop);
      expect(resizedViewport.footerTop - resizedViewport.controlsBottom).toBeCloseTo(24, 0);
      expect(resizedViewport.scrollHeight).toBeLessThanOrEqual(resizedViewport.clientHeight + 1);
      await writeFile('docs/validation/step2-redesign/preview-dynamic-resize-geometry.json', JSON.stringify(resizedViewport, null, 2));
      await page.setViewportSize(viewport);
    }
  }
  await writeFile('docs/validation/step2-redesign/preview-layout-geometry.json', JSON.stringify(measured, null, 2));
});

test('logo and text overlays keep their artboard-relative placement as Preview scales', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart']);
  await uploadSvg(page, 'scaled-overlay.svg');
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Scaled imprint');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  await page.getByRole('button', { name: 'Logo', exact: true }).click();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  const measure = async () => page.evaluate(() => {
    const artboard = document.querySelector('[data-testid="preview-artboard"]')!.getBoundingClientRect();
    const rect = (selector: string) => {
      const box = document.querySelector(selector)!.getBoundingClientRect();
      return { x: (box.x - artboard.x) / artboard.width, y: (box.y - artboard.y) / artboard.height, width: box.width / artboard.width, height: box.height / artboard.height };
    };
    return { artboard: { width: artboard.width, height: artboard.height }, logo: rect('[data-testid="brand-logo-preview"]'), text: rect('[data-testid="brand-text-preview"]') };
  });
  const initial = await measure();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByTestId('brand-logo-preview')).toBeVisible();
  await expect(page.getByTestId('brand-text-preview')).toBeVisible();
  const resized = await measure();
  expect(resized.artboard.width).toBeLessThan(initial.artboard.width);
  for (const overlay of ['logo', 'text'] as const) {
    expect(resized[overlay].x).toBeCloseTo(initial[overlay].x, 2);
    expect(resized[overlay].y).toBeCloseTo(initial[overlay].y, 2);
    expect(resized[overlay].width).toBeCloseTo(initial[overlay].width, 2);
    expect(resized[overlay].height).toBeCloseTo(initial[overlay].height, 2);
  }
});

test('390x797 Preview captures match the configured and unconfigured Figma product state', async ({ page }) => {
  await mkdir(`${screenshotPath}/../overlays`, { recursive: true });
  await enterStep2(page, 390, 797, ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series', 'Classic 80 Series Programmable', 'Classic 70 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Figma preview');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  await page.getByRole('button', { name: 'Show 80 Series' }).click();
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Configured');
  const geometry = await page.evaluate(() => {
    const box = (selector: string) => {
      const element = document.querySelector(selector)!;
      const { x, y, width, height, bottom } = element.getBoundingClientRect();
      return { x, y, width, height, bottom };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      progressBottom: box('[role="progressbar"]').bottom,
      previewTop: box('[data-testid="product-preview-carousel"]').y,
      artworkRegionHeight: box('[data-testid="product-preview-carousel"]').height,
      artboard: box('[data-testid="preview-artboard"]'),
      pagination: box('[aria-label="Preview product position"]'),
      productInformation: box('[data-testid="preview-product-summary"]'),
      controls: box('[data-testid="preview-option-controls"]'),
      footerTop: box('[data-testid="step2-action-footer"]').y,
      documentScrollHeight: document.documentElement.scrollHeight,
      documentScrollY: scrollY,
    };
  });
  expect(geometry.controls.bottom).toBeLessThanOrEqual(geometry.footerTop);
  expect(geometry.artboard.width / geometry.artboard.height).toBeCloseTo(693.333 / 400, 1);
  expect(geometry.documentScrollHeight).toBeLessThanOrEqual(geometry.viewport.height);
  await writeFile('docs/validation/step2-redesign/preview-figma-layout-geometry.json', JSON.stringify(geometry, null, 2));
  const configured = `${screenshotPath}/09-preview-figma-configured-390x797.png`;
  await page.screenshot({ path: configured });
  await saveOverlay(page, 'docs/validation/step2-redesign/figma/574-3010.png', configured, 'docs/validation/step2-redesign/overlays/preview-configured-390x797.png');

  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Not configured');
  const unconfigured = `${screenshotPath}/10-preview-figma-unconfigured-390x797.png`;
  await page.screenshot({ path: unconfigured });
  await saveOverlay(page, 'docs/validation/step2-redesign/figma/585-1613.png', unconfigured, 'docs/validation/step2-redesign/overlays/preview-unconfigured-390x797.png');
});

test('mobile logo validation and removal retain the redesigned optional-form flow', async ({ page }) => {
  await enterStep2(page);
  await page.locator('input[type=file]').setInputFiles({ name: 'bad-logo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7') });
  await expect(page.getByRole('alert')).toContainText('Choose JPG, PNG, or SVG');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await uploadSvg(page, 'valid-logo.svg');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.getByText('Upload complete')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
});

test('configure cards respect product capability limits', async ({ page }) => {
  await enterStep2(page, 390, 797, ['Blue Series 12 Inch Touch']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Text only product');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const card = page.getByTestId('configuration-card-blue-12');
  await expect(card.getByRole('button', { name: 'Logo', exact: true })).toBeDisabled();
  await expect(card.getByRole('button', { name: 'Text', exact: true })).toBeEnabled();
  await card.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(card).toHaveAttribute('data-configured', 'true');
});

test('Continue from either Configure Products mode uses the existing completion flow', async ({ page }) => {
  await enterStep2(page, 390, 797, ['Sensi Smart']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Ready to review');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByTestId('configuration-card-sensi-smart').getByRole('button', { name: 'Text', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your imprint is ready for review' })).toBeVisible();
  await expect(page).toHaveURL(/#complete$/);
});

test('mobile text, fixed footer, and horizontal containment hold at 375, 390, and 430px', async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await enterStep2(page, width, 844);
    for (const [id, value] of [['imprint-line-1', 'One line'], ['imprint-line-2', 'Second']] as const) {
      const input = page.locator(`#${id}`);
      expect(Number.parseFloat(await input.evaluate(element => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
      await input.click();
      await input.fill(value);
      await expect(input).toHaveValue(value);
      await expect(page.locator(`label[for="${id}"] span`).nth(1)).toHaveText(`${value.length} / 30`);
      expect((await input.locator('xpath=..').boundingBox())?.height).toBe(48);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
    const footer = await page.locator('[data-testid="step2-action-footer"]').boundingBox();
    expect(footer?.y! + footer?.height!).toBe(844);
  }
});

test('preview carousel follows pointer swipes, snaps short drags back, and keeps pagination synchronized', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart', '80 Series', '70 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Shared imprint');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  const carousel = page.getByTestId('product-preview-carousel');
  const swipe = async (dx: number, dy = 0, steps = 6) => {
    const box = await carousel.boundingBox();
    if (!box) throw new Error('Preview carousel is not visible.');
    const x = box.x + box.width * 0.75;
    const y = box.y + Math.min(box.height - 12, 140);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps });
    await page.mouse.up();
  };

  await expect(page.getByRole('heading', { name: 'Sensi Smart' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show Sensi Smart' })).toHaveAttribute('aria-current', 'true');
  await swipe(-18, 0, 6);
  await expect(page.getByRole('heading', { name: 'Sensi Smart' })).toBeVisible();
  await swipe(-170);
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show 80 Series' })).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-testid="preview-artboard"] img[alt="80 Series preview"]')).toBeVisible();
  await page.getByRole('button', { name: 'Show 70 Series' }).click();
  await expect(page.getByRole('heading', { name: '70 Series' })).toBeVisible();
  await swipe(-180);
  await expect(page.getByRole('heading', { name: '70 Series' })).toBeVisible();
  await swipe(180);
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await swipe(180);
  await expect(page.getByRole('heading', { name: 'Sensi Smart' })).toBeVisible();
  await swipe(180);
  await expect(page.getByRole('heading', { name: 'Sensi Smart' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('configure cards show Figma status icons and wrap long product names without collisions', async ({ page }) => {
  await enterStep2(page, 320, 844, ['Classic 80 Series Programmable', 'Sensi Equipment Interface Module']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Shared text');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const longCard = page.getByTestId('configuration-card-sensi-module');
  await expect(longCard.getByRole('heading', { name: 'Sensi Equipment Interface Module' })).toBeVisible();
  await expect(longCard.getByRole('img', { name: 'Not configured' })).toBeVisible();
  await expect(longCard.getByRole('button', { name: /^Preview / })).toHaveCount(0);
  const measurements = await longCard.evaluate(card => {
    const header = card.querySelector('[class*=productHeader]')!.getBoundingClientRect();
    const identity = card.querySelector('[class*=identity]')!.getBoundingClientRect();
    const name = card.querySelector('h2')!.getBoundingClientRect();
    const status = card.querySelector('[alt="Not configured"]')!.getBoundingClientRect();
    const controls = card.querySelector('[class*=options]')!.getBoundingClientRect();
    return { card: card.getBoundingClientRect().toJSON(), header: header.toJSON(), identity: identity.toJSON(), name: name.toJSON(), status: status.toJSON(), controls: controls.toJSON() };
  });
  expect(measurements.identity.width).toBeGreaterThan(0);
  expect(measurements.name.height).toBeGreaterThan(24);
  expect(measurements.name.right).toBeLessThanOrEqual(measurements.status.left);
  expect(measurements.controls.y).toBeGreaterThanOrEqual(measurements.header.bottom);
  expect(measurements.card.height).toBeGreaterThan(136);
  await longCard.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(longCard.getByRole('img', { name: 'Configured' })).toBeVisible();
});

test('mobile carousel moves artwork only and records the coordinated transition', async ({ page }) => {
  await mkdir(motionPath, { recursive: true });
  await enterStep2(page, 390, 844, ['Sensi Smart', '80 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Shared text');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();

  const viewport = page.getByTestId('product-preview-carousel');
  const track = page.getByTestId('product-image-track');
  const stationary = [page.getByRole('group', { name: 'Preview product position' }), page.getByTestId('preview-product-summary'), page.getByTestId('preview-option-controls')];
  const getBounds = async () => Promise.all(stationary.map(element => element.boundingBox()));
  const stationaryBefore = await getBounds();
  const trackBefore = await track.boundingBox();
  const box = await viewport.boundingBox();
  if (!box || !trackBefore) throw new Error('Preview artwork region is not visible.');
  const x = box.x + box.width * .75;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 120, y, { steps: 4 });
  await page.waitForTimeout(50);
  const trackDuring = await track.boundingBox();
  expect(trackDuring?.x).toBeLessThan(trackBefore.x);
  expect(await getBounds()).toEqual(stationaryBefore);
  await page.screenshot({ path: `${motionPath}/product-swipe-in-progress.png`, animations: 'allow' });
  await page.mouse.move(x - 180, y, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show 80 Series' })).toHaveAttribute('aria-current', 'true');
  await page.waitForTimeout(260);
  expect(await getBounds()).toEqual(stationaryBefore);
  await page.screenshot({ path: `${motionPath}/product-swipe-complete.png`, animations: 'allow' });
});

test('workflow progress animates between real stages and honors reduced motion', async ({ page }) => {
  await mkdir(motionPath, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  const progress = page.getByRole('progressbar', { name: 'Setup progress' });
  const fill = progress.locator('span');
  await expect(progress).toHaveAttribute('aria-valuenow', '33.333');
  await expect(progress).toHaveAttribute('data-ready', 'true');
  const stepOneWidth = (await fill.boundingBox())!.width;
  await page.waitForTimeout(150);
  expect((await fill.boundingBox())!.width).toBe(stepOneWidth);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(progress).toHaveAttribute('aria-valuenow', '35');
  await page.waitForTimeout(150);
  const imprintWidth = (await fill.boundingBox())!.width;
  expect(imprintWidth).toBeGreaterThan(stepOneWidth);
  expect(imprintWidth).toBeLessThan(390 * .35);
  await page.screenshot({ path: `${motionPath}/progress-imprint-in-progress.png`, animations: 'allow' });
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Ready');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '60');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${motionPath}/progress-configure-in-progress.png`, animations: 'allow' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${motionPath}/progress-track-breathing.png`, animations: 'allow' });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await fill.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  expect(await progress.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  await page.getByRole('tab', { name: 'Preview' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '60');
  expect(await page.locator('[data-testid="product-image-track"]').evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '35');
});

test('touch swipe advances the preview while vertical scrolling and preview controls keep working', async ({ browser }) => {
  test.skip(browser.browserType().name() !== 'chromium', 'Touch dispatch uses Chromium emulation.');
  const context = await browser.newContext({ viewport: { width:390, height:844 }, isMobile:true, hasTouch:true });
  const page = await context.newPage();
  try {
    await enterStep2(page, 390, 844, ['Sensi Smart', '80 Series', '70 Series']);
    await uploadSvg(page);
    await page.getByRole('textbox', { name:'Line 1' }).fill('Shared imprint');
    await page.getByRole('button', { name:'Continue', exact:true }).click();
    await page.getByRole('tab', { name:'Preview' }).click();
    const carousel = page.getByTestId('product-preview-carousel');
    const box = await carousel.boundingBox();
    if (!box) throw new Error('Preview carousel is not visible.');
    const x = box.x + box.width * .75;
    const y = box.y + Math.min(box.height - 20, 130);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled:true, maxTouchPoints:1 });
    const dispatch = async (type:'touchStart'|'touchMove'|'touchEnd', px:number, py:number) => cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ id:0, x:px, y:py, radiusX:1, radiusY:1, force:1 }],
    });
    for (let attempt = 0; attempt < 3; attempt++) {
      const verticalBox = await carousel.boundingBox();
      if (!verticalBox) throw new Error('Preview carousel is not visible for vertical gesture testing.');
      const vx = verticalBox.x + verticalBox.width / 2;
      const vy = verticalBox.y + verticalBox.height / 2;
      await dispatch('touchStart', vx, vy);
      for (let index = 1; index <= 6; index++) {
        await dispatch('touchMove', vx, vy + (attempt % 2 === 0 ? -1 : 1) * 24 * index);
        await page.waitForTimeout(16);
      }
      await dispatch('touchEnd', vx, vy + (attempt % 2 === 0 ? -144 : 144));
      await page.waitForTimeout(30);
      expect(await page.evaluate(() => ({ window: scrollY, document: document.scrollingElement?.scrollTop ?? 0, main: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')?.scrollTop ?? 0 }))).toEqual({ window:0, document:0, main:0 });
    }
    await page.screenshot({ path: `${screenshotPath}/11-preview-after-vertical-touch-attempts-390x844.png` });
    await dispatch('touchStart', x, y);
    for (let index=1; index<=8; index++) {
      await dispatch('touchMove', x - 24 * index, y);
      await page.waitForTimeout(16);
    }
    await dispatch('touchEnd', x - 192, y);
    await expect(page.getByRole('heading', { name:'80 Series' })).toBeVisible();
    await expect(page.getByRole('button', { name:'Show 80 Series' })).toHaveAttribute('aria-current','true');

    await page.setViewportSize({ width:390, height:568 });
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const secondBox = await carousel.boundingBox();
    if (!secondBox) throw new Error('Preview carousel disappeared.');
    const verticalX = secondBox.x + secondBox.width / 2;
    const verticalY = secondBox.y + Math.min(secondBox.height - 20, 80);
    await dispatch('touchStart', verticalX, verticalY);
    for (let index=1; index<=8; index++) {
      await dispatch('touchMove', verticalX, verticalY - 24 * index);
      await page.waitForTimeout(16);
    }
    await dispatch('touchEnd', verticalX, verticalY - 192);
    await expect(page.getByRole('heading', { name:'80 Series' })).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);

    await page.getByRole('button', { name:'Show 70 Series' }).click();
    await expect(page.getByRole('heading', { name:'70 Series' })).toBeVisible();
    await page.getByRole('button', { name:'Logo', exact:true }).click();
    await expect(page.getByRole('button', { name:'Logo', exact:true })).toHaveAttribute('aria-pressed','true');
  } finally {
    await context.close();
  }
});

test('preview mode has no document scroll when it fits and long List mode scrolls above a stationary footer', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Shared imprint');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  await expect(page.getByTestId('product-preview-carousel')).toBeVisible();
  const shortPage = await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, height: window.innerHeight }));
  expect(shortPage.scrollHeight).toBeLessThanOrEqual(shortPage.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await page.getByRole('button', { name: 'Back to products' }).click();
  for (const name of ['80 Series', '70 Series', 'Classic 80 Series']) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const actionContinue = page.getByTestId('step2-action-footer').getByRole('button', { name: 'Continue', exact: true });
  await expect(actionContinue).toBeEnabled();
  await actionContinue.click();
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  await page.getByRole('tab', { name: 'List' }).click();
  const footer = page.locator('[data-testid="step2-action-footer"]');
  const before = await footer.boundingBox();
  await page.mouse.wheel(0, 540);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const savedListOffset = await page.evaluate(() => window.scrollY);
  const after = await footer.boundingBox();
  expect(after?.y).toBe(before?.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  await page.getByRole('tab', { name: 'Preview' }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: `${screenshotPath}/12-preview-after-list-transition-390x844.png` });
  for (const delta of [180, -180, 240, -240]) {
    await page.mouse.move(195, 420);
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(25);
    expect(await page.evaluate(() => ({ y: window.scrollY, root: document.scrollingElement?.scrollTop ?? 0, main: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')?.scrollTop ?? 0 }))).toEqual({ y:0, root:0, main:0 });
  }
  await page.screenshot({ path: `${screenshotPath}/13-preview-after-repeated-vertical-attempts-390x844.png` });
  await page.getByRole('button', { name: 'Show 80 Series' }).click();
  await expect(page.getByRole('heading', { name: '80 Series' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: `${screenshotPath}/14-preview-after-carousel-navigation-390x844.png` });
  await page.getByRole('tab', { name: 'List' }).evaluate(element => (element as HTMLButtonElement).click());
  await expect(page.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(savedListOffset);
  await page.screenshot({ path: `${screenshotPath}/15-list-restored-after-preview-390x844.png` });
  await page.mouse.wheel(0, -160);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(savedListOffset);
  await page.mouse.wheel(0, 160);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(savedListOffset);
});

test('Preview keeps 24px footer clearance when switching between differently sized products', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart', 'Blue Series 6 Inch with Door']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Product-specific fit');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  const geometry = async () => page.evaluate(() => {
    const controls = document.querySelector('[data-testid="preview-option-controls"]')!.getBoundingClientRect();
    const footer = document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect();
    const artboard = document.querySelector('[data-testid="preview-artboard"]')!.getBoundingClientRect();
    return { gap: footer.top - controls.bottom, controlsBottom: controls.bottom, footerTop: footer.top, artworkWidth: artboard.width, artworkHeight: artboard.height, documentHeight: document.documentElement.scrollHeight, viewportHeight: document.documentElement.clientHeight };
  });
  const first = await geometry();
  expect(first.gap).toBeCloseTo(24, 0);
  expect(first.documentHeight).toBeLessThanOrEqual(first.viewportHeight + 1);
  await page.getByRole('button', { name: 'Show Blue Series 6 Inch with Door' }).click();
  await expect(page.getByRole('heading', { name: 'Blue Series 6 Inch with Door' })).toBeVisible();
  const second = await geometry();
  expect(second.gap).toBeCloseTo(24, 0);
  expect(Math.abs(second.gap - first.gap)).toBeLessThanOrEqual(1);
  expect(second.documentHeight).toBeLessThanOrEqual(second.viewportHeight + 1);
  await expect(page.getByTestId('preview-option-controls')).toBeInViewport();
  await page.screenshot({ path: `${screenshotPath}/17-preview-footer-clearance-390x844.png` });
});

test('Preview product status stays inline with the name and category aligns beneath it', async ({ page }) => {
  for (const width of [375, 390, 430]) {
    await enterStep2(page, width, 844, ['Sensi Equipment Interface Module']);
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Configured imprint');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('tab', { name: 'Preview' }).click();

    const summary = page.getByTestId('preview-product-summary');
    const name = page.getByTestId('preview-product-name');
    const type = page.getByTestId('preview-product-type');
    const status = page.getByTestId('product-configuration-status');
    const textToggle = page.getByRole('button', { name: 'Text', exact: true });
    await expect(name).toHaveText('Sensi Equipment Interface Module');
    if (await textToggle.getAttribute('aria-pressed') === 'true') await textToggle.click();
    await expect(status).toHaveAttribute('alt', 'Not configured');

    const geometry = async () => page.evaluate(() => {
      const name = document.querySelector('[data-testid="preview-product-name"]')!;
      const type = document.querySelector('[data-testid="preview-product-type"]')!;
      const status = document.querySelector('[data-testid="product-configuration-status"]')!;
      const rects = Array.from(name.getClientRects(), rect => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }));
      const icon = status.getBoundingClientRect();
      const category = type.getBoundingClientRect();
      const summary = document.querySelector('[data-testid="preview-product-summary"]')!.getBoundingClientRect();
      const footer = document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect();
      return { rects, icon: { left: icon.left, right: icon.right, top: icon.top, bottom: icon.bottom }, category: { left: category.left, top: category.top }, summary: { right: summary.right }, footer: { top: footer.top }, viewportWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth };
    });
    const initial = await geometry();
    expect(initial.rects.length).toBeGreaterThan(0);
    expect(initial.category.left).toBeCloseTo(initial.rects[0].left, 0);
    expect(initial.icon.left - initial.rects.at(-1)!.right).toBeCloseTo(10, 0);
    expect(initial.icon.right - initial.icon.left).toBe(16);
    const iconCenter = initial.icon.top + (initial.icon.bottom - initial.icon.top) / 2;
    const finalNameLineCenter = initial.rects.at(-1)!.top + (initial.rects.at(-1)!.bottom - initial.rects.at(-1)!.top) / 2;
    expect(Math.abs(iconCenter - finalNameLineCenter)).toBeLessThanOrEqual(2.5);
    expect(initial.scrollWidth).toBe(initial.viewportWidth);
    expect(await name.evaluate(element => getComputedStyle(element.parentElement!).fontSize)).toBe('18px');
    if (width === 320) expect(initial.rects.length).toBeGreaterThan(1);

    await textToggle.click();
    await expect(status).toHaveAttribute('alt', 'Configured');
    const configured = await geometry();
    expect(configured.rects).toEqual(initial.rects);
    expect(configured.icon.left - configured.rects.at(-1)!.right).toBeCloseTo(10, 0);
    expect(configured.scrollWidth).toBe(configured.viewportWidth);
    await expect(page.getByTestId('preview-option-controls')).toBeInViewport();
    const footerGap = await page.evaluate(() => {
      const controls = document.querySelector('[data-testid="preview-option-controls"]')!.getBoundingClientRect();
      const footer = document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect();
      return footer.top - controls.bottom;
    });
    expect(footerGap).toBeCloseTo(24, 0);
    await expect(summary).toBeVisible();
    await page.getByRole('button', { name: 'Back to imprint details' }).click();
    await page.getByRole('button', { name: 'Back to products' }).click();
  }
});

test('constrained landscape Preview keeps controls reachable with contained scrolling', async ({ page }) => {
  await enterStep2(page, 844, 390, ['Sensi Smart', '80 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Constrained layout');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Preview' }).click();
  const main = page.locator('[data-step2-view="configure"][data-configure-mode="preview"]');
  await expect(main).toBeVisible();
  const initial = await main.evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  expect(await page.getByTestId('preview-artboard').evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(100);
  expect(initial.scrollHeight).toBeGreaterThan(initial.clientHeight);
  if (initial.scrollHeight > initial.clientHeight + 1) {
    await main.evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: 'instant' }));
  }
  await expect(page.getByTestId('preview-option-controls')).toBeInViewport();
  const final = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight, visualHeight: visualViewport?.height ?? null, visualOffsetTop: visualViewport?.offsetTop ?? null },
    windowScrollY: scrollY,
    mainScrollTop: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')!.scrollTop,
    responsiveContentMetrics: (() => { const element = document.querySelector<HTMLElement>('[data-configure-mode="preview"] [class*="responsiveContent"]')!; const { y, bottom, height } = element.getBoundingClientRect(); return { y, bottom, height, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, paddingBottom: getComputedStyle(element).paddingBottom }; })(),
    documentScrollHeight: document.documentElement.scrollHeight,
    documentClientHeight: document.documentElement.clientHeight,
    bodyScrollHeight: document.body.scrollHeight,
    mainClientHeight: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')!.clientHeight,
    mainScrollHeight: document.querySelector<HTMLElement>('[data-configure-mode="preview"]')!.scrollHeight,
    mainRect: (() => { const { x, y, width, height, bottom } = document.querySelector<HTMLElement>('[data-configure-mode="preview"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    previewWorkspaceRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[data-testid="configure-products-panel"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    artworkRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[data-testid="product-preview-carousel"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    paginationRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[aria-label="Preview product position"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    informationRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[data-testid="preview-product-summary"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    controlsRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[data-testid="preview-option-controls"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    footerRect: (() => { const { x, y, width, height, bottom } = document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect(); return { x, y, width, height, bottom }; })(),
    footerTop: document.querySelector('[data-testid="step2-action-footer"]')!.getBoundingClientRect().top,
    controlsBottom: document.querySelector('[data-testid="preview-option-controls"]')!.getBoundingClientRect().bottom,
  }));
  expect(final.documentScrollHeight).toBeLessThanOrEqual(final.documentClientHeight + 1);
  expect(final.footerTop - final.controlsBottom, JSON.stringify(final)).toBeCloseTo(24, 0);
  await writeFile('docs/validation/step2-redesign/preview-landscape-geometry.json', JSON.stringify({ initial, final }, null, 2));
  await page.screenshot({ path: `${screenshotPath}/16-preview-constrained-landscape-844x390.png` });
});

test('mobile progress track stays full-width and fixed beneath the navigation while scrolling', async ({ page }) => {
  await enterStep2(page, 390, 844, ['Sensi Smart', '80 Series', '70 Series', 'Classic 80 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Shared imprint');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  const progress = page.getByRole('progressbar', { name: 'Setup progress' });
  const value = '60';
  const resting = await progress.boundingBox();
  expect(resting).toMatchObject({ x:0, y:50, width:390, height:4 });
  await page.mouse.wheel(0, 540);
  const stuck = await progress.boundingBox();
  expect(stuck).toMatchObject({ x:0, y:50, width:390, height:4 });
  expect(await progress.getAttribute('aria-valuenow')).toBe(value);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('tablet adapts the configuration list and desktop retains the combined workspace', async ({ page }) => {
  await enterStep2(page, 768, 1140);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Tablet sample');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  await expect(page.locator('[data-testid^="configuration-card-"]').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(768);

  for (const width of [1280, 1440, 1920]) {
    await enterStep2(page, width, 900);
    await expect(page.getByTestId('live-preview-panel')).toBeVisible();
    await expect(page.locator('aside[data-mode="branding"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});

test('responsive imprint details fills the tablet content width and preserves mobile and desktop sizing', async ({ page }) => {
  const outputDir = 'docs/validation/tablet-imprint-width';
  await mkdir(outputDir, { recursive: true });
  const widths = [390, 600, 768, 820, 1024, 1279, 1280, 1920];
  const tabletGeometry: Array<Record<string, number>> = [];

  for (const width of widths) {
    const height = width === 390 ? 844 : width === 768 ? 1140 : 900;
    await enterStep2(page, width, height, ['Classic 80 Series']);
    await expect(page.getByTestId('imprint-details-panel')).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
      window.scrollTo(0, 0);
    });

    if (width < 1280) {
      const geometry = await page.evaluate(() => {
        const bounds = (element: Element | null) => {
          if (!element) throw new Error('Expected imprint element was not found');
          const rect = element.getBoundingClientRect();
          return { x: rect.x, width: rect.width, right: rect.right };
        };
        const panel = document.querySelector('[data-testid="imprint-details-panel"]');
        const dropzone = document.querySelector('[class*="mobileDropzone"]');
        const lineOne = document.querySelector('#imprint-line-1')?.parentElement?.parentElement;
        const lineTwo = document.querySelector('#imprint-line-2')?.parentElement?.parentElement;
        const note = document.querySelector('[class*="mobileSharedNote"]');
        const main = document.querySelector('main#main');
        return {
          panel: bounds(panel),
          dropzone: bounds(dropzone),
          lineOne: bounds(lineOne ?? null),
          lineTwo: bounds(lineTwo ?? null),
          note: bounds(note),
          main: bounds(main),
          documentWidth: document.documentElement.scrollWidth,
          footerPosition: getComputedStyle(document.querySelector('[data-testid="step2-action-footer"]')!).position === 'fixed' ? 1 : 0,
        };
      });
      const expectedWidth = width - 40;
      for (const key of ['panel', 'dropzone', 'lineOne', 'lineTwo', 'note'] as const) {
        expect(geometry[key].x).toBe(20);
        expect(geometry[key].width).toBe(expectedWidth);
        expect(geometry[key].right).toBe(width - 20);
      }
      expect(geometry.main.width).toBe(width);
      expect(geometry.documentWidth).toBe(width);
      expect(geometry.footerPosition).toBe(1);
      if (width >= 768) tabletGeometry.push({ width, formWidth: geometry.panel.width, dropzoneWidth: geometry.dropzone.width, lineOneWidth: geometry.lineOne.width, lineTwoWidth: geometry.lineTwo.width, noteWidth: geometry.note.width });
    }

    if ([390, 768, 820, 1024, 1279, 1280, 1920].includes(width)) {
      await page.screenshot({ path: `${outputDir}/step2-imprint-${width}.png`, fullPage: true });
    }
  }

  await writeFile(`${outputDir}/tablet-geometry.json`, JSON.stringify(tabletGeometry, null, 2));
});

test('shared imprint text fields keep separate fixed-size Bold controls across breakpoints', async ({ page }) => {
  const outputDir = 'docs/validation/unified-imprint-inputs';
  await mkdir(outputDir, { recursive: true });

  for (const width of [320, 390, 768, 1024, 1280, 1920]) {
    const height = width === 768 ? 1140 : width >= 1280 ? 1000 : 844;
    await enterStep2(page, width, height, ['Sensi Smart']);
    const input1 = page.getByRole('textbox', { name: 'Line 1' });
    const input2 = page.getByRole('textbox', { name: 'Line 2' });
    const bold1 = page.getByRole('button', { name: 'Bold line 1' });
    const bold2 = page.getByRole('button', { name: 'Bold line 2' });

    await input1.fill('Line one sample');
    if (await bold1.getAttribute('aria-pressed') !== 'true') await bold1.click();
    await expect(bold1).toHaveAttribute('aria-pressed', 'true');
    await input2.fill('Line two sample');
    if (await bold2.getAttribute('aria-pressed') !== 'true') await bold2.click();
    await expect(input1).toHaveValue('Line one sample');
    await expect(input2).toHaveValue('Line two sample');
    await expect(bold2).toHaveAttribute('aria-pressed', 'true');

    const geometry = await page.evaluate(() => {
      const read = (line: number) => {
        const input = document.querySelector<HTMLInputElement>(`#imprint-line-${line}`);
        const field = input?.closest('[class*="lineField"]');
        const controls = input?.closest('[class*="lineControls"]');
        const wrap = input?.parentElement;
        const button = field?.querySelector('button[aria-label^="Bold line"]');
        if (!input || !field || !controls || !wrap || !button) throw new Error(`Line ${line} controls are incomplete`);
        const box = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
        };
        return {
          input: box(input),
          wrap: box(wrap),
          controls: box(controls),
          button: box(button),
          sibling: wrap.nextElementSibling === button,
          fontSize: Number.parseFloat(getComputedStyle(input).fontSize),
          labelText: field.querySelector('label')?.textContent?.replace(/\s+/g, ' ').trim(),
          counter: field.querySelector('label span:last-child')?.textContent?.trim(),
        };
      };
      const panel = document.querySelector<HTMLElement>('[data-testid="imprint-details-panel"]');
      if (!panel) throw new Error('Imprint details panel is missing');
      const panelRect = panel.getBoundingClientRect();
      const style = getComputedStyle(panel);
      return {
        one: read(1),
        two: read(2),
        panel: { x: panelRect.x, right: panelRect.right, paddingLeft: parseFloat(style.paddingLeft), paddingRight: parseFloat(style.paddingRight), borderLeft: parseFloat(style.borderLeftWidth), borderRight: parseFloat(style.borderRightWidth) },
        documentWidth: document.documentElement.scrollWidth,
      };
    });

    for (const line of [geometry.one, geometry.two]) {
      expect(line.sibling).toBe(true);
      expect(line.button.width).toBe(48);
      expect(line.button.height).toBe(48);
      expect(line.wrap.height).toBe(48);
      expect(line.button.x - line.wrap.right).toBe(8);
      expect(line.button.y).toBe(line.wrap.y);
      expect(line.fontSize).toBe(width < 1280 ? 16 : 14);
    }
    expect(geometry.one.controls.x).toBe(geometry.two.controls.x);
    expect(geometry.one.controls.width).toBe(geometry.two.controls.width);
    expect(geometry.one.labelText).toContain('LINE 1');
    expect(geometry.two.labelText).toContain('LINE 2');
    expect(geometry.one.counter).toBe('15 / 30');
    expect(geometry.two.counter).toBe('15 / 30');
    expect(geometry.one.controls.x).toBe(geometry.panel.x + geometry.panel.borderLeft + geometry.panel.paddingLeft);
    expect(geometry.one.controls.right).toBe(geometry.panel.right - geometry.panel.borderRight - geometry.panel.paddingRight);
    expect(geometry.documentWidth).toBe(width);

    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
      window.scrollTo(0, 0);
    });
    await page.screenshot({ path: `${outputDir}/step2-imprint-${width}.png`, fullPage: true });
  }
});
