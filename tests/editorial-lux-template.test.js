import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const required = ['sheet', 'masthead', 'masthead-title', 'collection-rail', 'portrait', 'story', 'story-title', 'byline', 'deck', 'colophon', 'section-title', 'section-number', 'file-upload', 'file-drop', 'input-valid', 'help-error', 'select-panel', 'option', 'range', 'range-scale', 'segmented-progress', 'meter', 'tabs', 'tab-list', 'tab', 'tab-panel', 'badge-medallion', 'badge-brass', 'pagination', 'stepper', 'dialog', 'dialog-actions', 'details', 'skeleton', 'alert-mark', 'alert-close', 'switch-segment'];

/** Verifies the reference inventory independently of the specimen renderer. */
test('Editorial Lux publishes the complete reference component surface', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['editorial-luxe']]);
  const classes = new Set();
  walk(parse(fs.readFileSync('styles/editorial-luxe.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') classes.add(node.name);
  });
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing API: luxe-${suffix}`);
    assert.ok(classes.has(`luxe-${suffix}`), `Missing CSS: luxe-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('el-')));
});
