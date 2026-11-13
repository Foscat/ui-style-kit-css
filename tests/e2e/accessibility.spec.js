import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'index.html')).href;

const representativeStates = [
  { ui: 'editorial-luxe', theme: 'arctic-indigo', mode: 'light', bridge: false },
  { ui: 'editorial-luxe', theme: 'arctic-indigo', mode: 'dark', bridge: false },
  { ui: 'editorial-luxe', theme: 'arctic-indigo', mode: 'contrast', bridge: false },
  { ui: 'art-deco', theme: 'arctic-indigo', mode: 'light', bridge: false },
  { ui: 'art-deco', theme: 'arctic-indigo', mode: 'dark', bridge: false },
  { ui: 'art-deco', theme: 'arctic-indigo', mode: 'contrast', bridge: false },
  { ui: 'minimal-saas', theme: 'arctic-indigo', mode: 'light', bridge: false },
  { ui: 'cyberpunk', theme: 'midnight-gold', mode: 'dark', bridge: true },
  { ui: 'data-terminal', theme: 'arctic-indigo', mode: 'contrast', bridge: false },
  { ui: 'retro-glass', theme: 'royal-plum', mode: 'contrast', bridge: true }
];

/**
 * Apply a demo palette and wait for its actual paint transitions before measuring contrast.
 * @param {import("@playwright/test").Page} page Active demo page.
 * @param {object} state Preset, palette, mode and bridge selection.
 * @returns {Promise<void>} Resolves after the selected state and finite CSS transitions settle.
 */
async function applyState(page, { ui, theme, mode, bridge }) {
  await page.selectOption('#uiSelect', ui);
  await page.selectOption('#themeSelect', theme);
  await page.selectOption('#modeSelect', mode);
  await page.locator('#bridgeToggle').setChecked(bridge, { force: true });
  await expect(page.locator('body')).toHaveAttribute('data-ui', ui);
  await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('body')).toHaveAttribute('data-bridge', bridge ? 'attached' : 'detached');
  // Match the existing demo-theme-contrast readiness contract; do not disable motion or Axe rules.
  await page.waitForFunction(() => document.getAnimations()
    .filter((animation) => animation.constructor.name === 'CSSTransition')
    .every((animation) => animation.playState === 'finished'));
}

test.describe('representative accessibility scans', () => {
  for (const state of representativeStates) {
    test(`${state.ui} / ${state.theme} / ${state.mode} / bridge-${state.bridge}`, async ({ page }) => {
      await page.goto(demoUrl);
      await applyState(page, state);

      const results = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
