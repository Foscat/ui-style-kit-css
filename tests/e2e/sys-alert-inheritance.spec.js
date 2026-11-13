import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** Preserve the parent alert's semantic ink when its body contains native prose or lists. */
test('Bento alert body lists inherit semantic message ink across palettes and modes', async ({ page }) => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const file of ['dist/ui-style-kit.visual.css', 'dist/ui-style-kit.visual.min.css', 'dist/visual/bento.css']) {
    await page.setContent('<html data-ui="bento" data-mode="light"><body>' + ['usk', 'ui'].map(namespace =>
      `<div class="${namespace}-alert" data-ui-variant="warning"><div class="usk-alert-body usk-alert__body"><p>Review the intake requirements.</p><ul><li>Choose a part template.</li></ul><ol><li>Confirm the condition.</li></ol></div></div>`
    ).join('') + '</body></html>');
    await page.addStyleTag({ path: path.resolve(file) });
    await page.addStyleTag({ path: path.resolve('styles/component-composition.css') });
    const readings = await page.evaluate(({ themes }) => {
      const root = document.documentElement;
      const failures = [];
      let states = 0;
      for (const mode of ['light', 'dark', 'contrast']) {
        for (const theme of [null, ...themes]) {
          root.dataset.mode = mode;
          if (theme) root.dataset.theme = theme; else delete root.dataset.theme;
          for (const body of document.querySelectorAll('.usk-alert__body')) {
            const expected = getComputedStyle(body).color;
            for (const descendant of body.querySelectorAll('p, ul, ol, li')) {
              const actual = getComputedStyle(descendant).color;
              if (actual !== expected) failures.push({ mode, theme, tag: descendant.tagName, expected, actual });
              states += 1;
            }
          }
        }
      }
      return { failures, states };
    }, { themes: manifest.themes });
    expect(readings.states).toBe((manifest.themes.length + 1) * 3 * 2 * 5);
    expect(readings.failures, `${file}: ${JSON.stringify(readings.failures.slice(0, 8))}`).toEqual([]);
  }
});
