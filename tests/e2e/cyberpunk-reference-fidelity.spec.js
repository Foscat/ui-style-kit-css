import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Counts vertices from a computed polygon clip path.
 *
 * @param {string} clipPath Computed clip-path value from the browser.
 * @returns {number} Number of polygon vertices or zero when no polygon exists.
 */
function countPolygonVertices(clipPath) {
  const polygon = clipPath.match(/^polygon\((.*)\)$/);
  return polygon ? polygon[1].split(',').length : 0;
}

/**
 * Activates the Cyberpunk demo in either themed or fallback-token mode.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @param {{ mode?: string, theme?: string | null }} options Demo state options.
 * @returns {Promise<void>} Resolves after the selected state is reflected on the root.
 */
async function openCyberpunk(page, { mode = 'dark', theme = 'arctic-indigo' } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'cyberpunk');
  await page.selectOption('#modeSelect', mode);

  if (theme) {
    await page.selectOption('#themeSelect', theme);
  } else {
    await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  }

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'cyberpunk');
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  const primaryButton = page.locator('[data-testid="component-buttons"] .cyber-button-primary');
  await expect(primaryButton).toBeVisible();
  await primaryButton.scrollIntoViewIfNeeded();
  await primaryButton.screenshot();
}

/**
 * Reads representative token and component colors by resolving CSS custom properties.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<Record<string, string>>} Rendered color evidence.
 */
async function readCyberpunkPalette(page) {
  await page.locator('[data-testid="component-buttons"] .cyber-button-primary').screenshot();

  return page.evaluate(() => {
    const resolveColor = (name) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };
    const body = getComputedStyle(document.body);
    const button = getComputedStyle(document.querySelector('[data-testid="component-buttons"] .cyber-button-primary'));

    return {
      background: resolveColor('--cyber-bg'),
      text: resolveColor('--cyber-text'),
      primary: resolveColor('--cyber-primary'),
      primaryText: resolveColor('--cyber-on-primary'),
      danger: resolveColor('--cyber-danger'),
      warning: resolveColor('--cyber-warning'),
      success: resolveColor('--cyber-success'),
      bodyBackgroundImage: body.backgroundImage,
      buttonBackground: button.backgroundColor,
      buttonColor: button.color
    };
  });
}

test('Cyberpunk fallback modes use the retained template palette', async ({ page }) => {
  await openCyberpunk(page, { mode: 'light', theme: null });

  const light = await readCyberpunkPalette(page);
  expect(light.background).toBe('rgb(230, 241, 243)');
  expect(light.text).toBe('rgb(16, 40, 50)');
  expect(light.primary).toBe('rgb(0, 127, 157)');
  expect(light.primaryText).toBe('rgb(255, 255, 255)');
  expect(light.danger).toBe('rgb(195, 19, 90)');
  expect(light.warning).toBe('rgb(170, 112, 0)');
  expect(light.success).toBe('rgb(8, 124, 73)');
  expect(light.buttonBackground).toBe(light.primary);
  expect(light.buttonColor).toBe(light.primaryText);
  expect(light.bodyBackgroundImage).toContain('linear-gradient');
  expect(light.bodyBackgroundImage).not.toContain('radial-gradient');

  await page.selectOption('#modeSelect', 'dark');
  await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  const dark = await readCyberpunkPalette(page);
  expect(dark.background).toBe('rgb(5, 10, 16)');
  expect(dark.text).toBe('rgb(232, 250, 255)');
  expect(dark.primary).toBe('rgb(0, 221, 255)');
  expect(dark.primaryText).toBe('rgb(0, 27, 35)');
  expect(dark.danger).toBe('rgb(255, 31, 120)');
  expect(dark.warning).toBe('rgb(255, 189, 22)');
  expect(dark.success).toBe('rgb(53, 228, 125)');
  expect(dark.buttonBackground).toBe(dark.primary);
  expect(dark.buttonColor).toBe(dark.primaryText);
  expect(dark.bodyBackgroundImage).toContain('linear-gradient');
  expect(dark.bodyBackgroundImage).not.toContain('radial-gradient');

  await page.selectOption('#modeSelect', 'light');
  await page.selectOption('#themeSelect', 'sunset-ember');
  const themed = await readCyberpunkPalette(page);
  expect(themed.primary).not.toBe(light.primary);
  expect(themed.buttonBackground).toBe(themed.primary);
});

