import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';
import { PRESET_IDENTITIES } from '../scripts/preset-identities.mjs';

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
  ['retro-glass', 'rg'],
  ['editorial-luxe', 'luxe'],
  ['organic-modern', 'organic'],
  ['industrial-utility', 'utility'],
  ['technical-blueprint', 'blueprint'],
  ['art-deco', 'deco'],
  ['clay', 'clay'],
  ['data-terminal', 'terminal'],
  ['paper-editorial', 'paper'],
  ['neo-noir', 'noir']
];

const marketingSuffixes = [
  'card-media',
  'card-service',
  'card-feature',
  'card-accent-edge',
  'icon-medallion',
  'button-cut',
  'button-outline-heavy',
  'badge-seal',
  'feature-strip',
  'feature-item',
  'callout-bar',
  'eyebrow',
  'media-scrim'
];

function read(relativeFile) {
  return fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
}

function hasClass(css, className) {
  return new RegExp(`\\.${className}(?![\\w-])`).test(css);
}

function classRuleText(css, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rules = [...css.matchAll(new RegExp(`([^{}]*\\.${escaped}(?![\\w-])[^{}]*)\\{([^{}]*)\\}`, 'g'))];
  return rules.map((match) => match[2]).join('\n');
}

/**
 * Resolve the effective declarations for every rule whose selector contains a class.
 *
 * @param {string} css Complete authored stylesheet.
 * @param {string} className Public class name without the leading period.
 * @returns {Map<string, string>} Later declarations keyed by CSS property.
 */
function effectiveClassDeclarations(css, className) {
  const declarations = new Map();
  const ast = parse(css);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const selector = generate(rule.prelude);
      if (!selector.includes(`.${className}`)) return;

      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
      });
    }
  });

  return declarations;
}

test('commercial CTAs use separate filled and outlined roles', () => {
  const demo = read('demo/demo.js');

  assert.match(demo, /data-testid="marketing-primary-cta"[^>]*button-cut/);
  assert.match(demo, /data-testid="marketing-secondary-cta"[^>]*button-outline-heavy/);
  assert.doesNotMatch(demo, /data-testid="marketing-secondary-cta"[^>]*button-cut/);
});

test('every preset declares intentional CTA sizing and independent outline geometry', () => {
  for (const { id, prefix, filledInlineSize, filledAlignment } of PRESET_IDENTITIES) {
    const css = read(`styles/${id}.css`);
    const filled = effectiveClassDeclarations(css, `${prefix}-button-cut`);
    const outline = effectiveClassDeclarations(css, `${prefix}-button-outline-heavy`);

    if (filledInlineSize === 'intrinsic') {
      assert.equal(filled.has('inline-size'), false, `${id} filled CTA should use its intrinsic inline size`);
    } else {
      assert.equal(filled.get('inline-size'), filledInlineSize, `${id} filled CTA width`);
    }
    assert.equal(filled.get('max-inline-size'), '100%', `${id} filled CTA containment`);
    assert.equal(filled.get('justify-self'), filledAlignment, `${id} filled CTA alignment`);
    assert.equal(
      outline.has('clip-path') || outline.has('border-radius'),
      true,
      `${id} outline CTA should own its geometry`
    );
  }
});

test('Bento feature metrics use intrinsic columns and container-aware spans', () => {
  const css = read('styles/bento.css');
  const grid = effectiveClassDeclarations(css, 'bento-grid-feature');
  const label = effectiveClassDeclarations(css, 'bento-stat-label');

  assert.equal(grid.get('container-type'), 'inline-size');
  assert.equal(grid.get('grid-template-columns'), 'repeat(auto-fit,minmax(min(100%,14rem),1fr))');
  assert.equal(label.get('overflow-wrap'), 'normal');
  assert.equal(label.get('word-break'), 'normal');
  assert.match(
    css,
    /@container\s*\(min-width:\s*34rem\)[\s\S]*?\.bento-tile-lg\s*\{[^}]*grid-column:\s*span 2/,
    'large Bento metrics should span only when their own container can support it'
  );
});

test('manifest publishes the marketing component suffixes as universal visual API', () => {
  const manifest = JSON.parse(read('manifest.json'));

  for (const suffix of marketingSuffixes) {
    assert.equal(
      manifest.classApi.universalVisualSuffixes.includes(suffix),
      true,
      `manifest.classApi.universalVisualSuffixes should include ${suffix}`
    );
  }
});

test('every UI preset exposes the same marketing component vocabulary', () => {
  for (const [ui, prefix] of presets) {
    const css = read(path.join('styles', `${ui}.css`));

    for (const suffix of marketingSuffixes) {
      assert.equal(hasClass(css, `${prefix}-${suffix}`), true, `${ui} is missing .${prefix}-${suffix}`);
    }
  }
});

