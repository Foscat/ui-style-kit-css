import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateSharedManifest } from '../scripts/ecosystem-manifest-schema.mjs';
import { resolveInteractiveSource } from '../scripts/ecosystem-pack-sources.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

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
