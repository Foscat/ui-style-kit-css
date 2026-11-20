/**
 * @module scripts/build-studio
 * @description Produces offline-capable studio assets and HTML; demo.css and studio.css remain authored files.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { specimenEntries } from '../demo/studio/specimen-inventory.js';
import {
  ICON_ALIASES,
  ICON_VERSION,
  STUDIO_ICON_NAMES,
  decorateIcon,
} from '../demo/studio/icons.js';
import { syncDemoAssetVersions, versionDemoAssetUrls } from './sync-demo-asset-versions.mjs';
import { writeGeneratedFile, copyGeneratedFile } from './write-generated-file.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
/** Builds lazy family assets directly from the pinned companion package.
 * Compatibility registry names retain existing specimen bindings while artwork comes from one source.
 * @param {Object} manifest Public UI preset inventory.
 * @returns {Promise<Object>} Companion version and explicit studio defaults.
 */
async function buildStudioIcons(manifest) {
  const demo = path.join(root, 'demo');
  const iconRoot = path.join(root, 'node_modules/ui-style-kit-icons');
  const metadata = JSON.parse(await fs.readFile(path.join(iconRoot, 'manifest.json'), 'utf8'));
  if (metadata.version !== ICON_VERSION) throw new Error('Icon package and setup version differ.');
  const registries = [
    ['lucide', 'demo-icons.js', 'UI_STYLE_KIT_ICONS'],
    ['phosphor', 'demo-organic-icons.js', 'ORGANIC_PHOSPHOR_ICONS'],
  ];
  const namesByRegistry = [];
  for (const [folder, file, globalName] of registries) {
    const names = (await fs.readdir(path.join(demo, 'assets', folder)))
      .filter((name) => name.endsWith('.svg'))
      .map((name) => name.slice(0, -4))
      .sort();
    namesByRegistry.push({ names, file, globalName });
  }
  const canonical = (name) => ICON_ALIASES[name] ?? name;
  const names = [
    ...new Set([
      ...STUDIO_ICON_NAMES,
      ...namesByRegistry.flatMap((registry) => registry.names.map(canonical)),
    ]),
  ].sort();
  await fs.mkdir(path.join(demo, 'icon-packs'), { recursive: true });
  await fs.mkdir(path.join(demo, 'vendor'), { recursive: true });
  for (const { id } of manifest.presets) {
    if (!metadata.styles[id]) throw new Error('No companion icon family for ' + id);
    const data = { monochrome: {}, themed: {} };
    for (const variant of ['monochrome', 'themed'])
      for (const name of names)
        data[variant][name] = await fs.readFile(
          path.join(iconRoot, variant === 'themed' ? 'svg' : 'monochrome', id, name + '.svg'),
          'utf8',
        );
    await fs.mkdir(path.join(demo, 'icon-packs', id), { recursive: true });
    for (const variant of ['monochrome', 'themed'])
      await writeGeneratedFile(
        path.join(demo, 'icon-packs', id, variant + '.js'),
        '/* Generated from ui-style-kit-icons@' +
          ICON_VERSION +
          '; licensed package artwork. */\nwindow.UI_STYLE_KIT_ICON_ASSETS ??= {};\nwindow.UI_STYLE_KIT_ICON_ASSETS[' +
          JSON.stringify(id) +
          '] ??= {};\nwindow.UI_STYLE_KIT_ICON_ASSETS[' +
          JSON.stringify(id) +
          '][' +
          JSON.stringify(variant) +
          '] = ' +
          JSON.stringify(data[variant]) +
          ';\n',
      );
    const obsolete = path.join(demo, 'icon-packs', id + '.js');
    const old = await fs.readFile(obsolete, 'utf8').catch(() => '');
    if (old.startsWith('/* Generated from ui-style-kit-icons@')) await fs.unlink(obsolete);
    if (id === 'minimal-saas')
      for (const registry of namesByRegistry) {
        const icons = Object.fromEntries(
          registry.names.map((name) => [
            name,
            decorateIcon(
              data.monochrome[canonical(name)],
              canonical(name),
              { pack: id, variant: 'monochrome' },
              true,
            ),
          ]),
        );
        await writeGeneratedFile(
          path.join(demo, registry.file),
          '/* Generated from ui-style-kit-icons@' +
            ICON_VERSION +
            '; retained specimen registry. */\nwindow.' +
            registry.globalName +
            ' = ' +
            JSON.stringify(icons, null, 2) +
            ';\n',
        );
      }
  }
  await copyGeneratedFile(
    path.join(iconRoot, 'dist/ui-style-kit-icons.css'),
    path.join(demo, 'vendor/icons.css'),
  );
  await copyGeneratedFile(
    path.join(iconRoot, 'LICENSE'),
    path.join(demo, 'vendor/icons-LICENSE.txt'),
  );
  return {
    version: ICON_VERSION,
    defaultPack: 'minimal-saas',
    defaultVariant: 'monochrome',
    names,
  };
}

