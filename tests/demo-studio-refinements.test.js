import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMarkup } from '../demo/studio/protocol.js';
import { changesBetween } from '../demo/studio/changes.js';
import * as state from '../demo/studio/state.js';
import { readFileSync } from 'node:fs';
const inventory = JSON.parse(readFileSync('manifest.json', 'utf8'));
const appearance = { ui: 'bento', theme: '', mode: 'light', corners: '', bridge: false };

/** Clean consumers need the dependencies and root hooks used by their copied block. */
test('studio setup includes Layout only when the exported composition requires it', () => {
  for (const options of [
    { layout: true },
    { markup: '<div class="ly-cluster"><button class="usk-button">Save</button></div>' },
  ]) {
    const setup = setupMarkup(appearance, options);
    assert.match(setup, /npm install ui-style-kit-css layout-style-css/);
    assert.match(setup, /node_modules\/layout-style-css\/dist\/layout-style-css\.css/);
    assert.match(setup, /<body class="ly-root ly-page"/);
  }
  for (const options of [{}, { markup: '<button class="usk-button">Save</button>' }]) {
    const setup = setupMarkup(appearance, options);
    assert.doesNotMatch(setup, /layout-style-css|ly-root/);
  }
});

/** Geometry changes must not perform the independent palette and mount domains. */
test('studio corner-only changes use a geometry domain without invalidating colors', () => {
  const before = {
    appearance,
    view: 'examples',
    example: 'form',
    markup: 'semantic',
    edits: {},
    icons: { styleSpecific: false },
    interactions: {},
  };
  const changes = changesBetween(before, {
    ...before,
    appearance: { ...appearance, corners: 'large' },
  });
  assert.equal(changes.geometry, true);
  assert.equal(changes.appearance, false);
  assert.equal(changes.palette, false);
  assert.equal(changes.mount, false);
  assert.equal(changes.icons, false);
  assert.equal(changes.changed, true);
});

/** Compact context must describe every visual choice using the same public vocabulary. */
test('studio appearance labels include palette mode and corners without inventing defaults', () => {
  assert.deepEqual(
    state.appearanceLabels(
      { ...appearance, theme: 'arctic-indigo', mode: 'contrast', corners: 'none' },
      inventory,
    ),
    ['Bento UI', 'Arctic Indigo', 'High contrast', 'Square corners'],
  );
  assert.deepEqual(state.appearanceLabels(appearance, inventory), [
    'Bento UI',
    'Style defaults',
    'Light',
  ]);
});
