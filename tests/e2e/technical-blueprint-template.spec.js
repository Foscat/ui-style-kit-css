import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const url = pathToFileURL(path.resolve('index.html')).href + '?view=reference';
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const evidenceDir = path.join(os.tmpdir(), 'usk-technical-blueprint-template');
fs.mkdirSync(evidenceDir, { recursive: true });

/** Opens the actual generated bundle at the reference viewport and palette. */
async function openBoard(page, mode = 'dark') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(url);
  await page.selectOption('#uiSelect', 'technical-blueprint');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  return page.getByTestId('technical-blueprint-template-specimen');
}

test('Technical Blueprint renders every board and isolates every preset extra', async ({ page }) => {
  const root = await openBoard(page);
  await expect(root.locator('.demo-blueprint-board')).toHaveCount(10);
  for (const suffix of manifest.classApi.presetExtras['technical-blueprint']) {
    await expect(page.locator(`.blueprint-${suffix}`).first(), suffix).toBeAttached();
  }
  for (const { id } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    for (const region of await page.locator('[data-preset-only]').all()) {
      if (await region.getAttribute('data-preset-only') !== id) await expect(region).toBeHidden();
    }
    if (id !== 'technical-blueprint') await expect(root).toHaveCount(0);
  }
});

for (const mode of ['dark', 'light']) {
  test(`Technical Blueprint ${mode} matches drafting geometry and readable states`, async ({ page }) => {
    const root = await openBoard(page, mode);
    await expect(page.locator('body')).toHaveCSS('background-color', mode === 'dark' ? 'rgb(6, 31, 53)' : 'rgb(237, 236, 232)');
    const button = root.locator('.blueprint-button-primary').first();
    await expect(button).toHaveCSS('border-radius', '0px');
    await expect(button).toHaveCSS('min-height', '44px');
    await expect(button).toHaveCSS('clip-path', 'none');
    await expect(root.locator('.blueprint-spinner')).toHaveCSS('border-radius', '50%');
    await expect(root.locator('.blueprint-panel').first()).toHaveCSS('box-shadow', 'none');
    await expect(root.locator('.blueprint-chip').first()).toHaveCSS('border-radius', '0px');
    for (const track of await root.locator('.blueprint-switch-track').all()) {
      const outer = await track.boundingBox();
      const thumb = await track.locator('.blueprint-switch-thumb').boundingBox();
      expect(thumb.x + thumb.width).toBeLessThanOrEqual(outer.x + outer.width);
      expect(thumb.y + thumb.height).toBeLessThanOrEqual(outer.y + outer.height);
    }
    const audit = await new AxeBuilder({ page }).include('#technical-blueprint-template').analyze();
    expect(audit.violations).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root.locator('.blueprint-spinner')).toHaveCSS('animation-name', 'none');
    await root.screenshot({ path: path.join(evidenceDir, `reference-${mode}.png`), style: '.demo-controls { visibility: hidden; }' });
  });
}

/** Guards the three annotated geometry regressions across responsive sizes and modes. */
test('Technical Blueprint annotation geometry keeps loaders and status markers aligned', async ({ page }) => {
  test.setTimeout(60000);
  const root = await openBoard(page, 'light');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [602, 390, 1920]) {
    await page.setViewportSize({ width, height: 792 });
    for (const mode of ['light', 'dark']) {
      await page.selectOption('#modeSelect', mode);
      const context = `${width}px ${mode}`;
      for (const button of await root.locator('.demo-blueprint-state-grid [aria-busy="true"]').all()) {
        const geometry = await button.evaluate((node) => {
          const style = getComputedStyle(node);
          const spinner = getComputedStyle(node, '::after');
          const range = document.createRange();
          range.selectNodeContents(node);
          const text = range.getBoundingClientRect();
          const number = (value) => parseFloat(value) || 0;
          return {
            available: node.clientWidth - number(style.paddingLeft) - number(style.paddingRight),
            occupied: text.width + number(spinner.width) + number(spinner.marginLeft) + number(spinner.marginRight) + number(style.columnGap),
            width: node.getBoundingClientRect().width,
            normal: node.parentElement.querySelector('.blueprint-button').getBoundingClientRect().width
          };
        });
        expect.soft(geometry.occupied, `${context}: loader and label fit`).toBeLessThanOrEqual(geometry.available + 1);
        expect.soft(geometry.width, `${context}: loading column is wider`).toBeGreaterThan(geometry.normal);
      }
      const stepper = root.locator('.blueprint-stepper');
      const lineCenter = await stepper.evaluate((node) => {
        const line = getComputedStyle(node, '::before');
        return node.getBoundingClientRect().top + parseFloat(line.top) + parseFloat(line.height) / 2;
      });
      for (const marker of await stepper.locator('.blueprint-step > b').all()) {
        const box = await marker.boundingBox();
        expect.soft(Math.abs(box.y + box.height / 2 - lineCenter), `${context}: marker centered on connector`).toBeLessThanOrEqual(1);
      }
      const toast = root.locator('.blueprint-toast');
      const outer = await toast.boundingBox();
      const icon = await toast.locator(':scope > :first-child').boundingBox();
      expect.soft(Math.abs(icon.y + icon.height / 2 - outer.y - outer.height / 2), `${context}: toast icon vertically centered`).toBeLessThanOrEqual(1);
    }
  }
  await page.setViewportSize({ width: 602, height: 792 });
  await page.selectOption('#modeSelect', 'light');
  for (const group of ['action-states', 'range-progress', 'alerts-loading']) {
    await root.getByTestId(`technical-blueprint-specimen-${group}`).screenshot({
      path: path.join(evidenceDir, `annotation-${group}.png`),
      style: '.demo-controls { visibility: hidden; }'
    });
  }
});

test('Technical Blueprint controls, tokens, and mobile layout remain usable', async ({ page }) => {
  const root = await openBoard(page);
  const tabs = root.getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await root.locator('[data-blueprint-modal-open]').click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).toBeHidden();
  const slider = root.locator('.blueprint-range').first();
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('output').first()).toHaveText('63');
  await root.locator('[data-add-filter]').click();
  await expect(root.getByRole('button', { name: 'Remove Assigned filter' })).toBeVisible();
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'arctic-indigo');
  const primary = root.locator('.blueprint-button-primary').first();
  const before = await primary.evaluate((node) => getComputedStyle(node).backgroundColor);
  await page.evaluate(() => document.body.style.setProperty('--usk-primary-rgb', '17 101 173'));
  await expect(primary).toHaveCSS('background-color', 'rgb(17, 101, 173)');
  expect(before).not.toBe('rgb(17, 101, 173)');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await root.getByTestId('technical-blueprint-specimen-choices-tags').screenshot({ path: path.join(evidenceDir, 'mobile.png') });
});
