import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const producerScope = '[data-ui][data-theme][data-mode]';

// This literal contract keeps the CSS producer, manifest inventory, and public documentation aligned.
const sharedSemanticTokens = [
  ['--ui-color-bg', '<color>', 'rgb(var(--usk-bg-rgb))'],
  ['--ui-color-surface', '<color>', 'var(--usk-native-surface-strong)'],
  ['--ui-color-text', '<color>', 'var(--usk-native-text)'],
  ['--ui-color-muted', '<color>', 'var(--usk-native-text-muted)'],
  ['--ui-color-primary', '<color>', 'var(--usk-native-primary)'],
  ['--ui-color-on-primary', '<color>', 'var(--usk-native-on-primary)'],
  ['--ui-color-border', '<color>', 'var(--usk-native-border)'],
  ['--ui-radius-control', '<length>', 'var(--usk-native-radius)'],
  ['--ui-shadow-control', '<shadow-list>', 'var(--usk-native-shadow)'],
  ['--ui-focus-color', '<color>', 'var(--usk-native-focus)'],
  ['--ui-motion-duration', '<time>', 'var(--usk-motion-duration)'],
  ['--ui-motion-easing', '<easing-function>', 'var(--usk-motion-easing)']
].map(([name, type, namespacedSource]) => ({
  name,
  type,
  namespacedSource,
  producerScope,
  standaloneExpectation: 'available-with-ui-style-kit-entrypoints'
}));

function read(relativeFile) {
  return fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
}

function declarationsFor(relativeFile, selector) {
  const declarations = new Map();
  const ast = parse(read(relativeFile), {
    filename: relativeFile,
    parseCustomProperty: true
  });

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      if (generate(rule.prelude) !== selector) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') {
          declarations.set(node.property, generate(node.value));
        }
      });
    }
  });

  return declarations;
}

test('native token root publishes the exact typed shared semantic producer contract', () => {
  const declarations = declarationsFor('styles/native-elements.css', producerScope);

  assert.equal(declarations.get('--usk-motion-duration'), '140ms');
  assert.equal(declarations.get('--usk-motion-easing'), 'cubic-bezier(0.2,0,0.2,1)');
  for (const token of sharedSemanticTokens) {
    assert.equal(
      declarations.get(token.name),
      generate(parse(token.namespacedSource, { context: 'value' })),
      `${token.name} should resolve from ${token.namespacedSource}`
    );
  }
});

test('manifest inventories every shared semantic token without changing schema policy', () => {
  const manifest = JSON.parse(read('manifest.json'));

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.schemaPolicy.compatibility, 'additive-within-major');
  assert.deepEqual(manifest.tokens.sharedSemantic, sharedSemanticTokens);
});

test('generated visual entrypoints publish the producer contract for standalone consumers', () => {
  const generatedFiles = [
    'dist/ui-style-kit.css',
    'dist/ui-style-kit.visual.css',
    ...JSON.parse(read('manifest.json')).presets.map(({ id }) => `dist/visual/${id}.css`)
  ];

  for (const generatedFile of generatedFiles) {
    const declarations = declarationsFor(generatedFile, producerScope);
    for (const { name } of sharedSemanticTokens) {
      assert.equal(declarations.has(name), true, `${generatedFile} should publish ${name}`);
    }
  }
});

test('canonical and deprecated adapters prefer only behavior-equivalent semantic values', () => {
  const canonical = declarationsFor(
    'styles/interactive-surface-theme.css',
    ':where([data-ui][data-theme][data-mode]) .interactive-surface'
  );
  const deprecated = declarationsFor(
    'styles/interactive-surface-bridge.css',
    ':where([data-ui][data-theme][data-mode]) .interactive-surface'
  );
  const canonicalSharedValues = new Map([
    [
      '--interactive-surface-bg',
      'var(--ui-color-surface,rgb(var(--usk-surface-strong-rgb,var(--usk-surface-rgb,255 255 255))))'
    ],
    ['--interactive-surface-fg', 'var(--ui-color-text,rgb(var(--usk-text-rgb,18 18 18)))'],
    [
      '--interactive-surface-focus-ring-color',
      'var(--ui-focus-color,rgb(var(--usk-focus-rgb,var(--usk-primary-rgb,72 120 255))))'
    ],
    [
      '--interactive-surface-variant-primary-bg',
      'var(--ui-color-primary,rgb(var(--usk-primary-rgb,72 120 255)))'
    ],
    [
      '--interactive-surface-variant-primary-fg',
      'var(--ui-color-on-primary,rgb(var(--usk-primary-text-rgb,var(--usk-bg-rgb,255 255 255))))'
    ],
    [
      '--interactive-surface-variant-subtle-fg',
      'var(--ui-color-text,rgb(var(--usk-text-rgb,18 18 18)))'
    ]
  ]);

  const deprecatedSharedValues = new Map(canonicalSharedValues);
  deprecatedSharedValues.set('--interactive-surface-fg', 'var(--ui-color-text,rgb(var(--usk-text-rgb)))');
  deprecatedSharedValues.set(
    '--interactive-surface-variant-primary-bg',
    'var(--ui-color-primary,rgb(var(--usk-primary-rgb)))'
  );

  for (const [declarations, expectedValues] of [
    [canonical, canonicalSharedValues],
    [deprecated, deprecatedSharedValues]
  ]) {
    for (const [property, value] of expectedValues) {
      assert.equal(declarations.get(property), value, `${property} should retain its direct --usk-* fallback`);
    }
    assert.equal(
      declarations.get('--interactive-surface-border-color'),
      'rgb(var(--usk-border-rgb,128 128 128)/.72)',
      'The adapter must preserve border alpha math.'
    );
    assert.equal(declarations.get('--interactive-surface-radius'), '.85rem');
    assert.equal(
      declarations.get('--interactive-surface-level-3-shadow'),
      '0 14px 34px rgb(var(--usk-bg-rgb,0 0 0)/.3),0 0 0 1px color-mix(in srgb,var(--interactive-surface-variant-primary-border-color) 34%,transparent)'
    );
  }

  const deprecatedCss = read('styles/interactive-surface-bridge.css');
  assert.match(deprecatedCss, /background-color 160ms ease,/);
  assert.match(deprecatedCss, /transition:\s*opacity 160ms ease;/);
  assert.doesNotMatch(deprecatedCss, /--ui-motion-(?:duration|easing)/);
});

test('core producer documentation defines third-party and standalone expectations', () => {
  const readme = read('README.md');
  const tokensGuide = read('docs/TOKENS.md');
  const combined = `${readme}\n${tokensGuide}`;

  for (const { name } of sharedSemanticTokens) {
    assert.match(combined, new RegExp(name.replaceAll('-', '\\-')));
  }
  assert.match(tokensGuide, /third-party theme/i);
  assert.match(tokensGuide, /optional fallback/i);
  assert.match(tokensGuide, /package-specific/i);
});
