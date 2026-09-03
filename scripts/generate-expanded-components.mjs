import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const startMarker = '/* BEGIN GENERATED 2.2 PRESET COMPONENT FOUNDATIONS */';
const endMarker = '/* END GENERATED 2.2 PRESET COMPONENT FOUNDATIONS */';
const originalPrefixes = new Set([
  'saas', 'bento', 'max', 'bau', 'tactile', 'neo', 'retro', 'brutal', 'cyber', 'y2k', 'rg'
]);
const tooltipDirections = Object.freeze({
  top: 'inset-block-end: calc(100% + .5rem); inset-inline-start: 50%; transform: translateX(-50%);',
  right: 'inset-inline-start: calc(100% + .5rem); inset-block-start: 50%; transform: translateY(-50%);',
  bottom: 'inset-block-start: calc(100% + .5rem); inset-inline-start: 50%; transform: translateX(-50%);',
  left: 'inset-inline-end: calc(100% + .5rem); inset-block-start: 50%; transform: translateY(-50%);'
});

/**
 * Formats selectors as a stable comma-separated list.
 *
 * @param {string[]} selectors CSS selectors in manifest order.
 * @param {number} [indent=2] Leading spaces used for each selector.
 * @returns {string} Formatted selector list.
 */
function selectorList(selectors, indent = 2) {
  const padding = ' '.repeat(indent);
  return selectors.map((selector) => `${padding}${selector}`).join(',\n');
}

/**
 * Expands every preset prefix across one or more public class suffixes.
 *
 * @param {{prefix: string}[]} presets Manifest preset entries.
 * @param {string[]} suffixes Public class suffixes.
 * @param {(className: string) => string} [decorate] Optional selector decorator.
 * @returns {string[]} Expanded class selectors.
 */
function classes(presets, suffixes, decorate = (className) => `.${className}`) {
  return presets.flatMap(({ prefix }) =>
    suffixes.map((suffix) => decorate(`${prefix}-${suffix}`))
  );
}

/**
 * Renders shared component utilities for presets added after the original 2.x set.
 *
 * The original rules remain untouched for compatibility. This generated extension
 * ensures every later manifest preset receives the same universal component API.
 *
 * @param {{presets: {prefix: string}[]}} manifest Public UI Style Kit manifest.
 * @returns {string} Generated CSS section, including synchronization markers.
 */
