/**
 * @module studio/reference
 * @description Retained library QA controller; authored board markup is owned by shared modules.
 */
import { createState } from './state.js';
import { prepareSpecimen } from './specimen-loader.js';
import { createSpecimenContext } from './specimen-context.js';
import { renderStyleSpecificSurface } from './surfaces.js';
import { retroGlassIcon as renderRetroIcon } from './specimen-icons.js';
import { escapeHtml } from './html.js';
const main = document.getElementById('main');
let disposeSpecimen = () => {};
let specimenAbort;
/** Resolves live reference state for a shared module.
 * @param {string} ui Active preset.
 * @returns {Object} Explicit owned context.
 */
function referenceContext(ui) {
  return createSpecimenContext(
    main,
    { ui, mode: modeSelect.value, theme: normalizeThemeSelection(themeSelect.value) },
    demoManifest,
    (patch) => {
      if (patch.mode) modeSelect.value = patch.mode;
      if (patch.theme === '') selectReferencePalette();
      else refreshPalettePresentation();
    },
    referencePalette,
  );
}
/** Uses the shared wrapper with the retained companion registry.
 * @param {string} name Icon name.
 * @returns {string} Decorative markup.
 */
const retroGlassIcon = (name) => renderRetroIcon(name, window.UI_STYLE_KIT_ICONS);
const demoManifest = window.UI_STYLE_KIT_MANIFEST;

if (!demoManifest) {
  throw new Error('UI Style Kit demo manifest was not loaded before demo.js.');
}

const stylePrefixes = Object.fromEntries(
  demoManifest.presets.map(({ id, prefix }) => [id, prefix]),
);
const styleTitles = Object.fromEntries(demoManifest.presets.map(({ id, label }) => [id, label]));
const resourceLinks = [
  { label: 'GitHub', href: 'https://github.com/Foscat/ui-style-kit-css' },
  { label: 'Wiki', href: 'https://github.com/Foscat/ui-style-kit-css/wiki' },
  { label: 'npm', href: 'https://www.npmjs.com/package/ui-style-kit-css' },
  { label: 'Interactive Surface demo', href: 'https://foscat.github.io/Interactive-Surface-CSS/' },
  { label: 'Layout Style demo', href: 'https://foscat.github.io/Layout-Style-CSS/' },
];
const colorTokenRoles = [
  'bg',
  'surface',
  'surface-strong',
  'surface-soft',
  'text',
  'text-muted',
  'border',
  'primary',
  'primary-hover',
  'primary-text',
  'secondary',
  'secondary-hover',
  'secondary-text',
  'accent',
  'accent-text',
  'success',
  'success-text',
  'warning',
  'warning-text',
  'danger',
  'danger-text',
  'link',
  'focus',
];
const rgbChannelPattern = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;
const themeTokenOverrides = new Map();
let referenceCorners = '';
const appliedColorTokenNames = new Set();
const stylesWithCustomChoices = new Set([
  'minimal-saas',
  'bento',
  'maximalist',
  'bauhaus',
  'tactile',
  'neumorphism',
  'retrofuturism',
  'editorial-luxe',
  'organic-modern',
  'industrial-utility',
  'technical-blueprint',
  'art-deco',
  'clay',
  'data-terminal',
  'paper-editorial',
  'neo-noir',
]);
const uiSelect = document.getElementById('uiSelect');
const themeSelect = document.getElementById('themeSelect');
const modeSelect = document.getElementById('modeSelect');
const styleKitStylesheet = document.getElementById('styleKitStylesheet');
const demoContent = document.getElementById('demoContent');
const skip = document.getElementById('skip');
const defaultBundle =
  styleKitStylesheet.dataset.defaultHref || styleKitStylesheet.getAttribute('href');
const bridgeAwareBundle =
  styleKitStylesheet.dataset.bridgeHref ||
  defaultBundle.replace(/ui-style-kit\.css$/, 'ui-style-kit.with-bridge.css');
let bridgeAttached = false;
let copyTooltipId = 0;
let referencePalette = false;
let requestedRender = 0;

const interactiveSurfaceSelector = [
  'a[href]',
  'button:not(:disabled)',
  "input:not([type='hidden']):not(:disabled)",
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'summary',
  'audio[controls]',
  'video[controls]',
].join(',');

/**
 * Loads the shared, versioned definition needed by one preset.
 * The common loader owns retries and optional artwork dependencies.
 * @param {string} ui Selected preset identifier.
 * @returns {Promise<void>} Resolves after the selected preset's scripts are executable.
 */
async function loadPresetSpecimen(ui) {
  await prepareSpecimen(ui);
}

/** Populates controls from the library inventory while retaining the optional palette selection. */
function syncManifestSelectOptions() {
  const currentUi = uiSelect.value || 'minimal-saas';
  const currentTheme = normalizeThemeSelection(themeSelect.value);
  const currentMode = modeSelect.value || 'light';

  uiSelect.replaceChildren(
    ...demoManifest.presets.map(({ id, label, prefix }) => {
      const option = document.createElement('option');
      option.value = id;
      option.dataset.prefix = prefix;
      option.textContent = label;
      option.selected = id === currentUi;
      return option;
    }),
  );

  themeSelect.replaceChildren(
    ...['', ...demoManifest.themes].map((theme) => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = theme || 'None — style defaults';
      option.selected = theme === currentTheme;
      return option;
    }),
  );

  modeSelect.replaceChildren(
    ...demoManifest.modes.map((mode) => {
      const option = document.createElement('option');
      option.value = mode;
      option.textContent = mode;
      option.selected = mode === currentMode;
      return option;
    }),
  );
}

/**
 * Treats null, empty, None, and legacy reference-palette values as no shared theme.
 * Unknown names also fall back safely instead of activating an unresolved theme seam.
 * @param {string|null|undefined} value Requested theme identifier.
 * @returns {string} A supported theme identifier, or an empty native-palette selection.
 */
function normalizeThemeSelection(value) {
  const theme = String(value ?? '').trim();
  return demoManifest.themes.includes(theme) ? theme : '';
}

/**
 * Restores a shareable demo state using only values from the public inventory.
 * The personality alias retains compatibility with existing style-review URLs.
 * Omitted fields and invalid preset/mode requests preserve the current controls; an explicit
 * unresolved palette request restores style defaults. Shared edits and corners remain validated.
 * @returns {void}
 */
function applyDemoQuerySelection() {
  const query = new URLSearchParams(window.location.search);
  const restored = createState(demoManifest, query.toString());
  const ui = query.get('ui') ?? query.get('personality');
  if (Object.hasOwn(stylePrefixes, ui)) uiSelect.value = restored.appearance.ui;
  if (query.has('theme')) themeSelect.value = restored.appearance.theme;
  if (demoManifest.modes.includes(query.get('mode'))) modeSelect.value = restored.appearance.mode;
  referenceCorners = restored.appearance.corners;
  for (const [key, edits] of Object.entries(restored.edits))
    themeTokenOverrides.set(key, new Map(Object.entries(edits)));
}

/**
 * Synchronizes public theme attributes and per-context edits without a demo color namespace.
 * @returns {void}
 */
function applyPaletteSelection() {
  const theme = normalizeThemeSelection(themeSelect.value);
  themeSelect.value = theme;
  referencePalette = !theme;
  document.body.dataset.ui = uiSelect.value;
  document.body.dataset.mode = modeSelect.value;
  if (referenceCorners) document.body.dataset.uskCorners = referenceCorners;
  else document.body.removeAttribute('data-usk-corners');
  if (theme) document.body.dataset.theme = theme;
  else document.body.removeAttribute('data-theme');
  applyActiveTokenOverrides();
}

/** Selects the same native-palette option from every preset-specific reference button. */
function selectReferencePalette() {
  themeSelect.value = '';
  refreshPalettePresentation();
}

/** @returns {string} Copyable setup code that preserves the selected palette source. */
function getThemeUsageStatement() {
  return referencePalette
    ? 'document.body.removeAttribute("data-theme");'
    : `document.body.dataset.theme = "${themeSelect.value}";`;
}

/** @returns {string} Namespaced edit identity; native palettes are owned by a preset and mode. */
function getThemeOverrideKey() {
  return `${referencePalette ? `preset:${uiSelect.value}` : `theme:${themeSelect.value}`}|${modeSelect.value}`;
}

