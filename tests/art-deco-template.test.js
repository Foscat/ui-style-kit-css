import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const required = ['sheet', 'frame', 'frame-navy', 'masthead', 'masthead-title', 'monogram', 'stat', 'stat-value', 'stat-label', 'health', 'meta-grid', 'meta', 'status-dot', 'performance', 'section-title', 'number', 'breadcrumb', 'pagination', 'button-loading', 'input-valid', 'help-error', 'file-upload', 'file', 'select-panel', 'option', 'group-label', 'multi', 'chip', 'slider-wrap', 'slider', 'slider-output', 'meter', 'step-progress', 'stage-list', 'stage', 'stage-number', 'tabs', 'tab-list', 'tab', 'tab-panel', 'segmented', 'segment', 'stepper', 'badge-info', 'badge-outline', 'alert-info', 'alert-icon', 'alert-close', 'dialog', 'dialog-actions', 'details', 'skeleton', 'palette', 'swatch'];

/** Verifies the template surface independently from the demo renderer. */
test('Art Deco publishes the complete element-system component inventory', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['art-deco']]);
  const classes = new Set();
  walk(parse(fs.readFileSync('styles/art-deco.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') classes.add(node.name);
  });
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing public component: deco-${suffix}`);
    assert.ok(classes.has(`deco-${suffix}`), `Missing CSS: deco-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('ad-')));
});
