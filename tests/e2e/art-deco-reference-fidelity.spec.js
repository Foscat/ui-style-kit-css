import { test, expect } from '@playwright/test';
import path from 'node:path';
import { PNG } from 'pngjs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href + '?view=reference';

/**
 * Counts the vertices in a computed polygon clip path.
 *
 * @param {string} clipPath Computed clip-path value.
 * @returns {number} Number of polygon vertices.
 */
function countPolygonVertices(clipPath) {
  const polygon = clipPath.match(/^polygon\((.*)\)$/);
  return polygon ? polygon[1].split(',').length : 0;
}

/**
 * Finds the visual center of the warm-ivory check glyph in a rendered control.
 *
 * @param {Buffer} buffer Element screenshot encoded as PNG.
 * @returns {{ horizontalOffset: number, verticalOffset: number }} Pixel-center offsets from the control center.
 */
function readCheckGlyphOffset(buffer) {
  const image = PNG.sync.read(buffer);
  let weightedX = 0;
  let weightedY = 0;
  let pixelCount = 0;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const red = image.data[offset];
      const green = image.data[offset + 1];
      const blue = image.data[offset + 2];
      const alpha = image.data[offset + 3];

      if (alpha > 200 && red > 210 && green > 200 && blue > 170) {
        weightedX += x + .5;
        weightedY += y + .5;
        pixelCount += 1;
      }
    }
  }

  if (pixelCount === 0) throw new Error('Expected the rendered check glyph to contain warm-ivory pixels.');

  return {
    horizontalOffset: Math.abs(weightedX / pixelCount - image.width / 2),
    verticalOffset: Math.abs(weightedY / pixelCount - image.height / 2)
  };
}

/**
 * Protects the shared faceted select affordance so the color-theme picker
 * cannot fall back to a browser-native chevron beside styled controls.
 */
test('Art Deco theme picker matches the neighboring select indicators', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));

      return {
        appearance: style.appearance,
        backgroundImage: style.backgroundImage,
        backgroundPosition: style.backgroundPosition,
        backgroundSize: style.backgroundSize
      };
    };

    return {
      theme: read('#themeSelect'),
      mode: read('#modeSelect')
    };
  });

  expect(evidence.theme.appearance).toBe('none');
  expect(evidence.theme.backgroundImage).toBe(evidence.mode.backgroundImage);
  expect(evidence.theme.backgroundPosition).toBe(evidence.mode.backgroundPosition);
  expect(evidence.theme.backgroundSize).toBe(evidence.mode.backgroundSize);
});

/**
 * Protects legible icon-button glyphs whose rendered text boxes stay centered
 * within the compact square Art Deco action frame.
 */
test('Art Deco icon-button glyphs are legible and geometrically centered', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => ['Semantic settings', 'Favorite', 'Icon action'].map((label) => {
    const element = document.querySelector(`[aria-label="${label}"]`);
    const bounds = element.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    const glyph = range.getBoundingClientRect();
    const style = getComputedStyle(element);

    return {
      label,
      fontSize: parseFloat(style.fontSize),
      horizontalOffset: Math.abs((glyph.x + glyph.width / 2) - (bounds.x + bounds.width / 2)),
      verticalOffset: Math.abs((glyph.y + glyph.height / 2) - (bounds.y + bounds.height / 2))
    };
  }));

  for (const icon of evidence) {
    expect(icon.fontSize, icon.label).toBeGreaterThanOrEqual(16);
    expect(icon.fontSize, icon.label).toBeLessThanOrEqual(18);
    expect(icon.horizontalOffset, icon.label).toBeLessThanOrEqual(1);
    expect(icon.verticalOffset, icon.label).toBeLessThanOrEqual(1.5);
  }
});

/**
 * Protects the authored check glyph against baseline drift inside both the
 * semantic adapter and the prefixed Art Deco checkbox control.
 */
test('Art Deco authored checkbox marks are optically centered', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const captures = [
    await page.locator('.ui-check-control').screenshot(),
    await page.locator('[data-testid="component-fields"] .deco-check input:checked + .deco-check-control').screenshot()
  ];
  const deviceScaleFactor = await page.evaluate(() => devicePixelRatio);

  for (const capture of captures) {
    const offset = readCheckGlyphOffset(capture);
    expect(offset.horizontalOffset / deviceScaleFactor).toBeLessThanOrEqual(1.5);
    expect(offset.verticalOffset / deviceScaleFactor).toBeLessThanOrEqual(1.5);
  }
});

/**
 * Protects the document's dark enamel tooltip plate, readable ivory copy,
 * and compact ornamental proportions in both material modes.
 */
