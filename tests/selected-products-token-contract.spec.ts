import { test, expect } from '@playwright/test';

const desktopViewports = [
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test('selected-product rows retain semantic colors and variants at desktop widths', async ({ page }) => {
  for (const viewport of desktopViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    const clearAll = page.getByRole('button', { name: 'Clear All' });
    if (await clearAll.isVisible()) await clearAll.click();
    let rail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
    const checkRowColor = async (id: string, expectedBackground: string, expectedBorder: string) => {
      const row = rail.locator(`[data-product-id="${id}"]`);
      await expect(row).toHaveCSS('background-color', expectedBackground);
      await expect(row).toHaveCSS('border-top-color', expectedBorder);
      await expect(row.locator('[class*="productName"]')).toHaveCSS('color', 'rgb(42, 42, 38)');
    };

    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await checkRowColor('sensi-smart', 'rgb(255, 255, 255)', 'rgb(222, 228, 237)');
    const mutedStatus = rail.locator('[data-product-id="sensi-smart"] [data-testid="imprint-status-indicators"]');
    await expect(mutedStatus).toHaveCSS('color', 'rgb(42, 42, 38)');
    await expect(mutedStatus).toHaveCSS('opacity', '0.4');
    await expect(rail.locator('[data-product-id="sensi-smart"] [data-product-remove]')).toBeVisible();

    for (const name of ['80 Series', '70/80 series, Sensi Smart', 'Sensi Equipment Interface Module']) {
      await page.getByRole('checkbox', { name, exact: true }).check();
    }
    await expect(rail.getByRole('listitem')).toHaveCount(4);
    await page.getByRole('button', { name: 'Remove 80 Series', exact: true }).click();
    await expect(rail.getByRole('listitem')).toHaveCount(3);
    await page.getByRole('checkbox', { name: '80 Series', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page).toHaveURL(/#brand-review$/);
    rail = page.locator('[data-testid="selected-products-rail"][data-mode="branding"]');

    const activeRow = rail.locator('[data-product-id="sensi-smart"]');
    await expect(activeRow).toHaveCSS('background-color', 'rgb(238, 242, 252)');
    await expect(activeRow).toHaveCSS('border-top-color', 'rgb(12, 48, 204)');
    await expect(activeRow.locator('[aria-label="Shown in preview"]')).toBeVisible();
    await checkRowColor('80-series', 'rgb(255, 255, 255)', 'rgb(222, 228, 237)');
    await expect(activeRow.locator('[data-testid="imprint-status-indicators"]')).toHaveCSS('opacity', '1');
  }
});

test('responsive selected-product desktop rails stay hidden without restoring a drawer', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1140 }, { width: 1279, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    const selectionRail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
    await expect(selectionRail).toBeHidden();
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'View selected products' })).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page).toHaveURL(/#brand-review$/);
    await expect(page.locator('[data-testid="selected-products-rail"][data-mode="branding"]')).toBeHidden();
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  }
});
