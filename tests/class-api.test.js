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

const coreSuffixes = [
  'page',
  'container',
  'section',
  'grid',
  'stack',
  'cluster',
  'panel',
  'well',
  'inset',
  'card',
  'toolbar',
  'nav',
  'nav-link',
  'table-wrap',
  'table',
  'title',
  'subtitle',
  'kicker',
  'heading',
  'copy',
  'label',
  'help-text',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-success',
  'text-warning',
  'text-danger',
  'text-accent',
  'field',
  'input',
  'textarea',
  'select',
  'button',
  'button-primary',
  'button-secondary',
  'button-danger',
  'icon-button',
  'badge',
  'badge-primary',
  'badge-secondary',
  'badge-success',
  'badge-warning',
  'badge-danger',
  'alert',
  'alert-success',
  'alert-warning',
  'alert-danger',
  'alert-title',
  'alert-body',
  'progress',
  'progress-bar',
  'hover-lift',
  'spinner',
  'loading-spinner',
  'spinner-sm',
  'spinner-lg'
];

const extendedUtilityStyles = new Map([
  ['minimal-saas', 'saas'],
  ['bento', 'bento'],
  ['maximalist', 'max'],
  ['bauhaus', 'bau'],
  ['tactile', 'tactile'],
  ['neumorphism', 'neo'],
  ['retrofuturism', 'retro']
]);

const extendedUtilitySuffixes = [
  'bg-primary',
  'bg-secondary',
  'disabled',
  'surface',
  'surface-sm',
  'surface-lg',
  'border',
  'button-ghost',
  'check',
  'check-control',
  'radio',
  'radio-control',
  'switch',
  'switch-track',
  'switch-thumb',
  'divider',
  'pill',
  'rounded',
  'rounded-lg',
  'rounded-xl',
  'split',
  'sr-only',
  'visually-hidden',
  'skip-link'
];

function cssFor(ui) {
  return fs.readFileSync(path.join(rootDir, 'styles', `${ui}.css`), 'utf8');
}

test('documented core class suffixes exist in every style file', () => {
  for (const [ui, prefix] of styles) {
    const css = cssFor(ui);
    for (const suffix of coreSuffixes) {
      assert.match(css, new RegExp(`\\.${prefix}-${suffix}(?![a-z0-9-])`), `${ui} is missing .${prefix}-${suffix}`);
    }
    assert.match(css, /\.is-active(?![a-z0-9-])/, `${ui} is missing the shared .is-active state selector`);
  }
});

test('documented extended utility suffixes exist in the expected style files', () => {
  for (const [ui, prefix] of extendedUtilityStyles.entries()) {
    const css = cssFor(ui);
    for (const suffix of extendedUtilitySuffixes) {
      assert.match(css, new RegExp(`\\.${prefix}-${suffix}(?![a-z0-9-])`), `${ui} is missing .${prefix}-${suffix}`);
    }
  }
});

test('semantic text utilities use direct palette tokens', () => {
  const roles = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger'];
  for (const [ui, prefix] of styles) {
    const css = cssFor(ui);
    for (const role of roles) {
      assert.match(css, new RegExp(`\\.${prefix}-text-${role}\\s*\\{\\s*color:\\s*var\\(--${prefix}-${role}\\);`), `${ui} should use --${prefix}-${role} for .${prefix}-text-${role}`);
    }
  }
});


test('theme-driven defaults cover fonts, backgrounds, cards, controls, and spinners', () => {
  for (const [ui, prefix] of styles) {
    const css = cssFor(ui);
    const requiredTokens = [
      'font-body',
      'font-heading',
      'font-control',
      'fg',
      'surface-fg',
      'muted',
      'control-fg',
      'on-primary',
      'on-secondary',
      'on-accent',
      'on-success',
      'on-warning',
      'on-danger',
      'theme-bg',
      'theme-bg-size',
      'card-bg',
      'control-bg',
      'spinner-track',
      'spinner-stroke',
      'spinner-accent'
    ];

    for (const token of requiredTokens) {
      assert.match(css, new RegExp(`--${prefix}-${token}\\s*:`), `${ui} is missing --${prefix}-${token}`);
    }

    assert.match(css, new RegExp(`\\[data-ui="${ui}"\\]\\[data-theme\\]\\[data-mode\\]\\s*\\{[^}]*background:\\s*var\\(--${prefix}-theme-bg\\)`), `${ui} should apply a theme-driven page background`);
    assert.match(css, new RegExp(`\\.${prefix}-card, \\.${prefix}-panel \\{ background:\\s*var\\(--${prefix}-card-bg\\); \\}`), `${ui} cards and panels should use theme-driven card backgrounds`);
    assert.match(css, new RegExp(`@keyframes ${prefix}-spin`), `${ui} is missing spinner keyframes`);
    assert.match(css, new RegExp(`\\.${prefix}-button\\[aria-busy="true"\\]::after`), `${ui} busy buttons should render a theme-driven spinner`);
  }
});

test('native element coverage includes semantic containers and inline HTML elements', () => {
  for (const [ui, prefix] of styles) {
    const css = cssFor(ui);
    const nativeGroups = [
      'main, section, header, footer, nav, article, aside, address',
      'article, aside',
      'dl',
      'dt',
      'dd',
      'strong, b',
      'em, i, cite, var',
      'ins',
      'del, s',
      'output',
      'optgroup',
      'option',
      'time, data, dfn',
      'ruby',
      'rt, rp',
      'menu',
      'search',
      'audio, picture, object, embed, math'
    ];

    for (const group of nativeGroups) {
      assert.match(css, new RegExp(`\\[data-ui="${ui}"\\] :where\\(${group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), `${ui} is missing native coverage for ${group}`);
    }
    assert.match(css, new RegExp(`\\.${prefix}-spinner, \\.${prefix}-loading-spinner`), `${ui} is missing spinner utility aliases`);
  }
});
