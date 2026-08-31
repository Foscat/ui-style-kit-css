import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertPackageImportsResolve, extractPackageImports } from './documented-imports.mjs';
import { validateEcosystemCompatibility, validateSharedManifest } from './ecosystem-manifest-schema.mjs';
import { resolveInteractiveSource } from './ecosystem-pack-sources.mjs';
import {
  comparePngSnapshots,
  DEFAULT_VISUAL_SNAPSHOT_COMPARISON
} from './visual-snapshot-comparator.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const ecosystemCompatibility = JSON.parse(fs.readFileSync(path.join(rootDir, 'ecosystem-compatibility.json'), 'utf8'));
const publicManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
validateEcosystemCompatibility(ecosystemCompatibility);
const canonicalEntrypoints = ecosystemCompatibility.canonicalImports.map(({ specifier }) => specifier);
const npmRunner = npmInvocation();
const tempPrefix = 'usk-ecosystem-packs-';
const visualSnapshotDir = path.join(rootDir, 'tests', 'snapshots', 'clean-install');
const visualSnapshotScenarios = new Set(['ui-interaction', 'ui-layout', 'all-three']);

const options = parseArgs(process.argv.slice(2));
const expectedPackageVersions = ecosystemCompatibility.supportedCombinations[options.matrix];
const publishedMinimumSpec = (packageName) =>
  options.matrix === 'minimum' ? `${packageName}@${expectedPackageVersions[packageName]}` : null;
const uiSpec =
  options.uiSpec ?? process.env.UI_STYLE_KIT_UI_SPEC ?? publishedMinimumSpec('ui-style-kit-css');
const layoutSpec =
  options.layoutSpec ?? process.env.UI_STYLE_KIT_LAYOUT_SPEC ?? publishedMinimumSpec('layout-style-css');
const layoutRepo = layoutSpec
  ? null
  : path.resolve(
      options.layoutRepo ?? process.env.UI_STYLE_KIT_LAYOUT_REPO ?? path.join(rootDir, '..', 'Layout-Style-CSS')
    );
const layoutDocsRepo = path.resolve(
  options.layoutDocsRepo ??
    process.env.UI_STYLE_KIT_LAYOUT_DOCS_REPO ??
    layoutRepo ??
    path.join(rootDir, '..', 'Layout-Style-CSS')
);
const interactiveOptions = {
  ...options,
  interactiveSpec:
    options.interactiveSpec ??
    process.env.UI_STYLE_KIT_INTERACTIVE_SPEC ??
    publishedMinimumSpec('interactive-surface-css')
};
const { interactiveSpec, interactiveRepo } = resolveInteractiveSource(interactiveOptions, process.env, rootDir);
// Source-only companion docs are authoritative only when their repository is
// the selected package source or an explicit matching docs root is supplied.
const interactiveDocsSource =
  options.interactiveDocsRepo ?? process.env.UI_STYLE_KIT_INTERACTIVE_DOCS_REPO ?? interactiveRepo;
const interactiveDocsRepo = interactiveDocsSource ? path.resolve(interactiveDocsSource) : null;

const documentationGroups = [
  {
    name: 'UI Style Kit current setup',
    root: rootDir,
    files: [
      'README.md',
      'CONTRIBUTING.md',
      'docs/ECOSYSTEM.md',
      'docs/NATIVE-ELEMENTS.md',
      'docs/PUBLISHING.md',
      'docs/STYLE-GUIDE.md',
      'docs/TOKENS.md',
      'wiki/Accessibility.md',
      'wiki/Class-API.md',
      'wiki/Ecosystem-Compatibility.md',
      'wiki/Home.md',
      'wiki/Installation-and-Setup.md',
      'wiki/Theming-Model.md',
      'wiki/UI-Systems.md'
    ]
  },
  {
    name: 'UI Style Kit supported deprecated setup',
    root: rootDir,
    files: ['docs/BRIDGE-MIGRATION.md', 'wiki/Bridge-Migration.md']
  },
  ...(interactiveDocsRepo
    ? [
        {
          name: 'Interactive Surface current setup',
          root: interactiveDocsRepo,
          files: [
            'README.md',
            'CONTRIBUTING.md',
            'wiki/Accessibility.md',
            'wiki/API-Reference.md',
            'wiki/Contributing.md',
            'wiki/FAQ.md',
            'wiki/Getting-Started.md',
            'wiki/Home.md',
            'wiki/Installation-and-Usage.md',
            'wiki/Publishing-and-Releases.md',
            'wiki/Roadmap.md',
            'wiki/Testing-and-Quality.md',
            'wiki/Token-Reference.md'
          ]
        }
      ]
    : []),
  {
    name: 'Layout Style current setup',
    root: layoutDocsRepo,
    files: [
      'README.md',
      'CONTRIBUTING.md',
      'docs/wiki/Contributing.md',
      'docs/wiki/Demo-And-GitHub-Pages.md',
      'docs/wiki/Getting-Started.md',
      'docs/wiki/Home.md',
      'docs/wiki/Installation-And-CDN.md',
      'docs/wiki/Layout-Primitives.md',
      'docs/wiki/Layout-Recipes.md',
      'docs/wiki/Layout-Styles.md',
      'docs/wiki/Release-And-Publishing.md',
      'docs/wiki/Security-And-Support.md',
      'docs/wiki/UI-Style-Kit-Compatibility.md'
    ]
  }
];

