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

/** Verifies that shared semantic actions and identities keep Art Deco geometry. */
test('Art Deco retains stepped action frames and diamond avatars', () => {
  const css = fs.readFileSync('styles/art-deco.css', 'utf8');

  assert.match(
    css,
    /\[data-ui="art-deco"\]\[data-mode\]\s+:is\(\.deco-button,\s*\.deco-icon-button\)\s*\{[^}]*border:\s*3px\s+double\s+var\(--deco-metal\);[^}]*clip-path:\s*var\(--deco-step-sm\);/s
  );
  assert.match(
    css,
    /\[data-ui="art-deco"\]\[data-mode\]\s+\.deco-avatar\s*\{[^}]*color:\s*var\(--deco-jewel-on\);[^}]*border-radius:\s*0;[^}]*transform:\s*rotate\(45deg\)\s+scale\(\.78\);/s
  );
  assert.match(
    css,
    /\.deco-avatar\s*>\s*:where\(img,\s*\[aria-hidden="true"\]\)\s*\{[^}]*transform:\s*rotate\(-45deg\)\s+scale\(1\.12\);/s
  );
  assert.match(
    css,
    /\[data-ui="art-deco"\]\[data-mode\]\s+\.deco-avatar-group\s*>\s*\*\s*\+\s*\*\s*\{[^}]*margin-inline-start:\s*\.25rem;/s
  );
  assert.match(
    css,
    /\[data-ui="art-deco"\]\[data-mode\]\s+\.deco-avatar\s*>\s*\[role="status"\]\s*\{[^}]*color:\s*var\(--deco-jewel-on\);[^}]*transform:\s*rotate\(-45deg\);/s
  );
});
