import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';

import {
  semanticComponentMarkup,
  semanticRuntimeCases
} from './fixtures/semantic-component-cases.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

const expectedRetainedSelectors = ['.usk-spinner', '.usk-tooltip'];
const expectedImplementedSelectors = [
  '.usk-button',
  '.usk-icon-button',
  '.usk-card',
  '.usk-field',
  '.usk-label',
  '.usk-help-text',
  '.usk-input',
  '.usk-select',
  '.usk-textarea',
  '.usk-check',
  '.usk-check-control',
  '.usk-radio',
  '.usk-radio-control',
  '.usk-switch',
  '.usk-switch-track',
  '.usk-switch-thumb',
  '.usk-badge',
  '.usk-alert',
  '.usk-alert-title',
  '.usk-alert-body',
  '.usk-nav',
  '.usk-nav-link',
  '.usk-table',
  '.usk-table-wrap',
  '.usk-progress',
  '.usk-progress-bar',
  '.usk-toolbar',
  '.usk-tabs',
  '.usk-tab-list',
  '.usk-tab',
  '.usk-tab-panel',
  '.usk-pagination',
  '.usk-pagination-item',
  '.usk-pagination-link',
  '.usk-breadcrumb',
  '.usk-breadcrumb-list',
  '.usk-breadcrumb-item',
  '.usk-breadcrumb-link',
  '.usk-breadcrumb-separator',
  '.usk-skeleton',
  '.usk-empty-state',
  '.usk-empty-state-icon',
  '.usk-empty-state-title',
  '.usk-empty-state-body',
  '.usk-empty-state-actions',
  '.usk-metric',
  '.usk-metric-label',
  '.usk-metric-value',
  '.usk-metric-detail',
  '.usk-chip',
  '.usk-chip-group',
  '.usk-avatar',
  '.usk-avatar-group',
  '.usk-stepper',
  '.usk-step',
  '.usk-step-marker',
  '.usk-step-label',
  '.usk-toast-stack',
  '.usk-toast',
  '.usk-toast-title',
  '.usk-toast-body',
  '.usk-toast-actions',
  '.usk-popover',
  '.usk-menu',
  '.usk-menu-item',
  '.usk-menu-group',
  '.usk-menu-separator',
  '.usk-segmented-control',
  '.usk-segment',
  '.usk-file-upload',
  '.usk-dropzone',
  '.usk-listbox',
  '.usk-listbox-option'
];
const expectedPendingSelectors = [];

