import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, '..');

/**
 * Loads and parses the authored Tactile stylesheet so the fidelity contract
 * exercises the distributable CSS artifact rather than an implementation mock.
 *
 * @returns {string} Parsed, normalized Tactile CSS.
 */
function loadTactileCss() {
  const sourcePath = path.join(repositoryRoot, 'styles', 'tactile.css');
  const result = transform({
    filename: sourcePath,
    code: Buffer.from(fs.readFileSync(sourcePath, 'utf8')),
    minify: false
  });

  assert.deepEqual(result.warnings, [], 'Tactile CSS should parse without warnings');
  return result.code.toString();
}

/**
 * Returns the final declaration block for an exact selector, matching the
 * effective authoring layer when later fidelity refinements override a base rule.
 *
 * @param {string} css Parsed stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @returns {string} Final declaration block or an empty string when absent.
 */
function finalRule(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'gm'))];

  return matches.at(-1)?.[1] ?? '';
}

/**
 * Returns the final value of a custom property declared by an exact selector.
 *
 * @param {string} css Parsed stylesheet contents.
 * @param {string} selector Exact selector to inspect.
 * @param {string} property Custom property name.
 * @returns {string} Trimmed custom property value or an empty string when absent.
 */
function finalCustomProperty(css, selector, property) {
  return finalRule(css, selector).match(new RegExp(`${property}:\\s*([^;]+);`))?.[1].trim() ?? '';
}

