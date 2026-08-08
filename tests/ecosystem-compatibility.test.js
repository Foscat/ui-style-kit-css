import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { extractPackageImports } from '../scripts/documented-imports.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const compatibilityPath = path.join(rootDir, 'ecosystem-compatibility.json');
const siblingRepositories = new Map([
  ['interactive-surface-css', path.resolve(rootDir, '..', 'Interactive-Surface-CSS')],
  ['layout-style-css', path.resolve(rootDir, '..', 'Layout-Style-CSS')],
  ['ui-style-kit-css', rootDir]
]);

test('authoritative ecosystem compatibility contract validates supported combinations and exports', async () => {
  assert.ok(fs.existsSync(compatibilityPath), 'ecosystem-compatibility.json must be the checked-in compatibility source');
  if (!fs.existsSync(compatibilityPath)) {
    return;
  }

  const compatibility = JSON.parse(fs.readFileSync(compatibilityPath, 'utf8'));
  const schema = await import('../scripts/ecosystem-manifest-schema.mjs');
  assert.equal(typeof schema.validateEcosystemCompatibility, 'function');
  if (typeof schema.validateEcosystemCompatibility !== 'function') {
    return;
  }

  assert.doesNotThrow(() => schema.validateEcosystemCompatibility(compatibility));
  assert.equal(compatibility.schemaVersion, 1);
  assert.equal(compatibility.ownership.repository, 'ui-style-kit-css');
  assert.equal(compatibility.ownership.status, 'temporary');
  assert.deepEqual(
    compatibility.packages.map(({ name, supportedRange }) => [name, supportedRange]),
    [
      ['ui-style-kit-css', '>=2.1.0 <3.0.0'],
      ['interactive-surface-css', '>=1.5.0 <2.0.0'],
      ['layout-style-css', '>=3.0.0 <4.0.0']
    ]
  );

  for (const combination of Object.values(compatibility.supportedCombinations)) {
    for (const packageDefinition of compatibility.packages) {
      assert.ok(
        satisfiesRange(combination[packageDefinition.name], packageDefinition.supportedRange),
        `${packageDefinition.name}@${combination[packageDefinition.name]} must satisfy ${packageDefinition.supportedRange}`
      );
    }
  }

  for (const packageDefinition of compatibility.packages) {
    const repository = siblingRepositories.get(packageDefinition.name);
    const packageJson = JSON.parse(fs.readFileSync(path.join(repository, 'package.json'), 'utf8'));
    assert.equal(
      packageJson.version,
      compatibility.supportedCombinations.current[packageDefinition.name],
      `${packageDefinition.name} current combination must match its checked-out package`
    );
  }

  for (const importDefinition of compatibility.canonicalImports) {
    const [packageName, exportPath] = splitPackageSpecifier(importDefinition.specifier);
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(siblingRepositories.get(packageName), 'package.json'), 'utf8')
    );
    const exportTarget = packageJson.exports[exportPath];

    assert.equal(typeof exportTarget, 'string', `${importDefinition.specifier} must stay publicly exported`);
    assert.ok(
      fs.existsSync(path.join(siblingRepositories.get(packageName), exportTarget.replace(/^\.\//, ''))),
      `${importDefinition.specifier} must point to a checked-in artifact`
    );
  }
});

test('current ecosystem documentation consumes canonical imports from the compatibility contract', () => {
  assert.ok(fs.existsSync(compatibilityPath), 'ecosystem-compatibility.json must be available to documentation tests');
  if (!fs.existsSync(compatibilityPath)) {
    return;
  }

  const compatibility = JSON.parse(fs.readFileSync(compatibilityPath, 'utf8'));
  const canonicalImports = compatibility.canonicalImports.map(({ specifier }) => specifier);
  const documents = [
    path.join(rootDir, 'README.md'),
    path.join(rootDir, 'docs', 'ECOSYSTEM.md'),
    path.join(rootDir, 'wiki', 'Ecosystem-Compatibility.md'),
    path.join(rootDir, 'wiki', 'Installation-and-Setup.md')
  ];
  const canonicalBlock = canonicalImports.map((specifier) => ['import ', specifier, ';'].join(String.fromCharCode(34))).join('\n');

  for (const documentPath of documents) {
    const document = fs.readFileSync(documentPath, 'utf8');
    assert.ok(extractPackageImports(document).includes(canonicalImports[0]));
    assert.ok(document.includes(canonicalBlock), `${documentPath} must retain the canonical import order`);

    for (const packageDefinition of compatibility.packages) {
      const currentVersion = compatibility.supportedCombinations.current[packageDefinition.name];
      if (!documentPath.endsWith('Installation-and-Setup.md')) {
        assert.match(document, new RegExp(`${escapeRegExp(packageDefinition.name)}@${escapeRegExp(currentVersion)}`));
      }
    }
  }
});

function splitPackageSpecifier(specifier) {
  for (const packageName of siblingRepositories.keys()) {
    if (specifier === packageName) {
      return [packageName, '.'];
    }
    if (specifier.startsWith(`${packageName}/`)) {
      return [packageName, `./${specifier.slice(packageName.length + 1)}`];
    }
  }
  throw new Error(`Unknown ecosystem package specifier: ${specifier}`);
}

function satisfiesRange(version, range) {
  const rangeMatch = /^>=(\d+)\.(\d+)\.(\d+) <(\d+)\.0\.0$/.exec(range);
  assert.ok(rangeMatch, `Unsupported range syntax: ${range}`);
  const versionMatch = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  assert.ok(versionMatch, `Unsupported version syntax: ${version}`);

  const actual = versionMatch.slice(1).map(Number);
  const minimum = rangeMatch.slice(1, 4).map(Number);
  const exclusiveMajor = Number(rangeMatch[4]);

  return compareVersion(actual, minimum) >= 0 && actual[0] < exclusiveMajor;
}

function compareVersion(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