test('Cyberpunk components use compact operational HUD geometry', async ({ page }) => {
  await openCyberpunk(page, { mode: 'dark', theme: null });

  const evidence = await page.evaluate(() => {
    const style = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const bounds = (selector) => document.querySelector(selector).getBoundingClientRect();
    const body = style('body');
    const title = style('.cyber-title');
    const card = style('[data-testid="component-controls"]');
    const panel = style('.cyber-panel');
    const primary = style('[data-testid="component-buttons"] .cyber-button-primary');
    const neutral = style('[data-testid="component-buttons"] .cyber-button:not(.cyber-button-primary):not(.cyber-button-secondary):not(.cyber-button-danger):not(.cyber-button-ghost)');
    const danger = style('[data-testid="component-buttons"] .cyber-button-danger');
    const input = style('[data-testid="component-fields"] .cyber-input');
    const select = style('[data-testid="component-fields"] .cyber-select');
    const badge = style('[data-testid="component-badges"] .cyber-badge');
    const progress = style('[data-testid="component-progress"] .cyber-progress');
    const progressBar = style('[data-testid="component-progress"] .cyber-progress-bar');
    const tableHeader = style('[data-testid="component-table"] .cyber-table th');
    const alert = style('[data-testid="component-alerts"] .cyber-alert-warning');

    return {
      bodyBackgroundImage: body.backgroundImage,
      bodyFontFamily: body.fontFamily,
      titleFontFamily: title.fontFamily,
      titleLetterSpacing: title.letterSpacing,
      cardBorderWidth: card.borderTopWidth,
      cardClip: card.clipPath,
      cardRadius: Number.parseFloat(card.borderTopLeftRadius),
      cardShadow: card.boxShadow,
      panelClip: panel.clipPath,
      primaryBackground: primary.backgroundColor,
      primaryColor: primary.color,
      primaryClip: primary.clipPath,
      primaryHeight: bounds('[data-testid="component-buttons"] .cyber-button-primary').height,
      neutralBackground: neutral.backgroundColor,
      dangerBackground: danger.backgroundColor,
      dangerColor: danger.color,
      inputHeight: bounds('[data-testid="component-fields"] .cyber-input').height,
      inputClip: input.clipPath,
      inputBorder: input.borderTopColor,
      selectImage: select.backgroundImage,
      badgeHeight: bounds('[data-testid="component-badges"] .cyber-badge').height,
      badgeClip: badge.clipPath,
      progressHeight: bounds('[data-testid="component-progress"] .cyber-progress').height,
      progressBarBackground: progressBar.backgroundImage,
      tableHeaderBackground: tableHeader.backgroundImage,
      tableHeaderFontFamily: tableHeader.fontFamily,
      tableCellHeight: bounds('[data-testid="component-table"] .cyber-table td').height,
      alertClip: alert.clipPath,
      alertBorder: alert.borderTopColor
    };
  });

  expect(evidence.bodyBackgroundImage).toContain('linear-gradient');
  expect(evidence.bodyBackgroundImage).not.toContain('radial-gradient');
  expect(evidence.bodyFontFamily).toContain('DejaVu Sans');
  expect(evidence.titleFontFamily).toContain('Arial Narrow');
  expect(Number.parseFloat(evidence.titleLetterSpacing)).toBeGreaterThanOrEqual(0);
  expect(evidence.cardBorderWidth).toBe('1px');
  expect(evidence.cardRadius).toBeLessThanOrEqual(3);
  expect(countPolygonVertices(evidence.cardClip)).toBeGreaterThanOrEqual(8);
  expect(countPolygonVertices(evidence.panelClip)).toBeGreaterThanOrEqual(6);
  expect(evidence.cardShadow).toContain('rgb');
  expect(countPolygonVertices(evidence.primaryClip)).toBeGreaterThanOrEqual(7);
  expect(evidence.primaryHeight).toBeGreaterThanOrEqual(36);
  expect(evidence.primaryHeight).toBeLessThanOrEqual(48);
  expect(evidence.primaryBackground).toBe('rgb(0, 221, 255)');
  expect(evidence.primaryColor).toBe('rgb(0, 27, 35)');
  expect(evidence.neutralBackground).not.toBe(evidence.primaryBackground);
  expect(evidence.dangerBackground).not.toBe('rgb(255, 31, 120)');
  expect(evidence.dangerColor).toBe('rgb(255, 31, 120)');
  expect(evidence.inputHeight).toBeGreaterThanOrEqual(36);
  expect(evidence.inputHeight).toBeLessThanOrEqual(48);
  expect(countPolygonVertices(evidence.inputClip)).toBeGreaterThanOrEqual(6);
  expect(evidence.inputBorder).not.toBe('rgb(0, 221, 255)');
  expect(evidence.selectImage).toContain('linear-gradient');
  expect(evidence.badgeHeight).toBeGreaterThanOrEqual(22);
  expect(evidence.badgeHeight).toBeLessThanOrEqual(30);
  expect(countPolygonVertices(evidence.badgeClip)).toBeGreaterThanOrEqual(6);
  expect(evidence.progressHeight).toBeGreaterThanOrEqual(8);
  expect(evidence.progressHeight).toBeLessThanOrEqual(14);
  expect(evidence.progressBarBackground).toContain('repeating-linear-gradient');
  expect(evidence.tableHeaderBackground).toContain('linear-gradient');
  expect(evidence.tableHeaderFontFamily).toContain('DejaVu Sans Mono');
  expect(evidence.tableCellHeight).toBeLessThanOrEqual(44);
  expect(countPolygonVertices(evidence.alertClip)).toBeGreaterThanOrEqual(6);
  expect(evidence.alertBorder).toBe('rgb(255, 189, 22)');
});