const expectedSemanticComponentApi = {
  presetSwitchAttribute: 'data-ui',
  classNamespaces: {
    canonical: 'usk',
    compatibility: ['ui']
  },
  selectorsByRole: {
    button: [
      { selector: '.usk-button', sourceSuffix: 'button' },
      { selector: '.usk-icon-button', sourceSuffix: 'icon-button' }
    ],
    card: [
      { selector: '.usk-card', sourceSuffix: 'card' }
    ],
    form: [
      { selector: '.usk-field', sourceSuffix: 'field' },
      { selector: '.usk-label', sourceSuffix: 'label' },
      { selector: '.usk-help-text', sourceSuffix: 'help-text' },
      { selector: '.usk-input', sourceSuffix: 'input' },
      { selector: '.usk-select', sourceSuffix: 'select' },
      { selector: '.usk-textarea', sourceSuffix: 'textarea' },
      { selector: '.usk-check', sourceSuffix: 'check' },
      { selector: '.usk-check-control', sourceSuffix: 'check-control' },
      { selector: '.usk-radio', sourceSuffix: 'radio' },
      { selector: '.usk-radio-control', sourceSuffix: 'radio-control' },
      { selector: '.usk-switch', sourceSuffix: 'switch' },
      { selector: '.usk-switch-track', sourceSuffix: 'switch-track' },
      { selector: '.usk-switch-thumb', sourceSuffix: 'switch-thumb' }
    ],
    badge: [
      { selector: '.usk-badge', sourceSuffix: 'badge' }
    ],
    alert: [
      { selector: '.usk-alert', sourceSuffix: 'alert' },
      { selector: '.usk-alert-title', sourceSuffix: 'alert-title' },
      { selector: '.usk-alert-body', sourceSuffix: 'alert-body' }
    ],
    navigation: [
      { selector: '.usk-nav', sourceSuffix: 'nav' },
      { selector: '.usk-nav-link', sourceSuffix: 'nav-link' }
    ],
    table: [
      { selector: '.usk-table', sourceSuffix: 'table' },
      { selector: '.usk-table-wrap', sourceSuffix: 'table-wrap' }
    ],
    progress: [
      { selector: '.usk-progress', sourceSuffix: 'progress' },
      { selector: '.usk-progress-bar', sourceSuffix: 'progress-bar' }
    ],
    toolbar: [
      { selector: '.usk-toolbar', sourceSuffix: 'toolbar' }
    ],
    loading: [
      { selector: '.usk-spinner', sourceSuffix: 'spinner' }
    ],
    tooltip: [
      { selector: '.usk-tooltip', sourceSuffix: 'tooltip' }
    ],
    tabs: [
      { selector: '.usk-tabs', sourceSuffix: 'tabs' },
      { selector: '.usk-tab-list', sourceSuffix: 'tab-list' },
      { selector: '.usk-tab', sourceSuffix: 'tab' },
      { selector: '.usk-tab-panel', sourceSuffix: 'tab-panel' }
    ],
    pagination: [
      { selector: '.usk-pagination', sourceSuffix: 'pagination' },
      { selector: '.usk-pagination-item', sourceSuffix: 'pagination-item' },
      { selector: '.usk-pagination-link', sourceSuffix: 'pagination-link' }
    ],
    breadcrumb: [
      { selector: '.usk-breadcrumb', sourceSuffix: 'breadcrumb' },
      { selector: '.usk-breadcrumb-list', sourceSuffix: 'breadcrumb-list' },
      { selector: '.usk-breadcrumb-item', sourceSuffix: 'breadcrumb-item' },
      { selector: '.usk-breadcrumb-link', sourceSuffix: 'breadcrumb-link' },
      { selector: '.usk-breadcrumb-separator', sourceSuffix: 'breadcrumb-separator' }
    ],
    skeleton: [
      { selector: '.usk-skeleton', sourceSuffix: 'skeleton' }
    ],
    emptyState: [
      { selector: '.usk-empty-state', sourceSuffix: 'empty-state' },
      { selector: '.usk-empty-state-icon', sourceSuffix: 'empty-state-icon' },
      { selector: '.usk-empty-state-title', sourceSuffix: 'empty-state-title' },
      { selector: '.usk-empty-state-body', sourceSuffix: 'empty-state-body' },
      { selector: '.usk-empty-state-actions', sourceSuffix: 'empty-state-actions' }
    ],
    metric: [
      { selector: '.usk-metric', sourceSuffix: 'metric' },
      { selector: '.usk-metric-label', sourceSuffix: 'metric-label' },
      { selector: '.usk-metric-value', sourceSuffix: 'metric-value' },
      { selector: '.usk-metric-detail', sourceSuffix: 'metric-detail' }
    ],
    chip: [
      { selector: '.usk-chip', sourceSuffix: 'chip' },
      { selector: '.usk-chip-group', sourceSuffix: 'chip-group' }
    ],
    avatar: [
      { selector: '.usk-avatar', sourceSuffix: 'avatar' },
      { selector: '.usk-avatar-group', sourceSuffix: 'avatar-group' }
    ],
    stepper: [
      { selector: '.usk-stepper', sourceSuffix: 'stepper' },
      { selector: '.usk-step', sourceSuffix: 'step' },
      { selector: '.usk-step-marker', sourceSuffix: 'step-marker' },
      { selector: '.usk-step-label', sourceSuffix: 'step-label' }
    ],
    toast: [
      { selector: '.usk-toast-stack', sourceSuffix: 'toast-stack' },
      { selector: '.usk-toast', sourceSuffix: 'toast' },
      { selector: '.usk-toast-title', sourceSuffix: 'toast-title' },
      { selector: '.usk-toast-body', sourceSuffix: 'toast-body' },
      { selector: '.usk-toast-actions', sourceSuffix: 'toast-actions' }
    ],
    popover: [
      { selector: '.usk-popover', sourceSuffix: 'popover' }
    ],
    menu: [
      { selector: '.usk-menu', sourceSuffix: 'menu' },
      { selector: '.usk-menu-item', sourceSuffix: 'menu-item' },
      { selector: '.usk-menu-group', sourceSuffix: 'menu-group' },
      { selector: '.usk-menu-separator', sourceSuffix: 'menu-separator' }
    ],
    segmentedControl: [
      { selector: '.usk-segmented-control', sourceSuffix: 'segmented-control' },
      { selector: '.usk-segment', sourceSuffix: 'segment' }
    ],
    fileUpload: [
      { selector: '.usk-file-upload', sourceSuffix: 'file-upload' },
      { selector: '.usk-dropzone', sourceSuffix: 'dropzone' }
    ],
    listbox: [
      { selector: '.usk-listbox', sourceSuffix: 'listbox' },
      { selector: '.usk-listbox-option', sourceSuffix: 'listbox-option' }
    ]
  },
  variantAttribute: {
    name: 'data-ui-variant',
    neutral: 'omitted',
    valuesBySelector: {
      '.usk-button': ['primary', 'secondary', 'warning', 'danger', 'ghost'],
      '.usk-badge': ['primary', 'secondary', 'success', 'warning', 'danger'],
      '.usk-alert': ['success', 'warning', 'danger'],
      '.usk-chip': ['primary', 'secondary', 'success', 'warning', 'danger'],
      '.usk-toast': ['info', 'success', 'warning', 'danger']
    }
  },
  stateAttributes: {
    '.usk-skeleton': { 'data-shape': ['text', 'circle', 'block'] },
    '.usk-step': { 'data-state': ['complete', 'current', 'upcoming', 'error'] }
  },
  nativeFallbacks: [
    {
      roles: ['modal', 'dialog'],
      element: 'dialog',
      genericSelectors: []
    }
  ],
  presetPrefixedClasses: {
    status: 'supported',
    uses: ['compatibility', 'advanced']
  },
  implementationStatus: {
    retained: {
      status: 'implemented',
      selectors: expectedRetainedSelectors
    },
    implemented: {
      status: 'implemented',
      selectors: expectedImplementedSelectors
    },
    pending: {
      status: 'pending',
      targetTask: 11,
      selectors: expectedPendingSelectors
    }
  }
};

