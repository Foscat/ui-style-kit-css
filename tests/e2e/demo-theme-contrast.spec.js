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
