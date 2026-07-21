import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const packageLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatApproxKb(byteLength) {
  return `~${Math.round(byteLength / 1024)} KB`;
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
  const requiredFiles = ['dist', 'styles', 'README.md', 'LICENSE'];
  for (const item of requiredFiles) {
    assert.ok(packageJson.files.includes(item), `package.json files[] should include ${item}`);
  }

  assert.ok(
    !packageJson.files.some((item) => item === 'demo' || item.startsWith('demo/')),
    'package.json files[] should keep preview-only demo assets out of the npm tarball'
  );
});

test('README documents the library system and theme override flow', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');

  assert.match(readme, /```mermaid/);
  assert.match(readme, /layout-style-css/);
  assert.match(readme, /interactive-surface-css/);
  assert.match(readme, /Demo token workbench/);
  assert.match(readme, /v2\.0\.4/);
  assert.match(readme, /ui-style-kit-css@2\.0\.3/);
  assert.match(readme, /Ecosystem compatibility/);
  assert.match(readme, /ui-style-kit-css@2\.0\.4/);
  assert.match(readme, /interactive-surface-css@1\.3\.0/);
  assert.match(readme, /layout-style-css@1\.1\.2/);
});

test('README bundle size guide matches current built CSS output', () => {
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  // Keep the public size table honest whenever generated CSS changes.
  const sizeExpectations = [
    ['ui-style-kit-css/dist/ui-style-kit.min.css', 'dist/ui-style-kit.min.css', 'Runtime UI-system switchers and demos'],
    ['ui-style-kit-css/with-bridge.css', 'dist/ui-style-kit.with-bridge.css', 'Runtime switchers plus Interactive Surface bridge'],
    ['ui-style-kit-css/theme-colors.css', 'styles/theme-colors.css', 'Shared color schemes for standalone style imports'],
    ['ui-style-kit-css/native-elements.css', 'styles/native-elements.css', 'Shared native HTML fallback styling'],
    ['ui-style-kit-css/content-overflow.css', 'styles/content-overflow.css', 'Shared long-text containment for standalone style imports']
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
    assert.match(contents, /ui-style-kit-css@2\.0\.4/);
    assert.match(contents, /interactive-surface-css@1\.3\.0/);
    assert.match(contents, /layout-style-css@1\.1\.2/);
    assert.match(contents, /Use one/);
    assert.match(contents, /Use two/);
    assert.match(contents, /Use all three/);
    assert.match(contents, /visual identity/);
    assert.match(contents, /interaction-state/);
    assert.match(contents, /structural/);
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
    'test:e2e:install:ci',
    'check:contrast',
    'check:package',
    'check',
    'pack:dry-run',
    'release:verify'
  ];

  for (const scriptName of requiredScripts) {
    assert.equal(typeof packageJson.scripts?.[scriptName], 'string', `Missing script: ${scriptName}`);
    assert.notEqual(packageJson.scripts[scriptName].trim(), '', `Script should not be empty: ${scriptName}`);
  }
});

test('release verification script is non-publishing and covers the 2.0.4 release gate', () => {
  const releaseVerify = packageJson.scripts['release:verify'] ?? '';
  const requiredCommands = [
    'npm run check',
    'npm run test:e2e',
    'npm run test:visual',
    'npm audit --audit-level=moderate',
    'npm run pack:dry-run'
  ];

  for (const command of requiredCommands) {
    assert.match(releaseVerify, new RegExp(escapeRegExp(command)), `release:verify should run ${command}`);
  }

  // Keep the hotfix verification gate safe for approval-gated release preparation.
  assert.doesNotMatch(releaseVerify, /\bnpm\s+(?:publish|version)\b/);
  assert.doesNotMatch(releaseVerify, /\bgit\s+tag\b/);
  assert.equal(packageJson.scripts.prepublishOnly, 'npm run release:verify');
});

test('package metadata is aligned for the release version', () => {
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[''].version, packageJson.version);
  assert.deepEqual(packageJson.dependencies || {}, {});
  assert.deepEqual(packageLock.packages[''].dependencies || {}, {});

  const css = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  assert.match(css, new RegExp(`UI Style Kit CSS v${escapeRegExp(packageJson.version)}`));
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

  assert.match(bridgeCss, /--interactive-surface-bg:\s*rgb\(var\(--usk-surface-strong-rgb,/);
  assert.match(bridgeCss, /--interactive-surface-fg:\s*rgb\(var\(--usk-text-rgb\)\)/);
  assert.match(bridgeCss, /--interactive-surface-variant-primary-bg:\s*rgb\(var\(--usk-primary-rgb\)\)/);

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

test('content overflow contract is shared by standalone styles and bundles', () => {
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
  const bundledCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.css'), 'utf8');
  const minCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.min.css'), 'utf8');

  assert.match(overflowCss, /@layer ui-style-kit\.content_overflow/);
  assert.match(overflowCss, /overflow-wrap:\s*anywhere/);
  assert.match(overflowCss, /white-space:\s*normal/);
  assert.match(bundledCss, /styles\/content-overflow\.css/);
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
    './minimal-saas.css',
    './content-overflow.css',
    './styles/cyberpunk.css',
    './interactive-surface-bridge',
    './with-bridge.css'
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
  assert.match(rootDemoHtml, /A CSS-only library with 11 visual systems/);
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
  assert.match(sitemap, /<lastmod>2026-07-11<\/lastmod>/);
  assert.match(sitemap, /<image:loc>https:\/\/foscat\.github\.io\/ui-style-kit-css\/demo\/assets\/seo\/social-card\.png<\/image:loc>/);
  assert.doesNotMatch(sitemap, /ui-style-kit-css\/index\.html/);
});
