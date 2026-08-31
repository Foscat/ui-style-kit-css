import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));

// Exact overrides keep the release audit deterministic without promoting transitive tooling to direct dependencies.
const expectedSecurityOverrides = {
  'fast-uri': '3.1.5',
  'js-yaml': '4.3.1',
  nanoid: '3.3.18',
  postcss: '8.5.23'
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatApproxKb(byteLength) {
  return `~${Math.round(byteLength / 1024)} KB`;
}

function parseDemoManifestScript() {
  const script = fs.readFileSync(path.join(rootDir, 'demo', 'demo-manifest.js'), 'utf8');
  const match = script.match(/window\.UI_STYLE_KIT_MANIFEST\s*=\s*(\{[\s\S]*\});?\s*$/);
  assert.ok(match, 'demo/demo-manifest.js should assign window.UI_STYLE_KIT_MANIFEST');

  return JSON.parse(match[1]);
}

function selectOptions(html, selectId) {
  const selectMatch = html.match(new RegExp(`<select id="${escapeRegExp(selectId)}"[\\s\\S]*?<\\/select>`));
  assert.ok(selectMatch, `Expected #${selectId} to exist`);

  return [...selectMatch[0].matchAll(/<option\s+([^>]*)>([\s\S]*?)<\/option>/g)].map((optionMatch) => {
    const attributes = optionMatch[1];
    const value = attributes.match(/\bvalue="([^"]+)"/)?.[1] ?? '';
    const prefix = attributes.match(/\bdata-prefix="([^"]+)"/)?.[1] ?? '';
    const selected = /\bselected\b/.test(attributes);

    return {
      value,
      prefix,
      selected,
      label: optionMatch[2].trim()
    };
  });
}

