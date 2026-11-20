import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createState,
  changeAppearance,
  editToken,
  paletteKey,
  pinBaseline,
  serializeState,
  updateInteraction,
} from '../demo/studio/state.js';

const inventory = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

test('studio accepts supported deep links and preserves native palette semantics', () => {
  const state = createState(inventory, '?personality=tactile&theme=None&mode=dark');
  assert.deepEqual(state.appearance, {
    ui: 'tactile',
    theme: '',
    mode: 'dark',
    corners: '',
    bridge: false,
  });
  assert.equal(
    createState(inventory, '?ui=missing&personality=tactile&theme=missing&mode=missing').appearance
      .ui,
    'minimal-saas',
  );
});

test('palette edits follow named themes and isolate native preset and mode contexts', () => {
  let state = createState(inventory);
  state = editToken(state, 'primary', '18 52 86');
  const native = paletteKey(state.appearance);
  state = changeAppearance(state, { ui: 'tactile' }, inventory);
  assert.equal(state.edits[paletteKey(state.appearance)], undefined);
  state = changeAppearance(state, { theme: 'arctic-indigo' }, inventory);
  state = editToken(state, 'primary', '25 75 125');
  state = changeAppearance(state, { ui: 'bento' }, inventory);
  assert.equal(state.edits[paletteKey(state.appearance)].primary, '25 75 125');
  assert.equal(state.edits[native].primary, '18 52 86');
  assert.equal(editToken(state, 'primary', '999 0 0'), state);
});

test('comparison pins an independent snapshot while examples share interaction state', () => {
  let state = editToken(createState(inventory), 'primary', '18 52 86');
  state = pinBaseline(state);
  state = editToken(state, 'primary', '90 80 70');
  state = updateInteraction(state, 'dashboard', { query: 'Morgan' });
  assert.equal(state.baseline.edits.primary, '18 52 86');
  assert.equal(state.edits[paletteKey(state.appearance)].primary, '90 80 70');
  assert.equal(state.interactions.dashboard.query, 'Morgan');
});

test('share links reproduce appearance edits comparison and workspace without form text', () => {
  let state = createState(inventory, '?ui=tactile&mode=dark');
  state = editToken(state, 'primary', '18 52 86');
  state = pinBaseline(state);
  state = { ...state, view: 'components', component: 'fields', markup: 'native' };
  state = updateInteraction(state, 'form', { name: 'Private draft', email: 'private@example.com' });
  const query = serializeState(state);
  assert.doesNotMatch(query, /Private|private|example.com/);
  const restored = createState(inventory, query);
  assert.deepEqual(restored.appearance, state.appearance);
  assert.deepEqual(restored.edits, state.edits);
  assert.deepEqual(restored.baseline, state.baseline);
  assert.equal(restored.view, 'components');
  assert.equal(restored.component, 'fields');
  assert.equal(restored.markup, 'native');
  assert.equal(restored.interactions.form.name, '');
});

test('untrusted serialized state cannot introduce unknown palettes or invalid token values', () => {
  const query = new URLSearchParams({
    studio: JSON.stringify({
      version: 1,
      edits: { 'preset:minimal-saas|light': { primary: 'url(evil)', invalid: '0 0 0' } },
      baseline: { ui: 'unknown', mode: 'dark', edits: { primary: '999 0 0' } },
    }),
  });
  const state = createState(inventory, '?' + query);
  assert.deepEqual(state.edits, {});
  assert.equal(state.baseline, null);
});

test('malformed share data falls back to a usable studio', () => {
  const state = createState(inventory, '?studio=%7Bbroken&view=invalid&example=invalid');
  assert.equal(state.view, 'examples');
  assert.equal(state.example, 'dashboard');
  assert.equal(state.appearance.ui, 'minimal-saas');
});

test('studio corner choices round-trip independently for both comparison sides', () => {
  const pinned = pinBaseline(createState(inventory, '?corners=none'));
  for (const corners of inventory.guidedCorners.values) {
    const changed = changeAppearance(pinned, { corners }, inventory);
    const restored = createState(inventory, serializeState(changed));
    assert.equal(restored.appearance.corners, corners);
    assert.equal(restored.baseline.corners, 'none');
  }
  const invalid = createState(inventory, '?corners=unknown');
  assert.equal(invalid.appearance.corners, '');
  assert.equal(new URLSearchParams(serializeState(invalid)).has('corners'), false);
});
/** The demo deliberately chooses a neutral icon family and monochrome artwork by default. */
test('studio icon preferences default to Minimal SaaS monochrome and round-trip independently', () => {
  const state = createState(inventory);
  assert.deepEqual(state.icons, { styleSpecific: false, themed: false });
  const enabled = { ...state, icons: { styleSpecific: true, themed: true } };
  const restored = createState(inventory, serializeState(enabled));
  assert.deepEqual(restored.icons, enabled.icons);
});
