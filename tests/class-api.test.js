import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, parse, walk } from 'css-tree';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const styles = [
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

const coreSuffixes = [
  'page',
  'container',
  'section',
  'grid',
  'stack',
  'cluster',
  'panel',
  'well',
  'inset',
  'card',
  'toolbar',
  'nav',
  'nav-link',
  'table-wrap',
  'table',
  'title',
  'subtitle',
  'kicker',
  'heading',
  'copy',
  'label',
  'help-text',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-success',
  'text-warning',
  'text-danger',
  'text-accent',
  'field',
  'input',
  'textarea',
  'select',
  'button',
  'button-primary',
  'button-secondary',
  'button-danger',
  'icon-button',
  'badge',
  'badge-primary',
  'badge-secondary',
  'badge-success',
  'badge-warning',
  'badge-danger',
  'alert',
  'alert-success',
  'alert-warning',
  'alert-danger',
  'alert-title',
  'alert-body',
  'progress',
  'progress-bar',
  'hover-lift',
  'spinner',
  'loading-spinner',
  'spinner-sm',
  'spinner-lg'
];

const extendedUtilityStyles = new Map([
  ['minimal-saas', 'saas'],
  ['bento', 'bento'],
  ['maximalist', 'max'],
  ['bauhaus', 'bau'],
  ['tactile', 'tactile'],
  ['neumorphism', 'neo'],
  ['retrofuturism', 'retro']
]);

const extendedUtilitySuffixes = [
  'bg-primary',
  'bg-secondary',
  'disabled',
  'surface',
  'surface-sm',
  'surface-lg',
  'border',
  'button-ghost',
  'check',
  'check-control',
  'radio',
  'radio-control',
  'switch',
  'switch-track',
  'switch-thumb',
  'divider',
  'pill',
  'rounded',
  'rounded-lg',
  'rounded-xl',
  'split',
  'sr-only',
  'visually-hidden',
  'skip-link'
];

function astFor(relativeFile) {
  const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
  return parse(css, { filename: relativeFile, positions: true });
}

function classNames(ast) {
  const names = new Set();

  walk(ast, {
    visit: 'ClassSelector',
    enter(node) {
      names.add(node.name);
    }
  });

  return names;
}

function ruleDeclarations(rule) {
  const declarations = new Map();

  rule.block.children.forEach((node) => {
    if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
  });

  return declarations;
}

function rulesWithClass(ast, className) {
  const rules = [];

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      let matches = false;
      walk(rule.prelude, {
        visit: 'ClassSelector',
        enter(node) {
          if (node.name === className) matches = true;
        }
      });
      if (matches) rules.push(rule);
    }
  });

  return rules;
}

function customProperties(ast) {
  const properties = new Set();

  walk(ast, {
    visit: 'Declaration',
    enter(node) {
      if (node.property.startsWith('--')) properties.add(node.property);
    }
  });

  return properties;
}

function ruleHasAttributes(rule, expectedAttributes) {
  const attributes = [];

  walk(rule.prelude, {
    visit: 'AttributeSelector',
    enter(node) {
      attributes.push({
        name: node.name?.name,
        value: node.value?.value ?? node.value?.name ?? null
      });
    }
  });

  return expectedAttributes.every((expected) =>
    attributes.some(({ name, value }) => name === expected.name && value === expected.value)
  );
}

function ruleHasPseudoElement(rule, name) {
  let found = false;

  walk(rule.prelude, {
    visit: 'PseudoElementSelector',
    enter(node) {
      if (node.name === name) found = true;
    }
  });

  return found;
}

test('documented core class suffixes have AST selectors in every style file', () => {
  for (const [ui, prefix] of styles) {
    const names = classNames(astFor(path.join('styles', `${ui}.css`)));

    for (const suffix of coreSuffixes) {
      assert.equal(names.has(`${prefix}-${suffix}`), true, `${ui} is missing .${prefix}-${suffix}`);
    }
    assert.equal(names.has('is-active'), true, `${ui} is missing the shared .is-active state selector`);
  }
});
test('documented extended utilities have AST selectors in the expected style files', () => {
  for (const [ui, prefix] of extendedUtilityStyles.entries()) {
    const names = classNames(astFor(path.join('styles', `${ui}.css`)));

    for (const suffix of extendedUtilitySuffixes) {
      assert.equal(names.has(`${prefix}-${suffix}`), true, `${ui} is missing .${prefix}-${suffix}`);
    }
  }
});

