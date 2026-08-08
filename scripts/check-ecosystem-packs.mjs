import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractPackageImports } from './documented-imports.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const npmRunner = npmInvocation();
const tempPrefix = 'usk-ecosystem-packs-';

const options = parseArgs(process.argv.slice(2));
const uiSpec = options.uiSpec ?? process.env.UI_STYLE_KIT_UI_SPEC;
const layoutSpec = options.layoutSpec ?? process.env.UI_STYLE_KIT_LAYOUT_SPEC;
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
const interactiveSpec =
  options.interactiveSpec ??
  process.env.UI_STYLE_KIT_INTERACTIVE_SPEC ??
  (options.interactiveRepo ? null : 'interactive-surface-css@1.5.0');
const interactiveRepo = interactiveSpec
  ? null
  : path.resolve(
      options.interactiveRepo ??
        process.env.UI_STYLE_KIT_INTERACTIVE_REPO ??
        path.join(rootDir, '..', 'Interactive-Surface-CSS')
    );
const interactiveDocsRepo = path.resolve(
  options.interactiveDocsRepo ??
    process.env.UI_STYLE_KIT_INTERACTIVE_DOCS_REPO ??
    interactiveRepo ??
    path.join(rootDir, '..', 'Interactive-Surface-CSS')
);

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
  },
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

const uiEntrypoints = [
  'ui-style-kit-css',
  'ui-style-kit-css/css',
  'ui-style-kit-css/min.css',
  'ui-style-kit-css/visual',
  'ui-style-kit-css/visual.css',
  'ui-style-kit-css/visual.min.css',
  'ui-style-kit-css/visual/minimal-saas.css',
  'ui-style-kit-css/visual/bento.css',
  'ui-style-kit-css/visual/maximalist.css',
  'ui-style-kit-css/visual/bauhaus.css',
  'ui-style-kit-css/visual/tactile.css',
  'ui-style-kit-css/visual/neumorphism.css',
  'ui-style-kit-css/visual/retrofuturism.css',
  'ui-style-kit-css/visual/brutalism.css',
  'ui-style-kit-css/visual/cyberpunk.css',
  'ui-style-kit-css/visual/y2k.css',
  'ui-style-kit-css/visual/retro-glass.css',
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
  'layout-style-css/manifest.json',
  'layout-style-css/min.css',
  'layout-style-css/core.css',
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

const pairedScenarios = [
  {
    name: 'ui-plus-interactive',
    packages: ['ui', 'interactive'],
    entrypoints: [
      'ui-style-kit-css/visual.css',
      'ui-style-kit-css/interactive-surface-theme.css',
      'interactive-surface-css/state-core.css',
      'ui-style-kit-css/with-bridge.css',
      'ui-style-kit-css/interactive-surface-bridge.css',
      'interactive-surface-css/interactive-surface.css'
    ]
  },
  {
    name: 'ui-plus-layout',
    packages: ['ui', 'layout'],
    entrypoints: [
      'ui-style-kit-css/visual.css',
      'layout-style-css',
      'ui-style-kit-css'
    ]
  },
  {
    name: 'layout-plus-interactive',
    packages: ['layout', 'interactive'],
    entrypoints: [
      'layout-style-css',
      'layout-style-css/core.css',
      'interactive-surface-css/state-core.css',
      'interactive-surface-css/interactive-surface.css'
    ]
  }
];

const allThreeEntrypoints = [
  'ui-style-kit-css/visual.css',
  'ui-style-kit-css/interactive-surface-theme.css',
  'interactive-surface-css/state-core.css',
  'layout-style-css',
  'ui-style-kit-css',
  'ui-style-kit-css/with-bridge.css',
  'ui-style-kit-css/interactive-surface-bridge.css',
  'interactive-surface-css/interactive-surface.css',
  'ui-style-kit-css/manifest.json',
  'layout-style-css/manifest.json',
  'interactive-surface-css/manifest.json'
];

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), tempPrefix));
const packsDir = path.join(tempDir, 'packs');
let completed = false;

