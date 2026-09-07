import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;

/**
 * Protects the paired document modes from drifting back to tinted dashboard
 * gradients, soft cards, or oversized application typography.
 */
test('Data Terminal modes use flat compact command planes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');

  const readMode = async (mode) => {
    await page.selectOption('#modeSelect', mode);

    return page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const card = getComputedStyle(document.querySelector('[data-testid="component-controls"]'));
      const heading = getComputedStyle(document.querySelector('[data-testid="component-controls"] .terminal-heading'));
      const field = getComputedStyle(document.querySelector('[data-testid="component-fields"] .terminal-input'));

      return {
        bodyBackground: body.backgroundColor,
        bodyBackgroundImage: body.backgroundImage,
        bodyFontFamily: body.fontFamily,
        bodyFontSize: Number.parseFloat(body.fontSize),
        cardBackgroundImage: card.backgroundImage,
        cardRadius: Number.parseFloat(card.borderTopLeftRadius),
        cardShadow: card.boxShadow,
        headingFontSize: Number.parseFloat(heading.fontSize),
        fieldBackgroundImage: field.backgroundImage,
        fieldRadius: Number.parseFloat(field.borderTopLeftRadius)
      };
    });
  };

  const light = await readMode('light');
  const dark = await readMode('dark');
  const channels = (color) => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const lightChannels = channels(light.bodyBackground);
  const darkChannels = channels(dark.bodyBackground);

  expect(Math.min(...lightChannels)).toBeGreaterThanOrEqual(238);
  expect(Math.max(...lightChannels) - Math.min(...lightChannels)).toBeLessThanOrEqual(16);
  expect(Math.max(...darkChannels)).toBeLessThanOrEqual(24);

  for (const evidence of [light, dark]) {
    expect(evidence.bodyBackgroundImage).not.toContain('radial-gradient');
    expect((evidence.bodyBackgroundImage.match(/linear-gradient/g) || [])).toHaveLength(2);
    expect(evidence.bodyFontFamily).toContain('monospace');
    expect(evidence.bodyFontSize).toBeGreaterThanOrEqual(12);
    expect(evidence.bodyFontSize).toBeLessThanOrEqual(14);
    expect(evidence.cardBackgroundImage).toBe('none');
    expect(evidence.cardRadius).toBe(0);
    expect(evidence.cardShadow).toBe('none');
    expect(evidence.headingFontSize).toBeLessThanOrEqual(18);
    expect(evidence.fieldBackgroundImage).toBe('none');
    expect(evidence.fieldRadius).toBe(0);
  }
});

/**
 * Protects the document's bracketed actions, compact square controls, and
 * hard-edged status affordances as one coherent component-laboratory system.
 */
