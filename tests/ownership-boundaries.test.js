import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  auditOwnership,
  validateAllowlist
} from '../scripts/check-css-ownership.mjs';

const reviewedAt = new Date('2026-08-08T12:00:00Z');

function exception(overrides = {}) {
  return {
    selector: '.bento-grid-feature',
    property: 'grid-template-columns',
    reason: 'Keeps the documented Bento feature component internally composed.',
    owner: 'ui-style-kit-css',
    reviewDate: '2026-08-08',
    ...overrides
  };
}

test('visual-only rejects page topology while a reviewed component exception is exact', () => {
  const css = `
    .saas-page { max-width: 72rem; }
    .saas-page-content { width: 100%; }
    .saas-page-card { width: 72rem; }
    .page .saas-card { width: 100%; }
    #app { width: 100%; }
    main { position: absolute; }
    .bento-grid-feature { grid-template-columns: repeat(6, 1fr); }
  `;
  const result = auditOwnership({
    target: 'ui-visual',
    css,
    manifest: {
      presets: [{ id: 'minimal-saas', prefix: 'saas' }],
      classApi: {
        deprecatedStructuralSuffixes: ['page'],
        universalVisualSuffixes: ['card'],
        presetExtras: { 'minimal-saas': [] }
      }
    },
    allowlist: [exception()],
    now: reviewedAt
  });

  assert.deepEqual(result.violations, [
    {
      target: 'ui-visual',
      selector: '.saas-page',
      property: 'max-width',
      line: 2,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: '.saas-page-content',
      property: 'width',
      line: 3,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: '.saas-page-card',
      property: 'width',
      line: 4,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: '#app',
      property: 'width',
      line: 6,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: 'main',
      property: 'position',
      line: 7,
      rule: 'ui-page-topology'
    }
  ]);
  assert.equal(result.matchedAllowlistCount, 1);
});

test('visual-only rejects unreviewed grid topology and placement', () => {
  const result = auditOwnership({
    target: 'ui-visual',
    css: '.bento-tile { grid-area: span 2 / span 4; grid-column: span 2; grid: auto / 1fr; }',
    manifest: { classApi: { deprecatedStructuralSuffixes: [] } },
    allowlist: [],
    now: reviewedAt
  });

  assert.deepEqual(result.violations, [
    {
      target: 'ui-visual',
      selector: '.bento-tile',
      property: 'grid-area',
      line: 1,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: '.bento-tile',
      property: 'grid-column',
      line: 1,
      rule: 'ui-page-topology'
    },
    {
      target: 'ui-visual',
      selector: '.bento-tile',
      property: 'grid',
      line: 1,
      rule: 'ui-page-topology'
    }
  ]);
});

test('visual-only permits component-internal grids declared by the public manifest', () => {
  const result = auditOwnership({
    target: 'ui-visual',
    css: '.saas-feature-strip { grid-template-columns: repeat(3, 1fr); }',
    manifest: {
      presets: [{ id: 'minimal-saas', prefix: 'saas' }],
      classApi: {
        deprecatedStructuralSuffixes: [],
        universalVisualSuffixes: ['feature-strip'],
        presetExtras: { 'minimal-saas': [] }
      }
    },
    allowlist: [],
    now: reviewedAt
  });

  assert.deepEqual(result.violations, []);
});

test('visual-only rejects structural flex topology and preserves manifest component flex', () => {
  const css = `
    html { flex: 1; }
    body { flex-flow: row wrap; }
    #app { flex-direction: column; }
    #root { flex-wrap: wrap; }
    .page-shell { gap: 2rem; }
    .page { row-gap: 1rem; }
    main { column-gap: 3rem; }
    [data-layout] { align-content: start; }
    [data-page] { align-items: center; }
    [data-shell] { align-self: stretch; }
    [role=main] { justify-content: space-between; }
    .main { justify-items: center; }
    section { justify-self: stretch; }
    .saas-card { display: flex; flex-flow: column wrap; gap: 1rem; align-items: center; justify-content: center; }
    .page-shell .saas-card { flex-direction: column; }
  `;
  const result = auditOwnership({
    target: 'ui-visual',
    css,
    manifest: {
      presets: [{ id: 'minimal-saas', prefix: 'saas' }],
      classApi: {
        deprecatedStructuralSuffixes: [],
        universalVisualSuffixes: ['card'],
        presetExtras: { 'minimal-saas': [] }
      }
    },
    allowlist: [],
    now: reviewedAt
  });

  assert.deepEqual(
    result.violations.map(({ selector, property, rule }) => ({ selector, property, rule })),
    [
      { selector: 'html', property: 'flex', rule: 'ui-page-topology' },
      { selector: 'body', property: 'flex-flow', rule: 'ui-page-topology' },
      { selector: '#app', property: 'flex-direction', rule: 'ui-page-topology' },
      { selector: '#root', property: 'flex-wrap', rule: 'ui-page-topology' },
      { selector: '.page-shell', property: 'gap', rule: 'ui-page-topology' },
      { selector: '.page', property: 'row-gap', rule: 'ui-page-topology' },
      { selector: 'main', property: 'column-gap', rule: 'ui-page-topology' },
      { selector: '[data-layout]', property: 'align-content', rule: 'ui-page-topology' },
      { selector: '[data-page]', property: 'align-items', rule: 'ui-page-topology' },
      { selector: '[data-shell]', property: 'align-self', rule: 'ui-page-topology' },
      { selector: '[role=main]', property: 'justify-content', rule: 'ui-page-topology' },
      { selector: '.main', property: 'justify-items', rule: 'ui-page-topology' },
      { selector: 'section', property: 'justify-self', rule: 'ui-page-topology' }
    ]
  );
});

