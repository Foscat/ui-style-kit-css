import { test, expect, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;

/**
 * Opens the component demo with Y2K active and applies either a library theme
 * or the retained standalone reference palette.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @param {{ mode?: 'light' | 'dark', theme?: string | null }} options Display options.
 * @returns {Promise<void>} Resolves when the final Y2K bundle layer is active.
 */
async function openY2K(page, { mode = 'light', theme = null } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'y2k');
  await page.selectOption('#modeSelect', mode);

  if (theme) {
    await page.selectOption('#themeSelect', theme);
  } else {
    await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  }

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'y2k');
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('[data-testid="component-buttons"] .y2k-button-primary')).toBeVisible();
  await expect.poll(
    () => page.locator('body').evaluate((body) => getComputedStyle(body)
      .getPropertyValue('--usk-native-control-min-block-size').trim()),
    { message: 'The compact Y2K native-control layer should finish loading before geometry is measured.' }
  ).toBe('1.375rem');
}

/**
 * Resolves CSS color variables through Chromium so comparisons use final
 * browser values rather than authored token strings.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<Record<string, string>>} Resolved Y2K and USK color roles.
 */
async function readPalette(page) {
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
      background: resolveColor('var(--y2k-bg)'),
      surface: resolveColor('var(--y2k-surface)'),
      text: resolveColor('var(--y2k-text)'),
      primary: resolveColor('var(--y2k-primary)'),
      link: resolveColor('var(--y2k-link)'),
      themeBackground: resolveColor('rgb(var(--usk-bg-rgb))'),
      themePrimary: resolveColor('rgb(var(--usk-primary-rgb))')
    };
  });
}

test('Y2K uses the retained light and dark palettes only as standalone fallbacks', async ({ page }) => {
  await openY2K(page, { mode: 'light' });
  const light = await readPalette(page);

  expect(light.background).toBe('rgb(192, 192, 192)');
  expect(light.surface).toBe('rgb(236, 236, 236)');
  expect(light.text).toBe('rgb(5, 5, 5)');
  expect(light.primary).toBe('rgb(8, 24, 172)');
  expect(light.link).toBe('rgb(0, 0, 204)');

  await page.selectOption('#themeSelect', 'sunset-ember');
  const themed = await readPalette(page);
  expect(themed.background).toBe(themed.themeBackground);
  expect(themed.primary).toBe(themed.themePrimary);
  expect(themed.background).not.toBe(light.background);

  await page.selectOption('#modeSelect', 'dark');
  await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  const dark = await readPalette(page);

  expect(dark.background).toBe('rgb(2, 6, 7)');
  expect(dark.surface).toBe('rgb(3, 7, 7)');
  expect(dark.text).toBe('rgb(217, 219, 220)');
  expect(dark.primary).toBe('rgb(7, 20, 145)');
  expect(dark.link).toBe('rgb(85, 167, 255)');
});

test('Y2K components reproduce compact portal-era geometry and feedback', async ({ page }) => {
  await openY2K(page, { mode: 'light' });

  const evidence = await page.evaluate(() => {
    const element = (selector) => document.querySelector(selector);
    const style = (selector, pseudo) => getComputedStyle(element(selector), pseudo);
    const bounds = (selector) => element(selector).getBoundingClientRect();
    const card = style('[data-testid="component-controls"]');
    const titlebar = style('[data-testid="component-controls"] > .y2k-kicker');
    const primary = style('[data-testid="component-buttons"] .y2k-button-primary');
    const input = style('[data-testid="component-fields"] .y2k-input');
    const tooltip = style('[data-testid="tooltip-accent"]');
    const sectionHeading = style('[data-testid="component-fields"] .y2k-heading');

    return {
      bodyFont: getComputedStyle(document.body).fontFamily,
      bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize),
      cardRadius: Number.parseFloat(card.borderTopLeftRadius),
      cardBorder: Number.parseFloat(card.borderTopWidth),
      cardShadow: card.boxShadow,
      titlebarBackground: titlebar.backgroundImage,
      titlebarHeight: bounds('[data-testid="component-controls"] > .y2k-kicker').height,
      buttonHeight: bounds('[data-testid="component-buttons"] .y2k-button-primary').height,
      buttonRadius: Number.parseFloat(primary.borderTopLeftRadius),
      buttonBorderStyle: primary.borderTopStyle,
      inputHeight: bounds('[data-testid="component-fields"] .y2k-input').height,
      inputRadius: Number.parseFloat(input.borderTopLeftRadius),
      inputBorderStyle: input.borderTopStyle,
      sectionHeadingSize: Number.parseFloat(sectionHeading.fontSize),
      badgeHeight: bounds('[data-testid="component-badges"] .y2k-badge').height,
      progressHeight: bounds('[data-testid="component-progress"] .y2k-progress').height,
      progressFill: style('[data-testid="component-progress"] .y2k-progress-bar').backgroundImage,
      tableFontSize: Number.parseFloat(style('[data-testid="component-table"] .y2k-table').fontSize),
      tooltipBackground: tooltip.backgroundColor,
      tooltipRadius: Number.parseFloat(tooltip.borderTopLeftRadius),
      infoBackground: style('[data-testid="component-alerts"] .y2k-alert-success').backgroundColor,
      warningBackground: style('[data-testid="component-alerts"] .y2k-alert-warning').backgroundColor,
      dangerBackground: style('[data-testid="component-alerts"] .y2k-alert-danger').backgroundColor
    };
  });

  expect(evidence.bodyFont).toMatch(/Tahoma/);
  expect(evidence.bodyFontSize).toBe(11);
  expect(evidence.cardRadius).toBe(0);
  expect(evidence.cardBorder).toBe(2);
  expect(evidence.cardShadow).toContain('inset');
  expect(evidence.titlebarBackground).toContain('linear-gradient');
  expect(evidence.titlebarHeight).toBeGreaterThanOrEqual(20);
  expect(evidence.titlebarHeight).toBeLessThanOrEqual(22);
  expect(evidence.buttonHeight).toBe(22);
  expect(evidence.buttonRadius).toBe(0);
  expect(evidence.buttonBorderStyle).toBe('outset');
  expect(evidence.inputHeight).toBe(22);
  expect(evidence.inputRadius).toBe(0);
  expect(evidence.inputBorderStyle).toBe('inset');
  expect(evidence.sectionHeadingSize).toBeLessThanOrEqual(12);
  expect(evidence.badgeHeight).toBeLessThanOrEqual(20);
  expect(evidence.progressHeight).toBe(14);
  expect(evidence.progressFill).toContain('repeating-linear-gradient');
  expect(evidence.tableFontSize).toBeLessThanOrEqual(11);
  expect(evidence.tooltipBackground).toBe('rgb(255, 255, 199)');
  expect(evidence.tooltipRadius).toBe(0);
  expect(evidence.infoBackground).toBe('rgb(206, 242, 206)');
  expect(evidence.warningBackground).toBe('rgb(255, 242, 178)');
  expect(evidence.dangerBackground).toBe('rgb(255, 208, 208)');
});