test('Data Terminal controls follow the document command grammar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const style = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const bounds = (selector) => document.querySelector(selector).getBoundingClientRect();
    const primary = style('[data-testid="component-buttons"] .terminal-button-primary');
    const secondary = style('[data-testid="component-buttons"] .terminal-button-secondary');
    const danger = style('[data-testid="component-buttons"] .terminal-button-danger');
    const icon = document.querySelector('[aria-label="Icon action"]');
    const iconBounds = icon.getBoundingClientRect();
    const iconRange = document.createRange();
    iconRange.selectNodeContents(icon);
    const iconGlyph = iconRange.getBoundingClientRect();
    const input = style('[data-testid="component-fields"] .terminal-input');
    const select = style('[data-testid="component-fields"] .terminal-select');
    const check = style('.terminal-check-control');
    const radio = style('.terminal-radio-control');
    const switchTrack = style('.terminal-switch-track');
    const switchThumb = style('.terminal-switch-thumb');
    const tooltip = style('[data-testid="tooltip-accent"]');
    const spinner = style('.terminal-spinner');
    const spinnerSignal = style('.terminal-spinner', '::after');

    return {
      primaryBefore: style('[data-testid="component-buttons"] .terminal-button-primary', '::before').content,
      primaryAfter: style('[data-testid="component-buttons"] .terminal-button-primary', '::after').content,
      primaryBackground: primary.backgroundColor,
      primaryBorder: primary.borderTopColor,
      secondaryBackground: secondary.backgroundColor,
      dangerBackground: danger.backgroundColor,
      dangerBorder: danger.borderTopColor,
      surfaceBackground: style('[data-testid="component-controls"]').backgroundColor,
      buttonHeight: bounds('[data-testid="component-buttons"] .terminal-button-primary').height,
      iconWidth: iconBounds.width,
      iconHeight: iconBounds.height,
      iconHorizontalOffset: Math.abs((iconGlyph.x + iconGlyph.width / 2) - (iconBounds.x + iconBounds.width / 2)),
      iconVerticalOffset: Math.abs((iconGlyph.y + iconGlyph.height / 2) - (iconBounds.y + iconBounds.height / 2)),
      inputHeight: bounds('[data-testid="component-fields"] .terminal-input').height,
      inputShadow: input.boxShadow,
      selectImage: select.backgroundImage,
      checkSize: bounds('.terminal-check-control').width,
      checkRadius: Number.parseFloat(check.borderTopLeftRadius),
      radioRadius: Number.parseFloat(radio.borderTopLeftRadius),
      switchHeight: bounds('.terminal-switch-track').height,
      switchRadius: Number.parseFloat(switchTrack.borderTopLeftRadius),
      switchThumbRadius: Number.parseFloat(switchThumb.borderTopLeftRadius),
      tooltipBackground: tooltip.backgroundColor,
      tooltipColor: tooltip.color,
      tooltipBorderStyle: tooltip.borderTopStyle,
      spinnerRadius: Number.parseFloat(spinner.borderTopLeftRadius),
      spinnerShadow: spinner.boxShadow,
      spinnerTiming: spinnerSignal.animationTimingFunction
    };
  });

  expect(evidence.primaryBefore).toBe('"["');
  expect(evidence.primaryAfter).toBe('"]"');
  expect(evidence.primaryBackground).toBe(evidence.primaryBorder);
  expect(evidence.secondaryBackground).toBe(evidence.surfaceBackground);
  expect(evidence.dangerBackground).toBe(evidence.surfaceBackground);
  expect(evidence.dangerBorder).not.toBe(evidence.surfaceBackground);
  expect(evidence.buttonHeight).toBeGreaterThanOrEqual(28);
  expect(evidence.buttonHeight).toBeLessThanOrEqual(34);
  expect(Math.abs(evidence.iconWidth - evidence.iconHeight)).toBeLessThanOrEqual(1);
  expect(evidence.iconHorizontalOffset).toBeLessThanOrEqual(1);
  expect(evidence.iconVerticalOffset).toBeLessThanOrEqual(1.5);
  expect(evidence.inputHeight).toBeLessThanOrEqual(34);
  expect(evidence.inputShadow).toBe('none');
  expect(evidence.selectImage).toContain('45deg');
  expect(evidence.checkSize).toBeGreaterThanOrEqual(15);
  expect(evidence.checkSize).toBeLessThanOrEqual(18);
  expect(evidence.checkRadius).toBe(0);
  expect(evidence.radioRadius).toBe(0);
  expect(evidence.switchHeight).toBeLessThanOrEqual(22);
  expect(evidence.switchRadius).toBe(0);
  expect(evidence.switchThumbRadius).toBe(0);
  expect(evidence.tooltipBackground).toBe(evidence.surfaceBackground);
  expect(evidence.tooltipColor).not.toBe(evidence.surfaceBackground);
  expect(evidence.tooltipBorderStyle).toBe('dashed');
  expect(evidence.spinnerRadius).toBe(0);
  expect(evidence.spinnerShadow).toBe('none');
  expect(evidence.spinnerTiming).toContain('steps');
});

/**
 * Prevents browser-native and authored chevrons from painting together while
 * keeping the single terminal indicator vertically centered in every select.
 */
test('Data Terminal selects expose one centered terminal indicator', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 787, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const styles = getComputedStyle(document.querySelector(selector));
      return {
        appearance: styles.appearance,
        backgroundImage: styles.backgroundImage,
        backgroundPosition: styles.backgroundPosition
      };
    };

    return {
      demoSelect: read('#uiSelect'),
      classedSelect: read('[data-testid="component-fields"] .terminal-select'),
      nativeSelect: read('[data-testid="native-forms"] select:not([multiple])')
    };
  });

  for (const select of Object.values(evidence)) {
    expect(select.appearance).toBe('none');
    expect(select.backgroundImage).toContain('linear-gradient');
    expect(select.backgroundPosition.match(/50%/g)).toHaveLength(2);
  }
});

/**
 * Ensures terminal loading feedback scans across a segmented status track and
 * that busy buttons use the same preset-specific motion instead of a ring.
 */
test('Data Terminal loaders scan left to right without opacity pulsing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const spinner = document.querySelector('.terminal-spinner:not(.terminal-spinner-sm):not(.terminal-spinner-lg)');
    const spinnerStyle = getComputedStyle(spinner);
    const scannerStyle = getComputedStyle(spinner, '::after');
    const busy = document.querySelector('[data-testid="component-button-busy"]');
    const busyButtonStyle = getComputedStyle(busy);
    const busyStyle = getComputedStyle(busy, '::after');

    return {
      spinnerWidth: spinner.getBoundingClientRect().width,
      spinnerHeight: spinner.getBoundingClientRect().height,
      spinnerBackground: spinnerStyle.backgroundImage,
      spinnerShadow: spinnerStyle.boxShadow,
      scannerAnimation: scannerStyle.animationName,
      scannerOpacity: scannerStyle.opacity,
      busyWidth: Number.parseFloat(busyStyle.width),
      busyHeight: Number.parseFloat(busyStyle.height),
      busyFontSize: Number.parseFloat(busyStyle.fontSize),
      busyContent: busyStyle.content,
      busyColor: busyButtonStyle.color,
      busyBackground: busyStyle.backgroundImage,
      busyBorderRadius: Number.parseFloat(busyStyle.borderTopLeftRadius),
      busyAnimation: busyStyle.animationName,
      busyOpacity: busyStyle.opacity
    };
  });

  expect(evidence.spinnerWidth).toBeGreaterThanOrEqual(44);
  expect(evidence.spinnerHeight).toBeLessThanOrEqual(10);
  expect(evidence.spinnerBackground).toContain('repeating-linear-gradient');
  expect(evidence.spinnerShadow).toBe('none');
  expect(evidence.scannerAnimation).toContain('terminal-signal-scan');
  expect(evidence.scannerOpacity).toBe('1');
  expect(evidence.busyWidth).toBeGreaterThanOrEqual(35);
  expect(evidence.busyHeight).toBeGreaterThanOrEqual(evidence.busyFontSize * 0.9);
  expect(evidence.busyContent).toBe('"]"');
  expect(evidence.busyBackground).toContain('linear-gradient');
  const firstBusyColor = evidence.busyBackground.match(/rgba?\(([^)]+)\)/)?.[1] || '';
  const buttonColor = evidence.busyColor.match(/rgba?\(([^)]+)\)/)?.[1] || '';
  expect((firstBusyColor.match(/[\d.]+/g) || []).slice(0, 3)).toEqual(
    (buttonColor.match(/[\d.]+/g) || []).slice(0, 3)
  );
  expect(evidence.busyBorderRadius).toBe(0);
  expect(evidence.busyAnimation).toContain('terminal-signal-scan');
  expect(evidence.busyOpacity).toBe('1');
});