const historicalDocumentation = [
  'UI Style Kit CHANGELOG.md',
  'Interactive Surface CHANGELOG.md',
  'Layout Style CHANGELOG.md',
  'Layout Style docs/wiki/Migrating-To-2.0.md',
  'Layout Style docs/wiki/Migrating-To-3.0.md'
];

// The minimum supported UI release predates the nine presets added in 2.3.0.
// Its focused-export proof must therefore use the historical 2.1.0 surface.
const minimumUiPresetIds = new Set([
  'minimal-saas',
  'bento',
  'maximalist',
  'bauhaus',
  'tactile',
  'neumorphism',
  'retrofuturism',
  'brutalism',
  'cyberpunk',
  'y2k',
  'retro-glass'
]);
const matrixUiPresets =
  options.matrix === 'minimum'
    ? publicManifest.presets.filter(({ id }) => minimumUiPresetIds.has(id))
    : publicManifest.presets;

const uiEntrypoints = [
  'ui-style-kit-css',
  'ui-style-kit-css/package.json',
  'ui-style-kit-css/css',
  'ui-style-kit-css/min.css',
  'ui-style-kit-css/visual',
  'ui-style-kit-css/visual.css',
  'ui-style-kit-css/visual.min.css',
  ...matrixUiPresets.map(({ id }) => `ui-style-kit-css/visual/${id}.css`),
  'ui-style-kit-css/interactive-surface-theme',
  'ui-style-kit-css/interactive-surface-theme.css',
  'ui-style-kit-css/interactive-surface-bridge',
  'ui-style-kit-css/interactive-surface-bridge.css',
  'ui-style-kit-css/with-bridge',
  'ui-style-kit-css/with-bridge.css',
  'ui-style-kit-css/manifest.json'
];

const layoutEntrypoints = [
  'layout-style-css',
  'layout-style-css/package.json',
  'layout-style-css/manifest.json',
  ...(options.matrix === 'current' ? ['layout-style-css/personalities.json'] : []),
  'layout-style-css/min.css',
  'layout-style-css/core.css',
  'layout-style-css/foundation.css',
  'layout-style-css/wrappers.css',
  'layout-style-css/primitives.css',
  'layout-style-css/recipes.css',
  'layout-style-css/utilities.css',
  'layout-style-css/personalities.css',
  'layout-style-css/personalities/minimal-saas.css',
  'layout-style-css/personalities/bento.css'
];

const interactiveEntrypoints = [
  'interactive-surface-css',
  'interactive-surface-css/manifest.json',
  'interactive-surface-css/package.json',
  'interactive-surface-css/index.cjs',
  'interactive-surface-css/interactive-surface.css',
  'interactive-surface-css/state-core.css',
  'interactive-surface-css/standalone-preset.css'
];