test('Tactile reproduces the warm mechanical workspace material across every control family', () => {
  const css = loadTactileCss();
  const root = finalRule(css, ':root');
  const lightMode = finalRule(css, '[data-ui="tactile"][data-mode="light"]');
  const material = finalRule(css, '[data-ui="tactile"][data-mode]');
  const title = finalRule(css, '.tactile-title');
  const label = finalRule(css, '.tactile-label');
  const button = finalRule(css, '.tactile-button, .tactile-icon-button');
  const fields = finalRule(css, '.tactile-input, .tactile-textarea, .tactile-select');
  const navigation = finalRule(css, '.tactile-nav');
  const navigationLink = finalRule(css, '.tactile-nav-link');
  const progress = finalRule(css, '.tactile-progress');
  const progressValue = finalRule(css, '.tactile-progress-bar');
  const framedSurfaces = finalRule(css, '.tactile-surface, .tactile-card, .tactile-panel, .tactile-toolbar, .tactile-table-wrap');
  const customChoices = finalRule(css, '.tactile-check-control, .tactile-radio-control');
  const checkedChoices = finalRule(css, '.tactile-check input:checked + .tactile-check-control, .tactile-radio input:checked + .tactile-radio-control');

  assert.match(root, /--tactile-font-control:\s*"Arial Narrow",\s*"Aptos Narrow",\s*"Segoe UI"/);
  assert.match(lightMode, /--tactile-paper-rgb:\s*246 240 224;/);
  assert.match(lightMode, /--tactile-ink-rgb:\s*45 40 34;/);
  assert.match(lightMode, /--tactile-sidebar-rgb:\s*45 41 36;/);
  assert.match(lightMode, /--tactile-copper-rgb:\s*177 60 28;/);
  assert.match(lightMode, /--tactile-olive-rgb:\s*91 104 67;/);
  assert.equal(finalCustomProperty(css, '[data-ui="tactile"][data-mode]', '--usk-native-control-min-block-size'), '2.75rem');
  assert.equal(finalCustomProperty(css, '[data-ui="tactile"][data-mode]', '--usk-native-choice-size'), '1.05rem');
  assert.equal(finalCustomProperty(css, '[data-ui="tactile"][data-mode]', '--usk-native-range-thumb-size'), '1.35rem');
  assert.equal(finalCustomProperty(css, '[data-ui="tactile"][data-mode]', '--usk-native-progress-track-background'), 'var(--tactile-progress-track)');
  assert.match(material, /--usk-native-choice-checked-background:\s*var\(--tactile-copper\);/);
  assert.match(material, /--tactile-progress-fill:\s*repeating-linear-gradient\(90deg,\s*var\(--tactile-olive\)/);
  assert.match(title, /font-weight:\s*700;/);
  assert.match(label, /font-weight:\s*650;/);
  assert.match(label, /text-transform:\s*none;/);
  assert.match(button, /min-height:\s*2\.75rem;/);
  assert.match(button, /border-radius:\s*\.24rem;/);
  assert.match(button, /font-weight:\s*600;/);
  assert.match(fields, /min-height:\s*2\.75rem;/);
  assert.match(fields, /background:\s*var\(--tactile-field-bg\);/);
  assert.match(navigation, /background:\s*var\(--tactile-sidebar-bg\);/);
  assert.match(navigationLink, /text-transform:\s*none;/);
  assert.match(navigationLink, /font-weight:\s*500;/);
  assert.match(progress, /background:\s*var\(--tactile-progress-track\);/);
  assert.match(progressValue, /background:\s*var\(--tactile-progress-fill\);/);
  assert.match(framedSurfaces, /border:\s*1px solid var\(--tactile-keyline\);/);
  assert.match(framedSurfaces, /box-shadow:\s*var\(--tactile-panel-shadow\);/);
  assert.match(customChoices, /width:\s*1\.05rem;/);
  assert.match(checkedChoices, /background:\s*var\(--tactile-copper\);/);
});

test('Tactile selectors retain the reference double-arrow mechanical end cap', () => {
  const css = loadTactileCss();
  const prefixedSelect = finalRule(css, '.tactile-select');
  const nativeSelect = finalRule(css, '[data-ui="tactile"][data-mode] :where(select)');

  for (const selectRule of [prefixedSelect, nativeSelect]) {
    assert.match(selectRule, /appearance:\s*none;/);
    assert.match(selectRule, /padding-inline-end:\s*2\.75rem;/);
    assert.match(selectRule, /background-image:\s*var\(--tactile-select-endcap\);/);
  }
});

/**
 * Calculates contrast independently from the stylesheet's color-role mapping.
 * @param {number[]} foreground Opaque foreground RGB channels.
 * @param {number[]} background Opaque background RGB channels.
 * @returns {number} Relative-luminance contrast ratio.
 */
function sealContrast(foreground, background) {
  const luminance = (channels) => channels.reduce((sum, value, index) => {
    const channel = value / 255;
    const linear = channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    return sum + linear * [.2126, .7152, .0722][index];
  }, 0);
  const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (values[1] + .05) / (values[0] + .05);
}

test('Tactile trust-seal text inherits a readable paired foreground in native and shared palettes', () => {
  const css = loadTactileCss();
  const seal = finalRule(css, '.tactile-badge-seal');
  const children = finalRule(css, '.tactile-badge-seal > :where(strong, small)');
  assert.match(seal, /color:\s*var\(--tactile-sidebar-fg\);/);
  assert.match(children, /color:\s*inherit;/, 'Native strong/small paint must not replace the seal foreground');

  const material = finalRule(css, '[data-ui="tactile"][data-mode]');
  assert.match(material, /--tactile-sidebar-fg:\s*rgb\(var\(--tactile-sidebar-text-rgb\)\);/);
  assert.match(material, /--tactile-sidebar-bg:\s*linear-gradient\(90deg,\s*rgb\(var\(--tactile-sidebar-rgb\)\s*\/\s*\.98\),\s*rgb\(var\(--tactile-sidebar-rgb\)\)\);/);

  const themed = finalRule(css, '[data-ui="tactile"][data-theme][data-mode]');
  assert.match(themed, /--tactile-sidebar-rgb:\s*var\(--usk-text-rgb\);/);
  assert.match(themed, /--tactile-sidebar-text-rgb:\s*var\(--usk-bg-rgb\);/);

  const manifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'manifest.json'), 'utf8'));
  const themeCss = fs.readFileSync(path.join(repositoryRoot, 'styles', 'theme-colors.css'), 'utf8');
  const palettes = [];
  for (const mode of manifest.modes) {
    const selector = `[data-ui="tactile"][data-mode="${mode}"]`;
    palettes.push({
      name: `native/${mode}`,
      foreground: finalCustomProperty(css, selector, '--tactile-sidebar-text-rgb'),
      background: finalCustomProperty(css, selector, '--tactile-sidebar-rgb')
    });
    for (const theme of manifest.themes) {
      const selector = `:where([data-ui][data-theme="${theme}"][data-mode="${mode}"])`;
      palettes.push({
        name: `${theme}/${mode}`,
        foreground: finalCustomProperty(themeCss, selector, '--usk-bg-rgb'),
        background: finalCustomProperty(themeCss, selector, '--usk-text-rgb')
      });
    }
  }

  for (const palette of palettes) {
    assert.match(palette.foreground, /^\d+ \d+ \d+$/, palette.name);
    assert.match(palette.background, /^\d+ \d+ \d+$/, palette.name);
    const foreground = palette.foreground.split(' ').map(Number);
    const background = palette.background.split(' ').map(Number);
    // Bound the translucent gradient stop against both extreme underlying surfaces.
    for (const backdrop of [0, 255]) {
      for (const alpha of [.98, 1]) {
        const composite = background.map((channel) => channel * alpha + backdrop * (1 - alpha));
        const ratio = sealContrast(foreground, composite);
        assert.ok(ratio >= 4.5, `${palette.name}: ${ratio.toFixed(2)}:1 must meet 4.5:1`);
      }
    }
  }
});
