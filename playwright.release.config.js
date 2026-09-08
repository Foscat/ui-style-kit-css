import { defineConfig, devices } from '@playwright/test';

/**
 * Matches the bounded browser coverage used by pull-request and publish gates.
 *
 * The exhaustive multi-engine suite remains opt-in through `test:e2e:full`.
 *
 * @type {RegExp[]}
 */
const releaseSmokePatterns = [
  /representative accessibility scans/,
  /demo loads with default theme settings/,
  /demo control options are populated from the manifest snapshot/,
  /switching demo controls updates body attributes and rendered classes/,
  /semantic demo nodes and classes remain unchanged through every preset switch/,
  /every preset resolves mode fallbacks and lets explicit themes own color roles/,
  /demo starts with the interactive surface bridge detached and can attach it/,
  /component showcase avoids overlap and oversized empty card areas/,
  /native specimen exposes the complete semantic control state matrix/,
  /layout wrappers contain long text without page-level overflow/,
  /every preset select renders exactly one dropdown indicator/,
  /every preset trust seal emphasizes the number over the caption/,
  /semantic aliases preserve every shared safety property across all presets/,
  /semantic buttons and cards match prefixed twins across every preset/,
  /semantic buttons retain keyboard focus and forced-colors behavior/,
  /semantic form controls match proven prefixed structures across every preset/,
  /semantic forms retain focus, disabled, checked, axe, and forced-colors behavior/,
  /remaining semantic roles and variants match prefixed twins across every preset/,
  /remaining roles retain focus, reduced-motion, forced-colors, and axe semantics/,
  /all presets, themes, and modes publish the same typed semantic values as their namespaced sources/,
  /canonical and deprecated adapter backgrounds preserve direct source behavior across all configurations/,
  /Editorial Lux annotation fixes/,
  /Editorial Lux light warning foregrounds retain readable contrast/,
  /Maximalist display and control typography stay legible across theme modes/,
  /Neo Noir annotation geometry and directional tooltips/,
  /Neo Noir .* geometry and accessibility/,
  /Organic annotations share a leaf loader and center marketing details/,
  /Bauhaus accessible controls and reference contrast/,
  /Retrofuturism uses compact rectangular appliance buttons for prefixed and native actions/,
  /Retrofuturism uses enamel medallions and an orbital loading instrument/,
  /Retrofuturism forms use recessed fields, one selector indicator, and a calibrated range/,
  /Art Deco icon-button glyphs are legible and geometrically centered/,
  /Art Deco authored checkbox marks are optically centered/,
  /Art Deco feature medallions stay centered and seal copy stays readable/,
  /Y2K native controls and dialogs use the same compact bevel system/,
  /Paper Editorial keyboard, dialogs, tokens, and responsive containment/,
  /Industrial review surfaces remain readable at desktop and mobile widths/,
  /Industrial warning signals use warning paint and danger examples opt into alarms/,
  /Technical Blueprint annotation geometry keeps loaders and status markers aligned/,
  /Data Terminal keeps controls and icons on the dense terminal grid/,
  /Bento native samples flow without row-height gaps on desktop and mobile/,
  /Clay reference controls are functional and isolated across every preset/,
  /Clay keyboard navigation, uploads and contrast remain usable/
];

/**
 * Combines the individual smoke-test matchers into one Playwright grep value.
 *
 * @returns {RegExp} Playwright grep expression for the release smoke suite.
 */
function releaseSmokeGrep() {
  return new RegExp(releaseSmokePatterns.map((pattern) => `(?:${pattern.source})`).join('|'));
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 5_000
  },
  grep: releaseSmokeGrep(),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
