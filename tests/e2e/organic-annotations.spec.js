import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Page} page Isolated local demo. @returns {Promise<void>} */
async function openOrganic(page) {
  await page.goto(pathToFileURL(path.resolve('demo/index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'organic-modern');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.setViewportSize({ width: 1115, height: 792 });
  await page.evaluate(() => document.fonts.ready);
}

test('Organic annotations share a leaf loader and center marketing details', async ({ page }) => {
  await openOrganic(page);
  const leaf = page.locator('.demo-control-showcase .organic-spinner-lg');
  const mask = await leaf.evaluate((node) => getComputedStyle(node).maskImage);
  expect(mask).toContain('data:image/svg+xml');
  expect(await leaf.evaluate((node) => getComputedStyle(node).animationName)).toBe('organic-leaf-sway');
  const busy = page.locator('.demo-state-grid .organic-button[aria-busy="true"]');
  expect(await busy.evaluate((node) => getComputedStyle(node, '::after').maskImage)).toBe(mask);
  await expect(page.locator('#uiSelect')).toHaveCSS('appearance', 'none');
  for (const [selector, size] of [['.organic-card-service > .organic-icon-medallion', 36], ['.organic-callout-bar > .organic-icon-medallion', 32], ['.organic-feature-item > .organic-icon-medallion', 32]]) {
    const svg = page.locator(`${selector} > svg`).first();
    await expect(svg).toHaveCount(1);
    const bounds = await svg.evaluate((node) => {
      const a = node.getBoundingClientRect();
      const b = node.parentElement.getBoundingClientRect();
      return { x: Math.abs(a.x + a.width / 2 - b.x - b.width / 2), y: Math.abs(a.y + a.height / 2 - b.y - b.height / 2), width: a.width };
    });
    expect(bounds.x).toBeLessThanOrEqual(1);
    expect(bounds.y).toBeLessThanOrEqual(1);
    expect(bounds.width).toBeGreaterThanOrEqual(size);
  }
  await expect(page.locator('.organic-feature-strip .organic-badge-seal strong')).toHaveCSS('font-size', '30px');
  await expect(page.locator('.organic-feature-strip .organic-badge-seal small')).toHaveCSS('font-size', '14px');
  const outline = page.locator('.organic-callout-bar .organic-button-outline-heavy');
  for (const hover of [false, true]) {
    if (hover) await outline.hover();
    const edges = await outline.evaluate((node) => {
      const css = getComputedStyle(node);
      return [css.borderTopColor, css.borderRightColor, css.borderBottomColor, css.borderLeftColor];
    });
    expect(new Set(edges).size).toBe(1);
    await expect(outline).toHaveCSS('background-image', 'none');
    await expect(outline).toHaveCSS('clip-path', 'none');
  }
  await expect(page.locator('#semantic-runtime .ui-table th').first()).toHaveCSS('font-family', /Organic DM Sans/);
  await expect(page.locator('#semantic-runtime .ui-table th').first()).toHaveCSS('background-color', 'rgb(223, 231, 246)');
  await expect(page.locator('#semantic-runtime .ui-table caption')).toHaveCSS('text-align', 'left');
});

test('Organic annotation surfaces preserve motion preferences and responsive theme geometry', async ({ page }) => {
  await openOrganic(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
    await page.selectOption('#modeSelect', mode);
    await page.setViewportSize({ width: 1115, height: 792 });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'hidden'; });
    const leaf = page.locator('.demo-control-showcase .organic-spinner-lg');
    await expect(leaf).toHaveCSS('animation-name', 'none');
    expect(await page.locator('.demo-state-grid .organic-button[aria-busy="true"]').evaluate((node) => getComputedStyle(node, '::after').animationName)).toBe('none');
    for (const [name, selector] of [['loader', '.demo-control-showcase .demo-button-row:has(.organic-spinner-lg)'], ['busy', '.demo-state-grid .organic-button[aria-busy="true"]'], ['features', '.organic-feature-strip'], ['callout', '.organic-callout-bar'], ['table', '#semantic-runtime .ui-table-wrap']]) {
      await page.locator(selector).first().screenshot({ path: `.tmp/organic-annotations-${name}-${mode}.png` });
    }
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const selector of ['.organic-feature-strip', '.organic-callout-bar', '#semantic-runtime .ui-table-wrap']) {
        expect(await page.locator(selector).evaluate((node) => node.scrollWidth - node.clientWidth), selector).toBeLessThanOrEqual(2);
      }
    }
  }
});
