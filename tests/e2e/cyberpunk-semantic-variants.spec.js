import fs from 'node:fs';

import { expect, test } from '@playwright/test';

/** Public focused export used by single-preset production consumers. */
const cyberpunkCss = fs.readFileSync(new URL('../../dist/visual/cyberpunk.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));

test('Cyberpunk mixed semantic variants retain paired paint at rest and when pressed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const variants = ['primary', 'secondary', 'danger', 'ghost'];
  await page.setContent(`<style>${cyberpunkCss}\nbutton { transition: none; animation: none; }</style>
    <main data-ui="cyberpunk" data-mode="dark">
      ${variants.map((variant) => `<button id="legacy-${variant}" class="cyber-button cyber-button-${variant}">${variant}</button>
      <button id="mixed-${variant}" class="cyber-button usk-button" data-ui-variant="${variant}">${variant}</button>
      <button id="semantic-${variant}" class="usk-button" data-ui-variant="${variant}">${variant}</button>`).join('')}
    </main>`);
  const result = await page.evaluate(({ themes, variants }) => {
    const root = document.querySelector('main');
    const failures = [];
    let comparisons = 0;
    /** Calculates relative luminance for a computed RGB color.
     * @param {string} color Browser-computed RGB color.
     * @returns {number} Relative luminance.
     */
    function luminance(color) {
      return color.match(/[\d.]+/g).slice(0, 3).map(Number).reduce((sum, channel, index) => {
        const value = channel / 255;
        return sum + [0.2126, 0.7152, 0.0722][index] * (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      }, 0);
    }
    for (const theme of [null, ...themes]) {
      if (theme) root.dataset.theme = theme;
      else root.removeAttribute('data-theme');
      for (const mode of ['light', 'dark', 'contrast']) {
        root.dataset.mode = mode;
        for (const pressed of [false, true]) {
          for (const button of root.querySelectorAll('button')) button.setAttribute('aria-pressed', String(pressed));
          for (const variant of variants) {
            const paints = ['legacy', 'mixed', 'semantic'].map((kind) => {
              const style = getComputedStyle(document.getElementById(`${kind}-${variant}`));
              return { color: style.color, background: style.backgroundColor, image: style.backgroundImage };
            });
            comparisons += 1;
            if (paints.some((paint) => JSON.stringify(paint) !== JSON.stringify(paints[0]))) failures.push({ theme, mode, pressed, variant, reason: 'variant paint differs between supported class models', paints });
            if (variant === 'primary') {
              for (const paint of paints) {
                const foreground = luminance(paint.color);
                const background = luminance(paint.background);
                const ratio = (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
                if (paint.image !== 'none' || Number(paint.background.match(/[\d.]+/g)[3] ?? 1) !== 1 || ratio < 4.5) failures.push({ theme, mode, pressed, variant, reason: 'primary variant lost its solid paired fill', paint, ratio });
              }
            }
          }
        }
      }
    }
    return { comparisons, failureCount: failures.length, samples: failures.slice(0, 6) };
  }, { themes: manifest.themes, variants });
  expect(result.comparisons).toBe((manifest.themes.length + 1) * 3 * 2 * variants.length);
  expect(result.failureCount, JSON.stringify(result.samples, null, 2)).toBe(0);
});
