import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEcosystemCompatibility, validateSharedManifest } from '../scripts/ecosystem-manifest-schema.mjs';
import { resolveInteractiveSource } from '../scripts/ecosystem-pack-sources.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const ecosystemCompatibility = JSON.parse(fs.readFileSync(path.join(rootDir, 'ecosystem-compatibility.json'), 'utf8'));
const ecosystemGuide = fs.readFileSync(path.join(rootDir, 'docs', 'ECOSYSTEM.md'), 'utf8');
const bridgeMigrationGuide = fs.readFileSync(path.join(rootDir, 'docs', 'BRIDGE-MIGRATION.md'), 'utf8');

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

test('ecosystem compatibility rejects duplicate and incomplete ownership metadata', () => {
  for (const mutate of [
    (contract) => contract.packages.push(structuredClone(contract.packages[0])),
    (contract) => contract.deprecatedImports.push({ status: 'deprecated', replacement: 'ui-style-kit-css/visual.css' }),
    (contract) => delete contract.ownership.note,
    (contract) => (contract.packages[0].owns = '')
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
      revision: 'dfe3844f3d5c3c00b3b42fa03485a63baffc17bb'
    },
    'layout-style-css': {
      repository: 'Foscat/Layout-Style-CSS',
      revision: 'd28cb0ac23ab74d380bd17fc1033db6761afbe78'
    }
  });

  const mutableRevision = structuredClone(ecosystemCompatibility);
  mutableRevision.packageSources['interactive-surface-css'].revision = 'main';
  assert.throws(() => validateEcosystemCompatibility(mutableRevision), /source metadata/);
});

test('ecosystem docs distinguish portable semantic theming from specialized bridge integration', () => {
  for (const value of [
    '[data-ui][data-theme][data-mode]',
    'import "third-party-theme/tokens.css";',
    'import "interactive-surface-css/standalone-preset.css";',
    'import "ui-style-kit-css/interactive-surface-theme.css";',
    'import "interactive-surface-css/state-core.css";'
  ]) {
    assert.ok(ecosystemGuide.includes(value), `Ecosystem guide is missing: ${value}`);
  }

  assert.match(ecosystemGuide, /package-specific[\s\S]*shared semantic[\s\S]*legacy/i);
  assert.match(ecosystemGuide, /specialized[\s\S]*variant[\s\S]*level/i);

  const javascriptFences = bridgeMigrationGuide.match(/```js/g) ?? [];
  assert.equal(javascriptFences.length, 1, 'Deprecated bridge imports should share one equivalent example');
});

test('workflow outputs require pushed companion revisions before UI validation', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usk-ecosystem-workflow-contract-'));
  const outputPath = path.join(tempDir, 'github-output.txt');

  try {
    execFileSync(process.execPath, ['scripts/write-ecosystem-workflow-outputs.mjs'], {
      cwd: rootDir,
      env: { ...process.env, GITHUB_OUTPUT: outputPath },
      stdio: 'pipe'
    });
    const outputs = Object.fromEntries(
      fs.readFileSync(outputPath, 'utf8').trim().split('\n').map((line) => line.split('='))
    );

    assert.equal(outputs.requires_companion_remote_push, 'true');
    assert.equal(outputs.remote_verification_order, 'interactive-surface-css,layout-style-css,ui-style-kit-css');
    assert.equal(outputs.interactive_revision, ecosystemCompatibility.packageSources['interactive-surface-css'].revision);
    assert.equal(outputs.layout_revision, ecosystemCompatibility.packageSources['layout-style-css'].revision);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