/**
 * Keeps the commercial feature strip on the same neutral ruled plane as the
 * reference instead of inheriting an unrelated decorative gold rail.
 */
test('Data Terminal feature strips use neutral terminal rules', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.locator('.terminal-feature-strip').evaluate((strip) => {
    const styles = getComputedStyle(strip);
    const calloutStyles = getComputedStyle(document.querySelector('.terminal-callout-bar'));
    return {
      backgroundImage: styles.backgroundImage,
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderBottomColor: styles.borderBottomColor,
      borderLeftColor: styles.borderLeftColor,
      boxShadow: styles.boxShadow,
      calloutBackgroundImage: calloutStyles.backgroundImage
    };
  });

  expect(evidence.backgroundImage).toBe('none');
  expect(evidence.borderTopColor).toBe(evidence.borderBottomColor);
  expect(evidence.borderTopColor).toBe(evidence.borderLeftColor);
  expect(evidence.boxShadow).toBe('none');
  expect(evidence.calloutBackgroundImage).toBe('none');
});

/**
 * Pins the authored tooltip chevron to the label's vertical center so the
 * directional cue cannot drift toward the top edge of the compact control.
 */
test('Data Terminal tooltip arrows remain vertically centered', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const tooltip = page.locator('[data-testid="tooltip-accent"]');
  const arrow = tooltip.locator('.terminal-tooltip-arrow');
  const evidence = await tooltip.evaluate((element) => {
    const arrowElement = element.querySelector('.terminal-tooltip-arrow');
    const tooltipBox = element.getBoundingClientRect();
    const arrowBox = arrowElement.getBoundingClientRect();
    return {
      alignSelf: getComputedStyle(arrowElement).alignSelf,
      arrowTop: arrowBox.top,
      tooltipCenter: tooltipBox.top + (tooltipBox.height / 2),
      deviceScaleFactor: devicePixelRatio
    };
  });
  const image = PNG.sync.read(await arrow.screenshot());
  const paintedRows = [];
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const channels = [image.data[offset], image.data[offset + 1], image.data[offset + 2]];
      if (Math.max(...channels) - Math.min(...channels) > 40) {
        paintedRows.push(y);
        break;
      }
    }
  }
  const paintedCenter = (paintedRows[0] + paintedRows.at(-1) + 1) / 2 / evidence.deviceScaleFactor;
  const paintedCenterDelta = Math.abs(evidence.tooltipCenter - (evidence.arrowTop + paintedCenter));

  expect(evidence.alignSelf).toBe('center');
  expect(paintedCenterDelta).toBeLessThanOrEqual(1.1);
});

/**
 * Guards the annotated tablet viewport against visual collisions between the
 * loading specimens, neighboring control panels, and semantic API samples.
 */
test('Data Terminal control and semantic loaders stay inside their layout lanes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 787, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const overlaps = (first, second) => first.left < second.right
      && first.right > second.left
      && first.top < second.bottom
      && first.bottom > second.top;
    const control = document.querySelector('.demo-control-showcase');
    const panels = [...control.querySelectorAll('.demo-control-panel')].map((panel) => panel.getBoundingClientRect());
    const spinners = [...document.querySelectorAll('[data-testid="component-spinner"] [role="status"]')]
      .map((spinner) => spinner.getBoundingClientRect());
    const semanticRow = document.querySelector('#semantic-runtime [data-semantic-node="data-card"] .demo-semantic-row');
    const semanticItems = [...semanticRow.children].map((item) => item.getBoundingClientRect());

    return {
      controlOverflow: control.scrollWidth - control.clientWidth,
      panelOverlap: panels.some((panel, index) => panels.slice(index + 1).some((other) => overlaps(panel, other))),
      spinnerOverlap: spinners.some((spinner, index) => spinners.slice(index + 1).some((other) => overlaps(spinner, other))),
      semanticOverlap: overlaps(semanticItems[0], semanticItems[1]),
      semanticOverflow: semanticRow.scrollWidth - semanticRow.clientWidth
    };
  });

  expect(evidence.controlOverflow).toBeLessThanOrEqual(1);
  expect(evidence.panelOverlap).toBe(false);
  expect(evidence.spinnerOverlap).toBe(false);
  expect(evidence.semanticOverlap).toBe(false);
  expect(evidence.semanticOverflow).toBeLessThanOrEqual(1);
});