try {
  fs.mkdirSync(packsDir, { recursive: true });
  if (!uiSpec) {
    assertDirectory(rootDir, 'UI Style Kit repo');
  }
  if (!layoutSpec) {
    assertDirectory(layoutRepo, 'Layout Style CSS repo');
  }
  if (!interactiveSpec) {
    assertDirectory(interactiveRepo, 'Interactive Surface CSS repo');
  }
  assertDirectory(layoutDocsRepo, 'Layout Style CSS documentation repo');
  assertDirectory(interactiveDocsRepo, 'Interactive Surface CSS documentation repo');

  console.log(`Using UI Style Kit package: ${uiSpec ?? rootDir}`);
  console.log(`Using Layout Style CSS package: ${layoutSpec ?? layoutRepo}`);
  console.log(`Using Interactive Surface package: ${interactiveSpec ?? interactiveRepo}`);

  const tarballs = {
    ui: uiSpec ? packPackageSpec(uiSpec, packsDir) : packLocalPackage(rootDir, packsDir),
    layout: layoutSpec ? packPackageSpec(layoutSpec, packsDir) : packLocalPackage(layoutRepo, packsDir),
    interactive: interactiveSpec
      ? packPackageSpec(interactiveSpec, packsDir)
      : packLocalPackage(interactiveRepo, packsDir)
  };

  await runScenario({
    name: 'ui-standalone',
    packagePaths: [tarballs.ui],
    entrypoints: uiEntrypoints
  });
  await runScenario({
    name: 'layout-standalone',
    packagePaths: [tarballs.layout],
    entrypoints: layoutEntrypoints
  });
  await runScenario({
    name: 'interactive-standalone',
    packagePaths: [tarballs.interactive],
    entrypoints: interactiveEntrypoints
  });

  for (const scenario of pairedScenarios) {
    await runScenario({
      name: scenario.name,
      packagePaths: scenario.packages.map((name) => tarballs[name]),
      entrypoints: scenario.entrypoints
    });
  }

  const allThreeDir = await runScenario({
    name: 'all-three-canonical-and-legacy',
    packagePaths: [tarballs.ui, tarballs.layout, tarballs.interactive],
    entrypoints: allThreeEntrypoints
  });

  validateDocumentedImports(allThreeDir);

  if (!options.skipBrowser) {
    await runBrowserSmoke(allThreeDir);
  }

  completed = true;
  console.log('Packed ecosystem compatibility checks passed.');
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
    skipBrowser: false
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
    } else if (arg === '--skip-browser') {
      parsed.skipBrowser = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
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

async function runScenario({ name, packagePaths, entrypoints }) {
  const scenarioDir = path.join(tempDir, name);
  fs.mkdirSync(scenarioDir, { recursive: true });
  fs.writeFileSync(
    path.join(scenarioDir, 'package.json'),
    `${JSON.stringify({ name: `ui-style-kit-${name}`, private: true, type: 'module' }, null, 2)}\n`
  );

  // Installing the packed artifacts in a fresh consumer catches broken exports and missing files.
  runNpm(['install', '--ignore-scripts', '--silent', ...packagePaths], { cwd: scenarioDir });
  validateEntrypoints(scenarioDir, entrypoints, name);
  console.log(`PASS ${name}`);
  return scenarioDir;
}

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

    if (id === 'interactive-surface-css/package.json') {
      const manifest = JSON.parse(text);
      assert.equal(manifest.version, '1.5.0');
    }
  }
}

