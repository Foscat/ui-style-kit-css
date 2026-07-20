import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const presets = [
  ['minimal-saas', 'saas'],
  ['bento', 'bento'],
  ['maximalist', 'max'],
  ['bauhaus', 'bau'],
  ['tactile', 'tactile'],
  ['neumorphism', 'neo'],
  ['retrofuturism', 'retro'],
  ['brutalism', 'brutal'],
  ['cyberpunk', 'cyber'],
  ['y2k', 'y2k'],
  ['retro-glass', 'rg']
];
const themes = [
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
const modes = ['light', 'dark', 'contrast'];
const cascadeLayers = [
  'ui-style-kit.theme_colors',
  'ui-style-kit.native_elements',
  'ui-style-kit.components',
  'ui-style-kit.presets',
  'ui-style-kit.compat_layout'
];
const deprecatedStructuralSuffixes = [
  'page',
  'container',
  'section',
  'grid',
  'stack',
  'cluster',
  'split'
];

function relativePath(...segments) {
  return path.join(rootDir, ...segments);
}

function readJson(relativeFile) {
  const absoluteFile = relativePath(relativeFile);
  assert.ok(fs.existsSync(absoluteFile), `Expected ${relativeFile} to exist`);
  return JSON.parse(fs.readFileSync(absoluteFile, 'utf8'));
}

function readCss(relativeFile) {
  const absoluteFile = relativePath(relativeFile);
  assert.ok(fs.existsSync(absoluteFile), `Expected ${relativeFile} to exist`);
  return fs.readFileSync(absoluteFile, 'utf8');
}

function parseCss(relativeFile) {
  return parse(readCss(relativeFile), { filename: relativeFile, positions: true });
}

function selectorClassNames(ast) {
  const names = new Set();

  walk(ast, {
    enter(node) {
      if (node.type === 'ClassSelector') names.add(node.name);
      if (
        node.type === 'AttributeSelector' &&
        node.name?.name === 'class' &&
        node.matcher === '~=' &&
        (node.value?.type === 'Identifier' || node.value?.type === 'String')
      ) {
        names.add(node.value.value ?? node.value.name);
      }
    }
  });

  return names;
}

function prefixedSuffixes(relativeFile, prefix) {
  const prefixWithSeparator = `${prefix}-`;
  return [...selectorClassNames(parseCss(relativeFile))]
    .filter((name) => name.startsWith(prefixWithSeparator))
    .map((name) => name.slice(prefixWithSeparator.length))
    .sort();
}

function composedCapabilitySuffixes(id, prefix) {
  return [...new Set([
    ...prefixedSuffixes(path.join('styles', 'components.css'), prefix),
    ...prefixedSuffixes(path.join('styles', `${id}.css`), prefix)
  ])]
    .filter((suffix) => !deprecatedStructuralSuffixes.includes(suffix))
    .sort();
}

function declaredLayerOrder(relativeFile) {
  const orders = [];

  walk(parseCss(relativeFile), {
    visit: 'Atrule',
    enter(node) {
      if (node.name === 'layer' && node.block === null && node.prelude) {
        orders.push(generate(node.prelude).split(',').map((name) => name.trim()));
      }
    }
  });

  assert.ok(orders.length > 0, `${relativeFile} should declare its cascade order`);
  return orders[0];
}

function declarationIndex(ast) {
  const index = new Map();

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const selector = generate(rule.prelude);
      const declarations = new Map();

      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
      });
      index.set(selector, declarations);
    }
  });

  return index;
}

function selectorDeclarations(relativeFile, selector, layerName) {
  const declarations = [];
  const layerStack = [];

  walk(parseCss(relativeFile), {
    enter(node) {
      if (node.type === 'Atrule' && node.name === 'layer' && node.block && node.prelude) {
        layerStack.push(generate(node.prelude));
      }

      if (node.type !== 'Rule') return;
      if (generate(node.prelude) !== selector) return;
      if (layerName && layerStack.at(-1) !== layerName) return;

      const ruleDeclarations = new Map();
      node.block.children.forEach((child) => {
        if (child.type === 'Declaration') ruleDeclarations.set(child.property, generate(child.value));
      });
      declarations.push(ruleDeclarations);
    },
    leave(node) {
      if (node.type === 'Atrule' && node.name === 'layer' && node.block && node.prelude) {
        layerStack.pop();
      }
    }
  });

  return declarations;
}