function semanticEntries(api = manifest.semanticComponentApi) {
  assert.ok(api, 'manifest.json must declare semanticComponentApi');
  return Object.values(api.selectorsByRole).flat();
}

function semanticRequiredSuffixes(api = manifest.semanticComponentApi) {
  const entries = semanticEntries(api);
  const variantSuffixes = Object.entries(api.variantAttribute.valuesBySelector)
    .flatMap(([selector, variants]) => {
      const sourceSuffix = entries.find((entry) => entry.selector === selector)?.sourceSuffix;
      assert.ok(sourceSuffix, `${selector} variants need a declared semantic selector`);
      return variants.map((variant) => `${sourceSuffix}-${variant}`);
    });

  return new Set([
    ...entries.map(({ sourceSuffix }) => sourceSuffix),
    ...variantSuffixes
  ]);
}

function composedClassNames(preset) {
  const classNames = new Set();

  // The authoritative preset API composes shared component and preset source files.
  for (const relativeFile of ['styles/components.css', `styles/${preset.id}.css`]) {
    const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
    walk(parse(css, { filename: relativeFile }), {
      visit: 'ClassSelector',
      enter(node) {
        classNames.add(node.name);
      }
    });
  }

  return classNames;
}

function selectorFacts(relativeFile) {
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
  const facts = [];

  walk(parse(css, { filename: relativeFile }), {
    visit: 'Rule',
    enter(rule) {
      const classes = new Set();
      const attributes = [];
      const declarations = new Map();

      walk(rule.prelude, {
        enter(node) {
          if (node.type === 'ClassSelector') classes.add(`.${node.name}`);
          if (node.type === 'AttributeSelector') {
            attributes.push({
              name: node.name?.name,
              value: node.value?.value ?? node.value?.name ?? null
            });
          }
        }
      });
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, node.value);
      });
      facts.push({ classes, attributes, declarations });
    }
  });

  return facts;
}