function validateEcosystemManifest(id, manifest) {
  const expected = {
    'ui-style-kit-css/manifest.json': { name: 'ui-style-kit-css', version: '2.1.0' },
    'layout-style-css/manifest.json': { name: 'layout-style-css', version: '3.0.0' },
    'interactive-surface-css/manifest.json': { name: 'interactive-surface-css', version: '1.5.0' }
  }[id];

  assert.ok(expected, `Unexpected ecosystem manifest entry point: ${id}`);
  assert.equal(manifest.schemaVersion, 1, `${id} must use ecosystem schema version 1`);
  assert.equal(manifest.name, expected.name, `${id} must declare its package name`);
  assert.equal(manifest.version, expected.version, `${id} must declare its package version`);

  // UI Style Kit predates the shared policy field, while the new manifests declare it explicitly.
  if (id !== 'ui-style-kit-css/manifest.json') {
    assert.equal(manifest.schemaPolicy.compatibility, 'additive-within-major');
    assert.equal(
      manifest.schemaPolicy.breakingChange,
      'increment-schemaVersion-before-removing-or-renaming-fields'
    );
  }
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

      const imports = extractPackageImports(fs.readFileSync(documentPath, 'utf8'));
      importCount += imports.length;
      for (const specifier of imports) {
        try {
          const resolved = resolver.resolve(specifier);
          if (!fs.statSync(resolved).isFile()) {
            failures.push(`${group.name}/${relativePath}: ${specifier} did not resolve to a file`);
          }
        } catch (error) {
          failures.push(`${group.name}/${relativePath}: ${specifier} did not resolve (${error.code ?? error.message})`);
        }
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Documented package import validation failed:\n${failures.join('\n')}`);
  }

  console.log(`PASS documented imports (${importCount} references across current and supported deprecated guides)`);
  console.log(`INFO historical/migration documents reviewed separately: ${historicalDocumentation.join(', ')}`);
}

async function runBrowserSmoke(scenarioDir) {
  const resolver = createRequire(path.join(scenarioDir, 'package.json'));
  const { chromium } = await import('playwright');
  const suites = {
    canonical: [
      'ui-style-kit-css/visual.css',
      'ui-style-kit-css/interactive-surface-theme.css',
      'interactive-surface-css/state-core.css',
      'layout-style-css'
    ],
    legacy: [
      'ui-style-kit-css',
      'ui-style-kit-css/with-bridge.css',
      'ui-style-kit-css/interactive-surface-bridge.css',
      'interactive-surface-css/interactive-surface.css',
      'layout-style-css'
    ]
  };

  const browser = await chromium.launch();
  try {
    for (const [name, imports] of Object.entries(suites)) {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      const issues = [];
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          issues.push(`${message.type()}: ${message.text()}`);
        }
      });
      page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));

      // The smoke fixture exercises the canonical root contracts without relying on demo-only assets.
      await page.setContent(`<!doctype html>
<html>
<head><meta charset="utf-8"><style>${cssFor(resolver, imports)}</style></head>
<body class="ly-root" data-ly-layout="minimal-saas" data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <main class="ly-container saas-stack">
    <button id="button" class="saas-button-pill interactive-surface variant-primary" type="button"><span>Centered action</span></button>
    <input id="file" class="saas-field interactive-surface variant-subtle" type="file" />
    <section id="card" class="saas-card ly-stack"><h2>Pack check</h2><p>Published Interactive Surface smoke.</p></section>
  </main>
</body>
</html>`);
      await page.waitForLoadState('domcontentloaded');
      const snapshot = await page.evaluate(() => {
        const button = document.querySelector('#button');
        const span = button.querySelector('span');
        const file = document.querySelector('#file');
        const card = document.querySelector('#card');
        const buttonStyle = getComputedStyle(button);
        const fileButtonStyle = getComputedStyle(file, '::file-selector-button');
        const cardStyle = getComputedStyle(card);
        const rect = button.getBoundingClientRect();
        const textRect = span.getBoundingClientRect();

        return {
          buttonHeight: rect.height,
          buttonPaddingStart: parseFloat(buttonStyle.paddingInlineStart),
          buttonPaddingEnd: parseFloat(buttonStyle.paddingInlineEnd),
          buttonDisplay: buttonStyle.display,
          buttonJustify: buttonStyle.justifyContent,
          buttonAlign: buttonStyle.alignItems,
          textCenterDelta: Math.abs(textRect.left + textRect.width / 2 - (rect.left + rect.width / 2)),
          buttonBg: buttonStyle.backgroundColor,
          buttonFg: buttonStyle.color,
          buttonBorder: buttonStyle.borderColor,
          focusRingToken: buttonStyle.getPropertyValue('--interactive-surface-focus-ring-color').trim(),
          transitionProperty: buttonStyle.transitionProperty,
          transitionDuration: buttonStyle.transitionDuration,
          transitionTimingFunction: buttonStyle.transitionTimingFunction,
          fileButtonPaddingStart: parseFloat(fileButtonStyle.paddingInlineStart),
          fileButtonPaddingEnd: parseFloat(fileButtonStyle.paddingInlineEnd),
          cardBg: cardStyle.backgroundColor,
          cardColor: cardStyle.color
        };
      });

      assert.equal(issues.length, 0, `${name} emitted browser issues: ${issues.join('; ')}`);
      assert.ok(snapshot.buttonHeight >= 43.5, `${name} button height ${snapshot.buttonHeight}`);
      assert.ok(snapshot.buttonPaddingStart > 0 && snapshot.buttonPaddingEnd > 0, `${name} button lacks inline padding`);
      assert.ok(snapshot.textCenterDelta <= 1.5, `${name} button text not centered: ${snapshot.textCenterDelta}`);
      assert.notEqual(snapshot.buttonBg, 'rgba(0, 0, 0, 0)', `${name} button background is transparent`);
      assert.notEqual(snapshot.buttonFg, snapshot.buttonBg, `${name} button fg/bg collapsed`);
      assert.notEqual(snapshot.buttonBorder, 'rgba(0, 0, 0, 0)', `${name} button border is transparent`);
      assert.ok(snapshot.focusRingToken.length > 0, `${name} interactive focus token missing`);
      assert.notEqual(snapshot.transitionProperty, 'all', `${name} transition property fell back to all`);
      assert.notEqual(snapshot.transitionDuration, '0s', `${name} transition duration is zero in normal motion`);
      assert.notEqual(snapshot.transitionTimingFunction, 'ease', `${name} transition easing fell back to browser default`);
      assert.ok(
        snapshot.fileButtonPaddingStart > 0 && snapshot.fileButtonPaddingEnd > 0,
        `${name} file selector button lacks padding`
      );
      assert.notEqual(snapshot.cardBg, 'rgba(0, 0, 0, 0)', `${name} card background is transparent`);
      assert.notEqual(snapshot.cardColor, snapshot.cardBg, `${name} card fg/bg collapsed`);

      console.log(`PASS browser ${name}`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
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
