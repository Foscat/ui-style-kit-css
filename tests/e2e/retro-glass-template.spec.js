import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const demoUrl = pathToFileURL(path.resolve('index.html')).href + '?view=reference';
const groups = ['action-states', 'form-inputs', 'choices-tags', 'select-upload',
  'range-progress', 'alerts-loading', 'navigation', 'data-display', 'overlays-disclosure', 'foundations'];

/** Opens the actual generated-bundle demo with reference colors. */
async function openRetroGlass(page, mode = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retro-glass');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette' }).click();
  return page.getByTestId('retro-glass-template-specimen');
}

test('Retro Glass specimen exposes every template component and state', async ({ page }) => {
  const board = await openRetroGlass(page);
  for (const group of groups) await expect(board.getByTestId(`retro-glass-specimen-${group}`)).toBeVisible();
  for (const suffix of manifest.classApi.presetExtras['retro-glass']) {
    await expect(page.locator(`.rg-${suffix}:visible`).first()).toBeVisible();
  }
  await expect(board.locator('[data-action-states] .rg-button')).toHaveCount(20);
  await expect(board.locator('.rg-button:disabled')).not.toHaveCount(0);
  await expect(board.locator('.rg-input[aria-invalid="true"]')).toHaveAttribute('aria-describedby', 'rg-url-error');
});

test('all preset-specific demo components belong to the active style', async ({ page }) => {
  await page.goto(demoUrl);
  for (const { id } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    await expect(page.locator('body')).toHaveAttribute('data-ui', id);
    const foreignClasses = await page.locator('#demoContent').evaluate((root, { manifest, active }) => {
      const foreign = manifest.presets.filter(({ id }) => id !== active)
        .flatMap(({ id, prefix }) => manifest.classApi.presetExtras[id].map((suffix) => `${prefix}-${suffix}`));
      return foreign.filter((name) => root.querySelector(`.${name}`));
    }, { manifest, active: id });
    expect(foreignClasses, id).toEqual([]);
    const visiblePresetOnly = await page.locator('[data-preset-only]:visible')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-preset-only')));
    expect(visiblePresetOnly.every((preset) => preset === id), id).toBe(true);
  }
});

test('Retro Glass controls support keyboard navigation, upload, range and overlays', async ({ page }) => {
  const board = await openRetroGlass(page);
  const sound = board.getByRole('switch', { name: 'Sound', exact: true });
  await sound.focus();
  await page.keyboard.press('Space');
  await expect(sound).toBeChecked();
  await board.getByRole('button', { name: 'List', exact: true }).click();
  await expect(board.getByRole('button', { name: 'List', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await board.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(board.getByRole('tab', { name: 'Activity', exact: true })).toBeFocused();
  await expect(board.getByRole('tabpanel')).toContainText('Activity');
  const range = board.getByRole('slider', { name: 'Volume', exact: true });
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('69');
  await expect(board.locator('output[for="rg-volume"]')).toHaveText('69');
  await board.getByLabel('Upload files').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Sample') });
  await expect(board.locator('[data-file-status]')).toHaveText('notes.txt');
  await board.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(board.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await board.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Delete document?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(board.getByRole('button', { name: 'Confirm', exact: true })).toBeFocused();
});

test('Retro Glass paints distinct destructive controls, visible progress and local icons', async ({ page }) => {
  const board = await openRetroGlass(page);
  const paint = await board.evaluate((root) => {
    const primary = getComputedStyle(root.querySelector('[data-action-states] .rg-button-primary'));
    const danger = getComputedStyle(root.querySelector('[data-action-states] .rg-button-danger'));
    const progress = root.querySelector('.rg-progress-bar').getBoundingClientRect();
    const progressStyle = getComputedStyle(root.querySelector('.rg-progress-bar'));
    return { primary: primary.backgroundColor, danger: danger.backgroundColor, progressWidth: progress.width, progressHeight: progress.height, progressPaint: progressStyle.backgroundImage };
  });
  expect(paint.danger).not.toBe(paint.primary);
  expect(paint.progressWidth).toBeGreaterThan(20);
  expect(paint.progressHeight).toBeGreaterThan(2);
  expect(paint.progressPaint).toContain('repeating-linear-gradient');
  await expect(board.getByRole('button', { name: 'Add document', exact: true }).locator('svg')).toBeVisible();
});

test('Retro Glass respects reduced motion, forced colors and touch target sizes', async ({ page, browser }) => {
  const board = await openRetroGlass(page);
  await expect(board.locator('.rg-skeleton').first()).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ forcedColors: 'active' });
  const sound = board.getByRole('switch', { name: 'Sound', exact: true });
  await expect(sound).toHaveCSS('opacity', '1');
  await sound.focus();
  await page.keyboard.press('Space');
  await expect(sound).toBeChecked();
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const touchPage = await context.newPage();
  const touchBoard = await openRetroGlass(touchPage);
  const target = touchBoard.getByRole('button', { name: 'Add document', exact: true });
  const bounds = await target.boundingBox();
  expect(bounds.width).toBeGreaterThanOrEqual(44);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await context.close();
});

for (const mode of ['light', 'dark', 'contrast']) {
  test(`Retro Glass ${mode} palette, geometry, accessibility and responsive board`, async ({ page }) => {
    const board = await openRetroGlass(page, mode);
    await page.setViewportSize({ width: 1920, height: 1280 });
    const evidence = await board.evaluate((root) => {
      const style = getComputedStyle(root);
      const button = getComputedStyle(root.querySelector('[data-action-states] .rg-button'));
      const panel = getComputedStyle(root.querySelector('.rg-panel'));
      return { canvas: style.getPropertyValue('--rg-bg-rgb').trim(), height: button.minHeight,
        radius: panel.borderRadius, clip: panel.clipPath, font: style.fontFamily };
    });
    expect(evidence.canvas).toBe({ light: '216 222 229', dark: '6 16 23', contrast: '0 0 0' }[mode]);
    expect(evidence.height).toBe('36px');
    expect(evidence.radius).toBe('10px');
    expect(evidence.clip).toBe('none');
    expect(evidence.font).toContain('DejaVu Sans');
    const audit = await new AxeBuilder({ page }).include('[data-testid="retro-glass-template-specimen"]').analyze();
    expect(audit.violations).toEqual([]);
    await board.screenshot({ path: `.tmp/retro-glass-template-${mode}.png`, style: '.demo-controls { visibility: hidden; }' });
    await page.selectOption('#themeSelect', 'sunset-ember');
    expect(await board.evaluate((root) => getComputedStyle(root).getPropertyValue('--rg-primary-rgb').trim()))
      .toBe(await page.locator('body').evaluate((root) => getComputedStyle(root).getPropertyValue('--usk-primary-rgb').trim()));
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(board).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await board.screenshot({ path: `.tmp/retro-glass-template-${mode}-mobile.png`, style: '.demo-controls { visibility: hidden; }' });
  });
}
