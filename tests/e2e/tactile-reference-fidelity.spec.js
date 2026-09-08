import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Opens the demo with Tactile active and waits for its representative action
 * control to receive the selected mode and palette.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @param {{ mode?: 'light' | 'dark', theme?: string | null }} options Tactile display options.
 * @returns {Promise<void>} Resolves when the Tactile control surface is rendered.
 */
async function openTactile(page, { mode = 'light', theme = null } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'tactile');
  await page.selectOption('#modeSelect', mode);

  if (theme) {
    await page.selectOption('#themeSelect', theme);
  } else {
    await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  }

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'tactile');
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('[data-testid="component-buttons"] .tactile-button-primary')).toBeVisible();
}

/**
 * Resolves Tactile material colors and their active library-theme counterparts
 * through the browser's CSS engine.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<Record<string, string>>} Computed material and theme colors.
 */
async function readTactilePalette(page) {
  return page.evaluate(() => {
    const resolveColor = (value) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = value;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };

    return {
      paper: resolveColor('var(--tactile-paper)'),
      ink: resolveColor('var(--tactile-ink)'),
      copper: resolveColor('var(--tactile-copper)'),
      olive: resolveColor('var(--tactile-olive)'),
      brass: resolveColor('var(--tactile-brass)'),
      themeBackground: resolveColor('rgb(var(--usk-bg-rgb))'),
      themeText: resolveColor('rgb(var(--usk-text-rgb))'),
      themePrimary: resolveColor('rgb(var(--usk-primary-rgb))'),
      themeSuccess: resolveColor('rgb(var(--usk-success-rgb))'),
      themeAccent: resolveColor('rgb(var(--usk-accent-rgb))')
    };
  });
}

test('Tactile uses the retained palettes only as standalone fallbacks', async ({ page }) => {
  await openTactile(page, { mode: 'light', theme: null });
  const fallbackLight = await readTactilePalette(page);

  expect(fallbackLight.paper).toBe('rgb(246, 240, 224)');
  expect(fallbackLight.ink).toBe('rgb(45, 40, 34)');
  expect(fallbackLight.copper).toBe('rgb(177, 60, 28)');
  expect(fallbackLight.olive).toBe('rgb(91, 104, 67)');
  expect(fallbackLight.brass).toBe('rgb(197, 160, 82)');

  await page.selectOption('#themeSelect', 'sunset-ember');
  const themedLight = await readTactilePalette(page);

  expect(themedLight.paper).toBe(themedLight.themeBackground);
  expect(themedLight.ink).toBe(themedLight.themeText);
  expect(themedLight.copper).toBe(themedLight.themePrimary);
  expect(themedLight.olive).toBe(themedLight.themeSuccess);
  expect(themedLight.brass).toBe(themedLight.themeAccent);
  expect(themedLight.paper).not.toBe(fallbackLight.paper);

  await page.selectOption('#modeSelect', 'dark');
  await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  const fallbackDark = await readTactilePalette(page);

  expect(fallbackDark.paper).toBe('rgb(57, 51, 44)');
  expect(fallbackDark.ink).toBe('rgb(241, 232, 214)');
  expect(fallbackDark.copper).toBe('rgb(211, 83, 43)');
  expect(fallbackDark.olive).toBe('rgb(131, 145, 92)');
  expect(fallbackDark.brass).toBe('rgb(222, 181, 91)');
});

