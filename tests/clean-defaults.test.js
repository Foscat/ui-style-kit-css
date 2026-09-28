import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('clean defaults provide bounded spacing and explicit opt-out utilities', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /--usk-element-margin-min:\s*2px;/);
  assert.match(css, /--usk-element-padding-min:\s*2px;/);
  assert.match(css, /:where\(:not\(\.flush\):not\(\.usk-flush\)\)/);
  assert.match(css, /--usk-compact-padding-block-min:\s*2px;/);
  assert.match(css, /--usk-compact-padding-inline-min:\s*4px;/);
  assert.match(css, /:where\(\.flush,\s*\.usk-flush\)/);
  assert.match(css, /\.usk-flush/);
  assert.match(css, /margin:\s*0\s*!important;/);
  assert.match(css, /padding:\s*0\s*!important;/);
});

test('Technical Blueprint is exempt from the global spacing floor', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(
    css,
    /\[data-ui\]\[data-mode\]:not\(\[data-ui="technical-blueprint"\]\)\s*\{[^}]*--usk-element-margin-min:\s*2px;/s
  );
  assert.match(
    css,
    /\[data-ui\]\[data-mode\]:not\(\[data-ui="technical-blueprint"\]\)\s+:where\(:not\(\.flush\):not\(\.usk-flush\)\)/
  );
  assert.match(
    css,
    /\[data-ui\]\[data-mode\]:not\(\[data-ui="technical-blueprint"\]\)\s+:where\(\s*button,/s
  );
});

test('every semantic clean-default primitive supports canonical usk classes', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');
  const semanticSuffixes = [
    'avatar',
    'badge',
    'button',
    'check',
    'check-control',
    'chip',
    'icon-button',
    'pagination-link',
    'radio',
    'radio-control',
    'step',
    'step-label',
    'stepper',
    'switch',
    'switch-thumb',
    'switch-track'
  ];

  for (const suffix of semanticSuffixes) {
    assert.match(css, new RegExp(`\\[class~="usk-${suffix}"\\]`), `.usk-${suffix} must be canonical`);
    assert.match(css, new RegExp(`\\[class~="ui-${suffix}"\\]`), `.ui-${suffix} must remain compatible`);
  }
});

test('clean defaults remove decorative underlines and expose one opt-in utility', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /\.usk-underline/);
  assert.match(css, /text-decoration-line:\s*underline\s*!important;/);
  assert.match(css, /:not\(u\)/);
  assert.match(css, /:not\(ins\)/);
  assert.match(css, /:not\(del\)/);
  assert.match(css, /:not\(s\)/);
  assert.match(css, /text-decoration-line:\s*none;/);
});

test('clean defaults align avatar content and compact nested chip actions without React-only hooks', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /\[class~="ui-avatar"\][^{}]*>\s*\[aria-hidden="true"\]/s);
  assert.match(css, /translate:\s*0\s+\.05em;/);
  assert.match(css, /\[class~="ui-avatar"\][^{}]*>\s*\[role="status"\]/s);
  assert.match(css, /\[class~="ui-chip"\][^{}]*>\s*button/s);
  assert.match(css, /align-self:\s*center;/);
  assert.match(css, /box-sizing:\s*border-box;/);
  assert.doesNotMatch(css, /usk-(?:avatar|chip)__/);
});

test('clean defaults center controls and inset semantic choices from their painted edges', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /\[class~="ui-check"\][^{}]*\[class~="ui-switch"\][^{}]*\{[^}]*align-items:\s*center;/s);
  assert.match(css, /\[class~="ui-check"\][^{}]*\[class~="ui-switch"\][^{}]*\{[^}]*padding:\s*\.25rem\s+\.5rem;/s);
  assert.match(css, /\[class~="ui-check-control"\][^{}]*\[class~="ui-switch-track"\][^{}]*\{[^}]*align-self:\s*center;/s);
  assert.match(css, /button,[^{}]*\[class~="ui-icon-button"\][^{}]*\{[^}]*justify-content:\s*center;/s);
  assert.match(css, /vertical-align:\s*middle;/);
});

