import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/y2k.css', import.meta.url), 'utf8');

test('Y2K standalone palettes match the retained light and dark reference artwork', () => {
  const referenceTokens = [
    '--y2k-fallback-bg-rgb: 192 192 192',
    '--y2k-fallback-surface-rgb: 236 236 236',
    '--y2k-fallback-primary-rgb: 8 24 172',
    '--y2k-fallback-link-rgb: 0 0 204',
    '--y2k-dark-fallback-bg-rgb: 2 6 7',
    '--y2k-dark-fallback-surface-rgb: 3 7 7',
    '--y2k-dark-fallback-primary-rgb: 7 20 145',
    '--y2k-dark-fallback-link-rgb: 85 167 255'
  ];

  for (const token of referenceTokens) assert.ok(css.includes(token), `Missing reference token: ${token}`);
});

test('Y2K keeps theme-token paint separate from its reference geometry', () => {
  assert.match(css, /\[data-ui="y2k"\]\[data-theme\]\[data-mode\][\s\S]*?--y2k-primary-rgb:\s*var\(--usk-primary-rgb\)/);
  assert.match(css, /--y2k-radius-(?:xs|sm|md|lg|xl):\s*0;/);
  assert.match(css, /--y2k-font-sans:\s*Tahoma, Verdana, Arial, sans-serif;/);
});

test('Y2K controls use compact square operating-system geometry', () => {
  assert.match(css, /\.y2k-button,\s*\.y2k-icon-button\s*\{[^}]*min-height:\s*1\.375rem;[^}]*border:\s*1px outset[^}]*border-radius:\s*0;/);
  assert.match(css, /\.y2k-input,\s*\.y2k-textarea,\s*\.y2k-select\s*\{[^}]*min-height:\s*1\.375rem;[^}]*border:\s*1px inset[^}]*border-radius:\s*0;/);
  assert.match(css, /\[data-ui="y2k"\]\[data-mode\]\s*:focus-visible\s*\{[^}]*outline:\s*2px dotted #d21212;/);
  assert.match(css, /@media \(pointer: coarse\)[\s\S]*?min-block-size:\s*2\.75rem;/);
});

test('Y2K feedback, data, and overlay surfaces reproduce the portal atlas', () => {
  assert.match(css, /\.y2k-alert\s*\{[^}]*background:\s*#cfe8ff;/);
  assert.match(css, /\.y2k-alert-warning\s*\{[^}]*background:\s*#fff2b2;/);
  assert.match(css, /\.y2k-alert-danger\s*\{[^}]*background:\s*#ffd0d0;/);
  assert.match(css, /\.y2k-alert-success\s*\{[^}]*background:\s*#cef2ce;/);
  assert.match(css, /\.y2k-progress-bar\s*\{[^}]*repeating-linear-gradient/);
  assert.match(css, /\[data-ui="y2k"\]\[data-mode\]\s*:where\(dialog\)\s*\{[^}]*border:\s*3px outset[^}]*box-shadow:\s*5px 5px 0/);
  assert.match(css, /\.y2k-tooltip[^}]*background:\s*#ffffc7;/);
});
