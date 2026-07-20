import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.visual.css');

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
        await page.addStyleTag({ path: visualBundlePath });
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
            invalid: stylesFor('[data-testid="invalid-field"]'),
            readonly: stylesFor('[data-testid="readonly-field"]'),
            indeterminate: stylesFor('[data-testid="indeterminate-control"]'),
            fileButton: stylesFor('[data-testid="file-input"]', '::file-selector-button'),
            range: stylesFor('[data-testid="range-input"]'),
            color: stylesFor('[data-testid="color-input"]'),
            progress: stylesFor('[data-testid="progress"]'),
            meter: stylesFor('[data-testid="meter"]')
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
