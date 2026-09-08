import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const evidence = path.join(os.tmpdir(), 'usk-paper-editorial-template');
fs.mkdirSync(evidence, { recursive: true });

/** Opens the actual generated bundle and selects its reference-palette specimen. */
async function openBoard(page, mode = 'dark') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'paper-editorial');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  return page.getByTestId('paper-editorial-template-specimen');
}

/**
 * Waits for primary button foregrounds to settle after live token changes.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<void>} Resolves when the hovered primary button uses the active foreground token.
 */
async function waitForPaperPrimaryPaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => {
    const button = document.querySelector('.paper-button-primary.is-hovered');
    if (!button) return false;
    const probe = document.createElement('span');
    probe.style.color = 'var(--paper-on-primary)';
    document.body.append(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    return getComputedStyle(button).color === expected;
  });
}

test('Paper Editorial covers all components and isolates every preset-only region', async ({ page }) => {
  test.setTimeout(60000);
  const root = await openBoard(page);
  await expect(root.locator('[data-component]')).toHaveCount(11);
  for (const suffix of manifest.classApi.presetExtras['paper-editorial']) {
    await expect(page.locator(`.paper-${suffix}`).first(), suffix).toBeAttached();
  }
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const region of await page.locator('[data-preset-only]').all()) {
      if (await region.getAttribute('data-preset-only') !== preset.id) await expect(region).toBeHidden();
    }
  }
});

for (const mode of ['dark', 'light']) {
  test(`Paper Editorial ${mode} reference fidelity and accessibility`, async ({ page }) => {
    const root = await openBoard(page, mode);
    await expect(root).toBeVisible();
    await expect(root.locator('.paper-button-primary').first()).toHaveCSS('border-radius', '1px');
    await expect(root).toHaveCSS('background-image', /data:image\/png;base64/);
    await expect(root.locator('.paper-check input').first()).toHaveCSS('opacity', '1');
    await expect(root.locator('.paper-folio-section').first()).toHaveCSS('display', 'block');
    await expect(root.locator('.paper-radio input').first()).toHaveCSS('box-shadow', 'none');
    await root.evaluate((node) => {
      const legacy = document.createElement('span');
      legacy.className = 'paper-loading-spinner';
      legacy.dataset.testLegacyLoader = '';
      node.append(legacy);
    });
    await expect(root.locator('[data-test-legacy-loader]')).toHaveCSS('background-image', 'none');
    await root.locator('[data-test-legacy-loader]').evaluate((node) => node.remove());
    await expect(page.locator('.ui-spinner').first()).toHaveCSS('background-image', 'none');
    await expect(root.locator('.paper-masthead-title')).toContainText('Pressroom Field Manual');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root.locator('.paper-spinner').first()).toHaveCSS('animation-name', 'none');
    await page.mouse.move(0, 0);
    await root.screenshot({ path: path.join(evidence, `${mode}.png`), style: '.demo-controls { visibility: hidden; }' });
    expect((await new AxeBuilder({ page }).include('#paper-editorial-template').analyze()).violations).toEqual([]);
  });
}

test('Paper Editorial keyboard, dialogs, tokens, and responsive containment', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  /** Identifies delayed axe stylesheet diagnostics that WebKit emits for local file URLs. */
  const isScannerCorsDiagnostic = (text) => text.includes('access control checks') ||
    text.includes('Origin null is not allowed by Access-Control-Allow-Origin');
  page.on('pageerror', (error) => {
    if (!isScannerCorsDiagnostic(error.message)) errors.push(error.message);
  });
  const root = await openBoard(page);
  await root.locator('#paper-measure').focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('#paper-measure-output')).toHaveText('69');
  await root.getByRole('tab').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  await root.getByRole('button', { name: 'Remove City Contracts', exact: true }).click();
  await expect(root.getByRole('button', { name: 'Remove City Contracts', exact: true })).toHaveCount(0);
  await root.getByRole('button', { name: 'Dismiss Information', exact: true }).click();
  await expect(root.locator('.paper-alert').first()).toBeHidden();
  await root.locator('[data-paper-authorize]').first().click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).toBeHidden();
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    document.body.style.setProperty('--usk-primary-rgb', '17 101 173');
    document.body.style.setProperty('--usk-primary-text-rgb', '255 255 255');
  });
  await expect(root.locator('.paper-button-primary').first()).toHaveCSS('background-color', 'rgb(17, 101, 173)');
  await expect(root.locator('.paper-button-primary').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.evaluate(() => {
    document.body.style.removeProperty('--usk-primary-rgb');
    document.body.style.removeProperty('--usk-primary-text-rgb');
  });
  await waitForPaperPrimaryPaint(page);
  expect((await new AxeBuilder({ page }).include('#paper-editorial-template').analyze()).violations).toEqual([]);
  for (const width of [602, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const section of await root.locator('[data-component]').all()) {
      expect(await section.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
  }
  await root.locator('[data-component="selection"]').screenshot({ path: path.join(evidence, 'mobile.png') });
  expect(errors).toEqual([]);
});
