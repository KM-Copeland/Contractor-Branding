import { test, expect } from '@playwright/test';

test('Step 1 and Step 2 share a full-width sticky progress track and responsive action footer', async ({ page }) => {
  for (const viewport of [{width:390,height:844},{width:768,height:1140},{width:1024,height:768}]) {
    await page.setViewportSize(viewport);
    await page.goto('/#select-products');
    await page.getByRole('checkbox',{name:'Sensi Smart',exact:true}).check();
    const step1 = page.getByRole('progressbar');
    const initial = await step1.boundingBox();
    expect(initial).toMatchObject({x:0,y:50,width:viewport.width,height:4});
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Create your imprint'})).toBeVisible();
    const step2 = page.getByRole('progressbar');
    const progress = await step2.boundingBox();
    expect(progress).toMatchObject({x:0,y:50,width:viewport.width,height:4});
    await expect(page.locator('[data-selection-drawer]')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'View selected products'})).toHaveCount(0);
    const footer = page.getByTestId('step2-action-footer');
    await expect(footer).toHaveCSS('position','fixed');
    const footerBox = await footer.boundingBox();
    expect(footerBox?.y! + footerBox?.height!).toBe(viewport.height);
    const beforeScroll = await step2.boundingBox();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect((await step2.boundingBox())?.y).toBe(beforeScroll?.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.getByRole('button',{name:'Back to products'}).click();
    await expect(page.getByRole('checkbox',{name:'Sensi Smart',exact:true})).toBeChecked();
  }
});