test('Art Deco tooltips use the compact dark document treatment', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');

  const read = async (mode) => {
    await page.selectOption('#modeSelect', mode);

    return page.evaluate(() => {
      const element = document.querySelector('[data-testid="tooltip-accent"]');
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const channels = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (value) => {
        const normalized = channels(value).map((channel) => {
          const ratio = channel / 255;
          return ratio <= .04045 ? ratio / 12.92 : ((ratio + .055) / 1.055) ** 2.4;
        });
        return .2126 * normalized[0] + .7152 * normalized[1] + .0722 * normalized[2];
      };
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);

      return {
        width: bounds.width,
        backgroundLuminance: background,
        contrast: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05),
        borderStyle: style.borderStyle,
        clipVertices: style.clipPath.match(/^polygon\((.*)\)$/)?.[1].split(',').length ?? 0
      };
    });
  };

  for (const evidence of [await read('light'), await read('dark')]) {
    expect(evidence.width).toBeGreaterThanOrEqual(128);
    expect(evidence.backgroundLuminance).toBeLessThanOrEqual(.12);
    expect(evidence.contrast).toBeGreaterThanOrEqual(4.5);
    expect(evidence.borderStyle).toBe('double');
    expect(evidence.clipVertices).toBeGreaterThanOrEqual(8);
  }
});

/**
 * Protects busy actions from regressing to a generic ring by requiring the
 * same segmented Art Deco loader material used by the public spinner.
 */
test('Art Deco busy actions reuse the library segmented loader', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const spinner = getComputedStyle(document.querySelector('.deco-spinner'));
    const busy = getComputedStyle(document.querySelector('[data-testid="component-button-busy"]'), '::after');

    return {
      spinnerBackground: spinner.backgroundImage,
      busyBackground: busy.backgroundImage,
      busyBorderStyle: busy.borderStyle
    };
  });

  expect(evidence.spinnerBackground).toContain('repeating-conic-gradient');
  expect(evidence.busyBackground).toBe(evidence.spinnerBackground);
  expect(evidence.busyBorderStyle).toBe('double');
});

/**
 * Protects exact feature-icon centering and ensures both lines of seal copy
 * inherit the accessible warning-on-enamel foreground in every material mode.
 */
test('Art Deco feature medallions stay centered and seal copy stays readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');

  const read = async (mode) => {
    await page.selectOption('#modeSelect', mode);

    return page.evaluate(() => {
      const parseRgb = (value) => {
        const values = (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        return value.startsWith('color(') ? values.map((channel) => channel * 255) : values;
      };
      const luminance = (value) => {
        const channels = parseRgb(value).map((channel) => {
          const normalized = channel / 255;
          return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
        });
        return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
      };
      const contrast = (foreground, background) => {
        const light = Math.max(luminance(foreground), luminance(background));
        const dark = Math.min(luminance(foreground), luminance(background));
        return (light + .05) / (dark + .05);
      };
      const centerOffset = (selector) => {
        const element = document.querySelector(selector);
        const bounds = element.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element);
        const glyph = range.getBoundingClientRect();

        return {
          horizontal: Math.abs((glyph.x + glyph.width / 2) - (bounds.x + bounds.width / 2)),
          vertical: Math.abs((glyph.y + glyph.height / 2) - (bounds.y + bounds.height / 2))
        };
      };
      const seal = document.querySelector('.deco-badge-seal');
      const sealBackground = getComputedStyle(seal).backgroundColor;

      return {
        medallions: [
          centerOffset('.deco-feature-item:nth-child(1) > .deco-icon-medallion'),
          centerOffset('.deco-feature-item:nth-child(2) > .deco-icon-medallion')
        ],
        strongContrast: contrast(getComputedStyle(seal.querySelector('strong')).color, sealBackground),
        smallContrast: contrast(getComputedStyle(seal.querySelector('small')).color, sealBackground)
      };
    });
  };

  for (const evidence of [await read('light'), await read('dark'), await read('contrast')]) {
    for (const medallion of evidence.medallions) {
      expect(medallion.horizontal).toBeLessThanOrEqual(1);
      expect(medallion.vertical).toBeLessThanOrEqual(1);
    }
    expect(evidence.strongContrast).toBeGreaterThanOrEqual(4.5);
    expect(evidence.smallContrast).toBeGreaterThanOrEqual(4.5);
  }
});

/**
 * Protects the rounded utility as a visible but restrained soft-corner option
 * beside the preset's otherwise rectilinear frames.
 */
test('Art Deco rounded utility uses restrained visible corner arcs', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const radii = await page.locator('.deco-rounded.demo-utility-shape').evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius
    ].map(parseFloat);
  });

  for (const radius of radii) {
    expect(radius).toBeGreaterThanOrEqual(8);
    expect(radius).toBeLessThanOrEqual(12);
  }
});

/**
 * Protects the document's centered faceted range thumb by checking its
 * rendered vertical bounds and transparent diamond corners.
 */
