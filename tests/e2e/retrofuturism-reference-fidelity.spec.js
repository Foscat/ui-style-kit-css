import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const demoUrl = pathToFileURL(path.join(rootDir, 'index.html')).href;

/**
 * Loads the editable Retrofuturism source after the generated demo bundle.
 *
 * @param {import('@playwright/test').Page} page Active browser page.
 * @returns {Promise<void>} Promise resolved when the source stylesheet is ready.
 */
async function loadRetrofuturismSource(page) {
  const href = `${pathToFileURL(path.join(rootDir, 'styles', 'retrofuturism.css')).href}?v=${Date.now()}`;
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
 * Opens the component atlas with the requested Retrofuturism display mode.
 *
 * @param {import('@playwright/test').Page} page Active browser page.
 * @param {'light'|'dark'} mode Display mode to render.
 * @returns {Promise<void>} Promise resolved when the preset source is active.
 */
async function openRetrofuturism(page, mode = 'light') {
  await page.goto(demoUrl);
  await page.selectOption('#uiSelect', 'retrofuturism');
  await page.selectOption('#themeSelect', 'arctic-indigo');
  await page.selectOption('#modeSelect', mode);
  await loadRetrofuturismSource(page);
}

test('Retrofuturism centers checked marks and gives icon actions readable symbols', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const readMark = (controlSelector) => {
      const control = document.querySelector(controlSelector);
      const mark = getComputedStyle(control, '::after');
      return {
        display: mark.display,
        position: mark.position,
        inset: mark.inset,
        placeItems: mark.placeItems
      };
    };
    const readIcon = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        width: rect.width,
        height: rect.height
      };
    };

    return {
      prefixedMark: readMark('.retro-check input:checked + .retro-check-control'),
      semanticMark: readMark('.ui-check input:checked + .ui-check-control'),
      prefixedIcon: readIcon('.retro-icon-button'),
      semanticIcon: readIcon('.ui-icon-button')
    };
  });

  for (const mark of [evidence.prefixedMark, evidence.semanticMark]) {
    expect(mark.display).toBe('grid');
    expect(mark.position).toBe('absolute');
    expect(mark.inset).toBe('0px');
    expect(mark.placeItems).toBe('center');
  }

  for (const icon of [evidence.prefixedIcon, evidence.semanticIcon]) {
    expect(icon.fontSize).toBeGreaterThanOrEqual(20);
    expect(icon.lineHeight).toBe(icon.fontSize);
    expect(icon.width).toBeGreaterThanOrEqual(44);
    expect(icon.height).toBeGreaterThanOrEqual(44);
  }
});

test('Retrofuturism uses compact rectangular appliance buttons for prefixed and native actions', async ({ page }) => {
  await openRetrofuturism(page);

  const actions = await page.evaluate(() => {
    const read = (element) => {
      const style = getComputedStyle(element);
      return {
        backgroundImage: style.backgroundImage,
        borderStyle: style.borderStyle,
        radius: Number.parseFloat(style.borderRadius),
        height: element.getBoundingClientRect().height
      };
    };
    const prefixed = [...document.querySelectorAll('[data-testid="component-buttons"] .retro-button')]
      .map(read);
    const native = [...document.querySelectorAll('[data-testid="native-buttons"] button, [data-testid="native-buttons"] input')]
      .map(read);
    return { prefixed, native };
  });

  for (const action of [...actions.prefixed, ...actions.native]) {
    const label = `${action.group} ${action.text}`;
    expect(action.backgroundImage, label).toContain('linear-gradient');
    expect(action.borderStyle, label).toBe('double');
    expect(action.radius, label).toBeGreaterThanOrEqual(6);
    expect(action.radius, label).toBeLessThanOrEqual(12);
    expect(action.height, label).toBeGreaterThanOrEqual(44);
  }
});

