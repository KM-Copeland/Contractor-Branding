import { test, expect } from '@playwright/test';

const viewports = [
  { width: 390, height: 844, padding: '20px' },
  { width: 768, height: 1140, padding: '32px' },
  { width: 1024, height: 768, padding: '32px' },
  { width: 1279, height: 800, padding: '32px' },
  { width: 1280, height: 900, padding: null },
  { width: 1920, height: 1080, padding: null },
];

test('responsive action footer keeps token colors and viewport geometry across breakpoints', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/#select-products');
    for (const selected of await page.getByRole('checkbox', { checked: true }).all()) await selected.uncheck();
    const footer = page.getByTestId('step1-action-footer');
    if (!viewport.padding) {
      await expect(footer).toBeHidden();
    } else {
      await expect(footer).toBeVisible();
      await expect(footer).toHaveCSS('position', 'fixed');
      await expect(footer).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(footer).toHaveCSS('border-top-color', 'rgb(222, 228, 237)');
      await expect(footer).toHaveCSS('padding-left', viewport.padding);
      await expect(footer).toHaveCSS('padding-right', viewport.padding);
      const footerBox = await footer.boundingBox();
      expect(footerBox?.x).toBe(0);
      expect(footerBox?.width).toBe(viewport.width);
      expect(footerBox?.y! + footerBox?.height!).toBe(viewport.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await expect(footer.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
      await expect(footer.getByRole('button', { name: 'Continue', exact: true })).toHaveCSS('height', '48px');
    }
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true }).first();
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await expect(page).toHaveURL(/#brand-review$/);
    const stepTwoFooter = page.getByTestId('step2-action-footer');
    if (!viewport.padding) {
      await expect(stepTwoFooter).toBeHidden();
      continue;
    }
    await expect(stepTwoFooter).toBeVisible();
    await expect(stepTwoFooter).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(stepTwoFooter).toHaveCSS('border-top-color', 'rgb(222, 228, 237)');
    const stepTwoBox = await stepTwoFooter.boundingBox();
    expect(stepTwoBox?.x).toBe(0);
    expect(stepTwoBox?.width).toBe(viewport.width);
    expect(stepTwoBox?.y! + stepTwoBox?.height!).toBe(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  }
});
