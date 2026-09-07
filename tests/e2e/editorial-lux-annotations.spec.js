import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

/** Opens the exact preset and theme reported in the browser annotations. */
async function openAnnotations(page, mode) {
  await page.setViewportSize({ width: 1115, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'editorial-luxe');
  await page.selectOption('#themeSelect', 'heritage-brass');
  await page.selectOption('#modeSelect', mode);
}

for (const mode of ['light', 'dark']) {
  test(`Editorial Lux annotation fixes in ${mode}`, async ({ page }) => {
    await openAnnotations(page, mode);
    for (const select of await page.locator('.demo-controls select').all()) {
      await expect.soft(select).toHaveCSS('appearance', 'auto');
      await expect.soft(select).toHaveCSS('background-image', 'none');
    }
    const seal = page.locator('.luxe-badge-seal').first();
    await expect.soft(seal.locator('strong')).toHaveCSS('font-size', '28px');
    await expect.soft(seal.locator('small')).toHaveCSS('font-size', '12px');
    const mark = page.locator('#luxe-group-3 .luxe-check input:checked + .luxe-check-control');
    const check = await mark.evaluate((node) => {
      const style = getComputedStyle(node, '::after');
      return { content: style.content, width: style.width, height: style.height };
    });
    expect.soft(check).toEqual({ content: '""', width: '4px', height: '8px' });
    for (const variant of ['success', 'warning']) {
      const disk = page.locator(`.luxe-alert-${variant} .luxe-alert-mark`);
      const icon = disk.locator('svg');
      const a = await disk.boundingBox();
      const b = await icon.boundingBox();
      expect.soft(Math.abs(a.x + a.width / 2 - b.x - b.width / 2)).toBeLessThanOrEqual(0.5);
      expect.soft(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThanOrEqual(0.5);
    }
    await expect.soft(page.locator('.ui-badge').filter({ hasText: 'Review' })).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect.soft(page.locator('.luxe-alert-warning .luxe-alert-mark')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.locator('#luxe-group-6').screenshot({ path: path.join(os.tmpdir(), `luxe-annotations-${mode}.png`) });
  });
}

test('Editorial Lux engraved loaders share geometry and respect reduced motion', async ({ page }) => {
  await openAnnotations(page, 'light');
  const spinners = page.locator('.demo-control-showcase .luxe-spinner, .demo-control-showcase .luxe-loading-spinner, .demo-control-showcase .ui-spinner, .demo-control-showcase [data-loading-spinner]');
  expect(await spinners.count()).toBeGreaterThanOrEqual(4);
  for (const spinner of await spinners.all()) {
    const ring = await spinner.evaluate((node) => {
      const outer = getComputedStyle(node);
      const inner = getComputedStyle(node, '::before');
      return { outer: outer.animationName, inner: inner.animationName, content: inner.content };
    });
    expect.soft(ring).toEqual({ outer: 'luxe-spin', inner: 'luxe-counter-spin', content: '""' });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const spinner of await spinners.all()) {
    await expect.soft(spinner).toHaveCSS('animation-name', 'none');
    expect.soft(await spinner.evaluate((node) => getComputedStyle(node, '::before').animationName)).toBe('none');
  }
  await page.locator('.demo-control-showcase').screenshot({ path: path.join(os.tmpdir(), 'luxe-annotations-loaders.png') });
  await page.locator('.luxe-badge-seal').first().screenshot({ path: path.join(os.tmpdir(), 'luxe-annotations-seal.png') });
  await page.locator('#luxe-group-3').screenshot({ path: path.join(os.tmpdir(), 'luxe-annotations-checks.png') });
});

test('Editorial Lux light warning foregrounds retain readable contrast', async ({ page }) => {
  await openAnnotations(page, 'light');
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    for (const selector of ['.ui-badge[data-ui-variant="warning"]', '.luxe-alert-warning .luxe-alert-mark']) {
      const contrast = await page.locator(selector).evaluate((node) => {
        const ctx = document.createElement('canvas').getContext('2d');
        const luminance = (color) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => {
            const s = value / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          });
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const style = getComputedStyle(node);
        const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
      });
      expect(contrast, `${mode}: ${selector}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
