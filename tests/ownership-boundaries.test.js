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
    .bento-grid-feature { grid-template-columns: repeat(6, 1fr); }
  `;
  const result = auditOwnership({
    target: 'ui-visual',
    css,
    manifest: { classApi: { deprecatedStructuralSuffixes: ['page'] } },
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
    }
  ]);
  assert.equal(result.matchedAllowlistCount, 1);
});

test('visual-only rejects unreviewed grid topology and placement', () => {
  const result = auditOwnership({
    target: 'ui-visual',
    css: '.bento-tile { grid-area: span 2 / span 4; grid-column: span 2; }',
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
    }
  ]);
});

test('interaction theme rejects state mechanics but permits static theme application', () => {
  const css = `
    .interactive-surface { color: var(--interactive-surface-fg); }
    .interactive-surface:hover { translate: 0 -2px; }
  `;
  const result = auditOwnership({
    target: 'interaction-theme',
    css,
    manifest: {},
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
    }
  ]);
});

test('allowlist rejects stale, duplicate, wildcard, unexplained, and unmatched entries', () => {
  const cases = [
    {
      name: 'stale',
      entries: [exception({ reviewDate: '2025-01-01' })],
      message: /stale reviewDate/
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
      name: 'unexplained',
      entries: [exception({ reason: 'Needed.' })],
      message: /professional reason/
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
