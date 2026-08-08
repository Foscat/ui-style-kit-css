import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate, parse, walk } from 'css-tree';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlistFields = ['owner', 'property', 'reason', 'reviewDate', 'selector'];
const gridTopologyProperties = new Set([
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
const majorSizingProperties = new Set([
  'inline-size',
  'max-inline-size',
  'max-width',
  'min-inline-size',
  'min-width',
  'width'
]);
const mechanicsProperties = new Set([
  'animation',
  'animation-name',
  'rotate',
  'scale',
  'transform',
  'transition',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate'
]);
const stateSelectorPattern = /:(?:active|disabled|focus|focus-visible|hover)|\[aria-(?:busy|current|disabled|pressed|selected)|\.is-(?:active|disabled|loading)/;

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

function selectorOwnsPageTopology(rule, manifest) {
  // Manifest-owned legacy suffixes remain the authoritative structural vocabulary.
  const structuralNames = new Set([
    ...(manifest.classApi?.deprecatedStructuralSuffixes ?? []),
    'container',
    'layout',
    'main',
    'shell',
    'wrapper'
  ]);
  let ownsPageTopology = false;

  walk(rule.prelude, {
    enter(node) {
      if (node.type === 'TypeSelector' && ['body', 'main'].includes(node.name)) {
        ownsPageTopology = true;
      }
      if (node.type !== 'ClassSelector') return;

      const classSegments = node.name.split(/[-_]/);
      if (classSegments.some((segment) => structuralNames.has(segment))) {
        ownsPageTopology = true;
      }
    }
  });

  return ownsPageTopology;
}

function ruleForDeclaration({ target, selector, property, rule, manifest }) {
  if (target === 'ui-visual') {
    if (gridTopologyProperties.has(property)) return 'ui-page-topology';
    if (majorSizingProperties.has(property) && selectorOwnsPageTopology(rule, manifest)) {
      return 'ui-page-topology';
    }
    return null;
  }

  if (target === 'interaction-theme') {
    if (property.startsWith('--')) return null;
    if (mechanicsProperties.has(property) || stateSelectorPattern.test(selector)) {
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

        const violationRule = ruleForDeclaration({
          target,
          selector,
          property: node.property,
          rule,
          manifest
        });
        if (!violationRule) return;

        const key = entryKey({ selector, property: node.property });
        if (allowlistByKey.has(key)) {
          matchedKeys.add(key);
          return;
        }

        violations.push({
          target,
          selector,
          property: node.property,
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
