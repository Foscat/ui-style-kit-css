import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse, walk } from 'css-tree';

const required = ["alert","alert-danger","alert-success","alert-warning","article-deck","badge","badge-danger","badge-primary","badge-success","badge-warning","binding","breadcrumb","button","button-danger","button-loading","button-primary","button-secondary","button-text","byline","caption","check","chip","details","dialog","dialog-body","dropcap","edition-stamp","empty-state","field","file","file-upload","folio","footnote","help","help-error","icon-button","input","input-icon","kicker","label","manual-meta","marginalia","masthead","masthead-title","meter","pagination","popover","progress","property-stamp","pullquote","radio","rule","rule-double","ruler","search","folio-section","section-index","section-title","segmented","select","select-wrap","sheet","skeleton","slider","spinner","stage","stage-track","swatch","switch","tab","table","tabs","textarea","tooltip"];

test('Paper Editorial publishes every retained template component without source aliases', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const css = fs.readFileSync('styles/paper-editorial.css', 'utf8');
  const classes = new Set();
  walk(parse(css), (node) => { if (node.type === 'ClassSelector') classes.add(node.name); });
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['paper-editorial']]);
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing manifest component ${suffix}`);
    assert.ok(classes.has(`paper-${suffix}`), `Missing CSS component ${suffix}`);
  }
  assert.ok(![...classes].some((name) => name.startsWith('pe-')));
  assert.match(css, /data:image\/png;base64/);
});
