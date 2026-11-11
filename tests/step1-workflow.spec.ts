import { test, expect, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const fiveFamilies = ['Sensi Smart', '80 Series', '70/80 series, Sensi Smart', 'Sensi Touch 2, Sensi Lite', 'Sensi Equipment Interface Module'];

async function capture(page: Page, state: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(image => image.decode()));
  });
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  await mkdir('docs/validation/phase2', { recursive: true });
  await page.screenshot({ path: `docs/validation/phase2/${state}-1280.png`, fullPage: true });
  const geometry = await page.getByRole('complementary').evaluate(element => {
    const box = (node: Element) => { const r = node.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height }; };
    return { bounds:box(element), headings:Array.from(element.querySelectorAll('h3')).map(node=>({ text:node.textContent,...box(node),fontSize:getComputedStyle(node).fontSize })), images:Array.from(element.querySelectorAll('img')).map(node=>({ src:node.getAttribute('src'), loaded:node.complete && node.naturalWidth>0,...box(node) })) };
  });
  await writeFile(`docs/validation/phase2/${state}-geometry.json`, JSON.stringify(geometry,null,2));
}

test('captures the no, single, and multiple selection states', async ({ page }) => {
  await page.setViewportSize({ width:1280, height:900 });
  await page.goto('/#select-products');
  await capture(page, 'no-selection');
  await page.getByRole('checkbox', { name:'Sensi Smart', exact:true }).check();
  await expect(page.getByRole('complementary')).toContainText('1 selected');
  await capture(page, 'single-selection');
  for (const name of fiveFamilies.slice(1)) await page.getByRole('checkbox', { name, exact:true }).check();
  await expect(page.getByRole('complementary').getByRole('listitem')).toHaveCount(5);
  await capture(page, 'multiple-selection');
});

test('search and category filters compose while product selection remains reversible', async ({ page }) => {
  await page.goto('/#select-products');
  for (const [name,count] of [['Thermostats',11],['Wallplates',4],['Other',1],['All',16]] as const) {
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('checkbox')).toHaveCount(count);
  }
  await page.getByRole('button',{name:'Thermostats',exact:true}).click();
  await page.getByRole('searchbox').fill('  sEnSi  ');
  await expect(page.getByRole('checkbox')).toHaveCount(1);
  await page.getByRole('checkbox',{name:'Sensi Smart',exact:true}).check();
  await page.getByRole('searchbox').fill('no-such-family');
  await expect(page.getByRole('button',{name:'Reset search and filters'})).toBeVisible();
  await page.getByRole('button',{name:'Reset search and filters'}).click();
  await expect(page.getByRole('checkbox',{name:'Sensi Smart',exact:true})).toBeChecked();
  await page.getByRole('checkbox',{name:'Sensi Smart',exact:true}).uncheck();
  await expect(page.getByRole('complementary')).toContainText('0 selected');
});

test('browser Back and Forward preserve the product selection and discovery state', async ({ page }) => {
  await page.goto('/#select-products');
  for (const name of fiveFamilies) await page.getByRole('checkbox',{name,exact:true}).check();
  await page.getByRole('button',{name:'Wallplates',exact:true}).click();
  await page.getByRole('searchbox').fill('touch');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page).toHaveURL(/#brand-review$/);
  await expect(page.getByRole('complementary')).toContainText('5 selected');
  await page.goBack();
  await expect(page.getByRole('searchbox')).toHaveValue('touch');
  await expect(page.getByRole('button',{name:'Wallplates',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.goForward();
  await expect(page.getByRole('heading',{name:'Create your imprint'})).toBeVisible();
  await page.goBack();
  await page.setViewportSize({ width:900, height:900 });
  for (const checkbox of await page.getByRole('checkbox',{checked:true}).all()) await checkbox.uncheck();
  await page.getByRole('button',{name:'Back to home'}).click();
  await expect(page).toHaveURL(/#home$/);
  await expect(page.getByRole('heading',{name:'Make your mark on every install.'})).toBeVisible();
});

test('responsive footer and progress stay fixed and full-width without a selection drawer', async ({ page }) => {
  for (const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1140},{width:1024,height:768},{width:1279,height:800}]) {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    const progress = page.getByRole('progressbar');
    const before = await progress.boundingBox();
    expect(before).not.toBeNull();
    expect(before!.x).toBe(0);
    expect(before!.y).toBe(50);
    expect(before!.width).toBe(viewport.width);
    expect(before!.height).toBe(4);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const after = await progress.boundingBox();
    expect(after?.y).toBe(50);
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'View selected products'})).toHaveCount(0);
    const footer = page.getByTestId('step1-action-footer');
    await expect(footer).toHaveCSS('position','fixed');
    const footerBox = await footer.boundingBox();
    expect(footerBox?.y! + footerBox?.height!).toBe(viewport.height);
    for (const checkbox of await page.getByRole('checkbox',{checked:true}).all()) await checkbox.uncheck();
    await expect(footer.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
    await page.getByRole('checkbox',{name:'Sensi Smart',exact:true}).check();
    await expect(footer.getByRole('button',{name:'Continue',exact:true})).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  }
});

test('an empty direct progression URL safely returns to Step 1', async ({ page }) => {
  await page.goto('/#selection-ready');
  await expect(page).toHaveURL(/#select-products$/);
  await expect(page.getByRole('heading',{name:'Choose products'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
});