/** Verifies that semantic internals keep one structure when preset suffixes describe different widgets. */
test('clean defaults protect semantic switch and workflow-stepper geometry in both namespaces', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(
    css,
    /\[class~="usk-switch-thumb"\][^{}]*\[class~="ui-switch-thumb"\][^{}]*\{[^}]*margin:\s*0;[^}]*padding:\s*0;/s
  );
  assert.match(
    css,
    /\[class~="usk-switch-track"\][^{}]*\[class~="ui-switch-track"\][^{}]*\{[^}]*position:\s*relative;[^}]*box-sizing:\s*border-box;/s
  );
  assert.match(
    css,
    /\[class~="usk-stepper"\][^{}]*\[class~="ui-stepper"\][^{}]*\{[^}]*display:\s*flex;[^}]*grid-template-columns:\s*none;[^}]*inline-size:\s*100%;/s
  );
  assert.match(
    css,
    /\[class~="usk-step-label"\][^{}]*\[class~="ui-step-label"\][^{}]*\{[^}]*flex:\s*1\s+1\s+auto;[^}]*min-inline-size:\s*8ch;[^}]*writing-mode:\s*horizontal-tb;/s
  );
});

test('clean defaults preserve preset checkbox and radio paint while hiding native inputs', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.doesNotMatch(css, /background:\s*var\(--usk-native-choice-background\);/);
  assert.doesNotMatch(css, /border:\s*var\(--usk-native-choice-border\);/);
  assert.match(css, /input:focus-visible\s*\+\s*\[class~="ui-check-control"\]/);
  assert.match(css, /clip-path:\s*inset\(50%\);/);
  assert.match(css, /opacity:\s*0;/);
});

test('clean defaults keep numbered pagination controls smaller than direction bookends', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /\[class~="ui-pagination-link"\]\[data-pagination-kind="page"\][^{]*\{[^}]*min-inline-size:\s*2\.25rem;/s);
  assert.match(css, /\[class~="ui-pagination-link"\]\[data-pagination-kind="page"\][^{]*\{[^}]*min-block-size:\s*2\.25rem;/s);
  assert.match(css, /\[class~="ui-pagination-link"\]\[data-pagination-kind="direction"\][^{]*\{[^}]*min-inline-size:\s*2\.75rem;/s);
  assert.match(css, /\[class~="ui-pagination-link"\]\[data-pagination-kind="direction"\][^{]*\{[^}]*min-block-size:\s*2\.75rem;/s);
});

test('clean defaults normalize semantic icon geometry without framework-specific classes', () => {
  const css = fs.readFileSync(path.join(rootDir, 'styles/clean-defaults.css'), 'utf8');

  assert.match(css, /\[data-ui-icon\]/);
  assert.match(css, /inline-size:\s*1em;/);
  assert.match(css, /block-size:\s*1em;/);
  assert.match(css, /display:\s*block;/);
  assert.doesNotMatch(css, /usk-(?:close|icon)__/);
});

test('clean defaults ship in every visual bundle', () => {
  const buildSource = fs.readFileSync(path.join(rootDir, 'scripts/build.mjs'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

  assert.match(buildSource, /const cleanDefaultsFile = 'styles\/clean-defaults\.css';/);
  assert.match(buildSource, /foundationFiles = \[[^\]]*cleanDefaultsFile[^\]]*\]/);
  assert.equal(packageJson.exports['./styles/clean-defaults.css'], './styles/clean-defaults.css');
  assert.equal(packageJson.exports['./clean-defaults.css'], './styles/clean-defaults.css');
});

test('standalone preset sources import the clean defaults contract', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

  for (const { id } of manifest.presets) {
    const css = fs.readFileSync(path.join(rootDir, 'styles', `${id}.css`), 'utf8');
    assert.match(
      css,
      /@import url\("\.\/clean-defaults\.css"\);/,
      `${id} must include clean defaults when imported directly`
    );
  }
});

test('manifest publishes the additive clean-default utility classes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

  assert.deepEqual(manifest.classApi.globalUtilities, [
    'flush',
    'usk-flush',
    'usk-underline',
    'usk-wrapper'
  ]);
});

test('ownership metadata does not misclassify element spacing as page topology', () => {
  const allowlist = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'ownership-allowlist.json'), 'utf8')
  );
  const spacingEntry = allowlist['ui-visual'].find(
    ({ property, selector }) =>
      property === 'margin' &&
      selector === '[data-ui][data-mode] :where(:not(.flush):not(.usk-flush))'
  );

  assert.equal(spacingEntry, undefined);
});