function selectorTexts(relativeFile) {
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
  const selectors = [];

  walk(parse(css, { filename: relativeFile }), {
    visit: 'Rule',
    enter(rule) {
      selectors.push(generate(rule.prelude));
    }
  });

  return selectors;
}

function generatedSelectorRules(relativeFile) {
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
  const rules = [];

  walk(parse(css, { filename: relativeFile }), {
    visit: 'Rule',
    enter(rule) {
      const declarations = new Set();
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.add(node.property);
      });
      rule.prelude.children.forEach((selector) => {
        rules.push({ selector, text: generate(selector), declarations });
      });
    }
  });

  return rules;
}

function dataUiRootCompounds(selector) {
  const compounds = new Set();
  let compoundIndex = 0;

  selector.children.forEach((node) => {
    if (node.type === 'Combinator') {
      compoundIndex += 1;
      return;
    }

    walk(node, {
      visit: 'AttributeSelector',
      enter(attribute) {
        if (attribute.name?.name === 'data-ui') compounds.add(compoundIndex);
      }
    });
  });

  return compounds;
}

function declarationArtifactFacts(relativeFile) {
  // Git may materialize tracked CSS with platform-native newlines; normalize
  // before position-based slices so the reviewed artifact digest stays portable.
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8').replace(/\r\n?/g, '\n');
  const declarationBlocks = [];
  let count = 0;

  walk(parse(css, { filename: relativeFile, positions: true }), {
    visit: 'Rule',
    enter(rule) {
      declarationBlocks.push(css.slice(rule.block.loc.start.offset, rule.block.loc.end.offset));
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') count += 1;
      });
    }
  });

  return {
    count,
    sha256: crypto.createHash('sha256').update(declarationBlocks.join('\n')).digest('hex')
  };
}

test('build normalizes authored CSS line endings before offset-based selector edits', () => {
  const buildSource = fs.readFileSync(path.join(rootDir, 'scripts/build.mjs'), 'utf8');

  assert.match(buildSource, /function normalizeSourceText\(source\)/);
  assert.match(buildSource, /source\.replace\(\/\\r\\n\?\/g, '\\n'\)/);
  assert.match(buildSource, /prepareUiCss\(file, normalizeSourceText\(/);
});

function selectorHasAttributeValue(selector, name, value) {
  return new RegExp(`\\[${name}=(?:"${value}"|${value})\\]`).test(selector);
}

function ruleHasAttribute(rule, name, value = null) {
  return rule.attributes.some((attribute) =>
    attribute.name === name && attribute.value === value
  );
}

test('manifest specifies the exact generic semantic component API', () => {
  assert.ok(manifest.semanticComponentApi, 'manifest.json must declare semanticComponentApi');
  assert.deepEqual(manifest.semanticComponentApi, expectedSemanticComponentApi);

  const entries = semanticEntries();
  assert.equal(entries.length, 75);
  assert.equal(new Set(entries.map(({ selector }) => selector)).size, entries.length);
  assert.equal(new Set(entries.map(({ sourceSuffix }) => sourceSuffix)).size, entries.length);
  assert.equal(entries.every(({ selector }) => /^\.usk-[a-z]+(?:-[a-z]+)*$/.test(selector)), true);
});

/** Verifies the namespaced semantic API without removing the published compatibility namespace. */
test('semantic components publish canonical usk classes with ui compatibility aliases', () => {
  assert.deepEqual(manifest.semanticComponentApi.classNamespaces, {
    canonical: 'usk',
    compatibility: ['ui']
  });

  for (const relativeFile of [
    'dist/ui-style-kit.visual.css',
    ...manifest.presets.map(({ id }) => `dist/visual/${id}.css`)
  ]) {
    const selectors = selectorTexts(relativeFile);
    for (const { sourceSuffix } of semanticEntries()) {
      assert.equal(
        selectors.some((selector) => selector.includes(`.usk-${sourceSuffix}`)),
        true,
        `${relativeFile} must implement .usk-${sourceSuffix}`
      );
      assert.equal(
        selectors.some((selector) => selector.includes(`.ui-${sourceSuffix}`)),
        true,
        `${relativeFile} must retain .ui-${sourceSuffix}`
      );
    }
  }
});

/** Verifies that the public proof page exercises the canonical namespace consumers should copy. */
test('library demos render the canonical usk semantic component namespace', () => {
  for (const relativeFile of ['index.html', 'demo/index.html']) {
    const markup = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
    assert.match(markup, /class="[^"]*\busk-button\b/);
    assert.match(markup, /class="[^"]*\busk-stepper\b/);
    assert.doesNotMatch(markup, /class="[^"]*\bui-[a-z]/);
    assert.match(markup, /Every component below keeps its <code>\.usk-\*<\/code> class/);
  }
});

