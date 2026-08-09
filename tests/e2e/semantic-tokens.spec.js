import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.visual.css'), 'utf8');

const tokenProbes = [
  ['--ui-color-bg', '--usk-bg-rgb', 'background-color', true],
  ['--ui-color-surface', '--usk-native-surface-strong', 'background-color'],
  ['--ui-color-text', '--usk-native-text', 'color'],
  ['--ui-color-muted', '--usk-native-text-muted', 'color'],
  ['--ui-color-primary', '--usk-native-primary', 'background-color'],
  ['--ui-color-on-primary', '--usk-native-on-primary', 'color'],
  ['--ui-color-border', '--usk-native-border', 'border-top-color'],
  ['--ui-radius-control', '--usk-native-radius', 'border-radius'],
  ['--ui-shadow-control', '--usk-native-shadow', 'box-shadow'],
  ['--ui-focus-color', '--usk-native-focus', 'outline-color'],
  ['--ui-motion-duration', '--usk-motion-duration', 'transition-duration'],
  ['--ui-motion-easing', '--usk-motion-easing', 'transition-timing-function']
];

async function resolvedValues(page) {
  return page.evaluate((probes) => probes.map(([semanticToken, sourceToken, propertyName, wrapRgb]) => {
    const semanticProbe = document.createElement('span');
    const sourceProbe = document.createElement('span');
    semanticProbe.style.setProperty(propertyName, `var(${semanticToken})`);
    sourceProbe.style.setProperty(propertyName, wrapRgb ? `rgb(var(${sourceToken}))` : `var(${sourceToken})`);
    document.body.append(semanticProbe, sourceProbe);
    const result = {
      semantic: getComputedStyle(semanticProbe).getPropertyValue(propertyName),
      source: getComputedStyle(sourceProbe).getPropertyValue(propertyName)
    };
    semanticProbe.remove();
    sourceProbe.remove();
    return result;
  }), tokenProbes);
}

test('all presets, themes, and modes publish the same typed semantic values as their namespaced sources', async ({ page }) => {
  await page.setContent(`<style>${visualCss}</style><body></body>`);

  for (const { id } of manifest.presets) {
    for (const theme of manifest.themes) {
      for (const mode of manifest.modes) {
        await page.locator('body').evaluate((body, attributes) => {
          body.dataset.ui = attributes.id;
          body.dataset.theme = attributes.theme;
          body.dataset.mode = attributes.mode;
        }, { id, theme, mode });

        const resolved = await resolvedValues(page);
        for (const [index, [semantic]] of tokenProbes.entries()) {
          const values = resolved[index];
          expect(values.semantic, `${id}/${theme}/${mode} ${semantic}`).toBe(values.source);
          expect(values.semantic, `${id}/${theme}/${mode} ${semantic} should resolve`).not.toBe('');
        }
      }
    }
  }
});
