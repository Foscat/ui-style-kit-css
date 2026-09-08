import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const demoUrl = pathToFileURL(path.resolve('index.html')).href;
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

/** Verifies the public view independently of the opt-in full-board QA fixtures. */
test('public showcase exposes every preset without duplicating its template page', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(demoUrl);
  for (const { id, label } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    await expect(page.locator('#overview')).toHaveCount(1);
    await expect(page.locator('#style-specific')).toContainText(label);
    await expect(page.locator('#style-specific-heading')).toHaveText('Style-specific components');
    await expect(page.locator('[data-testid$="-template-specimen"], .clay-sheet, .bento-sheet, .bau-sheet')).toHaveCount(0);
    await expect(page.locator('#components #style-specific')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

/** Exercises real keyboard, pointer, dialog, and focus behavior in the curated Industrial gallery. */
test('Industrial feature controls preserve local state and alarm acknowledgment', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'industrial-utility');
  const gallery = page.locator('#style-specific');
  const key = gallery.getByRole('button', { name: 'Key switch: Auto', exact: true });
  await key.focus();
  await page.keyboard.press('Enter');
  await expect(gallery.getByRole('button', { name: 'Key switch: On', exact: true })).toBeFocused();
  const stop = gallery.locator('#utility-estop');
  await stop.click();
  await expect(stop).toHaveAttribute('aria-pressed', 'true');
  await expect(stop).toHaveText('RESET');
  await expect(gallery.locator('[data-utility-feedback]')).toContainText('No equipment is connected');
  await stop.click();
  await expect(stop).toHaveAttribute('aria-pressed', 'false');
  const pressure = gallery.getByRole('slider', { name: 'Discharge pressure', exact: true });
  await pressure.focus();
  await page.keyboard.press('End');
  await expect(gallery.locator('#utility-pressure-value')).toHaveText('150.0');
  const modes = gallery.locator('.utility-three-position');
  await modes.getByRole('button', { name: 'Auto', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(modes.getByRole('button', { name: 'Hand', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await gallery.locator('[data-utility-silence]').click();
  await expect(gallery.locator('[data-utility-silence]')).toHaveAttribute('aria-pressed', 'true');
  const acknowledge = gallery.locator('[data-utility-ack-open]');
  await acknowledge.click();
  const dialog = gallery.getByRole('dialog', { name: 'Confirm acknowledge' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Acknowledge', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(acknowledge).toBeFocused();
  await expect(gallery.locator('[data-utility-critical] .utility-badge')).toHaveText('Acknowledged');
  await expect(gallery.locator('[data-utility-feedback]')).toContainText('Critical pressure remains active');
});

for (const width of [390, 1115]) {
  test(`curated features fit at ${width}px in native and shared palettes`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 792 });
    await page.goto(demoUrl);
    for (const preset of ['industrial-utility', 'clay', 'neo-noir', 'art-deco', 'editorial-luxe', 'retro-glass', 'technical-blueprint']) {
      await page.selectOption('#uiSelect', preset);
      for (const mode of ['light', 'dark', 'contrast']) {
        await page.selectOption('#modeSelect', mode);
        for (const theme of ['', 'arctic-indigo']) {
          await page.selectOption('#themeSelect', theme);
          const gallery = page.locator('#style-specific');
          await expect(gallery).toBeVisible();
          const fits = await gallery.evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
          expect(fits, `${preset}/${mode}/${theme || 'native'}/${width}`).toBe(true);
          if (!theme) await expect(page.locator('body')).not.toHaveAttribute('data-theme');
          else await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
        }
      }
    }
  });
}
