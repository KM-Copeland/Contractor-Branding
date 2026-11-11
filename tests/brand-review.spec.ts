import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const families = ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Touch 2, Sensi Lite', 'Sensi Equipment Interface Module'];
async function enterStep2(page: Page, selected = families) {
  await page.goto('/#select-products');
  for (const name of selected) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
}
async function capture(page: Page, name: string) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode())); });
  await page.mouse.move(0, 0);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  await mkdir('docs/validation/phase3', { recursive: true });
  await page.screenshot({ path: `docs/validation/phase3/${name}-1280.png`, fullPage: true });
}
async function populate(page: Page) {
  const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#8058ef"/><stop offset="1" stop-color="#0951da"/></linearGradient></defs><path fill="url(#g)" d="M50 0 100 50 50 100 0 50Z"/><path fill="white" d="M42 28 70 50 42 72Z"/></svg>';
  await page.locator('input[type=file]').setInputFiles({ name: 'sample-logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(logo) });
  await page.getByRole('textbox', { name: 'Line 1' }).fill('This is an example');
  await page.getByRole('textbox', { name: 'Line 2' }).fill('Placeholder text for context');
}
async function selectPreviewProduct(page: Page, id: string, name: string) {
  const button = page.locator(`[data-product-id="${id}"]`).getByRole('button', { name, exact: true });
  await button.waitFor({ state: 'visible' });
  await button.evaluate(element => (element as HTMLButtonElement).click());
}
async function rasterBuffer(page: Page, format: 'png' | 'jpeg', width: number, height: number) {
  const dataUrl = await page.evaluate(({ format, width, height }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d')!; context.fillStyle = '#156f45'; context.fillRect(0, 0, width, height);
    return canvas.toDataURL(`image/${format}`);
  }, { format, width, height });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}
function crc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1; }
  return (crc ^ 0xffffffff) >>> 0;
}
function pngWithDpi(png: Buffer, dpi: number) {
  const data = Buffer.alloc(9); data.writeUInt32BE(Math.round(dpi * 39.37007874), 0); data.writeUInt32BE(Math.round(dpi * 39.37007874), 4); data[8] = 1;
  const chunk = Buffer.alloc(21); chunk.writeUInt32BE(data.length, 0); chunk.write('pHYs', 4); data.copy(chunk, 8); chunk.writeUInt32BE(crc32(chunk.subarray(4, 17)), 17);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}
function jpegWithDpi(jpeg: Buffer, dpi: number) {
  const bytes = Buffer.from(jpeg); const jfif = bytes.indexOf(Buffer.from('JFIF\0'));
  if (jfif < 0) throw new Error('Canvas JPEG is missing JFIF metadata');
  bytes[jfif + 7] = 1; bytes.writeUInt16BE(dpi, jfif + 8); bytes.writeUInt16BE(dpi, jfif + 10);
  return bytes;
}
function bmpWithDpi(width: number, height: number, dpi: number) {
  const rowBytes = Math.ceil(width * 3 / 4) * 4; const pixels = rowBytes * height; const bytes = Buffer.alloc(54 + pixels);
  bytes.write('BM', 0); bytes.writeUInt32LE(bytes.length, 2); bytes.writeUInt32LE(54, 10); bytes.writeUInt32LE(40, 14);
  bytes.writeInt32LE(width, 18); bytes.writeInt32LE(height, 22); bytes.writeUInt16LE(1, 26); bytes.writeUInt16LE(24, 28); bytes.writeUInt32LE(pixels, 34);
  bytes.writeInt32LE(Math.round(dpi * 39.37007874), 38); bytes.writeInt32LE(Math.round(dpi * 39.37007874), 42);
  return bytes;
}

test('fixed navigation stays visible and the site footer is absent across workflow screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const expectAppShell = async (verifyScroll = false) => {
    const header = page.locator('header').first();
    const progress = page.getByRole('progressbar', { name: 'Setup progress' });
    await expect(header).toHaveCSS('position', 'fixed');
    await expect(progress).toHaveCSS('position', 'static');
    await expect(page.locator('footer')).toHaveCount(0);
    if (verifyScroll) {
      await page.evaluate(() => window.scrollTo(0, 450));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
      expect((await header.boundingBox())!.y).toBe(0);
      expect((await progress.boundingBox())!.y).toBe(50);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  };

  await page.goto('/#select-products');
  await expectAppShell(true);
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expectAppShell(true);

  await populate(page);
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#complete$/);
  await expectAppShell();
});

