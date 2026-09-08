import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const evidence = path.join(os.tmpdir(), 'usk-neo-noir');
fs.mkdirSync(evidence, { recursive: true });
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

/** Opens the built distribution through its actual static demo. */
async function openBoard(page, mode = 'light') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'neo-noir');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  await page.locator('.demo-controls').evaluate((node) => { node.style.position = 'static'; });
  return page.getByTestId('neo-noir-template-specimen');
}

test('Neo Noir complete inventory and all-preset isolation', async ({ page }) => {
  test.setTimeout(90000);
  const root = await openBoard(page);
  await expect(root.locator('[data-component]')).toHaveCount(15);
  await expect(root.locator('.demo-nn-icons svg')).toHaveCount(10);
  for (const suffix of manifest.classApi.presetExtras['neo-noir']) {
    await expect(page.locator('.noir-' + suffix).first(), suffix).toBeAttached();
  }
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const node of await page.locator('[data-preset-only]').all()) {
      if (await node.getAttribute('data-preset-only') !== preset.id) await expect(node).toBeHidden();
    }
    await expect(page.getByTestId('neo-noir-template-specimen')).toHaveCount(preset.id === 'neo-noir' ? 1 : 0);
  }
});

for (const mode of ['light', 'dark', 'contrast']) {
  test('Neo Noir ' + mode + ' geometry and accessibility', async ({ page }) => {
    const root = await openBoard(page, mode);
    expect(await root.evaluate((node) => node.clientWidth)).toBeGreaterThan(1800);
    await expect(root.locator('.noir-input').first()).toHaveCSS('clip-path', 'none');
    await expect(root.locator('.noir-button-primary').first()).toHaveCSS('box-shadow', 'none');
    await root.screenshot({ path: path.join(evidence, mode + '.png') });
    const axe = await new AxeBuilder({ page }).include('#neo-noir-template').analyze();
    expect(axe.violations).toEqual([]);
    for (const width of [1115, 602, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      for (const node of await root.locator('.noir-button').all()) {
        expect(await node.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      }
    }
    await root.screenshot({ path: path.join(evidence, mode + '-mobile.png') });
  });
}

test('Neo Noir mobile touch targets and published markup', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const root = await openBoard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['neo-noir']]);
  const classes = await root.evaluate((node) => [...new Set([node, ...node.querySelectorAll('*')].flatMap((el) => [...el.classList]))].filter((name) => name.startsWith('noir-')));
  for (const name of classes) expect(api.has(name.slice(5)), name).toBe(true);
  for (const selector of ['.noir-button-primary', '.noir-chip button', '.noir-check', '.noir-switch', '.noir-tab', '.noir-option', '.noir-input', '.noir-range', '.noir-alert-close']) {
    expect(await root.locator(selector).first().evaluate((node) => node.getBoundingClientRect().height), selector).toBeGreaterThanOrEqual(44);
  }
  const result = await new AxeBuilder({ page }).include('#neo-noir-template').analyze();
  expect(result.violations).toEqual([]);
  await root.screenshot({ path: path.join(evidence, 'touch-final.png') });
  await context.close();
});

test('Neo Noir retained utility material remains compact', async ({ page }) => {
  const root = await openBoard(page);
  expect(await root.locator('.noir-empty-state').evaluate((node) => node.getBoundingClientRect().height)).toBeLessThanOrEqual(96);
  await expect(root.locator('.noir-metric-value')).toHaveCSS('font-size', '20px');
  await root.screenshot({ path: path.join(evidence, 'light-final.png') });
  await page.selectOption('#modeSelect', 'dark');
  await root.screenshot({ path: path.join(evidence, 'dark-final.png') });
});

test('Neo Noir reference composition and aligned choice markers', async ({ page }) => {
  const root = await openBoard(page, 'dark');
  for (const [selector, maximum] of [['.demo-nn-main', 500], ['.demo-nn-mid', 280], ['.demo-nn-low', 290]]) {
    expect(await root.locator(selector).evaluate((node) => node.getBoundingClientRect().height), selector).toBeLessThanOrEqual(maximum);
  }
  await expect(root.locator('.noir-check-control').first()).toHaveCSS('position', 'relative');
  const track = root.locator('.noir-switch-track').first();
  const thumb = track.locator('.noir-switch-thumb');
  const a = await track.boundingBox();
  const b = await thumb.boundingBox();
  expect(b.x).toBeGreaterThan(a.x);
  expect(b.x + b.width).toBeLessThan(a.x + a.width);
  await root.screenshot({ path: path.join(evidence, 'dark-final.png') });
});

test('Neo Noir keyboard, upload, tags, dialog and palette controls', async ({ page }) => {
  const root = await openBoard(page);
  const tab = root.getByRole('tab', { name: 'Overview', exact: true });
  await tab.focus(); await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab', { name: 'Assets', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(root.getByRole('tabpanel')).toContainText('Assets');
  const option = root.getByRole('option', { name: '2160p 4K UHD', exact: true }).last();
  await option.focus(); await page.keyboard.press('ArrowDown');
  await expect(root.getByRole('combobox')).toHaveValue('4320p 8K UHD');
  await root.getByRole('slider', { name: 'Exposure', exact: true }).fill('4.2');
  await expect(root.locator('.noir-slider-value')).toHaveText('+4.2');
  await expect(root.locator('.demo-nn-range')).toHaveAttribute('style', /92%/);
  await root.getByRole('textbox', { name: 'New production tag' }).fill('<Archive>');
  await root.getByRole('button', { name: 'Add tag', exact: true }).click();
  await expect(root.locator('.noir-chip').last()).toContainText('<Archive>');
  await root.getByRole('button', { name: 'Remove <Archive>', exact: true }).click();
  await expect(root.locator('.noir-chip')).toHaveCount(3);
  await root.getByLabel('Upload production asset').setInputFiles({ name: 'grade.cube', mimeType: 'text/plain', buffer: Buffer.from('sample') });
  await expect(root.locator('[data-noir-file-result]')).toContainText('grade.cube');
  await root.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(root.locator('[aria-current="page"]')).toHaveText('3');
  const approve = root.locator('[data-noir-open]').last();
  await approve.click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).not.toBeVisible();
  await expect(approve).toBeFocused();
  await approve.click(); await root.locator('[data-noir-confirm]').click();
  await expect(root.locator('[data-noir-status]')).toContainText('local preview');
  await root.getByRole('button', { name: 'Dismiss warning', exact: true }).click();
  await expect(root.locator('.noir-alert-warning')).toHaveCount(0);
  const before = await root.locator('.noir-button-primary').first().evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
  await page.selectOption('#themeSelect', 'arctic-indigo');
  const after = await page.locator('#neo-noir-template .noir-button-primary').first().evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
  expect(after).not.toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.noir-processing')).toHaveCSS('animation-name', 'none');
  expect(await page.locator('.noir-processing').evaluate((node) => getComputedStyle(node, '::after').animationName)).toBe('none');
});
