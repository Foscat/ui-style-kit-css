import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const required = ['panel-header', 'panel-body', 'rivet', 'button-guarded', 'control-cell', 'control-name', 'emergency-stop', 'key-switch', 'pilot-light', 'check', 'radio', 'toggle', 'three-position', 'slider', 'ticks', 'readout', 'readout-label', 'meter', 'stage-track', 'stage', 'tabs', 'tab', 'breadcrumb', 'pagination', 'segmented', 'dialog', 'popover', 'details', 'token-row', 'token', 'skeleton', 'toast', 'toast-stack', 'file', 'help', 'overline', 'dropdown', 'option', 'nameplate'];

test('Industrial Utility exports the full operator-console template surface', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const classes = new Set();
  walk(parse(fs.readFileSync('styles/industrial-utility.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') classes.add(node.name);
  });
  for (const suffix of required) {
    assert.ok([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['industrial-utility']].includes(suffix), `Missing manifest component ${suffix}`);
    assert.ok(classes.has(`utility-${suffix}`), `Missing CSS utility-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('iu-')), 'No source-template aliases');
});