test('interaction theme rejects state mechanics but permits static theme application', () => {
  const css = `
    .interactive-surface { color: var(--interactive-surface-fg); --Theme-Paint: red; }
    .interactive-surface:hover { translate: 0 -2px; }
    input:checked { opacity: .8; }
    .is-selected { color: red; }
    [data-state="active"] { --State-Paint: red; background: red; }
    :is(a:visited, button:popover-open) { color: purple; }
    :where(button[disabled], .saas-disabled) { --State-Opacity: .5; opacity: .5; }
    :is(.surface, a:any-link) { opacity: .8; }
    :where(.surface, details[open]) { opacity: .8; }
    :not(input[checked]) { opacity: .8; }
    :is(input[required]) { opacity: .8; }
    :where(option[selected]) { opacity: .8; }
    :is(textarea[readonly], [hidden]) { opacity: .8; }
    .interactive-surface { TRANSFORM: scale(1.05); }
  `;
  const result = auditOwnership({
    target: 'interaction-theme',
    css,
    manifest: {
      presets: [{ id: 'minimal-saas', prefix: 'saas' }],
      classApi: {
        universalVisualSuffixes: ['disabled'],
        presetExtras: { 'minimal-saas': [] }
      }
    },
    allowlist: [],
    now: reviewedAt
  });

  assert.deepEqual(result.violations, [
    {
      target: 'interaction-theme',
      selector: '.interactive-surface:hover',
      property: 'translate',
      line: 3,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: 'input:checked',
      property: 'opacity',
      line: 4,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: '.is-selected',
      property: 'color',
      line: 5,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: '[data-state="active"]',
      property: 'background',
      line: 6,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':is(a:visited,button:popover-open)',
      property: 'color',
      line: 7,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':where(button[disabled],.saas-disabled)',
      property: 'opacity',
      line: 8,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':is(.surface,a:any-link)',
      property: 'opacity',
      line: 9,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':where(.surface,details[open])',
      property: 'opacity',
      line: 10,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':not(input[checked])',
      property: 'opacity',
      line: 11,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':is(input[required])',
      property: 'opacity',
      line: 12,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':where(option[selected])',
      property: 'opacity',
      line: 13,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: ':is(textarea[readonly],[hidden])',
      property: 'opacity',
      line: 14,
      rule: 'ui-interaction-mechanics'
    },
    {
      target: 'interaction-theme',
      selector: '.interactive-surface',
      property: 'transform',
      line: 15,
      rule: 'ui-interaction-mechanics'
    }
  ]);
});

test('interaction theme recognizes every reflected native state inside functional selectors', () => {
  const selectors = [
    ':is(.surface,a:any-link)',
    ':where(.surface,details[open])',
    ':not(input[checked])',
    ':is(.surface,input[required])',
    ':where(.surface,option[selected])',
    ':is(.surface,textarea[readonly])',
    ':where(.surface,[hidden])',
    ':is(.surface,[aria-busy="true"])',
    ':is(.surface,[aria-checked="true"])',
    ':is(.surface,[aria-current="true"])',
    ':is(.surface,[aria-disabled="true"])',
    ':is(.surface,[aria-expanded="true"])',
    ':is(.surface,[aria-hidden="true"])',
    ':is(.surface,[aria-invalid="true"])',
    ':is(.surface,[aria-pressed="true"])',
    ':is(.surface,[aria-selected="true"])'
  ];

  for (const selector of selectors) {
    const result = auditOwnership({
      target: 'interaction-theme',
      css: `${selector} { opacity: .8; }`,
      manifest: {},
      allowlist: [],
      now: reviewedAt
    });

    assert.equal(result.violations.length, 1, selector);
    assert.equal(result.violations[0].selector, selector);
  }
});