test('2.1 package exports resolve the visual, focused, manifest, and bridge API', () => {
  const packageJson = readJson('package.json');
  const packageLock = readJson('package-lock.json');
  const expectedExports = new Map([
    ['./visual', './dist/ui-style-kit.visual.css'],
    ['./visual.css', './dist/ui-style-kit.visual.css'],
    ['./visual.min.css', './dist/ui-style-kit.visual.min.css'],
    ['./interactive-surface-theme', './styles/interactive-surface-theme.css'],
    ['./interactive-surface-theme.css', './styles/interactive-surface-theme.css'],
    ['./manifest.json', './manifest.json']
  ]);

  for (const [id] of presets) {
    expectedExports.set(`./visual/${id}.css`, `./dist/visual/${id}.css`);
  }

  assert.equal(packageJson.version, '2.1.0');
  assert.equal(packageLock.version, '2.1.0');
  assert.equal(packageLock.packages[''].version, '2.1.0');

  for (const [exportPath, target] of expectedExports) {
    assert.equal(packageJson.exports[exportPath], target, `${exportPath} should resolve to ${target}`);
    assert.ok(fs.existsSync(relativePath(target.replace(/^\.\//, ''))), `${exportPath} target should exist`);
  }

  for (const [id] of presets) {
    assert.equal(packageJson.exports[`./${id}.css`], `./styles/${id}.css`);
  }

  assert.equal(packageJson.exports['./interactive-surface-bridge'], './styles/interactive-surface-bridge.css');
  assert.equal(packageJson.exports['./with-bridge'], './dist/ui-style-kit.with-bridge.css');
});

test('release-facing current-version surfaces identify 2.1.0', () => {
  const currentVersionFiles = [
    'README.md',
    'index.html',
    path.join('demo', 'index.html'),
    path.join('docs', 'PUBLISHING.md'),
    path.join('docs', 'ECOSYSTEM.md'),
    path.join('wiki', 'Home.md'),
    path.join('wiki', 'Installation-and-Setup.md'),
    path.join('wiki', 'Ecosystem-Compatibility.md'),
    path.join('wiki', 'UI-Systems.md')
  ];

  for (const relativeFile of currentVersionFiles) {
    const contents = fs.readFileSync(relativePath(relativeFile), 'utf8');
    assert.equal(contents.includes('2.1.0'), true, `${relativeFile} should identify the current version`);
  }

  const changelog = fs.readFileSync(relativePath('CHANGELOG.md'), 'utf8');
  assert.equal(changelog.includes('## [2.1.0] - 2026-07-20'), true);
});

test('manifest describes every preset, scheme, mode, class capability, and native part', () => {
  const manifest = readJson('manifest.json');

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.name, 'ui-style-kit-css');
  assert.equal(manifest.version, '2.1.0');
  assert.deepEqual(manifest.cascadeLayers, cascadeLayers);
  assert.deepEqual(manifest.themes, themes);
  assert.deepEqual(manifest.modes, modes);
  assert.deepEqual(manifest.classApi.deprecatedStructuralSuffixes, deprecatedStructuralSuffixes);
  assert.ok(manifest.classApi.universalVisualSuffixes.length > 0);

  assert.deepEqual(
    manifest.presets.map(({ id, prefix }) => [id, prefix]),
    presets
  );

  for (const preset of manifest.presets) {
    assert.deepEqual(preset.entrypoints, {
      default: `./${preset.id}.css`,
      visual: `./visual/${preset.id}.css`
    });
  }

  for (const [id, prefix] of presets) {
    const sourceSuffixes = composedCapabilitySuffixes(id, prefix);
    const declaredSuffixes = [
      ...manifest.classApi.universalVisualSuffixes,
      ...(manifest.classApi.presetExtras[id] ?? [])
    ].sort();

    assert.deepEqual(declaredSuffixes, sourceSuffixes, `${id} class capabilities should match its AST`);
  }

  const nativeGroups = ['standard', 'vendorSpecific', 'platformOwned', 'nonRendered'];
  for (const group of nativeGroups) {
    assert.ok(Array.isArray(manifest.nativeParts[group]), `nativeParts.${group} should be an array`);
    assert.ok(manifest.nativeParts[group].length > 0, `nativeParts.${group} should classify at least one part`);
  }

  const classifiedParts = nativeGroups.flatMap((group) => manifest.nativeParts[group]);
  assert.equal(new Set(classifiedParts).size, classifiedParts.length, 'native part classifications should not overlap');
});

test('manifest capability composition recognizes shared prefixed component selectors', () => {
  const sharedSaasSuffixes = prefixedSuffixes(path.join('styles', 'components.css'), 'saas');
  const composedSaasSuffixes = composedCapabilitySuffixes('minimal-saas', 'saas');

  assert.equal(sharedSaasSuffixes.includes('button'), true, 'shared component AST should declare .saas-button');
  assert.equal(composedSaasSuffixes.includes('button'), true, 'composed capabilities should retain shared .saas-button');
});

test('generated bundles declare the 2.1 cascade order', () => {
  const outputs = [
    path.join('dist', 'ui-style-kit.css'),
    path.join('dist', 'ui-style-kit.min.css'),
    path.join('dist', 'ui-style-kit.visual.css'),
    path.join('dist', 'ui-style-kit.visual.min.css'),
    ...presets.map(([id]) => path.join('dist', 'visual', `${id}.css`))
  ];

  for (const output of outputs) {
    assert.deepEqual(declaredLayerOrder(output), cascadeLayers, `${output} should use the public layer order`);
  }
});

test('visual bundles omit compatibility layout while default bundles retain it', () => {
  const defaultClasses = selectorClassNames(parseCss(path.join('dist', 'ui-style-kit.css')));
  const defaultMinClasses = selectorClassNames(parseCss(path.join('dist', 'ui-style-kit.min.css')));
  const visualClasses = selectorClassNames(parseCss(path.join('dist', 'ui-style-kit.visual.css')));
  const visualMinClasses = selectorClassNames(parseCss(path.join('dist', 'ui-style-kit.visual.min.css')));

  for (const [id, prefix] of presets) {
    const presetSuffixes = prefixedSuffixes(path.join('styles', `${id}.css`), prefix);
    const visualSuffixes = composedCapabilitySuffixes(id, prefix);
    const focusedClasses = selectorClassNames(parseCss(path.join('dist', 'visual', `${id}.css`)));

    for (const suffix of visualSuffixes) {
      const className = `${prefix}-${suffix}`;

      assert.equal(defaultClasses.has(className), true, `default bundle should retain .${className}`);
      assert.equal(defaultMinClasses.has(className), true, `minified default should retain .${className}`);
      assert.equal(visualClasses.has(className), true, `visual bundle should retain .${className}`);
      assert.equal(visualMinClasses.has(className), true, `minified visual should retain .${className}`);
      assert.equal(focusedClasses.has(className), true, `${id} focused bundle should retain .${className}`);
    }

    for (const suffix of presetSuffixes.filter((value) => deprecatedStructuralSuffixes.includes(value))) {
      const className = `${prefix}-${suffix}`;

      assert.equal(defaultClasses.has(className), true, `default bundle should retain .${className}`);
      assert.equal(defaultMinClasses.has(className), true, `minified default should retain .${className}`);
      assert.equal(visualClasses.has(className), false, `visual bundle should omit .${className}`);
      assert.equal(visualMinClasses.has(className), false, `minified visual should omit .${className}`);
      assert.equal(focusedClasses.has(className), false, `${id} focused bundle should omit .${className}`);
    }
  }
});

test('visual bundles omit preset root viewport layout while compatibility builds retain it', () => {
  for (const [id] of presets) {
    const selector = `[data-ui="${id}"]`;
    const visualDeclarations = selectorDeclarations(path.join('dist', 'ui-style-kit.visual.css'), selector);
    const visualMinDeclarations = selectorDeclarations(path.join('dist', 'ui-style-kit.visual.min.css'), selector);
    const focusedDeclarations = selectorDeclarations(path.join('dist', 'visual', `${id}.css`), selector);
    const defaultCompatibilityDeclarations = selectorDeclarations(
      path.join('dist', 'ui-style-kit.css'),
      selector,
      'ui-style-kit.compat_layout'
    );

    for (const declarations of [
      ...visualDeclarations,
      ...visualMinDeclarations,
      ...focusedDeclarations
    ]) {
      assert.equal(declarations.has('min-height'), false, `${selector} should not own viewport layout in visual output`);
    }

    assert.equal(
      defaultCompatibilityDeclarations.some((declarations) => declarations.get('min-height') === '100vh'),
      true,
      `${selector} should retain v2 viewport compatibility in the default bundle`
    );
  }
});

test('compatibility extraction does not emit empty conditional or keyframe blocks', () => {
  const ast = parseCss(path.join('dist', 'ui-style-kit.css'));
  const emptyAtRules = [];

  walk(ast, {
    visit: 'Atrule',
    enter(node) {
      if (node.block && node.block.children.size === 0) {
        emptyAtRules.push(`@${node.name}${node.prelude ? ` ${generate(node.prelude)}` : ''}`);
      }
    }
  });

  assert.deepEqual(emptyAtRules, []);
});

test('canonical Interactive Surface theme bridge is token and paint only', () => {
  const relativeFile = path.join('styles', 'interactive-surface-theme.css');
  const ast = parseCss(relativeFile);
  const bannedPseudoClasses = new Set(['hover', 'focus', 'focus-visible', 'active', 'disabled']);
  const bannedProperties = new Set([
    'opacity',
    'transform',
    'translate',
    'transition',
    'transition-property',
    'transition-duration',
    'transition-timing-function',
    'transition-delay'
  ]);
  const publicTokens = new Set();

  walk(ast, {
    enter(node) {
      assert.notEqual(node.type, 'PseudoElementSelector', 'theme bridge must not create pseudo-elements');
      if (node.type === 'PseudoClassSelector') {
        assert.equal(bannedPseudoClasses.has(node.name), false, `theme bridge must not own :${node.name}`);
      }
      if (node.type === 'AttributeSelector') {
        assert.notEqual(node.name?.name, 'disabled', 'theme bridge must not own disabled state');
      }
      if (node.type === 'Atrule' && node.prelude) {
        assert.equal(generate(node.prelude).includes('prefers-reduced-motion'), false);
      }
      if (node.type === 'Declaration') {
        assert.equal(node.important, false, `${node.property} must not use !important`);
        assert.equal(bannedProperties.has(node.property), false, `${node.property} belongs to interaction state`);
        assert.equal(node.property.startsWith('--_is-'), false, 'theme bridge must not couple to private tokens');
        assert.equal(
          node.property.includes('state-layer') && node.property.includes('opacity'),
          false,
          'theme bridge must not mutate state opacity'
        );
        assert.equal(generate(node.value).includes('--_is-'), false, `${node.property} must not consume private tokens`);
        if (node.property.startsWith('--interactive-surface-')) publicTokens.add(node.property);
      }
    }
  });

  for (const token of [
    '--interactive-surface-bg',
    '--interactive-surface-fg',
    '--interactive-surface-border-color',
    '--interactive-surface-border-width',
    '--interactive-surface-radius',
    '--interactive-surface-variant-primary-bg',
    '--interactive-surface-variant-danger-bg',
    '--interactive-surface-level-1-bg',
    '--interactive-surface-level-3-shadow',
    '--interactive-surface-light-icon-color',
    '--interactive-surface-accessibility-icon-color-dark'
  ]) {
    assert.equal(publicTokens.has(token), true, `theme bridge should define ${token}`);
  }

  const indexedDeclarations = declarationIndex(ast);
  const baseRule = [...indexedDeclarations.entries()]
    .find(([selector]) => selector.includes('.interactive-surface') && !selector.includes('[data-surface-'))?.[1];
  assert.ok(baseRule, 'theme bridge should apply base paint and geometry');
  for (const property of ['box-sizing', 'background-color', 'color', 'border', 'border-radius', 'box-shadow']) {
    assert.equal(baseRule.has(property), true, `base theme bridge should apply ${property}`);
  }
});

test('authored and minified public CSS entrypoints parse through the contract AST', () => {
  const files = [
    'styles/theme-colors.css',
    'styles/native-elements.css',
    'styles/components.css',
    'styles/compat-layout.css',
    'styles/interactive-surface-theme.css',
    'styles/interactive-surface-bridge.css',
    'dist/ui-style-kit.css',
    'dist/ui-style-kit.min.css',
    'dist/ui-style-kit.visual.css',
    'dist/ui-style-kit.visual.min.css',
    'dist/ui-style-kit.with-bridge.css',
    'dist/ui-style-kit.with-bridge.min.css',
    ...presets.flatMap(([id]) => [
      `styles/${id}.css`,
      `dist/visual/${id}.css`
    ])
  ];

  for (const relativeFile of files) {
    const css = readCss(relativeFile);
    assert.doesNotThrow(() => parse(css, { filename: relativeFile }), `${relativeFile} should parse with CSS Tree`);
  }
});
