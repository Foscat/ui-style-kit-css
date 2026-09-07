import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Activates the Maximalist demo in either themed or standalone fallback mode.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @param {{ mode?: string, theme?: string | null }} options Demo state options.
 * @returns {Promise<void>} Resolves after the requested preset state is rendered.
 */
async function openMaximalist(page, { mode = 'dark', theme = null } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'maximalist');
  await page.selectOption('#modeSelect', mode);

  if (theme) {
    await page.selectOption('#themeSelect', theme);
  } else {
    await page.locator('#themeSelect').evaluate((select) => {
      if (!select.querySelector('[value="reference-palette"]')) {
        select.add(new Option('Preset reference palette', 'reference-palette'));
      }
    });
    await page.selectOption('#themeSelect', 'reference-palette');
  }

  await expect(page.locator('body')).toHaveAttribute('data-ui', 'maximalist');
  await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
  await page.waitForTimeout(50);
}

/**
 * Resolves the Maximalist semantic palette from the rendered page.
 *
 * @param {import('@playwright/test').Page} page Active Playwright page.
 * @returns {Promise<Record<string, string>>} Resolved Maximalist color values.
 */
async function readMaximalistPalette(page) {
  await page.getByTestId('maximalist-template-specimen').screenshot();

  return page.evaluate(() => {
    const resolveColor = (name) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${name})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };

    return {
      background: resolveColor('--max-bg'),
      surface: resolveColor('--max-surface-strong'),
      text: resolveColor('--max-text'),
      primary: resolveColor('--max-primary'),
      primaryText: resolveColor('--max-on-primary'),
      secondary: resolveColor('--max-secondary'),
      accent: resolveColor('--max-accent'),
      success: resolveColor('--max-success'),
      warning: resolveColor('--max-warning'),
      danger: resolveColor('--max-danger')
    };
  });
}

test('Maximalist reference specimen covers every component family', async ({ page }) => {
  await openMaximalist(page);

  const specimen = page.getByTestId('maximalist-template-specimen');
  await expect(specimen).toBeVisible();

  const families = [
    'actions-buttons',
    'forms-choices',
    'status-feedback',
    'data-product',
    'navigation-foundations'
  ];

  for (const family of families) {
    await expect(specimen.getByTestId(`maximalist-specimen-${family}`)).toBeVisible();
  }
});

test('Maximalist fallback modes use the retained pop-collage palette', async ({ page }) => {
  await openMaximalist(page, { mode: 'light', theme: null });

  const light = await readMaximalistPalette(page);
  expect(light).toEqual({
    background: 'rgb(244, 237, 218)',
    surface: 'rgb(255, 250, 240)',
    text: 'rgb(9, 9, 11)',
    primary: 'rgb(240, 45, 22)',
    primaryText: 'rgb(9, 9, 11)',
    secondary: 'rgb(16, 190, 213)',
    accent: 'rgb(94, 22, 216)',
    success: 'rgb(18, 155, 120)',
    warning: 'rgb(255, 210, 10)',
    danger: 'rgb(238, 23, 99)'
  });

  await page.selectOption('#modeSelect', 'dark');
  const dark = await readMaximalistPalette(page);
  expect(dark).toEqual({
    background: 'rgb(10, 11, 13)',
    surface: 'rgb(16, 17, 20)',
    text: 'rgb(245, 234, 214)',
    primary: 'rgb(255, 53, 31)',
    primaryText: 'rgb(9, 9, 11)',
    secondary: 'rgb(24, 212, 232)',
    accent: 'rgb(129, 44, 244)',
    success: 'rgb(25, 184, 139)',
    warning: 'rgb(255, 218, 25)',
    danger: 'rgb(255, 40, 110)'
  });

  await page.selectOption('#modeSelect', 'light');
  await page.selectOption('#themeSelect', 'sunset-ember');
  const themed = await readMaximalistPalette(page);
  expect(themed.primary).not.toBe(light.primary);
  expect(themed.secondary).not.toBe(light.secondary);
});

