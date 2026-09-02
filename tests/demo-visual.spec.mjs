import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoUrl = pathToFileURL(path.resolve(__dirname, '../demo/index.html')).href;

const styles = [
  'minimal-saas', 'bento', 'maximalist', 'bauhaus', 'tactile', 'neumorphism', 'retrofuturism',
  'brutalism', 'cyberpunk', 'y2k', 'retro-glass', 'editorial-luxe', 'organic-modern',
  'industrial-utility', 'technical-blueprint', 'art-deco', 'clay', 'data-terminal',
  'paper-editorial', 'neo-noir'
];
const modes = ['light', 'dark', 'contrast'];
const nativeIdentityFamilies = ['minimal-saas', 'bauhaus', 'neumorphism', 'cyberpunk', 'paper-editorial'];
const nativeIdentityViewports = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'mobile', width: 390, height: 844 }
];

/**
 * Creates a compact visual probe from the full native-control demo specimen.
 *
 * @param {import('@playwright/test').Page} page Playwright page rendering the demo.
 * @returns {Promise<import('@playwright/test').Locator>} Locator for the focused probe.
 */
async function createNativeIdentityProbe(page) {
  await page.evaluate(() => {
    const probe = document.createElement('div');
    const forms = document.querySelector('[data-testid="native-forms"]');
    const status = document.querySelector('[data-testid="native-meter-progress"]');

    probe.id = 'native-identity-visual-probe';
    probe.className = 'demo-native-grid';
    probe.style.padding = '1rem';
    probe.append(forms.cloneNode(true), status.cloneNode(true));
    document.body.replaceChildren(probe);
  });

  return page.locator('#native-identity-visual-probe');
}

test.describe('UI Style Kit visual smoke renders', () => {
  for (const ui of styles) {
    for (const mode of modes) {
      test(`${ui} / ${mode}`, async ({ page }) => {
        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', ui);
        await page.selectOption('#modeSelect', mode);
        await page.selectOption('#themeSelect', 'arctic-indigo');

        await expect(page.locator('body')).toHaveAttribute('data-ui', ui);
        await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
        await expect(page.locator('main')).toBeVisible();

        const mainBox = await page.locator('main').boundingBox();
        expect(mainBox?.width ?? 0).toBeGreaterThan(300);
        expect(mainBox?.height ?? 0).toBeGreaterThan(300);

        const screenshot = await page.locator('main').screenshot();
        expect(screenshot.byteLength).toBeGreaterThan(10_000);
      });
    }
  }
});

test.describe('representative native-control identity baselines', () => {
  for (const ui of nativeIdentityFamilies) {
    for (const viewport of nativeIdentityViewports) {
      test(`${ui} / ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(demoUrl);
        await page.selectOption('#uiSelect', ui);
        await page.selectOption('#modeSelect', 'light');
        await page.selectOption('#themeSelect', 'arctic-indigo');

        const probe = await createNativeIdentityProbe(page);
        await expect(probe).toHaveScreenshot(`native-controls-${ui}-${viewport.name}.png`, {
          animations: 'disabled',
          caret: 'hide'
        });
      });
    }
  }
});
