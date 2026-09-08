import { test, expect } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

/**
 * Reads material properties without coupling density or content to the specimen layout.
 * @param {import('@playwright/test').Locator} locator Component under inspection.
 * @returns {Promise<Record<string, string>>} Rendered material properties.
 */
async function material(locator) {
  return locator.evaluate((node) => {
    const css = getComputedStyle(node);
    return Object.fromEntries(['backgroundImage', 'backgroundColor', 'boxShadow', 'clipPath', 'fontFamily', 'fontWeight', 'textShadow'].map((name) => [name, css[name]]));
  });
}

test('Clay sheet and public components share one molded material and crisp text', async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  await page.selectOption('#uiSelect', 'clay');
  for (const mode of ['light', 'dark']) {
    await page.selectOption('#modeSelect', mode);
    const outside = page.locator('#components .clay-button-primary').first();
    const sheet = page.locator('#clay-buttons .clay-button-primary').first();
    const externalMaterial = await material(outside);
    expect(await material(sheet)).toEqual(externalMaterial);
    expect(externalMaterial.clipPath).toContain('polygon(');
    const sheetField = page.locator('#clay-field-search');
    expect(await material(sheetField)).toEqual(await material(page.locator('#components .clay-input').first()));
    expect(await material(page.locator('.clay-sheet .clay-tooltip'))).toEqual(await material(page.locator('#components .clay-tooltip').first()));
    await expect(sheetField).toHaveCSS('text-shadow', 'none');
    await expect(page.locator('.clay-tab-panel p').first()).toHaveCSS('text-shadow', 'none');
    await expect(page.locator('#clay-table td').first()).toHaveCSS('text-shadow', 'none');
    await expect(page.locator('.clay-reference-section').first()).toHaveCSS('box-shadow', 'none');
    await expect(page.locator('.clay-reference-section').first()).toHaveCSS('border-radius', '0px');
    await page.keyboard.press('Tab');
    await sheet.focus();
    expect((await material(sheet)).boxShadow).not.toBe(externalMaterial.boxShadow);
    await sheet.evaluate((node) => node.blur());
    await outside.hover();
    const outsideHover = await material(outside);
    await sheet.hover();
    const hovered = await material(sheet);
    expect(hovered).toEqual(outsideHover);
    await page.mouse.down();
    expect((await material(sheet)).boxShadow).not.toBe(hovered.boxShadow);
    await page.mouse.up();
    await page.mouse.move(0, 0);
  }
});

test('Clay unified material remains readable and contained on desktop and mobile', async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'clay');
  for (const [theme, mode] of [['ocean-steel', 'light'], ['heritage-brass', 'dark']]) {
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
    await page.selectOption('#themeSelect', theme);
    await page.selectOption('#modeSelect', mode);
    await page.setViewportSize({ width: 1600, height: 1100 });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'hidden'; });
    await page.locator('.clay-sheet').screenshot({ path: path.join(os.tmpdir(), `clay-unified-${mode}.png`), animations: 'disabled' });
    await page.locator('#components .demo-control-showcase').screenshot({ path: path.join(os.tmpdir(), `clay-unified-controls-${mode}.png`), animations: 'disabled' });
    for (const width of [1115, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.locator('.clay-sheet').evaluate((node) => node.scrollWidth - node.clientWidth), `${mode} at ${width}`).toBeLessThanOrEqual(2);
    }
    await page.locator('#clay-buttons').screenshot({ path: path.join(os.tmpdir(), `clay-unified-mobile-${mode}.png`), animations: 'disabled' });
  }
});