/** Compiles one authoritative entry to a compact classic script and linked content-versioned map.
 * @param {string} source Repository-relative authored entry.
 * @param {string} output Repository-relative generated output.
 * @returns {Promise<void>} Resolves when both artifacts are current.
 */
async function compileSource(source, output) {
  const result = await build({
    entryPoints: [path.join(root, source)],
    outfile: path.join(root, output),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: 'external',
    sourcesContent: true,
    write: false,
    legalComments: 'inline',
    banner: { js: '/* Generated by scripts/build-studio.mjs; edit authored source. */' },
    logLevel: 'silent',
  });
  const map = result.outputFiles.find((file) => file.path.endsWith('.map'));
  const script = result.outputFiles.find((file) => !file.path.endsWith('.map'));
  const hash = crypto.createHash('sha256').update(map.contents).digest('hex').slice(0, 12);
  await writeGeneratedFile(path.join(root, output + '.map'), map.text);
  await writeGeneratedFile(
    path.join(root, output),
    script.text + '\n//# sourceMappingURL=' + path.basename(output) + '.map?v=' + hash + '\n',
  );
}

/** Lists only authored files in stable order, including nested specimen modules.
 * @param {string} directory Source root.
 * @returns {Promise<string[]>} Recursive file inventory.
 */
async function authoredFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await authoredFiles(filename)));
    else files.push(filename);
  }
  return files.sort();
}

/** Compiles explicit specimen sources shared by both demo consumers.
 * @returns {Promise<void>} Resolves after every canonical entry is built.
 */