test('Retrofuturism uses enamel medallions and an orbital loading instrument', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        backgroundImage: style.backgroundImage,
        fontSize: Number.parseFloat(style.fontSize),
        radius: style.borderRadius,
        width: rect.width,
        height: rect.height
      };
    };

    return {
      feature: read('.retro-feature-item > .retro-icon-medallion'),
      callout: read('.retro-callout-bar > .retro-icon-medallion'),
      spinner: read('.retro-spinner-lg')
    };
  });

  expect(evidence.feature.backgroundImage).toContain('linear-gradient');
  expect(evidence.feature.width).toBeGreaterThanOrEqual(36);
  expect(evidence.feature.width).toBeLessThanOrEqual(48);
  expect(evidence.feature.height).toBe(evidence.feature.width);
  expect(evidence.feature.fontSize).toBeGreaterThanOrEqual(20);
  expect(evidence.callout.backgroundImage).toContain('linear-gradient');
  expect(evidence.callout.width).toBeGreaterThanOrEqual(72);
  expect(evidence.callout.width).toBeLessThanOrEqual(76);
  expect(evidence.callout.height).toBe(evidence.callout.width);
  expect(evidence.callout.fontSize).toBeGreaterThanOrEqual(24);
  expect(evidence.spinner.backgroundImage).toContain('conic-gradient');
  expect(evidence.spinner.backgroundImage).toContain('radial-gradient');
  expect(evidence.spinner.radius).toBe('50%');
});

test('Retrofuturism badges and tables use compact indicator-panel treatment', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const badges = [...document.querySelectorAll('[data-testid="component-badges"] .retro-badge')]
      .map((badge) => {
        const style = getComputedStyle(badge);
        const lamp = getComputedStyle(badge, '::before');
        return {
          backgroundImage: style.backgroundImage,
          radius: Number.parseFloat(style.borderRadius),
          height: badge.getBoundingClientRect().height,
          lampContent: lamp.content,
          lampWidth: Number.parseFloat(lamp.width),
          lampRadius: lamp.borderRadius
        };
      });
    const table = document.querySelector('[data-testid="component-table"] .retro-table');
    const tableStyle = getComputedStyle(table);
    const headerStyle = getComputedStyle(table.querySelector('th'));
    const cellStyle = getComputedStyle(table.querySelector('td'));
    return {
      badges,
      table: {
        borderWidth: Number.parseFloat(tableStyle.borderTopWidth),
        radius: Number.parseFloat(tableStyle.borderRadius),
        headerShadow: headerStyle.boxShadow,
        headerDivider: Number.parseFloat(headerStyle.borderBottomWidth),
        cellDivider: Number.parseFloat(cellStyle.borderInlineEndWidth)
      }
    };
  });

  for (const badge of evidence.badges) {
    expect(badge.backgroundImage).toContain('linear-gradient');
    expect(badge.radius).toBeGreaterThanOrEqual(6);
    expect(badge.radius).toBeLessThanOrEqual(10);
    expect(badge.height).toBeGreaterThanOrEqual(28);
    expect(badge.lampContent).not.toBe('none');
    expect(badge.lampWidth).toBeGreaterThanOrEqual(7);
    expect(badge.lampRadius).toBe('50%');
  }
  expect(evidence.table.borderWidth).toBeGreaterThanOrEqual(1);
  expect(evidence.table.radius).toBeGreaterThanOrEqual(6);
  expect(evidence.table.radius).toBeLessThanOrEqual(12);
  expect(evidence.table.headerShadow).toBe('none');
  expect(evidence.table.headerDivider).toBe(1);
  expect(evidence.table.cellDivider).toBe(1);
});