export function renderExpandedComponents(manifest) {
  if (!Array.isArray(manifest?.presets) || manifest.presets.length === 0) {
    throw new TypeError('manifest.presets must contain at least one preset.');
  }

  const presets = manifest.presets.filter(({ prefix }) => !originalPrefixes.has(prefix));
  if (presets.length === 0) return `${startMarker}\n${endMarker}`;

  const buttons = classes(presets, ['button', 'icon-button', 'button-pill']);
  const buttonPills = classes(presets, ['button-pill']);
  const containmentWrappers = classes(presets, [
    'surface', 'surface-sm', 'surface-lg', 'card', 'card-service', 'card-feature',
    'panel', 'toolbar', 'well', 'inset', 'field', 'alert', 'table-wrap', 'nav',
    'feature-strip', 'feature-item', 'callout-bar', 'media-scrim'
  ]);
  const containmentControls = classes(presets, [
    'button', 'icon-button', 'button-cut', 'button-outline-heavy', 'badge',
    'badge-seal', 'nav-link', 'icon-medallion'
  ]);
  const tooltipSurfaces = classes(
    presets,
    ['tooltip', 'tooltip-top', 'tooltip-right', 'tooltip-bottom', 'tooltip-left']
  );
  const anchoredTooltips = classes(
    presets,
    ['tooltip-top', 'tooltip-right', 'tooltip-bottom', 'tooltip-left'],
    (className) => `[data-ui-tooltip-anchor] > .${className}`
  );
  const pressedPills = classes(
    presets,
    ['button-pill'],
    (className) => `.${className}:active,\n  .${className}[aria-pressed="true"]`
  );
  const disabledPills = classes(
    presets,
    ['button-pill'],
    (className) => `.${className}:disabled,\n  .${className}[aria-disabled="true"]`
  );
  const checkedTracks = presets.map(
    ({ prefix }) => `.${prefix}-switch:has(input:checked) .${prefix}-switch-track`
  );

  const perPreset = presets.map(({ prefix }) => `
.${prefix}-button-pill { color: var(--${prefix}-on-primary); background: var(--${prefix}-primary); border-color: var(--${prefix}-primary); border-radius: var(--${prefix}-radius-pill); }
.${prefix}-button-pill:hover { border-color: var(--${prefix}-primary-hover); filter: brightness(1.04); }
.${prefix}-button-pill:focus-visible { outline: 3px solid var(--${prefix}-focus); outline-offset: 3px; box-shadow: var(--${prefix}-focus-ring); }
.${prefix}-pill { border-radius: var(--${prefix}-radius-pill); }
.${prefix}-rounded { border-radius: var(--${prefix}-radius-md); }
.${prefix}-rounded-lg { border-radius: var(--${prefix}-radius-lg); }
.${prefix}-rounded-xl { border-radius: var(--${prefix}-radius-xl); }
.${prefix}-surface, .${prefix}-surface-sm, .${prefix}-surface-lg { color: var(--${prefix}-text); background: var(--${prefix}-card-bg); border: 1px solid var(--${prefix}-border); }
`).join('');

  const directions = Object.entries(tooltipDirections).map(([direction, declarations]) => {
    const selectors = presets.map(
      ({ prefix }) => `[data-ui-tooltip-anchor] > .${prefix}-tooltip-${direction}`
    );
    return `[data-ui][data-theme][data-mode] :where(${selectors.join(', ')}) { ${declarations} }`;
  }).join('\n');

  return `${startMarker}
/* Generated by scripts/generate-expanded-components.mjs from manifest.json. */
@layer ui-style-kit.components {
[data-ui][data-theme][data-mode] :where(
${selectorList(containmentWrappers)}
) {
  max-inline-size: 100%;
  min-inline-size: 0;
}

[data-ui][data-theme][data-mode] :where(
${selectorList(containmentControls)}
) {
  max-inline-size: 100%;
  min-inline-size: 0;
  overflow-wrap: break-word;
  word-break: normal;
  white-space: normal;
}

[data-ui][data-theme][data-mode] :where(
${selectorList(buttons)}
) {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  min-inline-size: 0;
  max-inline-size: 100%;
  line-height: 1.15;
  vertical-align: middle;
}

[data-ui][data-theme][data-mode] :where(
${selectorList(buttonPills)}
) {
  min-block-size: 44px;
  padding-block: .65rem;
  padding-inline: max(1rem, 1em);
  border-style: solid;
  border-width: 1px;
  border-radius: 999px;
  font: inherit;
  font-weight: 850;
  text-align: center;
  text-decoration: none;
  overflow-wrap: break-word;
  word-break: normal;
  white-space: normal;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}
${perPreset}
[data-ui][data-theme][data-mode] :where(
${selectorList(pressedPills)}
) { transform: translateY(1px); }

[data-ui][data-theme][data-mode] :where(
${selectorList(disabledPills)}
) { opacity: .55; cursor: not-allowed; filter: none; transform: none; }

[data-ui][data-theme][data-mode] :where(
${selectorList(tooltipSurfaces)}
) { max-inline-size: min(18rem, calc(100vw - 2rem)); text-align: start; overflow-wrap: break-word; word-break: normal; }

[data-ui][data-theme][data-mode] :where(
${selectorList(anchoredTooltips)}
) { position: absolute; z-index: 20; }

${directions}

:where(${classes(presets, ['bg-primary']).join(', ')}) { background: var(--usk-native-primary); color: var(--usk-native-on-primary); }
:where(${classes(presets, ['bg-secondary']).join(', ')}) { background: var(--usk-native-surface-soft); color: var(--usk-native-text); }
:where(${classes(presets, ['border']).join(', ')}) { border: var(--usk-native-border-width) solid var(--usk-native-border); }
:where(${classes(presets, ['divider']).join(', ')}) { inline-size: 100%; block-size: 1px; border: 0; background: var(--usk-native-border); }
:where(${classes(presets, ['disabled']).join(', ')}) { opacity: .55; cursor: not-allowed; pointer-events: none; }

:where(${classes(presets, ['button-ghost']).join(', ')}) { color: var(--usk-native-primary); background: transparent; border-color: var(--usk-native-border); }

:where(${classes(presets, ['check', 'radio', 'switch']).join(', ')}) {
  display: inline-flex;
  align-items: center;
  gap: var(--usk-native-field-gap);
  min-block-size: 24px;
  color: var(--usk-native-text);
}

:where(${classes(presets, ['check-control', 'radio-control']).join(', ')}) {
  inline-size: 1.5rem;
  block-size: 1.5rem;
  accent-color: var(--usk-native-primary);
}

:where(${classes(presets, ['switch-track']).join(', ')}) {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  inline-size: 2.75rem;
  block-size: 1.5rem;
  padding: .18rem;
  background: var(--usk-native-track);
  border: var(--usk-native-border-width) solid var(--usk-native-border);
  border-radius: 999px;
}

:where(${classes(presets, ['switch-thumb']).join(', ')}) {
  inline-size: 1rem;
  block-size: 1rem;
  background: var(--usk-native-thumb);
  border: var(--usk-native-border-width) solid var(--usk-native-thumb-border);
  border-radius: 999px;
  transition: transform 160ms ease;
}

:where(${checkedTracks.join(', ')}) { background: var(--usk-native-track-fill); }

:where(${classes(presets, ['sr-only', 'visually-hidden']).join(', ')}) {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

:where(${classes(presets, ['skip-link']).join(', ')}) {
  position: absolute;
  inset-block-start: .75rem;
  inset-inline-start: .75rem;
  z-index: 1000;
  padding: .75rem 1rem;
  color: var(--usk-native-on-primary);
  background: var(--usk-native-primary);
  border-radius: var(--usk-native-radius);
  transform: translateY(calc(-100% - 1rem));
}

:where(${classes(presets, ['skip-link'], (className) => `.${className}:focus-visible`).join(', ')}) { transform: translateY(0); }
}
${endMarker}`;
}

/**
 * Synchronizes the generated component extension inside the authored foundation file.
 *
 * @param {string} rootDir Repository root directory.
 * @param {{presets: {prefix: string}[]}} manifest Public UI Style Kit manifest.
 * @returns {string} Absolute path to the synchronized component stylesheet.
 */
export function syncExpandedComponents(rootDir, manifest) {
  const outputPath = path.join(rootDir, 'styles', 'components.css');
  const current = fs.readFileSync(outputPath, 'utf8');
  const generated = renderExpandedComponents(manifest);
  let authored = current;
  let startIndex = authored.indexOf(startMarker);

  // Remove every prior generated block so interrupted or older builds converge to one copy.
  while (startIndex !== -1) {
    const endIndex = authored.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      throw new Error(`Generated component marker is incomplete in ${outputPath}.`);
    }
    authored = `${authored.slice(0, startIndex)}${authored.slice(endIndex + endMarker.length)}`;
    startIndex = authored.indexOf(startMarker);
  }

  const next = `${authored.trimEnd()}\n\n${generated}\n`;
  fs.writeFileSync(outputPath, next);
  return outputPath;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const rootDir = path.resolve(path.dirname(currentFile), '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  syncExpandedComponents(rootDir, manifest);
}