function exactHeadTag() {
  try {
    return execFileSync('git', ['describe', '--tags', '--exact-match', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function hasWorkingTreeChanges() {
  try {
    return execFileSync('git', ['status', '--short'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim() !== '';
  } catch {
    return true;
  }
}

function assertFileExists(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
}

function isExternalReference(reference) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference);
}

function splitReference(reference) {
  const trimmed = reference.trim().replace(/^<|>$/g, '');
  const withoutTitle = trimmed.match(/^([^\s]+)(?:\s+["'][^"']+["'])?$/)?.[1] || trimmed;
  const [pathname = '', hash = ''] = withoutTitle.split('#');

  return { pathname, hash };
}

function assertLocalReference(file, reference, failures) {
  if (!reference || isExternalReference(reference)) return;

  const { pathname, hash } = splitReference(reference);
  const sourcePath = path.join(rootDir, file);
  const sourceContents = fs.readFileSync(sourcePath, 'utf8');

  if (!pathname) {
    if (hash && !new RegExp(`\\bid=["']${escapeRegExp(hash)}["']`).test(sourceContents)) {
      failures.push(`${file}: missing #${hash}`);
    }
    return;
  }

  let targetPath = pathname;
  if (file.startsWith(`wiki${path.sep}`) && !path.extname(pathname) && !pathname.includes('/')) {
    targetPath = `${pathname}.md`;
  }

  const absoluteTarget = path.resolve(path.dirname(sourcePath), targetPath);
  if (!absoluteTarget.startsWith(rootDir) || !fs.existsSync(absoluteTarget)) {
    failures.push(`${file}: ${reference}`);
  }
}

function relativeFiles(directory, extension) {
  const absoluteDirectory = path.join(rootDir, directory);

  return fs.readdirSync(absoluteDirectory)
    .filter((file) => file.endsWith(extension))
    .map((file) => path.join(directory, file));
}

test('package metadata preserves the v2 distribution and demo contracts', () => {
  const sortedExports = Object.entries(packageJson.exports).sort(([left], [right]) => left.localeCompare(right));
  const exportDigest = createHash('sha256').update(JSON.stringify(sortedExports)).digest('hex');

  assert.equal(packageJson.homepage, 'https://foscat.github.io/ui-style-kit-css/');
  assert.equal(sortedExports.length, 134, 'Every retained and additive v2 export must remain available');
  // This digest protects every public key-to-target mapping while keeping the fixture compact and reviewable.
  assert.equal(exportDigest, 'f725a6de2e9ffe2c597eb2b4d288a0d2a611b62efbf3a5f0f043529615b9b498');
  assert.equal(packageJson.exports['.'], './dist/ui-style-kit.css');
  assert.equal(packageJson.exports['./min.css'], './dist/ui-style-kit.min.css');
  assert.equal(packageJson.exports['./css'], packageJson.exports['.']);
  assert.equal(packageJson.exports['./css.css'], packageJson.exports['.']);
  assert.equal(packageJson.exports['./min'], packageJson.exports['./min.css']);
});

test('installation guidance keeps the v2 default and alias migration explicit', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  const installationStart = readme.indexOf('## Install');
  const basicUsageStart = readme.indexOf('## Basic usage');
  const installationGuidance = readme.slice(installationStart, basicUsageStart);

  assert.ok(installationStart !== -1 && basicUsageStart > installationStart);
  assert.match(installationGuidance, /default bundle remains unchanged for all v2 releases/i);
  assert.match(installationGuidance, /recommended entrypoint when (?:an application|consumers?) own layout/i);
  assert.match(installationGuidance, /visual\.css.*package default.*v3 proposal/is);
  assert.match(installationGuidance, /readable `dist\/ui-style-kit\.css`/);
  assert.match(installationGuidance, /minified `dist\/ui-style-kit\.min\.css`/);
  assert.match(installationGuidance, /focused `visual\/<preset>\.css`/);
  assert.match(installationGuidance, /`\.\/css`/);
  assert.match(installationGuidance, /`\.\/css\.css`/);
  assert.match(installationGuidance, /`\.\/min`/);
  assert.match(installationGuidance, /deprecated compatibility aliases/i);
});

test('package entry points point to dist output', () => {
  assert.equal(packageJson.main, 'dist/ui-style-kit.css');
  assert.equal(packageJson.style, 'dist/ui-style-kit.css');
  assert.equal(packageJson.unpkg, 'dist/ui-style-kit.min.css');
  assert.equal(packageJson.jsdelivr, 'dist/ui-style-kit.min.css');

  assertFileExists(packageJson.main);
  assertFileExists(packageJson.unpkg);
});

test('export targets map to real files', () => {
  for (const [exportPath, targetPath] of Object.entries(packageJson.exports || {})) {
    assert.equal(typeof targetPath, 'string', `Expected string export target for ${exportPath}`);
    assertFileExists(targetPath.replace(/^\.\//, ''));
  }
});

test('repository-local links and asset references resolve', () => {
  const markdownFiles = [
    'README.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'STYLE-MAP.md',
    path.join('demo', 'assets', 'README.md'),
    ...relativeFiles('docs', '.md'),
    ...relativeFiles('wiki', '.md')
  ];
  const htmlFiles = [
    'index.html',
    path.join('demo', 'index.html')
  ];
  const cssFiles = [
    ...relativeFiles('styles', '.css'),
    ...relativeFiles('demo', '.css')
  ];
  const failures = [];

  for (const file of markdownFiles) {
    const contents = fs.readFileSync(path.join(rootDir, file), 'utf8');
    for (const match of contents.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
      assertLocalReference(file, match[1], failures);
    }
  }

  for (const file of htmlFiles) {
    const contents = fs.readFileSync(path.join(rootDir, file), 'utf8');
    for (const match of contents.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      assertLocalReference(file, match[1], failures);
    }
    for (const match of contents.matchAll(/<meta\s+name=["']msapplication-config["']\s+content=["']([^"']+)["']/g)) {
      assertLocalReference(file, match[1], failures);
    }
  }

  for (const file of cssFiles) {
    const contents = fs.readFileSync(path.join(rootDir, file), 'utf8');
    for (const match of contents.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      assertLocalReference(file, match[1], failures);
    }
  }

  assert.deepEqual(failures, []);
});

test('dist CSS contains expected style system markers', () => {
  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');

  const uiNames = [
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
  ];

  for (const uiName of uiNames) {
    assert.match(css, new RegExp(`\\[data-ui="${uiName}"\\]`));
    assert.match(minCss, new RegExp(`\\[data-ui="?${uiName}"?\\]`));
  }
});

test('package files include required publish assets', () => {
  const requiredFiles = ['dist', 'styles', 'README.md', 'LICENSE', 'manifest.json'];
  for (const item of requiredFiles) {
    assert.ok(packageJson.files.includes(item), `package.json files[] should include ${item}`);
  }

  assert.ok(
    !packageJson.files.some((item) => item === 'demo' || item.startsWith('demo/')),
    'package.json files[] should keep preview-only demo assets out of the npm tarball'
  );
});

test('demo manifest snapshot mirrors the package manifest capability source', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  const demoManifest = parseDemoManifestScript();

  assert.deepEqual(demoManifest.presets, manifest.presets);
  assert.deepEqual(demoManifest.themes, manifest.themes);
  assert.deepEqual(demoManifest.modes, manifest.modes);
  assert.ok(
    demoManifest.presets.every((preset) => typeof preset.label === 'string' && preset.label.length > 0),
    'Demo preset controls need labels from manifest.json'
  );
});

test('demo select fallbacks match manifest presets, themes, and modes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  const expectedPresets = manifest.presets.map(({ id, prefix, label }) => ({
    value: id,
    prefix,
    selected: id === 'minimal-saas',
    label
  }));
  const expectedThemes = manifest.themes.map((theme) => ({
    value: theme,
    prefix: '',
    selected: theme === 'arctic-indigo',
    label: theme
  }));
  const expectedModes = manifest.modes.map((mode) => ({
    value: mode,
    prefix: '',
    selected: mode === 'light',
    label: mode
  }));

  for (const htmlFile of ['index.html', path.join('demo', 'index.html')]) {
    const html = fs.readFileSync(path.join(rootDir, htmlFile), 'utf8');

    assert.match(html, /demo-manifest\.js/, `${htmlFile} should load the manifest snapshot before demo.js`);
    assert.deepEqual(selectOptions(html, 'uiSelect'), expectedPresets, `${htmlFile} preset options should match manifest.json`);
    assert.deepEqual(selectOptions(html, 'themeSelect'), expectedThemes, `${htmlFile} theme options should match manifest.json`);
    assert.deepEqual(selectOptions(html, 'modeSelect'), expectedModes, `${htmlFile} mode options should match manifest.json`);
  }
});

test('README documents the 2.3 library system and published companion set', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

  assert.match(readme, /```mermaid/);
  assert.match(readme, /layout-style-css/);
  assert.match(readme, /interactive-surface-css/);
  assert.match(readme, /Demo token workbench/);
  assert.match(readme, /v2\.3\.0/);
  assert.match(readme, /Ecosystem compatibility/);
  assert.match(readme, /ui-style-kit-css@2\.3\.0/);
  assert.match(readme, /interactive-surface-css@1\.6\.0/);
  assert.match(readme, /layout-style-css@3\.1\.0/);
  assert.match(readme, /layout-style-css@3\.0\.0/);
  assert.match(readme, /UI Style Kit `2\.3\.0` is the current release target/);
  assert.match(readme, /Layout Style `3\.1\.0` is the compatible structural release/);
  assert.doesNotMatch(readme, /active staged candidate/i);
  assert.match(readme, /validated minimum remains[^\n]*layout-style-css@3\.0\.0/i);
  assert.match(readme, /ui-style-kit-css\/visual\.css/);
  assert.match(readme, /ui-style-kit-css\/manifest\.json/);
  assert.match(readme, /interactive-surface-theme\.css/);
  assert.match(readme, /interactive-surface-css\/state-core\.css/);
});

test('README bundle size guide matches current built CSS output', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  // Keep the public size table honest whenever generated CSS changes.
  const sizeExpectations = [
    ['ui-style-kit-css/dist/ui-style-kit.min.css', 'dist/ui-style-kit.min.css', 'Compatible runtime UI-system switchers and demos'],
    ['ui-style-kit-css/visual.min.css', 'dist/ui-style-kit.visual.min.css', 'Runtime visual switching with consumer-owned layout'],
    ['ui-style-kit-css/with-bridge.css', 'dist/ui-style-kit.with-bridge.css', 'Deprecated runtime switcher plus stateful bridge'],
    ['ui-style-kit-css/theme-colors.css', 'styles/theme-colors.css', 'Shared color schemes for standalone style imports'],
    ['ui-style-kit-css/native-elements.css', 'styles/native-elements.css', 'Shared native HTML fallback styling'],
    ['ui-style-kit-css/content-overflow.css', 'styles/content-overflow.css', 'Shared long-text containment for standalone style imports'],
    ['ui-style-kit-css/interactive-surface-theme.css', 'styles/interactive-surface-theme.css', 'Canonical token-and-paint bridge for Interactive Surface state core']
  ];

  for (const [importPath, relativePath, label] of sizeExpectations) {
    const css = fs.readFileSync(path.join(rootDir, relativePath));
    const rawSize = formatApproxKb(css.byteLength);
    const gzipSize = formatApproxKb(zlib.gzipSync(css).byteLength);
    const row = new RegExp(`\\| \`${escapeRegExp(importPath)}\` \\| ${escapeRegExp(rawSize)} \\| ${escapeRegExp(gzipSize)} \\| ${escapeRegExp(label)} \\|`);

    assert.match(readme, row, `${relativePath} size guide should match built CSS output`);
  }
});

test('2.0.4 release documentation records the correctness hotfix', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  const changelog = fs.readFileSync(path.join(rootDir, 'CHANGELOG.md'), 'utf8');
  const publishingGuide = fs.readFileSync(path.join(rootDir, 'docs', 'PUBLISHING.md'), 'utf8');
  const releaseNotes = changelog.match(/## \[2\.0\.4\][\s\S]*?(?=\n## \[|$)/)?.[0] ?? '';

  assert.match(readme, /parser-based minification/);
  assert.match(releaseNotes, /Lightning CSS/);
  assert.match(releaseNotes, /::file-selector-button/);
  assert.match(releaseNotes, /::backdrop/);
  assert.match(releaseNotes, /on-success/);
  assert.match(releaseNotes, /on-warning/);
  assert.match(releaseNotes, /on-danger/);
  assert.match(publishingGuide, /Lightning CSS/);
});

test('ecosystem compatibility guidance is packaged and linked from public docs', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  const wikiHome = fs.readFileSync(path.join(rootDir, 'wiki', 'Home.md'), 'utf8');
  const wikiSidebar = fs.readFileSync(path.join(rootDir, 'wiki', '_Sidebar.md'), 'utf8');
  const ecosystemDoc = fs.readFileSync(path.join(rootDir, 'docs', 'ECOSYSTEM.md'), 'utf8');
  const ecosystemWiki = fs.readFileSync(path.join(rootDir, 'wiki', 'Ecosystem-Compatibility.md'), 'utf8');

  assert.match(readme, /\[Ecosystem guide\]\(docs\/ECOSYSTEM\.md\)/);
  assert.match(wikiHome, /\[Ecosystem Compatibility\]\(Ecosystem-Compatibility\)/);
  assert.match(wikiSidebar, /\[\[Ecosystem Compatibility\]\]/);

  for (const contents of [ecosystemDoc, ecosystemWiki]) {
    assert.match(contents, /ui-style-kit-css@2\.3\.0/);
    assert.match(contents, /interactive-surface-css@1\.5\.0/);
    assert.match(contents, /layout-style-css@3\.1\.0/);
    assert.match(contents, /layout-style-css@3\.0\.0/);
    assert.match(contents, /Use one/);
    assert.match(contents, /Use two/);
    assert.match(contents, /Use all three/);
    assert.match(contents, /visual identity/);
    assert.match(contents, /interaction-state/);
    assert.match(contents, /structural/);
    assert.match(contents, /interactive-surface-theme\.css/);
    assert.match(contents, /interactive-surface-css\/state-core\.css/);
    assert.match(contents, /deprecated compatibility paths/);
  }
});

