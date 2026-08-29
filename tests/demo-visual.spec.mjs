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