test('Art Deco native ranges center a faceted document thumb', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const locator = page.locator('[data-testid="native-range-enabled"]');
  const metadata = await locator.evaluate((element) => {
    const root = getComputedStyle(document.body);
    const thumbToken = root.getPropertyValue('--usk-native-range-thumb-size').trim();
    const fontSize = parseFloat(getComputedStyle(element).fontSize);

    return {
      value: Number(element.value),
      minimum: element.min === '' ? 0 : Number(element.min),
      maximum: element.max === '' ? 100 : Number(element.max),
      thumbSize: parseFloat(thumbToken) * (thumbToken.endsWith('rem') ? fontSize : 1),
      deviceScaleFactor: devicePixelRatio
    };
  });
  const image = PNG.sync.read(await locator.screenshot());
  const thumbSize = metadata.thumbSize * metadata.deviceScaleFactor;
  const ratio = (metadata.value - metadata.minimum) / (metadata.maximum - metadata.minimum);
  const thumbCenterX = thumbSize / 2 + ratio * (image.width - thumbSize);
  const thumbCenterY = image.height / 2;
  const pageColor = [image.data[0], image.data[1], image.data[2]];
  const colorDistance = (x, y) => {
    const offset = (y * image.width + x) * 4;
    return Math.hypot(
      image.data[offset] - pageColor[0],
      image.data[offset + 1] - pageColor[1],
      image.data[offset + 2] - pageColor[2]
    );
  };
  const paintedRows = [];

  for (let y = 0; y < image.height; y += 1) {
    let painted = false;
    for (let x = Math.round(thumbCenterX - 4); x <= Math.round(thumbCenterX + 4); x += 1) {
      if (colorDistance(x, y) > 60) painted = true;
    }
    if (painted) paintedRows.push(y);
  }

  const visualCenter = (paintedRows[0] + paintedRows.at(-1) + 1) / 2;
  const cornerDistances = [-.36, .36].flatMap((vertical) => [-.36, .36].map((horizontal) => colorDistance(
    Math.round(thumbCenterX + horizontal * thumbSize),
    Math.round(thumbCenterY + vertical * thumbSize)
  )));

  expect(Math.abs(visualCenter - thumbCenterY) / metadata.deviceScaleFactor).toBeLessThanOrEqual(1);
  for (const distance of cornerDistances) expect(distance).toBeLessThanOrEqual(40);
});

test('Art Deco renders the Metropolitan Moderne frame and component language', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const body = styleFor('body');
    const card = styleFor('[data-testid="component-controls"]');
    const button = styleFor('.deco-button');
    const badge = styleFor('.deco-badge');
    const tooltip = styleFor('.deco-tooltip');
    const spinner = styleFor('.deco-spinner');
    const tableCell = styleFor('.deco-table tbody td:nth-child(2)');

    return {
      bodyBackgroundImage: body.backgroundImage,
      bodyFontFamily: body.fontFamily,
      goldKeyline: body.getPropertyValue('--deco-metal').trim(),
      cardBorderStyle: card.borderStyle,
      cardBorderWidth: card.borderWidth,
      cardRadius: card.borderRadius,
      cardShadow: card.boxShadow,
      buttonClipPath: button.clipPath,
      badgeClipPath: badge.clipPath,
      tooltipClipPath: tooltip.clipPath,
      spinnerBackgroundImage: spinner.backgroundImage,
      tableCellBorderInlineStartWidth: tableCell.borderInlineStartWidth
    };
  });

  expect(evidence.bodyBackgroundImage).not.toContain('radial-gradient');
  expect(evidence.bodyFontFamily).toContain('Arial Narrow');
  expect(evidence.goldKeyline).not.toBe('');
  expect(evidence.cardBorderStyle).toBe('double');
  expect(parseFloat(evidence.cardBorderWidth)).toBeGreaterThanOrEqual(3);
  expect(parseFloat(evidence.cardRadius)).toBeLessThanOrEqual(3);
  expect(evidence.cardShadow).toContain('inset');
  expect(countPolygonVertices(evidence.buttonClipPath)).toBeGreaterThanOrEqual(10);
  expect(countPolygonVertices(evidence.badgeClipPath)).toBeGreaterThanOrEqual(10);
  expect(countPolygonVertices(evidence.tooltipClipPath)).toBeGreaterThanOrEqual(8);
  expect(evidence.spinnerBackgroundImage).toContain('repeating-conic-gradient');
  expect(parseFloat(evidence.tableCellBorderInlineStartWidth)).toBeGreaterThanOrEqual(1);
});

test('Art Deco keeps annotated controls centered and readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const parseRgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
      });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const contrast = (foreground, background) => {
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return (light + .05) / (dark + .05);
    };
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const themeSelect = styleFor('#themeSelect');
    const nativeCheckbox = styleFor('[data-testid="native-forms"] input[type="checkbox"]:checked');
    const range = styleFor('[data-testid="native-range-focus"]');
    const serviceIcon = styleFor('.deco-card-service > .deco-icon-medallion');
    const trustedIcon = styleFor('.deco-feature-item:nth-child(1) > .deco-icon-medallion');
    const qualityIcon = styleFor('.deco-feature-item:nth-child(2) > .deco-icon-medallion');
    const seal = styleFor('.deco-badge-seal');

    return {
      themeSelectAppearance: themeSelect.appearance,
      themeSelectBackgroundImage: themeSelect.backgroundImage,
      checkboxBackgroundPosition: nativeCheckbox.backgroundPosition,
      checkboxBackgroundRepeat: nativeCheckbox.backgroundRepeat,
      checkboxBackgroundSize: nativeCheckbox.backgroundSize,
      rangeDisplay: range.display,
      rangeBlockSize: range.blockSize,
      rangeVerticalAlign: range.verticalAlign,
      serviceIconContrast: contrast(serviceIcon.color, serviceIcon.backgroundColor),
      trustedIconContrast: contrast(trustedIcon.color, trustedIcon.backgroundColor),
      qualityIconContrast: contrast(qualityIcon.color, qualityIcon.backgroundColor),
      sealContrast: contrast(seal.color, seal.backgroundColor)
    };
  });

  expect(evidence.themeSelectAppearance).toBe('none');
  expect(evidence.themeSelectBackgroundImage).toContain('linear-gradient');
  expect(evidence.checkboxBackgroundPosition).not.toBe('0% 0%, 0% 0%');
  expect(evidence.checkboxBackgroundRepeat).toContain('no-repeat');
  expect(evidence.checkboxBackgroundSize).not.toBe('auto');
  expect(evidence.rangeDisplay).toBe('block');
  expect(parseFloat(evidence.rangeBlockSize)).toBeGreaterThanOrEqual(32);
  expect(evidence.rangeVerticalAlign).toBe('middle');
  expect(evidence.serviceIconContrast).toBeGreaterThanOrEqual(4.5);
  expect(evidence.trustedIconContrast).toBeGreaterThanOrEqual(4.5);
  expect(evidence.qualityIconContrast).toBeGreaterThanOrEqual(4.5);
  expect(evidence.sealContrast).toBeGreaterThanOrEqual(4.5);
});