test('ecosystem fixture pins both published companions for the UI 2.3.0 release', () => {
  const compatibility = JSON.parse(fs.readFileSync(path.join(rootDir, 'ecosystem-compatibility.json'), 'utf8'));
  const ecosystemDoc = fs.readFileSync(path.join(rootDir, 'docs', 'ECOSYSTEM.md'), 'utf8');
  const ecosystemWiki = fs.readFileSync(path.join(rootDir, 'wiki', 'Ecosystem-Compatibility.md'), 'utf8');

  assert.equal(compatibility.packageSources['interactive-surface-css'].revision, 'b50a60d8ffd804d8227b1a16903c394556b88511');
  assert.equal(compatibility.packageSources['layout-style-css'].revision, 'afcb1fdf70d4635e35739e621ee1598400fed103');
  assert.deepEqual(compatibility.supportedCombinations, {
    minimum: {
      'ui-style-kit-css': '2.1.0',
      'interactive-surface-css': '1.5.0',
      'layout-style-css': '3.0.0'
    },
    current: {
      'ui-style-kit-css': '2.3.0',
      'interactive-surface-css': '1.6.0',
      'layout-style-css': '3.1.0'
    }
  });

  for (const contents of [ecosystemDoc, ecosystemWiki]) {
    assert.match(contents, /ui-style-kit-css@2\.3\.0[\s\S]{0,160}current release target/i);
    assert.match(contents, /interactive-surface-css@1\.6\.0[\s\S]{0,120}published/i);
    assert.match(contents, /layout-style-css@3\.1\.0[\s\S]{0,160}(?:compatible structural release|published)/i);
    assert.doesNotMatch(contents, /active staged candidate/i);
  }
});

