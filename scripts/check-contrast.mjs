import fs from 'node:fs';
import path from 'node:path';
import { generate, parse, walk } from 'css-tree';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const { modes, presets, themes } = manifest;
const minimumNonTextContrast = 3;
const minimumTextContrast = 4.5;

const textRoleChecks = [
  ['usk-text-rgb', 'usk-bg-rgb', 'text on background'],
  ['usk-text-rgb', 'usk-surface-rgb', 'text on surface'],
  ['usk-text-rgb', 'usk-surface-strong-rgb', 'text on strong surface'],
  ['usk-text-rgb', 'usk-surface-soft-rgb', 'text on soft surface'],
  ['usk-text-muted-rgb', 'usk-bg-rgb', 'muted text on background'],
  ['usk-text-muted-rgb', 'usk-surface-rgb', 'muted text on surface'],
  ['usk-text-muted-rgb', 'usk-surface-strong-rgb', 'muted text on strong surface'],
  ['usk-text-muted-rgb', 'usk-surface-soft-rgb', 'muted text on soft surface'],
  ['usk-link-rgb', 'usk-bg-rgb', 'link on background'],
  ['usk-link-rgb', 'usk-surface-rgb', 'link on surface'],
  ['usk-link-rgb', 'usk-surface-strong-rgb', 'link on strong surface'],
  ['usk-link-rgb', 'usk-surface-soft-rgb', 'link on soft surface'],
  ['usk-primary-text-rgb', 'usk-primary-rgb', 'primary text on primary'],
  ['usk-primary-text-rgb', 'usk-primary-hover-rgb', 'primary text on primary hover'],
  ['usk-secondary-text-rgb', 'usk-secondary-rgb', 'secondary text on secondary'],
  ['usk-secondary-text-rgb', 'usk-secondary-hover-rgb', 'secondary text on secondary hover'],
  ['usk-accent-text-rgb', 'usk-accent-rgb', 'accent text on accent'],
  ['usk-success-text-rgb', 'usk-success-rgb', 'success text on success'],
  ['usk-warning-text-rgb', 'usk-warning-rgb', 'warning text on warning'],
  ['usk-danger-text-rgb', 'usk-danger-rgb', 'danger text on danger']
];

/**
 * Convert an RGB triplet into relative luminance.
 *
 * @param {number[]} rgb - Red, green, and blue channels from zero to 255.
 * @returns {number} Relative luminance from zero to one.
 */
function rgbToLum([r, g, b]) {
  const vals = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
}

/**
 * Calculate the WCAG contrast ratio between two opaque RGB colors.
 *
 * @param {number[]} a - First RGB triplet.
 * @param {number[]} b - Second RGB triplet.
 * @returns {number} Contrast ratio from one to 21.
 */