test('Art Deco carries stepped framing through forms, feedback, and native elements', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'sunset-ember');
  await page.selectOption('#modeSelect', 'dark');

  const readEvidence = () => page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const body = styleFor('body');
    const input = styleFor('.deco-input');
    const select = styleFor('.deco-select');
    const check = styleFor('.deco-check-control');
    const switchTrack = styleFor('.deco-switch-track');
    const progress = styleFor('.deco-progress');
    const alert = styleFor('.deco-alert');
    const nativeFieldset = styleFor('[data-testid="native-forms"] fieldset');
    const nativeDialog = styleFor('.demo-inline-dialog');
    const nativeProgress = styleFor('[data-testid="native-progress-partial"]');

    return {
      bodyBackgroundColor: body.backgroundColor,
      inputBorderStyle: input.borderStyle,
      inputRadius: input.borderRadius,
      inputShadow: input.boxShadow,
      selectBackgroundImage: select.backgroundImage,
      checkBorderStyle: check.borderStyle,
      switchTrackClipPath: switchTrack.clipPath,
      progressBorderStyle: progress.borderStyle,
      progressRadius: progress.borderRadius,
      alertBorderStyle: alert.borderStyle,
      alertRadius: alert.borderRadius,
      nativeFieldsetBorderStyle: nativeFieldset.borderStyle,
      nativeFieldsetRadius: nativeFieldset.borderRadius,
      nativeDialogClipPath: nativeDialog.clipPath,
      nativeProgressTrackBorder: nativeProgress.getPropertyValue('--usk-native-progress-track-border').trim()
    };
  });

  const dark = await readEvidence();
  expect(dark.inputBorderStyle).toBe('double');
  expect(parseFloat(dark.inputRadius)).toBeLessThanOrEqual(3);
  expect(dark.inputShadow).toContain('inset');
  expect(dark.selectBackgroundImage).toContain('linear-gradient');
  expect(dark.checkBorderStyle).toBe('double');
  expect(countPolygonVertices(dark.switchTrackClipPath)).toBeGreaterThanOrEqual(6);
  expect(dark.progressBorderStyle).toBe('double');
  expect(parseFloat(dark.progressRadius)).toBeLessThanOrEqual(3);
  expect(dark.alertBorderStyle).toBe('double');
  expect(parseFloat(dark.alertRadius)).toBeLessThanOrEqual(3);
  expect(dark.nativeFieldsetBorderStyle).toBe('double');
  expect(parseFloat(dark.nativeFieldsetRadius)).toBeLessThanOrEqual(3);
  expect(countPolygonVertices(dark.nativeDialogClipPath)).toBeGreaterThanOrEqual(8);
  expect(dark.nativeProgressTrackBorder).toContain('double');

  await page.selectOption('#modeSelect', 'light');
  const light = await readEvidence();
  expect(light.bodyBackgroundColor).not.toBe(dark.bodyBackgroundColor);
  expect(light.switchTrackClipPath).toBe(dark.switchTrackClipPath);
  expect(light.nativeDialogClipPath).toBe(dark.nativeDialogClipPath);
});