test('interaction theme recognizes exact and boundary-delimited state class vocabulary', () => {
  const commonStates = [
    'active',
    'any-link',
    'busy',
    'busy-loading',
    'checked',
    'current',
    'disabled',
    'enabled',
    'expanded',
    'focus',
    'focus-visible',
    'focus-within',
    'hidden',
    'hover',
    'indeterminate',
    'invalid',
    'loading',
    'open',
    'optional',
    'persistent',
    'placeholder-shown',
    'popover-open',
    'pressed',
    'read-only',
    'read-write',
    'readonly',
    'required',
    'selected',
    'target',
    'user-invalid',
    'valid',
    'visited'
  ];

  for (const state of commonStates) {
    for (const selector of [`.${state}`, `.navigation-${state}`, `.navigation_${state}`]) {
      const result = auditOwnership({
        target: 'interaction-theme',
        css: `${selector} { --State-Opacity: .8; opacity: .8; }`,
        manifest: {},
        allowlist: [],
        now: reviewedAt
      });

      assert.equal(result.violations.length, 1, selector);
      assert.equal(result.violations[0].property, 'opacity', selector);
    }
  }

  for (const selector of ['.custom-state', '.navigation-custom-state', '.navigation_custom-state']) {
    const result = auditOwnership({
      target: 'interaction-theme',
      css: `${selector} { opacity: .8; }`,
      manifest: { selectors: { stateClasses: ['.custom-state'] } },
      allowlist: [],
      now: reviewedAt
    });
    assert.equal(result.violations.length, 1, selector);
  }

  const controls = auditOwnership({
    target: 'interaction-theme',
    css: '.card-static { opacity: .8; } .proactive { opacity: .8; } .undisabled { opacity: .8; } .selectedness { opacity: .8; }',
    manifest: {},
    allowlist: [],
    now: reviewedAt
  });
  assert.deepEqual(controls.violations, []);
});

test('allowlist rejects every malformed, stale, broad, duplicate, and unmatched mutation', () => {
  const missingReason = exception();
  delete missingReason.reason;
  const cases = [
    {
      name: 'stale',
      entries: [exception({ reviewDate: '2025-01-01' })],
      message: /stale reviewDate/
    },
    {
      name: 'future',
      entries: [exception({ reviewDate: '2026-08-09' })],
      message: /stale reviewDate/
    },
    {
      name: 'invalid date',
      entries: [exception({ reviewDate: '2026-02-30' })],
      message: /ISO date/
    },
    {
      name: 'duplicate',
      entries: [exception(), exception()],
      message: /duplicate selector and property/
    },
    {
      name: 'wildcard',
      entries: [exception({ selector: '.bento-*' })],
      message: /must not contain wildcards/
    },
    {
      name: 'property wildcard',
      entries: [exception({ property: 'grid-*' })],
      message: /must not contain wildcards/
    },
    {
      name: 'unexplained',
      entries: [exception({ reason: 'Needed.' })],
      message: /professional reason/
    },
    {
      name: 'wrong owner',
      entries: [exception({ owner: 'layout-style-css' })],
      message: /owner must be ui-style-kit-css/
    },
    {
      name: 'missing field',
      entries: [missingReason],
      message: /contain exactly/
    },
    {
      name: 'extra field',
      entries: [exception({ ticket: 'UI-42' })],
      message: /contain exactly/
    },
    {
      name: 'non-string field',
      entries: [exception({ reason: null })],
      message: /string fields/
    }
  ];

  for (const fixture of cases) {
    assert.throws(
      () => validateAllowlist({
        target: 'ui-visual',
        entries: fixture.entries,
        expectedOwner: 'ui-style-kit-css',
        now: reviewedAt
      }),
      fixture.message,
      fixture.name
    );
  }

  assert.throws(
    () => auditOwnership({
      target: 'ui-visual',
      css: '.bento-grid-feature { color: red; }',
      manifest: { classApi: { deprecatedStructuralSuffixes: [] } },
      allowlist: [exception()],
      now: reviewedAt
    }),
    /does not match a forbidden declaration/
  );
});

test('reviewed built UI targets satisfy their ownership contracts', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
  const allowlist = JSON.parse(
    fs.readFileSync(new URL('../ownership-allowlist.json', import.meta.url), 'utf8')
  );
  const targets = [
    ['ui-visual', '../dist/ui-style-kit.visual.css'],
    ['interaction-theme', '../styles/interactive-surface-theme.css']
  ];

  for (const [target, file] of targets) {
    const result = auditOwnership({
      target,
      css: fs.readFileSync(new URL(file, import.meta.url), 'utf8'),
      manifest,
      allowlist: allowlist[target],
      now: reviewedAt
    });

    assert.deepEqual(result.violations, [], target);
  }
});