const ecosystemScenarios = [
  {
    name: 'ui-only',
    packages: ['ui'],
    entrypoints: uiEntrypoints,
    browserImports: ['ui-style-kit-css/visual.css']
  },
  {
    name: 'interaction-only',
    packages: ['interactive'],
    entrypoints: interactiveEntrypoints,
    browserImports: ['interactive-surface-css/interactive-surface.css']
  },
  {
    name: 'layout-only',
    packages: ['layout'],
    entrypoints: layoutEntrypoints,
    browserImports: ['layout-style-css']
  },
  {
    name: 'ui-interaction',
    packages: ['ui', 'interactive'],
    entrypoints: [
      'ui-style-kit-css/visual.css',
      'ui-style-kit-css/interactive-surface-theme.css',
      'interactive-surface-css/state-core.css',
      'ui-style-kit-css/with-bridge.css',
      'ui-style-kit-css/interactive-surface-bridge.css',
      'interactive-surface-css/interactive-surface.css'
    ],
    browserImports: [
      'ui-style-kit-css/visual.css',
      'ui-style-kit-css/interactive-surface-theme.css',
      'interactive-surface-css/state-core.css'
    ]
  },
  {
    name: 'ui-layout',
    packages: ['ui', 'layout'],
    entrypoints: [
      'ui-style-kit-css/visual.css',
      'layout-style-css',
      'ui-style-kit-css'
    ],
    browserImports: ['ui-style-kit-css/visual.css', 'layout-style-css']
  },
  {
    name: 'interaction-layout',
    packages: ['layout', 'interactive'],
    entrypoints: [
      'layout-style-css',
      'layout-style-css/core.css',
      'interactive-surface-css/state-core.css',
      'interactive-surface-css/interactive-surface.css'
    ],
    browserImports: ['interactive-surface-css/interactive-surface.css', 'layout-style-css']
  },
  {
    name: 'all-three',
    packages: ['ui', 'interactive', 'layout'],
    entrypoints: [
      ...canonicalEntrypoints,
      'ui-style-kit-css',
      'ui-style-kit-css/with-bridge.css',
      'ui-style-kit-css/interactive-surface-bridge.css',
      'interactive-surface-css/interactive-surface.css',
      'ui-style-kit-css/manifest.json',
      'layout-style-css/manifest.json',
      'interactive-surface-css/manifest.json'
    ],
    browserImports: canonicalEntrypoints
  }
];

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), tempPrefix));
const packsDir = path.join(tempDir, 'packs');
let completed = false;

try {
  const scenarios = selectScenarios(options.scenarios);
  const requiredPackages = new Set(scenarios.flatMap(({ packages }) => packages));
  fs.mkdirSync(packsDir, { recursive: true });
  if (requiredPackages.has('ui') && !uiSpec) {
    assertDirectory(rootDir, 'UI Style Kit repo');
  }
  if (requiredPackages.has('layout') && !layoutSpec) {
    assertDirectory(layoutRepo, 'Layout Style CSS repo');
  }
  if (requiredPackages.has('interactive') && !interactiveSpec) {
    assertDirectory(interactiveRepo, 'Interactive Surface CSS repo');
  }
  if (!options.skipDocs) {
    assertDirectory(layoutDocsRepo, 'Layout Style CSS documentation repo');
    if (interactiveDocsRepo) {
      assertDirectory(interactiveDocsRepo, 'Interactive Surface CSS documentation repo');
    }
  }

  console.log(`Compatibility matrix: ${options.matrix}`);
  console.log(`Using UI Style Kit package: ${uiSpec ?? rootDir}`);
  console.log(`Using Layout Style CSS package: ${layoutSpec ?? layoutRepo}`);
  console.log(`Using Interactive Surface package: ${interactiveSpec ?? interactiveRepo}`);

  const tarballs = {};
  if (requiredPackages.has('ui')) {
    tarballs.ui = uiSpec ? packPackageSpec(uiSpec, packsDir) : packLocalPackage(rootDir, packsDir);
  }
  if (requiredPackages.has('layout')) {
    tarballs.layout = layoutSpec ? packPackageSpec(layoutSpec, packsDir) : packLocalPackage(layoutRepo, packsDir);
  }
  if (requiredPackages.has('interactive')) {
    tarballs.interactive = interactiveSpec
      ? packPackageSpec(interactiveSpec, packsDir)
      : packLocalPackage(interactiveRepo, packsDir);
  }

  let allThreeDir;
  for (const scenario of scenarios) {
    const scenarioDir = await runScenario({
      name: scenario.name,
      packageNames: scenario.packages,
      packagePaths: scenario.packages.map((name) => tarballs[name]),
      entrypoints:
        options.matrix === 'minimum'
          ? scenario.entrypoints.filter((entrypoint) => !entrypoint.endsWith('/manifest.json'))
          : scenario.entrypoints
    });
    if (scenario.name === 'all-three') {
      allThreeDir = scenarioDir;
    }
    if (!options.skipBrowser) {
      await runBrowserSmoke(scenarioDir, scenario);
    }
  }

  if (!options.skipDocs) {
    assert.ok(allThreeDir, 'Documentation validation requires the all-three scenario.');
    validateDocumentedImports(allThreeDir);
  }

  completed = true;
  console.log(`Packed ecosystem compatibility checks passed for the ${options.matrix} matrix.`);
} finally {
  if (completed && !options.keepTemp) {
    removeSafeTempDir(tempDir);
  } else {
    console.error(`Packed ecosystem temp artifacts retained at ${tempDir}`);
  }
}