/** @returns {string} CSS scope for the active native palette or reusable shared theme. */
function getThemeOverrideSelector() {
  if (referencePalette)
    return `:where([data-ui="${uiSelect.value}"]:not([data-theme])[data-mode="${modeSelect.value}"])`;
  return `:where([data-ui][data-theme="${themeSelect.value}"][data-mode="${modeSelect.value}"])`;
}

function normalizeRgbChannels(value) {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);

  if (parts.length !== 3) return '';

  const channels = parts.map((part) => Number.parseInt(part, 10));
  const isConcreteRgb = channels.every((channel, index) => {
    return (
      Number.isInteger(channel) &&
      channel >= 0 &&
      channel <= 255 &&
      String(channels[index]) === parts[index]
    );
  });

  return isConcreteRgb ? channels.join(' ') : '';
}

/**
 * Convert a string of RGB channels to a hexadecimal color string.
 * @param {string} value - The string containing RGB channels (e.g., "255 0 0").
 * @returns {string} - The corresponding hexadecimal color string (e.g., "#ff0000").
 */
function rgbChannelsToHex(value) {
  const normalized = normalizeRgbChannels(value);
  if (!normalized) return '#000000';

  return `#${normalized
    .split(' ')
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToRgbChannels(value) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(value).trim());
  if (!match) return '';

  return match
    .slice(1)
    .map((channel) => Number.parseInt(channel, 16))
    .join(' ');
}

function getStoredTokenOverrides() {
  const key = getThemeOverrideKey();

  if (!themeTokenOverrides.has(key)) {
    themeTokenOverrides.set(key, new Map());
  }

  return themeTokenOverrides.get(key);
}

function clearInlineColorTokens() {
  appliedColorTokenNames.forEach((name) => document.body.style.removeProperty(name));
  appliedColorTokenNames.clear();
}

/**
 * Resolves a palette edit to its owning public variable without activating a shared theme.
 * @param {string} role Palette role, including preset-specific material roles.
 * @returns {string} The concrete CSS custom property to override.
 */
function getColorTokenName(role) {
  return `--${referencePalette ? stylePrefixes[uiSelect.value] : 'usk'}-${role}-rgb`;
}

function applyActiveTokenOverrides() {
  clearInlineColorTokens();

  getStoredTokenOverrides().forEach((value, role) => {
    const name = getColorTokenName(role);
    document.body.style.setProperty(name, value);
    appliedColorTokenNames.add(name);
  });
}

/**
 * Get the currently active color tokens from the computed styles of the document body.
 * @returns {Array<{role: string, name: string, value: string}>} - An array of active color token objects.
 */
function getActiveColorTokens() {
  const computedStyles = getComputedStyle(document.body);
  const prefix = stylePrefixes[uiSelect.value];
  const roles = new Set(colorTokenRoles);

  // Material palettes may own extra channels (paper, ink, brass, enamel, etc.).
  // Read the actual computed inventory rather than guessing their role mappings.
  if (referencePalette) {
    for (const name of Array.from(computedStyles)) {
      if (name.startsWith(`--${prefix}-`) && name.endsWith('-rgb')) {
        const role = name.slice(prefix.length + 3, -4);
        if (/^[a-z][a-z0-9-]*$/.test(role) && !role.startsWith('fallback-')) roles.add(role);
      }
    }
  }

  return [...roles]
    .map((role) => {
      const name = getColorTokenName(role);
      const value =
        normalizeRgbChannels(computedStyles.getPropertyValue(name)) ||
        (!referencePalette &&
          normalizeRgbChannels(computedStyles.getPropertyValue(`--${prefix}-${role}-rgb`)));

      return value && rgbChannelPattern.test(value) ? { role, name, value } : null;
    })
    .filter(Boolean);
}

/**
 * Set a color token override for the current theme and mode, updating the document's inline styles and the stored overrides.
 * @param {string} role - The role of the color token to override.
 * @param {string} value - The new RGB value for the color token (e.g., "255 0 0").
 * @returns {string} - The normalized RGB value that was set.
 */
function setTokenOverride(role, value) {
  const normalized = normalizeRgbChannels(value);
  if (!normalized || !getActiveColorTokens().some((token) => token.role === role)) return '';

  getStoredTokenOverrides().set(role, normalized);
  const name = getColorTokenName(role);
  document.body.style.setProperty(name, normalized);
  appliedColorTokenNames.add(name);
  updateThemeOverridePreview();

  return normalized;
}

/**
 * Reset a color token override for the current theme and mode, updating the document's inline styles and the stored overrides.
 * @param {string} role - The role of the color token to reset.
 */
function resetTokenOverride(role) {
  getStoredTokenOverrides().delete(role);
  const name = getColorTokenName(role);
  document.body.style.removeProperty(name);
  appliedColorTokenNames.delete(name);
  updateThemeOverridePreview();
}

/** Removes only the active palette's edits, preserving experiments in other contexts. */
function resetPaletteOverrides() {
  getStoredTokenOverrides().clear();
  applyActiveTokenOverrides();
  updateThemeOverridePreview();
}

/**
 * Build the CSS string for the current theme overrides.
 * @returns {string} - The CSS string representing the active color token overrides.
 */
function buildThemeOverrideCss() {
  const tokens = getActiveColorTokens();
  const declarations = tokens.map((token) => `  ${token.name}: ${token.value};`).join('\n');

  return `${getThemeOverrideSelector()} {\n${declarations}\n}`;
}

/**
 * Update the theme override preview code block in the demo to reflect the current active color token overrides.
 */
function updateThemeOverridePreview() {
  const preview = document.querySelector("[data-testid='theme-override-preview']");
  if (preview) {
    preview.textContent = buildThemeOverrideCss();
  }
}

function copyButtonMarkup(label = 'Copy code') {
  const tooltipId = `demo-copy-tooltip-${copyTooltipId}`;
  copyTooltipId += 1;

  return `
    <button class="demo-copy-button" type="button" data-copy-code data-copy-tooltip-id="${tooltipId}" aria-label="${escapeHtml(label)}">
      <svg width="24" height="24" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M9 3h9a2 2 0 0 1 2 2v11h-2V5H9V3Z"></path>
        <path d="M5 7h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h9V9H5Z"></path>
      </svg>
    </button>
    <span id="${tooltipId}" class="demo-copy-tooltip" aria-hidden="true">${escapeHtml(label)}</span>
  `;
}

function renderCodeBlock(code, language = '') {
  const languageClass = language ? ` class="language-${escapeHtml(language)}"` : '';

  return `
    <div class="demo-code-block" data-testid="code-block">
      <pre class="demo-code ly-overflow-auto" tabindex="0"><code${languageClass}>${escapeHtml(code)}</code></pre>
      ${copyButtonMarkup('Copy code')}
    </div>`;
}

function renderResourceLinks() {
  return `
    <div class="demo-resource-links ly-cluster ly-items-center" data-testid="resource-links" aria-label="Project resources">
      ${resourceLinks
        .map(
          (link) =>
            `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`,
        )
        .join('')}
    </div>`;
}

function renderThemeTokenEditor(tokens) {
  const overrideCss = buildThemeOverrideCss();
  const paletteLabel = referencePalette
    ? `${styleTitles[uiSelect.value]} native palette`
    : themeSelect.value;

  return `
    <section id="tokens" class="demo-token-workbench ly-grid" data-testid="theme-token-workbench">
      <div class="demo-section-lede">
        <p class="demo-token-kicker">Tokens</p>
        <h2>Active color palette workbench</h2>
        <p data-testid="palette-context">Editing <strong>${escapeHtml(paletteLabel)}</strong> / <code>${escapeHtml(modeSelect.value)}</code>. ${referencePalette ? 'No shared color theme is applied; values come from this style’s native palette.' : 'This shared color theme applies across UI styles.'}</p>
        <p>Edit the 23 RGB roles live, then copy a drop-in <code>--usk-*</code> override block. Native edits are kept per style and mode; named-theme edits follow that theme. Edits last until the page is reloaded and may affect contrast.</p>
        <p id="token-input-help">RGB values use three whole numbers from 0 to 255, separated by spaces.</p>
      </div>
      <div class="demo-token-actions ly-cluster ly-items-center">
        <button type="button" class="demo-token-copy" data-testid="copy-theme-override">Copy theme override</button>
        <button type="button" class="demo-token-reset" data-testid="reset-palette">Reset palette edits</button>
        <span class="demo-copy-status" data-token-copy-status aria-live="polite"></span>
      </div>
      <div class="demo-token-workbench-grid ly-grid">
        <div class="demo-token-table ly-grid ly-overflow-auto" aria-label="Editable color tokens" tabindex="0">
          ${tokens
            .map((token) => {
              const hexValue = rgbChannelsToHex(token.value);

              return `
                <div class="demo-token-row ly-grid" data-token-role="${escapeHtml(token.role)}">
                  <span class="demo-token-swatch" style="--demo-token-color: rgb(${escapeHtml(token.value)})" aria-hidden="true"></span>
                  <label>
                    <span>${escapeHtml(token.name)}</span>
                    <input class="demo-token-input" type="text" value="${escapeHtml(token.value)}" aria-label="${escapeHtml(token.name)} RGB channels" aria-describedby="token-input-help">
                  </label>
                  <input class="demo-token-color" type="color" value="${escapeHtml(hexValue)}" aria-label="${escapeHtml(token.name)} color picker">
                  <button type="button" class="demo-token-reset" data-token-reset aria-label="Reset ${escapeHtml(token.role)}">Reset</button>
                </div>`;
            })
            .join('')}
        </div>
        <div class="demo-code-block demo-theme-override-block">
          <pre class="demo-code ly-overflow-auto" tabindex="0"><code data-testid="theme-override-preview">${escapeHtml(overrideCss)}</code></pre>
          ${copyButtonMarkup('Copy override')}
        </div>
      </div>
    </section>`;
}

/**
 * Renders the palette-dependent usage examples without rebuilding the surrounding demo.
 * @param {string} p Active preset class prefix.
 * @returns {string} Usage section markup for the active palette and mode.
 */
function renderUsageSection(p) {
  return `
    <section id="usage" class="${p}-card" data-testid="usage-imports">
      <p class="${p}-kicker">Usage</p>
      <h2 class="${p}-heading">Import paths and data attributes</h2>
      <div class="demo-showcase-grid ly-grid ly-items-start">
        ${renderCodeBlock(
          `import "ui-style-kit-css";

document.body.dataset.ui = "${uiSelect.value}";
${getThemeUsageStatement()}
document.body.dataset.mode = "${modeSelect.value}";`,
          'js',
        )}
        ${renderCodeBlock(
          `import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/native-elements.css";
import "ui-style-kit-css/${uiSelect.value}.css";`,
          'js',
        )}
        ${renderCodeBlock(
          `import "ui-style-kit-css/with-bridge.css";
import "ui-style-kit-css/interactive-surface-bridge.css";`,
          'js',
        )}
      </div>
      <p class="${p}-copy">Choose <strong>None — style defaults</strong> to omit <code>data-theme</code> and use the preset’s native colors. Keep <code>data-ui</code> and <code>data-mode</code> set. A named theme overrides colors without replacing component classes; the theme-colors import is optional for standalone native-palette usage.</p>
    </section>`;
}

/**
 * Copy text to the clipboard using the Clipboard API if available, or fallback to a textarea method for older browsers.
 * @param {string} text - The text to copy to the clipboard.
 * @returns {Promise<void>}
 */
async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // The textarea path keeps local file previews and older browsers usable without extra dependencies.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto 0';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

/**
 * Bind click event listeners to all code copy buttons in the document. When a button is clicked, it copies the associated code block's content to the clipboard and provides visual feedback.
 * @param {ParentNode} root Root containing the copy controls to bind.
 * @returns {void}
 */
function bindCodeCopyButtons(root = main) {
  root.querySelectorAll('[data-copy-code]').forEach((button) => {
    button.addEventListener('click', async () => {
      const block = button.closest('.demo-code-block');
      const code = block?.querySelector('code')?.innerText || '';
      const tooltip = document.getElementById(button.dataset.copyTooltipId);
      const originalLabel = tooltip?.textContent || 'Copy code';

      await copyTextToClipboard(code);
      if (tooltip) tooltip.textContent = 'Copied';
      button.classList.add('is-copied');

      window.setTimeout(() => {
        if (tooltip) tooltip.textContent = originalLabel;
        button.classList.remove('is-copied');
      }, 1400);
    });
  });
}

/**
 * Bind the native modal specimen without replacing browser dialog semantics.
 *
 * @returns {void}
 */
function bindNativeDialogDemo() {
  const openButton = main.querySelector("[data-testid='native-modal-open']");
  const dialog = main.querySelector("[data-testid='native-modal-dialog']");

  if (!openButton || !dialog) return;

  openButton.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  });
}

/**
 * Apply native runtime-only states that cannot be represented by HTML attributes.
 *
 * @returns {void}
 */
function bindNativeSemanticStates() {
  const indeterminate = main.querySelector("[data-testid='native-checkbox-indeterminate']");
  if (indeterminate) indeterminate.indeterminate = true;
}

/**
 * Bind event listeners to theme token controls, allowing users to modify and reset theme tokens.
 * @returns {void}
 */
function bindThemeTokenControls() {
  const workbench = main.querySelector("[data-testid='theme-token-workbench']");
  if (!workbench) return;

  workbench.querySelectorAll('[data-token-role]').forEach((row) => {
    const role = row.dataset.tokenRole;
    const textInput = row.querySelector('.demo-token-input');
    const colorInput = row.querySelector('.demo-token-color');
    const swatch = row.querySelector('.demo-token-swatch');
    const syncVisuals = (value) => {
      if (!value) return;

      textInput.value = value;
      colorInput.value = rgbChannelsToHex(value);
      swatch.style.setProperty('--demo-token-color', `rgb(${value})`);
      textInput.removeAttribute('aria-invalid');
      textInput.setCustomValidity('');
    };

    textInput.addEventListener('input', () => {
      const value = setTokenOverride(role, textInput.value);
      if (!value) {
        textInput.setAttribute('aria-invalid', 'true');
        textInput.setCustomValidity(
          'Enter three whole numbers from 0 to 255, separated by spaces.',
        );
        workbench.querySelector('[data-token-copy-status]').textContent =
          'Invalid RGB value. The preview keeps the last valid color.';
        return;
      }
      syncVisuals(value);
      workbench.querySelector('[data-token-copy-status]').textContent = '';
      drawDemoCanvas();
    });

    colorInput.addEventListener('input', () => {
      const value = setTokenOverride(role, hexToRgbChannels(colorInput.value));
      syncVisuals(value);
      workbench.querySelector('[data-token-copy-status]').textContent = '';
      drawDemoCanvas();
    });

    row.querySelector('[data-token-reset]').addEventListener('click', () => {
      resetTokenOverride(role);
      const token = getActiveColorTokens().find((item) => item.role === role);
      if (token) syncVisuals(token.value);
      workbench.querySelector('[data-token-copy-status]').textContent = `${role} restored.`;
      drawDemoCanvas();
    });
  });

  workbench.querySelector("[data-testid='reset-palette']").addEventListener('click', () => {
    resetPaletteOverrides();
    getActiveColorTokens().forEach((token) => {
      const row = workbench.querySelector(`[data-token-role="${token.role}"]`);
      const input = row.querySelector('.demo-token-input');
      input.value = token.value;
      input.removeAttribute('aria-invalid');
      input.setCustomValidity('');
      row.querySelector('.demo-token-color').value = rgbChannelsToHex(token.value);
      row
        .querySelector('.demo-token-swatch')
        .style.setProperty('--demo-token-color', `rgb(${token.value})`);
    });
    workbench.querySelector('[data-token-copy-status]').textContent =
      'Active palette restored. Other palette edits are unchanged.';
    drawDemoCanvas();
  });

  workbench
    .querySelector("[data-testid='copy-theme-override']")
    .addEventListener('click', async () => {
      await copyTextToClipboard(buildThemeOverrideCss());
      const status = workbench.querySelector('[data-token-copy-status]');
      status.textContent = 'Copied';
      window.setTimeout(() => {
        status.textContent = '';
      }, 1400);
    });
}
/**
 * Render the choice controls (checkboxes, radio buttons, and switches) for the specified UI style. If the UI style does not have custom choices, it will render native HTML controls instead.
 * @param {string} ui - The unique identifier for the UI component.
 * @param {string} p - The prefix for CSS class names.
 * @returns {string} - The HTML string for the choice controls.
 */
function renderChoiceControls(ui, p) {
  if (!stylesWithCustomChoices.has(ui)) {
    return `
      <div class="demo-inline-row ly-cluster ly-items-center">
        <label><input type="checkbox" checked> Native checkbox</label>
        <label><input type="radio" name="native-choice-${ui}" checked> Native radio</label>
        <label><input type="radio" name="native-choice-${ui}"> Native radio</label>
      </div>`;
  }

  return `
    <div class="demo-inline-row ly-cluster ly-items-center">
      <label class="${p}-check"><input type="checkbox" checked><span class="${p}-check-control"></span><span>Checked</span></label>
      <label class="${p}-check"><input type="checkbox"><span class="${p}-check-control"></span><span>Unchecked</span></label>
      <label class="${p}-radio"><input type="radio" name="component-radio-${ui}" checked><span class="${p}-radio-control"></span><span>Radio A</span></label>
      <label class="${p}-radio"><input type="radio" name="component-radio-${ui}"><span class="${p}-radio-control"></span><span>Radio B</span></label>
      <label class="${p}-switch"><input type="checkbox" checked><span class="${p}-switch-track"><span class="${p}-switch-thumb"></span></span><span>Switch</span></label>
    </div>`;
}

/**
 * Reports whether the demo was explicitly opened as a developer reference fixture.
 * @returns {boolean} True only for the opt-in reference view.
 */
function isTemplateReferenceView() {
  return new URLSearchParams(window.location.search).get('view') === 'reference';
}

/**
 * Renders the selected authored reference board, shared by fixtures and feature excerpts.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Original reference markup, or an empty string when none exists.
 */
function renderActiveTemplateSpecimen(ui) {
  if (!demoManifest.specimens[ui]?.template) return '';
  return window.StudioAuthored?.[ui]?.render(referenceContext(ui)) ?? '';
}

/**
 * Keeps full template copies out of the public component showcase.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Opt-in visual QA fixture.
 */
function renderTemplateReferences(ui, p) {
  return isTemplateReferenceView()
    ? `<aside class="${p}-well"><strong>Developer reference view</strong><p>Original template boards are retained here for visual comparison. <a href="?">Return to the component showcase</a>.</p></aside>${renderActiveTemplateSpecimen(ui, p)}`
    : '';
}

/**
 * Selects explicitly authored, non-nesting excerpt boundaries, not arbitrary HTML tags.
 * The same component markup is used in both the gallery and its original reference board.
 * @param {string} markup Authored template markup.
 * @param {string} kind Boundary kind: feature or support.
 * @returns {string} Concatenated feature fragments.
 */
function extractStyleFeatures(markup, kind = 'feature') {
  const boundary = new RegExp(
    `<!--demo-style-${kind}-->([\\s\\S]*?)<!--/demo-style-${kind}-->`,
    'g',
  );
  return [...markup.matchAll(boundary)].map((match) => match[1]).join('');
}

/**
 * Showcases distinctive preset components inside the shared demo navigation and palette.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Accessible, curated component gallery.
 */
function renderStyleSpecificGallery(ui, p) {
  if (isTemplateReferenceView()) return '';
  const specimen = renderActiveTemplateSpecimen(ui, p);
  const features = extractStyleFeatures(specimen);
  const industrial = ui === 'industrial-utility';
  return `<section id="style-specific" class="${p}-card" aria-labelledby="style-specific-heading">
    <p class="${p}-kicker">${styleTitles[ui]}</p>
    <h3 id="style-specific-heading" class="${p}-heading">Style-specific components</h3>
    <p class="${p}-copy">${
      industrial
        ? 'Try the switchgear, key switch, guarded stop, and alarm acknowledgment. These are local UI demonstrations. No equipment is connected.'
        : 'Distinctive components and surface treatments from this preset, using the selected palette and mode.'
    }</p>
    <div class="demo-style-features${industrial ? ' demo-industrial-utility-specimen' : ''}"${industrial ? ' id="industrial-utility-template"' : ''} data-preset-only="${ui}">
      ${features ? `<div class="demo-style-feature-grid ly-grid">${features}</div>` : ''}
      ${extractStyleFeatures(specimen, 'support')}
      ${industrial ? '' : renderStyleSpecificSurface(ui, p)}
    </div>
  </section>`;
}

/**
 * Updates the native range's visible readout and preset-owned track variables.
 * @param {HTMLInputElement} range A range from the curated feature gallery.
 * @returns {void}
 */
function updateStyleFeatureRange(range) {
  const value = Number(range.value);
  const fraction = (value - Number(range.min)) / (Number(range.max) - Number(range.min));
  const noir = range.matches('.noir-range');
  const prefix = noir
    ? 'noir'
    : range.matches('.rg-range')
      ? 'rg'
      : range.matches('.blueprint-range')
        ? 'blueprint'
        : 'clay';
  const track = ['rg', 'blueprint'].includes(prefix) ? range : range.parentElement;
  track.style.setProperty(`--${prefix}-value`, `${fraction * 100}%`);
  if (noir) track.style.setProperty('--noir-position', String(fraction));
  range.parentElement.querySelector('output').value = noir
    ? `${value > 0 ? '+' : ''}${value.toFixed(1)}`
    : range.value;
}

/** Binds the small set of interactions retained outside their full reference boards. */
function bindStyleSpecificGallery() {
  const root = document.querySelector('#style-specific .demo-style-features');
  if (!root) return;
  root
    .querySelectorAll('.noir-range, .clay-range input, .rg-range, .blueprint-range')
    .forEach((range) => {
      updateStyleFeatureRange(range);
      range.addEventListener('input', () => updateStyleFeatureRange(range));
    });
  const workflow = [...root.querySelectorAll('[data-noir-workflow]')];
  workflow.forEach((button, index) =>
    button.addEventListener('click', () => {
      workflow.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      root.querySelectorAll('.noir-step').forEach((step, stepIndex) => {
        if (stepIndex === index) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    }),
  );
}

/**
 * Binds only the external specimen module represented by the current DOM.
 * @param {string} ui Selected preset identifier.
 * @returns {void}
 */
function bindActivePresetSpecimen(ui) {
  disposeSpecimen();
  specimenAbort?.abort();
  specimenAbort = new AbortController();
  const module = window.StudioAuthored?.[ui];
  disposeSpecimen = module?.bind(main, referenceContext(ui), specimenAbort.signal) ?? (() => {});
}

/**
 * Binds interactions that exist only in the active preset's rendered regions.
 * @param {string} ui Selected preset identifier.
 * @returns {void}
 */
function bindPresetSpecificDemo(ui) {
  syncPresetSpecificVisibility();
  bindStyleSpecificGallery();
  bindActivePresetSpecimen(ui);
}

/** Hydrates stable semantic demo icons once, without replacing their controls on preset changes. */
function hydrateDemoIcons() {
  document.querySelectorAll('[data-demo-icon]').forEach((element) => {
    const icon = window.UI_STYLE_KIT_ICONS[element.dataset.demoIcon];
    if (icon) element.innerHTML = icon;
  });
}

/**
 * Keeps every preset-only demo region synchronized with the active style.
 * @returns {void}
 */
function syncPresetSpecificVisibility() {
  document.querySelectorAll('[data-preset-only]').forEach((element) => {
    element.hidden = element.dataset.presetOnly !== uiSelect.value;
  });
}

/**
 * Resolves the public interaction feedback variant from a rendered control's semantics.
 * @param {Element} element Native or prefixed interactive control.
 * @returns {string} Primary, secondary, danger, or subtle interaction feedback variant.
 */

function getSurfaceVariant(element) {
  const className = element.getAttribute('class') || '';
  const inputType = element.getAttribute('type');

  if (element.matches("[aria-current='page'], [aria-pressed='true'], .is-active")) return 'primary';
  if (className.includes('-button-danger') || inputType === 'reset') return 'danger';
  if (className.includes('-button-secondary')) return 'secondary';
  if (className.includes('-button-primary') || inputType === 'submit' || inputType === 'button')
    return 'primary';

  return 'subtle';
}

function getSurfaceLevel(element) {
  const inputType = element.getAttribute('type');

  if (
    element.matches("[aria-current='page'], [aria-pressed='true'], .is-active, [aria-busy='true']")
  )
    return '3';
  if (element.matches('button, select, summary, audio[controls], video[controls]')) return '2';
  if (['button', 'submit', 'reset'].includes(inputType)) return '2';

  return '1';
}

function syncInteractiveSurfaceHooks(isAttached) {
  const elements = document.querySelectorAll(interactiveSurfaceSelector);

  elements.forEach((element) => {
    if (!isAttached) {
      element.classList.remove('interactive-surface');
      delete element.dataset.surfaceVariant;
      delete element.dataset.surfaceLevel;
      return;
    }

    element.classList.add('interactive-surface');
    element.dataset.surfaceVariant = getSurfaceVariant(element);
    element.dataset.surfaceLevel = getSurfaceLevel(element);
  });
}

function updateBridge() {
  const bridgeToggle = document.getElementById('bridgeToggle');
  const bridgeStatus = document.querySelector("[data-testid='bridge-status']");
  const isAttached = bridgeToggle ? bridgeToggle.checked : bridgeAttached;

  bridgeAttached = isAttached;

  document.body.dataset.bridge = isAttached ? 'attached' : 'detached';
  styleKitStylesheet.setAttribute('href', isAttached ? bridgeAwareBundle : defaultBundle);
  if (bridgeStatus) {
    bridgeStatus.textContent = isAttached
      ? 'Attached - using with-bridge bundle'
      : 'Detached - default bundle';
  }
  // The bridge stylesheet owns the surface visuals; the demo only attaches the expected hooks.
  syncInteractiveSurfaceHooks(isAttached);
}

/**
 * Keeps feature deep links within their owning top-level navigation section.
 * @param {string} targetId Current in-page anchor.
 * @returns {void}
 */
function syncPrimaryNavCurrent(targetId = 'overview') {
  const nav = main.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;
  const sectionId = targetId === 'style-specific' ? 'components' : targetId;

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('is-active', isCurrent);

    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function bindPrimaryNav() {
  const nav = main.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      syncPrimaryNavCurrent(link.getAttribute('href').slice(1));
    });
  });
}

function drawDemoCanvas() {
  const canvas = document.querySelector('[data-demo-canvas]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const styles = getComputedStyle(document.body);
  const primary =
    styles.getPropertyValue(`--${stylePrefixes[uiSelect.value]}-primary`).trim() || '#6f8cff';
  const accent =
    styles.getPropertyValue(`--${stylePrefixes[uiSelect.value]}-accent`).trim() || '#ffcc66';

  // Canvas is drawn after render so the native canvas element is visibly represented.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.72, canvas.height * 0.46, canvas.height * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, .72)';
  ctx.fillRect(canvas.width * 0.08, canvas.height * 0.2, canvas.width * 0.42, canvas.height * 0.12);
  ctx.fillRect(canvas.width * 0.08, canvas.height * 0.42, canvas.width * 0.3, canvas.height * 0.12);
}

/**
 * Selects scalable medallion artwork while preserving each preset's existing icon family.
 * Maximalist uses SVG strokes for its annotated star, check, and directional arrow.
 * @param {string} ui Active UI preset identifier.
 * @param {string} name Icon asset name.
 * @param {string} fallback Decorative text glyph used by other presets.
 * @returns {string} Trusted bundled SVG markup or the supplied decorative glyph.
 */
function renderMedallionIcon(ui, name, fallback) {
  if (ui === 'organic-modern') return window.ORGANIC_PHOSPHOR_ICONS[name];
  if (ui === 'retro-glass' && name === 'check') return retroGlassIcon(name);
  if (
    ui === 'clay' ||
    (ui === 'neo-noir' && name === 'arrow-right') ||
    (ui === 'maximalist' && ['star', 'check', 'arrow-right'].includes(name))
  ) {
    return window.UI_STYLE_KIT_ICONS[name];
  }
  return fallback;
}

function render() {
  const ui = uiSelect.value;
  const p = stylePrefixes[ui];
  const title = styleTitles[ui];

  applyPaletteSelection();
  skip.className = `${p}-skip-link`;

  const activeColorTokens = getActiveColorTokens();

  // The prefixed compatibility showcase remains dynamic while the semantic section keeps stable DOM nodes.
  demoContent.innerHTML = `
    <section class="${p}-page demo-showcase">
      <div class="${p}-container ${p}-stack">
        <nav class="${p}-nav" aria-label="Primary">
          <a class="${p}-nav-link is-active" aria-current="page" href="#overview">Overview</a>
          <a class="${p}-nav-link" href="#tokens">Tokens</a>
          <a class="${p}-nav-link" href="#components">Components</a>
          <a class="${p}-nav-link" href="#native">Native HTML</a>
          <a class="${p}-nav-link" href="#bridge">Bridge</a>
          <a class="${p}-nav-link" href="#usage">Usage</a>
        </nav>

        ${renderTemplateReferences(ui, p)}

        <header id="overview" class="${p}-card ${p}-hover-lift">
          <p class="${p}-kicker">${title}</p>
          <h1 class="${p}-title">UI Style Kit CSS</h1>
          <p class="${p}-subtitle demo-section-lede">A CSS-only style kit with 20 UI systems, 25 shared color themes, light/dark/contrast modes, component classes, native HTML coverage, and an optional Interactive Surface bridge.</p>
          <p class="${p}-copy"><a href="${isTemplateReferenceView() ? '#components' : '#style-specific'}">Explore ${title}’s distinctive components</a></p>
          <div class="${p}-cluster">
            <button class="${p}-button ${p}-button-primary">Primary</button>
            <button class="${p}-button ${p}-button-secondary">Secondary</button>
            <button class="${p}-button">Neutral</button>
            <button class="${p}-button ${p}-button-ghost">Ghost</button>
            <button class="${p}-icon-button" aria-label="Favorite">&#9733;</button>
            <span class="${p}-badge ${p}-badge-primary">Primary</span>
            <span class="${p}-badge ${p}-badge-warning">Warning</span>
          </div>
          ${renderResourceLinks()}
        </header>

        ${renderThemeTokenEditor(activeColorTokens)}

        <section id="components" class="${p}-stack">
          <div class="demo-section-lede">
            <p class="${p}-kicker">Components</p>
            <h2 class="${p}-heading">Prefixed component classes and visible states</h2>
            <p class="${p}-copy">Each style preset uses the same component API with a style-specific prefix such as <code>${p}-button</code>, <code>${p}-card</code>, and <code>${p}-alert</code>.</p>
          </div>

          ${renderStyleSpecificGallery(ui, p)}

          <div class="demo-showcase-grid demo-component-grid ly-grid ly-items-start">
            <article class="${p}-card demo-control-card" data-testid="component-controls">
              <p class="${p}-kicker">Controls</p>
              <h3 class="${p}-heading">Buttons, progress, loading, and tooltips</h3>
              <div class="demo-control-showcase ly-grid">
                <section class="demo-control-panel ly-grid" data-testid="component-buttons">
                  <h4>Button variants</h4>
                  <div class="demo-button-row ly-cluster ly-items-center">
                    <button class="${p}-button ${p}-button-primary">Primary</button>
                    <button class="${p}-button ${p}-button-secondary">Secondary</button>
                    <button class="${p}-button">Neutral</button>
                    <button class="${p}-button ${p}-button-warning">Warning</button>
                    <button class="${p}-button ${p}-button-danger${p === 'utility' ? ' is-alarm' : ''}">Danger</button>
                    <button class="${p}-button ${p}-button-ghost">Ghost</button>
                    <button class="${p}-icon-button" aria-label="Icon action">?</button>
                  </div>
                </section>

                <section class="demo-control-panel ly-grid" data-testid="component-progress">
                  <h4>Progress</h4>
                  <div class="demo-progress-stack ly-grid">
                    <div class="${p}-progress" role="progressbar" aria-label="Component progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68"><div class="${p}-progress-bar" style="--${p}-progress-value: 68%"></div></div>
                    <div class="${p}-progress" role="progressbar" aria-label="Secondary progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="34"><div class="${p}-progress-bar" style="--${p}-progress-value: 34%"></div></div>
                  </div>
                </section>

                <section class="demo-control-panel ly-grid" data-testid="component-spinner">
                  <h4>Loading</h4>
                  <div class="demo-button-row ly-cluster ly-items-center">
                    <span class="${p}-spinner ${p}-spinner-sm" role="status" aria-label="Small loading spinner"></span>
                    <span class="${p}-spinner" role="status" aria-label="Loading spinner"></span>
                    <span class="${p}-spinner ${p}-spinner-lg" role="status" aria-label="Large loading spinner"></span>
                    <span class="ui-spinner" data-loading-spinner role="status" aria-label="Native loading spinner"></span>
                  </div>
                </section>

                <section class="demo-control-panel ly-grid" data-testid="component-tooltips">
                  <h4>Visible tooltips</h4>
                  <div class="demo-tooltip-row ly-cluster ly-items-center">
                    <span class="${p}-tooltip ${p}-tooltip-top ${p}-tooltip-primary" role="tooltip" data-testid="tooltip-primary">Primary tip<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                    <span class="${p}-tooltip ${p}-tooltip-right ${p}-tooltip-secondary" role="tooltip" data-testid="tooltip-secondary">Context cue<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                    <span class="${p}-tooltip ${p}-tooltip-bottom ${p}-tooltip-accent" role="tooltip" data-testid="tooltip-accent">Action hint<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                  </div>
                </section>
              </div>
            </article>

            <article class="${p}-card" data-testid="component-buttons-states">
              <p class="${p}-kicker">States</p>
              <h3 class="${p}-heading">Interactive states</h3>
              <div class="demo-state-grid ly-grid">
                <button class="${p}-button" data-testid="component-button-hover">Hover target</button>
                <button class="${p}-button" data-testid="component-button-focus">Focus target</button>
                <button class="${p}-button is-active" data-testid="component-button-active" aria-pressed="true">Active pressed</button>
                <button class="${p}-button" data-testid="component-button-disabled" disabled>Disabled</button>
                <button class="${p}-button ${p}-button-primary" data-testid="component-button-busy" aria-busy="true">Busy</button>
              </div>
            </article>

            <article class="${p}-card" data-testid="component-fields">
              <p class="${p}-kicker">Fields</p>
              <h3 class="${p}-heading">Inputs and choices</h3>
              <div class="demo-form-grid ly-grid">
                <label class="${p}-field"><span class="${p}-label">Text input</span><input class="${p}-input" value="Styled input"><span class="${p}-help-text">Help text</span></label>
                <label class="${p}-field"><span class="${p}-label">Select</span><select class="${p}-select"><option>Default</option><option>Alternate</option></select></label>
                <label class="${p}-field"><span class="${p}-label">Textarea</span><textarea class="${p}-textarea">Styled textarea content.</textarea></label>
              </div>
              ${renderChoiceControls(ui, p)}
            </article>

            <article class="${p}-card" data-testid="component-badges">
              <p class="${p}-kicker">Badges</p>
              <h3 class="${p}-heading">Status badges</h3>
              <div class="demo-badge-showcase ly-grid">
                <div class="demo-badge-group ly-grid">
                  <p class="demo-badge-label">Color roles</p>
                  <div class="demo-badge-row ly-cluster ly-items-center">
                    <span class="${p}-badge">Neutral</span>
                    <span class="${p}-badge ${p}-badge-primary">Primary</span>
                    <span class="${p}-badge ${p}-badge-secondary">Secondary</span>
                    <span class="${p}-badge ${p}-badge-success">Success</span>
                    <span class="${p}-badge ${p}-badge-warning">Warning</span>
                    <span class="${p}-badge ${p}-badge-danger">Danger</span>
                  </div>
                </div>
                <div class="demo-badge-group ly-grid">
                  <p class="demo-badge-label">Workflow</p>
                  <div class="demo-badge-row ly-cluster ly-items-center">
                    <span class="${p}-badge ${p}-badge-primary">Draft</span>
                    <span class="${p}-badge ${p}-badge-secondary">Review</span>
                    <span class="${p}-badge ${p}-badge-success">Ready</span>
                    <span class="${p}-badge ${p}-badge-warning">Blocked</span>
                  </div>
                </div>
                <div class="demo-badge-group ly-grid">
                  <p class="demo-badge-label">Counts</p>
                  <div class="demo-badge-row ly-cluster ly-items-center">
                    <span class="${p}-badge">12 open</span>
                    <span class="${p}-badge ${p}-badge-primary">4 new</span>
                    <span class="${p}-badge ${p}-badge-danger">2 failed</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="${p}-card" data-testid="component-alerts">
              <p class="${p}-kicker">Alerts</p>
              <h3 class="${p}-heading">Messages</h3>
              <div class="${p}-alert ${p}-alert-success"><p class="${p}-alert-title">Success</p><p class="${p}-alert-body">The stylesheet is active.</p></div>
              <div class="${p}-alert ${p}-alert-warning"><p class="${p}-alert-title">Warning</p><p class="${p}-alert-body">Check contrast mode before release.</p></div>
              ${p === 'utility' ? '<div class="utility-alert utility-alert-info"><p class="utility-alert-title">Information</p><p class="utility-alert-body">Scheduled service details are available.</p></div>' : ''}
              <div class="${p}-alert ${p}-alert-danger"><p class="${p}-alert-title">Danger</p><p class="${p}-alert-body">Invalid state styling is visible.</p></div>
            </article>

            <article class="${p}-table-wrap demo-table-card ly-overflow-auto" tabindex="0" data-testid="component-table">
              <table class="${p}-table">
                <caption>Classed table component</caption>
                <thead><tr><th>Element</th><th>State</th><th>Coverage</th></tr></thead>
                <tbody>
                  <tr><td>Button</td><td>hover / active / disabled / busy</td><td>Classed</td></tr>
                  <tr><td>Input</td><td>hover / focus / invalid / disabled</td><td>Classed</td></tr>
                  <tr><td>Table</td><td>header / caption / row hover</td><td>Classed</td></tr>
                </tbody>
              </table>
            </article>
          </div>

          <article class="${p}-card" data-testid="marketing-components">
            <p class="${p}-eyebrow">Commercial components</p>
            <h3 class="${p}-heading">Service cards, trust strips, media, and CTA treatments</h3>
            <div class="demo-marketing-grid ly-grid">
              <article class="${p}-card ${p}-card-service">
                <img class="${p}-card-media demo-theme-art demo-theme-art-service" style="--demo-art-primary: var(--${p}-primary); --demo-art-secondary: var(--${p}-secondary); --demo-art-accent: var(--${p}-accent); --demo-art-surface: var(--${p}-surface-strong)" alt="Abstract service preview using the active theme" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cpath d='M0 290L220 120l120 82 128-110 172 150v118H0z' fill='%23ffffff' fill-opacity='.24'/%3E%3Ccircle cx='510' cy='95' r='58' fill='%23ffffff' fill-opacity='.68'/%3E%3C/svg%3E">
                <span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, 'star', '★')}</span>
                <p class="${p}-eyebrow">Service category</p>
                <h4 class="${p}-heading">Reusable service card</h4>
                <p class="${p}-copy">Media, an overlapping icon, clear hierarchy, and a focused action.</p>
                <a data-testid="marketing-primary-cta" class="${p}-button ${p}-button-primary ${p}-button-cut" href="#components">Explore</a>
              </article>

              <figure class="${p}-media-scrim">
                <img class="demo-theme-art demo-theme-art-feature" style="--demo-art-primary: var(--${p}-primary); --demo-art-secondary: var(--${p}-secondary); --demo-art-accent: var(--${p}-accent); --demo-art-surface: var(--${p}-surface-strong)" alt="Abstract media treatment using the active theme" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'%3E%3Ccircle cx='170' cy='220' r='118' fill='%23ffffff' fill-opacity='.24'/%3E%3Crect x='310' y='88' width='240' height='244' rx='28' fill='%23ffffff' fill-opacity='.42'/%3E%3C/svg%3E">
                <figcaption><p class="${p}-eyebrow">Media scrim</p><strong>Readable content over photography</strong></figcaption>
              </figure>
            </div>

            <div class="${p}-feature-strip">
              <div class="${p}-feature-item"><span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, 'check', '✓')}</span><div><strong>Trusted</strong><p>Compact proof point.</p></div></div>
              <div class="${p}-feature-item"><span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, 'diamond', '◆')}</span><div><strong>Quality</strong><p>Theme-aware treatment.</p></div></div>
              <div class="${p}-feature-item"><span class="${p}-badge-seal"><strong>15</strong><small>YEARS</small></span><div><strong>Established</strong><p>Seal-style trust mark.</p></div></div>
            </div>

            <aside class="${p}-callout-bar">
              <span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, 'arrow-right', '→')}</span>
              <div><p class="${p}-eyebrow">Call to action</p><strong>Give important next steps a dedicated visual lane.</strong></div>
              <a data-testid="marketing-secondary-cta" class="${p}-button ${p}-button-outline-heavy" href="#usage">View Usage</a>
            </aside>
          </article>
        </section>


        <section class="${p}-card" data-testid="utility-classes">
          <p class="${p}-kicker">Utilities</p>
          <h2 class="${p}-heading">Text, surfaces, layout, and style-specific utilities</h2>
          <div class="demo-token-grid ly-grid">
            <div class="demo-token-sample ly-grid" data-testid="utility-color-grid">
              <p class="demo-utility-label">Color utilities</p>
              <div class="demo-color-chip-grid ly-grid">
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-primary)"><span class="demo-color-swatch"></span><span><strong>Primary</strong><small>Action emphasis</small></span></div>
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-secondary)"><span class="demo-color-swatch"></span><span><strong>Secondary</strong><small>Supporting action</small></span></div>
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-accent)"><span class="demo-color-swatch"></span><span><strong>Accent</strong><small>Highlight note</small></span></div>
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-success)"><span class="demo-color-swatch"></span><span><strong>Success</strong><small>Positive state</small></span></div>
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-warning)"><span class="demo-color-swatch"></span><span><strong>Warning</strong><small>Needs review</small></span></div>
                <div class="demo-color-chip ly-grid ly-items-center" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-danger)"><span class="demo-color-swatch"></span><span><strong>Danger</strong><small>Blocking state</small></span></div>
              </div>
            </div>
            <div class="demo-token-sample ly-grid" data-testid="utility-surface-grid">
              <p class="demo-utility-label">Surface utilities</p>
              <div class="demo-utility-surface-grid ly-grid">
                <div class="${p}-well demo-utility-surface"><strong>Inset content</strong><span class="${p}-text-muted">Well utility</span></div>
                <div class="${p}-well ${p}-surface-sm demo-utility-surface"><strong>Compact inset</strong><span class="${p}-text-muted">Small surface</span></div>
                <div class="${p}-bg-primary ${p}-rounded-lg demo-utility-surface"><strong>Primary fill</strong><span>Background utility</span></div>
              </div>
            </div>
            <div class="demo-token-sample ly-grid" data-testid="utility-layout-sample">
              <p class="demo-utility-label">Shape and layout utilities</p>
              <div class="demo-utility-shape-grid ly-grid">
                <div class="${p}-pill demo-utility-shape"><code>.${p}-pill</code><span>Pill shape</span></div>
                <div class="${p}-rounded demo-utility-shape"><code>.${p}-rounded</code><span>Rounded corners</span></div>
                <div class="${p}-border demo-utility-shape"><code>.${p}-border</code><span>Border utility</span></div>
              </div>
              <span class="${p}-text-muted">Muted annotation</span>
              <hr class="${p}-divider">
              ${isTemplateReferenceView() ? renderStyleSpecificSurface(ui, p) : ''}
            </div>
          </div>
        </section>

        <section id="native" class="${p}-stack">
          <div class="demo-section-lede">
            <p class="${p}-kicker">Native HTML</p>
            <h2 class="${p}-heading">Unclassed elements styled by <code>data-ui</code></h2>
            <p class="${p}-copy">These samples use semantic HTML without UI Style Kit component classes, so the native fallback selectors are visible.</p>
          </div>

          <div class="demo-native-grid ly-grid">
            <section class="${p}-panel demo-native-sample" data-testid="native-text">
              <h1>Native heading h1</h1>
              <h2>Native heading h2</h2>
              <h3>Native heading h3</h3>
              <p>Paragraph text with a <a href="#native">link</a>, <mark>mark</mark>, <code>code</code>, <kbd>Ctrl</kbd>, <samp>sample</samp>, <abbr title="Accessible Rich Internet Applications">ARIA</abbr>, <small>small text</small>, <strong>strong</strong>, <em>emphasis</em>, <q>quote</q>, <ins>inserted</ins>, <del>deleted</del>, H<sub>2</sub>O, x<sup>2</sup>, <time datetime="2026-06-22">June 22, 2026</time>, <data value="20">20 tokens</data>, and <dfn>definition</dfn>.</p>
              <p><ruby>UI<rt>style</rt></ruby> <output>Output value</output></p>
              <blockquote>Native blockquote styling is part of the fallback surface.</blockquote>
              ${renderCodeBlock(
                `button:not([class]) {
  color: var(--${p}-on-primary);
}`,
                'css',
              )}
              <hr>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-lists">
              <h3>Lists and descriptions</h3>
              <ul><li>Unordered item</li><li>Second unordered item</li></ul>
              <ol><li>Ordered item</li><li>Second ordered item</li></ol>
              <menu><li>Menu item</li><li>Second menu item</li></menu>
              <dl><dt>Definition term</dt><dd>Definition description</dd><dt>Token</dt><dd>Shared color variable</dd></dl>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-media">
              <h3>Media elements</h3>
              <figure>
                <picture>
                  <img alt="Abstract style swatch" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'%3E%3Crect width='320' height='160' fill='%236f8cff'/%3E%3Ccircle cx='235' cy='78' r='46' fill='%23ffcc66'/%3E%3Cpath d='M38 116 L126 32 L188 116 Z' fill='%23ffffff' fill-opacity='.72'/%3E%3C/svg%3E">
                </picture>
                <figcaption>Figure, picture, image, and figcaption.</figcaption>
              </figure>
              <canvas class="demo-media-box demo-canvas" width="320" height="140" data-demo-canvas>Canvas preview</canvas>
              <svg class="demo-media-box" role="img" aria-label="Inline SVG sample" viewBox="0 0 320 140"><rect width="320" height="140" fill="currentColor" opacity=".12"></rect><circle cx="90" cy="70" r="42" fill="currentColor" opacity=".45"></circle><rect x="150" y="45" width="110" height="50" fill="currentColor" opacity=".28"></rect></svg>
              <video class="demo-media-box" controls></video>
              <audio controls></audio>
              <iframe class="demo-iframe" title="Inline iframe sample" srcdoc="<p>iframe preview</p>"></iframe>
              <object class="demo-object" aria-label="Object sample">Object sample</object>
              <embed class="demo-embed" title="Embed sample">
              <math><mi>x</mi><mo>=</mo><mn>2</mn></math>
            </section>

            <section class="${p}-panel demo-native-sample ly-span-full" data-testid="native-forms">
              <h3>Forms</h3>
              <fieldset>
                <legend>Native fieldset</legend>
                <div class="demo-form-grid ly-grid">
                  <label>Text <input type="text" value="Text value"></label>
                  <label>Email <input type="email" value="name@example.com"></label>
                  <label>Search <search><input type="search" value="Query"></search></label>
                  <label>Number <input type="number" value="42" data-testid="native-number"></label>
                  <label>Date <input type="date" value="2026-09-01" data-testid="native-date"></label>
                  <label>Time <input type="time" value="09:30" data-testid="native-time"></label>
                  <label>Textarea <textarea>Native textarea</textarea></label>
                  <label>Single select <select data-testid="native-select-single"><optgroup label="Available"><option>Option A</option><option selected>Option B</option><option disabled>Unavailable</option></optgroup></select></label>
                  <label>Multiple select <select multiple size="3" data-testid="native-select-multiple"><option selected>Alpha</option><option>Beta</option><option>Gamma</option></select></label>
                  <label>Valid <input class="is-valid" value="Accepted" data-testid="native-valid"></label>
                  <label>Invalid <input required aria-invalid="true" placeholder="Required" data-testid="native-invalid"></label>
                  <label>Required <input required value="Required value" data-testid="native-required"></label>
                  <label>Read only <input readonly value="Read only" data-testid="native-readonly"></label>
                  <label>Disabled <input disabled value="Disabled" data-testid="native-disabled"></label>
                  <label>Color <input type="color" value="#6f8cff" data-testid="native-color"></label>
                  <label>File <input type="file" data-testid="native-file"></label>
                </div>
                <div class="demo-inline-row ly-cluster ly-items-center">
                  <label><input type="checkbox" checked> Checked</label>
                  <label><input type="checkbox"> Unchecked</label>
                  <label><input type="checkbox" data-testid="native-checkbox-indeterminate"> Indeterminate</label>
                  <label><input type="checkbox" disabled data-testid="native-checkbox-disabled"> Disabled</label>
                  <label><input type="radio" name="native-radio-${ui}" checked> Radio A</label>
                  <label><input type="radio" name="native-radio-${ui}"> Radio B</label>
                  <label><input type="radio" name="native-radio-${ui}" disabled data-testid="native-radio-disabled"> Disabled radio</label>
                </div>
                <label>Range <input type="range" value="62" data-testid="native-range-enabled"></label>
                <label>Keyboard focus range <input type="range" value="36" data-testid="native-range-focus"></label>
                <label>Disabled range <input type="range" value="74" disabled data-testid="native-range-disabled"></label>
              </fieldset>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-buttons">
              <h3>Native buttons</h3>
              <div class="demo-button-row ly-cluster ly-items-center">
                <button>Native button</button>
                <button type="button">Hover target</button>
                <button type="button" aria-busy="true">Busy native</button>
                <button type="button" disabled>Disabled native</button>
                <input type="button" value="Input button">
                <input type="submit" value="Submit input">
                <input type="reset" value="Reset input">
              </div>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-table">
              <h3>Native table</h3>
              <div class="demo-native-table-scroll ly-overflow-auto" tabindex="0">
                <table>
                  <caption>Native table caption</caption>
                  <thead><tr><th>Element</th><th>Selector</th></tr></thead>
                  <tbody><tr><td>Table cell</td><td>td</td></tr><tr><td>Header cell</td><td>th</td></tr></tbody>
                </table>
              </div>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-disclosure-dialog">
              <h3>Disclosure and dialog</h3>
              <details open><summary>Open details summary</summary><p>Details content is styled as a native disclosure.</p></details>
              <dialog class="demo-inline-dialog" open>
                <form method="dialog">
                  <h3>Inline dialog</h3>
                  <p>This open dialog shows the native dialog surface without a modal backdrop.</p>
                  <button>Close sample</button>
                </form>
              </dialog>
              <button type="button" data-testid="native-modal-open">Open modal dialog</button>
              <dialog data-testid="native-modal-dialog">
                <form method="dialog">
                  <h3>Modal dialog</h3>
                  <p>This sample opens with <code>showModal()</code> so backdrop styling is exercised by the browser.</p>
                  <button type="submit" data-testid="native-modal-close">Close modal</button>
                </form>
              </dialog>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-meter-progress">
              <h3>Meter and progress</h3>
              <label>Progress 0% <progress value="0" max="100" data-testid="native-progress-zero">0%</progress></label>
              <label>Progress 72% <progress value="72" max="100" data-testid="native-progress-partial">72%</progress></label>
              <label>Progress 100% <progress value="100" max="100" data-testid="native-progress-complete">100%</progress></label>
              <label>Indeterminate progress <progress max="100" data-testid="native-progress-indeterminate">Loading</progress></label>
              <label>Optimum meter <meter min="0" max="100" low="35" high="75" optimum="90" value="90" data-testid="native-meter-optimum">90%</meter></label>
              <label>Suboptimum meter <meter min="0" max="100" low="35" high="75" optimum="90" value="55" data-testid="native-meter-suboptimum">55%</meter></label>
              <label>Critical meter <meter min="0" max="100" low="35" high="75" optimum="90" value="18" data-testid="native-meter-critical">18%</meter></label>
            </section>

            <section class="${p}-panel demo-native-sample" data-testid="native-semantics">
              <header><h3>Semantic regions</h3></header>
              <nav aria-label="Native region navigation"><a href="#overview" aria-current="page">Current link</a> <a href="#usage">Usage link</a></nav>
              <article><p>Native article surface</p></article>
              <aside><p>Native aside surface</p></aside>
              <address>Address block, 100 Demo Avenue</address>
              <footer><small>Footer and small text</small></footer>
              <p hidden>Hidden content remains hidden.</p>
            </section>
          </div>
        </section>

        <section id="bridge" class="${p}-card demo-bridge-preview" data-testid="bridge-preview">
          <p class="${p}-kicker">Interactive Surface Bridge</p>
          <h2 class="${p}-heading">Detached by default, attached on demand</h2>
          <p class="${p}-copy">The bridge swaps the demo stylesheet between <code>${defaultBundle}</code> and <code>${bridgeAwareBundle}</code>. When attached, interactable elements receive <code>.interactive-surface</code>, <code>data-surface-variant</code>, and <code>data-surface-level</code> hooks.</p>
          <label class="demo-switch-control usk-switch ly-cluster" data-testid="bridge-switch">
            <input id="bridgeToggle" type="checkbox" role="switch" />
            <span class="demo-switch-track usk-switch-track" data-testid="bridge-switch-track" aria-hidden="true">
              <span class="demo-switch-thumb usk-switch-thumb" data-testid="bridge-switch-thumb"></span>
            </span>
            <span class="demo-switch-copy ly-grid">
              <strong>Attach bridge</strong>
            </span>
          </label>
          <p class="usk-help-text" data-testid="bridge-status" aria-live="polite">Detached - default bundle</p>
          <div class="demo-bridge-grid ly-grid">
            <div class="interactive-surface" data-surface-variant="subtle" data-surface-level="1" data-testid="bridge-level-1"><strong>Level 1 surface</strong><small>Subtle rest layer for quiet inline interactions.</small></div>
            <div class="interactive-surface" data-surface-variant="secondary" data-surface-level="2" data-testid="bridge-level-2"><strong>Level 2 surface</strong><small>Raised state for controls, selects, and grouped actions.</small></div>
            <div class="interactive-surface" data-surface-variant="primary" data-surface-level="3" data-testid="bridge-level-3"><strong>Level 3 surface</strong><small>Prominent active state with the strongest state layer.</small></div>
          </div>
        </section>

        ${renderUsageSection(p)}
      </div>
    </section>`;

  const bridgeToggle = document.getElementById('bridgeToggle');
  bindPrimaryNav();
  bindThemeTokenControls();
  bindCodeCopyButtons();
  bindNativeDialogDemo();
  bindNativeSemanticStates();
  bindPresetSpecificDemo(ui);
  syncPrimaryNavCurrent(window.location.hash.slice(1) || 'overview');
  if (bridgeToggle) {
    bridgeToggle.checked = bridgeAttached;
    bridgeToggle.addEventListener('change', updateBridge);
  }
  drawDemoCanvas();
  updateBridge();
}

/**
 * Replaces one palette-dependent section while retaining the rest of the live demo DOM.
 * @param {string} selector Selector for the current section.
 * @param {string} markup Replacement section markup.
 * @returns {HTMLElement|null} Inserted section, or null when the current section is absent.
 */
function replaceDemoSection(selector, markup) {
  const current = main.querySelector(selector);
  if (!current) return null;

  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  const replacement = template.content.firstElementChild;
  current.replaceWith(replacement);
  return replacement;
}

/**
 * Refreshes only content whose text or controls depend on theme and mode.
 * The developer reference fixture retains full rendering because its authored boards encode mode in markup.
 * @returns {void}
 */
function refreshPalettePresentation() {
  if (isTemplateReferenceView()) {
    render();
    return;
  }

  applyPaletteSelection();
  const ui = uiSelect.value;
  const p = stylePrefixes[ui];
  const tokens = replaceDemoSection('#tokens', renderThemeTokenEditor(getActiveColorTokens()));
  replaceDemoSection('#style-specific', renderStyleSpecificGallery(ui, p));
  const usage = replaceDemoSection('#usage', renderUsageSection(p));

  bindThemeTokenControls();
  if (tokens) bindCodeCopyButtons(tokens);
  if (usage) bindCodeCopyButtons(usage);
  bindPresetSpecificDemo(ui);
  syncInteractiveSurfaceHooks(bridgeAttached);
  drawDemoCanvas();
}

/**
 * Renders the most recently requested preset after its optional module is ready.
 * Stale loads cannot replace a newer user selection.
 * @returns {Promise<void>} Resolves after the current preset is rendered.
 */
async function renderSelectedPreset() {
  const request = ++requestedRender;
  const ui = uiSelect.value;
  demoContent.setAttribute('aria-busy', 'true');
  /** Hide the previous preset's boards while the selected specimen script loads. */
  syncPresetSpecificVisibility();
  try {
    await loadPresetSpecimen(ui);
    if (request !== requestedRender || ui !== uiSelect.value) return;
    render();
  } finally {
    if (request === requestedRender) demoContent.setAttribute('aria-busy', 'false');
  }
}

/**
 * Reports an optional specimen failure without leaving an unhandled promise rejection.
 * @returns {void}
 */
function requestPresetRender() {
  renderSelectedPreset().catch((error) => {
    console.error(error);
    render();
  });
}

syncManifestSelectOptions();
applyDemoQuerySelection();
hydrateDemoIcons();

uiSelect.addEventListener('change', requestPresetRender);
themeSelect.addEventListener('change', refreshPalettePresentation);
modeSelect.addEventListener('change', refreshPalettePresentation);
window.addEventListener('hashchange', () =>
  syncPrimaryNavCurrent(window.location.hash.slice(1) || 'overview'),
);
requestPresetRender();
