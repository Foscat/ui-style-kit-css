import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

/** Opens the annotated Neo Noir surface without changing other preset fixtures. */
async function openAnnotations(page, mode = 'light', width = 1115) {
  await page.setViewportSize({ width, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'neo-noir');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', mode);
}

test('Neo Noir annotation geometry and directional tooltips', async ({ page }) => {
  await openAnnotations(page);
  const service = page.locator('.noir-card-service > .noir-icon-medallion');
  await expect.soft(service).toHaveCSS('width', '60px');
  await expect.soft(service).toHaveCSS('height', '60px');
  await expect.soft(service).toHaveCSS('font-size', '28px');
  const medallion = page.locator('.noir-callout-bar > .noir-icon-medallion');
  await expect.soft(medallion.locator('svg')).toHaveCount(1);
  if (await medallion.locator('svg').count()) {
    const outer = await medallion.boundingBox();
    const inner = await medallion.locator('svg').boundingBox();
    expect.soft(outer.width).toBe(72);
    expect.soft(outer.height).toBe(72);
    expect.soft(Math.abs(outer.y + outer.height / 2 - inner.y - inner.height / 2)).toBeLessThan(0.5);
    expect.soft(Math.abs(outer.x + outer.width / 2 - inner.x - inner.width / 2)).toBeLessThan(0.5);
  }
  const seal = page.locator('.noir-badge-seal').first();
  await expect.soft(seal).toHaveCSS('width', '80px');
  await expect.soft(seal.locator('strong')).toHaveCSS('font-size', '28px');
  await expect.soft(seal.locator('small')).toHaveCSS('font-size', '13px');
  for (const direction of ['top', 'right', 'bottom']) {
    const tip = page.locator(`.demo-tooltip-row .noir-tooltip-${direction}`);
    const pointer = await tip.evaluate((node) => {
      const s = getComputedStyle(node, '::after');
      return { display: s.display, position: s.position, top: s.top, left: s.left, bottom: s.bottom };
    });
    expect.soft(pointer.display).toBe('block');
    expect.soft(pointer.position).toBe('absolute');
    expect.soft(pointer[direction === 'top' ? 'bottom' : direction === 'right' ? 'left' : 'top']).toBe('-5px');
    await expect.soft(tip.locator('.noir-tooltip-arrow')).toHaveCSS('display', 'none');
  }
});

test('Neo Noir aperture loaders animate inside stable bounds and stop for reduced motion', async ({ page }) => {
  await openAnnotations(page);
  const loaders = page.locator('.demo-control-showcase .noir-spinner, .demo-control-showcase .ui-spinner');
  expect(await loaders.count()).toBeGreaterThanOrEqual(4);
  for (const loader of await loaders.all()) {
    await expect.soft(loader).toHaveCSS('animation-name', 'none');
    const blade = await loader.evaluate((node) => {
      const s = getComputedStyle(node, '::before');
      return { content: s.content, animation: s.animationName, background: s.backgroundImage };
    });
    expect.soft(blade.content).toBe('""');
    expect.soft(blade.animation).toBe('noir-spin');
    expect.soft(blade.background).toContain('conic-gradient');
  }
  await expect(page.locator('.noir-spinner-lg').first()).toHaveCSS('width', '48px');
  const blade = page.locator('.noir-spinner-lg').first();
  const initial = await blade.evaluate((node) => getComputedStyle(node, '::before').transform);
  await page.waitForTimeout(180);
  expect(await blade.evaluate((node) => getComputedStyle(node, '::before').transform)).not.toBe(initial);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const loader of await loaders.all()) {
    expect(await loader.evaluate((node) => getComputedStyle(node, '::before').animationName)).toBe('none');
  }
});

test('Neo Noir annotation responsive visual evidence', async ({ page }) => {
  for (const [mode, width] of [['light', 1115], ['dark', 1115], ['light', 390]]) {
    await openAnnotations(page, mode, width);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addStyleTag({ content: '.demo-controls { position: static !important; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const [name, selector] of [['controls', '.demo-control-showcase'], ['marketing', '.noir-card-service'], ['seal', '.noir-feature-strip'], ['callout', '.noir-callout-bar']]) {
      await page.locator(selector).first().screenshot({ path: path.join(os.tmpdir(), `noir-annotations-${name}-${mode}-${width}.png`) });
    }
  }
});
