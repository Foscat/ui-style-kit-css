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
const promotedSemanticSuffixes = Object.freeze([
  'tabs', 'tab-list', 'tab', 'tab-panel',
  'pagination', 'pagination-item', 'pagination-link',
  'breadcrumb', 'breadcrumb-list', 'breadcrumb-item', 'breadcrumb-link',
  'breadcrumb-separator', 'skeleton',
  'empty-state', 'empty-state-icon', 'empty-state-title', 'empty-state-body',
  'empty-state-actions', 'metric', 'metric-label', 'metric-value', 'metric-detail',
  'chip', 'chip-group', 'avatar', 'avatar-group',
  'stepper', 'step', 'step-marker', 'step-label',
  'toast-stack', 'toast', 'toast-title', 'toast-body', 'toast-actions',
  'popover', 'menu', 'menu-item', 'menu-group', 'menu-separator',
  'segmented-control', 'segment', 'file-upload', 'dropzone',
  'listbox', 'listbox-option'
]);

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

  const allPresets = manifest.presets;
  const presets = allPresets.filter(({ prefix }) => !originalPrefixes.has(prefix));

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
  const promoted = (suffixes, decorate) => classes(allPresets, suffixes, decorate);

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
    return `[data-ui][data-mode] :where(${selectors.join(', ')}) { ${declarations} }`;
  }).join('\n');

  return `${startMarker}
/* Generated by scripts/generate-expanded-components.mjs from manifest.json. */
@layer ui-style-kit.components {
[data-ui][data-mode] :where(
${selectorList(containmentWrappers)}
) {
  max-inline-size: 100%;
  min-inline-size: 0;
}

[data-ui][data-mode] :where(
${selectorList(containmentControls)}
) {
  max-inline-size: 100%;
  min-inline-size: 0;
  overflow-wrap: break-word;
  word-break: normal;
  white-space: normal;
}

[data-ui][data-mode] :where(
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

[data-ui][data-mode] :where(
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
[data-ui][data-mode] :where(
${selectorList(pressedPills)}
) { transform: translateY(1px); }

[data-ui][data-mode] :where(
${selectorList(disabledPills)}
) { opacity: .55; cursor: not-allowed; filter: none; transform: none; }

[data-ui][data-mode] :where(
${selectorList(tooltipSurfaces)}
) { max-inline-size: min(18rem, calc(100vw - 2rem)); text-align: start; overflow-wrap: break-word; word-break: normal; }

[data-ui][data-mode] :where(
${selectorList(anchoredTooltips)}
) { position: absolute; z-index: 20; }

${directions}

:where(${classes(presets, ['bg-primary']).join(', ')}) { background: var(--usk-native-primary); color: var(--usk-native-on-primary); }
:where(${classes(presets, ['bg-secondary']).join(', ')}) { background: var(--usk-native-surface-soft); color: var(--usk-native-text); }
:where(${classes(presets, ['border']).join(', ')}) { border: var(--usk-native-border-width) solid var(--usk-native-border); }
:where(${classes(presets, ['divider']).join(', ')}) { inline-size: 100%; block-size: 1px; border: 0; background: var(--usk-native-border); }
:where(${classes(presets, ['disabled']).join(', ')}) { opacity: .55; cursor: not-allowed; pointer-events: none; }

:where(${classes(presets, ['button-ghost']).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); background: transparent; border-color: var(--usk-native-border); }

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

/* Stable semantic component sources shared by every preset. Paint resolves
   through each preset's --usk-native-* bridge while behavior stays in React. */
:where(${promoted(promotedSemanticSuffixes).join(', ')}) { box-sizing: border-box; min-inline-size: 0; }

:where(${promoted(['tabs']).join(', ')}) { display: grid; gap: .75rem; }
:where(${promoted(['tab-list']).join(', ')}) { display: flex; flex-wrap: wrap; gap: .25rem; border-block-end: var(--usk-native-border-width) solid var(--usk-native-border); }
:where(${promoted(['tab']).join(', ')}) { min-block-size: 44px; padding: .6rem .9rem; color: var(--usk-native-text-muted); background: transparent; border: 0; border-block-end: calc(var(--usk-native-border-width) * 2) solid transparent; font: inherit; cursor: pointer; }
:where(${promoted(['tab'], (className) => `.${className}[aria-selected="true"]`).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); border-block-end-color: var(--usk-native-primary); }
:where(${promoted(['tab-panel']).join(', ')}) { padding-block: .75rem; color: var(--usk-native-text); }

:where(${promoted(['pagination', 'breadcrumb-list', 'chip-group', 'avatar-group']).join(', ')}) { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 0; padding: 0; list-style: none; }
:where(${promoted(['pagination-item', 'breadcrumb-item']).join(', ')}) { display: inline-flex; align-items: center; min-inline-size: 0; }
:where(${promoted(['pagination-link']).join(', ')}) { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 44px; min-block-size: 44px; padding: .5rem .75rem; color: var(--usk-native-text); background: var(--usk-native-surface); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: var(--usk-native-radius); text-decoration: none; }
:where(${promoted(['pagination-link'], (className) => `.${className}[aria-current="page"]`).join(', ')}) { color: var(--usk-native-on-primary); background: var(--usk-native-primary); border-color: var(--usk-native-primary); }
:where(${promoted(['pagination-link'], (className) => `.${className}:disabled`).join(', ')}, ${promoted(['pagination-link'], (className) => `.${className}[aria-disabled="true"]`).join(', ')}) { opacity: .55; cursor: not-allowed; }

:where(${promoted(['breadcrumb']).join(', ')}) { max-inline-size: 100%; }
:where(${promoted(['breadcrumb-link']).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); text-decoration-thickness: .08em; text-underline-offset: .16em; }
:where(${promoted(['breadcrumb-separator']).join(', ')}) { color: var(--usk-native-text-muted); user-select: none; }

:where(${promoted(['skeleton']).join(', ')}) { display: block; min-block-size: 1rem; color: transparent; background: linear-gradient(100deg, var(--usk-native-surface-soft) 30%, var(--usk-native-surface) 50%, var(--usk-native-surface-soft) 70%); background-size: 200% 100%; border-radius: var(--usk-native-radius); animation: usk-skeleton-shimmer 1.4s linear infinite; }
:where(${promoted(['skeleton'], (className) => `.${className}[data-shape="circle"]`).join(', ')}) { aspect-ratio: 1; border-radius: 50%; }
:where(${promoted(['skeleton'], (className) => `.${className}[data-shape="text"]`).join(', ')}) { block-size: 1em; }
:where(${promoted(['skeleton'], (className) => `.${className}[data-shape="block"]`).join(', ')}) { min-block-size: 6rem; }

@keyframes usk-skeleton-shimmer { to { background-position-x: -200%; } }
@media (prefers-reduced-motion: reduce) { :where(${promoted(['skeleton']).join(', ')}) { animation: none; } }

:where(${promoted(['empty-state']).join(', ')}) { display: grid; justify-items: center; gap: .75rem; max-inline-size: 42rem; padding: clamp(1.25rem, 4vw, 3rem); color: var(--usk-native-text); background: var(--usk-native-surface); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: var(--usk-native-radius); text-align: center; }
:where(${promoted(['empty-state-icon']).join(', ')}) { display: grid; place-items: center; color: var(--usk-primary-ink, var(--usk-native-primary)); }
:where(${promoted(['empty-state-title', 'toast-title']).join(', ')}) { margin: 0; color: var(--usk-native-text); font-weight: 750; }
:where(${promoted(['empty-state-body', 'toast-body', 'metric-detail']).join(', ')}) { margin: 0; color: var(--usk-native-text-muted); }
:where(${promoted(['empty-state-actions', 'toast-actions']).join(', ')}) { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }

:where(${promoted(['metric']).join(', ')}) { display: grid; gap: .25rem; padding: 1rem; color: var(--usk-native-text); background: var(--usk-native-surface); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: var(--usk-native-radius); }
:where(${promoted(['metric-label']).join(', ')}) { color: var(--usk-native-text-muted); font-size: .875em; }
:where(${promoted(['metric-value']).join(', ')}) { color: var(--usk-native-text); font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; line-height: 1; }

:where(${promoted(['chip']).join(', ')}) { display: inline-flex; align-items: center; gap: .35rem; max-inline-size: 100%; min-block-size: 2rem; padding: .25rem .65rem; color: var(--usk-native-text); background: var(--usk-native-surface-soft); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: 999px; overflow-wrap: break-word; }
:where(${promoted(['chip-primary', 'chip-secondary', 'chip-success', 'chip-warning', 'chip-danger']).join(', ')}) { color: var(--usk-native-text); border-color: currentColor; }
:where(${promoted(['chip-primary']).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); }
:where(${promoted(['chip-secondary']).join(', ')}) { color: var(--usk-secondary-ink, var(--usk-native-text-muted)); }
:where(${promoted(['chip-success']).join(', ')}) { color: var(--usk-success-ink, var(--usk-native-success)); }
:where(${promoted(['chip-warning']).join(', ')}) { color: var(--usk-warning-ink, var(--usk-native-warning)); }
:where(${promoted(['chip-danger']).join(', ')}) { color: var(--usk-danger-ink, var(--usk-native-danger)); }

:where(${promoted(['avatar']).join(', ')}) { position: relative; display: inline-grid; place-items: center; flex: 0 0 auto; inline-size: 2.5rem; block-size: 2.5rem; color: var(--usk-native-on-primary); background: var(--usk-native-primary); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: 50%; font-weight: 750; overflow: hidden; }
:where(${promoted(['avatar'], (className) => `.${className} > img`).join(', ')}) { inline-size: 100%; block-size: 100%; object-fit: cover; }
:where(${promoted(['avatar-group'], (className) => `.${className} > * + *`).join(', ')}) { margin-inline-start: -.65rem; }

:where(${promoted(['stepper']).join(', ')}) { display: flex; flex-wrap: wrap; gap: .75rem; margin: 0; padding: 0; list-style: none; }
:where(${promoted(['step']).join(', ')}) { display: inline-flex; align-items: center; gap: .5rem; color: var(--usk-native-text-muted); }
:where(${promoted(['step-marker']).join(', ')}) { display: inline-grid; place-items: center; min-inline-size: 2rem; block-size: 2rem; border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: 50%; }
:where(${promoted(['step'], (className) => `.${className}[data-state="current"]`).join(', ')}, ${promoted(['step'], (className) => `.${className}[data-state="complete"]`).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); }
:where(${promoted(['step'], (className) => `.${className}[data-state="error"]`).join(', ')}) { color: var(--usk-danger-ink, var(--usk-native-danger)); }
:where(${promoted(['step-label']).join(', ')}) { font-weight: 650; }

:where(${promoted(['toast-stack']).join(', ')}) { display: grid; gap: .75rem; pointer-events: none; }
:where(${promoted(['toast']).join(', ')}) { display: grid; gap: .5rem; padding: 1rem; color: var(--usk-native-text); background: var(--usk-native-surface); border: var(--usk-native-border-width) solid var(--usk-native-border); border-inline-start: .3rem solid var(--usk-native-primary); border-radius: var(--usk-native-radius); box-shadow: var(--usk-native-shadow); pointer-events: auto; }
:where(${promoted(['toast-info']).join(', ')}) { border-inline-start-color: var(--usk-native-primary); }
:where(${promoted(['toast-success']).join(', ')}) { border-inline-start-color: var(--usk-native-success); }
:where(${promoted(['toast-warning']).join(', ')}) { border-inline-start-color: var(--usk-native-warning); }
:where(${promoted(['toast-danger']).join(', ')}) { border-inline-start-color: var(--usk-native-danger); }

:where(${promoted(['popover', 'menu', 'listbox']).join(', ')}) { max-inline-size: min(24rem, calc(100vw - 2rem)); padding: .5rem; color: var(--usk-native-text); background: var(--usk-native-surface); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: var(--usk-native-radius); box-shadow: var(--usk-native-shadow); }
:where(${promoted(['menu', 'listbox']).join(', ')}) { display: grid; gap: .2rem; margin: 0; list-style: none; }
:where(${promoted(['menu-item', 'listbox-option']).join(', ')}) { display: flex; align-items: center; gap: .5rem; min-block-size: 44px; padding: .55rem .7rem; border-radius: var(--usk-native-radius); cursor: default; }
:where(${promoted(['menu-item'], (className) => `.${className}:is(:hover, :focus-visible)`).join(', ')}, ${promoted(['listbox-option'], (className) => `.${className}:is(:hover, :focus-visible, [aria-selected="true"])`).join(', ')}) { color: var(--usk-native-on-primary); background: var(--usk-native-primary); outline: none; }
:where(${promoted(['menu-group']).join(', ')}) { display: grid; gap: .2rem; }
:where(${promoted(['menu-separator']).join(', ')}) { block-size: var(--usk-native-border-width); margin-block: .25rem; background: var(--usk-native-border); }

:where(${promoted(['segmented-control']).join(', ')}) { display: inline-flex; max-inline-size: 100%; padding: .2rem; background: var(--usk-native-surface-soft); border: var(--usk-native-border-width) solid var(--usk-native-border); border-radius: var(--usk-native-radius); overflow-x: auto; }
:where(${promoted(['segment']).join(', ')}) { min-block-size: 40px; padding: .45rem .75rem; color: var(--usk-native-text); background: transparent; border: 0; border-radius: calc(var(--usk-native-radius) * .75); font: inherit; white-space: nowrap; }
:where(${promoted(['segment'], (className) => `.${className}[aria-pressed="true"]`).join(', ')}) { color: var(--usk-native-on-primary); background: var(--usk-native-primary); }

:where(${promoted(['file-upload']).join(', ')}) { display: grid; gap: .75rem; }
:where(${promoted(['dropzone']).join(', ')}) { display: grid; place-items: center; gap: .5rem; min-block-size: 8rem; padding: 1.25rem; color: var(--usk-native-text-muted); background: var(--usk-native-surface-soft); border: calc(var(--usk-native-border-width) * 2) dashed var(--usk-native-border); border-radius: var(--usk-native-radius); text-align: center; }
:where(${promoted(['dropzone'], (className) => `.${className}[data-drag-active="true"]`).join(', ')}) { color: var(--usk-primary-ink, var(--usk-native-primary)); border-color: var(--usk-native-primary); }
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