test('manifest partitions retained, implemented, and pending Task 11 selectors', () => {
  const implementationStatus = manifest.semanticComponentApi.implementationStatus;
  const declaredSelectors = semanticEntries().map(({ selector }) => selector);

  assert.deepEqual(implementationStatus, expectedSemanticComponentApi.implementationStatus);
  assert.deepEqual(implementationStatus.retained.selectors, expectedRetainedSelectors);
  assert.deepEqual(implementationStatus.implemented.selectors, expectedImplementedSelectors);
  assert.deepEqual(implementationStatus.pending.selectors, expectedPendingSelectors);
  assert.equal(implementationStatus.pending.targetTask, 11);
  assert.equal(implementationStatus.retained.selectors.length, 2);
  assert.equal(implementationStatus.implemented.selectors.length, 73);
  assert.equal(implementationStatus.pending.selectors.length, 0);
  assert.deepEqual(
    new Set([
      ...implementationStatus.retained.selectors,
      ...implementationStatus.implemented.selectors,
      ...implementationStatus.pending.selectors
    ]),
    new Set(declaredSelectors)
  );
});

test('authored preset CSS retains only the two historical ui compatibility hooks', () => {
  const authoredSemanticClasses = new Set();

  for (const preset of manifest.presets) {
    const relativeFile = `styles/${preset.id}.css`;
    const rules = selectorFacts(relativeFile);
    const spinnerRule = rules.find((rule) => rule.classes.has('.ui-spinner'));
    const tooltipRule = rules.find((rule) => rule.classes.has('.ui-tooltip'));

    assert.ok(spinnerRule, `${relativeFile} must retain .ui-spinner`);
    assert.equal(spinnerRule.classes.has(`.${preset.prefix}-spinner`), true);
    assert.equal(spinnerRule.classes.has(`.${preset.prefix}-loading-spinner`), true);
    assert.equal(spinnerRule.classes.has('.loading-spinner'), true);
    assert.equal(ruleHasAttribute(spinnerRule, 'data-loading-spinner'), true);
    assert.equal(ruleHasAttribute(spinnerRule, 'data-ui', preset.id), true);

    assert.ok(tooltipRule, `${relativeFile} must retain .ui-tooltip`);
    assert.equal(tooltipRule.classes.has(`.${preset.prefix}-tooltip`), true);
    assert.equal(ruleHasAttribute(tooltipRule, 'role', 'tooltip'), true);
    assert.equal(ruleHasAttribute(tooltipRule, 'data-tooltip'), true);
    assert.equal(ruleHasAttribute(tooltipRule, 'data-ui', preset.id), true);
  }

  // Scan every authored stylesheet so pending selectors cannot collide with retained hooks early.
  const authoredCssFiles = fs.readdirSync(path.join(rootDir, 'styles'))
    .filter((fileName) => fileName.endsWith('.css'));
  for (const fileName of authoredCssFiles) {
    for (const rule of selectorFacts(`styles/${fileName}`)) {
      for (const className of rule.classes) {
        if (className.startsWith('.ui-')) authoredSemanticClasses.add(className);
      }
    }
  }

  const anchorRules = selectorFacts('styles/components.css')
    .filter((rule) => ruleHasAttribute(rule, 'data-ui-tooltip-anchor'));
  assert.ok(anchorRules.length > 0, 'styles/components.css must retain [data-ui-tooltip-anchor]');
  assert.equal(
    anchorRules.some((rule) => rule.declarations.has('position')),
    true,
    'the authored anchor hook must continue to establish positioning behavior'
  );
  assert.deepEqual(authoredSemanticClasses, new Set(['.ui-spinner', '.ui-tooltip']));
});