test('deprecated bridge migration guidance preserves the retained public exports', () => {
  const migrationGuide = fs.readFileSync(path.join(rootDir, 'docs', 'BRIDGE-MIGRATION.md'), 'utf8');

  assert.match(migrationGuide, /deprecated/i);
  for (const exportPath of [
    'ui-style-kit-css/interactive-surface-bridge',
    'ui-style-kit-css/interactive-surface-bridge.css',
    'ui-style-kit-css/with-bridge',
    'ui-style-kit-css/with-bridge.css'
  ]) {
    const packageExport = `./${exportPath.slice('ui-style-kit-css/'.length)}`;
    assert.ok(packageJson.exports[packageExport], `${exportPath} must remain a public compatibility export`);
    assert.match(migrationGuide, new RegExp(escapeRegExp(exportPath)));
  }
});

test('canonical ecosystem examples preserve ownership-first import order', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  const installationWiki = fs.readFileSync(path.join(rootDir, 'wiki', 'Installation-and-Setup.md'), 'utf8');
  const ecosystemGuides = [
    fs.readFileSync(path.join(rootDir, 'docs', 'ECOSYSTEM.md'), 'utf8'),
    fs.readFileSync(path.join(rootDir, 'wiki', 'Ecosystem-Compatibility.md'), 'utf8')
  ];
  const visualThemeStateLayout = [
    'import "ui-style-kit-css/visual.css";',
    'import "ui-style-kit-css/interactive-surface-theme.css";',
    'import "interactive-surface-css/state-core.css";',
    'import "layout-style-css";'
  ].join('\n');
  const exactJsBlock = (imports) => new RegExp(escapeRegExp(`\`\`\`js\n${imports}\n\`\`\``));

  assert.match(readme, exactJsBlock(visualThemeStateLayout));
  assert.match(installationWiki, exactJsBlock(visualThemeStateLayout));

  for (const contents of ecosystemGuides) {
    assert.match(contents, exactJsBlock(visualThemeStateLayout));
    assert.match(contents, /UI Style Kit `2\.3\.0` is the current release target/);
    assert.match(contents, /Layout Style `3\.1\.0` is the compatible structural release/);
    assert.match(contents, /validated minimum remains[^\n]*layout-style-css@3\.0\.0/i);
  }
});

