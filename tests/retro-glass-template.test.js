import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const css = fs.readFileSync(new URL('../styles/retro-glass.css', import.meta.url), 'utf8');
const templateComponents = [
  'accordion', 'avatar', 'avatar-group', 'avatar-danger', 'avatar-neutral',
  'breadcrumb', 'chip', 'chip-danger', 'chip-warning', 'choice', 'code',
  'dropdown', 'error-text', 'file', 'helper', 'input-icon', 'input-wrap',
  'list', 'meter', 'modal', 'modal-actions', 'option', 'overline',
  'pagination', 'pagination-page', 'popover', 'progress-danger', 'quote',
  'range', 'range-critical', 'section-title', 'segment', 'segmented',
  'skeleton', 'step', 'stepper', 'tab', 'tabs', 'tags', 'toast', 'token-swatch'
];

test('Retro Glass publishes the complete rounded-glass template component surface', () => {
  const classes = new Set();
  walk(parse(css), (node) => {
    if (node.type === 'ClassSelector') classes.add(node.name);
  });
  for (const suffix of templateComponents) {
    assert.ok(manifest.classApi.presetExtras['retro-glass'].includes(suffix), `Manifest missing rg-${suffix}`);
    assert.ok(classes.has(`rg-${suffix}`), `Styles missing rg-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('rg-button--')), 'Keep canonical modifier names');
});
