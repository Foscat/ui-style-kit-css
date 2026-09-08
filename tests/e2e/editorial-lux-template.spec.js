import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const evidence = path.join(os.tmpdir(), 'usk-editorial-lux');
fs.mkdirSync(evidence, { recursive: true });

/** Opens the built demo in the selected reference mode. */
async function openBoard(page, mode = 'light') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'editorial-luxe');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  await page.locator('.demo-controls').evaluate((node) => { node.style.position = 'static'; });
  return page.getByTestId('editorial-lux-template-specimen');
}

test('Editorial Lux inventory and preset isolation', async ({ page }) => {
  test.setTimeout(90000);
  const root = await openBoard(page);
  await expect(root.locator('[data-component]')).toHaveCount(10);
  for (const suffix of manifest.classApi.presetExtras['editorial-luxe']) {
    await expect(page.locator(`.luxe-${suffix}`).first(), suffix).toBeAttached();
  }
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const region of await page.locator('[data-preset-only]').all()) {
      if (await region.getAttribute('data-preset-only') !== preset.id) await expect(region).toBeHidden();
    }
    await expect(page.getByTestId('editorial-lux-template-specimen')).toHaveCount(preset.id === 'editorial-luxe' ? 1 : 0);
  }
});

for (const mode of ['light', 'dark', 'contrast']) {
  test(`Editorial Lux ${mode} geometry and accessibility`, async ({ page }) => {
    const root = await openBoard(page, mode);
    await expect(root.locator('.luxe-masthead-title')).toHaveCSS('font-family', /serif$/);
    await expect(root.locator('.luxe-button-primary').first()).toHaveCSS('border-radius', '0px');
    const image = root.locator('.luxe-portrait img');
    expect(await image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
    expect(await root.evaluate((node) => node.clientWidth)).toBeGreaterThan(1800);
    await expect(root.locator('.luxe-file-drop svg')).toHaveCount(1);
    await expect(root.locator('.luxe-alert-danger svg')).toHaveCount(2);
    await root.screenshot({ path: path.join(evidence, `${mode}.png`) });
    const result = await new AxeBuilder({ page }).include('#editorial-lux-template').analyze();
    expect(result.violations).toEqual([]);
    await root.screenshot({ path: path.join(evidence, `${mode}.png`) });
    for (const width of [602, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      for (const node of await root.locator('.luxe-button').all()) {
        expect(await node.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      }
    }
    await root.screenshot({ path: path.join(evidence, `${mode}-mobile.png`) });
  });
}

test('Editorial Lux subtitle and upload icon fidelity', async ({ page }) => {
  const root = await openBoard(page, 'dark');
  await expect(root.locator('.luxe-file-drop svg')).toHaveCSS('width', '36px');
  const subtitle = await root.locator('.luxe-kicker').evaluate((node) => {
    const actual = getComputedStyle(node).color;
    node.style.color = 'var(--luxe-text-muted)';
    const expected = getComputedStyle(node).color;
    node.style.removeProperty('color');
    return { actual, expected };
  });
  expect(subtitle.actual).toBe(subtitle.expected);
});

test('Editorial Lux calibration and unboxed table geometry', async ({ page }) => {
  const root = await openBoard(page);
  const paint = await root.locator('.luxe-range-scale').first().evaluate((node) => getComputedStyle(node, '::before').backgroundImage);
  expect(paint).toContain('repeating-linear-gradient');
  await expect(root.locator('.luxe-table')).toHaveCSS('border-left-width', '0px');
});

test('Editorial Lux touch targets and expanded native fields', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const root = await openBoard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await root.locator('#luxe-foundations > summary').click();
  for (const selector of ['.luxe-button-primary', '.luxe-alert-close', '.luxe-tab', '.luxe-check', '.luxe-switch-segment', '.luxe-pagination button', '.luxe-stepper button', '.luxe-range']) {
    expect(await root.locator(selector).first().evaluate((node) => node.getBoundingClientRect().height), selector).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const result = await new AxeBuilder({ page }).include('#editorial-lux-template').analyze();
  expect(result.violations).toEqual([]);
  await context.close();
});

test('Editorial Lux keyboard controls and theme tokens', async ({ page }) => {
  const root = await openBoard(page);
  const tab = root.getByRole('tab', { name: 'Overview' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  const volume = root.getByRole('slider', { name: 'Volume' });
  await volume.fill('84');
  await expect(root.locator('#luxe-volume-output')).toHaveText('84');
  await root.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(root.locator('#luxe-quantity')).toHaveText('13');
  await root.getByRole('listbox').getByRole('option', { name: 'Look 12', exact: true }).focus();
  await page.keyboard.press('ArrowUp');
  await expect(root.getByRole('listbox').getByRole('option', { name: 'Look 03', exact: true })).toHaveAttribute('aria-selected', 'true');
  await root.getByRole('button', { name: 'Dismiss Success' }).click();
  await expect(root.locator('.luxe-alert-success')).toBeHidden();
  const remove = root.locator('[data-luxe-open]').last();
  await remove.click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).toBeHidden();
  await expect(remove).toBeFocused();
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.evaluate(() => document.body.style.setProperty('--usk-primary-rgb', '17 101 173'));
  await expect(root.locator('.luxe-button-primary').first()).toHaveCSS('background-color', 'rgb(17, 101, 173)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root.locator('.luxe-spinner')).toHaveCSS('animation-name', 'none');
});