test('wiki links use rendered GitHub Wiki page routes', () => {
  const wikiDir = path.join(rootDir, 'wiki');
  const markdownFiles = fs.readdirSync(wikiDir).filter((file) => file.endsWith('.md'));
  const rawFileLinks = [];

  for (const file of markdownFiles) {
    const contents = fs.readFileSync(path.join(wikiDir, file), 'utf8');
    for (const match of contents.matchAll(/\]\(([^)]+\.md(?:#[^)]+)?)\)/g)) {
      rawFileLinks.push(`${file}: ${match[1]}`);
    }
  }

  assert.deepEqual(rawFileLinks, []);
});

test('release automation scripts are exposed', () => {
  const requiredScripts = [
    'lint',
    'build',
    'test',
    'test:unit',
    'test:e2e',
    'test:axe',
    'test:matrix',
    'test:visual',
    'test:e2e:install:ci',
    'check:contrast',
    'check:compat',
    'check:ownership',
    'check:package',
    'check:ecosystem:current',
    'check:ecosystem:minimum',
    'check:ecosystem:packs',
    'test:ecosystem:clean-install',
    'release:preflight',
    'check',
    'pack:dry-run',
    'release:verify'
  ];

  for (const scriptName of requiredScripts) {
    assert.equal(typeof packageJson.scripts?.[scriptName], 'string', `Missing script: ${scriptName}`);
    assert.notEqual(packageJson.scripts[scriptName].trim(), '', `Script should not be empty: ${scriptName}`);
  }
});

test('clean-install ecosystem scripts and CI enforce current and minimum rendered matrices', () => {
  const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', 'ci.yml'), 'utf8');
  const currentScript = packageJson.scripts['check:ecosystem:current'] ?? '';
  const minimumScript = packageJson.scripts['check:ecosystem:minimum'] ?? '';

  assert.match(currentScript, /check-ecosystem-packs\.mjs --matrix current/);
  assert.match(minimumScript, /check-ecosystem-packs\.mjs --matrix minimum/);
  assert.equal(
    packageJson.scripts['test:ecosystem:clean-install'],
    'node --test tests/clean-install-ecosystem-contract.integration.mjs'
  );
  assert.match(workflow, /npm run release:preflight/);
  assert.doesNotMatch(workflow, /check:ecosystem:(?:current|minimum)[^\n]*--skip-browser/);
  assert.doesNotMatch(workflow, /--update-snapshots/);
  assert.equal(packageJson.devDependencies.pixelmatch, '7.2.0');
  assert.equal(packageJson.devDependencies.pngjs, '7.0.0');
});

test('release verification script is non-publishing and covers the full release gate', () => {
  const releaseVerify = packageJson.scripts['release:verify'] ?? '';
  const requiredCommands = [
    'npm run check',
    'npm run test:e2e',
    'npm run test:axe',
    'npm run test:visual',
    'npm run test:matrix',
    'npm run release:preflight -- --candidate-package ui-style-kit-css',
    'npm audit --audit-level=moderate',
    'npm run pack:dry-run'
  ];

  for (const command of requiredCommands) {
    assert.match(releaseVerify, new RegExp(escapeRegExp(command)), `release:verify should run ${command}`);
  }

  // Keep the reusable verification gate safe for approval-gated release preparation.
  assert.doesNotMatch(releaseVerify, /\bnpm\s+(?:publish|version)\b/);
  assert.doesNotMatch(releaseVerify, /\bgit\s+tag\b/);
  assert.equal(packageJson.scripts.prepublishOnly, 'npm run release:verify');
});

test('publishing docs expose the coordinated packed ecosystem compatibility gate', () => {
  const publishingGuide = fs.readFileSync(path.join(rootDir, 'docs', 'PUBLISHING.md'), 'utf8');

  assert.match(packageJson.scripts['check:ecosystem:current'], /scripts\/check-ecosystem-packs\.mjs/);
  assert.match(packageJson.scripts['check:ecosystem:minimum'], /scripts\/check-ecosystem-packs\.mjs/);
  assert.ok(fs.existsSync(path.join(rootDir, 'scripts', 'check-ecosystem-packs.mjs')));
  assert.match(publishingGuide, /npm run check:ecosystem:packs/);
  assert.match(publishingGuide, /standalone, pairwise, and all-three packed package compatibility/i);
  assert.match(publishingGuide, /--layout-repo \.\.\/Layout-Style-CSS/);
  assert.match(publishingGuide, /--interactive-repo \.\.\/Interactive-Surface-CSS/);
  assert.match(publishingGuide, /immutable revision pins from `ecosystem-compatibility\.json`/);
});

test('publishing docs pin published companion merge commits for the UI release', () => {
  const publishingGuide = fs.readFileSync(path.join(rootDir, 'docs', 'PUBLISHING.md'), 'utf8');

  assert.match(publishingGuide, /b50a60d8ffd804d8227b1a16903c394556b88511/);
  assert.match(publishingGuide, /afcb1fdf70d4635e35739e621ee1598400fed103/);
  assert.match(publishingGuide, /interactive-surface-css@1\.6\.0[\s\S]{0,120}published/i);
  assert.match(publishingGuide, /layout-style-css@3\.1\.0[\s\S]{0,120}published/i);
  assert.match(publishingGuide, /ui-style-kit-css@2\.3\.0[\s\S]{0,160}active candidate only while/i);
  assert.doesNotMatch(publishingGuide, /active staged candidate/i);
  assert.match(publishingGuide, /current[^\n]*layout-style-css@3\.1\.0/i);
  assert.match(publishingGuide, /minimum[^\n]*layout-style-css@3\.0\.0/i);
});

test('publishing docs describe coordinated proof without re-releasing packages', () => {
  const publishingGuide = fs.readFileSync(path.join(rootDir, 'docs', 'PUBLISHING.md'), 'utf8');

  assert.match(publishingGuide, /No package, tag, or registry release occurs without explicit approval/i);
  assert.match(publishingGuide, /coordinated checked-out ecosystem proof/i);
  assert.doesNotMatch(publishingGuide, /--interactive-spec interactive-surface-css@1\.5\.0/);
  assert.doesNotMatch(publishingGuide, /Release `ui-style-kit-css@2\.(?:0\.4|1\.0)`/);
});

test('publishing workflow resolves immutable ecosystem sources for packed import validation', () => {
  const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', 'npm-publish.yml'), 'utf8');

  assert.match(workflow, /id: ecosystem_sources/);
  assert.match(workflow, /node scripts\/write-ecosystem-workflow-outputs\.mjs/);
  assert.match(workflow, /Require pushed companion commits before publish verification/);
  assert.match(workflow, /git -C "\$\{fixture_dir\}" fetch --no-tags --depth=1/);
  assert.match(workflow, /ref: \$\{\{ steps\.ecosystem_sources\.outputs\.layout_revision \}\}/);
  assert.match(workflow, /ref: \$\{\{ steps\.ecosystem_sources\.outputs\.interactive_revision \}\}/);
  assert.match(workflow, /UI_STYLE_KIT_LAYOUT_DOCS_REPO:/);
  assert.match(workflow, /UI_STYLE_KIT_INTERACTIVE_REPO:/);
  assert.match(workflow, /UI_STYLE_KIT_INTERACTIVE_DOCS_REPO:/);
});

test('every repository release preflight invocation explicitly selects the UI candidate', () => {
  for (const workflowName of ['ci.yml', 'release-version-alignment.yml', 'npm-publish.yml']) {
    const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', workflowName), 'utf8');
    const preflightCommands = workflow.match(/^(?!\s*#).*\bnpm\s+run\s+release:preflight\b[^\r\n]*/gm) ?? [];

    assert.ok(preflightCommands.length > 0, `${workflowName} must execute the release preflight`);
    for (const command of preflightCommands) {
      assert.match(
        command,
        /--candidate-package\s+ui-style-kit-css(?:\s|$)/,
        `${workflowName} must exclude only the active UI release candidate from registry checks`
      );
    }
  }
});

test('CI workflow shards the UI matrix by engine and preset group', () => {
  const ciWorkflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', 'ci.yml'), 'utf8');

  assert.match(ciWorkflow, /ui-matrix:/);
  assert.match(ciWorkflow, /engine:\s*\[chromium,\s*firefox,\s*webkit\]/);
  assert.match(ciWorkflow, /preset-shard:\s*\[1,\s*2,\s*3,\s*4\]/);
  assert.match(ciWorkflow, /UI_MATRIX_PRESET_SHARD:/);
  assert.match(ciWorkflow, /UI_MATRIX_PRESET_SHARDS:\s*4/);
  assert.match(ciWorkflow, /npm run test:matrix -- --project=\$\{\{ matrix\.engine \}\}/);
  assert.match(ciWorkflow, /playwright-report/);
  assert.match(ciWorkflow, /test-results/);
});

/**
 * Verifies that the release-alignment gate shards the full UI matrix before a
 * release is created.
 *
 * @param {string} workflowName GitHub Actions workflow filename.
 * @returns {void}
 */
function assertReleaseWorkflowShardsUiMatrix(workflowName) {
  const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', workflowName), 'utf8');

  assert.match(workflow, /Run sharded UI matrix/);
  assert.match(workflow, /for engine in chromium firefox webkit/);
  assert.match(workflow, /for preset_shard in 1 2 3 4/);
  assert.match(workflow, /UI_MATRIX_PRESET_SHARD="\$\{preset_shard\}"/);
  assert.match(workflow, /UI_MATRIX_PRESET_SHARDS=4/);
  assert.match(workflow, /npm run test:matrix -- --project="\$\{engine\}"/);
  assert.doesNotMatch(workflow, /^\s*run:\s*npm run test:matrix\s*$/m);
}

test('release version alignment shards the UI matrix before creating releases', () => {
  assertReleaseWorkflowShardsUiMatrix('release-version-alignment.yml');
});

test('npm publish workflow skips duplicate browser gates after release verification', () => {
  const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', 'npm-publish.yml'), 'utf8');

  assert.match(workflow, /Run publish readiness checks/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /Verify npm token can publish package/);
  assert.match(workflow, /npm whoami --registry https:\/\/registry\.npmjs\.org\//);
  assert.match(workflow, /Unable to authenticate with npm using NPM_TOKEN/);
  assert.match(workflow, /npm owner ls "\$\{PACKAGE_NAME\}" --registry https:\/\/registry\.npmjs\.org\//);
  assert.match(workflow, /npm run release:preflight[\s\S]*--candidate-package ui-style-kit-css[\s\S]*--skip-clean-install/);
  assert.doesNotMatch(workflow, /Run sharded UI matrix/);
  assert.doesNotMatch(workflow, /\bnpm run test:e2e(?:\s|$)/);
  assert.doesNotMatch(workflow, /\bnpm run test:visual(?:\s|$)/);
  assert.doesNotMatch(workflow, /\bnpm run test:matrix(?:\s|$)/);
  assert.doesNotMatch(workflow, /\bnpm run test:e2e:install:ci(?:\s|$)/);
  assert.doesNotMatch(workflow, /Playwright/i);
});

test('package metadata is aligned for the release version', () => {
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[''].version, packageJson.version);
  assert.deepEqual(packageJson.dependencies || {}, {});
  assert.deepEqual(packageLock.packages[''].dependencies || {}, {});
  assert.equal(packageJson.devDependencies['@axe-core/playwright'], '4.12.1');
  assert.equal(packageLock.packages[''].devDependencies['@axe-core/playwright'], '4.12.1');
  assert.equal(packageLock.packages['node_modules/@axe-core/playwright'].version, '4.12.1');
  assert.equal(packageJson.homepage, 'https://foscat.github.io/ui-style-kit-css/');

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  assert.match(css, new RegExp(`UI Style Kit CSS v${escapeRegExp(packageJson.version)}`));
});

test('release security overrides resolve audited transitive tooling', () => {
  assert.deepEqual(packageJson.overrides, expectedSecurityOverrides);
  assert.deepEqual(packageJson.dependencies || {}, {});
  assert.deepEqual(packageLock.packages[''].dependencies || {}, {});

  for (const [packageName, expectedVersion] of Object.entries(expectedSecurityOverrides)) {
    assert.equal(
      packageLock.packages[`node_modules/${packageName}`]?.version,
      expectedVersion,
      `Expected ${packageName}@${expectedVersion} in the release lockfile`
    );
  }
});

test('exact release tag at HEAD matches package version', () => {
  // Release prep can happen on the previous tagged commit before the new tag exists.
  if (hasWorkingTreeChanges()) return;

  const tag = exactHeadTag();
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) return;

  assert.equal(tag, `v${packageJson.version}`);
});

test('interactive surface bridge is exported and available as an opt-in bundle', () => {
  assert.equal(
    packageJson.exports['./interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );
  assert.equal(
    packageJson.exports['./styles/interactive-surface-bridge'],
    './styles/interactive-surface-bridge.css'
  );

  assertFileExists('styles/interactive-surface-bridge.css');

  assert.equal(
    packageJson.exports['./with-bridge'],
    './dist/ui-style-kit.with-bridge.css'
  );
  assert.equal(
    packageJson.exports['./dist/ui-style-kit.with-bridge.min.css'],
    './dist/ui-style-kit.with-bridge.min.css'
  );

  assertFileExists('dist/ui-style-kit.with-bridge.css');
  assertFileExists('dist/ui-style-kit.with-bridge.min.css');

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');
  const withBridgeCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.with-bridge.css'), 'utf8');
  const withBridgeMinCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.with-bridge.min.css'), 'utf8');

  assert.doesNotMatch(css, /--interactive-surface-border-width/);
  assert.doesNotMatch(minCss, /--interactive-surface-border-width/);
  assert.match(withBridgeCss, /--interactive-surface-border-width/);
  assert.match(withBridgeMinCss, /--interactive-surface-border-width/);
});

test('interactive surface bridge inherits shared tokens and exposes visible state levels', () => {
  const bridgeCss = fs.readFileSync(path.join(rootDir, 'styles', 'interactive-surface-bridge.css'), 'utf8');
  const perUiBridgeSelectors = [
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
  ];

  assert.match(
    bridgeCss,
    /--interactive-surface-bg:\s*rgb\(var\(--usk-surface-strong-rgb,\s*var\(--usk-surface-rgb,/
  );
  assert.match(
    bridgeCss,
    /--interactive-surface-fg:\s*var\(--ui-color-text,\s*rgb\(var\(--usk-text-rgb\)\)\)/
  );
  assert.match(
    bridgeCss,
    /--interactive-surface-variant-primary-bg:\s*var\(--ui-color-primary,\s*rgb\(var\(--usk-primary-rgb\)\)\)/
  );

  for (const level of [1, 2, 3]) {
    assert.match(
      bridgeCss,
      new RegExp(`--interactive-surface-level-${level}-bg\\s*:`),
      `Bridge should expose level ${level} background tokens`
    );
    assert.match(
      bridgeCss,
      new RegExp(`\\[data-surface-level="${level}"\\]`),
      `Bridge should expose level ${level} selectors`
    );
  }

  for (const uiName of perUiBridgeSelectors) {
    assert.doesNotMatch(
      bridgeCss,
      new RegExp(`data-ui="${uiName}"\\]\\[data-theme\\]\\[data-mode\\]\\) \\.interactive-surface`),
      `Bridge should inherit shared --usk-* roles instead of duplicating ${uiName} token maps`
    );
  }
});

test('content overflow compatibility stays exported while 2.1 bundles use owned layers', () => {
  assert.equal(
    packageJson.exports['./content-overflow.css'],
    './styles/content-overflow.css'
  );
  assert.equal(
    packageJson.exports['./styles/content-overflow.css'],
    './styles/content-overflow.css'
  );
  assertFileExists('styles/content-overflow.css');

  const overflowCss = fs.readFileSync(path.join(rootDir, 'styles', 'content-overflow.css'), 'utf8');
  const componentsCss = fs.readFileSync(path.join(rootDir, 'styles', 'components.css'), 'utf8');
  const compatibilityCss = fs.readFileSync(path.join(rootDir, 'styles', 'compat-layout.css'), 'utf8');
  const bundledCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');
  const visualCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.visual.css'), 'utf8');

  assert.match(overflowCss, /@layer ui-style-kit\.content_overflow/);
  assert.match(overflowCss, /overflow-wrap:\s*anywhere/);
  assert.match(overflowCss, /white-space:\s*normal/);
  assert.match(componentsCss, /@layer ui-style-kit\.components/);
  assert.match(componentsCss, /overflow-wrap:\s*anywhere/);
  assert.match(compatibilityCss, /@layer ui-style-kit\.compat_layout/);
  assert.match(compatibilityCss, /overflow-wrap:\s*anywhere/);
  assert.match(bundledCss, /styles\/components\.css/);
  assert.match(bundledCss, /styles\/compat-layout\.css/);
  assert.match(visualCss, /styles\/components\.css/);
  assert.doesNotMatch(visualCss, /styles\/compat-layout\.css/);
  assert.match(minCss, /overflow-wrap:anywhere/);
});

test('native element fallback styles are shared instead of duplicated per preset', () => {
  assert.equal(
    packageJson.exports['./styles/native-elements.css'],
    './styles/native-elements.css'
  );
  assert.equal(
    packageJson.exports['./native-elements.css'],
    './styles/native-elements.css'
  );
  assertFileExists('styles/native-elements.css');

  const nativeCss = fs.readFileSync(path.join(rootDir, 'styles', 'native-elements.css'), 'utf8');
  const styleFiles = [
    ['minimal-saas', 'minimal-saas.css'],
    ['bento', 'bento.css'],
    ['maximalist', 'maximalist.css'],
    ['bauhaus', 'bauhaus.css'],
    ['tactile', 'tactile.css'],
    ['neumorphism', 'neumorphism.css'],
    ['retrofuturism', 'retrofuturism.css'],
    ['brutalism', 'brutalism.css'],
    ['cyberpunk', 'cyberpunk.css'],
    ['y2k', 'y2k.css'],
    ['retro-glass', 'retro-glass.css']
  ];

  for (const selector of [
    'fieldset',
    'label:has(input',
    'button:not([class])',
    'table',
    'details',
    'dialog',
    'article, aside'
  ]) {
    assert.match(nativeCss, new RegExp(`\\[data-ui\\]\\[data-theme\\]\\[data-mode\\] :where\\(${escapeRegExp(selector)}`));
  }
  assert.match(nativeCss, /--usk-native-surface/);
  assert.match(nativeCss, /--usk-native-radius/);

  for (const [uiName, fileName] of styleFiles) {
    const css = fs.readFileSync(path.join(rootDir, 'styles', fileName), 'utf8');
    assert.match(css, /@import url\("\.\/native-elements\.css"\);/, `${fileName} should import the shared native layer`);
    assert.match(css, /@import url\("\.\/content-overflow\.css"\);/, `${fileName} should import the shared content overflow layer`);
    assert.match(css, /--usk-native-surface\s*:/, `${fileName} should map native surface tokens`);
    assert.doesNotMatch(css, /Native HTML Coverage \+ CSS Accessibility Layer/);
    assert.doesNotMatch(css, new RegExp(`\\[data-ui="${uiName}"\\] :where\\(fieldset\\)`));
  }
});

test('published CSS import targets are resolvable', () => {
  const importTargets = [
    '.',
    './visual.css',
    './visual.min.css',
    './visual/minimal-saas.css',
    './minimal-saas.css',
    './content-overflow.css',
    './styles/cyberpunk.css',
    './interactive-surface-theme.css',
    './interactive-surface-bridge',
    './with-bridge.css',
    './manifest.json'
  ];

  for (const exportPath of importTargets) {
    const target = packageJson.exports[exportPath];
    assert.equal(typeof target, 'string', `Missing export: ${exportPath}`);
    assertFileExists(target.replace(/^\.\//, ''));
  }
});

test('demo favicon assets stay repo-local and use portable paths', () => {
  // Demo assets publish through GitHub Pages, while the npm package stays focused on CSS.
  const faviconAssets = [
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon.png',
    'browserconfig.xml',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'favicon-64x64.png',
    'favicon-96x96.png',
    'favicon-128x128.png',
    'favicon-256x256.png',
    'favicon-384x384.png',
    'favicon-head-snippet.html',
    'favicon-master-1024.png',
    'favicon.ico',
    'favicon.svg',
    'mstile-150x150.png',
    'README.md',
    'safari-pinned-tab.svg',
    'site.webmanifest'
  ];
  const rootDemoHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const packageDemoHtml = fs.readFileSync(path.join(rootDir, 'demo', 'index.html'), 'utf8');
  const rootManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'site.webmanifest'), 'utf8'));
  const packageDemoManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'demo', 'assets', 'site.webmanifest'), 'utf8'));

  assert.ok(!packageJson.files.includes('demo'), 'package.json files[] should exclude the demo asset pack');
  assertFileExists('demo/assets/seo/social-card.png');
  assertFileExists('demo/demo.css');
  assertFileExists('demo/demo.js');
  for (const asset of faviconAssets) {
    assertFileExists(path.join('demo', 'assets', asset));
  }

  assert.match(rootDemoHtml, /href="demo\/assets\/favicon\.ico"/);
  assert.match(rootDemoHtml, /href="site\.webmanifest"/);
  assert.match(rootDemoHtml, /content="browserconfig\.xml"/);
  assert.match(rootDemoHtml, /href="demo\/demo\.css"/);
  assert.match(rootDemoHtml, /src="demo\/demo\.js"/);
  assert.match(rootDemoHtml, /data-default-href="dist\/ui-style-kit\.css"/);
  assert.match(rootDemoHtml, /data-bridge-href="dist\/ui-style-kit\.with-bridge\.css"/);
  assert.match(packageDemoHtml, /href="assets\/favicon\.ico"/);
  assert.match(packageDemoHtml, /href="assets\/site\.webmanifest"/);
  assert.match(packageDemoHtml, /content="assets\/browserconfig\.xml"/);
  assert.match(packageDemoHtml, /href="demo\.css"/);
  assert.match(packageDemoHtml, /src="demo\.js"/);
  assert.match(packageDemoHtml, /data-default-href="\.\.\/dist\/ui-style-kit\.css"/);
  assert.match(packageDemoHtml, /data-bridge-href="\.\.\/dist\/ui-style-kit\.with-bridge\.css"/);
  assert.doesNotMatch(packageDemoHtml, /href="\/(?:favicon|site\.webmanifest|apple-touch-icon)/);

  assert.equal(rootManifest.theme_color, '#070b24');
  assert.equal(rootManifest.lang, 'en-US');
  assert.deepEqual(
    rootManifest.icons.map((icon) => icon.src),
    ['demo/assets/android-chrome-192x192.png', 'demo/assets/android-chrome-512x512.png']
  );
  assert.deepEqual(rootManifest.screenshots.map((screenshot) => screenshot.src), ['demo/assets/seo/social-card.png']);
  assert.equal(packageDemoManifest.start_url, '../');
  assert.equal(packageDemoManifest.lang, 'en-US');
  assert.deepEqual(
    packageDemoManifest.icons.map((icon) => icon.src),
    ['android-chrome-192x192.png', 'android-chrome-512x512.png']
  );
  assert.deepEqual(packageDemoManifest.screenshots.map((screenshot) => screenshot.src), ['seo/social-card.png']);
});

test('published demo HTML exposes search and social metadata', () => {
  const rootDemoHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const packageDemoHtml = fs.readFileSync(path.join(rootDir, 'demo', 'index.html'), 'utf8');
  const jsonLdMatch = rootDemoHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);

  assert.match(rootDemoHtml, /<html lang="en-US">/);
  assert.match(rootDemoHtml, /<title>UI Style Kit CSS \| CSS Theme and Component Preset Library<\/title>/);
  assert.match(rootDemoHtml, /<meta name="description" content="CSS-only UI style kit/);
  assert.match(rootDemoHtml, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.match(rootDemoHtml, /<link rel="canonical" href="https:\/\/foscat\.github\.io\/ui-style-kit-css\/">/);
  assert.match(rootDemoHtml, /<meta property="og:image" content="https:\/\/foscat\.github\.io\/ui-style-kit-css\/demo\/assets\/seo\/social-card\.png">/);
  assert.match(rootDemoHtml, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(rootDemoHtml, /A CSS-only library with 20 visual systems/);
  assert.ok(jsonLdMatch, 'Root demo should include JSON-LD structured data');

  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const softwareNode = jsonLd['@graph'].find((node) => node['@type'] === 'SoftwareSourceCode');
  assert.equal(softwareNode.name, 'UI Style Kit CSS');
  assert.equal(softwareNode.version, packageJson.version);
  assert.equal(softwareNode.codeRepository, 'https://github.com/Foscat/ui-style-kit-css');
  assert.equal(softwareNode.downloadUrl, 'https://www.npmjs.com/package/ui-style-kit-css');

  assert.match(packageDemoHtml, /<meta name="robots" content="noindex, follow">/);
  assert.match(packageDemoHtml, /<link rel="canonical" href="https:\/\/foscat\.github\.io\/ui-style-kit-css\/">/);
});

test('robots and sitemap describe the canonical demo URL', () => {
  const robots = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');

  assert.match(robots, /Sitemap: https:\/\/foscat\.github\.io\/ui-style-kit-css\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/foscat\.github\.io\/ui-style-kit-css\/<\/loc>/);
  assert.match(sitemap, /<lastmod>2026-08-29<\/lastmod>/);
  assert.match(sitemap, /<image:loc>https:\/\/foscat\.github\.io\/ui-style-kit-css\/demo\/assets\/seo\/social-card\.png<\/image:loc>/);
  assert.doesNotMatch(sitemap, /ui-style-kit-css\/index\.html/);
});
