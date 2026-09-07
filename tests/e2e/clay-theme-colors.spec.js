import { test, expect } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

/** Reads rendered colors against the public theme roles, not private material aliases. */
async function colors(page) {
  return page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const probe = document.createElement('span');
    probe.style.setProperty('transition', 'none', 'important');
    document.body.append(probe);
    const role = (name) => {
      probe.style.color = `rgb(${style('body').getPropertyValue(`--usk-${name}-rgb`)})`;
      return getComputedStyle(probe).color;
    };
    const pairs = [
      ['canvas', style('body').backgroundColor, role('bg')],
      ['sheet', style('.clay-sheet').backgroundColor, role('surface')],
      ['panel', style('.clay-panel').backgroundColor, role('surface')],
      ['semantic card', style('.ui-card').backgroundColor, role('surface')],
      ['field', style('#clay-field-search').backgroundColor, role('surface-soft')],
      ['native field', style('#clay-theme-native').backgroundColor, role('surface-soft')],
      ['text', style('.clay-sheet').color, role('text')],
      ['primary', style('.clay-sheet .clay-button-primary').backgroundColor, role('primary')],
      ['primary label', style('.clay-sheet .clay-button-primary').color, role('primary-text')],
      ['secondary', style('.clay-sheet .clay-button-secondary').backgroundColor, role('secondary')],
      ['secondary label', style('.clay-sheet .clay-button-secondary').color, role('secondary-text')],
      ['component secondary label', style('#components .clay-button-secondary').color, role('secondary-text')],
      ['component danger label', style('#components .clay-button-danger').color, role('danger-text')],
      ['studio copy', style('.clay-studio strong').color, role('primary-text')],
      ['danger', style('.clay-sheet .clay-button-danger').backgroundColor, role('danger')],
      ['danger label', style('.clay-sheet .clay-button-danger').color, role('danger-text')],
      ['palette', style('.clay-swatch').backgroundColor, role('surface')],
      ['tooltip', style('.clay-sheet .clay-tooltip').backgroundColor, role('text')],
      ['tooltip label', style('.clay-sheet .clay-tooltip').color, role('surface')]
    ];
    probe.remove();
    return { pairs, clip: style('.clay-panel').clipPath, radius: style('.clay-sheet').borderRadius };
  });
}

test('Clay themes paint the complete preset in all modes and honor live RGB overrides', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
  await page.selectOption('#uiSelect', 'clay');
  const themes = await page.locator('#themeSelect option').evaluateAll((nodes) => nodes.map((node) => node.value).filter((value) => value && value !== 'reference-palette'));
  let geometry;
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    for (const theme of themes) {
      await page.selectOption('#themeSelect', theme);
      await page.evaluate(() => {
        const input = document.createElement('input');
        input.id = 'clay-theme-native';
        input.setAttribute('aria-label', 'Theme test field');
        document.body.append(input);
      });
      const result = await colors(page);
      for (const [name, actual, expected] of result.pairs) expect(actual, `${theme}/${mode}: ${name}`).toBe(expected);
      geometry ??= { clip: result.clip, radius: result.radius };
      expect({ clip: result.clip, radius: result.radius }).toEqual(geometry);
      await page.locator('#clay-theme-native').evaluate((node) => node.remove());
    }
  }
  await page.selectOption('#modeSelect', 'light');
  await page.evaluate(() => {
    document.body.style.setProperty('--usk-bg-rgb', '210 235 220');
    document.body.style.setProperty('--usk-surface-rgb', '225 240 230');
    document.body.style.setProperty('--usk-primary-rgb', '25 100 65');
  });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(210, 235, 220)');
  await expect(page.locator('.clay-sheet')).toHaveCSS('background-color', 'rgb(225, 240, 230)');
  await expect(page.locator('.clay-sheet .clay-button-primary').first()).toHaveCSS('background-color', 'rgb(25, 100, 65)');
});

test('Clay themed sheets preserve responsive material geometry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'clay');
  for (const [theme, mode] of [['ocean-steel', 'light'], ['heritage-brass', 'dark']]) {
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
    await page.selectOption('#themeSelect', theme);
    await page.selectOption('#modeSelect', mode);
    await page.setViewportSize({ width: 1600, height: 1100 });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'hidden'; });
    await page.locator('.clay-sheet').screenshot({ path: path.join(os.tmpdir(), `clay-theme-${theme}-${mode}.png`), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.locator('.clay-sheet').evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(2);
    await page.locator('.clay-masthead').screenshot({ path: path.join(os.tmpdir(), `clay-theme-${theme}-mobile.png`), animations: 'disabled' });
  }
});