test('Retrofuturism forms use recessed fields, one selector indicator, and a calibrated range', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const readField = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return {
        appearance: style.appearance,
        backgroundImage: style.backgroundImage,
        indicatorCount: (style.backgroundImage.match(/linear-gradient/g) || []).length,
        paddingInlineEnd: Number.parseFloat(style.paddingInlineEnd),
        radius: Number.parseFloat(style.borderRadius),
        height: element.getBoundingClientRect().height
      };
    };
    const rootStyle = getComputedStyle(document.body);
    const resolveLength = (propertyName) => {
      const probe = document.createElement('span');
      probe.style.position = 'absolute';
      probe.style.blockSize = `var(${propertyName})`;
      document.body.append(probe);
      const value = Number.parseFloat(getComputedStyle(probe).blockSize);
      probe.remove();
      return value;
    };
    return {
      prefixedInput: readField('.retro-input'),
      nativeInput: readField('[data-testid="native-forms"] input[type="text"]'),
      prefixedSelect: readField('.retro-select'),
      nativeSelect: readField('[data-testid="native-select-single"]'),
      demoSelect: readField('#uiSelect'),
      range: {
        appearance: getComputedStyle(document.querySelector('[data-testid="native-range-enabled"]')).appearance,
        trackSize: resolveLength('--usk-native-range-track-size'),
        trackBackground: rootStyle.getPropertyValue('--usk-native-range-track-background').trim(),
        thumbSize: resolveLength('--usk-native-range-thumb-size')
      }
    };
  });

  for (const field of [evidence.prefixedInput, evidence.nativeInput]) {
    expect(field.backgroundImage).toContain('linear-gradient');
    expect(field.radius).toBeGreaterThanOrEqual(6);
    expect(field.radius).toBeLessThanOrEqual(10);
    expect(field.height).toBeGreaterThanOrEqual(44);
  }
  for (const select of [evidence.prefixedSelect, evidence.nativeSelect]) {
    expect(select.appearance).toBe('none');
    expect(select.indicatorCount).toBe(2);
    expect(select.paddingInlineEnd).toBeGreaterThanOrEqual(40);
    expect(select.radius).toBeLessThanOrEqual(10);
  }
  expect(evidence.demoSelect.appearance).toBe('auto');
  expect(evidence.demoSelect.backgroundImage).toBe('none');
  expect(evidence.demoSelect.paddingInlineEnd).toBeGreaterThanOrEqual(32);
  expect(evidence.demoSelect.radius).toBeLessThanOrEqual(10);
  expect(evidence.range.appearance).toBe('none');
  expect(evidence.range.trackSize).toBeGreaterThanOrEqual(6);
  expect(evidence.range.trackBackground).toContain('linear-gradient');
  expect(evidence.range.thumbSize).toBeGreaterThanOrEqual(18);
  expect(evidence.range.thumbSize).toBeLessThanOrEqual(24);
});

test('Retrofuturism dialogs keep headings, copy, and actions inside the enamel frame', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const dialog = document.querySelector('.demo-inline-dialog');
    const form = dialog.querySelector('form');
    const heading = form.querySelector('h3');
    const copy = form.querySelector('p');
    const action = form.querySelector('button');
    const dialogBox = dialog.getBoundingClientRect();
    const formStyle = getComputedStyle(form);
    const edgeDistances = (element) => {
      const box = element.getBoundingClientRect();
      return {
        left: box.left - dialogBox.left,
        right: dialogBox.right - box.right,
        top: box.top - dialogBox.top,
        bottom: dialogBox.bottom - box.bottom
      };
    };
    return {
      paddingInline: Number.parseFloat(formStyle.paddingInlineStart),
      paddingBlock: Number.parseFloat(formStyle.paddingBlockStart),
      heading: edgeDistances(heading),
      copy: edgeDistances(copy),
      action: edgeDistances(action)
    };
  });

  expect(evidence.paddingInline).toBeGreaterThanOrEqual(16);
  expect(evidence.paddingBlock).toBeGreaterThanOrEqual(16);
  expect(evidence.heading.left).toBeGreaterThanOrEqual(16);
  expect(evidence.copy.left).toBeGreaterThanOrEqual(16);
  expect(evidence.copy.right).toBeGreaterThanOrEqual(16);
  expect(evidence.action.left).toBeGreaterThanOrEqual(16);
  expect(evidence.action.right).toBeGreaterThanOrEqual(16);
  expect(evidence.action.bottom).toBeGreaterThanOrEqual(16);
});

test('Retrofuturism utility shapes visibly distinguish pill, rounded, and border treatments', async ({ page }) => {
  await openRetrofuturism(page);

  const evidence = await page.evaluate(() => {
    const readShape = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return {
        backgroundImage: style.backgroundImage,
        borderRadius: Number.parseFloat(style.borderRadius),
        borderStyle: style.borderStyle,
        borderWidth: Number.parseFloat(style.borderWidth)
      };
    };
    return {
      pill: readShape('[data-testid="utility-layout-sample"] .retro-pill'),
      rounded: readShape('[data-testid="utility-layout-sample"] .retro-rounded'),
      border: readShape('[data-testid="utility-layout-sample"] .retro-border')
    };
  });

  expect(evidence.pill.borderRadius).toBeGreaterThanOrEqual(30);
  expect(evidence.pill.borderWidth).toBeGreaterThanOrEqual(2);
  expect(evidence.pill.backgroundImage).toContain('linear-gradient');
  expect(evidence.rounded.borderRadius).toBeGreaterThanOrEqual(6);
  expect(evidence.rounded.borderRadius).toBeLessThanOrEqual(12);
  expect(evidence.border.borderStyle).toBe('double');
  expect(evidence.border.borderWidth).toBeGreaterThanOrEqual(3);
});