test('Cyberpunk interaction states preserve the operational signal hierarchy', async ({ page }) => {
  await openCyberpunk(page, { mode: 'dark', theme: null });

  const evidence = await page.evaluate(async () => {
    const resolveColor = (name) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };
    const read = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const input = document.querySelector('[data-testid="cyberpunk-specimen-form-inputs"] .cyber-input:not([aria-invalid])');
    const primary = document.querySelector('[data-testid="cyberpunk-specimen-action-states"] .cyber-button-primary');

    const defaultInputBorder = getComputedStyle(input).borderTopColor;
    input.classList.add('is-focus');
    primary.classList.add('is-hover');
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      primary: resolveColor('--cyber-primary'),
      primaryHover: resolveColor('--cyber-primary-hover'),
      danger: resolveColor('--cyber-danger'),
      defaultInputBorder,
      focusedInputBorder: getComputedStyle(input).borderTopColor,
      hoveredPrimaryBackground: getComputedStyle(primary).backgroundColor,
      dangerBackground: read('[data-testid="cyberpunk-specimen-action-states"] .cyber-button-danger').backgroundColor,
      dangerColor: read('[data-testid="cyberpunk-specimen-action-states"] .cyber-button-danger').color,
      loadingColor: read('[data-testid="cyberpunk-specimen-action-states"] .cyber-button.is-loading').color,
      panelRail: read('[data-testid="cyberpunk-specimen-action-states"]', '::before').backgroundImage,
      stepperDisplay: read('[data-testid="cyberpunk-specimen-range-progress"] .cyber-stepper').display
    };
  });

  expect(evidence.defaultInputBorder).not.toBe(evidence.primary);
  expect(evidence.focusedInputBorder).toBe(evidence.primary);
  expect(evidence.hoveredPrimaryBackground).toBe(evidence.primaryHover);
  expect(evidence.dangerBackground).not.toBe(evidence.danger);
  expect(evidence.dangerColor).toBe(evidence.danger);
  expect(evidence.loadingColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.panelRail).toContain(evidence.primary);
  expect(evidence.panelRail).toContain(evidence.danger);
  expect(evidence.stepperDisplay).toBe('flex');
});

test('Cyberpunk choices and options keep selection legible and inactive surfaces quiet', async ({ page }) => {
  await openCyberpunk(page, { mode: 'dark', theme: null });

  const evidence = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const resolveColor = (name) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };
    const checkbox = style('[data-testid="cyberpunk-specimen-choices-tags"] input[type="checkbox"]');
    const radio = style('[data-testid="cyberpunk-specimen-choices-tags"] input[type="radio"]');
    const activeOption = style('[data-testid="cyberpunk-specimen-select-upload"] .cyber-option.is-active');
    const inactiveOption = style('[data-testid="cyberpunk-specimen-select-upload"] .cyber-option:not(.is-active)');

    return {
      primary: resolveColor('--cyber-primary'),
      checkboxAppearance: checkbox.appearance,
      checkboxAccent: checkbox.accentColor,
      radioAppearance: radio.appearance,
      radioAccent: radio.accentColor,
      activeOptionBackground: activeOption.backgroundColor,
      inactiveOptionBackground: inactiveOption.backgroundColor
    };
  });

  expect(evidence.checkboxAppearance).toBe('auto');
  expect(evidence.checkboxAccent).toBe(evidence.primary);
  expect(evidence.radioAppearance).toBe('auto');
  expect(evidence.radioAccent).toBe(evidence.primary);
  expect(evidence.inactiveOptionBackground).toBe('rgba(0, 0, 0, 0)');
  expect(evidence.activeOptionBackground).not.toBe(evidence.inactiveOptionBackground);
});

