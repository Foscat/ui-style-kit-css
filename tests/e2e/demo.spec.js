import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'index.html')).href;

// Keep the smoke-test expectations aligned with the demo's checked-in default controls.
const defaultDemoState = {
  ui: 'minimal-saas',
  theme: 'arctic-indigo',
  mode: 'light'
};

const stylePresets = [
  ['minimal-saas', 'saas'],
  ['bento', 'bento'],
  ['maximalist', 'max'],
  ['bauhaus', 'bau'],
  ['tactile', 'tactile'],
  ['neumorphism', 'neo'],
  ['retrofuturism', 'retro'],
  ['brutalism', 'brutal'],
  ['cyberpunk', 'cyber'],
  ['y2k', 'y2k'],
  ['retro-glass', 'rg']
];

const displayModes = ['light', 'dark', 'contrast'];

test('demo loads with default theme settings', async ({ page }) => {
  await page.goto(demoUrl);

  await expect(page).toHaveTitle(/UI Style Kit CSS Demo/i);

  await expect(page.locator('#uiSelect')).toHaveValue(defaultDemoState.ui);
  await expect(page.locator('#themeSelect')).toHaveValue(defaultDemoState.theme);
  await expect(page.locator('#modeSelect')).toHaveValue(defaultDemoState.mode);

  await expect(page.locator('body')).toHaveAttribute('data-ui', defaultDemoState.ui);
  await expect(page.locator('body')).toHaveAttribute('data-theme', defaultDemoState.theme);
  await expect(page.locator('body')).toHaveAttribute('data-mode', defaultDemoState.mode);

  await expect(page.getByRole('heading', { level: 1, name: 'UI Style Kit CSS' })).toBeVisible();
});

test('switching demo controls updates body attributes and rendered classes', async ({ page }) => {
  await page.goto(demoUrl);

  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.selectOption('#themeSelect', 'midnight-gold');
  await page.selectOption('#modeSelect', 'contrast');

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'cyberpunk');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'midnight-gold');
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'contrast');

  await expect(page.locator('#main .cyber-title')).toBeVisible();
  await expect(page.locator('#main .cyber-button.cyber-button-primary')).toHaveCount(1);
});

test('neutral demo buttons keep theme text color across styles and modes', async ({ page }) => {
  await page.goto(demoUrl);

  for (const [ui, prefix] of stylePresets) {
    await page.selectOption('#uiSelect', ui);

    for (const mode of displayModes) {
      await page.selectOption('#modeSelect', mode);

      const colors = await page.evaluate((tokenPrefix) => {
        const neutralButton = [...document.querySelectorAll('button')]
          .find((button) => button.textContent.trim() === 'Neutral');
        const probe = document.createElement('span');

        // Resolve the CSS custom property through computed styles, matching browser cascade behavior.
        probe.style.color = `var(--${tokenPrefix}-text)`;
        document.body.append(probe);

        const buttonColor = getComputedStyle(neutralButton).color;
        const themeTextColor = getComputedStyle(probe).color;
        probe.remove();

        return { buttonColor, themeTextColor };
      }, prefix);

      expect(colors.buttonColor, `${ui}/${mode} neutral button text`).toBe(colors.themeTextColor);
    }
  }
});
