import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'index.html')).href;

const representativeStates = [
  { ui: 'minimal-saas', theme: 'arctic-indigo', mode: 'light', bridge: false },
  { ui: 'cyberpunk', theme: 'midnight-gold', mode: 'dark', bridge: true },
  { ui: 'retro-glass', theme: 'royal-plum', mode: 'contrast', bridge: true }
];

async function applyState(page, { ui, theme, mode, bridge }) {
  await page.selectOption('#uiSelect', ui);
  await page.selectOption('#themeSelect', theme);
  await page.selectOption('#modeSelect', mode);
  await page.locator('#bridgeToggle').setChecked(bridge, { force: true });
  await expect(page.locator('body')).toHaveAttribute('data-ui', ui);
  await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('body')).toHaveAttribute('data-bridge', bridge ? 'attached' : 'detached');
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
