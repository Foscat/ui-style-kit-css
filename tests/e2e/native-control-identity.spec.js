import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;
const manifest = JSON.parse(readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const signatureTokens = [
  '--usk-native-choice-size',
  '--usk-native-checkbox-radius',
  '--usk-native-select-indicator-image',
  '--usk-native-range-track-size',
  '--usk-native-range-track-radius',
  '--usk-native-range-thumb-size',
  '--usk-native-range-thumb-radius',
  '--usk-native-progress-size',
  '--usk-native-progress-track-radius',
  '--usk-native-scrollbar-size'
];

/**
 * Read the public native-control signature and representative rendered parts.
 *
 * @param {import('@playwright/test').Page} page Active demo page.
 * @returns {Promise<{signature: string, select: object, range: object, progress: object, choice: object}>} Computed preset evidence.
 */
async function nativeEvidence(page) {
  return page.evaluate((tokens) => {
    const root = document.body;
    const rootStyle = getComputedStyle(root);
    const select = document.querySelector('[data-testid="native-select-single"]');
    const range = document.querySelector('[data-testid="native-range-enabled"]');
    const progress = document.querySelector('[data-testid="native-progress-partial"]');
    const choice = document.querySelector('[data-testid="native-checkbox-indeterminate"]');
    const read = (element, pseudo = null) => {
      const style = getComputedStyle(element, pseudo);
      return {
        background: style.backgroundImage || style.backgroundColor,
        borderRadius: style.borderRadius,
        blockSize: style.blockSize,
        boxShadow: style.boxShadow
      };
    };

    return {
      signature: tokens.map((token) => `${token}:${rootStyle.getPropertyValue(token).trim()}`).join(';'),
      select: read(select),
      range: read(range, navigator.userAgent.includes('Firefox') ? '::-moz-range-track' : '::-webkit-slider-runnable-track'),
      progress: read(progress, navigator.userAgent.includes('Firefox') ? '::-moz-progress-bar' : '::-webkit-progress-value'),
      choice: read(choice)
    };
  }, signatureTokens);
}

test('all presets expose complete unique rendered native-control identities', async ({ page }) => {
  await page.goto(demoUrl);
  const signatures = new Map();

  for (const { id } of manifest.presets) {
    await page.selectOption('#uiSelect', id);
    const evidence = await nativeEvidence(page);

    for (const token of signatureTokens) {
      expect(evidence.signature, `${id} should resolve ${token}`).not.toContain(`${token}:;`);
    }
    expect(signatures.has(evidence.signature), `${id} duplicates ${signatures.get(evidence.signature) ?? 'another preset'}`).toBe(false);
    expect(evidence.select.background).not.toBe('none');
    expect(evidence.range.blockSize).not.toBe('0px');
    expect(evidence.progress.blockSize).not.toBe('0px');
    expect(evidence.choice.blockSize).not.toBe('0px');
    signatures.set(evidence.signature, id);
  }
});

test('native controls retain RTL focus disabled zoom and motion accessibility states', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.locator('body').evaluate((body) => { body.dir = 'rtl'; });

  const selectDirection = await page.getByTestId('native-select-single').evaluate((select) => ({
    direction: getComputedStyle(select).direction,
    indicatorPosition: getComputedStyle(select).getPropertyValue('--usk-native-select-indicator-position').trim()
  }));
  expect(selectDirection.direction).toBe('rtl');
  expect(selectDirection.indicatorPosition).toMatch(/^1\./);

  const range = page.getByTestId('native-range-focus');
  await range.focus();
  expect(await range.evaluate((control) => control.matches(':focus-visible'))).toBe(true);
  await range.press('End');
  await expect(range).toHaveValue('100');
  await range.press('Home');
  await expect(range).toHaveValue('0');

  const progressState = await page.evaluate(() => {
    const indeterminate = document.querySelector('[data-testid="native-progress-indeterminate"]');
    const meters = ['optimum', 'suboptimum', 'critical'].map((band) =>
      getComputedStyle(document.querySelector(`[data-testid="native-meter-${band}"]`))
        .getPropertyValue(`--usk-native-meter-${band}-background`)
        .trim()
    );

    return {
      animationName: getComputedStyle(indeterminate).animationName,
      hasValue: indeterminate.hasAttribute('value'),
      meters,
      values: ['zero', 'partial', 'complete'].map((state) =>
        document.querySelector(`[data-testid="native-progress-${state}"]`).value
      )
    };
  });
  expect(progressState.animationName).toBe('none');
  expect(progressState.hasValue).toBe(false);
  expect(progressState.values).toEqual([0, 72, 100]);
  expect(progressState.meters.every(Boolean)).toBe(true);
  expect(new Set(progressState.meters).size).toBe(3);

  const disabled = page.getByTestId('native-disabled');
  await disabled.evaluate((control) => control.setAttribute('aria-invalid', 'true'));
  const disabledState = await disabled.evaluate((control) => {
    const style = getComputedStyle(control);
    return { cursor: style.cursor, opacity: style.opacity };
  });
  expect(disabledState.cursor).toBe('not-allowed');
  expect(Number(disabledState.opacity)).toBeLessThan(1);

  await page.locator('html').evaluate((html) => { html.style.zoom = '2'; });
  await expect(range).toBeVisible();
  expect(await range.evaluate((control) => control.getBoundingClientRect().width)).toBeGreaterThan(40);

  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const forcedColorsState = await page.getByTestId('native-select-single').evaluate((select) => ({
    active: matchMedia('(forced-colors: active)').matches,
    supportsAdjustment: CSS.supports('forced-color-adjust', 'auto'),
    adjustment: getComputedStyle(select).forcedColorAdjust ?? null,
    visible: select.getBoundingClientRect().width > 0
  }));
  expect(forcedColorsState.active).toBe(true);
  expect(forcedColorsState.visible).toBe(true);
  if (forcedColorsState.supportsAdjustment) {
    expect(forcedColorsState.adjustment).toBe('auto');
  }
});
