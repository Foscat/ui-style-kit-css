import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
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
  'styles/retro-glass.css',
  'styles/interactive-surface-bridge.css'
];

const layerOrder = [
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

const banner = `/*!\n * UI Style Kit CSS v${JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version}\n * CSS theme and UI style preset library.\n * License: MIT\n */\n\n@layer ${layerOrder};\n`;

function readFile(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing stylesheet: ${file}`);
  return fs.readFileSync(absolute, 'utf8').trim();
}

function minifyCss(css) {
  return css
    .replace(/\/\*(?!\!)[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

const bundle = banner + files.map((file) => `\n/* ${file} */\n${readFile(file)}\n`).join('\n');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'ui-style-kit.css'), bundle);
fs.writeFileSync(path.join(dist, 'ui-style-kit.min.css'), minifyCss(bundle));

console.log('Built dist/ui-style-kit.css and dist/ui-style-kit.min.css');