test('logo upload validates image content, dimensions, and DPI metadata', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  const goodPng = pngWithDpi(await rasterBuffer(page, 'png', 600, 240), 300);
  await input.setInputFiles({ name: 'brand.png', mimeType: 'image/png', buffer: goodPng });
  await expect(page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' })).toContainText('600 × 240 px');
  await expect(page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' })).toContainText('300 × 300 DPI');
  await expect(page.getByRole('button', { name: 'Remove logo' })).toBeVisible();

  const lowPng = pngWithDpi(await rasterBuffer(page, 'png', 600, 240), 150);
  await input.setInputFiles({ name: 'low-dpi.png', mimeType: 'image/png', buffer: lowPng });
  await expect(page.getByRole('status').filter({ hasText: 'Logo may require print review' })).toContainText('150 × 150');

  await input.setInputFiles({ name: 'no-dpi.png', mimeType: 'image/png', buffer: await rasterBuffer(page, 'png', 600, 240) });
  await expect(page.getByRole('status').filter({ hasText: 'Logo may require print review' })).toContainText('DPI metadata was not found');

  const goodJpeg = jpegWithDpi(await rasterBuffer(page, 'jpeg', 720, 320), 300);
  await input.setInputFiles({ name: 'brand.jpg', mimeType: 'image/jpeg', buffer: goodJpeg });
  await expect(page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' })).toContainText('720 × 320 px');

  await input.setInputFiles({ name: 'brand.bmp', mimeType: 'image/bmp', buffer: bmpWithDpi(640, 160, 300) });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type. Choose JPG, PNG, or SVG.');
});

test('logo upload rejects small, unsupported, mismatched, and corrupted files', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  await input.setInputFiles({ name: 'small.png', mimeType: 'image/png', buffer: await rasterBuffer(page, 'png', 599, 400) });
  await expect(page.getByRole('alert')).toContainText('minimum is 600px');
  await expect(page.getByRole('button', { name: 'Remove logo' })).toHaveCount(0);

  await input.setInputFiles({ name: 'unsupported.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type');

  await input.setInputFiles({ name: 'wrong-extension.jpg', mimeType: 'image/jpeg', buffer: await rasterBuffer(page, 'png', 800, 400) });
  await expect(page.getByRole('alert')).toContainText('extension does not match');

  const corruptPng = Buffer.from(await rasterBuffer(page, 'png', 800, 400)); corruptPng[45] ^= 0xff;
  await input.setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: corruptPng });
  await expect(page.getByRole('alert')).toContainText('cannot be decoded');

  await input.setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('alert')).toContainText('unreadable');

  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.getByRole('alert')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('only PNG, JPG, and SVG are accepted as logo formats', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF');
  await input.setInputFiles({ name: 'vector.pdf', mimeType: 'application/pdf', buffer: pdf });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type. Choose JPG, PNG, or SVG.');
  await expect(page.getByTestId('logo-file-name')).toHaveCount(0);

  await input.setInputFiles({ name: 'art.eps', mimeType: 'application/postscript', buffer: Buffer.from('%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 100 100\nshowpage\n%%EOF') });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type. Choose JPG, PNG, or SVG.');
  await expect(page.getByTestId('logo-file-name')).toHaveCount(0);

  await input.setInputFiles({ name: 'image.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type. Choose JPG, PNG, or SVG.');
});

test('validated logos can be removed and uploaded again without leaving stale feedback', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  const png = pngWithDpi(await rasterBuffer(page, 'png', 800, 400), 300);
  await input.setInputFiles({ name: 'first.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByRole('status').filter({ hasText: 'Logo meets preliminary print requirements' })).toBeVisible();
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#156f45"/></svg>');
  await expect(page.getByRole('button', { name: 'Replace' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.getByRole('button', { name: 'Drop logo here or click to upload' })).toBeVisible();
  await input.setInputFiles({ name: 'vector.svg', mimeType: 'image/svg+xml', buffer: svg });
  await expect(page.getByRole('status').filter({ hasText: 'Logo may require print review' })).toContainText('print dimensions');
  await expect(page.getByTestId('logo-file-name')).toHaveText('vector.svg');
  await expect(page.getByRole('img', { name: 'Selected logo' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.locator('#logo-validation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Drop logo here or click to upload' })).toBeVisible();
});

test('a later logo selection wins when validations overlap', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  const largePng = Buffer.concat([pngWithDpi(await rasterBuffer(page, 'png', 800, 400), 300), Buffer.alloc(8 * 1024 * 1024)]);
  await input.setInputFiles({ name: 'earlier.png', mimeType: 'image/png', buffer: largePng });
  const latestSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#156f45"/></svg>');
  await input.setInputFiles({ name: 'latest.svg', mimeType: 'image/svg+xml', buffer: latestSvg });
  await expect(page.getByTestId('logo-file-name')).toHaveText('latest.svg');
  await expect(page.getByRole('status').filter({ hasText: 'Logo may require print review' })).toContainText('SVG structure is valid');
});

test('captures all six Step 2 reference combinations at 1280px', async ({ page }) => {
  await enterStep2(page);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.getByRole('switch')).toHaveCount(2);
  await expect(page.getByRole('switch').nth(0)).toBeDisabled();
  await expect(page.getByRole('switch').nth(1)).toBeDisabled();
  await expect(page.getByRole('button', { name: /Expand|Collapse preview/ })).toHaveCount(0);
  await capture(page, 'step2-no-imprint-collapsed');
  await populate(page);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.getByRole('switch')).toHaveCount(2);
  await capture(page, 'step2-populated-collapsed');
  const row = (id: string) => page.locator(`[data-product-id="${id}"]`);
  const logoSwitch = page.getByRole('switch', { name: 'logo imprint' });
  const textSwitch = page.getByRole('switch', { name: 'text imprint' });
  await selectPreviewProduct(page, 'sensi-smart', 'Sensi Smart');
  await logoSwitch.click();
  await textSwitch.click();
  await selectPreviewProduct(page, '80-series', '80 Series');
  await textSwitch.click();
  await selectPreviewProduct(page, 'wallplate-80-70-sensi', '70/80 series, Sensi Smart');
  await logoSwitch.click();
  await expect(textSwitch).toBeDisabled();
  await selectPreviewProduct(page, 'wallplate-touch2-lite', 'Sensi Touch 2, Sensi Lite');
  await textSwitch.click();
  await expect(logoSwitch).toBeDisabled();
  await selectPreviewProduct(page, 'sensi-module', 'Sensi Equipment Interface Module');
  await textSwitch.click();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await expect(page.getByTestId('product-preview')).toContainText('This is an example');
  await capture(page, 'step2-active-collapsed');
  await selectPreviewProduct(page, '80-series', '80 Series');
  await expect(page.getByTestId('product-preview').locator('img').first()).toHaveAttribute('alt', '80 Series preview');
  await selectPreviewProduct(page, 'sensi-smart', 'Sensi Smart');
  await expect(logoSwitch).toHaveAttribute('aria-checked', 'true');
  await page.goBack();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).toBeChecked();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your imprint is ready for review' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('No order or production data has been submitted');
});

test('80 Series can combine logo and text and preserves its configuration on Back', async ({ page }) => {
  await enterStep2(page, ['80 Series']);
  await populate(page);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await expect(page.getByRole('switch', { name: 'logo imprint' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'text imprint' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await expect(page.getByTestId('product-preview')).toContainText('This is an example');
  await page.goBack();
  await expect(page.getByRole('checkbox', { name: '80 Series', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('This is an example');
  await expect(page.getByRole('switch', { name: 'text imprint' })).toBeChecked();
});

test('imprint text scales with the product mock-up as the available preview width grows', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  await populate(page);
  await page.getByRole('switch', { name: 'text imprint' }).click();
  const text = page.getByTestId('brand-text-preview');
  const measure = () => text.evaluate(element => ({
    fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    artboardWidth: element.closest('[data-testid="preview-artboard"]')!.getBoundingClientRect().width,
  }));
  const collapsed = await measure();
  await expect(page.getByRole('button', { name: /Expand|Collapse preview/ })).toHaveCount(0);
  await page.setViewportSize({ width: 1920, height: 1080 });
  const wider = await measure();
  const artboardScale = wider.artboardWidth / collapsed.artboardWidth;
  const textScale = wider.fontSize / collapsed.fontSize;
  expect(artboardScale).toBeGreaterThan(1);
  expect(textScale).toBeCloseTo(artboardScale, 1);
});

test('responsive Step 2 uses configured products without a selected-products drawer', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart', '80 Series']);
  await populate(page);
  await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'EDIT PRODUCTS' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Expand|Collapse preview/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove Sensi Smart', exact: true }).click();
  await expect(page.getByRole('complementary')).toContainText('1 selected');
  await expect(page.getByTestId('product-preview').locator('img').first()).toHaveAttribute('alt', '80 Series preview');
  await expect(page.getByRole('button', { name: 'Remove Sensi Smart', exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 900, height: 900 });
  await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View selected products' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to products' }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: '80 Series', exact: true })).toBeChecked();
});

test('Selection menu supports Remove and Clear All on the completion screen', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart', '80 Series']);
  await populate(page);
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await selectPreviewProduct(page, '80-series', '80 Series');
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your imprint is ready for review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove 80 Series', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove 80 Series', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remove Sensi Smart', exact: true })).toBeFocused();
  await expect(page.getByText('1 product family configured.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear All', exact: true }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
  await expect(page.getByRole('complementary')).toContainText('0 selected');
});

test('bold controls format each imprint line independently and persist across product previews', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart', '80 Series']);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('First imprint line');
  await page.getByRole('textbox', { name: 'Line 2' }).fill('Second imprint line');
  const sensiRow = page.locator('[data-product-id="sensi-smart"]');
  const seriesRow = page.locator('[data-product-id="80-series"]');
  await sensiRow.getByRole('button', { name: 'Sensi Smart', exact: true }).click();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await seriesRow.getByRole('button', { name: '80 Series', exact: true }).click();
  await page.getByRole('switch', { name: 'text imprint' }).click();

  const boldLine1 = page.getByRole('button', { name: 'Bold line 1' });
  const boldLine2 = page.getByRole('button', { name: 'Bold line 2' });
  await boldLine1.click();
  await expect(boldLine1).toHaveAttribute('aria-pressed', 'true');
  await expect(boldLine2).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('First imprint line');
  let previewLines = page.getByTestId('brand-text-preview').locator('span');
  await expect(previewLines.nth(0)).toHaveCSS('font-weight', '700');
  await expect(previewLines.nth(1)).toHaveCSS('font-weight', '400');

  await seriesRow.getByRole('button', { name: '80 Series', exact: true }).click();
  previewLines = page.getByTestId('brand-text-preview').locator('span');
  await expect(previewLines.nth(0)).toHaveCSS('font-weight', '700');
  await boldLine2.press('Enter');
  await expect(boldLine2).toHaveAttribute('aria-pressed', 'true');
  await expect(previewLines.nth(1)).toHaveCSS('font-weight', '700');

  await boldLine1.focus();
  await boldLine1.press('Space');
  await expect(boldLine1).toHaveAttribute('aria-pressed', 'false');
  await expect(previewLines.nth(0)).toHaveCSS('font-weight', '400');
  await expect(previewLines.nth(1)).toHaveCSS('font-weight', '700');
  await sensiRow.getByRole('button', { name: 'Sensi Smart', exact: true }).click();
  previewLines = page.getByTestId('brand-text-preview').locator('span');
  await expect(previewLines.nth(0)).toHaveCSS('font-weight', '400');
  await expect(previewLines.nth(1)).toHaveCSS('font-weight', '700');
  for (const width of [1280, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(boldLine1).toBeVisible();
    await expect(boldLine2).toBeVisible();
  }
});

test('logo removal keeps text, a mutually exclusive product cannot enable both, and limits are enforced', async ({ page }) => {
  await enterStep2(page, ['Sensi Touch 2, Sensi Lite']);
  await populate(page);
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveAttribute('maxlength', '30');
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await expect(page.getByRole('switch', { name: 'text imprint' })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('This is an example');
  await expect(page.getByRole('switch', { name: 'text imprint' })).toBeEnabled();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await page.getByRole('textbox', { name: 'Line 1' }).fill('X'.repeat(31));
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('X'.repeat(30));
});

test('Other products can use logo and text together with a live product preview', async ({ page }) => {
  await enterStep2(page, ['Sensi Equipment Interface Module']);
  await populate(page);
  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await expect(page.getByRole('switch', { name: 'logo imprint' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('switch', { name: 'text imprint' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await expect(page.getByTestId('product-preview').locator('img').first()).toHaveAttribute('alt', 'Sensi Equipment Interface Module preview');
});

test('wallplate and Sensi module previews use their supplied logo and text placements', async ({ page }) => {
  const cases = [
    { name: '70/80 series, Sensi Smart', id: 'wallplate-80-70-sensi', logoStyle: /left: 40\.5%; top: 5\.5%;/, textStyle: /left: 33%; top: 7%;.*width: 34%;.*white-space: nowrap/ },
    { name: 'Sensi Touch Smart (white)', id: 'wallplate-touch-white', logoStyle: /left: 44%; top: 5%;/, textStyle: /left: 33%; top: 6%;.*width: 34%;.*white-space: nowrap/ },
    { name: 'Sensi Touch Smart (black)', id: 'wallplate-touch-black', logoStyle: /left: 44%; top: 6%;.*mix-blend-mode: normal/, textStyle: /left: 33%; top: 6%;.*width: 34%;.*white-space: nowrap/ },
    { name: 'Sensi Touch 2, Sensi Lite', id: 'wallplate-touch2-lite', logoStyle: /left: 43%; top: 8%;/, textStyle: /left: 33%; top: 6%;.*width: 34%;.*white-space: nowrap/ },
    { name: 'Sensi Equipment Interface Module', id: 'sensi-module', logoStyle: /left: 22\.5%; top: 56%;/, textStyle: /left: 45%; top: 55%;.*width: 28%;.*white-space: nowrap/ },
  ];
  await enterStep2(page, cases.map(item => item.name));
  await populate(page);
  await mkdir('docs/validation/product-imprint-placement', { recursive: true });
  for (const item of cases) {
    const row = page.locator(`[data-product-id="${item.id}"]`);
    await selectPreviewProduct(page, item.id, item.name);
    const logoSwitch = page.getByRole('switch', { name: 'logo imprint' });
    const textSwitch = page.getByRole('switch', { name: 'text imprint' });
    await logoSwitch.click();
    await expect(page.getByTestId('brand-logo-preview')).toHaveAttribute('style', item.logoStyle);
    if (item.id !== 'sensi-module') await expect(textSwitch).toBeDisabled();
    else await expect(textSwitch).toBeEnabled();
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/product-imprint-placement/${item.id}-logo.png` });
    await logoSwitch.click();
    await textSwitch.click();
    await expect(page.getByTestId('brand-text-preview')).toHaveAttribute('style', item.textStyle);
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/product-imprint-placement/${item.id}-text.png` });
    await textSwitch.click();
  }
});

test('other thermostat families enforce logo/text mutual exclusion', async ({ page }) => {
  await enterStep2(page, ['70 Series']);
  await populate(page);
  const logo = page.getByRole('switch', { name: 'logo imprint' });
  const text = page.getByRole('switch', { name: 'text imprint' });
  await logo.click();
  await expect(text).toBeDisabled();
  await logo.click();
  await expect(text).toBeEnabled();
  await text.click();
  await expect(text).toBeChecked();
  await expect(logo).toBeDisabled();
  await text.click();
  await expect(logo).toBeEnabled();
  await logo.click();
  await expect(logo).toBeChecked();
  await expect(text).not.toBeChecked();
});

test('Blue thermostat capabilities and newly added previews match their supplied references', async ({ page }) => {
  await enterStep2(page, ['Blue Series 12 Inch Touch']);
  await populate(page);
  await expect(page.getByRole('switch', { name: 'logo imprint' })).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'text imprint' })).toBeEnabled();
  await page.getByRole('switch', { name: 'text imprint' }).click();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled();
  await expect(page.getByTestId('brand-text-preview')).toHaveAttribute('style', /left: 38%; top: 84%;/);
  await mkdir('docs/validation/thermostat-placement', { recursive: true });
  await page.getByTestId('preview-artboard').screenshot({ path: 'docs/validation/thermostat-placement/blue-12-text.png' });

  const cases = [
    { name: 'Blue Series 2 Inch', id: 'blue-2-inch', logoStyle: /left: 66\.5%; top: 69%;/, textStyle: /left: 57%; top: 73%;/ },
    { name: 'Blue Series 6 Inch', id: 'blue-6', logoStyle: /left: 74\.7%; top: 73\.7%;/, textStyle: /left: 65%; top: 74%;/ },
    { name: 'Blue Series 6 Inch with Door', id: 'blue-6-inch-door', logoStyle: /left: 42\.4%; top: 75\.3%;/, textStyle: /left: 30%; top: 77%;/ },
  ];
  for (const item of cases) {
    await page.goBack();
    await expect(page).toHaveURL(/#select-products$/);
    await page.getByRole('checkbox', { name: item.name, exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await populate(page);
    const row = page.locator(`[data-product-id="${item.id}"]`);
    await selectPreviewProduct(page, item.id, item.name);
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await expect(page.getByTestId('brand-logo-preview')).toHaveAttribute('style', item.logoStyle);
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/thermostat-placement/${item.id}-logo.png` });
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await page.getByRole('switch', { name: 'text imprint' }).click();
    await expect(page.getByTestId('brand-text-preview')).toHaveAttribute('style', item.textStyle);
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/thermostat-placement/${item.id}-text.png` });
    await expect(page.getByRole('switch', { name: 'logo imprint' })).toBeDisabled();
  }
});

test('Blue Series 6 Inch with Door keeps both 30-character text lines on one line', async ({ page }) => {
  await enterStep2(page, ['Blue Series 6 Inch with Door']);
  const secondLine = 'this is exampl line asd tuinsd';
  await page.getByRole('textbox', { name: 'Line 1' }).fill('this is example for line one');
  await page.getByRole('textbox', { name: 'Line 2' }).fill(secondLine);
  await expect(page.getByRole('textbox', { name: 'Line 2' })).toHaveValue(secondLine.slice(0, 30));
  await page.getByRole('switch', { name: 'text imprint' }).click();
  const overlay = page.getByTestId('brand-text-preview');
  const lines = overlay.locator('span');
  await expect(lines).toHaveCount(2);
  const first = await lines.nth(0).boundingBox();
  const second = await lines.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first!.height - second!.height)).toBeLessThan(1);
  await page.getByTestId('preview-artboard').screenshot({ path: 'docs/validation/thermostat-placement/blue-6-inch-door-long-lines.png' });
});

test('applies product-specific logo and text placements across the first six mapped thermostat families', async ({ page }) => {
  const placementCases = [
    { name: '80 Series', id: '80-series', logoLeft: '5.2%', logoTop: '81.9%', textLeft: '36.5%', textTop: '84%' },
    { name: '70 Series', id: '70-series', logoLeft: '42%', logoTop: '83.5%', textLeft: '36.5%', textTop: '76%' },
    { name: 'Classic 80 Series', id: 'classic-80', logoLeft: '14%', logoTop: '72.5%', textLeft: '21%', textTop: '74%' },
    { name: 'Classic 80 Series Programmable', id: 'classic-80-programmable', logoLeft: '69%', logoTop: '71%', textLeft: '66%', textTop: '74%' },
    { name: 'Classic 70 Series', id: 'classic-70', logoLeft: '61%', logoTop: '46.5%', textLeft: '58%', textTop: '46.5%' },
    { name: 'Classic 70 Series Vertical', id: 'classic-70-vertical', logoLeft: '44.5%', logoTop: '55.5%', textLeft: '36.5%', textTop: '59%' },
  ];
  await enterStep2(page, placementCases.map(item => item.name));
  await populate(page);
  await mkdir('docs/validation/thermostat-placement', { recursive: true });
  for (const item of placementCases) {
    const row = page.locator(`[data-product-id="${item.id}"]`);
    await selectPreviewProduct(page, item.id, item.name);
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    const logo = page.getByTestId('brand-logo-preview');
    await expect(logo).toHaveAttribute('style', new RegExp(`left: ${item.logoLeft.replace('%', '\\%')}; top: ${item.logoTop.replace('%', '\\%')};`));
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/thermostat-placement/${item.id}-logo.png` });
    await page.getByRole('switch', { name: 'logo imprint' }).click();
    await page.getByRole('switch', { name: 'text imprint' }).click();
    const text = page.getByTestId('brand-text-preview');
    await expect(text).toHaveAttribute('style', new RegExp(`left: ${item.textLeft.replace('%', '\\%')}; top: ${item.textTop.replace('%', '\\%')};`));
    await page.getByTestId('preview-artboard').screenshot({ path: `docs/validation/thermostat-placement/${item.id}-text.png` });
    await page.getByRole('switch', { name: 'text imprint' }).click();
  }
});

test('unsupported vector documents and the 10 MB limit are reported clearly', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  const input = page.locator('input[type=file]');
  await input.setInputFiles({ name: 'brand.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF') });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type');
  await expect(page.getByRole('button', { name: 'Remove logo' })).toHaveCount(0);
  await input.setInputFiles({ name: 'oversize.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert')).toContainText('This file is larger than 10 MB');
  await expect(page.getByRole('button', { name: 'Remove logo' })).toHaveCount(0);
});

test('the local completion route cannot skip imprint validation', async ({ page }) => {
  await enterStep2(page, ['Sensi Smart']);
  await page.evaluate(() => { window.location.hash = 'complete'; });
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeVisible();
});