test('generated entrypoints scope implemented aliases while raw preset exports stay advanced', () => {
  const aggregateEntrypoints = [
    'dist/ui-style-kit.css',
    'dist/ui-style-kit.min.css',
    'dist/ui-style-kit.visual.css',
    'dist/ui-style-kit.visual.min.css',
    'dist/ui-style-kit.with-bridge.css',
    'dist/ui-style-kit.with-bridge.min.css'
  ];

  for (const relativeFile of aggregateEntrypoints) {
    const selectors = selectorTexts(relativeFile);
    for (const selector of expectedImplementedSelectors) {
      const owningRules = selectors.filter((candidate) => candidate.includes(selector));
      assert.ok(owningRules.length > 0, `${relativeFile} must implement ${selector}`);
      assert.equal(
        owningRules.every((candidate) => candidate.includes(':where([data-ui=')),
        true,
        `${relativeFile} must scope ${selector} beneath a specificity-safe preset root`
      );
    }
    for (const [selector, variants] of Object.entries(
      expectedSemanticComponentApi.variantAttribute.valuesBySelector
    )) {
      for (const variant of variants) {
        assert.equal(
          selectors.some((candidate) =>
            candidate.includes(selector)
            && selectorHasAttributeValue(candidate, 'data-ui-variant', variant)
          ),
          true,
          `${relativeFile} must implement the ${selector} ${variant} variant`
        );
      }
    }
  }

  for (const preset of manifest.presets) {
    const relativeFile = `dist/visual/${preset.id}.css`;
    const selectors = selectorTexts(relativeFile);
    for (const selector of expectedImplementedSelectors) {
      const owningRules = selectors.filter((candidate) => candidate.includes(selector));
      assert.ok(owningRules.length > 0, `${relativeFile} must implement ${selector}`);
      assert.equal(
        owningRules.every((candidate) => selectorHasAttributeValue(candidate, 'data-ui', preset.id)),
        true,
        `${relativeFile} must scope ${selector} to its focused preset`
      );
    }
  }
});

test('generated semantic aliases preserve exact class-token safety declarations', () => {
  const safetyPropertiesBySelector = {
    '.usk-button': ['max-inline-size', 'min-inline-size', 'white-space', 'overflow-wrap', 'word-break'],
    '.usk-icon-button': ['max-inline-size', 'min-inline-size', 'white-space', 'overflow-wrap', 'word-break'],
    '.usk-card': ['max-inline-size', 'min-inline-size'],
    '.usk-field': ['max-inline-size', 'min-inline-size'],
    '.usk-badge': ['max-inline-size', 'min-inline-size', 'white-space', 'overflow-wrap', 'word-break'],
    '.usk-alert': ['max-inline-size', 'min-inline-size'],
    '.usk-nav': ['max-inline-size', 'min-inline-size'],
    '.usk-nav-link': ['max-inline-size', 'min-inline-size', 'white-space', 'overflow-wrap', 'word-break'],
    '.usk-table-wrap': ['max-inline-size', 'min-inline-size'],
    '.usk-toolbar': ['max-inline-size', 'min-inline-size']
  };

  for (const relativeFile of [
    'dist/ui-style-kit.visual.css',
    ...manifest.presets.map(({ id }) => `dist/visual/${id}.css`)
  ]) {
    const rules = generatedSelectorRules(relativeFile);
    for (const [selector, properties] of Object.entries(safetyPropertiesBySelector)) {
      for (const property of properties) {
        assert.equal(
          rules.some((rule) => rule.text.includes(selector) && rule.declarations.has(property)),
          true,
          `${relativeFile} must carry ${property} from exact class-token sources into ${selector}`
        );
      }
    }
  }
});