test('Art Deco keeps dense showcase surfaces dark, compact, and restrained', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const styleFor = (selector) => getComputedStyle(document.querySelector(selector));
    const gradientCount = (value) => (value.match(/linear-gradient/g) || []).length;
    const parseRgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
      });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const contrast = (foreground, background) => {
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return (light + .05) / (dark + .05);
    };
    const card = styleFor('.deco-card');
    const serviceCard = styleFor('.deco-card-service');
    const callout = styleFor('.deco-callout-bar');
    const calloutIcon = styleFor('.deco-callout-bar > .deco-icon-medallion');
    const fieldset = styleFor('[data-testid="native-forms"] fieldset');
    const tableHeader = styleFor('.deco-table th');

    return {
      cardGradientCount: gradientCount(card.backgroundImage),
      serviceCardGradientCount: gradientCount(serviceCard.backgroundImage),
      calloutGradientCount: gradientCount(callout.backgroundImage),
      fieldsetGradientCount: gradientCount(fieldset.backgroundImage),
      cardPaddingBlockStart: card.paddingBlockStart,
      calloutIconBackgroundImage: calloutIcon.backgroundImage,
      calloutIconContrast: contrast(calloutIcon.color, calloutIcon.backgroundColor),
      tableHeaderGradientCount: gradientCount(tableHeader.backgroundImage),
      tableHeaderContrast: contrast(tableHeader.color, tableHeader.backgroundColor)
    };
  });

  expect(evidence.cardGradientCount).toBe(0);
  expect(evidence.serviceCardGradientCount).toBe(0);
  expect(evidence.calloutGradientCount).toBe(0);
  expect(evidence.fieldsetGradientCount).toBe(0);
  expect(parseFloat(evidence.cardPaddingBlockStart)).toBeLessThanOrEqual(22);
  expect(evidence.calloutIconBackgroundImage).toBe('none');
  expect(evidence.calloutIconContrast).toBeGreaterThanOrEqual(4.5);
  expect(evidence.tableHeaderGradientCount).toBe(0);
  expect(evidence.tableHeaderContrast).toBeGreaterThanOrEqual(4.5);
});

/**
 * Protects restrained jewel action fills, stepped frames, and the shared
 * segmented busy indicator across the component state showcase.
 */
test('Art Deco action variants use restrained jewel fills and stepped frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const styleFor = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const primary = styleFor('.deco-button-primary');
    const secondary = styleFor('.deco-button-secondary');
    const neutral = styleFor('.deco-button:not(.deco-button-primary):not(.deco-button-secondary):not(.deco-button-danger):not(.deco-button-ghost)');
    const danger = styleFor('.deco-button-danger');
    const pressed = styleFor('[data-testid="component-button-active"]');
    const disabled = styleFor('[data-testid="component-button-disabled"]');
    const busyAfter = styleFor('[data-testid="component-button-busy"]', '::after');
    const cut = styleFor('.deco-button-cut');
    const outline = styleFor('.deco-button-outline-heavy');

    return {
      primaryBackgroundImage: primary.backgroundImage,
      secondaryBackgroundImage: secondary.backgroundImage,
      neutralBackgroundImage: neutral.backgroundImage,
      dangerBackgroundImage: danger.backgroundImage,
      pressedShadow: pressed.boxShadow,
      disabledOpacity: disabled.opacity,
      busyAfterRadius: busyAfter.borderRadius,
      busyAfterBackgroundImage: busyAfter.backgroundImage,
      cutClipPath: cut.clipPath,
      outlineClipPath: outline.clipPath,
      outlineBorderStyle: outline.borderStyle
    };
  });

  expect(evidence.primaryBackgroundImage).toBe('none');
  expect(evidence.secondaryBackgroundImage).toBe('none');
  expect(evidence.neutralBackgroundImage).toBe('none');
  expect(evidence.dangerBackgroundImage).toBe('none');
  expect(evidence.pressedShadow).toContain('inset');
  expect(parseFloat(evidence.disabledOpacity)).toBeLessThanOrEqual(.6);
  expect(parseFloat(evidence.busyAfterRadius)).toBeGreaterThanOrEqual(7);
  expect(evidence.busyAfterBackgroundImage).toContain('repeating-conic-gradient');
  expect(countPolygonVertices(evidence.cutClipPath)).toBeGreaterThanOrEqual(10);
  expect(countPolygonVertices(evidence.outlineClipPath)).toBeGreaterThanOrEqual(10);
  expect(evidence.outlineBorderStyle).toBe('double');
});

/**
 * Preserves the document's condensed mobile hierarchy and accessible touch
 * geometry without horizontal overflow.
 */
test('Art Deco preserves readable typography and mobile geometry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const heading = getComputedStyle(document.querySelector('.deco-heading'));
    const kicker = getComputedStyle(document.querySelector('.deco-kicker'));
    const label = getComputedStyle(document.querySelector('.deco-label'));
    const accentProbe = document.createElement('span');
    accentProbe.style.color = 'var(--deco-label-accent)';
    document.body.append(accentProbe);
    const labelAccent = getComputedStyle(accentProbe).color;
    accentProbe.remove();
    const primaryButton = document.querySelector('.deco-button-primary').getBoundingClientRect();
    const marketing = document.querySelector('[data-testid="marketing-components"]').getBoundingClientRect();

    return {
      bodyFontFamily: body.fontFamily,
      headingFontFamily: heading.fontFamily,
      kickerColor: kicker.color,
      labelAccent,
      labelFontSize: label.fontSize,
      buttonHeight: primaryButton.height,
      marketingLeft: marketing.left,
      marketingRight: marketing.right,
      documentScrollWidth: document.documentElement.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth
    };
  });

  expect(evidence.bodyFontFamily).toContain('Arial Narrow');
  expect(evidence.headingFontFamily).toMatch(/Bahnschrift Condensed|Arial Narrow|Aptos Narrow/);
  expect(evidence.kickerColor).toBe(evidence.labelAccent);
  expect(parseFloat(evidence.labelFontSize)).toBeGreaterThanOrEqual(11);
  expect(evidence.buttonHeight).toBeGreaterThanOrEqual(30);
  expect(evidence.buttonHeight).toBeLessThanOrEqual(36);
  expect(evidence.marketingLeft).toBeGreaterThanOrEqual(0);
  expect(evidence.marketingRight).toBeLessThanOrEqual(390);
  expect(evidence.documentScrollWidth).toBe(evidence.documentClientWidth);
});

