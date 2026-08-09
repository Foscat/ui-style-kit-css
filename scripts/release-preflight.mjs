import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '..');
const tempPrefix = 'css-ecosystem-release-preflight-';
const packageKeys = {
  'ui-style-kit-css': 'ui',
  'interactive-surface-css': 'interactive',
  'layout-style-css': 'layout'
};

export async function verifyPublishedVersions(
  contract,
  {
    registryUrl = 'https://registry.npmjs.org',
    candidatePackage = null,
    candidateVersion = null
  } = {}
) {
  const queries = new Map();
  const documentedCandidateCurrent = contract.supportedCombinations?.current?.[candidatePackage];
  // Only the exact release candidate may be absent before its first publish.
  const excludedCandidate = candidateVersion === documentedCandidateCurrent
    ? `${candidatePackage}@${candidateVersion}`
    : null;
  for (const combination of Object.values(contract.supportedCombinations ?? {})) {
    for (const [packageName, version] of Object.entries(combination)) {
      const packageVersion = `${packageName}@${version}`;
      if (packageVersion !== excludedCandidate) {
        queries.set(packageVersion, { packageName, version });
      }
    }
  }

  assert.ok(queries.size > 0, 'Compatibility contract must document at least one exact package version.');
  for (const { packageName, version } of queries.values()) {
    const url = `${registryUrl.replace(/\/$/, '')}/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
    let response;
    try {
      response = await fetch(url, { headers: { accept: 'application/json' } });
    } catch (error) {
      throw new Error(`${packageName}@${version} does not exist exactly in ${registryUrl}: ${error.message}`);
    }

    if (!response.ok) {
      throw new Error(`${packageName}@${version} does not exist exactly in ${registryUrl} (HTTP ${response.status}).`);
    }
    const metadata = await response.json();
    if (metadata.version !== version) {
      throw new Error(
        `${packageName}@${version} does not exist exactly in ${registryUrl}; registry returned ${metadata.version ?? 'no version'}.`
      );
    }
    console.log(`PASS npm ${packageName}@${version}`);
  }
}

export function validateInstalledExports(consumerRoot, packageName) {
  const resolver = createRequire(path.join(consumerRoot, 'package.json'));
  const packageJsonPath = resolver.resolve(`${packageName}/package.json`);
  const packageRoot = path.dirname(packageJsonPath);
  const manifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const exportsMap = normalizeExports(manifest.exports);
  const specifiers = new Set();

  for (const [exportKey, target] of Object.entries(exportsMap)) {
    const targets = collectExportTargets(target);
    assert.ok(targets.length > 0, `${packageName} export ${exportKey} must expose at least one file target.`);

    if (exportKey.includes('*')) {
      const wildcardTargets = targets.filter((value) => value.includes('*'));
      assert.ok(wildcardTargets.length > 0, `${packageName} wildcard export ${exportKey} must map to a wildcard file target.`);
      const substitutions = new Set();
      for (const wildcardTarget of wildcardTargets) {
        for (const substitution of matchWildcardFiles(packageRoot, wildcardTarget)) {
          substitutions.add(substitution);
        }
      }
      assert.ok(substitutions.size > 0, `${packageName} wildcard export ${exportKey} must match a packed file.`);
      for (const substitution of substitutions) {
        const specifier = toPackageSpecifier(packageName, exportKey.replace('*', substitution));
        assertResolvedNonempty(resolver, specifier);
        specifiers.add(specifier);
      }
      continue;
    }

    for (const targetPath of targets) {
      const resolvedTarget = path.join(packageRoot, targetPath.replace(/^\.\//, ''));
      assertNonemptyFile(resolvedTarget, `${packageName} export ${exportKey}`);
    }
    const specifier = toPackageSpecifier(packageName, exportKey);
    assertResolvedNonempty(resolver, specifier);
    specifiers.add(specifier);
  }

  return [...specifiers].sort();
}

export function validateWorkflowSources(workflows, { candidatePackage = 'ui-style-kit-css' } = {}) {
  const pullRequestWorkflows = workflows.filter(({ source }) => /^\s*pull_request\s*:/m.test(source));
  assert.ok(pullRequestWorkflows.length > 0, 'At least one workflow must validate pull requests.');

  if (candidatePackage === 'ui-style-kit-css') {
    for (const workflow of workflows) {
      const preflightCommands = workflow.source.match(/^(?!\s*#).*\bnpm\s+run\s+release:preflight\b[^\r\n]*/gm) ?? [];
      for (const command of preflightCommands) {
        // UI release workflows must explicitly exempt only the staged UI version; companion workflows use their own package scripts.
        assert.match(
          command,
          /--candidate-package\s+ui-style-kit-css(?:\s|$)/,
          `${workflow.name} release:preflight must pass --candidate-package ui-style-kit-css.`
        );
      }
    }
  }

  const mutationPatterns = [
    { label: 'npm publish', pattern: /^(?!\s*(?:name:|#)).*\bnpm\s+publish\b/m },
    { label: 'npm version', pattern: /^(?!\s*(?:name:|#)).*\bnpm\s+version(?:\s|$)/m },
    { label: 'git push', pattern: /^(?!\s*(?:name:|#)).*\bgit\s+push(?:\s|$)/m },
    { label: 'git tag', pattern: /^(?!\s*(?:name:|#)).*\bgit\s+tag(?:\s|$)/m },
    {
      label: 'GitHub release',
      pattern: /(?:^\s*(?:-\s*)?uses:\s*(?:softprops\/action-gh-release|ncipollo\/release-action|actions\/create-release)@|^(?!\s*(?:name:|#)).*\bgh\s+release\b)/m
    },
    {
      label: 'deployment',
      pattern: /(?:^\s*(?:-\s*)?uses:\s*(?:actions\/(?:deploy-pages|upload-pages-artifact)|peaceiris\/actions-gh-pages|cloudflare\/wrangler-action|azure\/webapps-deploy)@|^(?!\s*(?:name:|#)).*\b(?:wrangler\s+(?:deploy|publish)|netlify\s+deploy|firebase\s+deploy|vercel(?:\s+deploy)?)\b)/m
    }
  ];

  for (const workflow of pullRequestWorkflows) {
    for (const mutation of mutationPatterns) {
      if (mutation.pattern.test(workflow.source)) {
        throw new Error(`pull-request workflow ${workflow.name} enables forbidden mutation: ${mutation.label}`);
      }
    }
  }
  assert.ok(
    pullRequestWorkflows.some(({ source }) => /\bnpm\s+run\s+release:preflight\b/.test(source)),
    'A pull-request workflow must execute npm run release:preflight.'
  );

  const releaseWorkflows = workflows.filter(({ name }) => /(?:npm-publish|release-version-alignment)\.ya?ml$/i.test(name));
  assert.ok(releaseWorkflows.length > 0, 'At least one package release workflow must be present.');
  for (const workflow of releaseWorkflows) {
    const preflightIndex = workflow.source.search(/\bnpm\s+run\s+release:preflight\b/);
    for (const mutation of mutationPatterns) {
      const mutationIndex = workflow.source.search(mutation.pattern);
      if (mutationIndex >= 0 && (preflightIndex < 0 || preflightIndex > mutationIndex)) {
        throw new Error(`${workflow.name} must run release:preflight before ${mutation.label}`);
      }
    }
    if (/npm-publish\.ya?ml$/i.test(workflow.name) && /\bnpm\s+publish\b/.test(workflow.source)) {
      assert.match(
        workflow.source,
        /^(?!\s*(?:name:|#)).*\bnpm\s+publish\b[^\r\n]*--ignore-scripts(?:\s|$)/m,
        `${workflow.name} must publish with --ignore-scripts after the explicit release preflight.`
      );
    }
  }
}

export async function runReleasePreflight(rawArgs = process.argv.slice(2)) {
  const options = parseArgs(rawArgs);
  const fixtureRoot = path.resolve(options.fixtureRoot ?? defaultRoot);
  const candidateRoot = path.resolve(options.candidateRoot ?? defaultRoot);
  const candidatePackage = options.candidatePackage ?? readJson(path.join(candidateRoot, 'package.json')).name;
  // Packaging may infer its local package, but registry exemption requires explicit active-candidate mode.
  const activeCandidatePackage = options.candidatePackage ?? null;
  const candidateKey = packageKeys[candidatePackage];
  assert.ok(candidateKey, `Unsupported ecosystem candidate package: ${candidatePackage}`);

  const contractPath = path.join(fixtureRoot, 'ecosystem-compatibility.json');
  const schemaPath = path.join(fixtureRoot, 'scripts', 'ecosystem-manifest-schema.mjs');
  const checkerPath = path.join(fixtureRoot, 'scripts', 'check-ecosystem-packs.mjs');
  for (const requiredPath of [contractPath, schemaPath, checkerPath]) {
    assertNonemptyFile(requiredPath, 'Reviewed ecosystem fixture');
  }

  const contract = readJson(contractPath);
  const schema = await import(pathToFileURL(schemaPath));
  schema.validateEcosystemCompatibility(contract);
  const candidateManifest = readJson(path.join(candidateRoot, 'manifest.json'));
  schema.validateSharedManifest(candidateManifest);

  const candidatePackageJson = readJson(path.join(candidateRoot, 'package.json'));
  assert.equal(candidatePackageJson.name, candidatePackage, 'Candidate package name must match the selected ecosystem package.');
  assert.equal(candidateManifest.name, candidatePackage, 'Candidate public manifest must match package.json name.');
  assert.equal(candidateManifest.version, candidatePackageJson.version, 'Candidate public manifest must match package.json version.');
  assert.equal(
    candidatePackageJson.version,
    contract.supportedCombinations.current[candidatePackage],
    `${candidatePackage} candidate version must equal the documented current version.`
  );

  validateRepositoryWorkflows(candidateRoot, candidatePackage);
  await verifyPublishedVersions(contract, {
    registryUrl: options.registryUrl,
    candidatePackage: activeCandidatePackage,
    candidateVersion: activeCandidatePackage ? candidatePackageJson.version : null
  });

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), tempPrefix));
  let completed = false;
  try {
    const tarball = packCandidate(candidateRoot, tempRoot);
    const consumerRoot = path.join(tempRoot, 'consumer');
    fs.mkdirSync(consumerRoot, { recursive: true });
    fs.writeFileSync(path.join(consumerRoot, 'package.json'), '{"name":"release-preflight-consumer","private":true}\n');
    runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--silent', tarball], {
      cwd: consumerRoot,
      env: { ...process.env, npm_config_dry_run: 'false' }
    });
    const exports = validateInstalledExports(consumerRoot, candidatePackage);
    console.log(`PASS packed exports ${candidatePackage} (${exports.length})`);

    if (!options.skipCleanInstall) {
      runCleanInstallMatrix({
        candidateKey,
        checkerPath,
        fixtureRoot,
        tarball,
        options
      });
    }
    completed = true;
  } finally {
    if (completed) {
      removeSafeTempDir(tempRoot);
    } else {
      console.error(`Release preflight temp artifacts retained at ${tempRoot}`);
    }
  }
  console.log(`Release preflight passed for ${candidatePackage}@${candidatePackageJson.version}.`);
}

function parseArgs(args) {
  const parsed = { skipCleanInstall: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const optionNames = {
      '--fixture-root': 'fixtureRoot',
      '--candidate-root': 'candidateRoot',
      '--candidate-package': 'candidatePackage',
      '--layout-repo': 'layoutRepo',
      '--interactive-repo': 'interactiveRepo',
      '--layout-docs-repo': 'layoutDocsRepo',
      '--interactive-docs-repo': 'interactiveDocsRepo',
      '--registry-url': 'registryUrl'
    };
    if (optionNames[arg]) {
      const value = args[(index += 1)];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      parsed[optionNames[arg]] = value;
    } else if (arg === '--skip-clean-install') {
      parsed.skipCleanInstall = true;
    } else {
      throw new Error(`Unknown release-preflight option: ${arg}`);
    }
  }
  return parsed;
}

function validateRepositoryWorkflows(root, candidatePackage) {
  const workflowRoot = path.join(root, '.github', 'workflows');
  const workflows = fs
    .readdirSync(workflowRoot)
    .filter((name) => /\.ya?ml$/i.test(name))
    .map((name) => ({ name, source: fs.readFileSync(path.join(workflowRoot, name), 'utf8') }));
  validateWorkflowSources(workflows, { candidatePackage });
  console.log(`PASS workflow policy (${workflows.length} files)`);
}

function packCandidate(candidateRoot, tempRoot) {
  const packRoot = path.join(tempRoot, 'pack');
  fs.mkdirSync(packRoot, { recursive: true });
  const output = runNpm(['pack', '--ignore-scripts', '--json', '--pack-destination', packRoot], {
    cwd: candidateRoot,
    // An outer npm pack --dry-run propagates this flag; verification must still materialize its isolated tarball.
    env: { ...process.env, npm_config_dry_run: 'false' }
  });
  const details = JSON.parse(output);
  assert.equal(details.length, 1, 'npm pack must produce exactly one candidate tarball.');
  const tarball = path.join(packRoot, path.basename(details[0].filename));
  assertNonemptyFile(tarball, 'Candidate tarball');
  return tarball;
}

function runCleanInstallMatrix({ candidateKey, checkerPath, fixtureRoot, tarball, options }) {
  const currentArgs = [checkerPath, '--matrix', 'current', `--${candidateKey}-spec`, tarball];
  if (candidateKey !== 'layout' && options.layoutRepo) currentArgs.push('--layout-repo', path.resolve(options.layoutRepo));
  if (candidateKey !== 'interactive' && options.interactiveRepo) {
    currentArgs.push('--interactive-repo', path.resolve(options.interactiveRepo));
  }
  if (options.layoutDocsRepo) currentArgs.push('--layout-docs-repo', path.resolve(options.layoutDocsRepo));
  if (options.interactiveDocsRepo) currentArgs.push('--interactive-docs-repo', path.resolve(options.interactiveDocsRepo));
  // Preserve the scenario-level PASS lines in CI so a failing or slow matrix is diagnosable.
  console.log(run(process.execPath, currentArgs, { cwd: fixtureRoot }));

  // Minimum packages come from npm, so this second matrix proves the declared floor independently of candidate files.
  console.log(run(process.execPath, [checkerPath, '--matrix', 'minimum', '--skip-docs'], { cwd: fixtureRoot }));
}

function normalizeExports(exportsField) {
  assert.ok(exportsField, 'package.json must declare exports.');
  if (typeof exportsField === 'string' || Array.isArray(exportsField)) return { '.': exportsField };
  const keys = Object.keys(exportsField);
  return keys.some((key) => key.startsWith('.')) ? exportsField : { '.': exportsField };
}

function collectExportTargets(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectExportTargets);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectExportTargets);
  return [];
}

function matchWildcardFiles(packageRoot, targetPattern) {
  const normalized = targetPattern.replace(/^\.\//, '').split('/').join(path.sep);
  const starIndex = normalized.indexOf('*');
  assert.ok(starIndex >= 0, `Expected wildcard target, got ${targetPattern}.`);
  const prefix = normalized.slice(0, starIndex);
  const suffix = normalized.slice(starIndex + 1);
  const directory = path.join(packageRoot, path.dirname(prefix));
  if (!fs.existsSync(directory)) return [];

  return listFiles(directory)
    .map((file) => path.relative(packageRoot, file))
    .filter((relative) => relative.startsWith(prefix) && relative.endsWith(suffix))
    .map((relative) => relative.slice(prefix.length, relative.length - suffix.length).split(path.sep).join('/'));
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function toPackageSpecifier(packageName, exportKey) {
  if (exportKey === '.') return packageName;
  return `${packageName}/${exportKey.replace(/^\.\//, '')}`;
}

function assertResolvedNonempty(resolver, specifier) {
  let resolved;
  try {
    resolved = resolver.resolve(specifier);
  } catch (error) {
    throw new Error(`${specifier} is not resolvable from the packed package: ${error.message}`);
  }
  assertNonemptyFile(resolved, specifier);
}

function assertNonemptyFile(file, label) {
  assert.ok(fs.existsSync(file) && fs.statSync(file).isFile() && fs.statSync(file).size > 0, `${label} must be a nonempty file: ${file}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function npmInvocation() {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return { command: process.execPath, baseArgs: [npmExecPath], shell: false };
  }
  return { command: process.platform === 'win32' ? 'npm.cmd' : 'npm', baseArgs: [], shell: process.platform === 'win32' };
}

function runNpm(args, options) {
  const npm = npmInvocation();
  return run(npm.command, [...npm.baseArgs, ...args], { ...options, shell: npm.shell });
}

function run(command, args, { cwd, shell = false, env = process.env }) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell, env });
  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, `cwd: ${cwd}`, result.error?.message, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
    );
  }
  return `${result.stdout}${result.stderr}`.trim();
}

function removeSafeTempDir(directory) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const target = fs.realpathSync(directory);
  if (!target.startsWith(`${tempRoot}${path.sep}`) || !path.basename(target).startsWith(tempPrefix)) {
    throw new Error(`Refusing to remove unexpected release-preflight directory: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runReleasePreflight();
}
