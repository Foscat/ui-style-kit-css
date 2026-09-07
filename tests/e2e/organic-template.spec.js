import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs/promises';

let server;
let origin;

/** Serves generated assets on an isolated ephemeral port for WebKit's font-origin policy. */
test.beforeAll(async ({ browserName }) => {
  if (browserName !== 'webkit') return;
  const root = path.resolve('.');
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
  server = http.createServer(async (request, response) => {
    try {
      const filename = path.resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
      const relative = path.relative(root, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Outside fixture root');
      const bytes = await fs.readFile(filename);
      response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' });
      response.end(bytes);
    } catch {
      response.writeHead(request.url === '/favicon.ico' ? 204 : 404);
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

/** Opens the local generated distribution, leaving the user's browser session untouched. */
async function openOrganic(page) {
  await page.goto(origin ? `${origin}/index.html?view=reference` : pathToFileURL(path.resolve('index.html')).href + '?view=reference');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.selectOption('#uiSelect', 'organic-modern');
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
}

test('Organic reference palettes and complete theme paint retain their geometry', async ({ page }) => {
  test.setTimeout(120_000);
  await openOrganic(page);
  await page.locator('[data-organic-reference]').click();
  for (const [mode, bg, surface] of [['light', 'rgb(244, 240, 232)', 'rgb(248, 245, 239)'], ['dark', 'rgb(11, 13, 11)', 'rgb(17, 19, 15)']]) {
    await page.selectOption('#modeSelect', mode);
    await expect(page.locator('body')).not.toHaveAttribute('data-theme');
    await expect(page.locator('.organic-sheet')).toHaveCSS('background-color', bg);
    await expect(page.locator('.organic-control-lab')).toHaveCSS('background-color', surface);
  }
  const themes = await page.locator('#themeSelect option').evaluateAll((nodes) => nodes.map((n) => n.value).filter((v) => v && v !== 'reference-palette'));
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    for (const theme of themes) {
      await page.selectOption('#themeSelect', theme);
      const pairs = await page.evaluate(() => {
        const probe = document.createElement('span');
        document.body.append(probe);
        const results = [['.organic-sheet', 'backgroundColor', 'bg'], ['.organic-control-lab', 'backgroundColor', 'surface'], ['.organic-hero-overlay', 'backgroundColor', 'surface'], ['.organic-panel', 'backgroundColor', 'surface'], ['.ui-card', 'backgroundColor', 'surface'], ['#organic-text', 'backgroundColor', 'bg'], ['.organic-sheet', 'color', 'text'], ['.organic-button-primary', 'backgroundColor', 'primary'], ['.organic-button-primary', 'color', 'primary-text'], ['.organic-button-danger', 'backgroundColor', 'danger'], ['.organic-button-danger', 'color', 'danger-text']].map(([selector, property, role]) => {
          probe.style.color = `rgb(var(--usk-${role}-rgb))`;
          return [selector, property, getComputedStyle(document.querySelector(selector))[property], getComputedStyle(probe).color];
        });
        for (const [selector, property, role] of [['.organic-select', 'backgroundColor', 'bg'], ['[data-organic-pressed]', 'backgroundColor', 'surface-strong'], ['[data-organic-pressed]', 'color', 'text'], ['.organic-tooltip', 'backgroundColor', 'surface-strong'], ['.organic-tooltip', 'color', 'text']]) {
          probe.style.color = `rgb(var(--usk-${role}-rgb))`;
          results.push([selector, property, getComputedStyle(document.querySelector(selector))[property], getComputedStyle(probe).color]);
        }
        probe.remove();
        return results;
      });
      for (const [selector, property, actual, expected] of pairs) expect(actual, `${mode}/${theme}/${selector}/${property}`).toBe(expected);
      await expect(page.locator('.organic-control-lab')).toHaveCSS('border-radius', '14px 14px 14px 26px');
    }
  }
  await page.evaluate(() => document.body.style.setProperty('--usk-surface-rgb', '35 55 45'));
  await expect(page.locator('.organic-control-lab')).toHaveCSS('background-color', 'rgb(35, 55, 45)');
});

test('Organic controls operate and the reference remains readable at desktop and mobile sizes', async ({ page }) => {
  await openOrganic(page);
  await page.locator('[data-organic-reference]').click();
  await page.locator('[data-organic-password]').click();
  await expect(page.locator('#organic-password')).toHaveAttribute('type', 'text');
  await page.locator('[data-organic-remove]').first().click();
  await expect(page.locator('.organic-token')).toHaveCount(1);
  await page.locator('#organic-price').fill('83');
  await expect(page.locator('output[for="organic-price"]')).toHaveText('$83');
  await page.getByRole('button', { name: 'Increase Organic quantity', exact: true }).click();
  await expect(page.locator('.organic-stepper output')).toHaveText('2');
  await page.getByRole('tab', { name: 'Analysis', exact: true }).click();
  await expect(page.locator('#organic-tab-panel')).toContainText('Analysis');
  await page.locator('[data-organic-modal]').first().click();
  await expect(page.locator('#organic-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#organic-modal')).not.toBeVisible();
  for (const mode of ['light', 'dark']) {
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
    await page.selectOption('#modeSelect', mode);
    await page.setViewportSize({ width: 1920, height: 1280 });
    await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'hidden'; });
    await page.locator('.organic-sheet').screenshot({ path: `.tmp/organic-${mode}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.locator('.organic-sheet').evaluate((n) => n.scrollWidth - n.clientWidth)).toBeLessThanOrEqual(2);
    await page.locator('.organic-sheet').screenshot({ path: `.tmp/organic-${mode}-mobile.png` });
    await page.locator('#organic-choices').screenshot({ path: `.tmp/organic-${mode}-choices.png` });
  }
  await page.locator('.demo-controls').evaluate((node) => { node.style.visibility = 'visible'; });
  await page.selectOption('#uiSelect', 'minimal-saas');
  await expect(page.locator('#organic-template')).toHaveCount(0);
});

test('Organic assets, typography, states and accessibility match the retained reference', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const onConsole = (message) => { if (message.type() === 'error') errors.push(message.text()); };
  page.on('console', onConsole);
  await openOrganic(page);
  await page.locator('[data-organic-reference]').click();
  await page.setViewportSize({ width: 1920, height: 1280 });
  await expect(page.locator('.organic-brand strong')).toHaveCSS('font-family', /Organic Cormorant/);
  await expect(page.locator('.organic-sheet')).toHaveCSS('font-family', /Organic DM Sans/);
  expect(await page.locator('.organic-icon svg').count()).toBeGreaterThan(35);
  expect(await page.locator('.organic-hero-card img').evaluate((n) => n.complete && n.naturalWidth === 3072)).toBe(true);
  const cols = await page.locator('.organic-workspace').evaluate((n) => getComputedStyle(n).gridTemplateColumns.split(' ').length);
  expect(cols).toBe(3);
  await page.selectOption('#modeSelect', 'light');
  await expect(page.locator('[data-organic-pressed]')).toHaveCSS('background-color', 'rgb(61, 59, 52)');
  expect(errors).toEqual([]);
  // Axe's CSS discovery uses XHR, which file:// blocks; application loading is checked above.
  page.off('console', onConsole);
  for (const mode of ['light', 'dark', 'contrast']) {
    await page.selectOption('#modeSelect', mode);
    const result = await new AxeBuilder({ page }).include('#organic-template').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('Organic keyboard selections, uploads and sample form state are complete', async ({ page }) => {
  await openOrganic(page);
  await page.getByRole('searchbox', { name: 'Search Organic projects' }).fill('Cedar');
  await expect(page.locator('.organic-project-item:visible')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search Organic projects' }).fill('');
  await page.locator('#organic-options [aria-selected="true"]').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-organic-selection]')).toHaveText('Fresh botanicals');
  await expect(page.locator('[data-organic-options]')).toBeFocused();
  await page.locator('[data-organic-tag]').selectOption('Planters');
  await expect(page.locator('.organic-token')).toHaveCount(3);
  await page.locator('.organic-file-drop input').setInputFiles({ name: 'materials.txt', mimeType: 'text/plain', buffer: Buffer.from('Material sample') });
  await expect(page.locator('[data-organic-file-name]')).toHaveText('materials.txt');
  await page.locator('.organic-add-material input').fill('<b>Test material</b>');
  await page.locator('.organic-add-material [name="supplier"]').selectOption('Local materials studio');
  await page.getByRole('button', { name: 'Add material', exact: true }).click();
  await expect(page.locator('[data-organic-rows] tr').last()).toContainText('<b>Test material</b>');
  await expect(page.locator('[data-organic-rows] b')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next schedule pages', exact: true }).click();
  await expect(page.locator('[data-organic-page-summary]')).toHaveText('Showing 6 to 10 of 19 materials');
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Details', exact: true })).toBeFocused();
  await expect(page.locator('#organic-tab-panel')).toContainText('specifications');
});
