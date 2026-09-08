import { test, expect } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Page} page Isolated demo page. @returns {Promise<void>} */
async function openClay(page) {
  await page.goto(pathToFileURL(path.resolve('demo/index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'clay');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => document.fonts.ready);
}

test('Clay annotations retain molded surfaces and centered marks', async ({ page }) => {
  await openClay(page);
  await page.setViewportSize({ width: 1115, height: 792 });
  await expect.soft(page.locator('#uiSelect')).toHaveCSS('appearance', 'none');
  const checkbox = await page.locator('#clay-choices .clay-check-control').first().evaluate((node) => {
    const mark = getComputedStyle(node, '::after');
    return { content: mark.content, position: mark.position, left: mark.left, top: mark.top, width: node.clientWidth, height: node.clientHeight };
  });
  expect.soft(checkbox.content).toBe('""');
  expect.soft(checkbox.position).toBe('absolute');
  expect.soft(Math.abs(parseFloat(checkbox.left) - checkbox.width / 2)).toBeLessThan(1);
  expect.soft(Math.abs(parseFloat(checkbox.top) - checkbox.height / 2)).toBeLessThan(1);
  for (const selector of ['.clay-icon-medallion', '.clay-badge-seal', '.clay-radio-control', '.clay-milestone > span']) {
    expect.soft(await page.locator(selector).first().evaluate((node) => getComputedStyle(node).clipPath), selector).toContain('ellipse(');
  }
  const threshold = await page.locator('.clay-threshold-scale').evaluate((node) => {
    const css = getComputedStyle(node, '::before');
    return { image: css.backgroundImage, clip: css.clipPath };
  });
  expect.soft(threshold.image).toContain('clay-grain.png');
  expect.soft(threshold.clip).toContain('polygon(');
  await expect.soft(page.locator('#clay-masthead h2')).toHaveCSS('font-family', /Clay Rounded/);
  for (const selector of ['.ui-table', '[data-testid="native-table"] table']) {
    expect.soft(await page.locator(selector).first().evaluate((node) => getComputedStyle(node).clipPath)).toContain('polygon(');
    expect.soft(await page.locator(`${selector} th`).first().evaluate((node) => getComputedStyle(node).backgroundImage)).toContain('clay-grain.png');
  }
  for (const selector of ['.clay-feature-strip', '.clay-callout-bar']) {
    expect.soft(await page.locator(selector).first().evaluate((node) => getComputedStyle(node).backgroundBlendMode)).toContain('soft-light');
  }
  await expect.soft(page.locator('.clay-feature-item').first()).toHaveCSS('border-right-width', '0px');
  for (const selector of ['.clay-card-service > .clay-icon-medallion', '.clay-callout-bar > .clay-icon-medallion', '.clay-feature-item > .clay-icon-medallion']) {
    const icon = page.locator(`${selector} svg`).first();
    await expect.soft(icon).toHaveCount(1);
    if (await icon.count()) {
      const delta = await icon.evaluate((node) => {
        const a = node.getBoundingClientRect();
        const b = node.parentElement.getBoundingClientRect();
        return { x: Math.abs(a.x + a.width / 2 - b.x - b.width / 2), y: Math.abs(a.y + a.height / 2 - b.y - b.height / 2), width: a.width };
      });
      expect.soft(delta.x).toBeLessThanOrEqual(1);
      expect.soft(delta.y).toBeLessThanOrEqual(1);
      expect.soft(delta.width).toBeGreaterThanOrEqual(28);
    }
  }
});

test('Clay annotation surfaces render across modes and responsive widths', async ({ page }) => {
  await openClay(page);
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    await page.setViewportSize({ width: 1115, height: 792 });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'hidden'; });
    for (const [name, selector] of [['controls', '#clay-controls'], ['choices', '#clay-choices'], ['masthead', '#clay-masthead'], ['features', '.clay-feature-strip'], ['table', '[data-testid="native-table"]'], ['dialog', '[data-testid="native-disclosure-dialog"]']]) {
      await page.locator(selector).first().screenshot({ path: path.join(os.tmpdir(), `clay-annotations-${name}-${mode}.png`), animations: 'disabled' });
    }
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.locator('.clay-sheet').evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
      expect(await page.locator('.clay-feature-strip').evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    }
    await page.locator('#clay-controls').screenshot({ path: path.join(os.tmpdir(), `clay-annotations-mobile-${mode}.png`), animations: 'disabled' });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
  }
  await page.locator('#clay-range-input').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#clay-range-input')).toHaveValue('69');
  await expect(page.locator('.clay-range output')).toHaveText('69');
});

test('Clay feature copy retains contrast across every theme and mode', async ({ page }) => {
  test.setTimeout(120_000);
  await openClay(page);
  const themes = await page.locator('#themeSelect option').evaluateAll((nodes) => nodes.map((node) => node.value));
  for (const theme of themes) {
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.selectOption('#themeSelect', theme);
      await page.selectOption('#modeSelect', mode);
      const ratio = await page.locator('.clay-feature-strip').evaluate((node) => {
        /** @param {string} color Computed RGB value. @returns {number} Relative luminance. */
        const luminance = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number)
          .map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
          .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
        const background = luminance(getComputedStyle(node).backgroundColor);
        const text = luminance(getComputedStyle(node.querySelector('p')).color);
        return (Math.max(background, text) + .05) / (Math.min(background, text) + .05);
      });
      expect(ratio, `${theme}/${mode} feature copy`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
