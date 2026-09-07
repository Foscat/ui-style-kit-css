import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;

/**
 * Opens the local component library with motion disabled for stable style reads.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<void>} Resolves after the demo controls are interactive.
 */
async function openLibrary(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await expect(page.locator('#uiSelect')).toBeVisible();
}

test('every preset select renders exactly one dropdown indicator', async ({ page }) => {
  await openLibrary(page);

  const presets = await page.locator('#uiSelect option').evaluateAll((options) =>
    options.map((option) => option.value).filter(Boolean)
  );

  for (const preset of presets) {
    await page.selectOption('#uiSelect', preset);
    const indicator = await page.locator('#uiSelect').evaluate((select) => {
      const style = getComputedStyle(select);
      return {
        appearance: style.appearance,
        backgroundImage: style.backgroundImage
      };
    });
    const usesCustomIndicator = indicator.appearance === 'none' && indicator.backgroundImage !== 'none';
    const usesPlatformIndicator = indicator.appearance !== 'none' && indicator.backgroundImage === 'none';

    expect(
      usesCustomIndicator || usesPlatformIndicator,
      `${preset} must use one custom or one platform dropdown indicator`
    ).toBe(true);
  }
});

test('every preset trust seal emphasizes the number over the caption', async ({ page }) => {
  await openLibrary(page);

  const presets = await page.locator('#uiSelect option').evaluateAll((options) =>
    options.map((option) => option.value).filter(Boolean)
  );

  for (const preset of presets) {
    await page.selectOption('#uiSelect', preset);
    const sealType = await page.getByTestId('marketing-components').locator('[class$="-badge-seal"]').evaluate((seal) => {
      const number = getComputedStyle(seal.querySelector(':scope > strong'));
      const caption = getComputedStyle(seal.querySelector(':scope > small'));
      return {
        numberSize: Number.parseFloat(number.fontSize),
        captionSize: Number.parseFloat(caption.fontSize)
      };
    });

    expect(sealType.numberSize, `${preset} seal number size`).toBe(24);
    expect(sealType.captionSize, `${preset} seal caption size`).toBe(13);
  }
});