/**
 * Verifies the square range thumb is optically centered over the calibrated
 * terminal scale, including the thumb border that participates in its box.
 */
test('Data Terminal native range thumbs center on the calibrated bar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const locator = page.locator('[data-testid="native-range-enabled"]');
  const metadata = await locator.evaluate((element) => {
    const root = getComputedStyle(document.body);
    const token = root.getPropertyValue('--usk-native-range-thumb-size').trim();
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {
      value: Number(element.value),
      minimum: element.min === '' ? 0 : Number(element.min),
      maximum: element.max === '' ? 100 : Number(element.max),
      thumbSize: Number.parseFloat(token) * (token.endsWith('rem') ? rootSize : 1),
      deviceScaleFactor: devicePixelRatio
    };
  });
  const image = PNG.sync.read(await locator.screenshot());
  const thumbSize = metadata.thumbSize * metadata.deviceScaleFactor;
  const ratio = (metadata.value - metadata.minimum) / (metadata.maximum - metadata.minimum);
  const thumbCenterX = thumbSize / 2 + ratio * (image.width - thumbSize);
  const pageColor = [image.data[0], image.data[1], image.data[2]];
  const distance = (x, y) => {
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
    for (let x = Math.round(thumbCenterX - 3); x <= Math.round(thumbCenterX + 3); x += 1) {
      if (distance(x, y) > 55) painted = true;
    }
    if (painted) paintedRows.push(y);
  }

  const visualCenter = (paintedRows[0] + paintedRows.at(-1) + 1) / 2;
  expect(Math.abs(visualCenter - (image.height / 2)) / metadata.deviceScaleFactor).toBeLessThanOrEqual(1);
});

/**
 * Matches the reference ledger with compact uppercase headers, neutral cells,
 * and horizontal rules instead of dashboard-style filled header blocks.
 */
test('Data Terminal table headers use compact neutral ledger rules', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const read = (headerSelector, cellSelector) => {
      const header = document.querySelector(headerSelector);
      const cell = document.querySelector(cellSelector);
      const headerStyle = getComputedStyle(header);
      const cellStyle = getComputedStyle(cell);
      return {
        height: header.getBoundingClientRect().height,
        fontSize: Number.parseFloat(headerStyle.fontSize),
        fontFamily: headerStyle.fontFamily,
        fontWeight: Number.parseInt(headerStyle.fontWeight, 10),
        textTransform: headerStyle.textTransform,
        paddingTop: Number.parseFloat(headerStyle.paddingTop),
        background: headerStyle.backgroundColor,
        cellBackground: cellStyle.backgroundColor,
        borderTop: Number.parseFloat(headerStyle.borderTopWidth),
        borderLeft: Number.parseFloat(headerStyle.borderLeftWidth),
        borderBottom: Number.parseFloat(headerStyle.borderBottomWidth)
      };
    };

    return {
      classed: read('[data-testid="component-table"] .terminal-table th', '[data-testid="component-table"] .terminal-table td'),
      semantic: read('#semantic-runtime .ui-table th', '#semantic-runtime .ui-table td')
    };
  });

  for (const header of Object.values(evidence)) {
    expect(header.height).toBeLessThanOrEqual(24);
    expect(header.fontSize).toBeLessThanOrEqual(12);
    expect(header.fontFamily.toLowerCase()).toMatch(/mono|consolas/);
    expect(header.fontWeight).toBeLessThanOrEqual(600);
    expect(header.textTransform).toBe('uppercase');
    expect(header.paddingTop).toBeLessThanOrEqual(5);
    expect(header.background).toBe(header.cellBackground);
    expect(header.borderTop).toBe(0);
    expect(header.borderLeft).toBe(0);
    expect(header.borderBottom).toBe(1);
  }
});

/**
 * Protects status colors and dense data controls so semantic meaning remains
 * visible without turning terminal labels, rows, or meters into decorative UI.
 */
