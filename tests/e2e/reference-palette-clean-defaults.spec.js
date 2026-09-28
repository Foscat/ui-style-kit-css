import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.visual.css');
const bridgePath = path.join(rootDir, 'styles', 'interactive-surface-theme.css');

/** Returns one reference-palette fixture for each preset and mode pair. */
function referenceFixtures() {
  return manifest.presets.flatMap(({ id }) => manifest.modes.map((mode) => `
    <section data-ui="${id}" data-mode="${mode}" data-case="${id}/${mode}">
      <button class="interactive-surface" data-surface-variant="primary" data-surface-level="2">Primary</button>
      <button class="interactive-surface" data-surface-variant="secondary" data-surface-level="2">Secondary</button>
      <button class="interactive-surface" data-surface-variant="accent" data-surface-level="2">Accent</button>
      <button class="interactive-surface" data-surface-variant="subtle" data-surface-level="1">Subtle</button>
      <button class="interactive-surface" data-surface-variant="warning" data-surface-level="2">Warning</button>
      <button class="interactive-surface" data-surface-variant="danger" data-surface-level="2">Danger</button>
      <a class="ui-pagination-link" aria-current="page" href="#current">1</a>
    </section>
  `)).join('');
}

test('reference palettes keep every interactive variant readable across presets and modes', async ({ page }) => {
  await page.setContent(`<!doctype html><html><body>${referenceFixtures()}</body></html>`);
  await page.addStyleTag({ path: visualBundlePath });
  await page.addStyleTag({ path: bridgePath });

  const failures = await page.evaluate(() => {
    const parse = (value) => {
      const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(value);
      if (srgb) return {
        red: Number(srgb[1]) * 255,
        green: Number(srgb[2]) * 255,
        blue: Number(srgb[3]) * 255,
        alpha: srgb[4] == null ? 1 : Number(srgb[4])
      };
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { red: channels[0] ?? 0, green: channels[1] ?? 0, blue: channels[2] ?? 0, alpha: channels[3] ?? 1 };
    };
    const blend = (top, bottom) => ({
      red: top.red * top.alpha + bottom.red * (1 - top.alpha),
      green: top.green * top.alpha + bottom.green * (1 - top.alpha),
      blue: top.blue * top.alpha + bottom.blue * (1 - top.alpha),
      alpha: 1
    });
    const luminance = ({ red, green, blue }) => [red, green, blue]
      .map((channel) => channel / 255)
      .map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
      .reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
    const ratio = (first, second) => {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + .05) / (values[1] + .05);
    };

    return [...document.querySelectorAll('[data-case]')].flatMap((root) => {
      const rootBackground = parse(getComputedStyle(root).backgroundColor);
      return [...root.querySelectorAll('.interactive-surface, .ui-pagination-link')].flatMap((control) => {
        const style = getComputedStyle(control);
        const background = blend(parse(style.backgroundColor), rootBackground);
        const measured = ratio(parse(style.color), background);
        return measured >= 4.5 ? [] : [{
          background: style.backgroundColor,
          case: root.getAttribute('data-case'),
          foreground: style.color,
          nativeForeground: style.getPropertyValue('--usk-native-on-primary').trim(),
          selectedForeground: style.getPropertyValue('--interactive-surface-fg').trim(),
          ratio: measured,
          variant: control.getAttribute('data-surface-variant') ?? control.className
        }];
      });
    });
  });

  expect(failures).toEqual([]);
});

