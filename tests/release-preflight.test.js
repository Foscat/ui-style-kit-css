import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const moduleUrl = new URL('../scripts/release-preflight.mjs', import.meta.url);
let releasePreflight;
try {
  releasePreflight = await import(moduleUrl);
} catch {
  // RED remains an assertion failure until the executable release gate exists.
}

test('queries every exact minimum and current package version from the configured registry', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const requested = [];
  const server = createServer((request, response) => {
    requested.push(request.url);
    const [, packageName, version] = request.url.split('/');
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ name: decodeURIComponent(packageName), version }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await releasePreflight.verifyPublishedVersions(fixtureCompatibility(), {
      registryUrl: `http://127.0.0.1:${port}`
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  assert.deepEqual(requested.sort(), [
    '/interactive-surface-css/1.5.0',
    '/layout-style-css/3.0.0',
    '/layout-style-css/3.0.1',
    '/ui-style-kit-css/2.1.0'
  ]);
});

test('excludes only the staged Layout 3.0.1 candidate while retaining published minimum checks', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const requested = [];
  const server = createServer((request, response) => {
    requested.push(request.url);
    const [, packageName, version] = request.url.split('/');
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ name: decodeURIComponent(packageName), version }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await releasePreflight.verifyPublishedVersions(fixtureCompatibility(), {
      registryUrl: `http://127.0.0.1:${port}`,
      candidatePackage: 'layout-style-css',
      candidateVersion: '3.0.1'
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  assert.deepEqual(requested.sort(), [
    '/interactive-surface-css/1.5.0',
    '/layout-style-css/3.0.0',
    '/ui-style-kit-css/2.1.0'
  ]);
});

test('excludes only the unpublished candidate current version from registry checks', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const requested = [];
  const server = createServer((request, response) => {
    requested.push(request.url);
    const [, packageName, version] = request.url.split('/');
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ name: decodeURIComponent(packageName), version }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await releasePreflight.verifyPublishedVersions(futureCandidateCompatibility(), {
      registryUrl: `http://127.0.0.1:${port}`,
      candidatePackage: 'ui-style-kit-css',
      candidateVersion: '2.2.0'
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  assert.deepEqual(requested.sort(), [
    '/interactive-surface-css/1.5.0',
    '/interactive-surface-css/1.6.0',
    '/layout-style-css/3.0.0',
    '/layout-style-css/3.1.0',
    '/ui-style-kit-css/2.1.0'
  ]);
});

test('still rejects a nonexistent companion current version for an unpublished candidate', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const server = createServer((request, response) => {
    const [, packageName, version] = request.url.split('/');
    response.setHeader('content-type', 'application/json');
    if (decodeURIComponent(packageName) === 'interactive-surface-css' && version === '1.6.0') {
      response.statusCode = 404;
      response.end(JSON.stringify({ error: 'version not found' }));
      return;
    }
    response.end(JSON.stringify({ name: decodeURIComponent(packageName), version }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await assert.rejects(
      releasePreflight.verifyPublishedVersions(futureCandidateCompatibility(), {
        registryUrl: `http://127.0.0.1:${port}`,
        candidatePackage: 'ui-style-kit-css',
        candidateVersion: '2.2.0'
      }),
      /interactive-surface-css@1\.6\.0 does not exist exactly/
    );
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('still rejects a candidate minimum distinct from its unpublished current version', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const server = createServer((request, response) => {
    const [, packageName, version] = request.url.split('/');
    response.setHeader('content-type', 'application/json');
    if (decodeURIComponent(packageName) === 'ui-style-kit-css' && version === '2.1.0') {
      response.statusCode = 404;
      response.end(JSON.stringify({ error: 'version not found' }));
      return;
    }
    response.end(JSON.stringify({ name: decodeURIComponent(packageName), version }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await assert.rejects(
      releasePreflight.verifyPublishedVersions(futureCandidateCompatibility(), {
        registryUrl: `http://127.0.0.1:${port}`,
        candidatePackage: 'ui-style-kit-css',
        candidateVersion: '2.2.0'
      }),
      /ui-style-kit-css@2\.1\.0 does not exist exactly/
    );
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('rejects a documented version when the registry does not return that exact release', async () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const server = createServer((_request, response) => {
    response.statusCode = 404;
    response.end(JSON.stringify({ error: 'version not found' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const { port } = server.address();
    await assert.rejects(
      releasePreflight.verifyPublishedVersions(fixtureCompatibility(), {
        registryUrl: `http://127.0.0.1:${port}`
      }),
      /ui-style-kit-css@2\.1\.0 does not exist exactly/
    );
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('resolves every concrete and wildcard export from an installed tarball', () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'release-export-contract-'));
  const packageRoot = path.join(fixtureRoot, 'node_modules', 'fixture-css');
  fs.mkdirSync(path.join(packageRoot, 'dist', 'personalities'), { recursive: true });
  fs.writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'fixture-css',
        version: '1.0.0',
        exports: {
          '.': './dist/index.css',
          './personalities/*.css': './dist/personalities/*.css',
          './package.json': './package.json'
        }
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(path.join(packageRoot, 'dist', 'index.css'), '.fixture { display: block; }\n');
  fs.writeFileSync(path.join(packageRoot, 'dist', 'personalities', 'bento.css'), '.bento { gap: 1rem; }\n');
  fs.writeFileSync(path.join(fixtureRoot, 'package.json'), '{"name":"consumer","private":true}\n');

  try {
    assert.deepEqual(releasePreflight.validateInstalledExports(fixtureRoot, 'fixture-css'), [
      'fixture-css',
      'fixture-css/package.json',
      'fixture-css/personalities/bento.css'
    ]);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('rejects release mutations from pull-request workflows and requires preflight before release mutations', () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const safePullRequest = `
name: Release preflight
on:
  pull_request:
jobs:
  verify:
    steps:
      - run: npm run release:preflight
`;
  const safeRelease = `
name: npm publish
on:
  release:
jobs:
  publish:
    steps:
      - run: npm run release:preflight
      - run: npm publish --access public --ignore-scripts
`;

  assert.doesNotThrow(() =>
    releasePreflight.validateWorkflowSources([
      { name: 'ci.yml', source: safePullRequest },
      { name: 'npm-publish.yml', source: safeRelease }
    ])
  );
  assert.throws(
    () =>
      releasePreflight.validateWorkflowSources([
        { name: 'ci.yml', source: `${safePullRequest}      - run: npm publish\n` },
        { name: 'npm-publish.yml', source: safeRelease }
      ]),
    /pull-request workflow ci\.yml enables forbidden mutation: npm publish/
  );
  assert.throws(
    () =>
      releasePreflight.validateWorkflowSources([
        { name: 'ci.yml', source: safePullRequest },
        {
          name: 'npm-publish.yml',
          source: safeRelease.replace('- run: npm run release:preflight\n      - run: npm publish', '- run: npm publish')
        }
      ]),
    /npm-publish\.yml must run release:preflight before npm publish/
  );
});

test('repository CI is explicitly read-only and staged publishing cannot re-enter prepublishOnly', () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const ciWorkflow = fs.readFileSync(path.join(repositoryRoot, '.github', 'workflows', 'ci.yml'), 'utf8');
  const publishWorkflow = fs.readFileSync(
    path.join(repositoryRoot, '.github', 'workflows', 'npm-publish.yml'),
    'utf8'
  );
  const packageManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'));

  assert.match(ciWorkflow, /^permissions:\r?\n\s+contents:\s+read\s*$/m);
  const preflightIndex = publishWorkflow.search(/\bnpm\s+run\s+release:preflight\b/);
  const publishIndex = publishWorkflow.search(/\bnpm\s+publish\s+--access\s+public\s+--ignore-scripts\b/);
  assert.ok(preflightIndex >= 0 && preflightIndex < publishIndex);
  assert.equal(
    packageManifest.scripts.prepublishOnly,
    'npm run release:verify',
    'Direct local npm publish must retain the complete lifecycle guard.'
  );

  assertPublishIgnoreScriptsSkipsLifecycle();
});

test('workflow policy rejects publishing that could re-enter prepublishOnly', () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  assert.throws(
    () =>
      releasePreflight.validateWorkflowSources([
        {
          name: 'ci.yml',
          source: 'on:\n  pull_request:\njobs:\n  verify:\n    steps:\n      - run: npm run release:preflight\n'
        },
        {
          name: 'npm-publish.yml',
          source:
            'on:\n  release:\njobs:\n  publish:\n    steps:\n      - run: npm run release:preflight\n      - run: npm publish --access public\n'
        }
      ]),
    /npm-publish\.yml must publish with --ignore-scripts after the explicit release preflight/
  );
});

test('repository pull-request and release workflows enforce the executable preflight boundary', () => {
  assert.ok(releasePreflight, 'scripts/release-preflight.mjs must implement the release gate');

  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const workflowRoot = path.join(repositoryRoot, '.github', 'workflows');
  const workflows = fs
    .readdirSync(workflowRoot)
    .filter((name) => /\.ya?ml$/i.test(name))
    .map((name) => ({ name, source: fs.readFileSync(path.join(workflowRoot, name), 'utf8') }));

  assert.doesNotThrow(() => releasePreflight.validateWorkflowSources(workflows));
});

test('module URL remains local so workflow tests execute repository code', () => {
  assert.equal(pathToFileURL(path.resolve(new URL('..', import.meta.url).pathname)).protocol, 'file:');
});

function fixtureCompatibility() {
  return {
    supportedCombinations: {
      minimum: {
        'ui-style-kit-css': '2.1.0',
        'interactive-surface-css': '1.5.0',
        'layout-style-css': '3.0.0'
      },
      current: {
        'ui-style-kit-css': '2.1.0',
        'interactive-surface-css': '1.5.0',
        'layout-style-css': '3.0.1'
      }
    }
  };
}

function futureCandidateCompatibility() {
  return {
    supportedCombinations: {
      minimum: {
        'ui-style-kit-css': '2.1.0',
        'interactive-surface-css': '1.5.0',
        'layout-style-css': '3.0.0'
      },
      current: {
        'ui-style-kit-css': '2.2.0',
        'interactive-surface-css': '1.6.0',
        'layout-style-css': '3.1.0'
      }
    }
  };
}

function assertPublishIgnoreScriptsSkipsLifecycle() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'release-lifecycle-contract-'));
  const lifecycleMarker = path.join(fixtureRoot, 'prepublish-only-ran');
  fs.writeFileSync(
    path.join(fixtureRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'release-lifecycle-contract',
        version: '1.0.0',
        private: false,
        files: ['index.css'],
        scripts: { prepublishOnly: 'node lifecycle-guard.mjs' }
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(path.join(fixtureRoot, 'index.css'), '.release-lifecycle-contract { display: block; }\n');
  fs.writeFileSync(
    path.join(fixtureRoot, 'lifecycle-guard.mjs'),
    `import fs from 'node:fs';\nfs.writeFileSync(${JSON.stringify(lifecycleMarker)}, 'ran');\nprocess.exit(23);\n`
  );

  try {
    const npmExecPath = process.env.npm_execpath;
    const command =
      npmExecPath && fs.existsSync(npmExecPath)
        ? process.execPath
        : process.platform === 'win32'
          ? 'npm.cmd'
          : 'npm';
    const baseArgs = npmExecPath && fs.existsSync(npmExecPath) ? [npmExecPath] : [];
    const result = spawnSync(
      command,
      [...baseArgs, 'publish', '--dry-run', '--access', 'public', '--ignore-scripts', '--loglevel', 'error'],
      {
        cwd: fixtureRoot,
        encoding: 'utf8',
        shell: process.platform === 'win32' && baseArgs.length === 0
      }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(
      fs.existsSync(lifecycleMarker),
      false,
      'prepublishOnly must not run after the staged preflight.'
    );
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}