test('Data Terminal data surfaces use strict semantic signal roles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');
  await page.locator('[data-testid="component-table"] tbody tr').nth(1).hover();

  const evidence = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const bounds = (selector) => document.querySelector(selector).getBoundingClientRect();
    const root = getComputedStyle(document.body);
    const remSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const badge = style('.terminal-badge-primary');
    const successBadge = style('.terminal-badge-success');
    const warningBadge = style('.terminal-badge-warning');
    const dangerBadge = style('.terminal-badge-danger');
    const successAlert = style('.terminal-alert-success');
    const successAlertBody = style('.terminal-alert-success .terminal-alert-body');
    const activeNav = style('.terminal-nav-link[aria-current="page"]');
    const rangeTrack = root.getPropertyValue('--usk-native-range-track-background').trim();

    return {
      surface: style('[data-testid="component-badges"]').backgroundColor,
      badgeBackground: badge.backgroundColor,
      badgeColor: badge.color,
      badgeBorder: badge.borderTopColor,
      successBadgeBackground: successBadge.backgroundColor,
      successBadgeColor: successBadge.color,
      successBadgeBorder: successBadge.borderTopColor,
      warningBadgeBackground: warningBadge.backgroundColor,
      warningBadgeColor: warningBadge.color,
      warningBadgeBorder: warningBadge.borderTopColor,
      dangerBadgeBackground: dangerBadge.backgroundColor,
      dangerBadgeColor: dangerBadge.color,
      dangerBadgeBorder: dangerBadge.borderTopColor,
      alertBackground: successAlert.backgroundColor,
      alertColor: successAlert.color,
      alertBodyColor: successAlertBody.color,
      alertBorder: successAlert.borderTopColor,
      alertHeight: bounds('.terminal-alert-success').height,
      progressHeight: bounds('.terminal-progress').height,
      progressRadius: Number.parseFloat(style('.terminal-progress').borderTopLeftRadius),
      progressImage: style('.terminal-progress-bar').backgroundImage,
      rangeTrack,
      rangeThumbSize: Number.parseFloat(root.getPropertyValue('--usk-native-range-thumb-size')) * remSize,
      rowHeight: bounds('[data-testid="component-table"] tbody tr:nth-child(2)').height,
      activeNavBackground: activeNav.backgroundColor,
      primary: root.getPropertyValue('--terminal-primary').trim(),
      success: root.getPropertyValue('--terminal-success').trim(),
      warning: root.getPropertyValue('--terminal-warning').trim(),
      danger: root.getPropertyValue('--terminal-danger').trim(),
      pillRadius: Number.parseFloat(style('.terminal-pill').borderTopLeftRadius)
    };
  });
  evidence.hoveredRowBackground = await page
    .locator('[data-testid="component-table"] tbody tr')
    .nth(1)
    .evaluate((row) => getComputedStyle(row.cells[0]).backgroundColor);

  for (const badge of [
    [evidence.badgeBackground, evidence.badgeColor, evidence.badgeBorder],
    [evidence.successBadgeBackground, evidence.successBadgeColor, evidence.successBadgeBorder],
    [evidence.warningBadgeBackground, evidence.warningBadgeColor, evidence.warningBadgeBorder],
    [evidence.dangerBadgeBackground, evidence.dangerBadgeColor, evidence.dangerBadgeBorder]
  ]) {
    expect(badge[0]).toBe(evidence.surface);
    expect(badge[1]).toBe(badge[2]);
  }

  expect(evidence.alertBackground).toBe(evidence.surface);
  expect(evidence.alertColor).toBe(evidence.alertBorder);
  expect(evidence.alertBodyColor).toBe(evidence.alertColor);
  expect(evidence.alertHeight).toBeLessThanOrEqual(54);
  expect(evidence.progressHeight).toBeLessThanOrEqual(10);
  expect(evidence.progressRadius).toBe(0);
  expect(evidence.progressImage).toContain('repeating-linear-gradient');
  expect(evidence.rangeTrack).toContain('repeating-linear-gradient');
  expect(evidence.rangeTrack).toContain(evidence.success);
  expect(evidence.rangeTrack).toContain(evidence.warning);
  expect(evidence.rangeTrack).toContain(evidence.danger);
  expect(evidence.rangeThumbSize).toBeGreaterThanOrEqual(10);
  expect(evidence.rangeThumbSize).toBeLessThanOrEqual(14);
  expect(evidence.rowHeight).toBeLessThanOrEqual(30);
  expect(evidence.hoveredRowBackground).toBe(evidence.activeNavBackground);
  expect(evidence.pillRadius).toBe(0);
});

/**
 * Protects standalone consumers by providing the retained document palette
 * only until a more specific library color theme supplies its own tokens.
 */