function parseArgs(args) {
  const parsed = {
    keepTemp: false,
    matrix: 'current',
    scenarios: [],
    skipBrowser: false,
    skipDocs: false,
    updateSnapshots: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--ui-spec') {
      parsed.uiSpec = readValue(args, (index += 1), arg);
    } else if (arg === '--layout-repo') {
      parsed.layoutRepo = readValue(args, (index += 1), arg);
    } else if (arg === '--layout-spec') {
      parsed.layoutSpec = readValue(args, (index += 1), arg);
    } else if (arg === '--layout-docs-repo') {
      parsed.layoutDocsRepo = readValue(args, (index += 1), arg);
    } else if (arg === '--interactive-spec') {
      parsed.interactiveSpec = readValue(args, (index += 1), arg);
    } else if (arg === '--interactive-repo') {
      parsed.interactiveRepo = readValue(args, (index += 1), arg);
    } else if (arg === '--interactive-docs-repo') {
      parsed.interactiveDocsRepo = readValue(args, (index += 1), arg);
    } else if (arg === '--keep-temp') {
      parsed.keepTemp = true;
    } else if (arg === '--matrix') {
      parsed.matrix = readValue(args, (index += 1), arg);
    } else if (arg === '--scenario') {
      parsed.scenarios.push(readValue(args, (index += 1), arg));
    } else if (arg === '--skip-browser') {
      parsed.skipBrowser = true;
    } else if (arg === '--skip-docs') {
      parsed.skipDocs = true;
    } else if (arg === '--update-snapshots') {
      parsed.updateSnapshots = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!['current', 'minimum'].includes(parsed.matrix)) {
    throw new Error(`--matrix must be current or minimum, got ${parsed.matrix}.`);
  }

  // Keep source selection explicit so release checks do not accidentally mix a
  // checked-out Layout branch with the final published package.
  if (parsed.layoutRepo && parsed.layoutSpec) {
    throw new Error('Use either --layout-repo or --layout-spec, not both.');
  }
  if (parsed.interactiveRepo && parsed.interactiveSpec) {
    throw new Error('Use either --interactive-repo or --interactive-spec, not both.');
  }

  return parsed;
}

function selectScenarios(requestedNames) {
  if (requestedNames.length === 0) {
    return ecosystemScenarios;
  }

  const requested = new Set(requestedNames);
  const selected = ecosystemScenarios.filter(({ name }) => requested.has(name));
  const unknown = [...requested].filter((name) => !selected.some((scenario) => scenario.name === name));
  if (unknown.length > 0) {
    throw new Error(`Unknown scenario: ${unknown.join(', ')}`);
  }
  return selected;
}

function readValue(args, index, optionName) {
  const value = args[index];
  if (!value || value.startsWith('--')) {
    throw new Error(`${optionName} requires a value.`);
  }
  return value;
}

function assertDirectory(directory, label) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`${label} not found at ${directory}. Pass --layout-repo or set UI_STYLE_KIT_LAYOUT_REPO if needed.`);
  }
}

function npmInvocation() {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return {
      command: process.execPath,
      baseArgs: [npmExecPath],
      shell: false
    };
  }

  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    baseArgs: [],
    shell: process.platform === 'win32'
  };
}

