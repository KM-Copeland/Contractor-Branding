import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const selectedProducts = [
  'Sensi Smart',
  '80 Series',
  '70 Series',
  '70/80 series, Sensi Smart',
  'Sensi Touch 2, Sensi Lite',
  'Sensi Equipment Interface Module',
];

async function waitForVisualStability(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
  });
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
}

async function capture(page: Page, name: string) {
  await waitForVisualStability(page);
  await page.screenshot({ path: `docs/validation/step2-pass2/prototype-${name}.png` });
}

async function enterSixProductScenario(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#select-products');
  for (const name of selectedProducts) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByText('1 of 6')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sensi Smart', exact: true })).toHaveAttribute('aria-current', 'true');
}

async function addReferenceImprint(page: Page) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="white"/><circle cx="300" cy="300" r="230" fill="#14883e"/><text x="300" y="330" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="78" font-weight="700">TEST</text></svg>';
  await page.locator('input[type=file]').setInputFiles({ name: 'test-logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await page.getByRole('textbox', { name: 'Line 1' }).fill('This is an example');
  await page.getByRole('textbox', { name: 'Line 2' }).fill('Placeholder text for context');
  await expect(page.getByRole('button', { name: 'Remove logo' })).toBeVisible();
}

test('Step 2 wide-desktop states match the current Figma scenarios and preserve active-product behavior', async ({ page }) => {
  await enterSixProductScenario(page);
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    return {
      form: rect('section[aria-labelledby="imprint-heading"]'),
      preview: rect('section[aria-labelledby="preview-heading"]'),
      rail: rect('aside[aria-label="Selected products"]'),
      artboard: rect('[data-testid="preview-artboard"]'),
      activeProduct: rect('[data-mode="branding"] [data-product-id="sensi-smart"]'),
    };
  });
  expect(geometry.form.x).toBeCloseTo(50, 0);
  expect(Math.abs(geometry.form.width - 447) < 1).toBe(true);
  expect(geometry.form.height).toBeCloseTo(752, 0);
  expect(Math.abs(geometry.preview.x - 537) < 1).toBe(true);
  expect(Math.abs(geometry.preview.width - 933) < 1).toBe(true);
  expect(Math.abs(geometry.preview.height - 752) < 3).toBe(true);
  expect(geometry.rail.x).toBeCloseTo(1510, 0);
  expect(geometry.rail.width).toBeCloseTo(360, 0);
  expect(geometry.activeProduct.y).toBeCloseTo(205, 0);
  expect(geometry.activeProduct.height).toBeCloseTo(90, 0);
  expect(Math.abs(geometry.artboard.width - 693) < 3).toBe(true);
  await capture(page, 'no-imprint');

  await addReferenceImprint(page);
  await capture(page, 'imprint-details');

  const textSwitch = page.getByRole('switch', { name: 'Text imprint' });
  await textSwitch.click();
  await expect(page.getByTestId('brand-text-preview')).toBeVisible();
  await capture(page, 'text-preview');

  await page.getByRole('switch', { name: 'logo imprint' }).click();
  await expect(page.getByTestId('brand-logo-preview')).toBeVisible();
  await capture(page, 'text-logo-preview');

  await page.locator('[data-product-id="80-series"]').getByRole('button', { name: '80 Series', exact: true }).click();
  await expect(page.getByText('2 of 6')).toBeVisible();
  await expect(page.getByRole('button', { name: '80 Series', exact: true })).toHaveAttribute('aria-current', 'true');
  await page.getByRole('button', { name: 'Next product' }).click();
  await expect(page.getByText('3 of 6')).toBeVisible();
  await page.getByRole('button', { name: 'Previous product' }).click();
  await expect(page.getByText('2 of 6')).toBeVisible();
  await page.locator('[data-product-id="80-series"]').getByRole('button', { name: 'Remove 80 Series' }).click();
  await expect(page.getByRole('complementary', { name: 'Selected products' }).getByText('5 selected')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).toBeChecked();
});
