import test from 'node:test';
import { readFileSync } from 'node:fs';
import { componentOptions, renderCatalog } from '../demo/studio/catalog.js';
import assert from 'node:assert/strict';
import {
  renderExample,
  renderComponent,
  componentInventory,
  escapeHtml,
} from '../demo/studio/examples.js';
import { overrideCss, setupMarkup, isFrameMessage } from '../demo/studio/protocol.js';

test('shared examples expose real controls and deterministic comparison data', () => {
  for (const name of ['dashboard', 'form', 'content'])
    assert.match(renderExample(name), /data-action=/);
  assert.match(renderExample('dashboard'), /<table/);
  assert.match(renderExample('dashboard'), /<svg/);
  assert.match(renderExample('form'), /type="email"/);
  assert.match(renderExample('form'), /required/);
});

test('component explorer renders every family with alternative public markup', () => {
  for (const component of componentInventory) {
    assert.ok(renderComponent(component.id, 'semantic', 'saas').length > 40);
    assert.doesNotMatch(renderComponent(component.id, 'native', 'saas'), /\busk-/);
    assert.ok(renderComponent(component.id, 'prefixed', 'clay').length > 40);
  }
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
});

test('CSS and setup export preserve native and named palette ownership', () => {
  const native = { ui: 'tactile', theme: '', mode: 'dark', bridge: false };
  assert.match(
    overrideCss(native, 'tactile', [{ role: 'primary', value: '18 52 86' }]),
    /not\(\[data-theme\]\)/,
  );
  assert.match(
    overrideCss(native, 'tactile', [{ role: 'primary', value: '18 52 86' }]),
    /--tactile-primary-rgb/,
  );
  assert.doesNotMatch(setupMarkup(native), /data-theme=/);
  assert.match(
    setupMarkup(native),
    /href="\.\/node_modules\/ui-style-kit-css\/dist\/ui-style-kit\.visual\.css"/,
  );
  assert.match(
    overrideCss({ ...native, theme: 'arctic-indigo' }, 'tactile', [
      { role: 'primary', value: '18 52 86' },
    ]),
    /--usk-primary-rgb/,
  );
});

test('frame protocol rejects foreign windows channels versions and actions', () => {
  const source = {};
  const valid = { source, data: { version: 1, channel: 'owned', type: 'ready' } };
  assert.equal(isFrameMessage(valid, source, 'owned'), true);
  assert.equal(isFrameMessage({ ...valid, source: {} }, source, 'owned'), false);
  assert.equal(
    isFrameMessage({ ...valid, data: { ...valid.data, channel: 'foreign' } }, source, 'owned'),
    false,
  );
  assert.equal(
    isFrameMessage({ ...valid, data: { ...valid.data, version: 2 } }, source, 'owned'),
    false,
  );
  assert.equal(
    isFrameMessage({ ...valid, data: { ...valid.data, type: 'execute' } }, source, 'owned'),
    false,
  );
});

/** The copy catalog must cover the manifest rather than an independently curated role subset. */
test('dense catalog covers every public role and keeps canonical composition helpers', () => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
  const html = renderComponent('all');
  assert.equal(new Set(componentOptions.map(({ id }) => id)).size, componentOptions.length);
  for (const [role, selectors] of Object.entries(manifest.semanticComponentApi.selectorsByRole))
    assert.ok(
      selectors.some(({ selector }) => html.includes(selector.slice(1))),
      role,
    );
  const prefixed = renderComponent('all', 'prefixed', 'clay');
  for (const name of [
    'usk-modal',
    'usk-form-error',
    'usk-button__icon',
    'usk-avatar__fallback',
    'usk-chip__label',
    'usk-tooltip-anchor',
  ])
    assert.ok(prefixed.includes(name), name + ' remains owned by public composition');
  assert.match(prefixed, /clay-button-primary/);
  assert.doesNotMatch(prefixed, /clay-modal|clay-button__icon/);
  assert.match(
    renderCatalog('all', 'indeterminate'),
    /data-component-option="progress-indeterminate"/,
  );
  assert.doesNotMatch(
    renderCatalog('all', 'indeterminate'),
    /data-component-option="button-primary"/,
  );
});