function run(command, args, { cwd }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: npmRunner.shell
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(' ')}`,
        `cwd: ${cwd}`,
        result.error?.message,
        result.stdout,
        result.stderr
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  return `${result.stdout}${result.stderr}`;
}

function packLocalPackage(packageDir, destination) {
  const output = runNpm(['pack', '--pack-destination', destination], { cwd: packageDir });
  return resolvePackedTarball(output, destination);
}

function packPackageSpec(specifier, destination) {
  const output = runNpm(['pack', specifier, '--pack-destination', destination], { cwd: rootDir });
  return resolvePackedTarball(output, destination);
}

function runNpm(args, { cwd }) {
  return run(npmRunner.command, [...npmRunner.baseArgs, ...args], { cwd });
}

function resolvePackedTarball(output, destination) {
  const tarballName = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .reverse()
    .map((line) => line.match(/(?:^|\s)([a-z0-9._@-]+\.tgz)$/i)?.[1])
    .find(Boolean);

  if (!tarballName) {
    throw new Error(`Could not find packed tarball name in npm output:\n${output}`);
  }

  const tarballPath = path.join(destination, path.basename(tarballName));
  if (!fs.existsSync(tarballPath)) {
    throw new Error(`Packed tarball was not written: ${tarballPath}`);
  }
  return tarballPath;
}

async function runScenario({ name, packageNames, packagePaths, entrypoints }) {
  const scenarioDir = path.join(tempDir, name);
  fs.mkdirSync(scenarioDir, { recursive: true });
  fs.writeFileSync(
    path.join(scenarioDir, 'package.json'),
    `${JSON.stringify({ name: `ui-style-kit-${name}`, private: true, type: 'module' }, null, 2)}\n`
  );

  // Installing the packed artifacts in a fresh consumer catches broken exports and missing files.
  runNpm(['install', '--ignore-scripts', '--silent', ...packagePaths], { cwd: scenarioDir });
  validateEntrypoints(scenarioDir, entrypoints, name);
  validateInstalledPackageVersions(scenarioDir, packageNames, name);
  console.log(`PASS ${name}`);
  return scenarioDir;
}

function validateInstalledPackageVersions(scenarioDir, packageNames, scenarioName) {
  const resolver = createRequire(path.join(scenarioDir, 'package.json'));

  for (const packageKey of packageNames) {
    const packageName = {
      ui: 'ui-style-kit-css',
      interactive: 'interactive-surface-css',
      layout: 'layout-style-css'
    }[packageKey];
    let cursor = path.dirname(resolver.resolve(packageName));
    let packagePath;

    while (cursor.startsWith(scenarioDir)) {
      const candidate = path.join(cursor, 'package.json');
      if (fs.existsSync(candidate)) {
        const candidateManifest = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (candidateManifest.name === packageName) {
          packagePath = candidate;
          break;
        }
      }
      const parent = path.dirname(cursor);
      if (parent === cursor) {
        break;
      }
      cursor = parent;
    }

    assert.ok(packagePath, `${scenarioName}: could not locate installed metadata for ${packageName}`);
    const installed = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    assert.equal(
      installed.version,
      expectedPackageVersions[packageName],
      `${scenarioName}: installed ${packageName} version drifted`
    );
  }
}

/**
 * Validates that every declared package entrypoint resolves to the expected artifact and version.
 *
 * @param {string} scenarioDir - Fresh consumer directory containing installed package tarballs.
 * @param {string[]} entrypoints - Public package specifiers that must resolve.
 * @param {string} scenarioName - Human-readable scenario name used in assertion messages.
 * @returns {void}
 */
function validateEntrypoints(scenarioDir, entrypoints, scenarioName) {
  const resolver = createRequire(path.join(scenarioDir, 'package.json'));

  for (const id of entrypoints) {
    const resolved = resolver.resolve(id);
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      throw new Error(`${scenarioName}: ${id} did not resolve to a file.`);
    }

    const bytes = fs.readFileSync(resolved);
    if (bytes.length === 0) {
      throw new Error(`${scenarioName}: ${id} resolved to an empty file.`);
    }

    const text = bytes.toString('utf8');
    const cssLike = text.includes('{') || /@(?:import|layer)\b/.test(text);
    if ((id.endsWith('.css') || resolved.endsWith('.css')) && !cssLike) {
      throw new Error(`${scenarioName}: ${id} is not CSS-like.`);
    }

    if (id.endsWith('/manifest.json')) {
      validateEcosystemManifest(id, JSON.parse(text));
    }

    if (id.endsWith('/package.json')) {
      const packageName = id.replace('/package.json', '');
      const packageMetadata = JSON.parse(text);
      assert.equal(
        packageMetadata.version,
        expectedPackageVersions[packageName],
        `${scenarioName}: ${id} version drifted`
      );
    }
  }
}

function validateEcosystemManifest(id, manifest) {
  const name = id.replace('/manifest.json', '');
  const expected = { name, version: expectedPackageVersions[name] };

  assert.ok(expected.version, `Unexpected ecosystem manifest entry point: ${id}`);
  validateSharedManifest(manifest);
  assert.equal(manifest.name, expected.name, `${id} must declare its package name`);
  assert.equal(manifest.version, expected.version, `${id} must declare its package version`);
}

function validateDocumentedImports(scenarioDir) {
  const resolver = createRequire(path.join(scenarioDir, 'package.json'));
  const failures = [];
  let importCount = 0;

  for (const group of documentationGroups) {
    for (const relativePath of group.files) {
      const documentPath = path.join(group.root, relativePath);
      if (!fs.existsSync(documentPath)) {
        failures.push(`${group.name}: maintained document is missing: ${relativePath}`);
        continue;
      }

      const markdown = fs.readFileSync(documentPath, 'utf8');
      const imports = extractPackageImports(markdown);
      importCount += imports.length;
      try {
        assertPackageImportsResolve(markdown, resolver, `${group.name}/${relativePath}`);
      } catch (error) {
        failures.push(error.message);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Documented package import validation failed:\n${failures.join('\n')}`);
  }

  console.log(`PASS documented imports (${importCount} references across current and supported deprecated guides)`);
  console.log(`INFO historical/migration documents reviewed separately: ${historicalDocumentation.join(', ')}`);
}

/**
 * Exercises an installed ecosystem scenario in Chromium and verifies current visual baselines.
 *
 * @param {string} scenarioDir - Fresh consumer directory containing the scenario packages.
 * @param {object} scenario - Scenario definition with package and import metadata.
 * @returns {Promise<void>} Resolves after browser behavior and applicable snapshots pass.
 */