test('cyberpunk semantic controls preserve clipped geometry and one working switch surface', async ({ page }) => {
  await page.setContent(`<!doctype html><html><body data-ui="cyberpunk" data-mode="dark">
    <button class="interactive-surface ui-button usk-button" data-testid="button">Action</button>
    <button class="interactive-surface ui-icon-button usk-button" data-testid="icon-button">?</button>
    <input class="interactive-surface ui-input usk-form-control" data-testid="input" type="text">
    <label class="interactive-surface ui-switch usk-form-choice">
      <input class="usk-form-choice-input" data-testid="switch" type="checkbox" checked>
      <span class="ui-switch-track" data-testid="track"><span class="ui-switch-thumb"></span></span>
      <span>Notify customer</span>
    </label>
  </body></html>`);
  await page.addStyleTag({ path: visualBundlePath });
  await page.addStyleTag({ path: bridgePath });

  const evidence = await page.evaluate(() => {
    const read = (testId) => {
      const style = getComputedStyle(document.querySelector(`[data-testid="${testId}"]`));
      return {
        borderRadius: Number.parseFloat(style.borderTopLeftRadius),
        clipPath: style.clipPath,
        height: Number.parseFloat(style.height),
        opacity: Number.parseFloat(style.opacity),
        position: style.position,
        width: Number.parseFloat(style.width)
      };
    };
    return Object.fromEntries(['button', 'icon-button', 'input', 'switch'].map((id) => [id, read(id)]));
  });

  for (const id of ['button', 'icon-button', 'input']) {
    expect(evidence[id].borderRadius).toBeLessThanOrEqual(2);
    expect(evidence[id].clipPath).toContain('polygon');
  }
  expect(evidence.switch.position).toBe('absolute');
  expect(evidence.switch.opacity).toBe(0);
  expect(evidence.switch.width).toBeLessThanOrEqual(1);
  expect(evidence.switch.height).toBeLessThanOrEqual(1);

  const checkedPaint = await page.getByTestId('track').evaluate((element) => getComputedStyle(element).background);
  await page.getByTestId('switch').uncheck({ force: true });
  const uncheckedPaint = await page.getByTestId('track').evaluate((element) => getComputedStyle(element).background);
  expect(checkedPaint).not.toBe(uncheckedPaint);
});

test('clean defaults render spacing, flush, and underline contracts', async ({ page }) => {
  await page.setContent(`<!doctype html><html><body data-ui="cyberpunk" data-mode="dark">
    <article class="ui-card usk-wrapper" data-testid="wrapper">Wrapper</article>
    <article class="ui-card usk-wrapper usk-flush" data-testid="flush">Flush</article>
    <button class="ui-button" data-testid="button">Action</button>
    <span class="ui-badge" data-testid="badge">Status</span>
    <a href="#plain" data-testid="plain-link">Plain link</a>
    <a class="usk-underline" href="#underlined" data-testid="underlined-link">Underlined link</a>
  </body></html>`);
  await page.addStyleTag({ path: visualBundlePath });

  const styles = await page.evaluate(() => Object.fromEntries(
    ['wrapper', 'flush', 'button', 'badge', 'plain-link', 'underlined-link'].map((id) => {
      const style = getComputedStyle(document.querySelector(`[data-testid="${id}"]`));
      return [id, {
        marginBlockStart: parseFloat(style.marginBlockStart),
        paddingBlockStart: parseFloat(style.paddingBlockStart),
        paddingInlineStart: parseFloat(style.paddingInlineStart),
        textDecorationLine: style.textDecorationLine
      }];
    })
  ));

  expect(styles.wrapper.marginBlockStart).toBeGreaterThanOrEqual(2);
  expect(styles.wrapper.paddingBlockStart).toBeGreaterThanOrEqual(2);
  expect(styles.flush.marginBlockStart).toBe(0);
  expect(styles.flush.paddingBlockStart).toBe(0);
  expect(styles.button.paddingBlockStart).toBeGreaterThanOrEqual(2);
  expect(styles.button.paddingInlineStart).toBeGreaterThanOrEqual(4);
  expect(styles.badge.paddingBlockStart).toBeGreaterThanOrEqual(2);
  expect(styles.badge.paddingInlineStart).toBeGreaterThanOrEqual(4);
  expect(styles['plain-link'].textDecorationLine).toBe('none');
  expect(styles['underlined-link'].textDecorationLine).toBe('underline');
});
