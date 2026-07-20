import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const manifestPath = path.join(root, 'manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('Missing required file: manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const publicLayerOrder = [
  'ui-style-kit.theme_colors',
  'ui-style-kit.native_elements',
  'ui-style-kit.components',
  'ui-style-kit.presets',
  'ui-style-kit.compat_layout'
];
const required = [
  'dist/ui-style-kit.css',
  'dist/ui-style-kit.min.css',
  'dist/ui-style-kit.visual.css',
  'dist/ui-style-kit.visual.min.css',
  'dist/ui-style-kit.with-bridge.css',
  'dist/ui-style-kit.with-bridge.min.css',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'manifest.json',
  'STYLE-MAP.md',
  'styles/theme-colors.css',
  'styles/native-elements.css',
  'styles/components.css',
  'styles/compat-layout.css',
  'styles/content-overflow.css',
  'styles/interactive-surface-theme.css',
  'styles/interactive-surface-bridge.css',
  ...manifest.presets.map(({ id }) => `dist/visual/${id}.css`)
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
}
if (pkg.dependencies && Object.keys(pkg.dependencies).length) {
  throw new Error('CSS-only consumer package should not have runtime dependencies.');
}
if (lock.version !== pkg.version || lock.packages['']?.version !== pkg.version) {
  throw new Error(`package-lock.json version must match package.json version ${pkg.version}.`);
}
if (lock.packages['']?.dependencies && Object.keys(lock.packages[''].dependencies).length) {
  throw new Error('package-lock.json root package should not have runtime dependencies.');
}
if (manifest.schemaVersion !== 1 || manifest.name !== pkg.name || manifest.version !== pkg.version) {
  throw new Error('manifest.json identity and schema version must match the package release.');
}
if (JSON.stringify(manifest.cascadeLayers) !== JSON.stringify(publicLayerOrder)) {
  throw new Error('manifest.json must declare the five public cascade layers in order.');
}
if (manifest.presets.length !== 11 || manifest.themes.length !== 10 || manifest.modes.length !== 3) {
  throw new Error('manifest.json must describe all 11 presets, 10 themes, and 3 modes.');
}

const requiredScripts = [
  'build',
  'lint',
  'test',
  'test:unit',
  'test:e2e',
  'test:e2e:install:ci',
  'check:contrast',
  'check:package',
  'check:ecosystem:packs',
  'check',
  'pack:dry-run'
];
for (const scriptName of requiredScripts) {
  if (!pkg.scripts?.[scriptName]) throw new Error(`Missing script: ${scriptName}`);
}

const packageFileEntries = pkg.files ?? [];
if (packageFileEntries.some((entry) => entry === 'demo' || entry.startsWith('demo/'))) {
  throw new Error('Keep the npm package library-focused; demo assets publish through GitHub Pages only.');
}
if (!packageFileEntries.includes('manifest.json')) {
  throw new Error('manifest.json must be included in the published package.');
}

const requiredExports = [
  './dist/ui-style-kit.css',
  './dist/ui-style-kit.min.css',
  './visual',
  './visual.css',
  './visual.min.css',
  './dist/ui-style-kit.with-bridge.css',
  './dist/ui-style-kit.with-bridge.min.css',
  './with-bridge.css',
  './styles/theme-colors.css',
  './theme-colors.css',
  './styles/content-overflow.css',
  './content-overflow.css',
  './styles/minimal-saas.css',
  './cyberpunk.css',
  './styles/interactive-surface-bridge.css',
  './interactive-surface-bridge',
  './interactive-surface-theme',
  './interactive-surface-theme.css',
  './manifest.json',
  ...manifest.presets.map(({ id }) => `./visual/${id}.css`)
];
for (const key of requiredExports) {
  if (!pkg.exports[key]) throw new Error(`Missing export: ${key}`);
}

for (const [key, target] of Object.entries(pkg.exports)) {
  if (key === './package.json') continue;
  if (!fs.existsSync(path.join(root, target.replace(/^\.\//, '')))) {
    throw new Error(`Export target does not exist: ${key} -> ${target}`);
  }
}

const css = fs.readFileSync(path.join(root, 'dist/ui-style-kit.css'), 'utf8');
const minCss = fs.readFileSync(path.join(root, 'dist/ui-style-kit.min.css'), 'utf8');
const visualCss = fs.readFileSync(path.join(root, 'dist/ui-style-kit.visual.css'), 'utf8');
const visualMinCss = fs.readFileSync(path.join(root, 'dist/ui-style-kit.visual.min.css'), 'utf8');
const withBridgeCss = fs.readFileSync(path.join(root, 'dist/ui-style-kit.with-bridge.css'), 'utf8');
const withBridgeMinCss = fs.readFileSync(path.join(root, 'dist/ui-style-kit.with-bridge.min.css'), 'utf8');
const themeBridgeCss = fs.readFileSync(path.join(root, 'styles/interactive-surface-theme.css'), 'utf8');

if (!css.includes(`UI Style Kit CSS v${pkg.version}`)) {
  throw new Error(`dist/ui-style-kit.css banner must include version ${pkg.version}.`);
}
if (css.includes('--interactive-surface-border-width') || minCss.includes('--interactive-surface-border-width')) {
  throw new Error('Default dist bundle must not include the interactive surface bridge.');
}
if (
  visualCss.includes('--interactive-surface-border-width') ||
  visualMinCss.includes('--interactive-surface-border-width')
) {
  throw new Error('Visual dist bundles must not include an Interactive Surface bridge.');
}
if (
  !withBridgeCss.includes('--interactive-surface-border-width') ||
  !withBridgeMinCss.includes('--interactive-surface-border-width')
) {
  throw new Error('with-bridge dist bundle must include the interactive surface bridge.');
}

// Keep package-level validation aligned with the public cascade and layout ownership contract.
const layerDeclaration = `@layer ${publicLayerOrder.join(', ')};`;
for (const [file, contents] of [
  ['dist/ui-style-kit.css', css],
  ['dist/ui-style-kit.min.css', minCss],
  ['dist/ui-style-kit.visual.css', visualCss],
  ['dist/ui-style-kit.visual.min.css', visualMinCss]
]) {
  if (!contents.includes(layerDeclaration)) {
    throw new Error(`${file} must declare the five public cascade layers in order.`);
  }
}
if (
  !css.includes('styles/compat-layout.css') ||
  visualCss.includes('styles/compat-layout.css')
) {
  throw new Error('Only compatible default output should include the compatibility layout foundation.');
}
if (!css.includes('.saas-page') || visualCss.includes('.saas-page')) {
  throw new Error('Visual-only output must omit deprecated prefixed structural helpers.');
}

// The canonical bridge owns public tokens and paint, never interaction-state mechanics.
for (const forbidden of [
  ':hover',
  ':active',
  ':focus',
  '::before',
  'transform:',
  'opacity:',
  '--_is-',
  '!important'
]) {
  if (themeBridgeCss.includes(forbidden)) {
    throw new Error(`Canonical Interactive Surface theme bridge must not contain ${forbidden}.`);
  }
}
for (const requiredToken of [
  '--interactive-surface-bg',
  '--interactive-surface-level-1-bg',
  '--interactive-surface-level-3-shadow'
]) {
  if (!themeBridgeCss.includes(requiredToken)) {
    throw new Error(`Canonical Interactive Surface theme bridge must define ${requiredToken}.`);
  }
}

console.log('Package integrity check passed.');