test('Y2K native controls and dialogs use the same compact bevel system', async ({ page }) => {
  await openY2K(page, { mode: 'dark' });
  const input = page.locator('[data-testid="native-forms"] input[type="text"]');
  await input.focus();

  const evidence = await page.evaluate(() => {
    const element = (selector) => document.querySelector(selector);
    const style = (selector) => getComputedStyle(element(selector));
    const bounds = (selector) => element(selector).getBoundingClientRect();
    const focused = style('[data-testid="native-forms"] input[type="text"]');
    const dialog = style('[data-testid="native-disclosure-dialog"] dialog');
    const panelHeading = style('[data-testid="native-forms"] > h3');

    return {
      inputHeight: bounds('[data-testid="native-forms"] input[type="text"]').height,
      inputRadius: Number.parseFloat(focused.borderTopLeftRadius),
      inputOutlineStyle: focused.outlineStyle,
      inputOutlineWidth: Number.parseFloat(focused.outlineWidth),
      choiceWidth: bounds('[data-testid="native-forms"] input[type="checkbox"]').width,
      choiceHeight: bounds('[data-testid="native-forms"] input[type="checkbox"]').height,
      progressHeight: bounds('[data-testid="native-meter-progress"] progress').height,
      dialogRadius: Number.parseFloat(dialog.borderTopLeftRadius),
      dialogBorder: Number.parseFloat(dialog.borderTopWidth),
      dialogBorderStyle: dialog.borderTopStyle,
      dialogShadow: dialog.boxShadow,
      panelHeadingSize: Number.parseFloat(panelHeading.fontSize),
      panelHeadingHeight: bounds('[data-testid="native-forms"] > h3').height
    };
  });

  expect(evidence.inputHeight).toBe(22);
  expect(evidence.inputRadius).toBe(0);
  expect(evidence.inputOutlineStyle).toBe('dotted');
  expect(evidence.inputOutlineWidth).toBe(2);
  expect(evidence.choiceWidth).toBe(14);
  expect(evidence.choiceHeight).toBe(14);
  expect(evidence.progressHeight).toBe(14);
  expect(evidence.dialogRadius).toBe(0);
  expect(evidence.dialogBorder).toBe(3);
  expect(evidence.dialogBorderStyle).toBe('outset');
  expect(evidence.dialogShadow).toContain('5px 5px');
  expect(evidence.panelHeadingSize).toBeLessThanOrEqual(12);
  expect(evidence.panelHeadingHeight).toBeLessThanOrEqual(22);
});

test('Y2K remains contained and touchable at the mobile breakpoint', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  try {
    await openY2K(page, { mode: 'light' });

    const evidence = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      buttonMinBlockSize: getComputedStyle(document.querySelector('.y2k-button')).minBlockSize,
      navMinBlockSize: getComputedStyle(document.querySelector('.y2k-nav-link')).minBlockSize
    }));

    expect(evidence.scrollWidth).toBe(evidence.clientWidth);
    expect(Number.parseFloat(evidence.buttonMinBlockSize)).toBeGreaterThanOrEqual(44);
    expect(Number.parseFloat(evidence.navMinBlockSize)).toBeGreaterThanOrEqual(44);
  } finally {
    await context.close();
  }
});