function contrast(a, b) {
  const l1 = rgbToLum(a);
  const l2 = rgbToLum(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Parse a space-separated CSS RGB token value.
 *
 * @param {string} value - CSS custom property value.
 * @returns {number[]} Red, green, and blue channels.
 */
function parseRgb(value) {
  return value.trim().split(/\s+/).slice(0, 3).map(Number);
}

/**
 * Blend an RGB color toward a second RGB color using an sRGB percentage.
 *
 * @param {number[]} base - Base RGB channels.
 * @param {number[]} overlay - Overlay RGB channels.
 * @param {number} overlayRatio - Overlay weight from zero to one.
 * @returns {number[]} Blended RGB channels.
 */
function mixRgb(base, overlay, overlayRatio) {
  return base.map((channel, index) => Math.round(
    channel * (1 - overlayRatio) + overlay[index] * overlayRatio
  ));
}

/**
 * Return the declarations for one scheme and display mode.
 *
 * @param {string} css - Shared theme stylesheet text.
 * @param {string} theme - Color-scheme identifier.
 * @param {string} mode - Display-mode identifier.
 * @returns {string} Matching declaration block or an empty string.
 */
function blockFor(css, theme, mode) {
  const re = new RegExp(`:where\\(\\[data-ui\\]\\[data-theme="${theme}"\\]\\[data-mode="${mode}"\\]\\)\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const match = css.match(re);
  return match ? match[1] : '';
}

/**
 * Return the shared declarations for a display mode.
 *
 * @param {string} css - Shared theme stylesheet text.
 * @param {string} mode - Display mode name.
 * @returns {string} Matching declaration block or an empty string.
 */
function sharedModeBlock(css, mode) {
  const rulePattern = /:where\(([^{}]+)\)\s*\{([\s\S]*?)\}/g;
  let match;

  while ((match = rulePattern.exec(css))) {
    if (match[1].includes(`[data-mode="${mode}"]`)) return match[2];
  }

  return '';
}

function varsFromBlock(block) {
  const vars = {};
  const re = /--([\w-]+):\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) vars[m[1]] = m[2];
  return vars;
}

/**
 * Check one foreground/background role pair and append any failure.
 *
 * @param {Record<string, string>} vars - Theme variables for one state.
 * @param {string} fgKey - Foreground RGB token name without leading dashes.
 * @param {string} bgKey - Background RGB token name without leading dashes.
 * @param {string} label - Human-readable role description.
 * @param {string} state - Preset, scheme, and mode identifier.
 * @param {string[]} failures - Mutable failure collection.
 * @returns {void}
 */
function checkTextRole(vars, fgKey, bgKey, label, state, failures) {
  if (!vars[fgKey]) failures.push(`${state}: missing ${fgKey}`);
  if (!vars[bgKey]) failures.push(`${state}: missing ${bgKey}`);
  if (!vars[fgKey] || !vars[bgKey]) return;

  const ratio = contrast(parseRgb(vars[fgKey]), parseRgb(vars[bgKey]));
  if (ratio < minimumTextContrast) {
    failures.push(`${state}: ${label} ${ratio.toFixed(2)} < ${minimumTextContrast}`);
  }
}

/**
 * Verify that every preset maps shared semantic colors into its public and native aliases.
 *
 * @param {{id: string, prefix: string}} preset - Manifest preset record.
 * @param {string[]} failures - Mutable failure collection.
 * @returns {void}
 */
function checkPresetAliases(preset, failures) {
  const { id, prefix } = preset;
  const css = fs.readFileSync(path.join(root, 'styles', `${id}.css`), 'utf8');
  const sharedRoles = [
    'bg', 'surface', 'surface-strong', 'surface-soft', 'text', 'text-muted', 'border',
    'primary', 'primary-hover', 'primary-text', 'secondary', 'secondary-hover',
    'secondary-text', 'accent', 'accent-text', 'success', 'success-text', 'warning',
    'warning-text', 'danger', 'danger-text', 'link', 'focus'
  ];
  const nativeRoles = [
    ['surface', 'surface'],
    ['surface-strong', 'surface-strong'],
    ['surface-soft', 'surface-soft'],
    ['text', 'text'],
    ['text-muted', 'text-muted'],
    ['border', 'border'],
    ['primary', 'primary'],
    ['primary-hover', 'primary-hover'],
    ['on-primary', 'on-primary'],
    ['focus', 'focus'],
    ['success', 'success'],
    ['warning', 'warning'],
    ['danger', 'danger'],
    ['link', 'link']
  ];

  for (const role of sharedRoles) {
    const declaration = `--${prefix}-${role}-rgb: var(--usk-${role}-rgb);`;
    if (!css.includes(declaration)) failures.push(`${id}: missing semantic alias ${declaration}`);
  }

  for (const [nativeRole, presetRole] of nativeRoles) {
    const declaration = `--usk-native-${nativeRole}: var(--${prefix}-${presetRole});`;
    if (!css.includes(declaration)) failures.push(`${id}: missing native alias ${declaration}`);
  }
}

/**
 * Verify that preset text utilities cannot override media-scrim foreground paint.
 *
 * @param {{id: string, prefix: string}} preset - Manifest preset record.
 * @param {string[]} failures - Mutable failure collection.
 * @returns {void}
 */
function checkPresetScrim(preset, failures) {
  const { id, prefix } = preset;
  const css = fs.readFileSync(path.join(root, 'styles', `${id}.css`), 'utf8');
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const descendantRule = new RegExp(
    `\\.${escapedPrefix}-media-scrim\\s*>\\s*:where\\(figcaption,\\s*\\[data-media-caption\\]\\)\\s*\\*\\s*\\{[^}]*color:\\s*inherit;`,
    'm'
  );

  if (!descendantRule.test(css)) {
    failures.push(`${id}: media-scrim descendants must inherit the scrim foreground`);
  }
}

/**
 * Verify that editable-field paint cannot leak onto native button inputs.
 *
 * @param {string} nativeCss - Shared native stylesheet text.
 * @param {string[]} failures - Mutable failure collection.
 * @returns {void}
 */
function checkNativeControlOwnership(nativeCss, failures) {
  const fieldRule = nativeCss.match(/\[data-ui\]\[data-theme\]\[data-mode\]\s+:where\((input:not\([\s\S]*?),\s*textarea,\s*select\)\s*\{/m)?.[1] ?? '';
  const buttonTypes = ['button', 'submit', 'reset'];

  if (!fieldRule) {
    failures.push('native controls: editable-field selector is missing');
    return;
  }

  for (const type of buttonTypes) {
    if (!fieldRule.includes(`:not([type="${type}"])`)) {
      failures.push(`native controls: editable-field paint leaks onto input[type="${type}"]`);
    }
  }
}

/**
 * Collect effective declarations from every rule accepted by a selector predicate.
 *
 * @param {string} css - Complete stylesheet text.
 * @param {(selector: string) => boolean} matchesSelector - Selector predicate.
 * @returns {Map<string, string>} Effective declaration values in source order.
 */
function effectiveDeclarations(css, matchesSelector) {
  const declarations = new Map();
  const ast = parse(css);

  walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const selector = generate(rule.prelude);
      if (!matchesSelector(selector)) return;

      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration') declarations.set(node.property, generate(node.value));
      });
    }
  });

  return declarations;
}

/**
 * Validate that an Interactive Surface bridge keeps semantic foreground and
 * background paint paired through every public variant and depth level.
 *
 * @param {string} css - Complete bridge stylesheet text.
 * @param {string} label - Human-readable bridge identifier.
 * @returns {string[]} Contract failures, or an empty array when complete.
 */
export function validateBridgePaint(css, label) {
  const bridgeFailures = [];
  const base = effectiveDeclarations(css, (selector) => (
    selector.endsWith('.interactive-surface')
    && !selector.includes('[data-surface-')
  ));

  if (!base.get('background-color')?.includes('--interactive-surface-level-bg')) {
    bridgeFailures.push(`${label}: base background must consume the selected surface level`);
  }
  if (base.get('color') !== 'var(--interactive-surface-fg)') {
    bridgeFailures.push(`${label}: base foreground must consume --interactive-surface-fg`);
  }

  for (const variant of ['primary', 'secondary', 'accent', 'subtle', 'warning', 'danger']) {
    const declarations = effectiveDeclarations(
      css,
      (selector) => selector.includes(`.interactive-surface[data-surface-variant="${variant}"]`)
    );

    if (!declarations.has('--interactive-surface-bg')) {
      bridgeFailures.push(`${label}: ${variant} background is missing`);
    }
    if (!declarations.has('--interactive-surface-fg')) {
      bridgeFailures.push(`${label}: ${variant} foreground is missing`);
    }
  }

  for (const level of ['1', '2', '3']) {
    const declarations = effectiveDeclarations(
      css,
      (selector) => selector.includes(`.interactive-surface[data-surface-level="${level}"]`)
    );

    if (!declarations.has('--interactive-surface-level-bg')) {
      bridgeFailures.push(`${label}: level ${level} background selection is missing`);
    }
  }

  return bridgeFailures;
}

const failures = [];
const css = fs.readFileSync(path.join(root, 'styles', 'theme-colors.css'), 'utf8');
const nativeCss = fs.readFileSync(path.join(root, 'styles', 'native-elements.css'), 'utf8');
const sharedModeVars = Object.fromEntries(modes.map((mode) => [mode, varsFromBlock(sharedModeBlock(css, mode))]));
let checkedStates = 0;

checkNativeControlOwnership(nativeCss, failures);

for (const bridgeFile of ['interactive-surface-theme.css', 'interactive-surface-bridge.css']) {
  const bridgeCss = fs.readFileSync(path.join(root, 'styles', bridgeFile), 'utf8');
  failures.push(...validateBridgePaint(bridgeCss, `styles/${bridgeFile}`));
}

for (const preset of presets) {
  checkPresetAliases(preset, failures);
  checkPresetScrim(preset, failures);

  for (const theme of themes) {
    for (const mode of modes) {
      checkedStates += 1;
      const state = `${preset.id}/${theme}/${mode}`;
      const vars = varsFromBlock(blockFor(css, theme, mode));

      for (const [fgKey, bgKey, label] of textRoleChecks) {
        checkTextRole(vars, fgKey, bgKey, label, state, failures);
      }

      const borderTextMix = Number.parseFloat(sharedModeVars[mode]['usk-border-text-mix']);
      const borderMinimumAlpha = Number.parseFloat(sharedModeVars[mode]['usk-border-min-alpha']);

      if (!Number.isFinite(borderTextMix)) failures.push(`${state}: missing --usk-border-text-mix percentage`);
      if (!Number.isFinite(borderMinimumAlpha)) failures.push(`${state}: missing --usk-border-min-alpha`);

      if (mode === 'light' && Number.isFinite(borderMinimumAlpha) && borderMinimumAlpha < 1) {
        failures.push(`${state}: --usk-border-min-alpha must keep light component edges opaque`);
      }

      if (mode === 'light' && Number.isFinite(borderTextMix)) {
        const controlEdge = mixRgb(
          parseRgb(vars['usk-border-rgb']),
          parseRgb(vars['usk-text-rgb']),
          borderTextMix / 100
        );

        for (const backgroundKey of ['usk-bg-rgb', 'usk-surface-rgb', 'usk-surface-strong-rgb', 'usk-surface-soft-rgb']) {
          const ratio = contrast(controlEdge, parseRgb(vars[backgroundKey]));
          if (ratio < minimumNonTextContrast) {
            failures.push(`${state}: control edge on ${backgroundKey} ${ratio.toFixed(2)} < ${minimumNonTextContrast}`);
          }
        }
      }
    }
  }
}

const expectedStates = presets.length * themes.length * modes.length;
if (checkedStates !== expectedStates) {
  failures.push(`contrast matrix visited ${checkedStates} states instead of ${expectedStates}`);
}

if (failures.length) {
  console.error('Contrast check failed:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`Contrast check passed for ${checkedStates} preset/theme/mode states.`);