test('Data Terminal standalone use falls back to the document palette', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#modeSelect', 'light');
  await page.addStyleTag({ content: '* { transition: none !important; }' });

  const read = () => page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const button = getComputedStyle(document.querySelector('.terminal-button-primary'));

    return {
      background: body.backgroundColor,
      text: body.color,
      primary: body.getPropertyValue('--terminal-primary').trim(),
      success: body.getPropertyValue('--terminal-success').trim(),
      warning: body.getPropertyValue('--terminal-warning').trim(),
      danger: body.getPropertyValue('--terminal-danger').trim(),
      buttonBackground: button.backgroundColor,
      buttonColor: button.color
    };
  });

  await page.locator('body').evaluate((body) => body.removeAttribute('data-theme'));
  await page.waitForTimeout(250);
  const fallbackLight = await read();

  await page.locator('body').evaluate((body) => body.setAttribute('data-mode', 'dark'));
  await page.waitForTimeout(250);
  const fallbackDark = await read();

  await page.locator('body').evaluate((body) => {
    body.dataset.theme = 'arctic-indigo';
    body.dataset.mode = 'light';
  });
  await page.waitForTimeout(250);
  const themed = await read();

  expect(fallbackLight.background).toBe('rgb(250, 250, 246)');
  expect(fallbackLight.text).toBe('rgb(20, 22, 21)');
  expect(fallbackLight.primary).toBe('rgb(22 82 190)');
  expect(fallbackLight.success).toBe('rgb(36 132 55)');
  expect(fallbackLight.warning).toBe('rgb(190 111 0)');
  expect(fallbackLight.danger).toBe('rgb(211 43 50)');
  expect(fallbackLight.buttonBackground).toBe('rgb(22, 82, 190)');
  expect(fallbackLight.buttonColor).toBe('rgb(255, 255, 255)');

  expect(fallbackDark.background).toBe('rgb(2, 4, 3)');
  expect(fallbackDark.text).toBe('rgb(236, 237, 232)');
  expect(fallbackDark.primary).toBe('rgb(52 125 255)');
  expect(fallbackDark.success).toBe('rgb(74 205 84)');
  expect(fallbackDark.warning).toBe('rgb(255 176 0)');
  expect(fallbackDark.danger).toBe('rgb(255 71 78)');

  expect(themed.primary).not.toBe(fallbackLight.primary);
  expect(themed.buttonBackground).not.toBe(fallbackLight.buttonBackground);
});

/**
 * Protects library accessibility behavior while the preset uses the dense
 * document geometry: focus remains visible, motion is reduced, and compact
 * surfaces stay contained in a narrow viewport and in contrast mode.
 */
test('Data Terminal preserves accessibility and responsive contracts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'contrast');

  const primary = page.locator('[data-testid="component-buttons"] .terminal-button-primary');
  await primary.focus();

  const evidence = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const button = getComputedStyle(document.querySelector('[data-testid="component-buttons"] .terminal-button-primary'));
    const spinner = getComputedStyle(document.querySelector('.terminal-spinner'), '::after');

    return {
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyBackground: body.backgroundColor,
      bodyColor: body.color,
      buttonBackground: button.backgroundColor,
      buttonColor: button.color,
      focusOutline: button.outlineStyle,
      focusShadow: button.boxShadow,
      animationDuration: Number.parseFloat(spinner.animationDuration) * (spinner.animationDuration.endsWith('ms') ? 1 : 1000),
      transitionDuration: Number.parseFloat(button.transitionDuration) * (button.transitionDuration.endsWith('ms') ? 1 : 1000)
    };
  });

  expect(evidence.horizontalOverflow).toBeLessThanOrEqual(0);
  expect(evidence.bodyBackground).toBe('rgb(0, 0, 0)');
  expect(evidence.bodyColor).not.toBe(evidence.bodyBackground);
  expect(evidence.buttonColor).not.toBe(evidence.buttonBackground);
  expect(evidence.focusOutline !== 'none' || evidence.focusShadow !== 'none').toBe(true);
  expect(evidence.animationDuration).toBeLessThanOrEqual(1);
  expect(evidence.transitionDuration).toBeLessThanOrEqual(1);
});

/**
 * Protects the compact document scale across classed, native, and commercial
 * examples while keeping every text icon optically centered in its cell.
 */
test('Data Terminal keeps controls and icons on the dense terminal grid', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.evaluate(() => {
    const measure = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      const range = document.createRange();
      range.selectNodeContents(element);
      const glyph = range.getBoundingClientRect();

      return {
        width: bounds.width,
        height: bounds.height,
        fontSize: Number.parseFloat(styles.fontSize),
        paddingTop: Number.parseFloat(styles.paddingTop),
        clipPath: styles.clipPath,
        horizontalOffset: Math.abs((glyph.x + glyph.width / 2) - (bounds.x + bounds.width / 2)),
        verticalOffset: Math.abs((glyph.y + glyph.height / 2) - (bounds.y + bounds.height / 2))
      };
    };

    return {
      heading: measure('[data-testid="component-controls"] .terminal-heading'),
      card: measure('[data-testid="component-controls"]'),
      classedInput: measure('[data-testid="component-fields"] .terminal-input'),
      nativeInput: measure('[data-testid="native-forms"] input[type="text"]'),
      spinner: measure('.terminal-spinner'),
      serviceIcon: measure('.terminal-card-service > .terminal-icon-medallion'),
      featureIcon: measure('.terminal-feature-item .terminal-icon-medallion'),
      calloutIcon: measure('.terminal-callout-bar .terminal-icon-medallion')
    };
  });

  expect(evidence.heading.fontSize).toBeLessThanOrEqual(14);
  expect(evidence.card.paddingTop).toBeLessThanOrEqual(10);
  expect(evidence.classedInput.height).toBeLessThanOrEqual(32);
  expect(evidence.nativeInput.height).toBeLessThanOrEqual(36);
  expect(evidence.spinner.clipPath).toBe('none');

  expect(evidence.serviceIcon.fontSize).toBeGreaterThanOrEqual(22);
  expect(evidence.featureIcon.width).toBeGreaterThanOrEqual(32);
  expect(evidence.featureIcon.height).toBeGreaterThanOrEqual(32);
  expect(evidence.featureIcon.fontSize).toBeGreaterThanOrEqual(16);
  expect(evidence.calloutIcon.width).toBeGreaterThanOrEqual(36);
  expect(evidence.calloutIcon.height).toBeGreaterThanOrEqual(36);
  expect(evidence.calloutIcon.fontSize).toBeGreaterThanOrEqual(18);

  for (const icon of [evidence.serviceIcon, evidence.featureIcon, evidence.calloutIcon]) {
    expect(icon.horizontalOffset).toBeLessThanOrEqual(1);
  }

  expect(evidence.serviceIcon.verticalOffset).toBeLessThanOrEqual(2);
  for (const icon of [evidence.featureIcon, evidence.calloutIcon]) {
    expect(icon.verticalOffset).toBeLessThanOrEqual(1.5);
  }
});

