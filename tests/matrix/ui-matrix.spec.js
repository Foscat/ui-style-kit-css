import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const bridgeBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.with-bridge.css');

const presetShardCount = Number.parseInt(process.env.UI_MATRIX_PRESET_SHARDS || '1', 10);
const presetShard = Number.parseInt(process.env.UI_MATRIX_PRESET_SHARD || '1', 10);

if (!Number.isInteger(presetShardCount) || presetShardCount < 1) {
  throw new Error('UI_MATRIX_PRESET_SHARDS must be a positive integer.');
}

if (!Number.isInteger(presetShard) || presetShard < 1 || presetShard > presetShardCount) {
  throw new Error('UI_MATRIX_PRESET_SHARD must be between 1 and UI_MATRIX_PRESET_SHARDS.');
}

const presets = manifest.presets.filter((_, index) => index % presetShardCount === presetShard - 1);

function themedFixture({ id, prefix, theme, mode }) {
  return `<!doctype html>
    <html lang="en">
      <body data-ui="${id}" data-theme="${theme}" data-mode="${mode}">
        <main class="${prefix}-card" data-testid="surface">
          <h1 class="${prefix}-title">Matrix ${id}</h1>
          <p class="${prefix}-copy">Theme ${theme} in ${mode} mode validates rendered paint.</p>
           <button class="${prefix}-button-pill" data-testid="pill">Centered pill control</button>
           <button class="${prefix}-button-pill" data-testid="disabled-pill" disabled>Disabled pill</button>
           <input type="button" data-testid="native-input-button" value="Native input button">
           <input type="button" class="interactive-surface" data-surface-variant="primary" data-surface-level="2" data-testid="bridge-input-button" value="Bridge input button">
           <input type="submit" class="interactive-surface" data-surface-variant="primary" data-surface-level="2" data-testid="bridge-submit-input" value="Bridge submit input">
           <input type="reset" class="interactive-surface" data-surface-variant="danger" data-surface-level="2" data-testid="bridge-reset-input" value="Bridge reset input">
           <input data-testid="invalid-field" aria-invalid="true" value="invalid">
          <input data-testid="readonly-field" readonly value="readonly">
          <label class="${prefix}-check" data-testid="indeterminate-choice">
            <input type="checkbox" data-testid="indeterminate-control">
            <span class="${prefix}-check-control" aria-hidden="true"></span>
            Mixed choice
          </label>
          <label>File <input type="file" data-testid="file-input"></label>
          <label>Range <input type="range" data-testid="range-input" value="65"></label>
          <label>Color <input type="color" data-testid="color-input" value="#6f8cff"></label>
           <progress data-testid="progress" value="60" max="100">60%</progress>
           <meter data-testid="meter" value=".65">65%</meter>
           <figure class="${prefix}-media-scrim" data-testid="media-scrim">
             <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 18'%3E%3Crect width='32' height='18' fill='%23ffffff'/%3E%3C/svg%3E">
             <figcaption data-testid="media-scrim-caption"><p class="${prefix}-eyebrow" data-testid="media-scrim-eyebrow">Media scrim</p><strong data-testid="media-scrim-copy">Readable content</strong></figcaption>
           </figure>
           <dialog open data-testid="dialog"><p data-testid="dialog-copy">Dialog copy must remain legible on the strong surface.</p><button data-testid="dialog-action">Dialog action</button></dialog>
         </main>
      </body>
    </html>`;
}

function rgbTriplet(value) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function relativeLuminance([red, green, blue]) {
  return [red, green, blue]
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const foregroundRgb = rgbTriplet(foreground);
  const backgroundRgb = rgbTriplet(background);
  if (!foregroundRgb || !backgroundRgb) return 0;

  const light = Math.max(relativeLuminance(foregroundRgb), relativeLuminance(backgroundRgb));
  const dark = Math.min(relativeLuminance(foregroundRgb), relativeLuminance(backgroundRgb));

  return (light + 0.05) / (dark + 0.05);
}

test.describe.configure({ mode: 'parallel' });