test('Maximalist components use square inked poster geometry', async ({ page }) => {
  await openMaximalist(page, { mode: 'light', theme: null });

  const specimen = page.getByTestId('maximalist-template-specimen');
  await specimen.scrollIntoViewIfNeeded();
  const styles = await specimen.evaluate((root) => {
    const read = (selector) => {
      const element = root.querySelector(selector);
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderRadius: style.borderRadius,
        borderWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        color: style.color,
        clipPath: style.clipPath,
        fontFamily: style.fontFamily,
        textTransform: style.textTransform
      };
    };

    return {
      panel: read('[data-testid="maximalist-specimen-actions-buttons"]'),
      title: read('#maximalist-specimen-title'),
      primary: read('.max-button-primary'),
      secondary: read('.max-button-secondary'),
      danger: read('.max-button-danger'),
      input: read('.max-input'),
      badge: read('.max-badge-danger'),
      tableHeading: read('.max-table th'),
      dialog: read('dialog'),
      progress: read('.max-progress'),
      switchTrack: read('.max-switch-track')
    };
  });

  expect(styles.panel.borderRadius).toBe('0px');
  expect(styles.panel.borderWidth).toBe('3px');
  expect(styles.panel.boxShadow).not.toBe('none');
  expect(styles.title.fontFamily).toMatch(/Impact|Arial Narrow/i);
  expect(styles.title.textTransform).toBe('uppercase');

  expect(styles.primary.backgroundColor).toBe('rgb(240, 45, 22)');
  expect(styles.primary.backgroundImage).toBe('none');
  expect(styles.primary.color).toBe('rgb(9, 9, 11)');
  expect(styles.secondary.backgroundColor).toBe('rgb(16, 190, 213)');
  expect(styles.secondary.backgroundImage).toBe('none');
  expect(styles.secondary.color).toBe('rgb(9, 9, 11)');
  expect(styles.danger.backgroundColor).toBe('rgb(238, 23, 99)');
  expect(styles.danger.backgroundImage).toBe('none');
  expect(styles.danger.color).toBe('rgb(9, 9, 11)');

  for (const component of [styles.input, styles.badge, styles.dialog, styles.progress, styles.switchTrack]) {
    expect(component.borderRadius).toBe('0px');
  }
  expect(styles.input.borderWidth).toBe('3px');
  expect(styles.input.backgroundImage).toBe('none');
  expect(styles.badge.clipPath).toContain('polygon');
  expect(styles.tableHeading.backgroundImage).toBe('none');
  expect(styles.tableHeading.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.tableHeading.color).toBe('rgb(9, 9, 11)');
});

test('Maximalist semantic and native APIs share the same visual identity', async ({ page }) => {
  await openMaximalist(page, { mode: 'light', theme: null });

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        color: style.color
      };
    };

    return {
      semanticCard: read('[data-semantic-node="actions-card"]'),
      semanticPrimary: read('[data-semantic-node="button-primary"]'),
      semanticDanger: read('[data-semantic-node="button-danger"]'),
      semanticWarning: read('[data-semantic-node="badge-warning"]'),
      semanticSuccess: read('[data-semantic-node="alert"]'),
      nativeInput: read('[data-testid="native-forms"] input[type="text"]'),
      nativeButton: read('[data-testid="native-buttons"] button:first-child'),
      nativeTableHeading: read('[data-testid="native-table"] th'),
      nativeDialog: read('[data-testid="native-disclosure-dialog"] dialog[open]'),
      nativeProgress: read('[data-testid="native-progress-partial"]')
    };
  });

  expect(evidence.semanticCard.borderRadius).toBe('0px');
  expect(evidence.semanticCard.borderWidth).toBe('3px');
  expect(evidence.semanticCard.boxShadow).not.toBe('none');
  expect(evidence.semanticPrimary.backgroundColor).toBe('rgb(240, 45, 22)');
  expect(evidence.semanticPrimary.color).toBe('rgb(9, 9, 11)');
  expect(evidence.semanticDanger.backgroundColor).toBe('rgb(238, 23, 99)');
  expect(evidence.semanticWarning.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.semanticWarning.color).toBe('rgb(9, 9, 11)');
  expect(evidence.semanticSuccess.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.semanticSuccess.color).toBe('rgb(9, 9, 11)');

  for (const component of [evidence.nativeInput, evidence.nativeButton, evidence.nativeDialog, evidence.nativeProgress]) {
    expect(component.borderRadius).toBe('0px');
  }
  expect(evidence.nativeInput.borderWidth).toBe('3px');
  expect(evidence.nativeButton.backgroundColor).toBe('rgb(240, 45, 22)');
  expect(evidence.nativeButton.color).toBe('rgb(9, 9, 11)');
  expect(evidence.nativeTableHeading.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.nativeTableHeading.color).toBe('rgb(9, 9, 11)');
});

