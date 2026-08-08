import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEcosystemCompatibility, validateSharedManifest } from '../scripts/ecosystem-manifest-schema.mjs';
import { resolveInteractiveSource } from '../scripts/ecosystem-pack-sources.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const ecosystemCompatibility = JSON.parse(fs.readFileSync(path.join(rootDir, 'ecosystem-compatibility.json'), 'utf8'));

test('shared ecosystem manifest policy is required for every package manifest', () => {
  assert.doesNotThrow(() => validateSharedManifest(uiManifest));
  assert.throws(
    () => validateSharedManifest({ schemaVersion: 1, name: 'missing-policy', version: '1.0.0' }),
    /schemaPolicy/
  );
});

test('environment-only Interactive repository selection uses the local source', () => {
  const localRepo = path.join(rootDir, '..', 'Interactive-Surface-CSS');
  const source = resolveInteractiveSource({}, { UI_STYLE_KIT_INTERACTIVE_REPO: localRepo }, rootDir);

  assert.equal(source.interactiveSpec, null);
  assert.equal(source.interactiveRepo, path.resolve(localRepo));
});

test('default Interactive source does not require a pre-Task-4 registry package', () => {
  const source = resolveInteractiveSource({}, {}, rootDir);

  assert.equal(source.interactiveSpec, null);
  assert.equal(source.interactiveRepo, path.join(rootDir, '..', 'Interactive-Surface-CSS'));
});

test('ecosystem compatibility rejects malformed identity and relationship metadata', () => {
  assert.doesNotThrow(() => validateEcosystemCompatibility(ecosystemCompatibility));

  for (const mutate of [
    (contract) => (contract.packages[0].name = 'unexpected-package'),
    (contract) => (contract.canonicalImports[0].owner = 'layout-style-css'),
    (contract) => (contract.canonicalImports[0].specifier = 'layout-style-css/visual.css'),
    (contract) => (contract.deprecatedImports = [])
  ]) {
    const invalid = structuredClone(ecosystemCompatibility);
    mutate(invalid);
    assert.throws(() => validateEcosystemCompatibility(invalid));
  }
});

test('ecosystem compatibility pins immutable companion sources', () => {
  assert.deepEqual(ecosystemCompatibility.packageSources, {
    'ui-style-kit-css': { checkout: 'current' },
    'interactive-surface-css': {
      repository: 'Foscat/Interactive-Surface-CSS',
      revision: 'c1246afa8dee33c95e12db3e1396a9577d1cb557'
    },
    'layout-style-css': {
      repository: 'Foscat/Layout-Style-CSS',
      revision: '0abd21357f464c2e3b034f7cd42a6c890538148e'
    }
  });

  const mutableRevision = structuredClone(ecosystemCompatibility);
  mutableRevision.packageSources['interactive-surface-css'].revision = 'main';
  assert.throws(() => validateEcosystemCompatibility(mutableRevision), /source metadata/);
});