test('semantic text utility declarations consume their direct palette tokens', () => {
  const roles = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger'];

  for (const [ui, prefix] of styles) {
    const ast = astFor(path.join('styles', `${ui}.css`));

    for (const role of roles) {
      const className = `${prefix}-text-${role}`;
      const hasDirectColor = rulesWithClass(ast, className)
        .some((rule) => ruleDeclarations(rule).get('color') === `var(--${prefix}-${role})`);

      assert.equal(hasDirectColor, true, `.${className} should consume --${prefix}-${role}`);
    }
  }
});

test('theme defaults expose token declarations for paint, controls, and spinners', () => {
  for (const [ui, prefix] of styles) {
    const ast = astFor(path.join('styles', `${ui}.css`));
    const properties = customProperties(ast);
    const requiredTokens = [
      'font-body',
      'font-heading',
      'font-control',
      'fg',
      'surface-fg',
      'muted',
      'control-fg',
      'on-primary',
      'on-secondary',
      'on-accent',
      'on-success',
      'on-warning',
      'on-danger',
      'theme-bg',
      'theme-bg-size',
      'card-bg',
      'control-bg',
      'spinner-track',
      'spinner-stroke',
      'spinner-accent'
    ];

    for (const token of requiredTokens) {
      assert.equal(properties.has(`--${prefix}-${token}`), true, `${ui} is missing --${prefix}-${token}`);
    }

    const themedBackground = [];
    walk(ast, {
      visit: 'Rule',
      enter(rule) {
        if (
          ruleHasAttributes(rule, [
            { name: 'data-ui', value: ui },
            { name: 'data-theme', value: null },
            { name: 'data-mode', value: null }
          ]) &&
          ruleDeclarations(rule).get('background') === `var(--${prefix}-theme-bg)`
        ) {
          themedBackground.push(rule);
        }
      }
    });
    assert.ok(themedBackground.length > 0, `${ui} should apply its theme-driven page background`);

    for (const className of [`${prefix}-card`, `${prefix}-panel`]) {
      const usesCardPaint = rulesWithClass(ast, className)
        .some((rule) => ruleDeclarations(rule).get('background') === `var(--${prefix}-card-bg)`);
      assert.equal(usesCardPaint, true, `.${className} should consume --${prefix}-card-bg`);
    }

    let hasSpinnerKeyframes = false;
    walk(ast, {
      visit: 'Atrule',
      enter(node) {
        if (node.name === 'keyframes' && node.prelude && generate(node.prelude) === `${prefix}-spin`) {
          hasSpinnerKeyframes = true;
        }
      }
    });
    assert.equal(hasSpinnerKeyframes, true, `${ui} should declare @keyframes ${prefix}-spin`);

    const busyButtonRule = rulesWithClass(ast, `${prefix}-button`)
      .some((rule) =>
        ruleHasAttributes(rule, [{ name: 'aria-busy', value: 'true' }]) &&
        ruleHasPseudoElement(rule, 'after')
      );
    assert.equal(busyButtonRule, true, `${ui} busy buttons should render a spinner pseudo-element`);
  }
});

test('native semantic coverage and spinner aliases are represented in the selector AST', () => {
  const nativeAst = astFor(path.join('styles', 'native-elements.css'));
  const requiredTypeGroups = [
    ['main', 'section', 'header', 'footer', 'nav', 'article', 'aside', 'address'],
    ['article', 'aside'],
    ['dl'],
    ['dt'],
    ['dd'],
    ['strong', 'b'],
    ['em', 'i', 'cite', 'var', 'q'],
    ['ins'],
    ['del', 's'],
    ['output'],
    ['optgroup', 'option'],
    ['time', 'data', 'dfn', 'ruby'],
    ['rt', 'rp'],
    ['ul', 'ol', 'menu'],
    ['search'],
    ['img', 'picture', 'video', 'canvas', 'svg', 'iframe', 'audio', 'object', 'embed', 'math']
  ];
  const ruleTypeGroups = [];

  walk(nativeAst, {
    visit: 'Rule',
    enter(rule) {
      const types = new Set();
      walk(rule.prelude, {
        visit: 'TypeSelector',
        enter(node) {
          types.add(node.name);
        }
      });
      ruleTypeGroups.push(types);
    }
  });

  for (const expectedGroup of requiredTypeGroups) {
    assert.equal(
      ruleTypeGroups.some((types) => expectedGroup.every((type) => types.has(type))),
      true,
      `shared native layer is missing coverage for ${expectedGroup.join(', ')}`
    );
  }

  for (const [ui, prefix] of styles) {
    const ast = astFor(path.join('styles', `${ui}.css`));
    const spinnerRules = rulesWithClass(ast, `${prefix}-spinner`);

    assert.equal(
      spinnerRules.some((rule) => classNames(rule.prelude).has(`${prefix}-loading-spinner`)),
      true,
      `${ui} should keep spinner utility aliases in one declaration rule`
    );
  }
});
