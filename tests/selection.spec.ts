import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('initial desktop loads exact fonts, assets and design geometry', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#select-products');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('checkbox')).toHaveCount(16);
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
  const fonts = await page.evaluate(() => [300,400,600,700].map(weight => ({ weight, loaded: document.fonts.check(weight + ' 16px Aileron') })));
  expect(fonts.every(font => font.loaded)).toBe(true);
  const images = await page.locator('img').evaluateAll(elements => elements.map(element => {
    const image = element as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    return { src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  }));
  expect(images.every(image => image.loaded && image.width > 0 && image.height > 0)).toBe(true);
  expect(images.every(image => image.src?.startsWith('/assets/'))).toBe(true);
  const columns = await page.getByRole('checkbox').first().evaluate(element => getComputedStyle(element.parentElement!.parentElement!).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(3);
  await expect(page.getByRole('complementary')).toBeVisible();
  expect(errors).toEqual([]);
  await mkdir('docs/validation', { recursive: true });
  await writeFile('docs/validation/rendered-assets.json', JSON.stringify({ fonts, images }, null, 2));
  await page.screenshot({ path: 'docs/validation/step1-browser-1280.png', fullPage: true });
});

test('search field fills the remaining filter-row width beside category filters', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#select-products');
  const geometry = await page.getByRole('region', { name: 'Find product families' }).locator(':scope > div').evaluate(row => {
    const search = row.querySelector('input[type="search"]')!.parentElement!;
    const pills = row.querySelector('[role="group"]')!;
    const rowBox = row.getBoundingClientRect();
    const searchBox = search.getBoundingClientRect();
    const pillsBox = pills.getBoundingClientRect();
    return { rowRight: rowBox.right, searchWidth: searchBox.width, searchRight: searchBox.right, pillsLeft: pillsBox.left, pillsRight: pillsBox.right };
  });
  expect(geometry.searchWidth).toBeGreaterThan(700);
  expect(Math.abs(geometry.searchRight + 10 - geometry.pillsLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.rowRight - geometry.pillsRight)).toBeLessThanOrEqual(1);
});

test('selection survives filtering and search, with one derived count', async ({ page }) => {
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Wallplates', exact: true }).click();
  await expect(page.getByRole('checkbox')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Thermostats', exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByRole('complementary')).toContainText('1 selected');
  await page.getByRole('checkbox', { name: 'Sensi Touch Smart (white)', exact: true }).check();
  await expect(page.getByRole('complementary')).toContainText('2 selected');
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await expect(page.getByText('No products match your search.')).toBeVisible();
  await expect(page.getByRole('complementary')).toContainText('2 selected');
  await page.getByRole('searchbox').fill('  SMART  ');
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('searchbox').fill('');
  await expect(page.getByRole('checkbox', { name: 'Sensi Smart', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Sensi Touch Smart (white)', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Sensi Touch Smart (white)', exact: true }).uncheck();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
});

test('product cards communicate imprint capabilities without adding controls', async ({ page }) => {
  await page.goto('/#select-products');
  const combined = page.locator('[data-node-id="121:2829"]');
  await expect(combined.getByTestId('imprint-capability-indicator')).toHaveAttribute('data-layout', 'combined');
  await expect(page.locator('#imprint-capabilities-sensi-smart')).toHaveText('Supports logo and text together.');

  const series80 = page.locator('[data-node-id="121:2837"]');
  await expect(series80.getByTestId('imprint-capability-indicator')).toHaveAttribute('data-layout', 'combined');
  const module = page.locator('[data-node-id="137:939"]');
  await expect(module.getByTestId('imprint-capability-indicator')).toHaveAttribute('data-layout', 'combined');

  const exclusive = page.locator('[data-node-id="121:2845"]');
  await expect(exclusive.getByTestId('imprint-capability-indicator')).toHaveAttribute('data-layout', 'separate');
  await expect(exclusive.getByTestId('imprint-capability-indicator').locator('[data-capability]')).toHaveCount(2);
  await expect(page.locator('#imprint-capabilities-70-series')).toHaveText('Supports logo or text, one at a time.');

  const textOnly = page.locator('[data-node-id="121:2883"]');
  await expect(textOnly.getByTestId('imprint-capability-indicator')).toHaveAttribute('data-layout', 'text-only');
  await expect(textOnly.getByTestId('imprint-capability-indicator').locator('[data-capability="text"]')).toHaveCount(1);
  await expect(textOnly.getByTestId('imprint-capability-indicator').locator('[data-capability="logo"]')).toHaveCount(0);
  await expect(page.locator('#imprint-capabilities-blue-12')).toHaveText('Supports text only.');

  await expect(combined.getByRole('button')).toHaveCount(0);
  await combined.getByTestId('imprint-capability-indicator').click();
  await expect(combined.getByRole('checkbox')).toBeChecked();
});

test('keyboard selects cards and forward/back preserves focus and selection', async ({ page }) => {
  await page.goto('/#select-products');
  const product = page.getByRole('checkbox', { name: 'Sensi Smart', exact: true });
  await product.focus();
  await page.keyboard.press('Space');
  await expect(product).toBeChecked();
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  await continueButton.click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByRole('heading', { name: 'Create your imprint' })).toBeFocused();
  await expect(page.getByRole('complementary')).toContainText('Sensi Smart');
  await page.goBack();
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('heading', { name: 'Choose products' })).toBeFocused();
  await expect(product).toBeChecked();
});

