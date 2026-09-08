import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/minimal-saas.css', import.meta.url), 'utf8');

/**
 * Reads one retained mode block from the Minimal SaaS stylesheet.
 *
 * @param {'light' | 'dark' | 'contrast'} mode Display mode to inspect.
 * @returns {string} Authored declarations for the requested mode.
 */
function modeBlock(mode) {
  return css.match(new RegExp(`\\[data-ui="minimal-saas"\\]\\[data-mode="${mode}"\\]\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? '';
}

/**
 * Resolves an authored fallback RGB triplet into numeric channels.
 *
 * @param {string} block Mode declaration block.
 * @param {string} role Semantic color role without its prefix.
 * @returns {number[]} Red, green, and blue channels.
 */
function fallbackRgb(block, role) {
  const value = block.match(new RegExp(`--saas-fallback-${role}-rgb:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`));
  assert.ok(value, `Missing fallback role: ${role}`);
  return value.slice(1).map(Number);
}

/**
 * Calculates WCAG relative luminance for one sRGB triplet.
 *
 * @param {number[]} rgb Red, green, and blue channels.
 * @returns {number} Relative luminance from zero through one.
 */
function luminance(rgb) {
  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

/**
 * Calculates the WCAG contrast ratio between two sRGB triplets.
 *
 * @param {number[]} first First color channels.
 * @param {number[]} second Second color channels.
 * @returns {number} Contrast ratio from one through twenty-one.
 */
function contrast(first, second) {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
}

test('Minimal SaaS standalone palettes match the retained light and dark references', () => {
  const referenceTokens = [
    '--saas-fallback-bg-rgb: 248 249 252',
    '--saas-fallback-surface-rgb: 255 255 255',
    '--saas-fallback-surface-soft-rgb: 243 245 250',
    '--saas-fallback-text-rgb: 19 26 53',
    '--saas-fallback-text-muted-rgb: 97 105 131',
    '--saas-fallback-border-rgb: 220 225 236',
    '--saas-fallback-primary-rgb: 85 78 232',
    '--saas-fallback-danger-rgb: 214 30 70',
    '--saas-fallback-bg-rgb: 7 17 31',
    '--saas-fallback-surface-rgb: 13 25 42',
    '--saas-fallback-surface-soft-rgb: 17 31 51',
    '--saas-fallback-text-rgb: 241 243 251',
    '--saas-fallback-text-muted-rgb: 180 187 205',
    '--saas-fallback-border-rgb: 43 58 80',
    '--saas-fallback-primary-rgb: 112 104 255',
    '--saas-fallback-danger-rgb: 255 61 104'
  ];

  for (const token of referenceTokens) {
    assert.ok(css.includes(token), `Missing retained reference token: ${token}`);
  }

  assert.match(
    css,
    /\[data-ui="minimal-saas"\]\[data-theme\]\[data-mode\][\s\S]*?--saas-primary-rgb:\s*var\(--usk-primary-rgb\)/,
    'Explicit library themes must continue to own the Minimal SaaS primary color'
  );
});

test('Minimal SaaS components reproduce the retained compact product geometry', () => {
  assert.match(css, /--saas-theme-bg:\s*var\(--saas-bg\);/);
  assert.match(css, /--saas-control-bg:\s*var\(--saas-surface\);/);
  assert.match(css, /--saas-shadow-md:\s*var\(--saas-reference-shadow\);/);
  assert.match(css, /--saas-reference-shadow:\s*0 \.5rem 1\.5rem rgb\(40 47 83 \/ \.045\);/);
  assert.match(css, /--saas-reference-shadow:\s*0 \.75rem 2\.125rem rgb\(0 0 0 \/ \.16\);/);
  assert.match(
    css,
    /\.saas-button-primary\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*var\(--saas-primary\),\s*var\(--saas-brand-2\)\);/s
  );
  assert.match(
    css,
    /\.saas-button:active,[^{]+\{[^}]*transform:\s*translateY\(1px\);/s,
    'Buttons should communicate a restrained one-pixel press'
  );
  assert.match(
    css,
    /\[data-ui="minimal-saas"\][^{]*:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--saas-focus\);[^}]*outline-offset:\s*2px;/s
  );
  assert.match(css, /\.saas-button, \.saas-icon-button\s*\{[^}]*min-height:\s*2\.125rem;/s);
  assert.match(css, /\.saas-input, \.saas-textarea, \.saas-select\s*\{[^}]*min-height:\s*2rem;/s);
  assert.match(
    css,
    /@media \(pointer: coarse\)[\s\S]*?min-block-size:\s*2\.75rem;/,
    'Compact desktop controls must retain 44px coarse-pointer targets'
  );
});

test('Minimal SaaS selects render exactly one dropdown indicator', () => {
  assert.match(
    css,
    /\[data-ui="minimal-saas"\]\[data-mode\] :where\(select:not\(\[multiple\]\)\)\s*\{[^}]*-webkit-appearance:\s*none;[^}]*appearance:\s*none;/s,
    'The custom chevron must suppress the platform dropdown indicator'
  );
  assert.match(
    css,
    /\[data-ui="minimal-saas"\]\[data-mode\] :where\(select:not\(\[multiple\]\)\)::picker-icon\s*\{[^}]*display:\s*none;/s,
    'Customizable selects must not add a second picker icon'
  );
});

test('Minimal SaaS service medallions enlarge text icons without resizing their frame', () => {
  assert.match(
    css,
    /\.saas-card-service > \.saas-icon-medallion\s*\{[^}]*font-size:\s*1\.5rem;[^}]*line-height:\s*1;/s
  );
  assert.match(
    css,
    /\.saas-icon-medallion\s*\{[^}]*inline-size:\s*3\.75rem;[^}]*block-size:\s*3\.75rem;/s,
    'The service icon frame must retain its established dimensions'
  );
});

test('Minimal SaaS callout medallions optically center arrow glyphs without resizing', () => {
  assert.match(
    css,
    /\.saas-callout-bar > \.saas-icon-medallion\s*\{[^}]*min-inline-size:\s*4\.5rem;[^}]*min-block-size:\s*4\.5rem;[^}]*padding-block:\s*\.55rem \.85rem;/s
  );
});

test('Minimal SaaS trust seals enlarge both labels while retaining the five-rem circle', () => {
  assert.match(
    css,
    /\.saas-badge-seal\s*\{[^}]*inline-size:\s*5rem;[^}]*min-inline-size:\s*5rem;/s
  );
  assert.match(css, /\.saas-badge-seal > strong\s*\{[^}]*font-size:\s*1\.125rem;[^}]*line-height:\s*\.9;/s);
  assert.match(css, /\.saas-badge-seal > small\s*\{[^}]*font-size:\s*\.78rem;[^}]*line-height:\s*1;/s);
});

test('Minimal SaaS standalone text roles meet WCAG AA contrast', () => {
  for (const mode of ['light', 'dark']) {
    const block = modeBlock(mode);
    const pairs = [
      ['text', 'bg'],
      ['text-muted', 'surface'],
      ['primary-text', 'primary'],
      ['secondary-text', 'secondary'],
      ['accent-text', 'accent'],
      ['success-text', 'success'],
      ['warning-text', 'warning'],
      ['danger-text', 'danger']
    ];

    for (const [foreground, background] of pairs) {
      const ratio = contrast(fallbackRgb(block, foreground), fallbackRgb(block, background));
      assert.ok(ratio >= 4.5, `${mode} ${foreground}/${background} contrast is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('Minimal SaaS exposes visible keyboard focus for native and custom controls', () => {
  assert.match(
    css,
    /\[data-ui="minimal-saas"\]\[data-mode\][^{]*:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--saas-focus\);[^}]*outline-offset:\s*2px;/s
  );
  assert.match(
    css,
    /\.saas-check input:focus-visible \+ \.saas-check-control,[\s\S]*?\.saas-switch input:focus-visible \+ \.saas-switch-track\s*\{[^}]*outline:\s*2px solid var\(--saas-focus\);[^}]*outline-offset:\s*2px;/
  );
  assert.match(
    css,
    /@media \(forced-colors: active\)[\s\S]*?outline:\s*3px solid CanvasText;/,
    'Forced-colors mode should replace authored focus paint with a system color'
  );
});

test('Minimal SaaS typography, navigation, and feedback retain the calm hierarchy', () => {
  assert.match(css, /\.saas-title\s*\{[^}]*font-size:\s*1\.5rem;[^}]*font-weight:\s*700;/s);
  assert.match(css, /\.saas-heading\s*\{[^}]*font-size:\s*1rem;[^}]*font-weight:\s*700;/s);
  assert.match(
    css,
    /\.saas-nav\s*\{[^}]*background:\s*transparent;[^}]*border:\s*0;[^}]*border-bottom:\s*1px solid var\(--saas-border\);[^}]*border-radius:\s*0;/s
  );
  assert.match(
    css,
    /\.saas-nav-link\[aria-current="page"\],[^{]+\{[^}]*background:\s*transparent;[^}]*box-shadow:\s*inset 0 -2px 0 var\(--saas-primary\);/s
  );
  assert.match(
    css,
    /\.saas-badge-success\s*\{[^}]*background:\s*rgb\(var\(--saas-success-rgb\) \/ \.14\);[^}]*color:\s*var\(--saas-text\);[^}]*border-color:\s*rgb\(var\(--saas-success-rgb\) \/ \.38\);/s
  );
  assert.match(
    css,
    /\.saas-alert-success\s*\{[^}]*border-color:\s*rgb\(var\(--saas-success-rgb\) \/ \.58\);/s
  );
});
