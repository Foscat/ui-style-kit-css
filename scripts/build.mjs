import fs from 'node:fs';
import path from 'node:path';
import { generate, parse, walk } from 'css-tree';
import { transform } from 'lightningcss';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const publicManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const themeColorFile = 'styles/theme-colors.css';
const nativeElementsFile = 'styles/native-elements.css';
const componentsFile = 'styles/components.css';
const compatibilityLayoutFile = 'styles/compat-layout.css';
const legacyBridgeFile = 'styles/interactive-surface-bridge.css';
const foundationFiles = [themeColorFile, nativeElementsFile, componentsFile];
const presetFiles = publicManifest.presets.map(({ id, prefix }) => ({
  id,
  prefix,
  file: `styles/${id}.css`
}));
const stylePrefixes = new Map(presetFiles.map(({ file, id, prefix }) => [file, [id, prefix]]));
const semanticEntries = Object.values(publicManifest.semanticComponentApi.selectorsByRole).flat();
const implementedSemanticSelectors = new Set(
  publicManifest.semanticComponentApi.implementationStatus.implemented?.selectors ?? []
);
const semanticAliases = semanticEntries
  .filter(({ selector }) => implementedSemanticSelectors.has(selector))
  .map(({ selector, sourceSuffix }) => ({
    selector,
    sourceSuffix,
    variants: publicManifest.semanticComponentApi.variantAttribute.valuesBySelector[selector] ?? []
  }));
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
const compatibilitySuffixes = new Set(publicManifest.classApi.deprecatedStructuralSuffixes);
const layerOrder = publicManifest.cascadeLayers.join(', ');

if (publicManifest.version !== packageJson.version) {
  throw new Error(`manifest.json version must match package.json version ${packageJson.version}.`);
}

const banner = `/*!
 * UI Style Kit CSS v${packageJson.version}
 * CSS theme and UI style preset library.
 * License: MIT
 */

@layer ${layerOrder};
`;

