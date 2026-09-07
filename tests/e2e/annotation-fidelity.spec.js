import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;
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
  ['retro-glass', 'rg'],
  ['editorial-luxe', 'luxe'],
  ['organic-modern', 'organic'],
  ['industrial-utility', 'utility'],
  ['technical-blueprint', 'blueprint'],
  ['art-deco', 'deco'],
  ['clay', 'clay'],
  ['data-terminal', 'terminal'],
  ['paper-editorial', 'paper'],
  ['neo-noir', 'noir']
];

/**
 * Loads one editable preset source after the generated demo bundle.
 *
 * @param {import('@playwright/test').Page} page Active browser page.
 * @param {string} presetId Public preset identifier.
 * @returns {Promise<void>} Promise resolved when the stylesheet is ready.
 */
async function loadPresetSource(page, presetId) {
  const href = `${pathToFileURL(path.join(rootDir, 'styles', `${presetId}.css`)).href}?v=${Date.now()}`;
  await page.evaluate((sourceHref) => new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = sourceHref;
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error(`Unable to load ${sourceHref}`)), { once: true });
    document.head.append(link);
  }), href);
}

/**
 * Calculates WCAG contrast for two opaque browser-rendered RGB colors.
 *
 * @param {string} foreground Rendered foreground color.
 * @param {string} background Rendered background color.
 * @returns {number} WCAG contrast ratio.
 */
function contrastRatio(foreground, background) {
  const luminance = (value) => {
    const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) throw new TypeError(`Expected RGB color, received: ${value}`);
    const linear = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
    });
    return (.2126 * linear[0]) + (.7152 * linear[1]) + (.0722 * linear[2]);
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + .05) / (darker + .05);
}

test('all presets give titles breathing room and text icons useful visual weight', async ({ page }) => {
  test.slow();
  await page.goto(demoUrl);

  for (const [presetId, prefix] of stylePresets) {
    await page.selectOption('#uiSelect', presetId);
    await expect(page.locator('body')).toHaveAttribute('data-ui', presetId);
    await loadPresetSource(page, presetId);

    const evidence = await page.evaluate((classPrefix) => {
      const title = document.querySelector(`.${classPrefix}-title`);
      const featureIcon = document.querySelector(`.${classPrefix}-feature-item > .${classPrefix}-icon-medallion`);
      const ctaIcon = document.querySelector(`.${classPrefix}-callout-bar > .${classPrefix}-icon-medallion`);
      const titleStyle = getComputedStyle(title);
      const featureStyle = getComputedStyle(featureIcon);
      const ctaStyle = getComputedStyle(ctaIcon);
      return {
        titleMarginStart: Number.parseFloat(titleStyle.marginBlockStart),
        titleMarginEnd: Number.parseFloat(titleStyle.marginBlockEnd),
        titleLetterSpacing: Number.parseFloat(titleStyle.letterSpacing),
        featureFontSize: Number.parseFloat(featureStyle.fontSize),
        ctaFontSize: Number.parseFloat(ctaStyle.fontSize),
        ctaWidth: ctaIcon.getBoundingClientRect().width,
        ctaHeight: ctaIcon.getBoundingClientRect().height
      };
    }, prefix);

    expect.soft(evidence.titleMarginStart, `${presetId} title start margin`).toBeGreaterThanOrEqual(12);
    expect.soft(evidence.titleMarginEnd, `${presetId} title end margin`).toBeGreaterThanOrEqual(12);
    expect.soft(evidence.titleLetterSpacing, `${presetId} title tracking`).toBeGreaterThanOrEqual(0.45);
    expect.soft(evidence.featureFontSize, `${presetId} feature icon size`).toBeGreaterThanOrEqual(22);
    expect.soft(evidence.ctaFontSize, `${presetId} CTA icon size`).toBeGreaterThanOrEqual(30);
    expect.soft(evidence.ctaWidth, `${presetId} CTA icon width`).toBeGreaterThanOrEqual(72);
    expect.soft(evidence.ctaHeight, `${presetId} CTA icon height`).toBeGreaterThanOrEqual(72);
  }
});

