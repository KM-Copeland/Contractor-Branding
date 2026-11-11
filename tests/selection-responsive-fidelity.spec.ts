import { test, expect } from '@playwright/test';

test('responsive Step 1 retains the catalog, fixed workflow actions, and a full-width fixed progress track', async ({ page }) => {
  for (const viewport of [
    { width:320, height:568 }, { width:390, height:844 }, { width:600, height:800 },
    { width:768, height:1140 }, { width:1024, height:768 }, { width:1279, height:800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const { x, y, width, height, bottom } = element.getBoundingClientRect();
        return { x, y, width, height, bottom };
      };
      const firstCardCheckbox = document.querySelector('input[type="checkbox"]');
      const grid = firstCardCheckbox?.closest('label')?.parentElement;
      const footer = document.querySelector('[data-testid="step1-action-footer"]');
      return {
        width: document.documentElement.scrollWidth,
        progress: bounds('[role="progressbar"]'),
        heading: bounds('main h1'),
        card: bounds('label[data-selected]'),
        columns: grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0,
        footer: footer ? bounds('[data-testid="step1-action-footer"]') : null,
        footerPosition: footer ? getComputedStyle(footer).position : 'none',
        railDisplay: getComputedStyle(document.querySelector('aside[data-mode="selection"]')!).display,
      };
    });
    expect(layout.width).toBe(viewport.width);
    expect(layout.progress).toMatchObject({ x:0, y:50, width:viewport.width, height:4 });
    expect(layout.heading?.y).toBe(74);
    expect(layout.columns).toBe(viewport.width < 768 ? 2 : viewport.width <= 1100 ? 3 : 4);
    if (viewport.width < 1280) {
      expect(layout.railDisplay).toBe('none');
      expect(layout.footerPosition).toBe('fixed');
      expect(layout.footer?.bottom).toBe(viewport.height);
    }
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(16);
  }
});
