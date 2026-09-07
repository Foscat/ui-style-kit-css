import { test, expect } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';

/** Opens the actual local demo, without controlling the user's browser tab. */
async function openClay(page, mode = 'light') {
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.locator('#uiSelect').selectOption('clay');
  await page.locator('#modeSelect').selectOption(mode);
}

test('Clay reference controls are functional and isolated across every preset', async ({ page }) => {
  await openClay(page);
  const root = page.locator('#clay-template');
  await expect(root).toBeVisible();
  await expect(root.locator('[data-clay-group]')).toHaveCount(14);
  await root.locator('.clay-range input').fill('82');
  await expect(root.locator('.clay-value-flag').first()).toHaveText('82');
  await root.getByRole('button', { name: 'Increase number', exact: true }).click();
  await expect(root.locator('#clay-field-number')).toHaveValue('43');
  await root.locator('#clay-field-search').fill('Design');
  await root.getByRole('button', { name: 'Clear component search' }).click();
  await expect(root.locator('#clay-field-search')).toHaveValue('');
  await root.getByRole('tab', { name: 'Files', exact: true }).click();
  await expect(root.locator('.clay-tab-panel')).toContainText('Files');
  await root.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(root.locator('.clay-quantity output')).toHaveText('4');
  await root.getByLabel('Search disciplines').fill('Engineering');
  await root.getByRole('listbox', { name: 'Disciplines' }).getByRole('option', { name: 'Engineering', exact: true }).click();
  await expect(root.getByLabel('Discipline', { exact: true })).toHaveValue('Engineering');
  await root.getByLabel('Add tag', { exact: true }).fill('<b>Testing</b>');
  await root.getByLabel('Add tag', { exact: true }).press('Enter');
  await expect(root.locator('.clay-chip').last()).toHaveText('<b>Testing</b>');
  await expect(root.locator('.clay-chip b')).toHaveCount(0);
  await root.getByRole('button', { name: 'Remove <b>Testing</b>' }).click();
  await root.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).not.toBeVisible();
  const presets = await page.locator('#uiSelect option').evaluateAll((nodes) => nodes.map((node) => node.value));
  for (const preset of presets) {
    await page.locator('#uiSelect').selectOption(preset);
    const leaked = await page.locator('[data-preset-only]').evaluateAll((nodes, active) => nodes.filter((node) => node.dataset.presetOnly !== active && node.getClientRects().length).map((node) => node.dataset.presetOnly), preset);
    expect(leaked, preset).toEqual([]);
    await expect(page.locator('#clay-template')).toHaveCount(preset === 'clay' ? 1 : 0);
  }
});

for (const mode of ['light', 'dark']) {
  test(`Clay ${mode} reference geometry and responsive containment`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1100 });
    await openClay(page, mode);
    const root = page.locator('#clay-template');
    await root.scrollIntoViewIfNeeded();
    await page.locator('.demo-controls').evaluateAll((nodes) => nodes.forEach((node) => { node.style.visibility = 'hidden'; }));
    await expect(root.locator('.clay-rail')).toBeVisible();
    await expect(root.locator('.clay-palette .clay-swatch')).toHaveCount(10);
    await expect(root.locator('.clay-table tbody tr')).toHaveCount(4);
    await root.screenshot({ path: path.join(os.tmpdir(), `clay-template-${mode}.png`), animations: 'disabled' });
    for (const width of [1115, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await root.evaluate((node) => node.scrollWidth - node.clientWidth);
      expect(overflow, `sheet at ${width}px`).toBeLessThanOrEqual(2);
      await expect(root.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible();
    }
    await root.screenshot({ path: path.join(os.tmpdir(), `clay-template-${mode}-mobile.png`), animations: 'disabled' });
  });
}

test('Clay keyboard navigation, uploads and contrast remain usable', async ({ page }) => {
  await openClay(page, 'contrast');
  const root = page.locator('#clay-template');
  await root.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab', { name: 'Activity', exact: true })).toBeFocused();
  await root.getByLabel('Upload file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') });
  await expect(root.locator('[data-clay-file-label]')).toContainText('supported file');
  await root.getByLabel('Upload file').setInputFiles({ name: 'reference.png', mimeType: 'image/png', buffer: Buffer.from('sample') });
  await expect(root.locator('[data-clay-file-label]')).toHaveText('reference.png');
  for (let i = 0; i < 5; i++) await root.getByLabel('Next Clay page', { exact: true }).click();
  await expect(root.locator('[data-clay-page-label]')).toHaveText('Showing 61 to 70 of 114 results');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root.locator('.clay-spinner')).toHaveCSS('animation-name', 'none');
  const scan = await new AxeBuilder({ page }).include('#clay-template').withRules(['color-contrast', 'aria-valid-attr-value', 'aria-required-children', 'button-name', 'label']).analyze();
  expect(scan.violations.map((item) => ({ id: item.id, targets: item.nodes.map((node) => node.target) }))).toEqual([]);
});