test('Cyberpunk token treatment reaches semantic and native controls', async ({ page }) => {
  await openCyberpunk(page, { mode: 'dark', theme: 'arctic-indigo' });

  const evidence = await page.evaluate(() => {
    const read = (selector, pseudo) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element, pseudo);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderColor: style.borderTopColor,
        borderRadius: style.borderTopLeftRadius,
        boxShadow: style.boxShadow,
        clipPath: style.clipPath,
        color: style.color,
        fontFamily: style.fontFamily,
        minHeight: style.minHeight,
        outlineColor: style.outlineColor
      };
    };
    const prefixedCard = read('.cyber-card');
    const semanticCard = read('.ui-card');
    const semanticPrimary = read('.ui-button[data-ui-variant="primary"]');
    const semanticProgress = read('.ui-progress');
    const semanticProgressBar = read('.ui-progress-bar');
    const nativeButton = read('[data-testid="native-buttons"] button:not([class])');
    const nativeInput = read('[data-testid="native-forms"] input[type="text"]');
    const nativeSelect = read('[data-testid="native-forms"] select:not([multiple])');
    const nativeCheckbox = read('[data-testid="native-forms"] input[type="checkbox"]:checked');
    const nativeRadio = read('[data-testid="native-forms"] input[type="radio"]:checked');
    const nativeProgress = read('[data-testid="native-meter-progress"] progress[value]');
    const firstButton = document.querySelector('.cyber-button-primary');
    firstButton.focus();

    return {
      prefixedCard,
      semanticCard,
      semanticPrimary,
      semanticProgress,
      semanticProgressBar,
      nativeButton,
      nativeInput,
      nativeSelect,
      nativeCheckbox,
      nativeRadio,
      nativeProgress,
      focusedButton: read('.cyber-button-primary'),
      rangeTrackBackground: getComputedStyle(document.body).getPropertyValue('--usk-native-range-track-background').trim(),
      successToken: getComputedStyle(document.body).getPropertyValue('--cyber-success').trim(),
      warningToken: getComputedStyle(document.body).getPropertyValue('--cyber-warning').trim(),
      dangerToken: getComputedStyle(document.body).getPropertyValue('--cyber-danger').trim()
    };
  });

  expect(evidence.semanticCard.clipPath).toBe(evidence.prefixedCard.clipPath);
  expect(evidence.semanticCard.borderRadius).toBe(evidence.prefixedCard.borderRadius);
  expect(evidence.semanticCard.backgroundImage).toBe(evidence.prefixedCard.backgroundImage);
  expect(countPolygonVertices(evidence.semanticPrimary.clipPath)).toBeGreaterThanOrEqual(7);
  expect(evidence.semanticPrimary.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.semanticProgress.backgroundImage).toContain('repeating-linear-gradient');
  expect(evidence.semanticProgressBar.backgroundImage).toContain('repeating-linear-gradient');
  expect(Number.parseFloat(evidence.nativeButton.minHeight)).toBeGreaterThanOrEqual(44);
  expect(countPolygonVertices(evidence.nativeButton.clipPath)).toBeGreaterThanOrEqual(7);
  expect(evidence.nativeInput.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeSelect.backgroundImage).toContain('linear-gradient');
  expect(Number.parseFloat(evidence.nativeCheckbox.borderRadius)).toBeLessThanOrEqual(2);
  expect(evidence.nativeCheckbox.backgroundColor).toBe(evidence.semanticPrimary.backgroundColor);
  expect(evidence.nativeCheckbox.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeRadio.borderRadius).toContain('50%');
  expect(evidence.nativeRadio.backgroundColor).toBe(evidence.semanticPrimary.backgroundColor);
  expect(evidence.nativeRadio.backgroundImage).toContain('radial-gradient');
  expect(evidence.rangeTrackBackground).toContain('linear-gradient');
  expect(evidence.rangeTrackBackground).toContain(evidence.successToken);
  expect(evidence.rangeTrackBackground).toContain(evidence.warningToken);
  expect(evidence.rangeTrackBackground).toContain(evidence.dangerToken);
  expect(Number.parseFloat(evidence.nativeProgress.minHeight || '0')).toBeLessThanOrEqual(14);
  expect(evidence.focusedButton.boxShadow).not.toBe('none');

  const themedPrimary = await readCyberpunkPalette(page);
  await page.selectOption('#themeSelect', 'sunset-ember');
  const rethemedPrimary = await readCyberpunkPalette(page);
  expect(rethemedPrimary.primary).not.toBe(themedPrimary.primary);
  expect(rethemedPrimary.buttonBackground).toBe(rethemedPrimary.primary);
});

