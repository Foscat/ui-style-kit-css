import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const visualBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.visual.css');
const representativePresets = ['minimal-saas', 'bento', 'cyberpunk'];

/**
 * Returns a consumer-owned card fixture that composes public semantic selectors.
 *
 * Consumer layout rules intentionally load before the library bundle so these
 * checks detect accidental structural ownership in UI Style Kit.
 *
 * @param {object} [options] Fixture options.
 * @param {string} [options.preset='minimal-saas'] Public preset identifier.
 * @returns {string} Complete HTML document for Playwright.
 */
function consumerFixture({ preset = 'minimal-saas' } = {}) {
  return `<!doctype html>
    <html lang="en">
      <head>
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          html, body { margin: 0; min-inline-size: 0; }
          body { padding: 12px; }
          .consumer-card { inline-size: 100%; min-inline-size: 0; }
          .consumer-stack { display: grid; gap: 12px; min-inline-size: 0; }
          .consumer-table-region { min-inline-size: 0; overflow-x: auto; }
          .consumer-table-region table { min-inline-size: 42rem; }
          .consumer-shell { display: grid; grid-template-rows: auto minmax(0, 1fr); max-block-size: calc(100vh - 24px); }
          .consumer-sticky { position: sticky; inset-block-start: 0; z-index: 2; }
          .consumer-scroll { min-block-size: 0; overflow-y: auto; }
          .consumer-scroll-content { block-size: 900px; }
          *, *::before, *::after { animation: none !important; transition: none !important; }
        </style>
      </head>
      <body data-ui="${preset}" data-theme="arctic-indigo" data-mode="light">
        <main class="ui-card consumer-card consumer-shell">
          <header class="ui-toolbar consumer-sticky">
            <strong>Consumer controls</strong>
            <button class="ui-icon-button" aria-label="Open settings">&#9881;</button>
          </header>
          <section class="consumer-stack consumer-scroll">
            <label class="ui-field">
              <span class="ui-label">Workspace</span>
              <select class="ui-select" aria-label="Workspace">
                <option>Operations</option>
              </select>
            </label>
            <label class="ui-field">
              <span class="ui-label">Capacity</span>
              <input type="range" min="0" max="100" value="64" aria-label="Capacity">
            </label>
            <progress value="64" max="100" aria-label="Completion"></progress>
            <p>consumer-owned-unbroken-content-0123456789-abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <div class="ui-table-wrap consumer-table-region" data-testid="table-region">
              <table class="ui-table">
                <thead><tr><th>Service</th><th>Owner</th><th>Availability</th></tr></thead>
                <tbody><tr><td>Inventory synchronization</td><td>Operations</td><td>99.9%</td></tr></tbody>
              </table>
            </div>
            <div class="consumer-scroll-content" aria-hidden="true"></div>
          </section>
        </main>
      </body>
    </html>`;
}

/**
 * Reads horizontal document overflow in CSS pixels.
 *
 * @param {import('@playwright/test').Page} page Active browser page.
 * @returns {Promise<number>} Positive overflow beyond the layout viewport.
 */
async function documentOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const width of [320, 390]) {
  test(`semantic card controls remain contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.setContent(consumerFixture());
    await page.addStyleTag({ path: visualBundlePath });

    await expect(page.locator('.consumer-card')).toBeVisible();
    await expect(page.locator('.ui-select')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
    await expect(page.locator('progress')).toBeVisible();
    await expect(page.locator('.ui-icon-button')).toBeVisible();
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);

    const tableRegion = page.getByTestId('table-region');
    expect(await tableRegion.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeGreaterThan(0);
    expect(await tableRegion.evaluate((node) => getComputedStyle(node).overflowX)).toBe('auto');
  });
}

test('short viewports preserve sticky controls and internal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 360 });
  await page.setContent(consumerFixture({ preset: 'bento' }));
  await page.addStyleTag({ path: visualBundlePath });

  const sticky = page.locator('.consumer-sticky');
  const scrollRegion = page.locator('.consumer-scroll');
  expect(await sticky.evaluate((node) => getComputedStyle(node).position)).toBe('sticky');
  expect(await scrollRegion.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(0);
  expect(await scrollRegion.evaluate((node) => getComputedStyle(node).overflowY)).toBe('auto');

  await scrollRegion.evaluate((node) => { node.scrollTop = 240; });
  expect(await scrollRegion.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  expect(await sticky.boundingBox()).not.toBeNull();
  expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
});

test('icon-only actions retain neutral or subtle paint across representative presets', async ({ page }) => {
  await page.setContent(consumerFixture());
  await page.addStyleTag({ path: visualBundlePath });

  for (const preset of representativePresets) {
    await page.evaluate((id) => { document.body.dataset.ui = id; }, preset);
    await page.locator('.consumer-sticky').evaluate((node) => {
      node.insertAdjacentHTML('beforeend', `
        <button id="neutral-action" class="ui-button">Neutral</button>
        <button id="primary-action" class="ui-button" data-ui-variant="primary">Primary</button>`);
    });

    const paint = await page.evaluate(() => {
      const snapshot = (selector) => {
        const style = getComputedStyle(document.querySelector(selector));
        return {
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          borderColor: style.borderColor,
          color: style.color
        };
      };
      return {
        icon: snapshot('.ui-icon-button'),
        neutral: snapshot('#neutral-action'),
        primary: snapshot('#primary-action')
      };
    });

    expect(paint.icon.color, `${preset} icon action should retain neutral foreground ink`).toBe(paint.neutral.color);
    expect(paint.icon.borderColor, `${preset} icon action should retain the neutral control edge`).toBe(paint.neutral.borderColor);
    expect(paint.icon, `${preset} icon action should not become primary`).not.toEqual(paint.primary);
    await page.locator('#neutral-action, #primary-action').evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  }
});
