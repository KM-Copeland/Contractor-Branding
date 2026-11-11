import { expect, test, type Page } from '@playwright/test';

const initialProducts = ['Sensi Smart', '80 Series', 'Blue Series 12 Inch Touch'];

async function enterStep2(page: Page, selected: string[] = initialProducts) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#select-products');
  for (const name of selected) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Configured sample');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
}

test('Continue requires every selected product to be configured in List and Preview', async ({ page }) => {
  await enterStep2(page);
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  await expect(continueButton).toBeDisabled();

  const configuredNames = ['Sensi Smart', '80 Series', 'Blue Series 12 Inch Touch'];
  const configuredIds = ['sensi-smart', '80-series', 'blue-12'];
  for (let index = 0; index < configuredNames.length; index++) {
    const card = page.getByTestId(`configuration-card-${configuredIds[index]}`);
    await card.getByRole('button', { name: 'Text', exact: true }).click();
    await expect(card).toHaveAttribute('data-configured', 'true');
    await expect(card.getByRole('img', { name: 'Configured' })).toBeVisible();
    if (index < configuredNames.length - 1) await expect(continueButton).toBeDisabled();
  }
  await expect(continueButton).toBeEnabled();

  // The active carousel item does not affect aggregate readiness.
  await page.getByRole('tab', { name: 'Preview' }).click();
  await expect(continueButton).toBeEnabled();
  await page.getByRole('button', { name: 'Show Blue Series 12 Inch Touch' }).click();
  await expect(page.getByRole('heading', { name: 'Blue Series 12 Inch Touch' })).toBeVisible();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Configured');
  await expect(continueButton).toBeEnabled();

  // Invalidating one configured product immediately disables progression.
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(page.getByTestId('product-configuration-status')).toHaveAttribute('alt', 'Not configured');
  await expect(continueButton).toBeDisabled();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(continueButton).toBeEnabled();

  // Adding an unconfigured product in Step 1 invalidates readiness; removing it restores readiness.
  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await page.getByRole('button', { name: 'Back to products' }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await page.getByRole('checkbox', { name: 'Classic 80 Series', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.locator('[data-step2-view="imprint"]')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByTestId('configuration-card-classic-80')).toHaveAttribute('data-configured', 'false');
  await expect(continueButton).toBeDisabled();

  await page.getByRole('button', { name: 'Back to imprint details' }).click();
  await page.getByRole('button', { name: 'Back to products' }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await page.getByRole('checkbox', { name: 'Classic 80 Series', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.locator('[data-step2-view="imprint"]')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(continueButton).toBeEnabled();
});

test('direct navigation to completion is rejected while any selected product is unconfigured', async ({ page }) => {
  await enterStep2(page);
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  const firstCard = page.getByTestId('configuration-card-sensi-smart');
  await firstCard.getByRole('button', { name: 'Text', exact: true }).click();
  await expect(firstCard).toHaveAttribute('data-configured', 'true');
  await expect(continueButton).toBeDisabled();

  await page.evaluate(() => { window.location.hash = '#complete'; });
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.locator('[data-step2-view="configure"]')).toBeVisible();
  await expect(continueButton).toBeDisabled();
});