test('Art Deco keeps poster-density actions aligned and feedback compact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const rectFor = (selector) => document.querySelector(selector).getBoundingClientRect();
    const primary = rectFor('[data-testid="component-buttons"] .deco-button-primary');
    const secondary = rectFor('[data-testid="component-buttons"] .deco-button-secondary');
    const neutral = rectFor('[data-testid="component-buttons"] .deco-button:not(.deco-button-primary):not(.deco-button-secondary):not(.deco-button-danger):not(.deco-button-ghost)');
    const alert = rectFor('.deco-alert');
    const alertBody = rectFor('.deco-alert-body');
    const alertBodyStyle = getComputedStyle(document.querySelector('.deco-alert-body'));

    return {
      primaryWidth: primary.width,
      secondaryWidth: secondary.width,
      neutralWidth: neutral.width,
      alertHeight: alert.height,
      alertBodyHeight: alertBody.height,
      alertBodyFontSize: alertBodyStyle.fontSize
    };
  });

  expect(evidence.primaryWidth).toBeGreaterThanOrEqual(160);
  expect(evidence.secondaryWidth).toBe(evidence.primaryWidth);
  expect(evidence.neutralWidth).toBe(evidence.primaryWidth);
  expect(evidence.alertHeight).toBeLessThanOrEqual(56);
  expect(evidence.alertBodyHeight).toBeLessThanOrEqual(20);
  expect(parseFloat(evidence.alertBodyFontSize)).toBeGreaterThanOrEqual(12);
});

/**
 * Protects the long, low instrument-action proportions shown in the retained
 * Metropolitan Moderne button specimen.
 */
test('Art Deco matches the document compact action proportions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        width: bounds.width,
        height: bounds.height,
        fontSize: parseFloat(style.fontSize),
        fontWeight: parseFloat(style.fontWeight)
      };
    };

    return {
      primary: read('[data-testid="component-buttons"] .deco-button-primary'),
      neutral: read('[data-testid="component-buttons"] .deco-button:not(.deco-button-primary):not(.deco-button-secondary):not(.deco-button-danger):not(.deco-button-ghost)'),
      icon: read('[data-testid="component-buttons"] .deco-icon-button')
    };
  });

  for (const action of [evidence.primary, evidence.neutral]) {
    expect(action.width).toBeGreaterThanOrEqual(188);
    expect(action.height).toBeGreaterThanOrEqual(30);
    expect(action.height).toBeLessThanOrEqual(36);
    expect(action.fontSize).toBeGreaterThanOrEqual(11);
    expect(action.fontSize).toBeLessThanOrEqual(13);
    expect(action.fontWeight).toBeLessThanOrEqual(600);
  }

  expect(evidence.icon.width).toBeLessThanOrEqual(38);
  expect(evidence.icon.height).toBeLessThanOrEqual(38);
});

/**
 * Protects the condensed section labels and compact tab-like navigation shown
 * throughout the retained Art Deco component document.
 */
test('Art Deco matches the document compact type and navigation chrome', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        height: bounds.height,
        fontFamily: style.fontFamily,
        fontSize: parseFloat(style.fontSize),
        fontWeight: parseFloat(style.fontWeight),
        letterSpacing: parseFloat(style.letterSpacing)
      };
    };

    return {
      heading: read('[data-testid="component-controls"] .deco-heading'),
      kicker: read('[data-testid="component-controls"] .deco-kicker'),
      subheading: read('[data-testid="component-buttons"] h4'),
      nav: read('.deco-nav-link')
    };
  });

  for (const label of [evidence.heading, evidence.kicker, evidence.subheading]) {
    expect(label.fontFamily).toMatch(/Bahnschrift Condensed|Arial Narrow|Aptos Narrow/);
    expect(label.fontFamily).not.toContain('Copperplate');
    expect(label.fontWeight).toBeLessThanOrEqual(600);
  }

  expect(evidence.heading.fontSize).toBeLessThanOrEqual(15);
  expect(evidence.nav.height).toBeGreaterThanOrEqual(28);
  expect(evidence.nav.height).toBeLessThanOrEqual(34);
  expect(evidence.nav.fontSize).toBeGreaterThanOrEqual(11);
  expect(evidence.nav.fontSize).toBeLessThanOrEqual(13);
  expect(evidence.nav.fontWeight).toBeLessThanOrEqual(600);
  expect(evidence.nav.letterSpacing).toBeGreaterThanOrEqual(.5);
});

/**
 * Protects the dense field, select, textarea, and choice-control proportions
 * shown in the retained native-form specimens.
 */