for (const width of [1280, 1024, 820, 768, 767, 390, 375, 320]) {
  test('usable without horizontal overflow at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#select-products');
    await expect(page.getByRole('heading', { name: 'Choose products' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const categoryLabelsFit = await page.getByRole('group', { name: 'Product category' }).getByRole('button').evaluateAll(buttons => buttons.every(button => button.scrollWidth <= button.clientWidth));
    expect(categoryLabelsFit).toBe(true);
    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    if (width < 1280) await expect(page.getByTestId('step1-action-footer')).toBeVisible();
    else await expect(page.getByRole('complementary')).toContainText('1 selected');
    const columns = await page.getByRole('checkbox').first().evaluate(element => getComputedStyle(element.parentElement!.parentElement!).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 768 ? 3 : 2);
    const layouts = await page.getByTestId('product-card-footer').evaluateAll(footers => footers.map(footer => {
      const name = footer.querySelector('[data-testid="product-name"]')!.getBoundingClientRect();
      const card = footer.parentElement!;
      const cardBounds = card.getBoundingClientRect();
      const indicator = card.querySelector('[data-testid="imprint-capability-indicator"]')!.getBoundingClientRect();
      const checkmark = card.querySelector('[data-testid="product-selection-checkmark"]')!.getBoundingClientRect();
      const iconSizes = Array.from(card.querySelectorAll<HTMLElement>('[data-imprint-icon]')).map(icon => getComputedStyle(icon).height);
      return {
        titleUsesFullWidth: Math.abs(name.width - footer.getBoundingClientRect().width) < 1,
        badgeTop: Math.round(indicator.top - cardBounds.top),
        badgeRight: Math.round(cardBounds.right - indicator.right),
        badgeHeight: Math.round(indicator.height),
        checkmarkLeft: Math.round(checkmark.left - cardBounds.left),
        iconSizes,
      };
    }));
    expect(layouts.every(layout => layout.titleUsesFullWidth && layout.badgeTop === 10 && layout.badgeRight === 10 && layout.badgeHeight === 20 && layout.checkmarkLeft === 10 && layout.iconSizes.length > 0 && layout.iconSizes.every(size => size === '12px'))).toBe(true);
    await page.screenshot({ path: 'docs/validation/step1-' + width + '.png', fullPage: true });
  });
}

test('compact empty selection keeps the responsive actions without the desktop products rail', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#select-products');
  const rail = page.getByTestId('selected-products-rail');
  await expect(rail).toBeHidden();
  await expect(page.getByRole('button', { name: 'Back to home' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'View selected products' })).toHaveCount(0);
  await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('responsive shell keeps the rail transition and progress aligned to the page gutter', async ({ page }) => {
  for (const width of [390, 768, 1024, 1279, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#select-products');
    const layout = await page.evaluate(() => {
      const progress = document.querySelector('[role="progressbar"]')!.getBoundingClientRect();
      const railElement = document.querySelector('aside[data-mode="selection"]')!;
      const rail = railElement.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Main navigation"]')!;
      const menu = document.querySelector('button[aria-label="Open menu"]')!;
      const headingTop = document.querySelector('main#main h1')!.getBoundingClientRect().top;
      return {
        progressX: Math.round(progress.x), progressWidth: Math.round(progress.width),
        railX: Math.round(rail.x), railWidth: Math.round(rail.width), railDisplay: getComputedStyle(railElement).display,
        navVisible: getComputedStyle(nav).display !== 'none',
        menuVisible: getComputedStyle(menu).display !== 'none',
        headingTop,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    expect(layout.documentWidth).toBe(width);
    expect(layout.headingTop).toBeCloseTo(width < 1280 ? 74 : 90, 0);
    if (width < 1280) {
      expect(layout.progressX).toBe(0);
      expect(layout.progressWidth).toBe(width);
      expect(layout.railDisplay).toBe('none');
      expect(layout.navVisible).toBe(false);
      expect(layout.menuVisible).toBe(true);
    } else {
      expect(layout.progressX).toBe(0);
      expect(layout.progressWidth).toBe(width - 410);
      expect(layout.railX).toBe(width - 410);
      expect(layout.railWidth).toBe(360);
      expect(layout.navVisible).toBe(true);
      expect(layout.menuVisible).toBe(false);
      expect(layout.headingTop).toBeCloseTo(90, 0);
    }
  }
});

test('fixed responsive actions do not cover the final catalog or the new Step 2 views', async ({ page }) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1140 });
    await page.goto('/#select-products');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    let content = await page.locator('label[data-node-id]').last().boundingBox();
    let actions = await page.locator('[data-testid="step1-action-footer"]').boundingBox();
    expect(content).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(content!.y + content!.height).toBeLessThanOrEqual(actions!.y);

    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('heading', { name: 'Create your imprint' }).waitFor();
    await page.getByRole('textbox', { name: 'Line 1' }).fill('Footer clearance');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    content = await page.locator('[data-testid^="configuration-card-"]').last().boundingBox();
    actions = await page.locator('[data-testid="step2-action-footer"]').boundingBox();
    expect(content).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(content!.y + content!.height).toBeLessThanOrEqual(actions!.y);
    await page.getByRole('tab', { name: 'Preview' }).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    content = await page.getByTestId('preview-artboard').boundingBox();
    actions = await page.locator('[data-testid="step2-action-footer"]').boundingBox();
    expect(content).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(content!.y + content!.height).toBeLessThanOrEqual(actions!.y);
  }
});

test('Step 1 matches wide desktop Figma geometry and captures comparison states', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 2127 });
  await page.goto('/#select-products');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode())); });
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector)!;
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    return { viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio }, progress: rect('[role="progressbar"]'), catalog: rect('[class*="catalogColumn"]'), sidebar: rect('aside[aria-labelledby="selection-heading"]'), card: rect('label[data-node-id="121:2829"]'), imageSlot: rect('label[data-node-id="121:2829"] [class*="imageSlot"]') };
  });
  expect(geometry.viewport).toEqual({ width: 1920, height: 2127, dpr: 1 });
  expect(geometry.card.width).toBe(340);
  expect(geometry.card.height).toBe(315);
  expect(geometry.card.y).toBe(344);
  expect(geometry.imageSlot).toEqual({ x: 70, y: 364, width: 300, height: 236 });
  expect(geometry.sidebar.x).toBe(1510);
  expect(geometry.sidebar.width).toBe(360);
  expect(geometry.sidebar.y).toBe(49);
  expect(geometry.progress).toEqual({ x: 0, y: 50, width: 1510, height: 8 });
  await mkdir('docs/validation/step1-pass1', { recursive: true });
  await writeFile('docs/validation/step1-pass1/geometry-1920.json', JSON.stringify(geometry, null, 2));
  await page.screenshot({ path: 'docs/validation/step1-pass1/no-selection-1920x2127.png' });

  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.setViewportSize({ width: 1920, height: 2113 });
  await page.screenshot({ path: 'docs/validation/step1-pass1/single-selection-1920x2113.png' });

  for (const name of ['80 Series', '70 Series', '70/80 series, Sensi Smart', 'Sensi Touch 2, Sensi Lite', 'Sensi Equipment Interface Module']) {
    await page.getByRole('checkbox', { name, exact: true }).check();
  }
  await page.setViewportSize({ width: 1920, height: 2127 });
  await page.screenshot({ path: 'docs/validation/step1-pass1/multiple-selection-1920x2127.png' });

  await page.getByRole('button', { name: 'Wallplates', exact: true }).click();
  await page.setViewportSize({ width: 1920, height: 1022 });
  await page.screenshot({ path: 'docs/validation/step1-pass1/filtered-1920x1022.png' });
});