function readSource(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing stylesheet: ${file}`);

  return prepareUiCss(file, fs.readFileSync(absolute, 'utf8'));
}

function minifyCss(css, filename) {
  // Parse before minifying so grammar-sensitive selector and calc whitespace remains valid.
  const minified = transform({
    filename,
    code: Buffer.from(css),
    minify: true
  }).code.toString();
  const bannerEnd = minified.indexOf('*/') + 2;

  if (bannerEnd < 2) throw new Error(`Missing release banner in ${filename}`);

  // Lightning CSS may elide a redundant order statement, but it is part of the public contract.
  return `${minified.slice(0, bannerEnd)}\n@layer ${layerOrder};${minified.slice(bannerEnd)}`;
}

function formatGeneratedCss(css, filename) {
  const result = transform({
    filename,
    code: Buffer.from(css),
    minify: false
  });

  if (result.warnings.length > 0) {
    throw new Error(`Lightning CSS reported warnings while formatting ${filename}.`);
  }

  return result.code.toString().trim();
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function aliasSemanticSelector(selector) {
  let aliased = selector;

  for (const preset of presetFiles) {
    for (const semanticAlias of semanticAliases) {
      for (const variant of semanticAlias.variants) {
        const sourceClass = `${preset.prefix}-${semanticAlias.sourceSuffix}-${variant}`;
        const semanticClass = `${semanticAlias.selector}:where([data-ui-variant="${variant}"])`;
        aliased = aliased.replace(
          new RegExp(`\\.${escapeRegularExpression(sourceClass)}(?![a-zA-Z0-9_-])`, 'g'),
          semanticClass
        );
      }

      const sourceClass = `${preset.prefix}-${semanticAlias.sourceSuffix}`;
      aliased = aliased.replace(
        new RegExp(`\\.${escapeRegularExpression(sourceClass)}(?![a-zA-Z0-9_-])`, 'g'),
        semanticAlias.selector
      );
    }
  }

  return aliased === selector ? null : aliased;
}

function addSemanticAliases(css, filename, selectedPresets) {
  if (semanticAliases.length === 0) return css;

  const ast = parse(css, { filename, positions: true });
  const selectedRoot = `:where(${selectedPresets
    .map(({ id }) => `[data-ui="${id}"]`)
    .join(', ')})`;
  const selectorEdits = [];

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const originalSelectorList = generate(rule.prelude);
      const aliases = rule.prelude.children.toArray()
        .map((selector) => aliasSemanticSelector(generate(selector)))
        .filter(Boolean)
        .map((selector) => {
          // Preset-authored selectors sometimes carry their own exact root already.
          const hasSelectedRoot = selectedPresets.some(({ id }) =>
            selector.includes(`[data-ui="${id}"]`)
          );
          return hasSelectedRoot ? selector : `${selectedRoot} ${selector}`;
        });

      if (aliases.length === 0) return;
      selectorEdits.push({
        start: rule.prelude.loc.start.offset,
        end: rule.prelude.loc.end.offset,
        value: `${css.slice(rule.prelude.loc.start.offset, rule.prelude.loc.end.offset)}, ${[
          ...new Set(aliases)
        ].join(', ')}`
      });
    }
  });

  // Selector-only edits keep every authored declaration byte-for-byte single-sourced.
  return selectorEdits
    .sort((first, second) => second.start - first.start)
    .reduce(
      (output, edit) => `${output.slice(0, edit.start)}${edit.value}${output.slice(edit.end)}`,
      css
    );
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

  for (const themeName of publicManifest.themes) {
    for (const modeName of publicManifest.modes) {
      const re = new RegExp(`\\n\\[data-ui="${ui}"\\]\\[data-theme="${themeName}"\\]\\[data-mode="${modeName}"\\]\\s*\\{[\\s\\S]*?\\}\\n`, 'm');
      prepared = prepared.replace(re, '\n');
    }
  }

  return prepared;
}

function parseStylesheet(file) {
  return parse(readSource(file), {
    filename: file,
    positions: true
  });
}

function removeImports(ast) {
  walk(ast, {
    visit: 'Atrule',
    enter(node, item, list) {
      if (node.name === 'import') list.remove(item);
    }
  });
}

function setPresetLayer(ast, layerName) {
  walk(ast, {
    visit: 'Atrule',
    enter(node) {
      if (node.name === 'layer' && node.block) {
        node.prelude = parse(layerName, {
          context: 'atrulePrelude',
          atrule: 'layer'
        });
      }
    }
  });
}

function ruleUsesCompatibilityLayout(rule, prefix) {
  let usesCompatibilityLayout = false;

  walk(rule.prelude, {
    visit: 'ClassSelector',
    enter(node) {
      const prefixStart = `${prefix}-`;
      if (!node.name.startsWith(prefixStart)) return;

      const suffix = node.name.slice(prefixStart.length);
      if (compatibilitySuffixes.has(suffix)) usesCompatibilityLayout = true;
    }
  });

  return usesCompatibilityLayout;
}

function removeEmptyAtRules(ast) {
  walk(ast, {
    visit: 'Atrule',
    leave(node, item, list) {
      if (node.block && node.block.children.size === 0) list.remove(item);
    }
  });
}

function ruleTargetsPresetRoot(rule, id) {
  return generate(rule.prelude).split(',')
    .some((selector) => selector.trim() === `[data-ui="${id}"]`);
}

function ruleHasViewportLayoutDeclaration(rule) {
  let hasViewportLayout = false;

  rule.block.children.forEach((node) => {
    if (node.type === 'Declaration' && node.property === 'min-height') {
      hasViewportLayout = true;
    }
  });

  return hasViewportLayout;
}

function filterViewportLayoutDeclarations(rule, keepViewportLayout) {
  rule.block.children.forEach((node, item, list) => {
    if (node.type !== 'Declaration') return;

    const viewportLayoutDeclaration = node.property === 'min-height';
    if (viewportLayoutDeclaration !== keepViewportLayout) list.remove(item);
  });
}

function preparedPresetCss(file, id, prefix, composition) {
  const ast = parseStylesheet(file);
  removeImports(ast);

  /*
   * The public visual API excludes the fixed v2 structural suffix allowlist. The
   * default API emits those exact rules and root viewport height compatibility
   * last in compat_layout so existing markup remains stable while new layout
   * ownership stays outside this package.
   */
  walk(ast, {
    visit: 'Rule',
    enter(node, item, list) {
      const compatibilityRule = ruleUsesCompatibilityLayout(node, prefix);
      const rootViewportLayoutRule = ruleTargetsPresetRoot(node, id) && ruleHasViewportLayoutDeclaration(node);
      const keepRule = composition === 'compatibility'
        ? compatibilityRule || rootViewportLayoutRule
        : !compatibilityRule;

      if (!keepRule) {
        list.remove(item);
        return;
      }
      if (rootViewportLayoutRule && !compatibilityRule) {
        filterViewportLayoutDeclarations(node, composition === 'compatibility');
      }
      if (node.block.children.size === 0) list.remove(item);
    }
  });
  removeEmptyAtRules(ast);

  setPresetLayer(
    ast,
    composition === 'compatibility'
      ? 'ui-style-kit.compat_layout'
      : 'ui-style-kit.presets'
  );

  // Generated partitions stay human-readable while sharing the reviewed parser path.
  return formatGeneratedCss(generate(ast), file);
}

function sourceSection(file) {
  return readSource(file).trim();
}

function bundle(sections) {
  const contents = sections
    .map(({ label, css }) => `\n/* ${label} */\n${css.trim()}\n`)
    .join('\n');

  return `${banner}${contents}`;
}

function syncDemoManifest() {
  const demoManifest = {
    presets: publicManifest.presets,
    themes: publicManifest.themes,
    modes: publicManifest.modes
  };
  const output = `/* Generated by scripts/build.mjs. Keep demo controls aligned with manifest.json. */\nwindow.UI_STYLE_KIT_MANIFEST = ${JSON.stringify(demoManifest, null, 2)};\n`;

  fs.writeFileSync(path.join(root, 'demo', 'demo-manifest.js'), output);
}

function visualSections(selectedPresets = presetFiles) {
  return [
    ...foundationFiles.map((file) => ({
      label: file,
      css: addSemanticAliases(sourceSection(file), file, selectedPresets)
    })),
    ...selectedPresets.map(({ file, id, prefix }) => ({
      label: `${file} (visual paint)`,
      css: addSemanticAliases(
        preparedPresetCss(file, id, prefix, 'visual'),
        file,
        [{ id, prefix }]
      )
    }))
  ];
}

function compatibilitySections() {
  return [
    {
      label: compatibilityLayoutFile,
      css: sourceSection(compatibilityLayoutFile)
    },
    ...presetFiles.map(({ file, id, prefix }) => ({
      label: `${file} (deprecated structural compatibility)`,
      css: preparedPresetCss(file, id, prefix, 'compatibility')
    }))
  ];
}

const dist = path.join(root, 'dist');
const focusedDist = path.join(dist, 'visual');
fs.mkdirSync(focusedDist, { recursive: true });

const visualBundle = bundle(visualSections());
const defaultBundle = bundle([...visualSections(), ...compatibilitySections()]);
const legacyBridgeBundle = `${defaultBundle}\n/* ${legacyBridgeFile} (deprecated stateful bridge) */\n${sourceSection(legacyBridgeFile)}\n`;

fs.writeFileSync(path.join(dist, 'ui-style-kit.css'), defaultBundle);
fs.writeFileSync(path.join(dist, 'ui-style-kit.min.css'), minifyCss(defaultBundle, 'ui-style-kit.css'));
fs.writeFileSync(path.join(dist, 'ui-style-kit.visual.css'), visualBundle);
fs.writeFileSync(path.join(dist, 'ui-style-kit.visual.min.css'), minifyCss(visualBundle, 'ui-style-kit.visual.css'));
fs.writeFileSync(path.join(dist, 'ui-style-kit.with-bridge.css'), legacyBridgeBundle);
fs.writeFileSync(
  path.join(dist, 'ui-style-kit.with-bridge.min.css'),
  minifyCss(legacyBridgeBundle, 'ui-style-kit.with-bridge.css')
);

for (const preset of presetFiles) {
  const focusedBundle = bundle(visualSections([preset]));
  fs.writeFileSync(path.join(focusedDist, `${preset.id}.css`), focusedBundle);
}

syncDemoManifest();

console.log(
  'Built default, visual-only, focused visual, and deprecated with-bridge distribution entrypoints.'
);
