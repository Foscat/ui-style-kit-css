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

const extendedUtilitySuffixes = [
  'bg-primary',
  'bg-secondary',
  'button-ghost',
  'button-pill',
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
  'tooltip-bottom',
  'tooltip-left',
  'tooltip-right',
  'tooltip-top',
  'divider',
  'pill',
  'rounded',
  'rounded-lg',
  'rounded-xl',
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

function composedClassNames(ui) {
  return new Set([
    ...classNames(astFor(path.join('styles', 'components.css'))),
    ...classNames(astFor(path.join('styles', `${ui}.css`)))
  ]);
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

function composedRulesWithClass(ui, className) {
  return [
    ...rulesWithClass(astFor(path.join('styles', 'components.css')), className),
    ...rulesWithClass(astFor(path.join('styles', `${ui}.css`)), className)
  ];
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

function ruleHasPseudoClass(rule, name) {
  let found = false;

  walk(rule.prelude, {
    visit: 'PseudoClassSelector',
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
test('documented extended utilities compose through shared components for every preset', () => {
  for (const [ui, prefix] of styles) {
    const names = composedClassNames(ui);

    for (const suffix of extendedUtilitySuffixes) {
      assert.equal(names.has(`${prefix}-${suffix}`), true, `${ui} is missing .${prefix}-${suffix}`);
    }
  }
});

test('button pill components have centered 44px geometry and complete interaction hooks', () => {
  for (const [ui, prefix] of styles) {
    const className = `${prefix}-button-pill`;
    const rules = composedRulesWithClass(ui, className);
    const declarations = new Map(rules.flatMap((rule) => [...ruleDeclarations(rule)]));

    assert.equal(declarations.get('display'), 'inline-flex', `.${className} should use inline-flex`);
    assert.equal(declarations.get('align-items'), 'center', `.${className} should vertically center content`);
    assert.equal(declarations.get('justify-content'), 'center', `.${className} should horizontally center content`);
    assert.equal(declarations.get('box-sizing'), 'border-box', `.${className} should use reliable box sizing`);
    assert.equal(declarations.get('min-block-size'), '44px', `.${className} should prefer a 44px minimum height`);
    assert.equal(declarations.get('text-align'), 'center', `.${className} should center multiline text`);
    assert.equal(declarations.get('overflow-wrap'), 'break-word', `.${className} should wrap only when text would overflow`);
    assert.equal(declarations.get('word-break'), 'normal', `.${className} should preserve normal word boundaries`);
    assert.equal(declarations.get('padding-inline'), 'max(1rem,1em)', `.${className} should keep safe inline padding`);
    assert.equal(declarations.get('color'), `var(--${prefix}-on-primary)`, `.${className} should use theme foreground`);
    assert.equal(declarations.get('background'), `var(--${prefix}-primary)`, `.${className} should use theme paint`);

    assert.equal(rules.some((rule) => ruleHasPseudoClass(rule, 'hover')), true, `.${className} should expose hover`);
    assert.equal(rules.some((rule) => ruleHasPseudoClass(rule, 'active')), true, `.${className} should expose active`);
    assert.equal(rules.some((rule) => ruleHasPseudoClass(rule, 'focus-visible')), true, `.${className} should expose focus-visible`);
    assert.equal(rules.some((rule) => ruleHasPseudoClass(rule, 'disabled')), true, `.${className} should expose disabled`);
    assert.equal(
      rules.some((rule) => ruleHasAttributes(rule, [{ name: 'aria-pressed', value: 'true' }])),
      true,
      `.${className} should expose pressed state`
    );
  }
});

test('tooltip direction helpers position all preset tooltip surfaces', () => {
  const expected = new Map([
    ['tooltip-top', ['inset-block-end', 'calc(100% + .5rem)']],
    ['tooltip-right', ['inset-inline-start', 'calc(100% + .5rem)']],
    ['tooltip-bottom', ['inset-block-start', 'calc(100% + .5rem)']],
    ['tooltip-left', ['inset-inline-end', 'calc(100% + .5rem)']]
  ]);

  for (const [ui, prefix] of styles) {
    for (const [suffix, [property, value]] of expected) {
      const className = `${prefix}-${suffix}`;
      const declarations = new Map(
        composedRulesWithClass(ui, className).flatMap((rule) => [...ruleDeclarations(rule)])
      );
      const positionedRules = composedRulesWithClass(ui, className)
        .filter((rule) => ruleDeclarations(rule).get('position') === 'absolute');

      assert.equal(declarations.get('position'), 'absolute', `.${className} should be positionable`);
      assert.equal(declarations.get(property), value, `.${className} should set ${property}`);
      assert.equal(
        positionedRules.every((rule) => ruleHasAttributes(rule, [{ name: 'data-ui-tooltip-anchor', value: null }])),
        true,
        `.${className} should detach only inside an anchored tooltip context`
      );
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