test('Art Deco matches the document compact field geometry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        width: bounds.width,
        height: bounds.height,
        fontSize: parseFloat(style.fontSize),
        fontWeight: parseFloat(style.fontWeight)
      };
    };

    return {
      field: read('[data-testid="component-fields"] .deco-input'),
      select: read('[data-testid="component-fields"] .deco-select'),
      textarea: read('[data-testid="component-fields"] .deco-textarea'),
      nativePanel: read('[data-testid="native-forms"]'),
      nativeField: read('[data-testid="native-forms"] input[type="text"]'),
      nativeCheckbox: read('[data-testid="native-forms"] input[type="checkbox"]'),
      nativeRadio: read('[data-testid="native-forms"] input[type="radio"]')
    };
  });

  for (const field of [evidence.field, evidence.select, evidence.nativeField]) {
    expect(field.height).toBeGreaterThanOrEqual(30);
    expect(field.height).toBeLessThanOrEqual(38);
    expect(field.fontSize).toBeGreaterThanOrEqual(11);
    expect(field.fontSize).toBeLessThanOrEqual(14);
    expect(field.fontWeight).toBeLessThanOrEqual(600);
  }

  expect(evidence.textarea.height).toBeGreaterThanOrEqual(64);
  expect(evidence.textarea.height).toBeLessThanOrEqual(96);
  expect(evidence.textarea.fontSize).toBeLessThanOrEqual(14);
  expect(evidence.nativePanel.width).toBeGreaterThanOrEqual(800);

  for (const choice of [evidence.nativeCheckbox, evidence.nativeRadio]) {
    expect(choice.width).toBeGreaterThanOrEqual(14);
    expect(choice.width).toBeLessThanOrEqual(18);
    expect(choice.height).toBe(choice.width);
  }
});

/**
 * Protects the compact status, alert, and tabular density used by the retained
 * badges, message strips, and component-table specimens.
 */
test('Art Deco matches the document dense status and data rhythm', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        height: bounds.height,
        fontSize: parseFloat(style.fontSize),
        fontWeight: parseFloat(style.fontWeight),
        paddingBlock: parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd)
      };
    };

    return {
      badge: read('[data-testid="component-badges"] .deco-badge-primary'),
      alert: read('[data-testid="component-alerts"] .deco-alert-success'),
      tableWrap: read('[data-testid="component-table"]'),
      tableRow: read('[data-testid="component-table"] .deco-table tbody tr'),
      tableCell: read('[data-testid="component-table"] .deco-table tbody td')
    };
  });

  expect(evidence.badge.height).toBeGreaterThanOrEqual(20);
  expect(evidence.badge.height).toBeLessThanOrEqual(24);
  expect(evidence.badge.fontSize).toBeGreaterThanOrEqual(10);
  expect(evidence.badge.fontSize).toBeLessThanOrEqual(12);
  expect(evidence.badge.fontWeight).toBeLessThanOrEqual(600);

  expect(evidence.alert.height).toBeGreaterThanOrEqual(28);
  expect(evidence.alert.height).toBeLessThanOrEqual(34);
  expect(evidence.tableWrap.height).toBeLessThanOrEqual(190);
  expect(evidence.tableRow.height).toBeGreaterThanOrEqual(28);
  expect(evidence.tableRow.height).toBeLessThanOrEqual(34);
  expect(evidence.tableCell.fontSize).toBeGreaterThanOrEqual(10);
  expect(evidence.tableCell.fontSize).toBeLessThanOrEqual(13);
  expect(evidence.tableCell.paddingBlock).toBeLessThanOrEqual(12);
});

/**
 * Protects the reference's restrained jewel enamels while proving that each
 * result remains theme-responsive and readable in light, dark, and contrast.
 */
test('Art Deco tempers semantic colors into accessible theme-aware jewel paint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');

  const readState = async (theme, mode) => {
    await page.selectOption('#themeSelect', theme);
    await page.selectOption('#modeSelect', mode);

    return page.evaluate(() => {
      const parseRgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (value) => {
        const channels = parseRgb(value).map((channel) => {
          const normalized = channel / 255;
          return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
        });
        return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
      };
      const contrast = (foreground, background) => {
        const light = Math.max(luminance(foreground), luminance(background));
        const dark = Math.min(luminance(foreground), luminance(background));
        return (light + .05) / (dark + .05);
      };
      const button = getComputedStyle(document.querySelector('.deco-button-primary'));
      const badge = getComputedStyle(document.querySelector('.deco-badge-success'));
      const root = getComputedStyle(document.body);

      return {
        rawPrimary: parseRgb(root.getPropertyValue('--deco-primary-rgb')).join(','),
        buttonBackground: button.backgroundColor,
        buttonBackgroundChannels: parseRgb(button.backgroundColor).join(','),
        buttonContrast: contrast(button.color, button.backgroundColor),
        badgeBackground: badge.backgroundColor,
        badgeContrast: contrast(badge.color, badge.backgroundColor)
      };
    });
  };

  const arcticDark = await readState('arctic-indigo', 'dark');
  const sunsetDark = await readState('sunset-ember', 'dark');
  const arcticLight = await readState('arctic-indigo', 'light');
  const arcticContrast = await readState('arctic-indigo', 'contrast');

  for (const state of [arcticDark, sunsetDark, arcticLight, arcticContrast]) {
    expect(state.buttonBackgroundChannels).not.toBe(state.rawPrimary);
    expect(state.buttonContrast).toBeGreaterThanOrEqual(4.5);
    expect(state.badgeContrast).toBeGreaterThanOrEqual(4.5);
  }

  expect(arcticDark.buttonBackground).not.toBe(sunsetDark.buttonBackground);
  expect(arcticDark.badgeBackground).not.toBe(sunsetDark.badgeBackground);
});

