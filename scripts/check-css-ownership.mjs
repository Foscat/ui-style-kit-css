import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate, parse, property as describeProperty, walk } from 'css-tree';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlistFields = ['owner', 'property', 'reason', 'reviewDate', 'selector'];
const gridTopologyProperties = new Set([
  'grid',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'order'
]);
const pagePlacementProperties = new Set([
  'block-size',
  'bottom',
  'clear',
  'display',
  'float',
  'height',
  'inline-size',
  'inset',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'left',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'place-self',
  'position',
  'right',
  'top',
  'width'
]);
const nativeStatePseudos = new Set([
  'active',
  'any-link',
  'checked',
  'disabled',
  'enabled',
  'focus',
  'focus-visible',
  'focus-within',
  'hover',
  'indeterminate',
  'invalid',
  'open',
  'optional',
  'placeholder-shown',
  'popover-open',
  'read-only',
  'read-write',
  'required',
  'target',
  'user-invalid',
  'valid',
  'visited'
]);
const commonStateClasses = new Set([
  'is-active',
  'is-busy',
  'is-checked',
  'is-disabled',
  'is-loading',
  'is-open',
  'is-pressed',
  'is-selected'
]);
// Reflected native attributes are state selectors even when no pseudo-class is used.
const stateAttributes = new Set([
  'checked',
  'disabled',
  'hidden',
  'open',
  'readonly',
  'required',
  'selected',
  'aria-busy',
  'aria-checked',
  'aria-current',
  'aria-disabled',
  'aria-expanded',
  'aria-invalid',
  'aria-pressed',
  'aria-selected',
  'data-active',
  'data-checked',
  'data-disabled',
  'data-loading',
  'data-pressed',
  'data-selected',
  'data-state'
]);

function propertyContract(propertyName) {
  const described = describeProperty(propertyName);
  return {
    custom: described.custom,
    name: described.custom ? propertyName : described.basename
  };
}