test('generated semantic selector lists collapse duplicate namespace aliases', () => {
  for (const relativeFile of [
    'dist/ui-style-kit.visual.css',
    ...manifest.presets.map(({ id }) => `dist/visual/${id}.css`)
  ]) {
    const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');

    assert.doesNotMatch(
      css,
      /:where\(\.usk-([a-z-]+)(?:,\s*\.usk-\1)+\)/,
      `${relativeFile} must not repeat canonical aliases inside selector lists`
    );
    assert.doesNotMatch(
      css,
      /:where\(\.ui-([a-z-]+)(?:,\s*\.ui-\1)+\)/,
      `${relativeFile} must not repeat compatibility aliases inside selector lists`
    );
  }
});

test('generated semantic aliases never require descendant data-ui roots', () => {
  for (const relativeFile of [
    'dist/ui-style-kit.visual.css',
    ...manifest.presets.map(({ id }) => `dist/visual/${id}.css`)
  ]) {
    for (const rule of generatedSelectorRules(relativeFile)) {
      if (!expectedImplementedSelectors.some((selector) => rule.text.includes(selector))) continue;

      assert.ok(
        dataUiRootCompounds(rule.selector).size <= 1,
        `${relativeFile} generated an impossible double-root alias: ${rule.text}`
      );
    }
  }
});

test('selector alias generation preserves reviewed declaration artifacts byte-for-byte', () => {
  /** Reviewed 25-theme output includes text-ink fallbacks and preserves other declarations. */
  assert.deepEqual(declarationArtifactFacts('dist/ui-style-kit.visual.css'), {
    count: 36813,
    sha256: '5c91bc6b2e7420344712301403b7484903d506fd04ad10a3ce414a805b532ce8'
  });
  assert.deepEqual(declarationArtifactFacts('dist/ui-style-kit.css'), {
    count: 37264,
    sha256: '638774eef02572309c557769bb3ed4161d9b7b7d83723e0f0056a22087e9bacd'
  });
});

test('semantic source suffixes and contextual variants exist in every composed preset API', () => {
  const currentSuffixes = new Set(manifest.classApi.universalVisualSuffixes);
  const requiredSuffixes = semanticRequiredSuffixes();

  assert.equal(manifest.classApi.universalVisualSuffixes.length, 150);
  for (const suffix of requiredSuffixes) {
    assert.equal(currentSuffixes.has(suffix), true, `${suffix} must remain a current universal visual suffix`);
  }

  for (const preset of manifest.presets) {
    const composedNames = composedClassNames(preset);
    for (const suffix of requiredSuffixes) {
      assert.equal(
        composedNames.has(`${preset.prefix}-${suffix}`),
        true,
        `${preset.id} composed source is missing .${preset.prefix}-${suffix}`
      );
    }
  }
});

test('foreground-only semantic states receive surface-readable ink in every mode', () => {
  const themeColorsCss = fs.readFileSync(path.join(rootDir, 'styles/theme-colors.css'), 'utf8');
  const darkAndContrastMode = themeColorsCss.match(
    /:where\(\[data-ui\]\[data-mode="dark"\],\s*\[data-ui\]\[data-mode="contrast"\]\)\s*{([^}]+)}/
  );

  assert.ok(darkAndContrastMode, 'dark and contrast modes must share an explicit text-ink contract');
  assert.match(
    darkAndContrastMode[1],
    /--usk-primary-ink:\s*rgb\(var\(--usk-link-rgb\)\);/,
    'primary text treatments must use the surface-readable link role'
  );
  assert.match(
    darkAndContrastMode[1],
    /--usk-accent-ink:\s*rgb\(var\(--usk-link-rgb\)\);/,
    'accent text treatments must use the surface-readable link role'
  );
});

