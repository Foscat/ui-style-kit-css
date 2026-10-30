import fs from 'node:fs';
import { createHash } from 'node:crypto';

import { expect, test } from '@playwright/test';

const css = fs.readFileSync(process.env.USK_ADMISSION_CSS ?? new URL('../../dist/ui-style-kit.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));

test('React mixed button classes preserve attribute-selected paint across presets', async ({ page }) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(`<style>${css}\nmain { background:var(--usk-native-bg);color:var(--usk-native-text);padding:16px; } * { animation:none!important;transition:none!important; }</style><main></main>`);
  const requested = process.env.USK_MIXED_PRESET_FILTER?.split(',');
  const presets = requested ? manifest.presets.filter(({ id }) => requested.includes(id)) : manifest.presets;
  expect(presets.length).toBe(requested?.length ?? manifest.presets.length);
  const result = await page.evaluate(({ presets, themes, buttonVariants }) => {
    const root = document.querySelector('main');
    const variants = ['neutral', ...buttonVariants];
    const properties = ['color', 'background-color', 'background-image', 'border-top-color'];
    const failures = [];
    const coveredThemes = new Set();
    let states = 0;
    for (const { id, prefix } of presets) {
      root.dataset.ui = id;
      root.innerHTML = variants.map(variant => {
        /** Neutral is the absence of a variant attribute, as specified by the public manifest. */
        const attribute = variant === 'neutral' ? '' : ` data-ui-variant="${variant}"`;
        return `<button data-specimen="semantic-${variant}" class="usk-button"${attribute}>${variant}</button><button data-specimen="mixed-${variant}" class="usk-button ${prefix}-button"${attribute}>${variant}</button>`;
      }).join('');
      /** Theme IDs are strings; object destructuring silently repeats the native palette. */
      for (const theme of [null, ...themes]) {
        coveredThemes.add(theme);
        if (theme) root.dataset.theme = theme; else delete root.dataset.theme;
        for (const mode of ['light', 'dark', 'contrast']) {
          root.dataset.mode = mode;
          for (const pressed of [false, true]) {
            for (const button of root.querySelectorAll('button')) button.setAttribute('aria-pressed', String(pressed));
            for (const variant of variants) {
              const semantic = getComputedStyle(root.querySelector(`[data-specimen="semantic-${variant}"]`));
              const mixed = getComputedStyle(root.querySelector(`[data-specimen="mixed-${variant}"]`));
              for (const property of properties) {
                const expected = semantic.getPropertyValue(property), actual = mixed.getPropertyValue(property);
                if (actual !== expected) failures.push({ preset:id, theme, mode, pressed, variant, property, expected, actual });
              }
            }
            states += 1;
          }
        }
      }
    }
    return {states, failures, coveredThemes: [...coveredThemes]};
  }, { presets, themes: manifest.themes, buttonVariants: manifest.semanticComponentApi.variantAttribute.valuesBySelector['.usk-button'] });
  fs.writeFileSync(test.info().outputPath('variant-paint-evidence.json'), JSON.stringify({ ...result, cssSha256:createHash('sha256').update(css).digest('hex') }, null, 2));
  expect(result.states).toBe(presets.length * (manifest.themes.length + 1) * 3 * 2);
  expect(result.coveredThemes).toEqual([null, ...manifest.themes]);
  expect(result.failures.length, JSON.stringify(result.failures.slice(0, 12), null, 2)).toBe(0);
});
