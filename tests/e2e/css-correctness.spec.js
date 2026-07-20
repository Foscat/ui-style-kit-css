import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const authoredBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.css');
const minifiedBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.min.css');

async function installNativeFixture(page, stylesheetPath) {
  await page.setContent(`<!doctype html>
    <html>
      <body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
        <button id="button" type="button">Action</button>
        <input id="text-input" type="text" value="Text input">
        <select id="select"><option>Choice</option></select>
        <input id="file-input" type="file">
        <dialog id="dialog">Modal content</dialog>
        <div id="calc-probe" style="inline-size: var(--saas-radius-xl); block-size: 1px;"></div>
      </body>
    </html>`);
  await page.addStyleTag({ path: stylesheetPath });
}

async function nativeControlSnapshot(page, stylesheetPath) {
  await installNativeFixture(page, stylesheetPath);

  return page.evaluate(() => {
    const properties = [
      'backgroundColor',
      'color',
      'borderTopColor',
      'borderTopStyle',
      'borderTopWidth',
      'borderRadius',
      'minHeight',
      'paddingTop'
    ];
    const snapshot = (selector) => {
      const styles = getComputedStyle(document.querySelector(selector));
      return Object.fromEntries(properties.map((property) => [property, styles[property]]));
    };

    return {
      button: snapshot('#button'),
      input: snapshot('#text-input'),
      select: snapshot('#select'),
      calcProbeInlineSize: getComputedStyle(document.querySelector('#calc-probe')).inlineSize
    };
  });
}

test('minified bundle preserves computed styles for representative native controls', async ({ page }) => {
  const authored = await nativeControlSnapshot(page, authoredBundlePath);
  const minified = await nativeControlSnapshot(page, minifiedBundlePath);

  expect(minified.button).toEqual(authored.button);
  expect(minified.input).toEqual(authored.input);
  expect(minified.select).toEqual(authored.select);
});

test('minified bundle preserves computed calc values', async ({ page }) => {
  const authored = await nativeControlSnapshot(page, authoredBundlePath);
  const minified = await nativeControlSnapshot(page, minifiedBundlePath);

  expect(minified.calcProbeInlineSize).toBe(authored.calcProbeInlineSize);
});

test('Chromium accepts and applies native pseudo-element rules to a modal fixture', async ({ page }) => {
  await installNativeFixture(page, minifiedBundlePath);

  const result = await page.evaluate(() => {
    const dialog = document.querySelector('#dialog');
    const fileInput = document.querySelector('#file-input');
    const primaryProbe = document.createElement('span');
    const backdropProbe = document.createElement('span');

    primaryProbe.style.background = 'var(--usk-native-primary)';
    backdropProbe.style.background = 'rgb(0 0 0 / .62)';
    document.body.append(primaryProbe, backdropProbe);
    dialog.showModal();

    const selectors = [];
    const collectSelectors = (rules) => {
      // Nested layer and conditional rules must be traversed to inspect Chromium's accepted CSSOM.
      for (const rule of rules) {
        if ('selectorText' in rule) selectors.push(rule.selectorText);
        if ('cssRules' in rule) collectSelectors(rule.cssRules);
      }
    };

    for (const stylesheet of document.styleSheets) collectSelectors(stylesheet.cssRules);

    return {
      selectors,
      isModal: dialog.matches(':modal'),
      fileButtonBackground: getComputedStyle(fileInput, '::file-selector-button').backgroundColor,
      expectedFileButtonBackground: getComputedStyle(primaryProbe).backgroundColor,
      backdropBackground: getComputedStyle(dialog, '::backdrop').backgroundColor,
      expectedBackdropBackground: getComputedStyle(backdropProbe).backgroundColor
    };
  });

  expect(result.isModal).toBe(true);
  expect(result.selectors.some((selector) => selector.includes('::file-selector-button'))).toBe(true);
  expect(result.selectors.some((selector) => selector.includes('dialog') && selector.includes('::backdrop'))).toBe(true);
  expect(result.fileButtonBackground).toBe(result.expectedFileButtonBackground);
  expect(result.backdropBackground).toBe(result.expectedBackdropBackground);
});

test('lean preset status surfaces render semantic foreground overrides', async ({ page }) => {
  const presets = [
    ['brutalism', 'brutal'],
    ['cyberpunk', 'cyber'],
    ['y2k', 'y2k'],
    ['retro-glass', 'rg']
  ];
  const expected = {
    success: 'rgb(12, 34, 56)',
    warning: 'rgb(67, 89, 101)',
    danger: 'rgb(123, 45, 67)'
  };

  for (const [ui, prefix] of presets) {
    await page.setContent(`<!doctype html>
      <html>
        <body
          data-ui="${ui}"
          data-theme="arctic-indigo"
          data-mode="light"
          style="--${prefix}-on-success: rgb(12 34 56); --${prefix}-on-warning: rgb(67 89 101); --${prefix}-on-danger: rgb(123 45 67);"
        >
          <button class="${prefix}-button ${prefix}-button-danger" type="button" style="transition: none;">Danger</button>
          <span class="${prefix}-badge ${prefix}-badge-success">Success</span>
          <span class="${prefix}-badge ${prefix}-badge-warning">Warning</span>
          <span class="${prefix}-badge ${prefix}-badge-danger">Danger</span>
        </body>
      </html>`);
    await page.addStyleTag({ path: minifiedBundlePath });

    const colors = await page.evaluate((tokenPrefix) => {
      const colorFor = (selector) => getComputedStyle(document.querySelector(selector)).color;
      return {
        buttonDanger: colorFor(`.${tokenPrefix}-button-danger`),
        badgeSuccess: colorFor(`.${tokenPrefix}-badge-success`),
        badgeWarning: colorFor(`.${tokenPrefix}-badge-warning`),
        badgeDanger: colorFor(`.${tokenPrefix}-badge-danger`)
      };
    }, prefix);

    expect(colors, ui).toEqual({
      buttonDanger: expected.danger,
      badgeSuccess: expected.success,
      badgeWarning: expected.warning,
      badgeDanger: expected.danger
    });
  }
});
