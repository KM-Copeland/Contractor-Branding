import { test, expect } from '@playwright/test';

const viewports = [
  { width: 390, height: 844, heightCss: '4px' },
  { width: 768, height: 1140, heightCss: '4px' },
  { width: 1279, height: 800, heightCss: '4px' },
  { width: 1280, height: 900, heightCss: '8px' },
  { width: 1440, height: 900, heightCss: '8px' },
  { width: 1920, height: 1080, heightCss: '8px' },
];

test('progress semantic colors preserve geometry and accessible stage reporting', async ({ browser }) => {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
    await page.goto('/#select-products');
    const progress = page.getByRole('progressbar', { name: 'Setup progress' });
    const fill = progress.locator('span');
    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '100');
    await expect(progress).toHaveAttribute('aria-valuenow', viewport.width < 1280 ? '33.333' : '32');
    await expect(progress).toHaveCSS('background-color', 'rgb(222, 228, 237)');
    await expect(fill).toHaveCSS('background-color', 'rgb(49, 85, 164)');
    await expect(progress).toHaveCSS('height', viewport.heightCss);
    await expect(progress).toHaveCSS('animation-name', 'none');
    await expect(fill).toHaveCSS('transition-duration', '0s');
    const initialTrack = await progress.boundingBox();
    const initialFill = await fill.boundingBox();

    await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page).toHaveURL(/#brand-review$/);
    await expect(progress).toHaveAttribute('aria-valuenow', viewport.width < 1280 ? '35' : '58');
    await expect(progress).toHaveCSS('background-color', 'rgb(222, 228, 237)');
    await expect(fill).toHaveCSS('background-color', 'rgb(49, 85, 164)');
    const stepTwoTrack = await progress.boundingBox();
    expect(stepTwoTrack).toEqual(initialTrack);
    expect((await fill.boundingBox())!.width).toBeGreaterThan(initialFill!.width);

    await page.getByRole('textbox', { name: 'Line 1' }).fill('Configured');
    if (viewport.width < 1280) {
      await expect(page.getByRole('textbox', { name: 'Line 1' })).toHaveValue('Configured');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      const card = page.getByTestId('configuration-card-sensi-smart');
      const textButton = card.getByRole('button', { name: 'Text', exact: true });
      await expect(textButton).toBeEnabled();
      await textButton.click();
      await expect(card, `Sensi Smart should be configured at ${viewport.width}px`).toHaveAttribute('data-configured', 'true');
    } else {
      const textSwitch = page.getByRole('switch', { name: 'Text imprint' });
      await textSwitch.click();
      await expect(textSwitch).toHaveAttribute('aria-checked', 'true');
    }
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    await expect(continueButton, `Continue should be enabled at ${viewport.width}px`).toBeEnabled();
    await continueButton.click();
    await expect(page).toHaveURL(/#complete$/);
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(progress).toHaveCSS('animation-name', 'none');
    await expect(progress).toHaveCSS('height', viewport.heightCss);
    } finally {
      await context.close();
    }
  }
});

test('progress fill transition and breathing animation retain their motion contract', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#select-products');
  const progress = page.getByRole('progressbar', { name: 'Setup progress' });
  const fill = progress.locator('span');
  await expect(progress).toHaveAttribute('data-ready', 'true');

  const motion = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]')!;
    const fillElement = track.querySelector('span')!;
    const trackStyle = getComputedStyle(track);
    const fillStyle = getComputedStyle(fillElement);
    const keyframes: Array<{ name: string; stops: Array<{ key: string; color: string }> }> = [];
    const visit = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule && rule.name.includes('remaining-track-breathe')) {
          keyframes.push({
            name: rule.name,
            stops: Array.from(rule.cssRules).map(stop => {
              const keyframe = stop as CSSKeyframeRule;
              return { key: keyframe.keyText, color: keyframe.style.backgroundColor };
            }),
          });
        } else if ('cssRules' in rule) visit((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try { visit(sheet.cssRules); } catch { /* ignore inaccessible third-party sheets */ }
    }
    return {
      transitionDuration: fillStyle.transitionDuration,
      transitionTimingFunction: fillStyle.transitionTimingFunction,
      transitionProperty: fillStyle.transitionProperty,
      animationDuration: trackStyle.animationDuration,
      animationTimingFunction: trackStyle.animationTimingFunction,
      animationIterationCount: trackStyle.animationIterationCount,
      animationName: trackStyle.animationName,
      keyframes,
    };
  });
  expect(motion.transitionDuration).toBe('0.42s');
  expect(motion.transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  expect(motion.transitionProperty).toBe('width');
  expect(motion.animationDuration).toBe('4s');
  expect(motion.animationTimingFunction).toBe('ease-in-out');
  expect(motion.animationIterationCount).toBe('infinite');
  expect(motion.animationName).toContain('remaining-track-breathe');
  expect(motion.keyframes).toHaveLength(1);
  expect(motion.keyframes[0].stops).toEqual([
    { key: '0%, 100%', color: 'var(--color-progress-track)' },
    { key: '50%', color: 'var(--color-progress-track-breathe)' },
  ]);
  const tokenColors = await page.evaluate(() => {
    const tokens = getComputedStyle(document.documentElement);
    return {
      track: tokens.getPropertyValue('--color-progress-track').trim(),
      fill: tokens.getPropertyValue('--color-progress-fill').trim(),
      breathe: tokens.getPropertyValue('--color-progress-track-breathe').trim(),
    };
  });
  expect(tokenColors).toEqual({ track: '#dee4ed', fill: '#3155a4', breathe: '#e7e9ed' });

  const sampleColors = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]')!;
    const animation = track.getAnimations().find(candidate => candidate instanceof CSSAnimation && candidate.animationName.includes('remaining-track-breathe')) as CSSAnimation;
    animation.pause();
    animation.currentTime = 0;
    const start = getComputedStyle(track).backgroundColor;
    animation.currentTime = 2000;
    const midpoint = getComputedStyle(track).backgroundColor;
    animation.cancel();
    return { start, midpoint };
  });
  expect(sampleColors).toEqual({ start: 'rgb(222, 228, 237)', midpoint: 'rgb(231, 233, 237)' });

  const initialWidth = (await fill.boundingBox())!.width;
  await page.getByRole('checkbox', { name: 'Sensi Smart', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '35');
  await page.waitForTimeout(180);
  const forwardWidth = (await fill.boundingBox())!.width;
  expect(forwardWidth).toBeGreaterThan(initialWidth);
  await expect.poll(async () => (await fill.boundingBox())!.width).toBeCloseTo(390 * .35, 0);

  await page.getByRole('button', { name: 'Back to products' }).click();
  await expect(page).toHaveURL(/#select-products$/);
  await page.waitForTimeout(180);
  expect((await fill.boundingBox())!.width).toBeLessThan(390 * .35);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(progress).toHaveCSS('animation-name', 'none');
  await expect(fill).toHaveCSS('transition-duration', '0s');
});
