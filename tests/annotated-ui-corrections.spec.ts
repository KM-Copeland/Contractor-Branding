import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const selectedProducts = [
  'Sensi Smart',
  '80 Series',
  '70 Series',
  '70/80 series, Sensi Smart',
  'Sensi Touch 2, Sensi Lite',
  'Sensi Equipment Interface Module',
];

test('annotated corrections match Figma geometry at 1920px', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#select-products');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => undefined)));
  });
  for (const name of selectedProducts) await page.getByRole('checkbox', { name, exact: true }).check();
  await mkdir('docs/validation/annotated-ui-corrections', { recursive: true });

  const progress = page.getByRole('progressbar', { name: 'Setup progress' });
  const stepOneTrack = await progress.boundingBox();
  const stepOneFill = await progress.locator('span').boundingBox();
  expect(stepOneTrack).toMatchObject({ x: 0, width: 1510, height: 8 });
  expect(stepOneTrack!.x + stepOneTrack!.width).toBeCloseTo((await page.locator('aside[data-mode="selection"]').boundingBox())!.x, 0);
  expect(stepOneFill?.width).toBe(580);
  await progress.screenshot({ path: 'docs/validation/annotated-ui-corrections/step1-progress.png' });

  const combinedBadge = page.locator('[data-node-id="121:2829"] [data-testid="imprint-capability-indicator"]');
  expect(await combinedBadge.boundingBox()).toMatchObject({ width: 41, height: 20 });
  await expect(combinedBadge.locator('img')).toHaveCount(2);
  await expect(combinedBadge.locator('img').nth(0)).toHaveAttribute('src', /d644e\.svg$/);
  await expect(combinedBadge.locator('img').nth(1)).toHaveAttribute('src', /31876\.svg$/);
  await combinedBadge.screenshot({ path: 'docs/validation/annotated-ui-corrections/step1-capability-badge.png' });

  const separateBadge = page.locator('[data-node-id="121:2845"] [data-testid="imprint-capability-indicator"]');
  expect(await separateBadge.boundingBox()).toMatchObject({ width: 45, height: 20 });
  await expect(separateBadge.locator('img')).toHaveCount(2);
  const summaryRow = page.locator('aside[aria-labelledby="selection-heading"] li').first();
  expect(await summaryRow.boundingBox()).toMatchObject({ width: 319, height: 90 });
  await expect(summaryRow.locator('img').last()).toHaveAttribute('src', /2548b\.svg$/);
  await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toHaveCount(0);
  await summaryRow.screenshot({ path: 'docs/validation/annotated-ui-corrections/step1-selection-row.png' });

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByRole('progressbar', { name: 'Setup progress' })).toBeVisible();
  await expect.poll(async () => (await progress.locator('span').boundingBox())?.width ?? 0).toBeCloseTo(1035, 0);
  const stepTwoTrack = await progress.boundingBox();
  const stepTwoFill = await progress.locator('span').boundingBox();
  expect(stepTwoTrack).toMatchObject({ x: 0, width: 1510, height: 8 });
  expect(stepTwoTrack!.x + stepTwoTrack!.width).toBeCloseTo((await page.locator('aside[data-mode="branding"]').boundingBox())!.x, 0);
  expect(stepTwoFill?.width).toBeCloseTo(1035, 0);
  await progress.screenshot({ path: 'docs/validation/annotated-ui-corrections/step2-progress.png' });
  await expect(page.getByRole('button', { name: 'Previous product' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next product' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Expand|Collapse preview/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'EDIT PRODUCTS' })).toHaveCount(0);
  const activeRow = page.locator('[data-mode="branding"] [data-product-id="sensi-smart"]');
  await expect(activeRow.locator('[aria-current="true"]')).toBeVisible();
  await expect(activeRow.getByRole('button', { name: 'Remove Sensi Smart' })).toBeVisible();
  await activeRow.screenshot({ path: 'docs/validation/annotated-ui-corrections/step2-active-row.png' });
});
