import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const styles = [
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
  ['retro-glass', 'rg']
];

const themes = [
  'midnight-gold',
  'ocean-steel',
  'forest-moss',
  'sunset-ember',
  'royal-plum',
  'graphite-cyan',
  'desert-sage',
  'rose-quartz',
  'cyber-lime',
  'arctic-indigo'
];

const modes = ['light', 'dark', 'contrast'];

const colorRoles = [
  'bg',
  'surface',
  'surface-strong',
  'surface-soft',
  'text',
  'text-muted',
  'border',
  'primary',
  'primary-hover',
  'primary-text',
  'secondary',
  'secondary-hover',
  'secondary-text',
  'accent',
  'success',
  'warning',
  'danger',
  'link',
  'accent-text',
  'success-text',
  'warning-text',
  'danger-text',
  'focus'
];

function cssFor(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function blockFor(css, selector) {
  const match = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
  return match?.[1] ?? '';
}

function escapeSelector(selector) {
  return selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('theme color roles are defined once by active scheme and mode', () => {
  const css = cssFor('styles/theme-colors.css');

  for (const theme of themes) {
    for (const mode of modes) {
      const selector = `:where([data-ui][data-theme="${theme}"][data-mode="${mode}"])`;
      const block = blockFor(css, escapeSelector(selector));

      assert.notEqual(block, '', `Missing shared color block for ${theme}/${mode}`);
      for (const role of colorRoles) {
        assert.match(block, new RegExp(`--usk-${role}-rgb:\\s*\\d+ \\d+ \\d+;`), `${theme}/${mode} is missing --usk-${role}-rgb`);
      }
    }
  }
});

test('standalone ui styles consume shared color roles instead of owning scheme palettes', () => {
  for (const [ui, prefix] of styles) {
    const css = cssFor(`styles/${ui}.css`);
    const selector = `\\[data-ui="${ui}"\\]\\[data-theme\\]\\[data-mode\\]`;
    const block = blockFor(css, selector);

    assert.match(css, /@import url\("\.\/theme-colors\.css"\);/, `${ui} should import shared theme colors`);
    assert.notEqual(block, '', `${ui} is missing its semantic token block`);
    for (const role of colorRoles) {
      assert.match(block, new RegExp(`--${prefix}-${role}-rgb:\\s*var\\(--usk-${role}-rgb\\);`), `${ui} should alias --${prefix}-${role}-rgb to --usk-${role}-rgb`);
    }

    for (const theme of themes) {
      assert.doesNotMatch(
        css,
        new RegExp(`\\[data-ui="${ui}"\\]\\[data-theme="${theme}"\\]\\[data-mode="(?:${modes.join('|')})"\\]`),
        `${ui} should not define per-scheme color blocks for ${theme}`
      );
    }
  }
});

test('bundled ui styles keep shared color roles internal and avoid duplicated palettes', () => {
  const css = cssFor('dist/ui-style-kit.css');

  assert.doesNotMatch(css, /@import url\("\.\/theme-colors\.css"\);/, 'dist bundle should inline shared theme colors');
  for (const [ui, prefix] of styles) {
    const selector = `\\[data-ui="${ui}"\\]\\[data-theme\\]\\[data-mode\\]`;
    const block = blockFor(css, selector);

    assert.notEqual(block, '', `${ui} bundle is missing its semantic token block`);
    assert.match(block, new RegExp(`--${prefix}-bg-rgb:\\s*var\\(--usk-bg-rgb\\);`), `${ui} bundle should alias shared RGB roles`);
    for (const theme of themes) {
      assert.doesNotMatch(
        css,
        new RegExp(`\\[data-ui="${ui}"\\]\\[data-theme="${theme}"\\]\\[data-mode="(?:${modes.join('|')})"\\]`),
        `${ui} bundle should not define per-scheme color blocks for ${theme}`
      );
    }
  }
});
