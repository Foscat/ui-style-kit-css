import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Page} page Generated local demo. @returns {Promise<void>} */
async function open(page) {
  await page.setViewportSize({ width: 1115, height: 792 });
  await page.goto(pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.selectOption('#uiSelect', 'industrial-utility');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
}

/** @param {import('@playwright/test').Page} page Demo page after a control change. @returns {Promise<void>} */
async function settleLayout(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

/**
 * Captures a stable element screenshot after WebKit has applied demo rerenders.
 *
 * @param {import('@playwright/test').Page} page Demo page.
 * @param {string} selector Element selector to inspect.
 * @param {string} pathName Screenshot output path.
 * @returns {Promise<number>} Horizontal overflow in CSS pixels.
 */
async function captureStableNode(page, selector, pathName) {
  const node = page.locator(selector).first();
  await expect(node).toBeAttached();
  await node.scrollIntoViewIfNeeded();
  await expect(node).toBeVisible();
  const overflow = await node.evaluate((element) => element.scrollWidth - element.clientWidth);
  await settleLayout(page);
  await page.locator(selector).first().screenshot({
    path: pathName,
    style: '.demo-controls { visibility:hidden; }',
    animations: 'disabled',
  });
  return overflow;
}

test('Industrial warning signals use warning paint and danger examples opt into alarms', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  const lamp = page.locator('.demo-iu-lamp-row .utility-pilot-light.is-warning');
  await expect(lamp).toHaveCount(1);
  await expect(lamp).toHaveCSS('animation-name', 'utility-warning-signal');
  const alertLamp = page.locator('.demo-iu-panel-alerts .utility-alert-warning .is-warning');
  await expect(alertLamp).toHaveCSS('animation-name', 'utility-warning-signal');
  const warning = page.locator('.demo-component-grid > article > .utility-alert-warning');
  const info = page.locator('.demo-component-grid > article > .utility-alert-info');
  await expect(info).toHaveCount(1);
  const expected = await warning.evaluate((node) => {
    const probe = document.createElement('span'); probe.style.color = 'var(--utility-warning)'; node.append(probe);
    const color = getComputedStyle(probe).color; probe.remove(); return color;
  });
  await expect(warning).toHaveCSS('border-left-color', expected);
  expect(await info.evaluate((node) => getComputedStyle(node).borderLeftColor)).not.toBe(expected);
  await expect(page.locator('[data-testid="component-buttons"] .utility-button-danger')).toHaveCSS('animation-name', 'utility-danger-signal');
  await expect(page.locator('.demo-iu-panel-buttons .utility-button-danger').first()).toHaveCSS('animation-name', 'none');
  expect(await page.locator('.utility-feature-item:first-child .utility-icon-medallion').evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(36);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(lamp).toHaveCSS('animation-name', 'none');
  await expect(alertLamp).toHaveCSS('animation-name', 'none');
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    await settleLayout(page);
    for (const width of [1115, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await settleLayout(page);
      for (const [name, selector] of [['bank', '.demo-iu-panel-toggles'], ['alerts', '.demo-iu-panel-alerts'], ['buttons', '[data-testid="component-buttons"]'], ['messages', '.demo-component-grid > article:has(> .utility-alert-info)']]) {
        const overflow = await captureStableNode(page, selector, `.tmp/industrial-warning-${name}-${mode}-${width}.png`);
        expect(overflow).toBeLessThanOrEqual(2);
      }
    }
  }
});

test('Every preset showcases a library warning button with paired theme colors', async ({ page }) => {
  test.setTimeout(90000);
  await open(page);
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const mode of ['light', 'dark', 'contrast']) {
      await page.selectOption('#modeSelect', mode);
      const button = page.locator(`[data-testid="component-buttons"] .${preset.prefix}-button-warning`);
      await expect(button).toHaveText('Warning');
      const result = await button.evaluate((node, prefix) => {
        const probe = document.createElement('span'); probe.style.cssText = `color:var(--${prefix}-on-warning);background:var(--${prefix}-warning);`; node.append(probe);
        const a = getComputedStyle(node), b = getComputedStyle(probe);
        const colors = [a.color, b.color, a.backgroundColor, b.backgroundColor]; probe.remove(); return colors;
      }, preset.prefix);
      expect(result[0], `${preset.id}/${mode} text`).toBe(result[1]);
      expect(result[2], `${preset.id}/${mode} fill`).toBe(result[3]);
    }
  }
});
