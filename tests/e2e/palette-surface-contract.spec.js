import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

/** Native emphasis must retain the foreground paired with its library-owned filled surface. */
test('library emphasis inherits readable surface ink across presets palettes and modes', async ({
  page,
}) => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
  await page.goto(pathToFileURL(path.resolve('tests/fixtures/palette-surface.html')).href);
  const mismatches = [];
  for (const { id, prefix } of manifest.presets) {
    for (const theme of ['arctic-indigo', 'midnight-gold']) {
      for (const mode of manifest.modes) {
        const colors = await page.evaluate(
          ({ id, prefix, theme, mode }) => {
            Object.assign(document.body.dataset, { ui: id, theme, mode });
            const surface = document.getElementById('filled-surface');
            surface.className = prefix + '-bg-primary';
            return [surface, ...surface.children].map((node) => getComputedStyle(node).color);
          },
          { id, prefix, theme, mode },
        );
        if (colors.some((color) => color !== colors[0]))
          mismatches.push({ id, theme, mode, colors });
      }
    }
  }
  expect(mismatches).toEqual([]);
});
