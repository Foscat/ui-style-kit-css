import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const newPresets = [
  ['editorial-luxe', 'luxe'],
  ['organic-modern', 'organic'],
  ['industrial-utility', 'utility'],
  ['technical-blueprint', 'blueprint'],
  ['art-deco', 'deco'],
  ['clay', 'clay'],
  ['data-terminal', 'terminal'],
  ['paper-editorial', 'paper'],
  ['neo-noir', 'noir']
];

const newThemes = [
  'newsprint-crimson',
  'foundry-amber',
  'soft-orchid',
  'electric-noir'
];

const requiredThemeRoles = [
  'bg', 'surface', 'surface-strong', 'surface-soft', 'text', 'text-muted', 'border',
  'primary', 'primary-hover', 'primary-text', 'secondary', 'secondary-hover',
  'secondary-text', 'accent', 'success', 'warning', 'danger', 'link', 'accent-text',
  'success-text', 'warning-text', 'danger-text', 'focus'
];

const marketingSuffixes = [
  'card-media', 'card-service', 'card-feature', 'card-accent-edge', 'icon-medallion',
  'button-cut', 'button-outline-heavy', 'badge-seal', 'feature-strip', 'feature-item',
  'callout-bar', 'eyebrow', 'media-scrim'
];

function read(relativeFile) {
  return fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
}

function hasClass(css, className) {
  return new RegExp(`\\.${className}(?![\\w-])`).test(css);
}

test('manifest exposes the approved 20 preset and 20 theme registry', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.presets.length, 20);
  assert.equal(manifest.themes.length, 20);
  assert.deepEqual(manifest.modes, ['light', 'dark', 'contrast']);

  for (const [id, prefix] of newPresets) {
    const preset = manifest.presets.find((candidate) => candidate.id === id);
    assert.ok(preset, `manifest is missing ${id}`);
    assert.equal(preset.prefix, prefix);
    assert.deepEqual(preset.entrypoints, {
      default: `./${id}.css`,
      visual: `./visual/${id}.css`
    });
  }

  for (const theme of newThemes) assert.ok(manifest.themes.includes(theme), `manifest is missing ${theme}`);
});

test('every new preset has a source file and complete marketing component vocabulary', () => {
  for (const [id, prefix] of newPresets) {
    const relativeFile = path.join('styles', `${id}.css`);
    assert.ok(fs.existsSync(path.join(rootDir, relativeFile)), `${relativeFile} should exist`);
    const css = read(relativeFile);

    assert.match(css, new RegExp(`\\[data-ui="${id}"\\]\\[data-theme\\]\\[data-mode\\]`));
    assert.match(css, new RegExp(`--${prefix}-bg-rgb:\\s*var\\(--usk-bg-rgb\\)`));
    assert.match(css, new RegExp(`--${prefix}-focus-rgb:\\s*var\\(--usk-focus-rgb\\)`));

    for (const suffix of marketingSuffixes) {
      assert.equal(hasClass(css, `${prefix}-${suffix}`), true, `${id} is missing .${prefix}-${suffix}`);
    }
  }
});

test('every new theme defines all shared color roles in all modes', () => {
  const css = read('styles/theme-colors.css');

  for (const theme of newThemes) {
    for (const mode of ['light', 'dark', 'contrast']) {
      const escaped = `:where\\(\\[data-ui\\]\\[data-theme="${theme}"\\]\\[data-mode="${mode}"\\]\\)`;
      const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
      assert.ok(match, `missing ${theme}/${mode}`);
      for (const role of requiredThemeRoles) {
        assert.match(match[1], new RegExp(`--usk-${role}-rgb:\\s*\\d+ \\d+ \\d+;`), `${theme}/${mode} missing ${role}`);
      }
    }
  }
});

test('package exports focused default and visual CSS for every new preset', () => {
  const pkg = JSON.parse(read('package.json'));

  for (const [id] of newPresets) {
    assert.equal(pkg.exports[`./${id}`], `./styles/${id}.css`);
    assert.equal(pkg.exports[`./${id}.css`], `./styles/${id}.css`);
    assert.equal(pkg.exports[`./styles/${id}`], `./styles/${id}.css`);
    assert.equal(pkg.exports[`./styles/${id}.css`], `./styles/${id}.css`);
    assert.equal(pkg.exports[`./visual/${id}.css`], `./dist/visual/${id}.css`);
  }
});
