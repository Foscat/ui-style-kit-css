import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** Guard the reproduced translucent badge variants against unreadable signal ink. */
for (const variant of ['warning', 'success']) {
  test(`Bento ${variant} badge labels retain AA contrast in every palette and mode`, async ({ page }) => {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    const themes = [null, ...manifest.themes];
    for (const file of ['dist/ui-style-kit.visual.css', 'dist/ui-style-kit.visual.min.css', 'dist/visual/bento.css']) {
      await page.setContent(`<html data-ui="bento" data-mode="light"><body>
        <span class="bento-badge bento-badge-${variant}">${variant}</span>
        <span class="usk-badge" data-ui-variant="${variant}">${variant}</span>
        <span class="ui-badge" data-ui-variant="${variant}">${variant}</span>
      </body></html>`);
      await page.addStyleTag({ path: path.resolve(file) });
      for (const mode of ['light', 'dark', 'contrast']) {
        for (const theme of themes) {
          const readings = await page.evaluate(({ mode, theme }) => {
            const root = document.documentElement;
            root.dataset.mode = mode;
            if (theme) root.dataset.theme = theme;
            else root.removeAttribute('data-theme');
            const rgba = (css) => css.match(/[\d.]+/g).map(Number);
            const over = (top, bottom) => {
              const alpha = top[3] ?? 1;
              return top.slice(0, 3).map((value, index) => value * alpha + bottom[index] * (1 - alpha));
            };
            const luminance = (rgb) => rgb.reduce((sum, channel, index) => {
              const value = channel / 255;
              return sum + [0.2126, 0.7152, 0.0722][index] *
                (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
            }, 0);
            return [...document.querySelectorAll('span')].map((badge) => {
              const ancestors = [];
              for (let node = badge; node; node = node.parentElement) ancestors.unshift(node);
              const background = ancestors.reduce((paint, node) => over(rgba(getComputedStyle(node).backgroundColor), paint), [255, 255, 255]);
              const foreground = over(rgba(getComputedStyle(badge).color), background);
              const a = luminance(foreground);
              const b = luminance(background);
              return { className: badge.className, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
            });
          }, { mode, theme });
          for (const reading of readings) {
            expect(reading.ratio, `${file}: ${theme ?? 'reference'} ${mode} ${reading.className}`).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });
}
