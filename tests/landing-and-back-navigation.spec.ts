import { test, expect } from '@playwright/test';

test('root opens the Step 0 landing screen and starts a new imprint at Step 1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Make your mark on every install.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByRole('button', { name: /Start a new imprint/i }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
});

test('Step 1 back returns to Step 0 and preserves product selection', async ({ page }) => {
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page).toHaveURL(/#home$/);
  await page.getByRole('button', { name: /Start a new imprint/i }).click();
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).toBeChecked();
});

test('Step 2 back returns to Step 1 and preserves the workflow state', async ({ page }) => {
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Installer name');
  await page.getByRole('button', { name: 'Back to products' }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('Installer name');
});