test('marketing primitives preserve reusable media, icon, CTA, and strip geometry', () => {
  for (const [ui, prefix] of presets) {
    const css = read(path.join('styles', `${ui}.css`));

    const cardMedia = classRuleText(css, `${prefix}-card-media`);
    assert.match(cardMedia, /inline-size:\s*100%/, `.${prefix}-card-media should fill its card width`);
    assert.match(cardMedia, /object-fit:\s*cover/, `.${prefix}-card-media should crop media predictably`);

    const medallion = classRuleText(css, `${prefix}-icon-medallion`);
    assert.match(medallion, /display:\s*inline-grid/, `.${prefix}-icon-medallion should use centered grid geometry`);
    assert.match(medallion, /place-items:\s*center/, `.${prefix}-icon-medallion should center icon content`);

    const cutButton = classRuleText(css, `${prefix}-button-cut`);
    assert.match(cutButton, /clip-path:\s*(?:polygon|inset)\(/, `.${prefix}-button-cut should expose clipped CTA geometry`);
    assert.match(cutButton, /outline-offset:\s*-3px/, `.${prefix}-button-cut should keep clipped focus indicators visible`);

    const featureStrip = classRuleText(css, `${prefix}-feature-strip`);
    assert.match(featureStrip, /display:\s*grid/, `.${prefix}-feature-strip should use component-owned grid layout`);

    const calloutBar = classRuleText(css, `${prefix}-callout-bar`);
    assert.match(calloutBar, /display:\s*grid/, `.${prefix}-callout-bar should support icon/copy/action composition`);

    const eyebrow = classRuleText(css, `${prefix}-eyebrow`);
    assert.match(eyebrow, /text-transform:\s*uppercase/, `.${prefix}-eyebrow should provide a consistent kicker hierarchy`);

    const scrim = classRuleText(css, `${prefix}-media-scrim`);
    assert.match(scrim, /position:\s*relative/, `.${prefix}-media-scrim should establish an overlay containing block`);
    assert.match(scrim, /overflow:\s*hidden/, `.${prefix}-media-scrim should contain image and overlay paint`);
  }
});

test('media scrim captions keep semantic descendants on the scrim foreground', () => {
  for (const [ui, prefix] of presets) {
    const css = read(path.join('styles', `${ui}.css`));
    const scrim = classRuleText(css, `${prefix}-media-scrim`);

    assert.match(scrim, /color:\s*#fff/, `.${prefix}-media-scrim should establish a light scrim foreground`);
    assert.match(
      scrim,
      /color:\s*inherit/,
      `.${prefix}-media-scrim descendants should not restore ${ui} text roles over the dark overlay`
    );
  }
});

test('Clay CTA uses a compact inflated-pill treatment instead of a stretched faceted bar', () => {
  const css = read('styles/clay.css');
  const cutButton = classRuleText(css, 'clay-button-cut');

  assert.match(cutButton, /clip-path:\s*inset\([^)]*round/, '.clay-button-cut should use a softly clipped pill');
  assert.match(cutButton, /border-radius:\s*var\(--clay-radius-pill\)/, '.clay-button-cut should follow Clay rounding');
  assert.doesNotMatch(cutButton, /(?:^|[;{]\s*)inline-size\s*:/m, '.clay-button-cut should use intrinsic inline sizing without a legacy diagnostic');
  assert.match(cutButton, /justify-self:\s*center/, '.clay-button-cut should center inside service cards');
});

test('service cards support an overlapping medallion without domain-specific content', () => {
  for (const [ui, prefix] of presets) {
    const css = read(path.join('styles', `${ui}.css`));
    const relation = new RegExp(`\\.${prefix}-card-service\\s*>\\s*\\.${prefix}-icon-medallion`);

    assert.match(css, relation, `.${prefix}-card-service should position its direct medallion child`);
  }
});

test('published bundles expose the marketing component API', () => {
  const sharedBundles = [
    'dist/ui-style-kit.css',
    'dist/ui-style-kit.min.css',
    'dist/ui-style-kit.visual.css',
    'dist/ui-style-kit.visual.min.css',
    'dist/ui-style-kit.with-bridge.css',
    'dist/ui-style-kit.with-bridge.min.css'
  ];

  for (const relativeFile of sharedBundles) {
    const css = read(relativeFile);
    for (const [, prefix] of presets) {
      for (const suffix of marketingSuffixes) {
        assert.equal(hasClass(css, `${prefix}-${suffix}`), true, `${relativeFile} is missing .${prefix}-${suffix}`);
      }
    }
  }

  for (const [ui, prefix] of presets) {
    const css = read(path.join('dist', 'visual', `${ui}.css`));
    for (const suffix of marketingSuffixes) {
      assert.equal(hasClass(css, `${prefix}-${suffix}`), true, `dist/visual/${ui}.css is missing .${prefix}-${suffix}`);
    }
  }
});

test('shared content containment covers every preset and marketing wrapper', () => {
  const css = read('styles/content-overflow.css');
  const shrinkableSuffixes = [
    'card',
    'card-service',
    'card-feature',
    'feature-strip',
    'feature-item',
    'callout-bar',
    'media-scrim',
    'button',
    'badge',
    'nav-link'
  ];

  for (const [ui, prefix] of presets) {
    for (const suffix of shrinkableSuffixes) {
      assert.match(
        css,
        new RegExp(`\\[class~="${prefix}-${suffix}"\\]`),
        `${ui} should include ${prefix}-${suffix} in the shared containment contract`
      );
    }
  }
});