/**
 * Keeps the calibrated range scale readable in dark mode by requiring its
 * one-pixel ticks to remain visibly lighter than the surrounding track plane.
 */
test('Data Terminal dark range ticks retain visible contrast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const locator = page.getByTestId('native-range-enabled');
  const image = PNG.sync.read(await locator.screenshot());
  const sampleY = Math.round(image.height * .4);
  const readPixel = (x) => {
    const offset = (sampleY * image.width + x) * 4;
    return [image.data[offset], image.data[offset + 1], image.data[offset + 2]];
  };
  const luminance = (channels) => channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
  const contrast = (first, second) => {
    const lighter = Math.max(luminance(first), luminance(second));
    const darker = Math.min(luminance(first), luminance(second));
    return (lighter + .05) / (darker + .05);
  };
  const unfilledScaleStart = Math.round(image.width * .64);
  const unfilledScaleEnd = Math.round(image.width * .7);
  const scaleCells = Array.from(
    { length: unfilledScaleEnd - unfilledScaleStart },
    (_, index) => readPixel(unfilledScaleStart + index)
  );
  const tick = scaleCells.reduce((brightest, pixel) => (
    luminance(pixel) > luminance(brightest) ? pixel : brightest
  ));
  const track = scaleCells.reduce((darkest, pixel) => (
    luminance(pixel) < luminance(darkest) ? pixel : darkest
  ));

  expect(luminance(tick)).toBeGreaterThan(luminance(track));
  expect(contrast(tick, track)).toBeGreaterThanOrEqual(3);
});

/**
 * Protects native dialog copy from touching the one-pixel command frame while
 * keeping the inline specimen compact enough for the reference board.
 */
test('Data Terminal native dialogs keep an interior text edge', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const padding = await page.locator('.demo-inline-dialog > form').evaluate((form) => {
    const styles = getComputedStyle(form);
    return {
      block: Number.parseFloat(styles.paddingBlockStart),
      inline: Number.parseFloat(styles.paddingInlineStart)
    };
  });

  expect(padding.block).toBeGreaterThanOrEqual(8);
  expect(padding.inline).toBeGreaterThanOrEqual(8);
});

/**
 * Prevents the neutral button plane from overriding the selected-state fill,
 * which would leave dark active labels painted directly on the dark canvas.
 */
test('Data Terminal active buttons preserve readable selected-state contrast', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.getByTestId('component-button-active').evaluate((button) => {
    const styles = getComputedStyle(button);
    const channels = (color) => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (color) => channels(color)
      .map((channel) => channel / 255)
      .map((channel) => (channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4))
      .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
    const foreground = luminance(styles.color);
    const background = luminance(styles.backgroundColor);

    return {
      background: styles.backgroundColor,
      border: styles.borderTopColor,
      contrast: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05)
    };
  });

  expect(evidence.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(evidence.background).toBe(evidence.border);
  expect(evidence.contrast).toBeGreaterThanOrEqual(4.5);
});

/**
 * Keeps every demo copy affordance legible after native button sizing is
 * applied, so the two-sheet icon cannot collapse into a narrow dot.
 */
test('Data Terminal copy buttons retain a legible square icon', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const copies = await page.locator('.demo-copy-button').evaluateAll((buttons) => buttons.map((button) => {
    const icon = button.querySelector('svg');
    const buttonBox = button.getBoundingClientRect();
    const iconBox = icon.getBoundingClientRect();
    return {
      buttonWidth: buttonBox.width,
      buttonHeight: buttonBox.height,
      iconWidth: iconBox.width,
      iconHeight: iconBox.height
    };
  }));

  expect(copies.length).toBeGreaterThanOrEqual(3);
  for (const copy of copies) {
    expect(Math.abs(copy.buttonWidth - copy.buttonHeight)).toBeLessThanOrEqual(1);
    expect(copy.iconWidth).toBeGreaterThanOrEqual(18);
    expect(copy.iconHeight).toBeGreaterThanOrEqual(18);
    expect(Math.abs(copy.iconWidth - copy.iconHeight)).toBeLessThanOrEqual(1);
  }
});

/**
 * Gives the complete native form inventory a full grid row so its fields can
 * form multiple columns instead of creating a tall empty neighboring lane.
 */
