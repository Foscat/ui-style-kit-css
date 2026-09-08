import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { parse, walk } from 'css-tree';

const required = ['sheet', 'masthead', 'brand', 'project-list', 'project-item', 'status-card', 'score', 'avatar-row', 'quote-card', 'hero-card', 'hero-overlay', 'material', 'material-image', 'impact', 'performance', 'notice', 'add-material', 'control-lab', 'section-heading', 'button-outline', 'field', 'input-action', 'file-drop', 'token-input', 'token', 'expanded-select', 'option', 'range', 'value', 'progress-steps', 'tabs', 'tab', 'pagination', 'segmented', 'stepper', 'dialog', 'dialog-actions', 'alert-info'];

/**
 * Calculate opaque RGB contrast for the targeted native palette regression.
 * @param {number[]} foreground Foreground RGB channels.
 * @param {number[]} background Background RGB channels.
 * @returns {number} WCAG contrast ratio.
 */
function nativeContrast(foreground, background) {
  const luminance = (channels) => channels.reduce((sum, value, index) => {
    const channel = value / 255;
    const linear = channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    return sum + linear * [.2126, .7152, .0722][index];
  }, 0);
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

test('Organic native light labels and control edges meet the library contrast floors', () => {
  const css = fs.readFileSync('styles/organic-modern.css', 'utf8');
  const block = css.match(/\[data-ui="organic-modern"\]\[data-mode="light"\]\s*\{([^}]+)\}/)?.[1];
  assert.ok(block, 'Native light palette must exist independently of shared themes');
  const colors = Object.fromEntries([...block.matchAll(/--organic-fallback-([\w-]+)-rgb:\s*([\d\s]+);/g)]
    .map(([, role, value]) => [role, value.trim().split(/\s+/).map(Number)]));
  for (const [foreground, background] of [
    ['text-muted', 'surface-soft'],
    ['secondary-text', 'secondary'],
    ['secondary-text', 'secondary-hover'],
    ['accent-text', 'accent'],
    ['warning-text', 'warning']
  ]) {
    assert.ok(nativeContrast(colors[foreground], colors[background]) >= 4.5, `${foreground} on ${background}`);
  }
  const edge = colors.border.map((value, index) => Math.round(value * .55 + colors.text[index] * .45));
  for (const background of ['bg', 'surface', 'surface-strong', 'surface-soft']) {
    assert.ok(nativeContrast(edge, colors[background]) >= 3, `control edge on ${background}`);
  }
});

/** Verifies the public component inventory independently of the specimen renderer. */
test('Organic publishes every reference component and isolates its specimen', () => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  const api = new Set([...manifest.classApi.universalVisualSuffixes, ...manifest.classApi.presetExtras['organic-modern']]);
  const selectors = new Set();
  walk(parse(fs.readFileSync('styles/organic-modern.css', 'utf8')), (node) => {
    if (node.type === 'ClassSelector') selectors.add(node.name);
  });
  const window = {};
  vm.runInNewContext(fs.readFileSync('demo/demo-organic.js', 'utf8'), { window, URL, document: { currentScript: { src: pathToFileURL(path.resolve('demo/demo-organic.js')).href } } });
  const html = window.OrganicSpecimen.render('organic-modern', 'light');
  for (const suffix of required) {
    assert.ok(api.has(suffix), `Missing API: organic-${suffix}`);
    assert.ok(selectors.has(`organic-${suffix}`), `Missing CSS: organic-${suffix}`);
    assert.match(html, new RegExp(`\\borganic-${suffix}\\b`), `Missing demo: organic-${suffix}`);
  }
  for (const preset of manifest.presets.filter(({ id }) => id !== 'organic-modern')) {
    assert.equal(window.OrganicSpecimen.render(preset.id), '', preset.id);
  }
});
