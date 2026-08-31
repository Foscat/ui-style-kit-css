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

const expectedRetainedSelectors = ['.ui-spinner', '.ui-tooltip'];
const expectedImplementedSelectors = [
  '.ui-button',
  '.ui-icon-button',
  '.ui-card',
  '.ui-field',
  '.ui-label',
  '.ui-help-text',
  '.ui-input',
  '.ui-select',
  '.ui-textarea',
  '.ui-check',
  '.ui-check-control',
  '.ui-radio',
  '.ui-radio-control',
  '.ui-switch',
  '.ui-switch-track',
  '.ui-switch-thumb',
  '.ui-badge',
  '.ui-alert',
  '.ui-alert-title',
  '.ui-alert-body',
  '.ui-nav',
  '.ui-nav-link',
  '.ui-table',
  '.ui-table-wrap',
  '.ui-progress',
  '.ui-progress-bar',
  '.ui-toolbar'
];
const expectedPendingSelectors = [];

const expectedSemanticComponentApi = {
  presetSwitchAttribute: 'data-ui',
  selectorsByRole: {
    button: [
      { selector: '.ui-button', sourceSuffix: 'button' },
      { selector: '.ui-icon-button', sourceSuffix: 'icon-button' }
    ],
    card: [
      { selector: '.ui-card', sourceSuffix: 'card' }
    ],
    form: [
      { selector: '.ui-field', sourceSuffix: 'field' },
      { selector: '.ui-label', sourceSuffix: 'label' },
      { selector: '.ui-help-text', sourceSuffix: 'help-text' },
      { selector: '.ui-input', sourceSuffix: 'input' },
      { selector: '.ui-select', sourceSuffix: 'select' },
      { selector: '.ui-textarea', sourceSuffix: 'textarea' },
      { selector: '.ui-check', sourceSuffix: 'check' },
      { selector: '.ui-check-control', sourceSuffix: 'check-control' },
      { selector: '.ui-radio', sourceSuffix: 'radio' },
      { selector: '.ui-radio-control', sourceSuffix: 'radio-control' },
      { selector: '.ui-switch', sourceSuffix: 'switch' },
      { selector: '.ui-switch-track', sourceSuffix: 'switch-track' },
      { selector: '.ui-switch-thumb', sourceSuffix: 'switch-thumb' }
    ],
    badge: [
      { selector: '.ui-badge', sourceSuffix: 'badge' }
    ],
    alert: [
      { selector: '.ui-alert', sourceSuffix: 'alert' },
      { selector: '.ui-alert-title', sourceSuffix: 'alert-title' },
      { selector: '.ui-alert-body', sourceSuffix: 'alert-body' }
    ],
    navigation: [
      { selector: '.ui-nav', sourceSuffix: 'nav' },
      { selector: '.ui-nav-link', sourceSuffix: 'nav-link' }
    ],
    table: [
      { selector: '.ui-table', sourceSuffix: 'table' },
      { selector: '.ui-table-wrap', sourceSuffix: 'table-wrap' }
    ],
    progress: [
      { selector: '.ui-progress', sourceSuffix: 'progress' },
      { selector: '.ui-progress-bar', sourceSuffix: 'progress-bar' }
    ],
    toolbar: [
      { selector: '.ui-toolbar', sourceSuffix: 'toolbar' }
    ],
    loading: [
      { selector: '.ui-spinner', sourceSuffix: 'spinner' }
    ],
    tooltip: [
      { selector: '.ui-tooltip', sourceSuffix: 'tooltip' }
    ]
  },
  variantAttribute: {
    name: 'data-ui-variant',
    neutral: 'omitted',
    valuesBySelector: {
      '.ui-button': ['primary', 'secondary', 'danger', 'ghost'],
      '.ui-badge': ['primary', 'secondary', 'success', 'warning', 'danger'],
      '.ui-alert': ['success', 'warning', 'danger']
    }
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
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
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
  assert.equal(entries.length, 29);
  assert.equal(new Set(entries.map(({ selector }) => selector)).size, entries.length);
  assert.equal(new Set(entries.map(({ sourceSuffix }) => sourceSuffix)).size, entries.length);
  assert.equal(entries.every(({ selector }) => /^\.ui-[a-z]+(?:-[a-z]+)*$/.test(selector)), true);
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
  assert.equal(implementationStatus.implemented.selectors.length, 27);
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

test('authored CSS retains only the two implemented semantic hooks and all legacy aliases', () => {
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
  assert.deepEqual(authoredSemanticClasses, new Set(expectedRetainedSelectors));
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
    '.ui-button': ['max-inline-size', 'min-inline-size', 'white-space'],
    '.ui-icon-button': ['max-inline-size', 'min-inline-size', 'white-space'],
    '.ui-card': ['max-inline-size', 'min-inline-size', 'overflow-wrap'],
    '.ui-field': ['max-inline-size', 'min-inline-size', 'overflow-wrap'],
    '.ui-badge': ['max-inline-size', 'min-inline-size', 'white-space'],
    '.ui-alert': ['max-inline-size', 'min-inline-size', 'overflow-wrap'],
    '.ui-nav': ['max-inline-size', 'min-inline-size', 'overflow-wrap'],
    '.ui-nav-link': ['max-inline-size', 'min-inline-size', 'white-space'],
    '.ui-table-wrap': ['max-inline-size', 'min-inline-size', 'overflow-wrap'],
    '.ui-toolbar': ['max-inline-size', 'min-inline-size', 'overflow-wrap']
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
  // These fingerprints include the manifest-generated containment foundation and all authored declarations.
  assert.deepEqual(declarationArtifactFacts('dist/ui-style-kit.visual.css'), {
    count: 16204,
    sha256: '50b756124a8e4cf037b8325fe6a7060bd8e61325287bf4e21fdb97cab83e180a'
  });
  assert.deepEqual(declarationArtifactFacts('dist/ui-style-kit.css'), {
    count: 16635,
    sha256: 'ae8cbad77450c12912b434d38e36705151b26068b3c401a0dc262f6931ad2e2d'
  });
});

test('semantic source suffixes and contextual variants exist in every composed preset API', () => {
  const currentSuffixes = new Set(manifest.classApi.universalVisualSuffixes);
  const requiredSuffixes = semanticRequiredSuffixes();

  assert.equal(manifest.classApi.universalVisualSuffixes.length, 94);
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

test('partial extras and deprecated structural aliases stay outside the semantic contract', () => {
  const semanticSuffixes = semanticRequiredSuffixes();
  const partialExtras = new Set(Object.values(manifest.classApi.presetExtras).flat());
  const deprecatedSuffixes = new Set(manifest.classApi.deprecatedStructuralSuffixes);

  assert.equal(partialExtras.size, 23);
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
  assert.equal(selectors.has('.ui-modal'), false);
  assert.equal(selectors.has('.ui-dialog'), false);
});

test('data-ui-variant is the only semantic component attribute added to the preset switch', () => {
  const api = manifest.semanticComponentApi;
  assert.ok(api, 'manifest.json must declare semanticComponentApi');
  const variantContexts = Object.keys(api.variantAttribute.valuesBySelector);
  const selectors = new Set(semanticEntries().map(({ selector }) => selector));

  assert.equal(api.presetSwitchAttribute, 'data-ui');
  assert.equal(api.variantAttribute.name, 'data-ui-variant');
  assert.equal(api.variantAttribute.neutral, 'omitted');
  assert.equal(variantContexts.length, 3);
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
