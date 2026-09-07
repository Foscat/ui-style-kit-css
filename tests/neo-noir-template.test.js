import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, walk } from 'css-tree';

const required = ["sheet","identity","brand-line","title","edition","subtitle","section-title","section-number","breadcrumbs","tabs","tab","tab-panel","pagination","segmented","stepper-track","step","step-marker","button-outline","field-row","file-zone","file-state","listbox","option","chips","chip","range","slider-value","range-scale","range-legend","segments","workflow","threshold","threshold-labels","badge-review","alert-close","processing","progress-cell","dialog","dialog-meta","dialog-actions","swatches","swatch","display-sample","alpha","mono-sample","geometry-row","shape","line-samples","texture-sample","ratio","focus-sample","color-safe","details"];

/** Verifies the independent reference inventory, not just renderer output. */
test('Neo Noir publishes every reference component family', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['neo-noir']]);
  const classes = new Set();
  walk(parse(fs.readFileSync('styles/neo-noir.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') classes.add(node.name);
  });
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing API: noir-${suffix}`);
    assert.ok(classes.has(`noir-${suffix}`), `Missing CSS: noir-${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('nn-')));
});

/** Ensures every packaged raster URL resolves from its actual CSS entrypoint. */
test('Neo Noir source and distributions retain portable reference textures', () => {
  for (const file of ['styles/neo-noir.css', 'dist/ui-style-kit.css', 'dist/ui-style-kit.visual.min.css', 'dist/visual/neo-noir.css']) {
    const urls = [];
    walk(parse(fs.readFileSync(file, 'utf8'), { parseCustomProperty: true }), (node) => {
      if (node.type === 'Url' && node.value.includes('assets/neo-noir-')) urls.push(node.value);
    });
    assert.equal(new Set(urls).size, 4, file);
    for (const url of urls) assert.ok(fs.existsSync(new URL(url, pathToFileURL(path.resolve(file)))), `${file}: ${url}`);
  }
});
