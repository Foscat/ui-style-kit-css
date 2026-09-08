import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const evidence = path.join(os.tmpdir(), 'usk-art-deco-template');
fs.mkdirSync(evidence, { recursive: true });
let server;
let demoUrl;

/** Serves the existing static demo for WebKit's same-origin stylesheet audit. */
test.beforeAll(async () => {
  const root = path.resolve('.');
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
  server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
      const relative = path.relative(root, file);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(file)]) { response.writeHead(404).end(); return; }
      const content = await fs.promises.readFile(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] }).end(content);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  demoUrl = `http://127.0.0.1:${server.address().port}/index.html?view=reference`;
});

test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test('Art Deco typography, progress fill, compact empty state and dismiss icons', async ({ page }) => {
  const root = await openBoard(page);
  await expect(root.locator('.deco-masthead-title')).toHaveCSS('font-family', /Georgia, serif$/);
  await expect(root.locator('.deco-progress-bar')).toHaveCSS('display', 'block');
  expect(await root.locator('.deco-progress-bar').evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThan(2);
  expect(await root.locator('.deco-empty-state').evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(80);
  const choices = await root.locator('.demo-ad-checks .deco-check').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().y));
  expect(choices[1]).toBeGreaterThan(choices[0]);
  const close = root.getByRole('button', { name: 'Dismiss Success', exact: true });
  await expect(close).toHaveCSS('padding', '0px');
  expect(await close.locator('svg').evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThanOrEqual(16);
});

test('Art Deco includes calibration ticks and the diamond divider', async ({ page }) => {
  const root = await openBoard(page);
  const geometry = await root.evaluate((node) => ({
    divider: getComputedStyle(node.querySelector('.deco-divider'), '::after').content,
    ticks: getComputedStyle(node.querySelector('.deco-slider-wrap'), '::before').backgroundImage
  }));
  expect(geometry.divider).toBe('""');
  expect(geometry.ticks).toContain('repeating-linear-gradient');
});

/** Opens the generated local bundle with the canonical palette. */
async function openBoard(page, mode = 'dark') {
  await page.setViewportSize({ width: 1920, height: 1280 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#modeSelect', mode);
  await page.getByRole('button', { name: 'Use reference palette', exact: true }).click();
  return page.getByTestId('art-deco-template-specimen');
}

test('Art Deco inventory and all-preset isolation', async ({ page }) => {
  test.setTimeout(60000);
  const root = await openBoard(page);
  await expect(root.locator('[data-component]')).toHaveCount(17);
  for (const suffix of manifest.classApi.presetExtras['art-deco']) {
    await expect(page.locator(`.deco-${suffix}`).first(), suffix).toBeAttached();
  }
  for (const preset of manifest.presets) {
    await page.selectOption('#uiSelect', preset.id);
    for (const region of await page.locator('[data-preset-only]').all()) {
      if (await region.getAttribute('data-preset-only') !== preset.id) await expect(region).toBeHidden();
    }
    await expect(page.getByTestId('art-deco-template-specimen')).toHaveCount(preset.id === 'art-deco' ? 1 : 0);
  }
});

test('Art Deco touch controls retain 44px targets', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await openBoard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const root = page.getByTestId('art-deco-template-specimen');
  for (const selector of ['.deco-button-primary', '.deco-icon-button', '.deco-alert-close', '.deco-chip button', '.deco-stepper button', '.deco-tab', '.deco-check', '.deco-switch']) {
    expect(await root.locator(selector).first().evaluate((node) => node.getBoundingClientRect().height), selector).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

for (const mode of ['dark', 'light']) {
  test(`Art Deco ${mode} canonical material and accessibility`, async ({ page }) => {
    const root = await openBoard(page, mode);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(root.locator('.deco-frame-navy')).toHaveCSS('background-color', mode === 'dark' ? 'rgb(8, 26, 47)' : 'rgb(13, 35, 61)');
    await expect(root.locator('.deco-frame-navy .deco-section-title')).toHaveCSS('color', 'rgb(246, 242, 231)');
    await expect(root.locator('.deco-button-primary').first()).toHaveCSS('color', 'rgb(246, 242, 231)');
    await expect(root.locator('.deco-spinner').first()).toHaveCSS('animation-name', 'none');
    await expect(root.locator('.deco-swatch')).toHaveCount(8);
    await expect(root.locator('.deco-stage')).toHaveCount(5);
    await expect(root.locator('.deco-input-valid')).toHaveCSS('border-left-width', '3px');
    await page.mouse.move(0, 0);
    await root.screenshot({ path: path.join(evidence, `${mode}.png`), style: '.demo-controls { visibility: hidden; }' });
    expect((await new AxeBuilder({ page }).include('#art-deco-template').analyze()).violations).toEqual([]);
  });
}

test('Art Deco interactions, token switching, and responsive geometry', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const root = await openBoard(page);
  await root.locator('#deco-range').focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('#deco-range-value')).toHaveText('69');
  await root.getByRole('tab').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  await root.getByRole('button', { name: 'Remove Design', exact: true }).click();
  await expect(root.getByRole('button', { name: 'Remove Design', exact: true })).toHaveCount(0);
  await root.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(root.locator('#deco-quantity')).toHaveText('3');
  await root.getByRole('button', { name: 'Dismiss Success', exact: true }).click();
  await expect(root.locator('.deco-alert-success')).toBeHidden();
  const opener = root.getByRole('button', { name: 'Primary action', exact: true });
  await opener.click();
  await expect(root.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(root.locator('dialog')).toBeHidden();
  await expect(opener).toBeFocused();
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.evaluate(() => {
    document.body.style.setProperty('--usk-primary-rgb', '17 101 173');
    document.body.style.setProperty('--usk-primary-text-rgb', '255 255 255');
  });
  await page.mouse.move(0, 0);
  await expect(root.locator('.deco-button-primary').first()).toHaveCSS('background-color', 'rgb(17, 101, 173)');
  await expect(root.locator('.deco-button-primary').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect((await new AxeBuilder({ page }).include('#art-deco-template').analyze()).violations).toEqual([]);
  for (const width of [602, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const section of await root.locator('[data-component]').all()) {
      expect(await section.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
    const busy = root.locator('.deco-button-loading').first();
    expect(await busy.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  }
  await root.locator('[data-component="buttons"]').screenshot({ path: path.join(evidence, 'mobile.png') });
  expect(errors).toEqual([]);
});
