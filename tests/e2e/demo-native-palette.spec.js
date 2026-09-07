import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const demoUrl = pathToFileURL(path.resolve('index.html')).href;

/** Confirms real CSS fallback resolution and editor coverage, not just controller state. */
test('None exposes every native palette and retains all showcase sections', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(demoUrl);
  const presets = await page.evaluate(() => window.UI_STYLE_KIT_MANIFEST.presets);
  for (const { id, prefix } of presets) {
    await page.selectOption('#uiSelect', id);
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.selectOption('#modeSelect', mode);
      await expect(page.locator('body')).not.toHaveAttribute('data-theme');
      expect(await page.locator('[data-token-role]').count()).toBeGreaterThanOrEqual(23);
      const mismatches = await page.evaluate((tokenPrefix) => {
        const css = getComputedStyle(document.body);
        return [...document.querySelectorAll('[data-token-role]')].filter((row) =>
          row.querySelector('.demo-token-input').value !== css.getPropertyValue(`--${tokenPrefix}-${row.dataset.tokenRole}-rgb`).trim()
        ).map((row) => row.dataset.tokenRole);
      }, prefix);
      expect(mismatches, `${id}/${mode}`).toEqual([]);
    }
    for (const section of ['semantic-runtime', 'overview', 'tokens', 'components', 'native', 'bridge', 'usage']) {
      await expect(page.locator(`#${section}`)).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

/** Native material channels must repaint their real surfaces and stay scoped on export. */
test('Tactile native paper edits repaint the material without selecting a shared theme', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'tactile');
  const paper = page.locator('[data-token-role="paper"] .demo-token-input');
  await expect(paper).toHaveValue('246 240 224');
  await paper.fill('210 200 180');
  await expect(page.locator('body')).not.toHaveAttribute('data-theme');
  await expect(page.locator('body')).toHaveCSS('--tactile-paper-rgb', '210 200 180');
  await expect(page.getByTestId('theme-override-preview')).toContainText('--tactile-paper-rgb: 210 200 180;');
  await expect(page.locator('body')).toHaveCSS('--ui-color-bg', 'rgb(210 200 180)');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await expect(page.locator('[data-token-role="paper"]')).toHaveCount(0);
  await page.selectOption('#themeSelect', '');
  await expect(paper).toHaveValue('210 200 180');
});

/** Follows native edits through invalid input, palette switches, reset, export, and bridge use. */
test('native palette editing remains isolated and updates displayed components', async ({ page }) => {
  await page.goto(demoUrl);
  const row = page.locator('[data-token-role="primary"]');
  const input = row.locator('.demo-token-input');
  const original = await input.inputValue();
  const semanticButton = page.locator('[data-semantic-node="button-primary"]');
  const originalPaint = await semanticButton.evaluate((element) => getComputedStyle(element).backgroundImage);
  await input.fill('18 52 86');
  await expect(page.locator('body')).toHaveCSS('--saas-primary-rgb', '18 52 86');
  await expect(semanticButton).not.toHaveCSS('background-image', originalPaint);
  await expect(page.getByTestId('theme-override-preview')).toContainText('[data-ui="minimal-saas"]:not([data-theme])');
  await expect(page.getByTestId('usage-imports')).toContainText('document.body.removeAttribute("data-theme");');
  await input.fill('999 0 0');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('body')).toHaveCSS('--saas-primary-rgb', '18 52 86');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await expect(input).toHaveValue('64 94 184');
  await page.selectOption('#themeSelect', '');
  await expect(input).toHaveValue('18 52 86');
  await page.selectOption('#modeSelect', 'dark');
  await expect(input).not.toHaveValue('18 52 86');
  await page.selectOption('#modeSelect', 'light');
  await expect(input).toHaveValue('18 52 86');
  await page.getByTestId('reset-palette').click();
  await expect(input).toHaveValue(original);
  await page.locator('#bridgeToggle').check({ force: true });
  await expect(page.locator('body')).not.toHaveAttribute('data-theme');
  await expect(page.locator('body')).toHaveAttribute('data-bridge', 'attached');
  await expect(page.getByTestId('bridge-status')).toContainText('Attached');
});

/** Guards the compact editor layout and accessible instructions at a narrow viewport. */
test('native palette controls remain usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl);
  await page.selectOption('#modeSelect', 'dark');
  await page.getByRole('link', { name: 'edit the active colors' }).click();
  await expect(page.getByTestId('palette-context')).toContainText('native palette');
  await expect(page.locator('#themeSelect')).toHaveAccessibleDescription(/None/);
  await expect(page.getByTestId('reset-palette')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
