import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const css = fs.readFileSync(new URL('../styles/technical-blueprint.css', import.meta.url), 'utf8');
const required = [
  'accordion', 'avatar', 'avatar-danger', 'avatar-group', 'avatar-neutral',
  'breadcrumb', 'chip', 'chip-danger', 'chip-warning', 'choice', 'code',
  'datum', 'dropdown', 'error-text', 'file', 'helper', 'input-icon', 'input-wrap',
  'line-swatch', 'list', 'meter', 'modal', 'modal-actions', 'option', 'overline',
  'pagination', 'pagination-page', 'popover', 'progress-danger', 'quote',
  'range', 'range-critical', 'section-title', 'segment', 'segmented', 'sheet',
  'skeleton', 'step', 'stepper', 'tab', 'tabs', 'tags', 'toast', 'token-swatch'
];

test('Technical Blueprint publishes the complete drafting component surface', () => {
  const classes = new Set();
  walk(parse(css), (node) => { if (node.type === 'ClassSelector') classes.add(node.name); });
  for (const suffix of required) {
    assert.ok(manifest.classApi.presetExtras['technical-blueprint'].includes(suffix), `Manifest missing blueprint-${suffix}`);
    assert.ok(classes.has(`blueprint-${suffix}`), `CSS missing blueprint-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('tb-')), 'No source-only aliases');
});
