#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { transform } = require('lightningcss');

const rootDir = path.resolve(__dirname, '..');
const stylesDir = path.join(rootDir, 'styles');
const distDir = path.join(rootDir, 'dist');

const styleFiles = [
  'minimal-saas.css',
  'bento.css',
  'maximalist.css',
  'bauhaus.css',
  'tactile.css',
  'neumorphism.css',
  'retrofuturism.css',
  'brutalism.css',
  'cyberpunk.css',
  'y2k.css',
  'retro-glass.css',
  'interactive-surface-bridge.css'
];

const fullBanner = [
  '/* =========================================================',
  '   UI Style Kit CSS',
  '   All-in-one library build.',
  '   UI systems: Minimal SaaS, Bento, Maximalist, Bauhaus, Tactile, Neumorphism,',
  '   Retrofuturism, Brutalism, Cyberpunk, Y2K, Retro Glass.',
  '========================================================= */'
].join('\n');

const minBanner = [
  '/*!',
  ' * UI Style Kit CSS',
  ' * All-in-one library build.',
  ' * UI systems: Minimal SaaS, Bento, Maximalist, Bauhaus, Tactile, Neumorphism,',
  ' * Retrofuturism, Brutalism, Cyberpunk, Y2K, Retro Glass.',
  ' */'
].join('\n');

function readStyleFile(filename) {
  const filePath = path.join(stylesDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing style source file: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) {
    throw new Error(`Style source file is empty: ${filePath}`);
  }

  return content;
}

function build() {
  const cssChunks = styleFiles.map(readStyleFile);
  const fullCss = `${fullBanner}\n\n${cssChunks.join('\n\n')}\n`;

  fs.mkdirSync(distDir, { recursive: true });

  const fullOutputPath = path.join(distDir, 'ui-style-kit.css');
  fs.writeFileSync(fullOutputPath, fullCss, 'utf8');

  const { code } = transform({
    filename: 'ui-style-kit.css',
    code: Buffer.from(fullCss),
    minify: true,
    sourceMap: false
  });

  const minOutputPath = path.join(distDir, 'ui-style-kit.min.css');
  fs.writeFileSync(minOutputPath, `${minBanner}\n${code.toString()}`, 'utf8');

  console.log(`Built ${path.relative(rootDir, fullOutputPath)} and ${path.relative(rootDir, minOutputPath)}.`);
}

build();
