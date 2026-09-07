import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { parse, walk } from 'css-tree';

const required = ['sheet', 'rail', 'rail-link', 'studio-mark', 'masthead', 'palette', 'swatch', 'reference-section', 'section-title', 'button-matrix', 'button-outline', 'field-row', 'input-wrap', 'file-zone', 'select-menu', 'option', 'tags', 'chip', 'choices', 'range', 'range-scale', 'value-flag', 'segments', 'milestones', 'milestone', 'threshold', 'vertical-progress', 'tabs', 'tab', 'tab-panel', 'pagination', 'segmented', 'quantity', 'alert-info', 'alert-close', 'avatar', 'avatar-group', 'dialog', 'dialog-actions'];
required.push('component-matrix', 'choice-stack', 'control-band', 'feedback-band', 'navigation-band', 'data-band', 'studio', 'loading-track', 'palette-grid', 'threshold-scale', 'tab-media');

/** Checks the reference inventory independently of demo markup. */
test('Clay publishes and showcases every reference component', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras.clay]);
  const selectors = new Set();
  walk(parse(fs.readFileSync('styles/clay.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') selectors.add(node.name);
  });
  const window = { UI_STYLE_KIT_ICONS: {} };
  vm.runInNewContext(fs.readFileSync('demo/demo-clay.js', 'utf8'), { window, URL, document: { currentScript: { src: pathToFileURL(path.resolve('demo/demo-clay.js')).href } } });
  const html = window.ClaySpecimen.render('clay', 'light');
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing API: clay-${suffix}`);
    assert.ok(selectors.has(`clay-${suffix}`), `Missing CSS: clay-${suffix}`);
    assert.match(html, new RegExp(`\\bclay-${suffix}\\b`), `Missing demo: clay-${suffix}`);
  }
  for (const preset of manifest.presets.filter((item) => item.id !== 'clay')) {
    assert.equal(window.ClaySpecimen.render(preset.id, 'light'), '', preset.id);
  }
});
