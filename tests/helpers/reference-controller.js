/**
 * @module tests/helpers/reference-controller
 * @description Loads maintained reference declarations with explicit browser boundaries for unit contracts.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { buildSync } from 'esbuild';
import { specimenEntries } from '../../demo/studio/specimen-inventory.js';
const source = fs.readFileSync('demo/studio/reference.js', 'utf8');
const declarations = source.slice(0, source.lastIndexOf('\nsyncManifestSelectOptions();'));
const exports = [
  'main',
  'renderTemplateReferences',
  'renderStyleSpecificGallery',
  'renderActiveTemplateSpecimen',
  'updateStyleFeatureRange',
  'syncPrimaryNavCurrent',
  'renderMedallionIcon',
  'applyPaletteSelection',
  'getActiveColorTokens',
  'setTokenOverride',
  'resetTokenOverride',
  'buildThemeOverrideCss',
  'getThemeUsageStatement',
  'syncManifestSelectOptions',
  'resetPaletteOverrides',
  'applyDemoQuerySelection',
];
const compiled = buildSync({
  stdin: {
    contents: declarations + '\nexport { ' + exports.join(',') + ' };',
    resolveDir: path.resolve('demo/studio'),
    sourcefile: 'reference-contract.js',
  },
  bundle: true,
  format: 'iife',
  globalName: 'ReferenceContract',
  write: false,
  logLevel: 'silent',
}).outputFiles[0].text;

/** Loads actual source functions and compiled shared specimens without browser initialization.
 * @param {Object} sandbox Injected browser contracts.
 * @returns {Object} Functions and observable test boundaries in one isolated context.
 */
export function loadReferenceController(sandbox) {
  const context = vm.createContext({
    URL,
    URLSearchParams,
    AbortController,
    CSS: { escape: (value) => value },
    ...sandbox,
  });
  context.location ??= {
    pathname: '/demo/reference.html',
    href: 'https://demo.example/demo/reference.html',
  };
  const inventory = {};
  vm.runInNewContext(fs.readFileSync('demo/demo-manifest.js', 'utf8'), { window: inventory });
  context.window.UI_STYLE_KIT_MANIFEST = inventory.UI_STYLE_KIT_MANIFEST;
  const main = context.document.getElementById('main');
  main.ownerDocument = context.document;
  for (const entry of specimenEntries)
    vm.runInContext(fs.readFileSync('demo/' + entry.file, 'utf8'), context);
  vm.runInContext(compiled, context);
  return Object.assign(context, context.ReferenceContract);
}