async function buildAuthoredSpecimens() {
  const directory = path.join(root, 'demo/specimens');
  const current = new Set(specimenEntries.map((entry) => path.basename(entry.file)));
  for (const name of await fs.readdir(directory)) {
    if (!name.endsWith('.js') || current.has(name)) continue;
    const filename = path.join(directory, name);
    const content = await fs.readFile(filename, 'utf8');
    if (content.startsWith('/* Generated by scripts/build-studio.mjs')) {
      await fs.unlink(filename);
      await fs.unlink(filename + '.map').catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }
  for (const entry of specimenEntries)
    await compileSource('demo/studio/' + entry.source, 'demo/' + entry.file);
}

/** Builds the studio without altering the CSS library's public runtime contract.
 * @returns {Promise<void>} Resolves after bundles, manifest, chrome, and hashes align.
 */
export async function buildStudio() {
  const demo = path.join(root, 'demo');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
  const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const icons = await buildStudioIcons(manifest);
  const sourceFiles = [
    ...(await authoredFiles(path.join(demo, 'studio'))),
    path.join(demo, 'demo.css'),
    path.join(demo, 'studio.css'),
  ];
  const digest = crypto.createHash('sha256');
  for (const name of sourceFiles.sort()) digest.update(await fs.readFile(name));
  for (const name of [
    'manifest.json',
    'package-lock.json',
    'scripts/build-studio.mjs',
    'dist/ui-style-kit.visual.css',
    'styles/interactive-surface-theme.css',
  ])
    digest.update(await fs.readFile(path.join(root, name)));
  const buildId = digest.digest('hex').slice(0, 12);
  const paletteRoles = {};
  for (const { id, prefix } of manifest.presets) {
    const source = await fs.readFile(path.join(root, 'styles', id + '.css'), 'utf8');
    paletteRoles[id] = [
      ...new Set(
        [...source.matchAll(new RegExp('--' + prefix + '-([a-z][a-z0-9-]*)-rgb\\s*:', 'g'))]
          .map((match) => match[1])
          .filter((role) => !role.startsWith('fallback-')),
      ),
    ];
  }
  await fs.mkdir(path.join(demo, 'vendor'), { recursive: true });
  for (const [source, target] of [
    ['node_modules/layout-style-css/dist/layout-style-css.css', 'layout.css'],
    ['node_modules/interactive-surface-css/state-core.css', 'state-core.css'],
    [
      'node_modules/@sanderson-technology-enterprises/motion-style-css/src/motion.css',
      'motion.css',
    ],
  ])
    await copyGeneratedFile(path.join(root, source), path.join(demo, 'vendor', target));
  for (const [name, folder] of [
    ['layout', 'layout-style-css'],
    ['interaction', 'interactive-surface-css'],
    ['motion', '@sanderson-technology-enterprises/motion-style-css'],
  ]) {
    await copyGeneratedFile(
      path.join(root, 'node_modules', folder, 'LICENSE'),
      path.join(demo, 'vendor', name + '-LICENSE.txt'),
    );
  }
  for (const [entry, outfile] of [
    ['app.js', 'studio.js'],
    ['frame.js', 'preview.js'],
    ['specimens.js', 'studio-specimens.js'],
    ['reference.js', 'demo.js'],
  ]) {
    await compileSource('demo/studio/' + entry, 'demo/' + outfile);
  }
  await buildAuthoredSpecimens();
  const styleHashes = {};
  for (const { id } of manifest.presets)
    styleHashes[id] = crypto
      .createHash('sha256')
      .update(await fs.readFile(path.join(root, 'dist/visual', id + '.css')))
      .digest('hex')
      .slice(0, 12);
  const runtime = {
    presets: manifest.presets,
    themes: manifest.themes,
    modes: manifest.modes,
    guidedCorners: manifest.guidedCorners,
    paletteRoles,
    icons,
    specimens: Object.fromEntries(
      specimenEntries.flatMap((entry) =>
        entry.ids.map((id) => [id, { file: entry.file, template: entry.template }]),
      ),
    ),
    studio: { version: pkg.version, buildId, styles: styleHashes },
  };
  await writeGeneratedFile(
    path.join(demo, 'demo-manifest.js'),
    '/* Generated from manifest.json by scripts/build-studio.mjs. */\nwindow.UI_STYLE_KIT_MANIFEST = ' +
      JSON.stringify(runtime, null, 2) +
      ';\n',
  );
  const shell = await fs.readFile(path.join(demo, 'studio/shell.html'), 'utf8');
  for (const [file, demoPrefix, rootPrefix] of [
    ['index.html', 'demo/', ''],
    ['demo/index.html', '', '../'],
  ]) {
    let html = shell
      .replaceAll('{{demo}}', demoPrefix)
      .replaceAll('{{root}}', rootPrefix)
      .replaceAll('{{version}}', pkg.version)
      .replaceAll(
        '{{robots}}',
        file === 'index.html' ? 'index, follow, max-image-preview:large' : 'noindex, follow',
      );
    const options = {
      uiSelect: manifest.presets
        .map(
          ({ id, label, prefix }) =>
            '<option value="' +
            id +
            '" data-prefix="' +
            prefix +
            '"' +
            (id === 'minimal-saas' ? ' selected' : '') +
            '>' +
            label +
            '</option>',
        )
        .join(''),
      themeSelect:
        '<option value="" selected>Style defaults</option>' +
        manifest.themes
          .map((theme) => '<option value="' + theme + '">' + theme + '</option>')
          .join(''),
      modeSelect: manifest.modes
        .map(
          (mode) =>
            '<option value="' +
            mode +
            '"' +
            (mode === 'light' ? ' selected' : '') +
            '>' +
            mode +
            '</option>',
        )
        .join(''),
      cornersSelect:
        '<option value="" selected>Preset default</option>' +
        manifest.guidedCorners.values
          .map((value) => {
            const label = value === 'none' ? 'Square' : value[0].toUpperCase() + value.slice(1);
            return '<option value="' + value + '">' + label + '</option>';
          })
          .join(''),
    };
    for (const [id, markup] of Object.entries(options))
      html = html.replaceAll('{{' + id + 'Options}}', markup);
    await writeGeneratedFile(path.join(root, file), versionDemoAssetUrls(root, file, html));
  }
  const preview =
    '<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Style preview</title><link rel="stylesheet" href="../styles/component-composition.css"><link rel="stylesheet" href="vendor/icons.css"><link rel="stylesheet" href="vendor/layout.css"><link rel="stylesheet" href="../styles/interactive-surface-theme.css"><link rel="stylesheet" href="vendor/state-core.css"><link rel="stylesheet" href="demo.css"><script defer src="demo-manifest.js"></script><script defer src="preview.js"></script></head><body class="ly-root ly-page usk-icons-theme" data-ly-layout="minimal-saas" data-ly-density="normal" data-ui="minimal-saas" data-mode="light"><main id="preview-root" data-ui-structure="neutral"></main></body></html>\n';
  await writeGeneratedFile(
    path.join(demo, 'preview.html'),
    versionDemoAssetUrls(root, 'demo/preview.html', preview),
  );
  await syncDemoAssetVersions(root);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildStudio();