test('Maximalist compact display text stays crisp and legible', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'maximalist');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadPresetSource(page, 'maximalist');
  await page.locator('[data-semantic-node="badge-success"]').evaluate((element) => element.classList.add('max-badge'));

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseInt(style.fontWeight, 10),
        letterSpacing: Number.parseFloat(style.letterSpacing),
        lineHeight: Number.parseFloat(style.lineHeight)
      };
    };
    return {
      button: read('[data-testid="component-buttons"] .max-button-primary'),
      heading: read('[data-testid="component-fields"] > .max-heading'),
      nativeHeading: read('[data-testid="native-lists"] > h3'),
      tableHeading: read('[data-testid="component-table"] th'),
      semanticBadge: read('[data-semantic-node="badge-success"]'),
      chipTitle: read('[data-testid="utility-color-chip"] strong'),
      styleHeading: read('.max-heading')
    };
  });

  expect(evidence.button.letterSpacing).toBeGreaterThanOrEqual(.8);
  expect(evidence.button.lineHeight / evidence.button.fontSize).toBeGreaterThanOrEqual(1.1);
  expect(evidence.heading.letterSpacing).toBeGreaterThanOrEqual(.65);
  expect(evidence.heading.lineHeight / evidence.heading.fontSize).toBeGreaterThanOrEqual(1.05);
  expect(evidence.nativeHeading.letterSpacing).toBeGreaterThanOrEqual(.5);
  expect(evidence.nativeHeading.lineHeight / evidence.nativeHeading.fontSize).toBeGreaterThanOrEqual(1.08);
  expect(evidence.nativeHeading.color).toBe(evidence.styleHeading.color);
  expect(evidence.tableHeading.fontSize).toBeGreaterThanOrEqual(16);
  expect(evidence.semanticBadge.fontSize).toBeGreaterThanOrEqual(14);
  expect(evidence.semanticBadge.fontWeight).toBeLessThanOrEqual(900);
  expect(evidence.semanticBadge.letterSpacing).toBeGreaterThanOrEqual(.75);
  expect(evidence.semanticBadge.lineHeight / evidence.semanticBadge.fontSize).toBeGreaterThanOrEqual(1.1);
  expect(evidence.chipTitle.fontFamily).toBe(evidence.styleHeading.fontFamily);
});

test('Maximalist loading and native controls use deliberate inset geometry', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'maximalist');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadPresetSource(page, 'maximalist');
  await page.locator('[data-semantic-node="select"]').evaluate((element) => element.classList.add('max-select'));

  const evidence = await page.evaluate(() => {
    const spinner = document.querySelector('.max-spinner-lg');
    const spinnerStyle = getComputedStyle(spinner);
    const check = document.querySelector('.max-check input:checked + .max-check-control');
    const checkMark = getComputedStyle(check, '::after');
    const semanticSelect = getComputedStyle(document.querySelector('.ui-select'));
    const objectStyle = getComputedStyle(document.querySelector('.demo-object'));
    const rootStyle = getComputedStyle(document.body);
    return {
      spinner: {
        backgroundImage: spinnerStyle.backgroundImage,
        borderRadius: spinnerStyle.borderRadius,
        timing: spinnerStyle.animationTimingFunction,
        width: spinner.getBoundingClientRect().width
      },
      check: {
        display: checkMark.display,
        fontSize: Number.parseFloat(checkMark.fontSize),
        lineHeight: Number.parseFloat(checkMark.lineHeight),
        placeItems: checkMark.placeItems,
        stroke: checkMark.webkitTextStrokeWidth
      },
      select: {
        indicatorPosition: rootStyle.getPropertyValue('--usk-native-select-indicator-position').trim(),
        paddingInlineEnd: Number.parseFloat(semanticSelect.paddingInlineEnd)
      },
      objectPaddingInlineStart: Number.parseFloat(objectStyle.paddingInlineStart)
    };
  });

  expect(evidence.spinner.backgroundImage).toContain('conic-gradient');
  expect(evidence.spinner.backgroundImage).toContain('rgba(0, 0, 0, 0)');
  expect(evidence.spinner.borderRadius).toBe('50%');
  expect(evidence.spinner.timing).toBe('linear');
  expect(evidence.spinner.width).toBeGreaterThanOrEqual(48);
  expect(evidence.check.display).toBe('grid');
  expect(evidence.check.placeItems).toBe('center');
  expect(evidence.check.fontSize).toBeGreaterThanOrEqual(16);
  expect(evidence.check.lineHeight).toBe(evidence.check.fontSize);
  expect(Number.parseFloat(evidence.check.stroke)).toBeGreaterThan(0);
  expect(evidence.select.indicatorPosition).toContain('1.7rem');
  expect(evidence.select.paddingInlineEnd).toBeGreaterThanOrEqual(56);
  expect(evidence.objectPaddingInlineStart).toBeGreaterThanOrEqual(12);
});