test('Cyberpunk demo showcases every retained template board group', async ({ page }) => {
  await openCyberpunk(page, { mode: 'dark', theme: null });

  const specimen = page.getByTestId('cyberpunk-template-specimen');
  await expect(specimen).toBeVisible();

  const groups = [
    'action-states',
    'form-inputs',
    'choices-tags',
    'select-upload',
    'range-progress',
    'alerts-loading',
    'navigation',
    'data-display',
    'overlays-disclosure',
    'foundations'
  ];

  for (const group of groups) {
    await expect(specimen.getByTestId(`cyberpunk-specimen-${group}`)).toBeVisible();
  }

  const requiredSelectors = [
    '.cyber-section-title',
    '.cyber-button-primary',
    '.cyber-button-secondary',
    '.cyber-button-ghost',
    '.cyber-button-danger',
    '.cyber-input-wrap',
    '.cyber-input-icon',
    '.cyber-helper',
    '.cyber-error-text',
    '.cyber-choice',
    '.cyber-switch',
    '.cyber-segmented',
    '.cyber-dropdown',
    '.cyber-option',
    '.cyber-tags',
    '.cyber-chip',
    '.cyber-file',
    '.cyber-range',
    '.cyber-range-critical',
    '.cyber-meter',
    '.cyber-stepper',
    '.cyber-step',
    '.cyber-toast',
    '.cyber-skeleton',
    '.cyber-breadcrumb',
    '.cyber-tabs',
    '.cyber-tab',
    '.cyber-pagination',
    '.cyber-pagination-page',
    '.cyber-avatar',
    '.cyber-avatar-group',
    '.cyber-list',
    '.cyber-popover',
    '.cyber-modal',
    '.cyber-modal-actions',
    '.cyber-accordion',
    '.cyber-code',
    '.cyber-quote',
    '.cyber-token-swatch'
  ];

  for (const selector of requiredSelectors) {
    await expect(specimen.locator(selector).first(), `${selector} should be visible in the Cyberpunk specimen`).toBeVisible();
  }

  const geometry = await specimen.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(`[data-testid="cyberpunk-template-specimen"] ${selector}`);
      const styles = getComputedStyle(element);

      return {
        clipPath: styles.clipPath,
        borderWidth: styles.borderTopWidth,
        fontFamily: styles.fontFamily,
        minHeight: styles.minHeight,
        backgroundImage: styles.backgroundImage,
        color: styles.color
      };
    };

    return {
      sectionTitle: read('.cyber-section-title'),
      primary: read('.cyber-button-primary'),
      dropdown: read('.cyber-dropdown'),
      range: read('.cyber-range'),
      meter: read('.cyber-meter'),
      toast: read('.cyber-toast'),
      modal: read('.cyber-modal'),
      tokenSwatch: read('.cyber-token-swatch i')
    };
  });

  expect(geometry.sectionTitle.fontFamily).toContain('DejaVu Sans Mono');
  expect(geometry.primary.minHeight).toBe('36px');
  expect(countPolygonVertices(geometry.primary.clipPath)).toBeGreaterThanOrEqual(7);
  expect(geometry.dropdown.borderWidth).toBe('1px');
  expect(geometry.range.backgroundImage).toContain('linear-gradient');
  expect(geometry.meter.backgroundImage).toContain('linear-gradient');
  expect(countPolygonVertices(geometry.toast.clipPath)).toBeGreaterThanOrEqual(6);
  expect(countPolygonVertices(geometry.modal.clipPath)).toBeGreaterThanOrEqual(6);
  expect(geometry.tokenSwatch.backgroundImage).not.toBe('none');
});