test('partial extras and deprecated structural aliases stay outside the semantic contract', () => {
  const semanticSuffixes = semanticRequiredSuffixes();
  const partialExtras = new Set(Object.values(manifest.classApi.presetExtras).flat());
  const deprecatedSuffixes = new Set(manifest.classApi.deprecatedStructuralSuffixes);

  assert.equal(partialExtras.size, 293);
  assert.equal(deprecatedSuffixes.size, 7);
  for (const suffix of semanticSuffixes) {
    assert.equal(partialExtras.has(suffix), false, `${suffix} must not be a partial preset extra`);
    assert.equal(deprecatedSuffixes.has(suffix), false, `${suffix} must not be a deprecated structural alias`);
  }
  assert.deepEqual(manifest.semanticComponentApi.presetPrefixedClasses, {
    status: 'supported',
    uses: ['compatibility', 'advanced']
  });
});

test('modal and dialog use one native fallback without inventing generic selectors', () => {
  const selectors = new Set(semanticEntries().map(({ selector }) => selector));

  assert.deepEqual(manifest.semanticComponentApi.nativeFallbacks, [
    { roles: ['modal', 'dialog'], element: 'dialog', genericSelectors: [] }
  ]);
  assert.equal(selectors.has('.usk-modal'), false);
  assert.equal(selectors.has('.usk-dialog'), false);
});

test('data-ui-variant is the only semantic component attribute added to the preset switch', () => {
  const api = manifest.semanticComponentApi;
  assert.ok(api, 'manifest.json must declare semanticComponentApi');
  const variantContexts = Object.keys(api.variantAttribute.valuesBySelector);
  const selectors = new Set(semanticEntries().map(({ selector }) => selector));

  assert.equal(api.presetSwitchAttribute, 'data-ui');
  assert.equal(api.variantAttribute.name, 'data-ui-variant');
  assert.equal(api.variantAttribute.neutral, 'omitted');
  assert.equal(variantContexts.length, 5);
  assert.equal(variantContexts.every((selector) => selectors.has(selector)), true);
  for (const values of Object.values(api.variantAttribute.valuesBySelector)) {
    assert.equal(new Set(values).size, values.length, 'variant values must be unique within their selector context');
  }

  const serializedApi = JSON.stringify(api);
  for (const forbiddenAttribute of ['data-ui-state', 'data-ui-size', 'data-ui-placement']) {
    assert.equal(serializedApi.includes(forbiddenAttribute), false, `${forbiddenAttribute} must stay out of the API`);
  }
});

test('manifest presets generate unchanged generic markup cases for Task 11 runtime switching', () => {
  const cases = semanticRuntimeCases(manifest);
  const declaredSelectors = semanticEntries().map(({ selector }) => selector);
  const presetPrefixes = manifest.presets.map(({ prefix }) => prefix);

  assert.equal(cases.length, 20);
  assert.deepEqual(cases.map(({ preset }) => preset), manifest.presets.map(({ id }) => id));
  assert.equal(new Set(cases.map(({ markup }) => markup)).size, 1, 'generic markup must not change by preset');
  for (const runtimeCase of cases) {
    assert.deepEqual(runtimeCase.rootAttributes, { 'data-ui': runtimeCase.preset });
  }
  for (const selector of declaredSelectors) {
    assert.match(semanticComponentMarkup, new RegExp(`class="[^"]*\\b${selector.slice(1)}\\b`));
  }
  for (const prefix of presetPrefixes) {
    assert.doesNotMatch(semanticComponentMarkup, new RegExp(`class="[^"]*\\b${prefix}-`));
  }
  assert.match(semanticComponentMarkup, /<dialog open>Native modal and dialog fallback<\/dialog>/);
  assert.doesNotMatch(semanticComponentMarkup, /\bui-(?:modal|dialog)\b/);
});