test('Maximalist tooltips and marketing actions keep their edges and copy distinct', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'maximalist');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');
  await loadPresetSource(page, 'maximalist');
  await expect.poll(
    () => page.getByTestId('marketing-secondary-cta').evaluate((element) => getComputedStyle(element).backgroundColor)
  ).not.toBe('rgba(0, 0, 0, 0)');

  const evidence = await page.evaluate(() => {
    const readColorPair = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return { foreground: style.color, background: style.backgroundColor };
    };
    const marketing = document.querySelector('[data-testid="marketing-components"]');
    const seal = marketing.querySelector('.max-badge-seal');
    const sealCaption = seal.querySelector('small');
    const tooltip = document.querySelector('[data-testid="tooltip-primary"]');
    const tooltipStyle = getComputedStyle(tooltip);
    const tooltipArrowStyle = getComputedStyle(tooltip.querySelector('.max-tooltip-arrow'));
    const calloutCopy = marketing.querySelector('.max-callout-bar > div');
    const calloutCopyStyle = getComputedStyle(calloutCopy);
    const mediaCaption = marketing.querySelector('.max-media-scrim figcaption');
    const mediaCopy = getComputedStyle(mediaCaption.querySelector('strong'));
    return {
      seal: readColorPair('[data-testid="marketing-components"] .max-badge-seal'),
      sealCaptionColor: getComputedStyle(sealCaption).color,
      action: readColorPair('[data-testid="marketing-secondary-cta"]'),
      tooltip: {
        background: tooltipStyle.backgroundColor,
        border: tooltipStyle.borderTopColor
      },
      tooltipArrow: {
        background: tooltipArrowStyle.backgroundColor,
        border: tooltipArrowStyle.borderTopColor
      },
      calloutCopy: {
        borderWidth: Number.parseFloat(calloutCopyStyle.borderInlineStartWidth),
        padding: Number.parseFloat(calloutCopyStyle.paddingInlineStart)
      },
      mediaCopy: {
        letterSpacing: Number.parseFloat(mediaCopy.letterSpacing),
        lineHeight: Number.parseFloat(mediaCopy.lineHeight),
        fontSize: Number.parseFloat(mediaCopy.fontSize),
        textShadow: mediaCopy.textShadow
      }
    };
  });

  expect(evidence.sealCaptionColor).toBe(evidence.seal.foreground);
  expect(contrastRatio(evidence.seal.foreground, evidence.seal.background)).toBeGreaterThanOrEqual(4.5);
  expect(
    contrastRatio(evidence.action.foreground, evidence.action.background),
    `CTA colors: ${JSON.stringify(evidence.action)}`
  ).toBeGreaterThanOrEqual(4.5);
  expect(evidence.tooltip.border).not.toBe(evidence.tooltip.background);
  expect(contrastRatio(evidence.tooltipArrow.border, evidence.tooltipArrow.background)).toBeGreaterThanOrEqual(3);
  expect(evidence.calloutCopy.borderWidth).toBeGreaterThanOrEqual(3);
  expect(evidence.calloutCopy.padding).toBeGreaterThanOrEqual(16);
  expect(evidence.mediaCopy.letterSpacing).toBeGreaterThanOrEqual(.75);
  expect(evidence.mediaCopy.lineHeight / evidence.mediaCopy.fontSize).toBeGreaterThanOrEqual(1.15);
  expect(evidence.mediaCopy.textShadow).not.toBe('none');
});
