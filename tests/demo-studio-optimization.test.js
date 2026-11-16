import test from 'node:test';
import assert from 'node:assert/strict';
import { componentInventory } from '../demo/studio/inventory.js';
import { changesBetween } from '../demo/studio/changes.js';

/** Inventory consumers must not instantiate component examples or import their markup. */
test('studio inventory is a lightweight shared source without catalog rendering', () => {
  assert.equal(componentInventory.length, 9);
  assert.equal(componentInventory[0].id, 'all');
  for (const item of componentInventory)
    assert.ok(item.label && item.description && !('html' in item));
});

/** Interaction changes must not invalidate visual, icon, palette, or catalog ownership. */
test('studio change classification isolates typing from visual rendering', () => {
  const initial = {
    view: 'examples',
    example: 'form',
    markup: 'semantic',
    component: 'all',
    filter: '',
    appearance: { ui: 'minimal-saas', theme: '', mode: 'light', bridge: false },
    edits: {},
    icons: { styleSpecific: false, themed: false },
    interactions: { form: { name: '', email: '' } },
  };
  const typed = { ...initial, interactions: { form: { name: 'Sample', email: '' } } };
  const changes = changesBetween(initial, typed);
  assert.deepEqual(changes.scopes, ['form']);
  for (const key of ['mount', 'appearance', 'palette', 'icons', 'filter', 'bridge'])
    assert.equal(changes[key], false, key);
  assert.equal(changesBetween(initial, { ...initial, filter: 'badge' }).filter, true);
  assert.equal(changesBetween(initial, { ...initial, component: 'feedback' }).mount, false);
  assert.equal(
    changesBetween(initial, { ...initial, appearance: { ...initial.appearance, ui: 'clay' } })
      .palette,
    true,
  );
  assert.equal(
    changesBetween(initial, { ...initial, appearance: { ...initial.appearance, ui: 'clay' } })
      .icons,
    false,
  );
  assert.equal(changesBetween(initial, initial).changed, false);
});

/** Shared renderer modules must be compiled directly rather than extracted from another controller. */
test('studio specimen build compiles explicit shared modules and lifecycle contracts', async () => {
  const { readFileSync } = await import('node:fs');
  const builder = readFileSync('scripts/build-studio.mjs', 'utf8');
  assert.doesNotMatch(builder, /specimenFunctions|from 'acorn'|uiSelect=\{/);
  const registry = readFileSync('demo/studio/specimens.js', 'utf8');
  assert.doesNotMatch(registry, /EventTarget\.prototype|class extends Observer/);
  assert.match(registry, /createSpecimenContext/);
});