for (const preset of presets) {
  for (const theme of manifest.themes) {
    for (const mode of manifest.modes) {
      test(`${preset.id} / ${theme} / ${mode}`, async ({ page }) => {
        const consoleMessages = [];
        const pageErrors = [];

        page.on('console', (message) => {
          if (['error', 'warning'].includes(message.type())) consoleMessages.push(message.text());
        });
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.setViewportSize({ width: 390, height: 844 });
        await page.setContent(themedFixture({ ...preset, theme, mode }));
        await page.addStyleTag({ path: bridgeBundlePath });
        await page.getByTestId('indeterminate-control').evaluate((input) => {
          input.indeterminate = true;
        });

        const report = await page.evaluate(() => {
          const stylesFor = (selector, pseudoElement) => {
            const element = document.querySelector(selector);
            const styles = getComputedStyle(element, pseudoElement);
            const rect = element.getBoundingClientRect();

            return {
              accentColor: styles.accentColor,
              alignItems: styles.alignItems,
              backgroundColor: styles.backgroundColor,
              backgroundImage: styles.backgroundImage,
              borderColor: styles.borderColor,
              boxShadow: styles.boxShadow,
              color: styles.color,
              cursor: styles.cursor,
              display: styles.display,
              height: rect.height,
              inlinePaddingEnd: Number.parseFloat(styles.paddingInlineEnd),
              inlinePaddingStart: Number.parseFloat(styles.paddingInlineStart),
              justifyContent: styles.justifyContent,
              minBlockSize: Number.parseFloat(styles.minBlockSize),
              opacity: Number.parseFloat(styles.opacity),
              outlineColor: styles.outlineColor,
              outlineStyle: styles.outlineStyle,
              width: rect.width
            };
          };

          document.querySelector('[data-testid="pill"]').focus();

          return {
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth,
            surface: stylesFor('[data-testid="surface"]'),
             pill: stylesFor('[data-testid="pill"]'),
             disabled: stylesFor('[data-testid="disabled-pill"]'),
             nativeInputButton: stylesFor('[data-testid="native-input-button"]'),
             bridgeInputButton: stylesFor('[data-testid="bridge-input-button"]'),
             bridgeSubmitInput: stylesFor('[data-testid="bridge-submit-input"]'),
             bridgeResetInput: stylesFor('[data-testid="bridge-reset-input"]'),
             invalid: stylesFor('[data-testid="invalid-field"]'),
            readonly: stylesFor('[data-testid="readonly-field"]'),
            indeterminate: stylesFor('[data-testid="indeterminate-control"]'),
            fileButton: stylesFor('[data-testid="file-input"]', '::file-selector-button'),
            range: stylesFor('[data-testid="range-input"]'),
            color: stylesFor('[data-testid="color-input"]'),
            progress: stylesFor('[data-testid="progress"]'),
             meter: stylesFor('[data-testid="meter"]'),
             mediaScrimCaption: stylesFor('[data-testid="media-scrim-caption"]'),
             mediaScrimEyebrow: stylesFor('[data-testid="media-scrim-eyebrow"]'),
             mediaScrimCopy: stylesFor('[data-testid="media-scrim-copy"]'),
             dialog: stylesFor('[data-testid="dialog"]'),
             dialogCopy: stylesFor('[data-testid="dialog-copy"]'),
             dialogAction: stylesFor('[data-testid="dialog-action"]')
          };
        });

        expect(consoleMessages).toEqual([]);
        expect(pageErrors).toEqual([]);
        expect(report.overflow, JSON.stringify(report, null, 2)).toBeLessThanOrEqual(1);
        expect(report.surface.backgroundColor !== 'rgba(0, 0, 0, 0)' || report.surface.backgroundImage !== 'none').toBe(true);
        expect(report.surface.borderColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(report.surface.color).toMatch(/^rgb/);
        expect(report.pill.display).toBe('inline-flex');
        expect(report.pill.alignItems).toBe('center');
        expect(report.pill.justifyContent).toBe('center');
        expect(report.pill.minBlockSize).toBeGreaterThanOrEqual(44);
        expect(report.pill.height).toBeGreaterThanOrEqual(24);
        expect(report.pill.height).toBeLessThanOrEqual(72);
        expect(report.pill.width).toBeLessThanOrEqual(390);
        expect(report.pill.inlinePaddingStart).toBeGreaterThan(0);
        expect(report.pill.inlinePaddingEnd).toBeGreaterThan(0);
         expect(contrastRatio(report.pill.color, report.pill.backgroundColor)).toBeGreaterThanOrEqual(4.5);
         expect(report.nativeInputButton.backgroundImage).toBe('none');
         expect(
           contrastRatio(report.nativeInputButton.color, report.nativeInputButton.backgroundColor),
           JSON.stringify(report.nativeInputButton, null, 2)
         ).toBeGreaterThanOrEqual(4.5);
         for (const control of [report.bridgeInputButton, report.bridgeSubmitInput, report.bridgeResetInput]) {
           expect(control.backgroundImage).toBe('none');
           expect(contrastRatio(control.color, control.backgroundColor), JSON.stringify(control, null, 2)).toBeGreaterThanOrEqual(4.5);
         }
         expect(
           contrastRatio(report.dialogCopy.color, report.dialog.backgroundColor),
           JSON.stringify({ dialog: report.dialog, copy: report.dialogCopy }, null, 2)
         ).toBeGreaterThanOrEqual(4.5);
         expect(
           contrastRatio(report.dialogAction.color, report.dialogAction.backgroundColor),
           JSON.stringify(report.dialogAction, null, 2)
         ).toBeGreaterThanOrEqual(4.5);
         expect(report.mediaScrimCaption.backgroundImage).toContain('linear-gradient');
         expect(report.mediaScrimCaption.color).toBe('rgb(255, 255, 255)');
         expect(report.mediaScrimEyebrow.color).toBe(report.mediaScrimCaption.color);
         expect(report.mediaScrimCopy.color).toBe(report.mediaScrimCaption.color);
         expect(report.pill.outlineStyle !== 'none' || report.pill.boxShadow !== 'none').toBe(true);
        expect(report.disabled.opacity).toBeLessThan(report.pill.opacity);
        expect(report.invalid.borderColor).not.toBe(report.readonly.borderColor);
        expect(report.readonly.backgroundColor).not.toBe(report.invalid.backgroundColor);
        expect(report.indeterminate.accentColor).not.toBe('auto');
        expect(report.fileButton.inlinePaddingStart).toBeGreaterThanOrEqual(0);
        expect(report.range.accentColor).not.toBe('auto');
        expect(report.color.width).toBeGreaterThan(20);
        expect(report.progress.width).toBeGreaterThan(20);
        expect(report.meter.width).toBeGreaterThan(20);
      });
    }
  }
}
