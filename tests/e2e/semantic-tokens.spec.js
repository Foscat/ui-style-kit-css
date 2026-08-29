import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.visual.css'), 'utf8');
const adapterSources = {
  canonical: fs.readFileSync(
    path.join(rootDir, 'styles', 'interactive-surface-theme.css'),
    'utf8'
  ),
  deprecated: fs.readFileSync(
    path.join(rootDir, 'styles', 'interactive-surface-bridge.css'),
    'utf8'
  )
};

// These literals reproduce the adapters' reviewed direct source expressions independently.
const directAdapterSourceCss = `
  *, *::before, *::after {
    transition: none !important;
  }

  .direct-surface-source {
    background-color: rgb(var(--usk-surface-soft-rgb, var(--usk-surface-rgb, 244 244 244)));
  }

  .direct-surface-source[data-surface-level="1"] {
    background-color: rgb(var(--usk-surface-soft-rgb, var(--usk-surface-rgb, 244 244 244)));
  }

  .direct-surface-source[data-surface-level="2"] {
    background-color: rgb(var(--usk-surface-strong-rgb, var(--usk-surface-rgb, 255 255 255)));
  }

  .direct-surface-source[data-surface-level="3"] {
    background-color: color-mix(
      in srgb,
      rgb(var(--usk-surface-strong-rgb, var(--usk-surface-rgb, 255 255 255))) 82%,
      rgb(var(--usk-primary-rgb, 72 120 255))
    );
  }

  .adapter-surface-token-source {
    background-color: var(--interactive-surface-bg) !important;
  }

  .direct-surface-token-source {
    background-color: rgb(var(--usk-surface-strong-rgb, var(--usk-surface-rgb, 255 255 255)));
  }

  .semantic-surface-source {
    background-color: var(--ui-color-surface);
  }
`;

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

/** @type {{id: string, theme: string, mode: string}[]} */
const semanticConfigurations = manifest.presets.flatMap(({ id }) =>
  manifest.themes.flatMap((theme) =>
    manifest.modes.map((mode) => ({ id, theme, mode }))
  )
);

/**
 * Audits typed semantic tokens across the complete configuration matrix in one browser call.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<{failureCount: number, samples: object[]}>} Failure total and bounded diagnostics.
 */
async function auditResolvedValues(page) {
  return page.evaluate(({ configurations, probes }) => {
    const pairs = probes.map(([semanticToken, sourceToken, propertyName, wrapRgb]) => {
      const semanticProbe = document.createElement('span');
      const sourceProbe = document.createElement('span');
      semanticProbe.style.setProperty(propertyName, `var(${semanticToken})`);
      sourceProbe.style.setProperty(propertyName, wrapRgb ? `rgb(var(${sourceToken}))` : `var(${sourceToken})`);
      document.body.append(semanticProbe, sourceProbe);
      return { semanticProbe, semanticToken, sourceProbe, propertyName };
    });
    const samples = [];
    let failureCount = 0;

    for (const configuration of configurations) {
      document.body.dataset.ui = configuration.id;
      document.body.dataset.theme = configuration.theme;
      document.body.dataset.mode = configuration.mode;

      for (const { semanticProbe, semanticToken, sourceProbe, propertyName } of pairs) {
        const semantic = getComputedStyle(semanticProbe).getPropertyValue(propertyName);
        const source = getComputedStyle(sourceProbe).getPropertyValue(propertyName);
        if (semantic === source && semantic !== '') continue;

        failureCount += 1;
        if (samples.length < 8) samples.push({ ...configuration, semanticToken, semantic, source });
      }
    }

    return { failureCount, samples };
  }, { configurations: semanticConfigurations, probes: tokenProbes });
}

test('all presets, themes, and modes publish the same typed semantic values as their namespaced sources', async ({ page }) => {
  test.setTimeout(120_000);

  await page.setContent(`<style>${visualCss}</style><body></body>`);
  const audit = await auditResolvedValues(page);

  expect(audit.failureCount, JSON.stringify(audit.samples, null, 2)).toBe(0);
});

test('canonical and deprecated adapter backgrounds preserve direct source behavior across all configurations', async ({ page }) => {
  test.setTimeout(120_000);

  const mismatchCounts = { canonical: 0, deprecated: 0 };
  const mismatchSamples = [];
  const alphaExampleModes = new Set();
  let configurationCount = 0;

  for (const [adapterName, adapterCss] of Object.entries(adapterSources)) {
    await page.setContent(`
      <style>${visualCss}</style>
      <style>${adapterCss}</style>
      <style>${directAdapterSourceCss}</style>
      <body>
        <div id="adapter-base" class="interactive-surface"></div>
        <div id="adapter-level-1" class="interactive-surface" data-surface-level="1"></div>
        <div id="adapter-level-2" class="interactive-surface" data-surface-level="2"></div>
        <div id="adapter-level-3" class="interactive-surface" data-surface-level="3"></div>
        <div id="adapter-token" class="interactive-surface adapter-surface-token-source"></div>
        <div id="source-base" class="direct-surface-source"></div>
        <div id="source-level-1" class="direct-surface-source" data-surface-level="1"></div>
        <div id="source-level-2" class="direct-surface-source" data-surface-level="2"></div>
        <div id="source-level-3" class="direct-surface-source" data-surface-level="3"></div>
        <div id="source-token" class="direct-surface-token-source"></div>
        <div id="semantic-source" class="semantic-surface-source"></div>
      </body>
    `);

    const audit = await page.locator('body').evaluate((body, configurations) => {
      const background = (selector) => getComputedStyle(
        document.querySelector(selector)
      ).backgroundColor;
      const levels = ['base', 'level-1', 'level-2', 'level-3', 'token'];
      const alphaModes = new Set();
      const samples = [];
      let mismatchCount = 0;

      for (const configuration of configurations) {
        body.dataset.ui = configuration.id;
        body.dataset.theme = configuration.theme;
        body.dataset.mode = configuration.mode;
        const backgrounds = {
          adapter: levels.map((level) => background(`#adapter-${level}`)),
          direct: levels.map((level) => background(`#source-${level}`)),
          semantic: background('#semantic-source')
        };

        if (
          ['light', 'dark'].includes(configuration.mode)
          && backgrounds.semantic !== backgrounds.direct.at(-1)
        ) {
          alphaModes.add(configuration.mode);
        }
        if (JSON.stringify(backgrounds.adapter) !== JSON.stringify(backgrounds.direct)) {
          mismatchCount += 1;
          if (samples.length < 4) samples.push({ ...configuration, ...backgrounds });
        }
      }

      return { mismatchCount, samples, alphaModes: [...alphaModes] };
    }, semanticConfigurations);

    if (adapterName === 'canonical') configurationCount += semanticConfigurations.length;
    mismatchCounts[adapterName] = audit.mismatchCount;
    audit.alphaModes.forEach((mode) => alphaExampleModes.add(mode));
    mismatchSamples.push(...audit.samples.map((sample) => ({ adapterName, ...sample })));
  }

  expect(configurationCount).toBe(1200);
  expect([...alphaExampleModes].sort(), 'matrix should exercise light and dark alpha sources')
    .toEqual(['dark', 'light']);
  expect(mismatchCounts, JSON.stringify(mismatchSamples, null, 2)).toEqual({
    canonical: 0,
    deprecated: 0
  });
});
