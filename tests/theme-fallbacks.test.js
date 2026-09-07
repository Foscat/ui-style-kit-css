import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

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
  'accent-text',
  'success',
  'success-text',
  'warning',
  'warning-text',
  'danger',
  'danger-text',
  'link',
  'focus'
];

/**
 * Escapes a literal CSS selector for use in a regular expression.
 *
 * @param {string} selector CSS selector text.
 * @returns {string} Regular-expression-safe selector text.
 */
function escapeSelector(selector) {
  return selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the declaration body for one exact authored selector.
 *
 * @param {string} css Complete preset stylesheet.
 * @param {string} selector Exact selector to locate.
 * @returns {string} Declaration body or an empty string when absent.
 */
function blockFor(css, selector) {
  const match = css.match(new RegExp(`${escapeSelector(selector)}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
  return match?.[1] ?? '';
}

for (const { id, prefix } of manifest.presets) {
  test(`${id} resolves explicit themes before its mode fallback palette`, () => {
    const css = fs.readFileSync(path.join(rootDir, 'styles', `${id}.css`), 'utf8');
    const resolver = blockFor(css, `[data-ui="${id}"][data-mode]`);
    const themedSeam = blockFor(css, `[data-ui="${id}"][data-theme][data-mode]`);

    assert.notEqual(resolver, '', `${id} is missing its fallback-aware runtime resolver`);
    assert.notEqual(themedSeam, '', `${id} is missing its direct themed extraction seam`);

    for (const role of colorRoles) {
      assert.match(
        resolver,
        new RegExp(`--${prefix}-${role}-rgb:\\s*var\\(--usk-${role}-rgb,\\s*var\\(--${prefix}-fallback-${role}-rgb\\)\\);`),
        `${id} must resolve --usk-${role}-rgb before its preset fallback`
      );
      assert.match(
        themedSeam,
        new RegExp(`--${prefix}-${role}-rgb:\\s*var\\(--usk-${role}-rgb\\);`),
        `${id} must retain the direct themed ${role} alias`
      );
    }

    for (const mode of manifest.modes) {
      const modeBlock = blockFor(css, `[data-ui="${id}"][data-mode="${mode}"]`);

      assert.notEqual(modeBlock, '', `${id}/${mode} is missing its mode block`);
      for (const role of colorRoles) {
        assert.match(
          modeBlock,
          new RegExp(`--${prefix}-fallback-${role}-rgb:\\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\s+(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\s+(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);`),
          `${id}/${mode} is missing a valid --${prefix}-fallback-${role}-rgb triplet`
        );
      }
    }
  });
}

test('shared accessibility and component layers activate without an explicit theme', () => {
  const sharedFiles = [
    'styles/compat-layout.css',
    'styles/components.css',
    'styles/content-overflow.css',
    'styles/interactive-surface-bridge.css',
    'styles/interactive-surface-theme.css',
    'styles/native-elements.css',
    'scripts/generate-content-overflow.mjs',
    'scripts/generate-expanded-components.mjs'
  ];

  for (const relativeFile of sharedFiles) {
    const cssOrSource = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');

    assert.doesNotMatch(
      cssOrSource,
      /\[data-ui\]\[data-theme\]\[data-mode\]/,
      `${relativeFile} must support [data-ui][data-mode] roots with or without data-theme`
    );
  }

  const themeColors = fs.readFileSync(path.join(rootDir, 'styles/theme-colors.css'), 'utf8');
  assert.match(themeColors, /:where\(\[data-ui\]\[data-mode="light"\]\)/);
  assert.match(themeColors, /:where\(\[data-ui\]\[data-mode="dark"\], \[data-ui\]\[data-mode="contrast"\]\)/);
});