test('Maximalist interaction states remain visibly distinct', async ({ page }) => {
  await openMaximalist(page, { mode: 'dark', theme: null });

  const states = await page.getByTestId('maximalist-template-specimen').evaluate((root) => {
    const read = (selector, pseudo = null) => {
      const style = getComputedStyle(root.querySelector(selector), pseudo);
      return {
        animationName: style.animationName,
        boxShadow: style.boxShadow,
        content: style.content,
        cursor: style.cursor,
        opacity: style.opacity,
        outlineStyle: style.outlineStyle,
        transform: style.transform
      };
    };

    return {
      hover: read('[data-max-state="hover"]'),
      focus: read('[data-max-state="focus"]'),
      pressed: read('[data-max-state="pressed"]'),
      disabled: read('[data-max-state="disabled"]'),
      busy: read('[data-max-state="busy"]', '::after')
    };
  });

  expect(states.hover.transform).not.toBe('none');
  expect(states.hover.boxShadow).not.toBe('none');
  expect(states.focus.outlineStyle).toBe('solid');
  expect(states.pressed.transform).not.toBe('none');
  expect(Number(states.disabled.opacity)).toBeLessThan(0.7);
  expect(states.disabled.cursor).toBe('not-allowed');
  expect(states.busy.content).toBe('""');
  expect(states.busy.animationName).toContain('max-spin');
});

