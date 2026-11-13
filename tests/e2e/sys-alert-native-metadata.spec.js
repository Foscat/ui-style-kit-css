import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** Native metadata keeps the semantic alert body's ink instead of unrelated muted page paint. */
test('Semantic alert metadata inherits owning message ink in Minimal SaaS and Bento', async ({
  page
}) => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  for (const preset of ['minimal-saas', 'bento']) {
    for (const file of [
      'dist/ui-style-kit.visual.css',
      'dist/ui-style-kit.visual.min.css',
      `dist/visual/${preset}.css`
    ]) {
      const bodies = ['usk', 'ui']
        .flatMap((namespace) =>
          ['warning', 'danger'].map(
            (tone) =>
              `<div class="${namespace}-alert" data-ui-variant="${tone}"><div class="usk-alert-body usk-alert__body"><div><span>Unable to load the current records.</span><small>Request reference: owned-ui-regression</small></div></div></div>`
          )
        )
        .join('');
      await page.setContent(
        `<html data-ui="${preset}" data-mode="light"><body>${bodies}</body></html>`
      );
      await page.addStyleTag({ path: path.resolve(file) });
      await page.addStyleTag({ path: path.resolve('styles/component-composition.css') });
      const readings = await page.evaluate(
        ({ themes }) => {
          const root = document.documentElement;
          const failures = [];
          let states = 0;
          for (const mode of ['light', 'dark', 'contrast']) {
            for (const theme of [null, ...themes]) {
              root.dataset.mode = mode;
              if (theme) root.dataset.theme = theme;
              else delete root.dataset.theme;
              for (const body of document.querySelectorAll('.usk-alert__body')) {
                const expected = getComputedStyle(body).color;
                const actual = getComputedStyle(body.querySelector('small')).color;
                if (actual !== expected)
                  failures.push({
                    mode,
                    theme,
                    tone: body.parentElement.dataset.uiVariant,
                    expected,
                    actual
                  });
                states += 1;
              }
            }
          }
          return { failures, states };
        },
        { themes: manifest.themes }
      );
      expect(readings.states).toBe((manifest.themes.length + 1) * 3 * 2 * 2);
      expect(
        readings.failures,
        `${file}: ${JSON.stringify(readings.failures.slice(0, 8))}`
      ).toEqual([]);
    }
  }
});
