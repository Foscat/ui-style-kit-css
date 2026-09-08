import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const evidence = path.join(os.tmpdir(), 'usk-industrial-utility-template');
fs.mkdirSync(evidence, { recursive: true });
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

/** Opens the generated library, with its actual preset and reference-palette controls. */
async function openBoard(page, mode = 'dark') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'industrial-utility');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  return page.getByTestId('industrial-utility-template-specimen');
}

test('Industrial Utility covers every component and isolates all preset-specific regions', async ({ page }) => {
  test.setTimeout(60000);
  const root = await openBoard(page);
  await expect(root.locator('[data-component]')).toHaveCount(11);
  for (const suffix of manifest.classApi.presetExtras['industrial-utility']) {
    await expect(page.locator(`.utility-${suffix}`).first(), suffix).toBeAttached();
  }
  for (const { id } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    for (const region of await page.locator('[data-preset-only]').all()) {
      if (await region.getAttribute('data-preset-only') !== id) await expect(region).toBeHidden();
    }
    if (id !== 'industrial-utility') await expect(root).toHaveCount(0);
  }
});

for (const mode of ['dark', 'light']) {
  test(`Industrial Utility ${mode} reference material and accessibility`, async ({ page }) => {
    test.setTimeout(60000);
    const root = await openBoard(page, mode);
    // The reviewed page now reserves sixteen pixels of content padding on each side.
    expect(await root.evaluate((node) => node.clientWidth)).toBeGreaterThanOrEqual(1768);
    await expect(root.locator('div.utility-dialog')).toBeVisible();
    await expect(root.locator('.utility-check input').first()).toHaveCSS('opacity', '1');
    await expect(root.locator('.utility-radio input').first()).toHaveCSS('position', 'static');
    await expect(root.locator('.utility-button-guarded')).toHaveCSS('background-image', /repeating-linear-gradient/);
    await expect(root.locator('.utility-button-primary').first()).toHaveCSS('border-radius', '2px');
    await expect(root.locator('.utility-readout')).toHaveCSS('background-color', 'rgb(8, 16, 12)');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root.locator('.utility-spinner')).toHaveCSS('animation-name', 'none');
    await page.mouse.move(0, 0);
    await root.screenshot({ path: path.join(evidence, `${mode}.png`), style: '.demo-controls { visibility: hidden; }' });
    const audit = await new AxeBuilder({ page }).include('#industrial-utility-template').analyze();
    expect(audit.violations).toEqual([]);
  });
}

test('Industrial Utility interactions, tokens, and responsive containment', async ({ page }) => {
  test.setTimeout(60000);
  const root = await openBoard(page);
  const slider = root.locator('#utility-pressure');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('#utility-pressure-value')).toHaveText('72.7');
  await root.getByRole('button', { name: 'Key switch: Auto', exact: true }).click();
  await expect(root.getByRole('button', { name: 'Key switch: On', exact: true })).toBeVisible();
  await root.getByRole('button', { name: 'E-STOP', exact: true }).click();
  await expect(root.getByRole('button', { name: 'RESET', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await root.locator('[data-utility-ack-open]').first().click();
  await expect(root.locator('dialog')).toBeVisible();
  await root.locator('dialog').getByRole('button', { name: 'Acknowledge', exact: true }).click();
  await expect(root.locator('[data-utility-critical]')).toContainText('Acknowledged');
  await expect(root.locator('[data-utility-critical]')).toHaveClass(/utility-alert-danger/);
  await root.getByRole('searchbox', { name: 'Search work orders' }).fill('cartridge');
  await expect(root.locator('.utility-table tbody tr:visible')).toHaveCount(1);
  await root.getByRole('searchbox', { name: 'Search work orders' }).fill('');
  await root.getByRole('tab').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.evaluate(() => {
    document.body.style.setProperty('--usk-primary-rgb', '17 101 173');
    document.body.style.setProperty('--usk-primary-text-rgb', '255 255 255');
  });
  await expect(root.locator('.utility-button-secondary').first()).toHaveCSS('color', await page.locator('body').evaluate((node) => `rgb(${getComputedStyle(node).getPropertyValue('--usk-secondary-text-rgb').trim().replace(/\s+/g, ', ')})`));
  await expect(root.locator('.utility-button-primary').first()).toHaveCSS('color', await page.locator('body').evaluate((node) => `rgb(${getComputedStyle(node).getPropertyValue('--usk-primary-text-rgb').trim().replace(/\s+/g, ', ')})`));
  expect(await root.evaluate((node) => getComputedStyle(node).getPropertyValue('--utility-material-safety-amber').trim())).toBe('rgb(17 101 173)');
  expect((await new AxeBuilder({ page }).include('#industrial-utility-template').analyze()).violations).toEqual([]);
  for (const width of [602, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const panel of await root.locator('[data-component]').all()) {
      expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
  }
  await root.locator('[data-component="toggles"]').screenshot({ path: path.join(evidence, 'mobile.png') });
});
