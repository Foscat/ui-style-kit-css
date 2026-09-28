import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(currentDirectory, '..', '..', 'index.html')).href;
const modes = ['light', 'dark', 'contrast'];

test.use({ video: 'off' });

/**
 * Waits until theme and mode color transitions have left their intermediate states.
 * @param {import('@playwright/test').Page} page Active demo page.
 * @returns {Promise<void>} Resolves when no CSS transition is still running.
 */
async function waitForSettledColorTransitions(page) {
  await page.waitForFunction(() => document.getAnimations()
    .filter((animation) => animation.constructor.name === 'CSSTransition')
    .every((animation) => animation.playState === 'finished'));
}

test('demo content retains readable contrast across every shared theme and mode', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(demoUrl);
  const failures = [];

  for (const theme of manifest.themes) {
    await page.selectOption('#themeSelect', theme);
    for (const mode of modes) {
      await page.selectOption('#modeSelect', mode);
      await waitForSettledColorTransitions(page);
      const results = await new AxeBuilder({ page })
        .include('.demo-controls')
        .include('main')
        .withRules(['color-contrast'])
        .analyze();

      for (const violation of results.violations) {
        failures.push({
          theme,
          mode,
          id: violation.id,
          nodeCount: violation.nodes.length,
          targets: violation.nodes.slice(0, 5).map(({ target }) => target)
        });
      }
    }
  }

  expect(failures).toEqual([]);
});

test('semantic chip labels remain readable on shared soft surfaces', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await waitForSettledColorTransitions(page);
  await page.evaluate(() => {
    const fixture = document.createElement('section');
    fixture.id = 'semantic-chip-contrast-fixture';
    fixture.className = 'ui-card';
    fixture.innerHTML = `
      <span class="ui-chip" data-ui-variant="success">Success</span>
      <span class="ui-chip" data-ui-variant="warning">Warning</span>
      <span class="ui-chip" data-ui-variant="danger">Danger</span>
    `;
    document.querySelector('main')?.prepend(fixture);
  });

  const results = await new AxeBuilder({ page })
    .include('#semantic-chip-contrast-fixture')
    .withRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});