test('Data Terminal native forms use the available desktop grid width', async ({ page }) => {
  await page.setViewportSize({ width: 1467, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.evaluate(() => {
    const grid = document.querySelector('.demo-native-grid').getBoundingClientRect();
    const forms = document.querySelector('[data-testid="native-forms"]').getBoundingClientRect();
    const columns = getComputedStyle(document.querySelector('[data-testid="native-forms"] .demo-form-grid'))
      .gridTemplateColumns
      .split(' ')
      .filter(Boolean)
      .length;
    return {
      widthRatio: forms.width / grid.width,
      height: forms.height,
      columns
    };
  });

  expect(evidence.widthRatio).toBeGreaterThan(.95);
  expect(evidence.columns).toBeGreaterThanOrEqual(3);
  expect(evidence.height).toBeLessThan(900);
});

/**
 * Keeps the commercial secondary CTA in the same square bracket grammar as
 * the rest of the terminal actions instead of applying a decorative cut rail.
 */
test('Data Terminal secondary CTA matches the command-button system', async ({ page }) => {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'cyber-lime');
  await page.selectOption('#modeSelect', 'dark');

  const evidence = await page.getByTestId('marketing-secondary-cta').evaluate((button) => {
    const styles = getComputedStyle(button);
    return {
      clipPath: styles.clipPath,
      shadow: styles.boxShadow,
      borderWidth: Number.parseFloat(styles.borderTopWidth),
      before: getComputedStyle(button, '::before').content,
      after: getComputedStyle(button, '::after').content
    };
  });

  expect(evidence.clipPath).toBe('none');
  expect(evidence.shadow).toBe('none');
  expect(evidence.borderWidth).toBe(1);
  expect(evidence.before).toBe('"["');
  expect(evidence.after).toBe('"]"');
});

/**
 * Ensures the native media specimen visibly follows the selected color theme
 * instead of retaining a fixed purple-and-gold demonstration palette.
 */
test('Data Terminal native media inherits the active color theme', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#modeSelect', 'dark');

  const picture = page.locator('[data-testid="native-media"] picture');
  const average = async (theme) => {
    await page.selectOption('#themeSelect', theme);
    const image = PNG.sync.read(await picture.screenshot());
    const totals = [0, 0, 0];
    let pixels = 0;
    for (let offset = 0; offset < image.data.length; offset += 4) {
      if (image.data[offset + 3] === 0) continue;
      totals[0] += image.data[offset];
      totals[1] += image.data[offset + 1];
      totals[2] += image.data[offset + 2];
      pixels += 1;
    }
    return totals.map((total) => total / pixels);
  };

  const lime = await average('cyber-lime');
  const indigo = await average('arctic-indigo');
  const colorDelta = Math.hypot(...lime.map((channel, index) => channel - indigo[index]));
  const treatment = await picture.evaluate((element) => ({
    overlay: getComputedStyle(element, '::after').backgroundImage,
    imageFilter: getComputedStyle(element.querySelector('img')).filter
  }));

  expect(colorDelta).toBeGreaterThanOrEqual(20);
  expect(treatment.overlay).toContain('gradient');
  expect(treatment.imageFilter).toContain('grayscale');
});

/**
 * Keeps the callout arrow visually dominant inside its existing compact
 * medallion at the annotated responsive viewport.
 */
test('Data Terminal callout arrow keeps a legible mobile scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 602, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.locator('.terminal-callout-bar > .terminal-icon-medallion').evaluate((icon) => {
    const styles = getComputedStyle(icon);
    const bounds = icon.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      fontSize: Number.parseFloat(styles.fontSize)
    };
  });

  expect(evidence.width).toBeGreaterThanOrEqual(36);
  expect(evidence.height).toBeGreaterThanOrEqual(36);
  expect(evidence.fontSize).toBeGreaterThanOrEqual(24);
});

/**
 * Protects native object fallback copy from touching or clipping against the
 * object frame at the annotated responsive viewport.
 */
test('Data Terminal native object fallback keeps an interior text edge', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 602, height: 792 });
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'data-terminal');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', 'light');

  const evidence = await page.locator('[data-testid="native-media"] .demo-object').evaluate((object) => {
    const styles = getComputedStyle(object);
    const bounds = object.getBoundingClientRect();
    const parentBounds = object.parentElement.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(object);
    const textBounds = range.getBoundingClientRect();
    return {
      paddingTop: Number.parseFloat(styles.paddingTop),
      paddingLeft: Number.parseFloat(styles.paddingLeft),
      textTopInset: textBounds.top - bounds.top,
      textLeftInset: textBounds.left - bounds.left,
      rightOverflow: bounds.right - parentBounds.right
    };
  });

  expect(evidence.paddingTop).toBeGreaterThanOrEqual(12);
  expect(evidence.paddingLeft).toBeGreaterThanOrEqual(12);
  expect(evidence.textTopInset).toBeGreaterThanOrEqual(12);
  expect(evidence.textLeftInset).toBeGreaterThanOrEqual(12);
  expect(evidence.rightOverflow).toBeLessThanOrEqual(0.5);
});
