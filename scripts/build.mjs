import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const themeColorFile = 'styles/theme-colors.css';
const nativeElementsFile = 'styles/native-elements.css';
const contentOverflowFile = 'styles/content-overflow.css';
const styleFiles = [
  themeColorFile,
  nativeElementsFile,
  contentOverflowFile,
  'styles/minimal-saas.css',
  'styles/bento.css',
  'styles/maximalist.css',
  'styles/bauhaus.css',
  'styles/tactile.css',
  'styles/neumorphism.css',
  'styles/retrofuturism.css',
  'styles/brutalism.css',
  'styles/cyberpunk.css',
  'styles/y2k.css',
  'styles/retro-glass.css'
];
const bridgeFile = 'styles/interactive-surface-bridge.css';
const themeNames = [
  'midnight-gold',
  'ocean-steel',
  'forest-moss',
  'sunset-ember',
  'royal-plum',
  'graphite-cyan',
  'desert-sage',
  'rose-quartz',
  'cyber-lime',
  'arctic-indigo'
];
const modeNames = ['light', 'dark', 'contrast'];
const stylePrefixes = new Map([
  ['styles/minimal-saas.css', ['minimal-saas', 'saas']],
  ['styles/bento.css', ['bento', 'bento']],
  ['styles/maximalist.css', ['maximalist', 'max']],
  ['styles/bauhaus.css', ['bauhaus', 'bau']],
  ['styles/tactile.css', ['tactile', 'tactile']],
  ['styles/neumorphism.css', ['neumorphism', 'neo']],
  ['styles/retrofuturism.css', ['retrofuturism', 'retro']],
  ['styles/brutalism.css', ['brutalism', 'brutal']],
  ['styles/cyberpunk.css', ['cyberpunk', 'cyber']],
  ['styles/y2k.css', ['y2k', 'y2k']],
  ['styles/retro-glass.css', ['retro-glass', 'rg']]
]);
const colorRoles = [
  'bg',
  'surface',
  'surface-strong',
  'surface-soft',
  'text',
  'text-muted',
  'border',
  'primary',
  'primary-hover',
  'primary-text',
  'secondary',
  'secondary-hover',
  'secondary-text',
  'accent',
  'success',
  'warning',
  'danger',
  'link',
  'accent-text',
  'success-text',
  'warning-text',
  'danger-text',
  'focus'
];

const layerOrder = [
  'ui-style-kit.theme_colors',
  'ui-style-kit.native_elements',
  'ui-style-kit.content_overflow',
  'ui-style-kit.minimal_saas',
  'ui-style-kit.bento',
  'ui-style-kit.maximalist',
  'ui-style-kit.bauhaus',
  'ui-style-kit.tactile',
  'ui-style-kit.neumorphism',
  'ui-style-kit.retrofuturism',
  'ui-style-kit.brutalism',
  'ui-style-kit.cyberpunk',
  'ui-style-kit.y2k',
  'ui-style-kit.retro_glass'
].join(', ');

const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const banner = `/*!\n * UI Style Kit CSS v${version}\n * CSS theme and UI style preset library.\n * License: MIT\n */\n\n@layer ${layerOrder};\n`;

function readFile(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing stylesheet: ${file}`);
  const css = prepareUiCss(file, fs.readFileSync(absolute, 'utf8'));

  // Standalone UI themes import shared dependencies; bundles include each shared sheet once.
  return css
    .replace(/^@import url\("\.\/theme-colors\.css"\);\s*/m, '')
    .replace(/^@import url\("\.\/native-elements\.css"\);\s*/m, '')
    .replace(/^@import url\("\.\/content-overflow\.css"\);\s*/m, '')
    .trim();
}

function minifyCss(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function sharedColorAliases(prefix) {
  const aliases = colorRoles.map((role) => `  --${prefix}-${role}-rgb: var(--usk-${role}-rgb);`);
  return [
    '  /* Shared scheme aliases preserve the existing prefixed token API. */',
    ...aliases
  ].join('\n');
}

function prepareUiCss(file, css) {
  const styleInfo = stylePrefixes.get(file);
  if (!styleInfo) return css;

  const [ui, prefix] = styleInfo;
  let prepared = css;
  const genericToken = `\n  --${prefix}-bg:`;
  const genericIndex = prepared.indexOf(`[data-ui="${ui}"][data-theme][data-mode] {`);
  const aliasIndex = prepared.indexOf(genericToken, genericIndex);

  if (genericIndex === -1 || aliasIndex === -1) throw new Error(`Missing semantic color block in ${file}`);
  if (!prepared.includes(`--${prefix}-bg-rgb: var(--usk-bg-rgb);`)) {
    prepared = `${prepared.slice(0, aliasIndex + 1)}${sharedColorAliases(prefix)}\n${prepared.slice(aliasIndex + 1)}`;
  }

  for (const themeName of themeNames) {
    for (const modeName of modeNames) {
      const re = new RegExp(`\\n\\[data-ui="${ui}"\\]\\[data-theme="${themeName}"\\]\\[data-mode="${modeName}"\\]\\s*\\{[\\s\\S]*?\\}\\n`, 'm');
      prepared = prepared.replace(re, '\n');
    }
  }

  return prepared;
}

function bundle(files) {
  return banner + files.map((file) => `\n/* ${file} */\n${readFile(file)}\n`).join('\n');
}

const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const baseBundle = bundle(styleFiles);
const bridgeBundle = bundle([...styleFiles, bridgeFile]);

fs.writeFileSync(path.join(dist, 'ui-style-kit.css'), baseBundle);
fs.writeFileSync(path.join(dist, 'ui-style-kit.min.css'), minifyCss(baseBundle));
fs.writeFileSync(path.join(dist, 'ui-style-kit.with-bridge.css'), bridgeBundle);
fs.writeFileSync(path.join(dist, 'ui-style-kit.with-bridge.min.css'), minifyCss(bridgeBundle));

console.log('Built dist/ui-style-kit.css, dist/ui-style-kit.min.css, dist/ui-style-kit.with-bridge.css, and dist/ui-style-kit.with-bridge.min.css');
