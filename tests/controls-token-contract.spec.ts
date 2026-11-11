import { test, expect } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1140 },
  { width: 1280, height: 900 },
  { width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`shared controls retain their computed token styles at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    await page.evaluate(() => document.fonts.ready);

    const aliases = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries([
        '--color-action-primary', '--color-text-primary', '--color-surface-default',
        '--color-border-control', '--color-border-strong', '--color-focus-indicator',
      ].map(name => [name, style.getPropertyValue(name).trim()]));
    });
    expect(aliases).toEqual({
      '--color-action-primary': '#0c30cc',
      '--color-text-primary': '#2a2a26',
      '--color-surface-default': '#fff',
      '--color-border-control': '#c4ced1',
      '--color-border-strong': '#2a2a26',
      '--color-focus-indicator': '#0c30cc',
    });

    const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    await expect(continueButton).toBeDisabled();
    await expect(continueButton).toHaveCSS('background-color', 'rgba(12, 48, 204, 0.5)');
    await expect(continueButton).toHaveCSS('color', 'rgba(255, 255, 255, 0.5)');

    const backButton = page.getByRole('button', { name: 'Back to home' }).first();
    await expect(backButton).toHaveCSS('width', '48px');
    await expect(backButton).toHaveCSS('height', '48px');
    await expect(backButton).toHaveCSS('border-top-color', 'rgb(42, 42, 38)');
    await expect(backButton).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(backButton).toHaveCSS('color', 'rgb(42, 42, 38)');
    await backButton.hover();
    await expect(backButton).toHaveCSS('border-top-color', 'rgb(12, 48, 204)');
    await expect(backButton).toHaveCSS('color', 'rgb(12, 48, 204)');
    await backButton.evaluate(element => element.focus({ focusVisible: true } as unknown as FocusOptions));
    await expect(backButton).toHaveCSS('outline-color', 'rgb(12, 48, 204)');
    await expect(backButton).toHaveCSS('outline-width', '3px');

    const search = page.getByRole('searchbox', { name: 'Search product families' });
    const searchFrame = search.locator('xpath=..');
    await expect(searchFrame).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(search).toHaveCSS('color', 'rgb(42, 42, 38)');
    await search.evaluate(element => element.focus({ focusVisible: true } as unknown as FocusOptions));
    await expect(searchFrame).toHaveCSS('outline-color', 'rgb(12, 48, 204)');
    await expect(searchFrame).toHaveCSS('outline-width', '3px');

    const activePill = page.getByRole('button', { name: 'All', exact: true });
    await expect(activePill).toHaveAttribute('aria-pressed', 'true');
    await expect(activePill).toHaveCSS('color', 'rgb(12, 48, 204)');
    await expect(activePill).toHaveCSS('border-top-width', '1px');

    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await expect(continueButton).toBeEnabled();
    await expect(continueButton).toHaveCSS('background-color', 'rgb(12, 48, 204)');
    await expect(continueButton).toHaveCSS('color', 'rgb(255, 255, 255)');
    await continueButton.hover();
    await expect(continueButton).toHaveCSS('filter', 'brightness(0.94)');
  });
}