test('Tactile reproduces the retained workspace configuration surface', async ({ page }) => {
  await openTactile(page, { mode: 'light', theme: null });

  const specimen = page.locator('[data-testid="tactile-template-specimen"]');
  const densitySwitch = specimen.getByRole('switch', { name: 'Compact density' });

  await expect(specimen).toBeVisible();
  await expect(specimen.getByRole('heading', { name: 'Workspace settings' })).toBeVisible();
  await expect(specimen.locator('[data-testid="tactile-setting-row"]')).toHaveCount(4);
  await expect(specimen.getByRole('meter', { name: 'Workspace readiness' })).toHaveAttribute('aria-valuenow', '78');
  await expect(densitySwitch).not.toBeChecked();
  await specimen.getByText('Compact density', { exact: true }).click();
  await expect(densitySwitch).toBeChecked();

  const evidence = await specimen.evaluate((root) => {
    const element = (selector) => root.matches(selector) ? root : root.querySelector(selector);
    const style = (selector, pseudo) => getComputedStyle(element(selector), pseudo);
    const bounds = (selector) => root.querySelector(selector).getBoundingClientRect();
    const shell = style('.tactile-workspace-shell');
    const sidebar = style('.tactile-workspace-sidebar');
    const title = style('.tactile-workspace-title');
    const row = style('[data-testid="tactile-setting-row"]');
    const gauge = style('[role="meter"]');
    const gaugeBounds = bounds('[role="meter"]');
    const progress = style('.tactile-workspace-progress .tactile-progress-bar');
    const shelf = style('[data-testid="tactile-action-shelf"]');

    return {
      shellDisplay: shell.display,
      shellColumns: shell.gridTemplateColumns,
      shellRadius: Number.parseFloat(shell.borderTopLeftRadius),
      sidebarBackground: sidebar.backgroundImage,
      titleFont: title.fontFamily,
      titleSize: Number.parseFloat(title.fontSize),
      rowColumns: row.gridTemplateColumns,
      gaugeRadius: Number.parseFloat(gauge.borderTopLeftRadius),
      gaugeWidth: gaugeBounds.width,
      gaugeHeight: gaugeBounds.height,
      gaugeNeedle: style('[role="meter"]', '::after').content,
      progressBackground: progress.backgroundImage,
      shelfDisplay: shelf.display,
      shelfPosition: shelf.position
    };
  });

  expect(evidence.shellDisplay).toBe('grid');
  expect(evidence.shellColumns.split(' ')).toHaveLength(2);
  expect(evidence.shellRadius).toBeLessThanOrEqual(8);
  expect(evidence.sidebarBackground).toContain('linear-gradient');
  expect(evidence.titleFont).toMatch(/Georgia|Cambria|Times New Roman/);
  expect(evidence.titleSize).toBeGreaterThanOrEqual(34);
  expect(evidence.rowColumns.split(' ')).toHaveLength(2);
  expect(evidence.gaugeRadius).toBeGreaterThanOrEqual(evidence.gaugeWidth / 2 - 1);
  expect(Math.abs(evidence.gaugeWidth - evidence.gaugeHeight)).toBeLessThanOrEqual(1);
  expect(evidence.gaugeNeedle).not.toBe('none');
  expect(evidence.progressBackground).toContain('repeating-linear-gradient');
  expect(evidence.shelfDisplay).toBe('grid');
  expect(evidence.shelfPosition).toBe('sticky');
});

test('Tactile keeps the retained workspace readable and contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTactile(page, { mode: 'light', theme: null });

  const specimen = page.locator('[data-testid="tactile-template-specimen"]');
  const evidence = await specimen.evaluate((root) => {
    const style = (selector) => getComputedStyle(root.querySelector(selector));
    const bounds = (selector) => root.querySelector(selector).getBoundingClientRect();
    const brand = style('.tactile-workspace-brand strong');
    const sidebar = style('.tactile-workspace-sidebar');
    const menu = style('.tactile-workspace-menu');
    const row = style('[data-testid="tactile-setting-row"]');
    const shelf = style('[data-testid="tactile-action-shelf"]');
    const title = bounds('.tactile-workspace-title');
    const header = bounds('.tactile-workspace-header');

    return {
      brandColor: brand.color,
      sidebarColor: sidebar.color,
      menuOverflowX: menu.overflowX,
      rowColumns: row.gridTemplateColumns,
      shelfColumns: shelf.gridTemplateColumns,
      titleInsideHeader: title.left >= header.left && title.right <= header.right,
      shellScrollWidth: root.scrollWidth,
      shellClientWidth: root.clientWidth
    };
  });

  expect(evidence.brandColor).toBe(evidence.sidebarColor);
  expect(evidence.menuOverflowX).toBe('auto');
  expect(evidence.rowColumns.split(' ')).toHaveLength(1);
  expect(evidence.shelfColumns.split(' ')).toHaveLength(1);
  expect(evidence.titleInsideHeader).toBe(true);
  expect(evidence.shellScrollWidth).toBe(evidence.shellClientWidth);
});

test('Tactile standalone actions use the retained hardware colors', async ({ page }) => {
  await openTactile(page, { mode: 'light', theme: null });

  const light = await page.evaluate(() => {
    const resolveColor = (name) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };

    return {
      primary: resolveColor('--tactile-primary'),
      secondary: resolveColor('--tactile-secondary'),
      accent: resolveColor('--tactile-accent'),
      success: resolveColor('--tactile-success'),
      copper: resolveColor('--tactile-copper'),
      olive: resolveColor('--tactile-olive'),
      brass: resolveColor('--tactile-brass')
    };
  });

  expect(light.primary).toBe(light.copper);
  expect(light.secondary).toBe(light.olive);
  expect(light.accent).toBe(light.brass);
  expect(light.success).toBe(light.olive);

  await page.selectOption('#themeSelect', 'sunset-ember');
  const themed = await readTactilePalette(page);
  expect(themed.copper).toBe(themed.themePrimary);
  expect(themed.olive).toBe(themed.themeSuccess);
  expect(themed.brass).toBe(themed.themeAccent);
});
