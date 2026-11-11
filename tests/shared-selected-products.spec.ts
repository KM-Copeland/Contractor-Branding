import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function sidebarGeometry(rail: import('@playwright/test').Locator) {
  return rail.evaluate(element => {
    const bounds = (target: Element) => {
      const rect = target.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    };
    const header = element.querySelector('header')!;
    const category = element.querySelector('[class*="groupHeading"]')!;
    const row = element.querySelector('[data-product-id]')!;
    return {
      title: bounds(header.querySelector('h2')!),
      count: bounds(header.querySelector('[role="status"]')!),
      headerBottom: bounds(header).bottom,
      category: bounds(category),
      row: bounds(row),
    };
  });
}

async function captureSidebar(page: import('@playwright/test').Page, rail: import('@playwright/test').Locator, geometry: Awaited<ReturnType<typeof sidebarGeometry>>, path: string) {
  const railBox = await rail.boundingBox();
  if (!railBox) throw new Error('Selected-products sidebar is not visible');
  await page.screenshot({ path, clip: {
    x: railBox.x,
    y: geometry.title.top - 12,
    width: railBox.width,
    height: geometry.row.bottom - geometry.title.top + 24,
  } });
}

async function expectRailPinnedWhileMainScrolls(page: import('@playwright/test').Page, rail: import('@playwright/test').Locator, mainContent: import('@playwright/test').Locator) {
  const railTop = (await rail.boundingBox())!.y;
  const contentTop = (await mainContent.boundingBox())!.y;
  const header = page.locator('header').first();
  const headerTop = (await header.boundingBox())!.y;
  const progress = page.getByRole('progressbar', { name: 'Setup progress' });
  const progressTop = (await progress.boundingBox())!.y;
  await expect(header).toHaveCSS('position', 'fixed');
  await expect(progress).toHaveCSS('position', 'static');
  await page.evaluate(() => window.scrollTo(0, 450));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  expect((await rail.boundingBox())!.y).toBe(railTop);
  expect((await header.boundingBox())!.y).toBe(headerTop);
  expect((await progress.boundingBox())!.y).toBe(progressTop);
  expect((await mainContent.boundingBox())!.y).toBeLessThan(contentTop - 100);
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('shared product rows reflect workflow branding and retain consistent geometry across steps', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 800 });
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();

  const stepOneRail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
  await expect(stepOneRail.locator(':scope > div')).toHaveCSS('padding-bottom', '40px');
  const stepOneRows = stepOneRail.getByRole('listitem');
  await expect(stepOneRows).toHaveCount(1);
  const firstRow = stepOneRows.filter({ has: page.getByRole('button', { name: 'Remove Sensi Smart', exact: true }) });
  expect(await firstRow.boundingBox()).toMatchObject({ width: 319, height: 90 });
  const stepOneStatus = firstRow.getByTestId('imprint-status-indicators');
  await expect(stepOneStatus).toHaveAttribute('data-muted', 'true');
  await expect(stepOneStatus).toHaveAttribute('aria-label', 'Logo Off, text Off');
  await expect(stepOneStatus.locator('button')).toHaveCount(0);
  await expect(stepOneStatus).toHaveCSS('opacity', '0.4');
  await expect(stepOneStatus.locator('[class*="statusIcon"] img').first()).toHaveCSS('width', '14px');
  const selectionNameStyle = await firstRow.locator('[class*="productName"]').evaluate(element => ({
    fontSize: getComputedStyle(element).fontSize,
    fontWeight: getComputedStyle(element).fontWeight,
    lineHeight: getComputedStyle(element).lineHeight,
  }));
  expect(selectionNameStyle).toEqual({ fontSize: '12px', fontWeight: '700', lineHeight: '16px' });
  await mkdir('docs/validation/shared-selected-products', { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  const singleStepOneGeometry = await sidebarGeometry(stepOneRail);
  expect(singleStepOneGeometry.category.top - singleStepOneGeometry.headerBottom).toBe(40);
  expect(singleStepOneGeometry.row.top - singleStepOneGeometry.category.bottom).toBe(20);
  await captureSidebar(page, stepOneRail, singleStepOneGeometry, 'docs/validation/shared-selected-products/step1-1920.png');
  await expectRailPinnedWhileMainScrolls(page, stepOneRail, page.locator('[class*="catalogColumn"]'));

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const stepTwoRail = page.locator('[data-testid="selected-products-rail"][data-mode="branding"]');
  await expect(stepTwoRail.locator(':scope > div')).toHaveCSS('padding-bottom', '40px');
  await page.evaluate(() => window.scrollTo(0, 0));
  const stepTwoRow = stepTwoRail.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Sensi Smart', exact: true }) });
  expect(await stepTwoRow.boundingBox()).toMatchObject({ width: 319, height: 90 });
  await expect(stepTwoRow.getByTestId('imprint-status-indicators')).toHaveAttribute('aria-label', 'Logo Off, text Off');
  const reviewNameStyle = await stepTwoRow.locator('[class*="productName"]').evaluate(element => ({
    fontSize: getComputedStyle(element).fontSize,
    fontWeight: getComputedStyle(element).fontWeight,
    lineHeight: getComputedStyle(element).lineHeight,
  }));
  expect(reviewNameStyle).toEqual(selectionNameStyle);
  const singleStepTwoGeometry = await sidebarGeometry(stepTwoRail);
  expect(singleStepTwoGeometry).toEqual(singleStepOneGeometry);
  await captureSidebar(page, stepTwoRail, singleStepTwoGeometry, 'docs/validation/shared-selected-products/step2-1920.png');
  await expectRailPinnedWhileMainScrolls(page, stepTwoRail, page.locator('[class*="primaryColumn"]'));
  await page.getByRole('textbox', { name: 'Line 1' }).fill('Contractor test');
  await page.getByRole('switch', { name: 'Text imprint' }).click();
  await expect(stepTwoRow.getByTestId('imprint-status-indicators')).toHaveAttribute('aria-label', 'Logo Off, text On');

  await page.goBack();
  const returnedRail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
  const returnedStatus = returnedRail.getByRole('listitem').filter({ has: page.getByRole('button', { name: 'Remove Sensi Smart', exact: true }) }).getByTestId('imprint-status-indicators');
  await expect(returnedStatus).toHaveAttribute('data-muted', 'true');
  await expect(returnedStatus).toHaveAttribute('aria-label', 'Logo Off, text On');
  for (const name of ['80 Series', 'Sensi Equipment Interface Module']) await page.getByRole('checkbox', { name, exact: true }).check();
  await page.evaluate(() => window.scrollTo(0, 0));
  const multipleStepOneGeometry = await sidebarGeometry(returnedRail);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const multipleStepTwoRail = page.locator('[data-testid="selected-products-rail"][data-mode="branding"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await sidebarGeometry(multipleStepTwoRail)).toEqual(multipleStepOneGeometry);
  await multipleStepTwoRail.getByRole('button', { name: '80 Series', exact: true }).click();
  await expect(page.locator('[aria-labelledby="preview-heading"]')).toContainText('80 Series');
  const activeProductRow = multipleStepTwoRail.getByRole('listitem').filter({ has: page.getByRole('button', { name: '80 Series', exact: true }) });
  await expect(activeProductRow).toHaveClass(/activeRow/);
  await expect(activeProductRow).toHaveCSS('background-color', 'rgb(238, 242, 252)');
});

test('only the selected product groups scroll while the sidebar header and actions stay visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#select-products');
  const checkboxes = page.getByRole('checkbox');
  for (let index = 0; index < await checkboxes.count(); index += 1) await checkboxes.nth(index).check();
  await page.evaluate(() => window.scrollTo(0, 0));

  const verifyIndependentScroll = async (rail: import('@playwright/test').Locator) => {
    const groups = rail.locator('[data-selected-product-groups="true"]');
    const header = rail.getByRole('heading', { name: 'Selected products' });
    const continueButton = rail.getByRole('button', { name: 'Continue', exact: true });
    const initial = await Promise.all([header.boundingBox(), continueButton.boundingBox()]);
    const initialPageScroll = await page.evaluate(() => window.scrollY);
    const listFooterGap = await groups.evaluate(element => {
      const listBounds = element.getBoundingClientRect();
      const footerBounds = element.nextElementSibling!.getBoundingClientRect();
      return footerBounds.top - listBounds.bottom;
    });
    const dimensions = await groups.evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
    await groups.evaluate(element => { element.scrollTop = 400; });
    await expect.poll(() => groups.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    expect(await Promise.all([header.boundingBox(), continueButton.boundingBox()])).toEqual(initial);
    expect(await rail.evaluate(element => element.scrollTop)).toBe(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(initialPageScroll);
    return listFooterGap;
  };

  const selectionRail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
  const selectionListFooterGap = await verifyIndependentScroll(selectionRail);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const brandingRail = page.locator('[data-testid="selected-products-rail"][data-mode="branding"]');
  await expect(brandingRail.locator('[class*="actions"]')).toHaveCSS('margin-top', '0px');
  const brandingListFooterGap = await verifyIndependentScroll(brandingRail);
  expect(brandingListFooterGap).toBe(selectionListFooterGap);
});

test('keyboard removal restores focus to the remaining row and then the sidebar action fallback', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#select-products');
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('checkbox', { name: '80 Series', exact: true }).check();

  const rail = page.locator('[data-testid="selected-products-rail"][data-mode="selection"]');
  const actionRow = rail.locator('[data-sidebar-action-row]');
  await expect(actionRow).toHaveCSS('display', 'grid');
  await expect(actionRow).not.toHaveAttribute('class');

  const firstRemove = rail.getByRole('button', { name: 'Remove Sensi Smart', exact: true });
  await firstRemove.focus();
  await page.keyboard.press('Enter');
  await expect(rail.getByRole('button', { name: 'Remove 80 Series', exact: true })).toBeFocused();

  const lastRemove = rail.getByRole('button', { name: 'Remove 80 Series', exact: true });
  await lastRemove.focus();
  await page.keyboard.press('Enter');
  await expect(rail.getByRole('button', { name: 'Back to home', exact: true })).toBeFocused();
});