async function runBrowserSmoke(scenarioDir, scenario) {
  const resolver = createRequire(path.join(scenarioDir, 'package.json'));
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      reducedMotion: 'no-preference',
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    const issues = [];
    const unexpectedRequests = [];
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        issues.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
    await page.route('**/*', async (route) => {
      unexpectedRequests.push(route.request().url());
      await route.abort('internetdisconnected');
    });

    // The consumer supplies only neutral test geometry; package CSS owns every asserted behavior.
    await page.setContent(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; }
    .contract-stage { min-block-size: 520px; }
    .contract-cells > * { min-block-size: 72px; }
    #visual-snapshot { inline-size: 720px; min-block-size: 260px; padding: 24px; overflow: hidden; }
    #visual-snapshot .snapshot-action { inline-size: 180px; block-size: 56px; }
    #visual-snapshot .snapshot-cell { min-block-size: 72px; }
  </style>
  <style>${cssFor(resolver, scenario.browserImports)}</style>
</head>
<body class="ly-root" tabindex="-1" data-ly-layout="minimal-saas" data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <main id="wrapper" class="contract-stage ly-wrapper ly-wrapper--wide">
    <section id="stack" class="ly-stack">
      <button id="focus" class="saas-button saas-button-primary interactive-surface variant-primary" type="button">Focused action</button>
      <button id="disabled" class="saas-button interactive-surface variant-subtle" type="button" disabled>Disabled</button>
      <button id="loading" class="saas-button interactive-surface variant-primary" type="button" aria-busy="true">Loading</button>
      <button id="selected" class="saas-button interactive-surface variant-secondary" type="button" role="option" aria-selected="true">Selected</button>
      <button id="persistent" class="saas-button interactive-surface variant-primary" type="button" aria-pressed="true">Persistent</button>
      <label class="saas-field">Native field<input id="field" class="saas-input" type="text" value="Packed consumer"></label>
      <article id="card" class="saas-card interactive-surface level-1 ly-stack">
        <h2>Clean consumer</h2>
        <p>Public tarball entry points only.</p>
      </article>
      <section id="recipe" class="contract-cells" data-ly-recipe="card-grid">
        <article>One</article><article>Two</article><article>Three</article>
      </section>
      <section id="grid" class="ly-grid ly-cols-3"><article>Grid one</article><article>Grid two</article></section>
      <section id="visual-snapshot" class="saas-card ly-stack" aria-label="Visual regression fixture">
        <div class="contract-cells" data-ly-recipe="card-grid">
          <button class="snapshot-action saas-button saas-button-primary interactive-surface variant-primary" type="button" aria-pressed="true" aria-label="Selected action"></button>
          <button class="snapshot-action saas-button interactive-surface variant-subtle" type="button" disabled aria-label="Disabled action"></button>
          <article class="snapshot-cell saas-card interactive-surface level-1" aria-label="Surface"></article>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`);
    await page.waitForLoadState('domcontentloaded');

    const packages = new Set(scenario.packages);
    if (packages.has('ui')) {
      const uiStyles = await page.evaluate(() => {
        const bodyStyle = getComputedStyle(document.body);
        const buttonStyle = getComputedStyle(document.querySelector('#focus'));
        const cardStyle = getComputedStyle(document.querySelector('#card'));
        const fieldStyle = getComputedStyle(document.querySelector('#field'));
        return {
          backgroundToken: bodyStyle.getPropertyValue('--usk-bg-rgb').trim(),
          primaryToken: bodyStyle.getPropertyValue('--usk-primary-rgb').trim(),
          buttonBackground: buttonStyle.backgroundColor,
          buttonColor: buttonStyle.color,
          buttonHeight: document.querySelector('#focus').getBoundingClientRect().height,
          cardBackground: cardStyle.backgroundColor,
          cardColor: cardStyle.color,
          fieldHeight: document.querySelector('#field').getBoundingClientRect().height,
          fieldBackground: fieldStyle.backgroundColor
        };
      });
      assert.equal(uiStyles.backgroundToken, '241 245 255', `${scenario.name} did not apply the selected theme`);
      assert.equal(uiStyles.primaryToken, '64 94 184', `${scenario.name} primary token drifted`);
      const expectedButtonPaint = packages.has('interactive') ? 'rgb(223, 231, 246)' : 'rgb(64, 94, 184)';
      assert.equal(uiStyles.buttonBackground, expectedButtonPaint, `${scenario.name} primary button paint drifted`);
      assert.notEqual(uiStyles.buttonColor, uiStyles.buttonBackground, `${scenario.name} button text collapsed into its surface`);
      assert.ok(uiStyles.buttonHeight >= 44, `${scenario.name} button height ${uiStyles.buttonHeight}`);
      const expectedCardPaint = packages.has('interactive')
        ? 'rgb(223, 231, 246)'
        : 'rgba(255, 255, 255, 0.98)';
      assert.equal(uiStyles.cardBackground, expectedCardPaint, `${scenario.name} card paint drifted`);
      assert.notEqual(uiStyles.cardColor, uiStyles.cardBackground, `${scenario.name} card text collapsed into its surface`);
      assert.ok(uiStyles.fieldHeight >= 46, `${scenario.name} native field height ${uiStyles.fieldHeight}`);
      assert.notEqual(uiStyles.fieldBackground, 'rgba(0, 0, 0, 0)', `${scenario.name} native field is transparent`);
    }

    if (packages.has('layout')) {
      const layoutStyles = await page.evaluate(() => {
        const rootStyle = getComputedStyle(document.body);
        const wrapperStyle = getComputedStyle(document.querySelector('#wrapper'));
        const stackStyle = getComputedStyle(document.querySelector('#stack'));
        const recipeStyle = getComputedStyle(document.querySelector('#recipe'));
        const gridStyle = getComputedStyle(document.querySelector('#grid'));
        return {
          personalityWrapperMax: rootStyle.getPropertyValue('--ly-personality-wrapper-max').trim(),
          wrapperContainerName: wrapperStyle.containerName,
          wrapperContainerType: wrapperStyle.containerType,
          wrapperPadding: parseFloat(wrapperStyle.paddingInlineStart),
          stackDisplay: stackStyle.display,
          stackDirection: stackStyle.flexDirection,
          stackGap: parseFloat(stackStyle.gap),
          recipeDisplay: recipeStyle.display,
          recipeColumns: recipeStyle.gridTemplateColumns,
          gridDisplay: gridStyle.display
        };
      });
      assert.equal(layoutStyles.personalityWrapperMax, '88rem', `${scenario.name} personality token drifted`);
      assert.equal(layoutStyles.wrapperContainerName, 'ly-scope', `${scenario.name} wrapper container name drifted`);
      assert.equal(layoutStyles.wrapperContainerType, 'inline-size', `${scenario.name} wrapper container type drifted`);
      assert.ok(layoutStyles.wrapperPadding >= 16, `${scenario.name} wrapper lost its gutter`);
      assert.equal(layoutStyles.stackDisplay, 'flex', `${scenario.name} stack is not a flex composition`);
      assert.equal(layoutStyles.stackDirection, 'column', `${scenario.name} stack direction drifted`);
      assert.ok(layoutStyles.stackGap > 0, `${scenario.name} stack gap is missing`);
      assert.equal(layoutStyles.recipeDisplay, 'grid', `${scenario.name} card-grid recipe is not grid`);
      assert.notEqual(layoutStyles.recipeColumns, 'none', `${scenario.name} card-grid has no columns`);
      assert.equal(layoutStyles.gridDisplay, 'grid', `${scenario.name} grid primitive is not grid`);
    }

    if (packages.has('interactive')) {
      await page.evaluate(() => document.body.focus());
      await page.keyboard.press('Tab');
      await page.waitForTimeout(180);
      const beforeMove = await readInteractionStyles(page);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(180);
      const afterMove = await readInteractionStyles(page);

      assert.equal(beforeMove.activeId, 'focus', `${scenario.name} keyboard focus did not reach the surface`);
      assert.equal(beforeMove.focusOutlineStyle, 'solid', `${scenario.name} focus outline is not solid`);
      assert.equal(beforeMove.focusOutlineWidth, '2px', `${scenario.name} focus outline width drifted`);
      assert.notEqual(beforeMove.focusOutlineColor, 'rgba(0, 0, 0, 0)', `${scenario.name} focus outline is transparent`);
      assert.equal(beforeMove.disabledPointerEvents, 'none', `${scenario.name} disabled surface still receives pointer events`);
      assert.ok(
        beforeMove.disabledOpacity >= 0.5 && beforeMove.disabledOpacity < 1,
        `${scenario.name} disabled opacity ${beforeMove.disabledOpacity}`
      );
      assert.ok(beforeMove.loadingLayerOpacity > 0, `${scenario.name} loading state layer is missing`);
      assert.ok(beforeMove.selectedLayerOpacity > 0, `${scenario.name} selected state layer is missing`);
      assert.ok(beforeMove.persistentLayerOpacity > 0, `${scenario.name} persistent state layer is missing`);
      assert.equal(
        afterMove.persistentLayerOpacity,
        beforeMove.persistentLayerOpacity,
        `${scenario.name} persistent state vanished after keyboard focus moved`
      );
      assert.notEqual(beforeMove.transitionProperty, 'all', `${scenario.name} transition fell back to all`);
      assert.notEqual(beforeMove.transitionDuration, '0s', `${scenario.name} normal motion is disabled`);
    }

    assert.equal(issues.length, 0, `${scenario.name} emitted browser issues: ${issues.join('; ')}`);
    assert.deepEqual(
      unexpectedRequests,
      [],
      `${scenario.name} attempted unexpected network requests: ${unexpectedRequests.join(', ')}`
    );
    // Minimum releases prove compatibility, while current releases own the
    // evolving visual baseline used for pixel-level regression detection.
    if (options.matrix === 'current' && visualSnapshotScenarios.has(scenario.name)) {
      await verifyVisualSnapshot(page, scenario.name);
    }
    console.log(`PASS browser ${scenario.name}`);
    await context.close();
  } finally {
    await browser.close();
  }
}

async function verifyVisualSnapshot(page, scenarioName) {
  // Disable transient pixels while keeping package paint, state, and layout geometry intact.
  await page.addStyleTag({
    content:
      '#visual-snapshot *, #visual-snapshot *::before, #visual-snapshot *::after { animation: none !important; caret-color: transparent !important; transition: none !important; }'
  });
  const actual = await page.locator('#visual-snapshot').screenshot({
    animations: 'disabled',
    caret: 'hide',
    scale: 'css'
  });
  const snapshotPath = path.join(visualSnapshotDir, `${scenarioName}.png`);

  if (options.updateSnapshots) {
    fs.mkdirSync(visualSnapshotDir, { recursive: true });
    fs.writeFileSync(snapshotPath, actual);
    console.log(`UPDATED visual snapshot ${scenarioName}`);
    return;
  }

  if (!fs.existsSync(snapshotPath)) {
    throw new Error(
      `Missing visual snapshot for ${scenarioName}. Run the current matrix with --update-snapshots and review the image.`
    );
  }

  const expected = fs.readFileSync(snapshotPath);
  const comparison = comparePngSnapshots(actual, expected);
  if (!comparison.pass) {
    const actualPath = path.join(tempDir, `${scenarioName}-actual.png`);
    const diffPath = path.join(tempDir, `${scenarioName}-diff.png`);
    fs.writeFileSync(actualPath, actual);
    fs.writeFileSync(diffPath, comparison.diffPng);
    const detail =
      comparison.reason === 'dimension-mismatch'
        ? `expected ${comparison.expectedDimensions.width}x${comparison.expectedDimensions.height}, got ${comparison.actualDimensions.width}x${comparison.actualDimensions.height}`
        : `${comparison.diffPixels} pixels differed; allowance ${comparison.allowedDiffPixels} (${(
            DEFAULT_VISUAL_SNAPSHOT_COMPARISON.maxDiffPixelRatio * 100
          ).toFixed(2)}%)`;
    throw new Error(
      `Visual snapshot mismatch for ${scenarioName}: ${detail}. Actual image: ${actualPath}. Diff image: ${diffPath}`
    );
  }
  console.log(
    `PASS visual snapshot ${scenarioName} (${comparison.diffPixels}/${comparison.allowedDiffPixels} differing pixels)`
  );
}

async function readInteractionStyles(page) {
  return page.evaluate(() => {
    const focusStyle = getComputedStyle(document.querySelector('#focus'));
    const disabledStyle = getComputedStyle(document.querySelector('#disabled'));
    return {
      activeId: document.activeElement?.id ?? '',
      focusOutlineStyle: focusStyle.outlineStyle,
      focusOutlineWidth: focusStyle.outlineWidth,
      focusOutlineColor: focusStyle.outlineColor,
      disabledPointerEvents: disabledStyle.pointerEvents,
      disabledOpacity: Number.parseFloat(disabledStyle.opacity),
      loadingLayerOpacity: Number.parseFloat(getComputedStyle(document.querySelector('#loading'), '::before').opacity),
      selectedLayerOpacity: Number.parseFloat(getComputedStyle(document.querySelector('#selected'), '::before').opacity),
      persistentLayerOpacity: Number.parseFloat(getComputedStyle(document.querySelector('#persistent'), '::before').opacity),
      transitionProperty: focusStyle.transitionProperty,
      transitionDuration: focusStyle.transitionDuration
    };
  });
}

function cssFor(resolver, imports) {
  return imports
    .map((id) => `/* ${id} */\n${fs.readFileSync(resolver.resolve(id), 'utf8')}`)
    .join('\n');
}

function removeSafeTempDir(directory) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const target = fs.realpathSync(directory);
  if (!target.startsWith(`${tempRoot}${path.sep}`) || !path.basename(target).startsWith(tempPrefix)) {
    throw new Error(`Refusing to remove unexpected temp directory: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}