function entryKey({ selector, property }) {
  return `${selector}\u0000${property}`;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

export function validateAllowlist({ target, entries, expectedOwner, now = new Date() }) {
  if (!Array.isArray(entries)) throw new Error(`${target} allowlist must be an array.`);

  // Strict metadata prevents an exception from becoming an undocumented ownership bypass.
  const seen = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${target} allowlist entries must be objects.`);
    }

    const fields = Object.keys(entry).sort();
    if (fields.join('\u0000') !== allowlistFields.join('\u0000')) {
      throw new Error(`${target} allowlist entries must contain exactly ${allowlistFields.join(', ')}.`);
    }
    if (allowlistFields.some((field) => typeof entry[field] !== 'string')) {
      throw new Error(`${target} allowlist entries must use string fields.`);
    }
    if (entry.selector.includes('*') || entry.property.includes('*')) {
      throw new Error(`${target} allowlist entries must not contain wildcards.`);
    }
    if (!entry.selector.trim() || !entry.property.trim()) {
      throw new Error(`${target} allowlist selector and property must be exact non-empty values.`);
    }
    if (entry.owner !== expectedOwner) {
      throw new Error(`${target} allowlist owner must be ${expectedOwner}.`);
    }
    if (entry.reason.trim().length < 24) {
      throw new Error(`${target} allowlist entries require a professional reason.`);
    }
    if (!isIsoDate(entry.reviewDate)) {
      throw new Error(`${target} allowlist reviewDate must be an ISO date.`);
    }

    const reviewTime = new Date(`${entry.reviewDate}T00:00:00Z`).valueOf();
    const ageDays = (now.valueOf() - reviewTime) / 86_400_000;
    if (ageDays < 0 || ageDays > 366) {
      throw new Error(`${target} allowlist entry has a stale reviewDate: ${entry.reviewDate}.`);
    }

    const key = entryKey(entry);
    if (seen.has(key)) {
      throw new Error(`${target} allowlist has a duplicate selector and property: ${entry.selector} ${entry.property}.`);
    }
    seen.add(key);
  }
}

function manifestComponentClasses(manifest) {
  const componentClasses = new Set();
  const universalSuffixes = manifest.classApi?.universalVisualSuffixes ?? [];

  for (const preset of manifest.presets ?? []) {
    for (const suffix of universalSuffixes) {
      componentClasses.add(`${preset.prefix}-${suffix}`);
    }
    for (const suffix of manifest.classApi?.presetExtras?.[preset.id] ?? []) {
      componentClasses.add(`${preset.prefix}-${suffix}`);
    }
  }

  return componentClasses;
}

function rightmostCompound(selector) {
  const nodes = [...selector.children];
  let subjectStart = 0;
  nodes.forEach((node, index) => {
    if (node.type === 'Combinator') subjectStart = index + 1;
  });
  return nodes.slice(subjectStart);
}

function selectorListHasPageSubject(selectorList, context) {
  for (const selector of selectorList.children) {
    if (rightmostCompound(selector).some((node) => subjectNodeOwnsPageTopology(node, context))) {
      return true;
    }
  }
  return false;
}

function subjectNodeOwnsPageTopology(node, context) {
  if (node.type === 'TypeSelector') {
    return ['body', 'html', 'main', 'section'].includes(node.name.toLowerCase());
  }
  if (node.type === 'IdSelector') {
    return ['app', 'layout', 'main', 'page', 'root', 'shell'].includes(node.name.toLowerCase());
  }
  if (node.type === 'AttributeSelector') {
    const attributeName = node.name.name.toLowerCase();
    const attributeValue = node.value?.name?.toLowerCase() ?? node.value?.value?.toLowerCase();
    return ['data-layout', 'data-page', 'data-shell'].includes(attributeName) ||
      (attributeName === 'role' && attributeValue === 'main');
  }
  if (node.type === 'ClassSelector') {
    if (context.componentClasses.has(node.name)) return false;
    return node.name.split(/[-_]/).some((segment) => context.structuralNames.has(segment));
  }
  if (node.type === 'PseudoClassSelector' && ['is', 'where'].includes(node.name.toLowerCase())) {
    for (const child of node.children ?? []) {
      if (child.type === 'SelectorList' && selectorListHasPageSubject(child, context)) return true;
    }
  }
  return false;
}

function selectorOwnsPageTopology(rule, manifest) {
  // Manifest-owned legacy suffixes remain the authoritative structural vocabulary.
  const structuralNames = new Set([
    ...(manifest.classApi?.deprecatedStructuralSuffixes ?? []),
    'container',
    'content',
    'grid',
    'layout',
    'main',
    'page',
    'section',
    'shell',
    'split',
    'stack',
    'wrapper'
  ]);
  return selectorListHasPageSubject(rule.prelude, {
    componentClasses: manifestComponentClasses(manifest),
    structuralNames
  });
}

function manifestStateClasses(manifest) {
  const stateSuffixes = new Set([...commonStateClasses].map((name) => name.replace(/^is-/, '')));
  const manifestClasses = new Set([
    ...(manifest.selectors?.stateClasses ?? []),
    ...(manifest.classApi?.stateClasses ?? [])
  ].map((selector) => selector.replace(/^\./, '').toLowerCase()));

  for (const preset of manifest.presets ?? []) {
    const suffixes = [
      ...(manifest.classApi?.universalVisualSuffixes ?? []),
      ...(manifest.classApi?.presetExtras?.[preset.id] ?? [])
    ];
    for (const suffix of suffixes) {
      if (stateSuffixes.has(suffix) ||
          [...stateSuffixes].some((state) => suffix.endsWith(`-${state}`))) {
        manifestClasses.add(`${preset.prefix}-${suffix}`.toLowerCase());
      }
    }
  }

  return manifestClasses;
}

function selectorHasState(rule, manifest) {
  const stateClasses = new Set([
    ...commonStateClasses,
    ...manifestStateClasses(manifest)
  ]);
  let stateful = false;

  // Walking the selector AST also inspects states nested inside :is(), :where(), and :not().
  walk(rule.prelude, {
    enter(node) {
      if (node.type === 'PseudoClassSelector' && nativeStatePseudos.has(node.name.toLowerCase())) {
        stateful = true;
      }
      if (node.type === 'ClassSelector' && stateClasses.has(node.name.toLowerCase())) {
        stateful = true;
      }
      if (node.type === 'AttributeSelector' && stateAttributes.has(node.name.name.toLowerCase())) {
        stateful = true;
      }
    }
  });

  return stateful;
}

function isMechanicsProperty(property) {
  return ['rotate', 'scale', 'transform', 'translate'].includes(property) ||
    /^(?:animation|transition)(?:-|$)/.test(property);
}

function ruleForDeclaration({ target, property, rule, manifest }) {
  if (target === 'ui-visual') {
    if (gridTopologyProperties.has(property)) return 'ui-page-topology';
    if (pagePlacementProperties.has(property) && selectorOwnsPageTopology(rule, manifest)) {
      return 'ui-page-topology';
    }
    return null;
  }

  if (target === 'interaction-theme') {
    if (isMechanicsProperty(property) || selectorHasState(rule, manifest)) {
      return 'ui-interaction-mechanics';
    }
    return null;
  }

  throw new Error(`Unknown ownership target: ${target}.`);
}

export function auditOwnership({ target, css, manifest, allowlist, now = new Date() }) {
  validateAllowlist({
    target,
    entries: allowlist,
    expectedOwner: 'ui-style-kit-css',
    now
  });

  const ast = parse(css, { filename: target, positions: true });
  const allowlistByKey = new Map(allowlist.map((entry) => [entryKey(entry), entry]));
  const matchedKeys = new Set();
  const violations = [];
  let declarationCount = 0;

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const selector = generate(rule.prelude);
      rule.block.children.forEach((node) => {
        if (node.type !== 'Declaration') return;
        declarationCount += 1;

        const property = propertyContract(node.property);
        if (property.custom) return;

        const violationRule = ruleForDeclaration({
          target,
          property: property.name,
          rule,
          manifest
        });
        if (!violationRule) return;

        const key = entryKey({ selector, property: property.name });
        if (allowlistByKey.has(key)) {
          matchedKeys.add(key);
          return;
        }

        violations.push({
          target,
          selector,
          property: property.name,
          line: node.loc.start.line,
          rule: violationRule
        });
      });
    }
  });

  for (const entry of allowlist) {
    if (!matchedKeys.has(entryKey(entry))) {
      throw new Error(
        `${target} allowlist entry does not match a forbidden declaration: ${entry.selector} ${entry.property}.`
      );
    }
  }

  return {
    declarationCount,
    matchedAllowlistCount: matchedKeys.size,
    violations
  };
}

function run() {
  const startedAt = performance.now();
  const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'manifest.json'), 'utf8'));
  const allowlist = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'ownership-allowlist.json'), 'utf8')
  );
  const targets = [
    ['ui-visual', 'dist/ui-style-kit.visual.css'],
    ['interaction-theme', 'styles/interactive-surface-theme.css']
  ];
  let declarations = 0;
  let exceptions = 0;

  for (const [target, file] of targets) {
    const result = auditOwnership({
      target,
      css: fs.readFileSync(path.join(packageRoot, file), 'utf8'),
      manifest,
      allowlist: allowlist[target]
    });
    declarations += result.declarationCount;
    exceptions += result.matchedAllowlistCount;

    if (result.violations.length > 0) {
      const details = result.violations
        .map(({ selector, property, line, rule }) => `${file}:${line} ${selector} ${property} (${rule})`)
        .join('\n');
      throw new Error(`CSS ownership violations:\n${details}`);
    }
  }

  const duration = Math.round(performance.now() - startedAt);
  console.log(
    `CSS ownership passed for ${declarations} declarations with ${exceptions} reviewed exceptions in ${duration}ms.`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    run();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