test('Maximalist display and control typography stay legible across theme modes', async ({ page }) => {
  await openMaximalist(page, { mode: 'light', theme: 'arctic-indigo' });

  const collectEvidence = () => page.evaluate(() => {
    const styleFor = (selector, pseudo = null) => getComputedStyle(document.querySelector(selector), pseudo);
    const colorChannels = (color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const luminance = (channels) => channels
      .map((channel) => channel / 255)
      .map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
    const contrastRatio = (foregroundSelector, backgroundSelector = foregroundSelector) => {
      const foreground = luminance(colorChannels(styleFor(foregroundSelector).color));
      const background = luminance(colorChannels(styleFor(backgroundSelector).backgroundColor));
      return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
    };
    const readText = (selector) => {
      const style = styleFor(selector);
      return {
        fontFamily: style.fontFamily,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number(style.fontWeight),
        letterSpacing: Number.parseFloat(style.letterSpacing),
        lineHeight: Number.parseFloat(style.lineHeight),
        marginTop: Number.parseFloat(style.marginTop)
      };
    };

    return {
      display: [
        readText('#semantic-runtime-title'),
        readText('#maximalist-specimen-title'),
        readText('#components .demo-component-grid article:nth-child(2) .max-heading')
      ],
      compact: [
        readText('[data-semantic-node="nav-current"]'),
        readText('[data-semantic-node="button-primary"]'),
        readText('[data-semantic-node="table"] th'),
        readText('[data-semantic-node="alert-title"]'),
        readText('.max-nav-link.is-active'),
        readText('.demo-maximalist-action-stack .max-button-primary'),
        readText('[data-testid="maximalist-specimen-status-feedback"] .max-badge-success'),
        readText('[data-testid="maximalist-specimen-status-feedback"] .max-badge-warning'),
        readText('[data-testid="maximalist-specimen-status-feedback"] .max-kicker'),
        readText('.demo-maximalist-product-card > .max-sticker'),
        readText('.max-label'),
        readText('[data-ui="maximalist"] summary')
      ],
      body: [
        readText('.demo-maximalist-product-card .max-copy'),
        readText('.max-callout-bar .max-copy'),
        readText('.max-table td')
      ],
      contrast: [
        contrastRatio('[data-semantic-node="nav-current"]'),
        contrastRatio('[data-semantic-node="button-primary"]'),
        contrastRatio('[data-semantic-node="button-secondary"]'),
        contrastRatio('[data-semantic-node="table"] th'),
        contrastRatio('[data-semantic-node="alert-title"]', '[data-semantic-node="alert"]'),
        contrastRatio('.max-nav-link.is-active'),
        contrastRatio('.demo-maximalist-masthead .max-badge-seal'),
        contrastRatio('.demo-maximalist-action-stack .max-button-primary'),
        contrastRatio('.demo-maximalist-action-stack .max-button-danger'),
        contrastRatio('[data-testid="maximalist-specimen-status-feedback"] .max-badge-success'),
        contrastRatio('[data-testid="maximalist-specimen-status-feedback"] .max-badge-warning'),
        contrastRatio('[data-testid="maximalist-specimen-status-feedback"] .max-badge-secondary'),
        contrastRatio('[data-testid="maximalist-specimen-status-feedback"] .max-badge-danger'),
        contrastRatio('[data-testid="maximalist-specimen-status-feedback"] .max-kicker'),
        contrastRatio('.demo-maximalist-product-card > .max-kicker'),
        contrastRatio('.demo-maximalist-foundations .max-callout-bar > div > strong', '.max-callout-bar')
      ],
      productCheck: readText('.demo-maximalist-product-card > .max-icon-medallion svg'),
      dialogIcon: readText('.demo-maximalist-dialog > .max-icon-button svg'),
      calloutBody: readText('.max-callout-bar .max-copy'),
      interactiveHeading: readText('#components .demo-component-grid article:nth-child(2) .max-heading'),
      uiSelectIndicator: {
        appearance: styleFor('#uiSelect').appearance,
        backgroundImage: styleFor('#uiSelect').backgroundImage,
        backgroundSize: Number.parseFloat(styleFor('#uiSelect').backgroundSize)
      }
    };
  });

  const light = await collectEvidence();
  await page.selectOption('#modeSelect', 'dark');
  const dark = await collectEvidence();

  for (const evidence of [light, dark]) {
    for (const display of evidence.display) {
      expect(display.fontFamily).not.toMatch(/Impact|Haettenschweiler/i);
      expect(display.fontWeight).toBeLessThanOrEqual(800);
      expect(display.letterSpacing).toBeGreaterThanOrEqual(0.5);
      expect(display.lineHeight).toBeGreaterThanOrEqual(display.fontSize);
    }

    for (const compact of evidence.compact) {
      expect(compact.fontFamily).not.toMatch(/Impact|Haettenschweiler/i);
      expect(compact.fontWeight).toBeLessThanOrEqual(700);
      expect(compact.letterSpacing).toBeGreaterThanOrEqual(0.5);
      expect(compact.lineHeight).toBeGreaterThanOrEqual(compact.fontSize);
    }

    for (const body of evidence.body) {
      expect(body.fontWeight).toBeLessThanOrEqual(600);
      expect(body.lineHeight).toBeGreaterThanOrEqual(body.fontSize * 1.4);
    }

    for (const ratio of evidence.contrast) {
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }

    expect(evidence.productCheck.fontSize).toBeGreaterThanOrEqual(28);
    expect(evidence.dialogIcon.fontSize).toBeGreaterThanOrEqual(24);
    expect(evidence.calloutBody.lineHeight).toBeGreaterThanOrEqual(24);
    expect(evidence.interactiveHeading.marginTop).toBeGreaterThanOrEqual(12);
    expect(evidence.uiSelectIndicator.appearance).toBe('none');
    expect(evidence.uiSelectIndicator.backgroundImage).not.toBe('none');
    expect(evidence.uiSelectIndicator.backgroundSize).toBeGreaterThanOrEqual(10);
  }
});
