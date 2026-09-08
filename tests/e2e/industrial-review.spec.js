import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/** @param {import('@playwright/test').Page} page Isolated generated demo. @returns {Promise<void>} */
async function openUtility(page) {
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
    style: '.demo-controls { visibility: hidden; }',
    animations: 'disabled',
  });
  return overflow;
}

test('Industrial alarms pulse while destructive commands stay steady', async ({ page }) => {
  await openUtility(page);
  const signals = ['[data-semantic-node="button-danger"]', '.demo-iu-status-bank .is-red', '.demo-iu-status-badges .utility-badge-danger'];
  for (const selector of signals) await expect(page.locator(selector)).toHaveCSS('animation-name', 'utility-danger-signal');
  await expect(page.locator('.demo-iu-panel-buttons .utility-button-danger').first()).toHaveCSS('animation-name', 'none');
  const busy = page.locator('.demo-iu-panel-buttons .is-loading');
  const properties = ['animationName', 'animationTimingFunction', 'borderRadius', 'backgroundImage', 'clipPath'];
  const read = (node, props) => Object.fromEntries(props.map((key) => [key, getComputedStyle(node)[key]]));
  const spinner = await page.locator('.demo-iu-loading-well .utility-spinner').evaluate(read, properties);
  const loading = await busy.evaluate((node, props) => Object.fromEntries(props.map((key) => [key, getComputedStyle(node, '::before')[key]])), properties);
  // Busy controls inherit their paired label color; compare the rotor geometry independently.
  loading.backgroundImage = loading.backgroundImage.replace(/rgba?\([^)]+\)/g, 'color');
  spinner.backgroundImage = spinner.backgroundImage.replace(/rgba?\([^)]+\)/g, 'color');
  expect(loading).toEqual(spinner);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const selector of signals) await expect(page.locator(selector)).toHaveCSS('animation-name', 'none');
  expect(await busy.evaluate((node) => getComputedStyle(node, '::before').animationName)).toBe('none');
});

test('Industrial native and marketing controls retain geometry and theme paint', async ({ page }) => {
  await openUtility(page);
  for (const panel of await page.locator('.demo-native-sample.utility-panel').all()) {
    expect(await panel.evaluate((node) => parseFloat(getComputedStyle(node).paddingLeft))).toBeGreaterThanOrEqual(16);
  }
  expect(await page.locator('.demo-showcase > .utility-container').evaluate((node) => parseFloat(getComputedStyle(node).paddingLeft))).toBeGreaterThanOrEqual(16);
  const textarea = page.locator('.demo-iu-input-grid textarea');
  const textGeometry = await textarea.evaluate((node) => { const s = getComputedStyle(node); return { height: node.clientHeight, line: parseFloat(s.lineHeight), top: parseFloat(s.paddingTop), bottom: parseFloat(s.paddingBottom) }; });
  expect(Math.abs(textGeometry.top - textGeometry.bottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(textGeometry.height - textGeometry.line - textGeometry.top - textGeometry.bottom)).toBeLessThanOrEqual(2);
  const file = await page.locator('.utility-file').evaluate((node) => ({ height: node.clientHeight, button: parseFloat(getComputedStyle(node, '::file-selector-button').height), padding: parseFloat(getComputedStyle(node).paddingTop) }));
  expect(Math.abs(file.height - file.button - file.padding * 2)).toBeLessThanOrEqual(2);
  const check = page.locator('[data-testid="native-forms"] input[type="checkbox"]:checked');
  await expect(check).toHaveCSS('background-image', 'none');
  await expect(check).toHaveCSS('box-shadow', /inset/);
  const select = page.locator('[data-testid="native-forms"] select[multiple]');
  await expect(select).toHaveCSS('background-image', 'none');
  expect(await select.evaluate((node) => node.clientHeight)).toBeGreaterThanOrEqual(80);
  await expect(page.locator('[data-testid="native-table"] th').first()).toHaveCSS('text-transform', 'uppercase');
  expect(await page.locator('.utility-card-service .utility-icon-medallion').evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(32);
  expect((await page.locator('#usage .demo-copy-button svg').first().boundingBox()).width).toBeGreaterThanOrEqual(18);
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    const colors = await page.locator('.utility-card-service .utility-button-primary').evaluate((node) => {
      const probe = document.createElement('span'); probe.style.color = 'var(--utility-on-primary)'; node.append(probe);
      const result = [getComputedStyle(node).color, getComputedStyle(probe).color]; probe.remove(); return result;
    });
    expect(colors[0]).toBe(colors[1]);
  }
});

test('Native audio inherits every preset surface without replacing accessible playback', async ({ page }) => {
  await openUtility(page);
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const mode of ['light', 'dark']) {
      await page.selectOption('#modeSelect', mode);
      const audio = page.locator('#native audio[controls]');
      const facts = await audio.evaluate((node) => {
        const s = getComputedStyle(node);
        const probe = document.createElement('div');
        probe.style.cssText = 'background:var(--usk-native-control-bg);border-radius:var(--usk-native-radius);';
        node.parentElement.append(probe); const p = getComputedStyle(probe);
        const result = { width: node.clientWidth, parent: node.parentElement.clientWidth, border: parseFloat(s.borderTopWidth), radius: s.borderRadius, expectedRadius: p.borderRadius, paint: s.backgroundImage + s.backgroundColor, expectedPaint: p.backgroundImage + p.backgroundColor, controls: node.controls };
        probe.remove(); return result;
      });
      expect(facts.controls, preset.id).toBe(true);
      expect(facts.width, preset.id).toBeGreaterThan(250);
      expect(facts.border, preset.id).toBeGreaterThanOrEqual(1);
      expect(facts.radius, preset.id).toBe(facts.expectedRadius);
      expect(facts.paint, preset.id).toBe(facts.expectedPaint);
    }
  }
});

test('Industrial review surfaces remain readable at desktop and mobile widths', async ({ page }) => {
  test.setTimeout(90_000);
  await openUtility(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    await settleLayout(page);
    for (const width of [1115, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await settleLayout(page);
      for (const [name, selector] of [['inputs', '.demo-iu-panel-inputs'], ['buttons', '.demo-iu-panel-buttons'], ['status', '.demo-iu-panel-status'], ['marketing', '.utility-card-service'], ['table', '[data-testid="native-table"]'], ['audio', '#native audio[controls]'], ['typography', '.demo-native-sample.utility-panel:first-child']]) {
        const overflow = await captureStableNode(page, selector, `.tmp/industrial-review-${name}-${mode}-${width}.png`);
        expect(overflow, `${name}/${mode}/${width}`).toBeLessThanOrEqual(2);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
    }
  }
});
