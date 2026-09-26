import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

const promotedSelectorsByRole = {
  tabs: ['tabs', 'tab-list', 'tab', 'tab-panel'],
  pagination: ['pagination', 'pagination-item', 'pagination-link'],
  breadcrumb: [
    'breadcrumb',
    'breadcrumb-list',
    'breadcrumb-item',
    'breadcrumb-link',
    'breadcrumb-separator'
  ],
  skeleton: ['skeleton'],
  emptyState: [
    'empty-state',
    'empty-state-icon',
    'empty-state-title',
    'empty-state-body',
    'empty-state-actions'
  ],
  metric: ['metric', 'metric-label', 'metric-value', 'metric-detail'],
  chip: ['chip', 'chip-group'],
  avatar: ['avatar', 'avatar-group'],
  stepper: ['stepper', 'step', 'step-marker', 'step-label'],
  toast: ['toast-stack', 'toast', 'toast-title', 'toast-body', 'toast-actions'],
  popover: ['popover'],
  menu: ['menu', 'menu-item', 'menu-group', 'menu-separator'],
  segmentedControl: ['segmented-control', 'segment'],
  fileUpload: ['file-upload', 'dropzone'],
  listbox: ['listbox', 'listbox-option']
};

test('Tier A and Tier B patterns are promoted through universal semantic sources', () => {
  const universalSuffixes = new Set(manifest.classApi.universalVisualSuffixes);
  const implementedSelectors = new Set(
    manifest.semanticComponentApi.implementationStatus.implemented.selectors
  );

  for (const [role, suffixes] of Object.entries(promotedSelectorsByRole)) {
    assert.deepEqual(
      manifest.semanticComponentApi.selectorsByRole[role],
      suffixes.map((sourceSuffix) => ({ selector: `.ui-${sourceSuffix}`, sourceSuffix }))
    );

    for (const suffix of suffixes) {
      assert.equal(universalSuffixes.has(suffix), true, `${suffix} must be universal`);
      assert.equal(
        implementedSelectors.has(`.ui-${suffix}`),
        true,
        `.ui-${suffix} must be implemented`
      );
    }
  }
});

test('promoted semantic variants and state hooks remain explicit', () => {
  const variants = manifest.semanticComponentApi.variantAttribute.valuesBySelector;

  assert.deepEqual(variants['.ui-chip'], ['primary', 'secondary', 'success', 'warning', 'danger']);
  assert.deepEqual(variants['.ui-toast'], ['info', 'success', 'warning', 'danger']);
  assert.deepEqual(manifest.semanticComponentApi.stateAttributes, {
    '.ui-skeleton': { 'data-shape': ['text', 'circle', 'block'] },
    '.ui-step': { 'data-state': ['complete', 'current', 'upcoming', 'error'] }
  });
});