/**
 * Protects the thin calibrated tracks and restrained status-medallion scale
 * shown in the retained progress and operational-strip specimens.
 */
test('Art Deco matches the document instrument tracks and status scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        width: bounds.width,
        height: bounds.height,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage
      };
    };

    return {
      progress: read('[data-testid="component-progress"] .deco-progress'),
      progressBar: read('[data-testid="component-progress"] .deco-progress-bar'),
      nativeProgress: read('[data-testid="native-progress-partial"]'),
      nativeMeter: read('[data-testid="native-meter-suboptimum"]'),
      featureMedallion: read('.deco-feature-item .deco-icon-medallion'),
      serviceMedallion: read('.deco-card-service .deco-icon-medallion'),
      seal: read('.deco-badge-seal')
    };
  });

  expect(evidence.progress.height).toBeGreaterThanOrEqual(6);
  expect(evidence.progress.height).toBeLessThanOrEqual(10);
  expect(evidence.progressBar.backgroundImage).toContain('linear-gradient');
  expect(evidence.nativeProgress.height).toBeGreaterThanOrEqual(8);
  expect(evidence.nativeProgress.height).toBeLessThanOrEqual(14);
  expect(evidence.nativeMeter.height).toBeGreaterThanOrEqual(8);
  expect(evidence.nativeMeter.height).toBeLessThanOrEqual(14);

  expect(evidence.featureMedallion.width).toBeLessThanOrEqual(48);
  expect(evidence.featureMedallion.height).toBeLessThanOrEqual(48);
  expect(evidence.serviceMedallion.width).toBeLessThanOrEqual(56);
  expect(evidence.serviceMedallion.height).toBeLessThanOrEqual(56);
  expect(evidence.seal.width).toBeLessThanOrEqual(60);
  expect(evidence.seal.height).toBeLessThanOrEqual(60);
});

/**
 * Proves that the compact desktop treatment expands interactive targets for
 * touch users and remains free of horizontal page overflow.
 */
test('Art Deco preserves coarse-pointer targets and mobile containment', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const heightOf = (selector) => document.querySelector(selector).getBoundingClientRect().height;
    const widthOf = (selector) => document.querySelector(selector).getBoundingClientRect().width;

    return {
      buttonHeight: heightOf('.deco-button-primary'),
      iconButtonHeight: heightOf('.deco-icon-button'),
      fieldHeight: heightOf('[data-testid="component-fields"] .deco-input'),
      checkboxWidth: widthOf('[data-testid="native-forms"] input[type="checkbox"]'),
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    };
  });

  expect(evidence.buttonHeight).toBeGreaterThanOrEqual(44);
  expect(evidence.iconButtonHeight).toBeGreaterThanOrEqual(44);
  expect(evidence.fieldHeight).toBeGreaterThanOrEqual(44);
  expect(evidence.checkboxWidth).toBeGreaterThanOrEqual(24);
  expect(evidence.pageWidth).toBeLessThanOrEqual(evidence.viewportWidth);

  await context.close();
});

/**
 * Protects the compact checked, radio, switch, and calibrated range states
 * identified in the retained form-control annotations.
 */
test('Art Deco matches the document choice and range instrumentation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1180, height: 900 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'art-deco');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        width: bounds.width,
        height: bounds.height,
        backgroundColor: style.backgroundColor
      };
    };
    const root = getComputedStyle(document.body);

    return {
      checkbox: read('.deco-check-control'),
      radio: read('.deco-radio-control'),
      switchTrack: read('.deco-switch-track'),
      checkedBackgroundChannels: (read('.deco-check input:checked + .deco-check-control').backgroundColor.match(/[\d.]+/g) || []).slice(0, 3).join(','),
      rawPrimaryChannels: (root.getPropertyValue('--deco-primary-rgb').match(/[\d.]+/g) || []).slice(0, 3).join(','),
      rangeTrackPaint: root.getPropertyValue('--usk-native-range-track-background').trim()
    };
  });

  for (const choice of [evidence.checkbox, evidence.radio]) {
    expect(choice.width).toBeGreaterThanOrEqual(14);
    expect(choice.width).toBeLessThanOrEqual(18);
    expect(choice.height).toBe(choice.width);
  }

  expect(evidence.switchTrack.width).toBeGreaterThanOrEqual(38);
  expect(evidence.switchTrack.width).toBeLessThanOrEqual(44);
  expect(evidence.switchTrack.height).toBeGreaterThanOrEqual(20);
  expect(evidence.switchTrack.height).toBeLessThanOrEqual(24);
  expect(evidence.checkedBackgroundChannels).not.toBe(evidence.rawPrimaryChannels);
  expect(evidence.rangeTrackPaint).not.toContain('--deco-success');
  expect(evidence.rangeTrackPaint).not.toContain('--deco-danger');
});
