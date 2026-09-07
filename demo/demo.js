/**
 * @file demo/demo.js
 * @description Demo page script for UI Style Kit CSS. Handles dynamic rendering of style presets, theme tokens, component showcases, and interactive surface hooks.
 * @license MIT
 */

const demoManifest = window.UI_STYLE_KIT_MANIFEST;

if (!demoManifest) {
  throw new Error("UI Style Kit demo manifest was not loaded before demo.js.");
}

const stylePrefixes = Object.fromEntries(demoManifest.presets.map(({ id, prefix }) => [id, prefix]));
const styleTitles = Object.fromEntries(demoManifest.presets.map(({ id, label }) => [id, label]));
const resourceLinks = [
  { label: "GitHub", href: "https://github.com/Foscat/ui-style-kit-css" },
  { label: "Wiki", href: "https://github.com/Foscat/ui-style-kit-css/wiki" },
  { label: "npm", href: "https://www.npmjs.com/package/ui-style-kit-css" },
  { label: "Interactive Surface demo", href: "https://foscat.github.io/interactive-surface-css/" },
  { label: "Layout Style demo", href: "https://foscat.github.io/layout-style-css/" }
];
const colorTokenRoles = [
  "bg",
  "surface",
  "surface-strong",
  "surface-soft",
  "text",
  "text-muted",
  "border",
  "primary",
  "primary-hover",
  "primary-text",
  "secondary",
  "secondary-hover",
  "secondary-text",
  "accent",
  "accent-text",
  "success",
  "success-text",
  "warning",
  "warning-text",
  "danger",
  "danger-text",
  "link",
  "focus"
];
const rgbChannelPattern = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;
const themeTokenOverrides = new Map();
const appliedColorTokenNames = new Set();
const stylesWithCustomChoices = new Set([
  "minimal-saas",
  "bento",
  "maximalist",
  "bauhaus",
  "tactile",
  "neumorphism",
  "retrofuturism",
  "editorial-luxe",
  "organic-modern",
  "industrial-utility",
  "technical-blueprint",
  "art-deco",
  "clay",
  "data-terminal",
  "paper-editorial",
  "neo-noir"
]);
const uiSelect = document.getElementById("uiSelect");
const themeSelect = document.getElementById("themeSelect");
const modeSelect = document.getElementById("modeSelect");
const styleKitStylesheet = document.getElementById("styleKitStylesheet");
const demoContent = document.getElementById("demoContent");
const skip = document.getElementById("skip");
const defaultBundle = styleKitStylesheet.dataset.defaultHref || styleKitStylesheet.getAttribute("href");
const bridgeAwareBundle =
  styleKitStylesheet.dataset.bridgeHref ||
  defaultBundle.replace(/ui-style-kit\.css$/, "ui-style-kit.with-bridge.css");
let bridgeAttached = false;
let copyTooltipId = 0;
let referencePalette = false;
const interactiveSurfaceSelector = [
  "a[href]",
  "button:not(:disabled)",
  "input:not([type='hidden']):not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "summary",
  "audio[controls]",
  "video[controls]"
].join(",");

/** Populates controls from the library inventory while retaining the optional palette selection. */
function syncManifestSelectOptions() {
  const currentUi = uiSelect.value || "minimal-saas";
  const currentTheme = normalizeThemeSelection(themeSelect.value);
  const currentMode = modeSelect.value || "light";

  uiSelect.replaceChildren(...demoManifest.presets.map(({ id, label, prefix }) => {
    const option = document.createElement("option");
    option.value = id;
    option.dataset.prefix = prefix;
    option.textContent = label;
    option.selected = id === currentUi;
    return option;
  }));

  themeSelect.replaceChildren(...["", ...demoManifest.themes].map((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme || "None — style defaults";
    option.selected = theme === currentTheme;
    return option;
  }));

  modeSelect.replaceChildren(...demoManifest.modes.map((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    option.selected = mode === currentMode;
    return option;
  }));
}

/**
 * Escape a string for safe insertion into HTML content, replacing special characters with their corresponding HTML entities.
 * @param {string} value - The string to escape for HTML.
 * @returns {string} - The escaped HTML string.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Treats null, empty, None, and legacy reference-palette values as no shared theme.
 * Unknown names also fall back safely instead of activating an unresolved theme seam.
 * @param {string|null|undefined} value Requested theme identifier.
 * @returns {string} A supported theme identifier, or an empty native-palette selection.
 */
function normalizeThemeSelection(value) {
  const theme = String(value ?? "").trim();
  return demoManifest.themes.includes(theme) ? theme : "";
}

/**
 * Restores a shareable demo state using only values from the public inventory.
 * The personality alias retains compatibility with existing style-review URLs.
 * @returns {void}
 */
function applyDemoQuerySelection() {
  const query = new URLSearchParams(window.location.search);
  const ui = query.get("ui") ?? query.get("personality");
  if (Object.hasOwn(stylePrefixes, ui)) uiSelect.value = ui;
  if (query.has("theme")) themeSelect.value = normalizeThemeSelection(query.get("theme"));
  if (demoManifest.modes.includes(query.get("mode"))) modeSelect.value = query.get("mode");
}

/**
 * Synchronizes root attributes, native-aware demo chrome, and per-context edits.
 * Demo aliases must not populate shared --usk-* tokens: doing so would mask the
 * preset's own fallbacks and change its native material treatment.
 * @returns {void}
 */
function applyPaletteSelection() {
  const theme = normalizeThemeSelection(themeSelect.value);
  themeSelect.value = theme;
  referencePalette = !theme;
  document.body.dataset.ui = uiSelect.value;
  document.body.dataset.mode = modeSelect.value;
  if (theme) document.body.dataset.theme = theme;
  else document.body.removeAttribute("data-theme");
  colorTokenRoles.forEach((role) => {
    document.body.style.setProperty(`--demo-${role}-rgb`, `var(--${stylePrefixes[uiSelect.value]}-${role}-rgb)`);
  });
  applyActiveTokenOverrides();
}

/** Selects the same native-palette option from every preset-specific reference button. */
function selectReferencePalette() {
  themeSelect.value = "";
  render();
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
  if (referencePalette) return `:where([data-ui="${uiSelect.value}"]:not([data-theme])[data-mode="${modeSelect.value}"])`;
  return `:where([data-ui][data-theme="${themeSelect.value}"][data-mode="${modeSelect.value}"])`;
}

function normalizeRgbChannels(value) {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);

  if (parts.length !== 3) return "";

  const channels = parts.map((part) => Number.parseInt(part, 10));
  const isConcreteRgb = channels.every((channel, index) => {
    return Number.isInteger(channel) && channel >= 0 && channel <= 255 && String(channels[index]) === parts[index];
  });

  return isConcreteRgb ? channels.join(" ") : "";
}

/**
 * Convert a string of RGB channels to a hexadecimal color string.
 * @param {string} value - The string containing RGB channels (e.g., "255 0 0").
 * @returns {string} - The corresponding hexadecimal color string (e.g., "#ff0000").
 */
function rgbChannelsToHex(value) {
  const normalized = normalizeRgbChannels(value);
  if (!normalized) return "#000000";

  return `#${normalized
    .split(" ")
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgbChannels(value) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(value).trim());
  if (!match) return "";

  return match.slice(1).map((channel) => Number.parseInt(channel, 16)).join(" ");
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
  return `--${referencePalette ? stylePrefixes[uiSelect.value] : "usk"}-${role}-rgb`;
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
      if (name.startsWith(`--${prefix}-`) && name.endsWith("-rgb")) {
        const role = name.slice(prefix.length + 3, -4);
        if (/^[a-z][a-z0-9-]*$/.test(role) && !role.startsWith("fallback-")) roles.add(role);
      }
    }
  }

  return [...roles]
    .map((role) => {
      const name = getColorTokenName(role);
      const value = normalizeRgbChannels(computedStyles.getPropertyValue(name)) ||
        (!referencePalette && normalizeRgbChannels(computedStyles.getPropertyValue(`--${prefix}-${role}-rgb`)));

      return value && rgbChannelPattern.test(value)
        ? { role, name, value }
        : null;
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
  if (!normalized || !getActiveColorTokens().some((token) => token.role === role)) return "";

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
  const declarations = tokens.map((token) => `  ${token.name}: ${token.value};`).join("\n");

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

function copyButtonMarkup(label = "Copy code") {
  const tooltipId = `demo-copy-tooltip-${copyTooltipId}`;
  copyTooltipId += 1;

  return `
    <button class="demo-copy-button" type="button" data-copy-code data-copy-tooltip-id="${tooltipId}" aria-label="${escapeHtml(label)}">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M9 3h9a2 2 0 0 1 2 2v11h-2V5H9V3Z"></path>
        <path d="M5 7h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h9V9H5Z"></path>
      </svg>
    </button>
    <span id="${tooltipId}" class="demo-copy-tooltip" aria-hidden="true">${escapeHtml(label)}</span>
  `;
}

function renderCodeBlock(code, language = "") {
  const languageClass = language ? ` class="language-${escapeHtml(language)}"` : "";

  return `
    <div class="demo-code-block" data-testid="code-block">
      <pre class="demo-code"><code${languageClass}>${escapeHtml(code)}</code></pre>
      ${copyButtonMarkup("Copy code")}
    </div>`;
}

function renderResourceLinks() {
  return `
    <div class="demo-resource-links" data-testid="resource-links" aria-label="Project resources">
      ${resourceLinks
        .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`)
        .join("")}
    </div>`;
}

function renderThemeTokenEditor(tokens) {
  const overrideCss = buildThemeOverrideCss();
  const paletteLabel = referencePalette ? `${styleTitles[uiSelect.value]} native palette` : themeSelect.value;

  return `
    <section id="tokens" class="demo-token-workbench" data-testid="theme-token-workbench">
      <div class="demo-section-lede">
        <p class="demo-token-kicker">Tokens</p>
        <h2>Active color palette workbench</h2>
        <p data-testid="palette-context">Editing <strong>${escapeHtml(paletteLabel)}</strong> / <code>${escapeHtml(modeSelect.value)}</code>. ${referencePalette ? "No shared color theme is applied; values come from this style’s native palette." : "This shared color theme applies across UI styles."}</p>
        <p>Edit the 23 RGB roles live, then copy a drop-in <code>--usk-*</code> override block. Native edits are kept per style and mode; named-theme edits follow that theme. Edits last until the page is reloaded and may affect contrast.</p>
        <p id="token-input-help">RGB values use three whole numbers from 0 to 255, separated by spaces.</p>
      </div>
      <div class="demo-token-actions">
        <button type="button" class="demo-token-copy" data-testid="copy-theme-override">Copy theme override</button>
        <button type="button" class="demo-token-reset" data-testid="reset-palette">Reset palette edits</button>
        <span class="demo-copy-status" data-token-copy-status aria-live="polite"></span>
      </div>
      <div class="demo-token-workbench-grid">
        <div class="demo-token-table" aria-label="Editable color tokens">
          ${tokens
            .map((token) => {
              const hexValue = rgbChannelsToHex(token.value);

              return `
                <div class="demo-token-row" data-token-role="${escapeHtml(token.role)}">
                  <span class="demo-token-swatch" style="--demo-token-color: rgb(${escapeHtml(token.value)})" aria-hidden="true"></span>
                  <label>
                    <span>${escapeHtml(token.name)}</span>
                    <input class="demo-token-input" type="text" value="${escapeHtml(token.value)}" aria-label="${escapeHtml(token.name)} RGB channels" aria-describedby="token-input-help">
                  </label>
                  <input class="demo-token-color" type="color" value="${escapeHtml(hexValue)}" aria-label="${escapeHtml(token.name)} color picker">
                  <button type="button" class="demo-token-reset" data-token-reset aria-label="Reset ${escapeHtml(token.role)}">Reset</button>
                </div>`;
            })
            .join("")}
        </div>
        <div class="demo-code-block demo-theme-override-block">
          <pre class="demo-code"><code data-testid="theme-override-preview">${escapeHtml(overrideCss)}</code></pre>
          ${copyButtonMarkup("Copy override")}
        </div>
      </div>
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
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

/**
 * Bind click event listeners to all code copy buttons in the document. When a button is clicked, it copies the associated code block's content to the clipboard and provides visual feedback.
 */
function bindCodeCopyButtons() {
  main.querySelectorAll("[data-copy-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      const block = button.closest(".demo-code-block");
      const code = block?.querySelector("code")?.innerText || "";
      const tooltip = document.getElementById(button.dataset.copyTooltipId);
      const originalLabel = tooltip?.textContent || "Copy code";

      await copyTextToClipboard(code);
      if (tooltip) tooltip.textContent = "Copied";
      button.classList.add("is-copied");

      window.setTimeout(() => {
        if (tooltip) tooltip.textContent = originalLabel;
        button.classList.remove("is-copied");
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

  openButton.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
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

  workbench.querySelectorAll("[data-token-role]").forEach((row) => {
    const role = row.dataset.tokenRole;
    const textInput = row.querySelector(".demo-token-input");
    const colorInput = row.querySelector(".demo-token-color");
    const swatch = row.querySelector(".demo-token-swatch");
    const syncVisuals = (value) => {
      if (!value) return;

      textInput.value = value;
      colorInput.value = rgbChannelsToHex(value);
      swatch.style.setProperty("--demo-token-color", `rgb(${value})`);
      textInput.removeAttribute("aria-invalid");
      textInput.setCustomValidity("");
    };

    textInput.addEventListener("input", () => {
      const value = setTokenOverride(role, textInput.value);
      if (!value) {
        textInput.setAttribute("aria-invalid", "true");
        textInput.setCustomValidity("Enter three whole numbers from 0 to 255, separated by spaces.");
        workbench.querySelector("[data-token-copy-status]").textContent = "Invalid RGB value. The preview keeps the last valid color.";
        return;
      }
      syncVisuals(value);
      workbench.querySelector("[data-token-copy-status]").textContent = "";
      drawDemoCanvas();
    });

    colorInput.addEventListener("input", () => {
      const value = setTokenOverride(role, hexToRgbChannels(colorInput.value));
      syncVisuals(value);
      workbench.querySelector("[data-token-copy-status]").textContent = "";
      drawDemoCanvas();
    });

    row.querySelector("[data-token-reset]").addEventListener("click", () => {
      resetTokenOverride(role);
      const token = getActiveColorTokens().find((item) => item.role === role);
      if (token) syncVisuals(token.value);
      workbench.querySelector("[data-token-copy-status]").textContent = `${role} restored.`;
      drawDemoCanvas();
    });
  });

  workbench.querySelector("[data-testid='reset-palette']").addEventListener("click", () => {
    resetPaletteOverrides();
    getActiveColorTokens().forEach((token) => {
      const row = workbench.querySelector(`[data-token-role="${token.role}"]`);
      const input = row.querySelector(".demo-token-input");
      input.value = token.value;
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
      row.querySelector(".demo-token-color").value = rgbChannelsToHex(token.value);
      row.querySelector(".demo-token-swatch").style.setProperty("--demo-token-color", `rgb(${token.value})`);
    });
    workbench.querySelector("[data-token-copy-status]").textContent = "Active palette restored. Other palette edits are unchanged.";
    drawDemoCanvas();
  });

  workbench.querySelector("[data-testid='copy-theme-override']").addEventListener("click", async () => {
    await copyTextToClipboard(buildThemeOverrideCss());
    const status = workbench.querySelector("[data-token-copy-status]");
    status.textContent = "Copied";
    window.setTimeout(() => {
      status.textContent = "";
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
      <div class="demo-inline-row">
        <label><input type="checkbox" checked> Native checkbox</label>
        <label><input type="radio" name="native-choice-${ui}" checked> Native radio</label>
        <label><input type="radio" name="native-choice-${ui}"> Native radio</label>
      </div>`;
  }

  return `
    <div class="demo-inline-row">
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
  return new URLSearchParams(window.location.search).get("view") === "reference";
}

/**
 * Renders the selected authored reference board, shared by fixtures and feature excerpts.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Original reference markup, or an empty string when none exists.
 */
function renderActiveTemplateSpecimen(ui, p) {
  const localRenderers = {
    tactile: renderTactileTemplateSpecimen,
    maximalist: renderMaximalistTemplateSpecimen,
    cyberpunk: renderCyberpunkTemplateSpecimen,
    "retro-glass": renderRetroGlassTemplateSpecimen,
    "technical-blueprint": renderBlueprintTemplateSpecimen,
    "industrial-utility": renderIndustrialTemplateSpecimen,
    "paper-editorial": renderPaperEditorialTemplateSpecimen
  };
  if (localRenderers[ui]) return localRenderers[ui](ui, p);
  const modules = {
    "art-deco": window.ArtDecoSpecimen,
    "editorial-luxe": window.EditorialLuxSpecimen,
    "neo-noir": window.NeoNoirSpecimen,
    clay: window.ClaySpecimen,
    "organic-modern": window.OrganicSpecimen,
    bento: window.BentoSpecimen,
    bauhaus: window.BauhausSpecimen
  };
  return modules[ui]?.render(ui, modeSelect.value, referencePalette) || "";
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
    : "";
}

/**
 * Selects explicitly authored, non-nesting excerpt boundaries, not arbitrary HTML tags.
 * The same component markup is used in both the gallery and its original reference board.
 * @param {string} markup Authored template markup.
 * @param {string} kind Boundary kind: feature or support.
 * @returns {string} Concatenated feature fragments.
 */
function extractStyleFeatures(markup, kind = "feature") {
  const boundary = new RegExp(`<!--demo-style-${kind}-->([\\s\\S]*?)<!--/demo-style-${kind}-->`, "g");
  return [...markup.matchAll(boundary)].map((match) => match[1]).join("");
}

/**
 * Showcases distinctive preset components inside the shared demo navigation and palette.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Accessible, curated component gallery.
 */
function renderStyleSpecificGallery(ui, p) {
  if (isTemplateReferenceView()) return "";
  const specimen = renderActiveTemplateSpecimen(ui, p);
  const features = extractStyleFeatures(specimen);
  const industrial = ui === "industrial-utility";
  return `<section id="style-specific" class="${p}-card" aria-labelledby="style-specific-heading">
    <p class="${p}-kicker">${styleTitles[ui]}</p>
    <h3 id="style-specific-heading" class="${p}-heading">Style-specific components</h3>
    <p class="${p}-copy">${industrial
      ? "Try the switchgear, key switch, guarded stop, and alarm acknowledgment. These are local UI demonstrations. No equipment is connected."
      : "Distinctive components and surface treatments from this preset, using the selected palette and mode."}</p>
    <div class="demo-style-features${industrial ? " demo-industrial-utility-specimen" : ""}"${industrial ? ' id="industrial-utility-template"' : ""} data-preset-only="${ui}">
      ${features ? `<div class="demo-style-feature-grid">${features}</div>` : ""}
      ${extractStyleFeatures(specimen, "support")}
      ${industrial ? "" : renderStyleSpecificSurface(ui, p)}
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
  const noir = range.matches(".noir-range");
  const prefix = noir ? "noir" : range.matches(".rg-range") ? "rg" : range.matches(".blueprint-range") ? "blueprint" : "clay";
  const track = ["rg", "blueprint"].includes(prefix) ? range : range.parentElement;
  track.style.setProperty(`--${prefix}-value`, `${fraction * 100}%`);
  if (noir) track.style.setProperty("--noir-position", String(fraction));
  range.parentElement.querySelector("output").value = noir ? `${value > 0 ? "+" : ""}${value.toFixed(1)}` : range.value;
}

/** Binds the small set of interactions retained outside their full reference boards. */
function bindStyleSpecificGallery() {
  const root = document.querySelector("#style-specific .demo-style-features");
  if (!root) return;
  root.querySelectorAll(".noir-range, .clay-range input, .rg-range, .blueprint-range").forEach((range) => {
    updateStyleFeatureRange(range);
    range.addEventListener("input", () => updateStyleFeatureRange(range));
  });
  const workflow = [...root.querySelectorAll("[data-noir-workflow]")];
  workflow.forEach((button, index) => button.addEventListener("click", () => {
    workflow.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    root.querySelectorAll(".noir-step").forEach((step, stepIndex) => {
      if (stepIndex === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  }));
}

/**
 * Renders additional public surface utilities without reproducing a full reference page.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Preset-specific surface samples.
 */
function renderStyleSpecificSurface(ui, p) {
  const extras = {
    "minimal-saas": `
      <div class="${p}-metric"><span class="${p}-metric-value">98%</span><span class="${p}-metric-label">metric</span></div>
      <div class="${p}-empty-state"><h3 class="${p}-heading">Empty state</h3><p class="${p}-copy">No records need attention.</p></div>`,
    bento: `
      <div class="${p}-grid-feature">
        <div class="${p}-tile ${p}-tile-lg"><span class="${p}-stat-value">42</span><span class="${p}-stat-label">large tile</span></div>
        <div class="${p}-tile ${p}-tile-sm"><span class="${p}-stat-value">8</span><span class="${p}-stat-label">small tile</span></div>
      </div>`,
    maximalist: `
      <span class="${p}-sticker">Sticker</span>
      <div class="${p}-callout ${p}-wiggle">Playful callout motion utility</div>`,
    bauhaus: `
      <div class="${p}-composition"><div class="${p}-block">Block</div><div class="${p}-rail">Rail</div></div>`,
    tactile: `
      <div class="${p}-bevel">Beveled surface</div>
      <button class="${p}-button ${p}-pressed">Pressed surface</button>
      <span class="${p}-knob" aria-hidden="true"></span>`,
    neumorphism: `
      <div class="${p}-card">Raised surface</div>
      <div class="${p}-well">Inset surface</div>
      <button class="${p}-button" type="button" aria-pressed="true">Pressed surface</button>`,
    retrofuturism: `
      <div class="${p}-panel"><span class="${p}-badge">Mission 2084</span><p class="${p}-copy">Mission telemetry</p></div>
      <div class="${p}-well">Instrument-style surface</div>`,
    brutalism: `
      <button class="${p}-button ${p}-pressed">Pressed block</button>`,
    cyberpunk: `
      <div class="${p}-console"><code>console.surface.ready()</code></div>`,
    y2k: `
      <div class="${p}-bubble">Bubble surface</div>`,
    "retro-glass": `
      <div class="${p}-console"><code>glass.surface.ready()</code></div>`,
    "editorial-luxe": `
      <div class="${p}-metric"><span class="${p}-metric-value">01</span><span class="${p}-metric-label">Editorial measure</span></div>
      <div class="${p}-well">Hairline framing and serif-led hierarchy.</div>`,
    "organic-modern": `
      <div class="${p}-metric"><span class="${p}-metric-value">84%</span><span class="${p}-metric-label">Natural balance</span></div>
      <div class="${p}-well">Biomorphic surfaces with soft layered depth.</div>`,
    "industrial-utility": `
      <div class="${p}-metric"><span class="${p}-metric-value">READY</span><span class="${p}-metric-label">System status</span></div>
      <div class="${p}-well">Operational framing and compact equipment-style controls.</div>`,
    "technical-blueprint": `
      <div class="${p}-metric"><span class="${p}-metric-value">A-04</span><span class="${p}-metric-label">Drawing reference</span></div>
      <div class="${p}-empty-state"><strong>No drawings in this package</strong><span>Add a drawing to begin the review.</span></div>
      <pre class="${p}-code"><code>--blueprint-grid-size: 16px;
--blueprint-line-heavy: 2px;
--blueprint-control-height: 36px;</code></pre>
      <blockquote class="${p}-quote">Line weight and section hatching communicate state.</blockquote>`,
    "art-deco": `
      <div class="${p}-metric"><span class="${p}-metric-value">◆</span><span class="${p}-metric-label">Deco detail</span></div>
      <div class="${p}-well">Symmetry, double framing, and geometric ornament.</div>`,
    clay: `
      <div class="${p}-metric"><span class="${p}-metric-value">3D</span><span class="${p}-metric-label">Sculpted surface</span></div>
      <div class="${p}-well">Rounded dimensional controls with friendly elevation.</div>`,
    "data-terminal": `
      <div class="${p}-metric"><span class="${p}-metric-value">42ms</span><span class="${p}-metric-label">Telemetry</span></div>
      <div class="${p}-well"><code>monitor.status = nominal;</code></div>`,
    "paper-editorial": `
      <div class="${p}-metric"><span class="${p}-metric-value">A1</span><span class="${p}-metric-label">Edition</span></div>
      <div class="${p}-well">Print-inspired rules, paper cues, and editorial hierarchy.</div>`,
    "neo-noir": `
      <div class="${p}-metric"><span class="${p}-metric-value">20:45</span><span class="${p}-metric-label">After dark</span></div>
      <div class="${p}-well">Cinematic framing with restrained atmospheric glow.</div>`
  };

  return extras[ui] ? `<div data-preset-only="${ui}">${extras[ui]}</div>` : "";
}

/**
 * Renders a vendored Lucide icon for the Maximalist reference specimen.
 *
 * @param {string} name Vendored Lucide icon name.
 * @returns {string} Decorative SVG wrapper or an empty wrapper when unavailable.
 */
function maximalistIcon(name) {
  return `<span class="demo-maximalist-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS?.[name] || ""}</span>`;
}

/**
 * Renders the retained Maximalist component board with public max-* classes.
 * The board groups every supported component family while leaving color paint
 * on semantic tokens so explicit library themes continue to take priority.
 *
 * @param {string} ui Active preset identifier.
 * @returns {string} Complete Maximalist specimen markup or an empty string.
 */
function renderMaximalistTemplateSpecimen(ui) {
  if (ui !== "maximalist") return "";

  const icon = maximalistIcon;

  return `
    <section class="max-card demo-maximalist-specimen" data-testid="maximalist-template-specimen" aria-labelledby="maximalist-specimen-title">
      <header class="demo-maximalist-masthead">
        <div>
          <span class="max-sticker">Component collection / 01</span>
          <h2 class="max-title" id="maximalist-specimen-title">Make some UI noise!</h2>
          <p class="max-copy">A dense pop-collage reference board for the complete Maximalist component surface.</p>
        </div>
        <span class="max-badge-seal">Maximal<br>energy</span>
      </header>

      <div class="demo-maximalist-board">
        <article class="max-panel demo-maximalist-family" data-testid="maximalist-specimen-actions-buttons">
          <h3 class="max-heading"><span class="max-kicker">Actions &amp; buttons</span></h3>
          <div class="demo-maximalist-action-stack">
            <button class="max-button max-button-primary" type="button">Launch it ${icon("arrow-right")}</button>
            <button class="max-button max-button-secondary" type="button">Make a draft ${icon("arrow-right")}</button>
            <button class="max-button max-button-danger" type="button">Delete draft ${icon("trash-2")}</button>
            <button class="max-button" type="button">Neutral action</button>
            <button class="max-button max-button-ghost" type="button">Ghost action</button>
            <button class="max-button max-button-primary" type="button" aria-busy="true" data-max-state="busy">Syncing</button>
            <button class="max-button" type="button" disabled data-max-state="disabled">Disabled</button>
            <button class="max-icon-button" type="button" aria-label="Search collection">${icon("search")}</button>
          </div>
          <div class="demo-maximalist-state-grid" aria-label="Button state examples">
            <button class="max-button" type="button">Default</button>
            <button class="max-button is-hover" type="button" data-max-state="hover">Hover</button>
            <button class="max-button is-focus" type="button" data-max-state="focus">Focus</button>
            <button class="max-button" type="button" aria-pressed="true" data-max-state="pressed">Pressed</button>
          </div>
          <hr class="max-divider">
          <div class="demo-badge-row" aria-label="Badge examples">
            <span class="max-badge max-badge-danger">New</span>
            <span class="max-badge max-badge-success">Live</span>
            <span class="max-badge max-badge-warning">Beta</span>
            <span class="max-badge max-badge-secondary">Info</span>
          </div>
          <div class="max-alert" role="status">
            <strong class="max-alert-title">Heads up!</strong>
            <p class="max-alert-body">Your collection is almost ready to hit the world.</p>
          </div>
          <div class="max-tooltip" role="tooltip"><span class="max-tooltip-arrow"></span>Tiny hint. Big personality.</div>
          <div class="demo-maximalist-loading"><span class="max-spinner max-spinner-lg" role="status" aria-label="Loading"></span><span class="max-sticker">78% ready</span></div>
        </article>

        <article class="max-panel demo-maximalist-family" data-testid="maximalist-specimen-forms-choices">
          <h3 class="max-heading"><span class="max-kicker">Form controls</span></h3>
          <div class="demo-maximalist-form-grid">
            <label class="max-field"><span class="max-label">Campaign name</span><input class="max-input" value="Make Some Noise"></label>
            <label class="max-field"><span class="max-label">Email</span><input class="max-input" type="email" value="hello@studio.com"></label>
            <label class="max-field"><span class="max-label">Password</span><input class="max-input" type="password" value="loudideas"></label>
            <label class="max-field demo-maximalist-wide"><span class="max-label">Search</span><input class="max-input" type="search" placeholder="Search campaigns..."></label>
            <label class="max-field demo-maximalist-wide"><span class="max-label">Website</span><input class="max-input" type="url" value="https://pop.example"></label>
            <label class="max-field"><span class="max-label">Number</span><input class="max-input" type="number" value="1280"></label>
            <label class="max-field"><span class="max-label">Date</span><input class="max-input" type="date" value="2026-09-06"></label>
            <label class="max-field"><span class="max-label">Time</span><input class="max-input" type="time" value="14:30"></label>
            <label class="max-field demo-maximalist-wide"><span class="max-label">Select menu</span><select class="max-select"><option>Electric</option><option>Chaos</option><option>Chill</option></select></label>
            <label class="max-field demo-maximalist-wide"><span class="max-label">Notes</span><textarea class="max-textarea">Bold colors. Loud ideas. Made to stand out.</textarea></label>
            <label class="max-field demo-maximalist-wide"><span class="max-label">File</span><input class="max-input" type="file"></label>
          </div>
          <hr class="max-divider">
          <div class="demo-maximalist-choice-grid">
            <label class="max-check"><input type="checkbox" checked><span class="max-check-control"></span><span>Checked</span></label>
            <label class="max-check"><input type="checkbox"><span class="max-check-control"></span><span>Unlisted</span></label>
            <label class="max-radio"><input type="radio" name="max-visibility" checked><span class="max-radio-control"></span><span>Public</span></label>
            <label class="max-radio"><input type="radio" name="max-visibility"><span class="max-radio-control"></span><span>Private</span></label>
            <label class="max-switch"><input type="checkbox" checked><span class="max-switch-track"><span class="max-switch-thumb"></span></span><span>Launch mode</span></label>
          </div>
          <label class="max-field"><span class="max-label">Campaign intensity</span><input type="range" min="0" max="100" value="72"></label>
          <div class="max-progress" role="progressbar" aria-label="Audience readiness" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68"><div class="max-progress-bar" style="--max-progress-value: 68%"></div></div>
          <meter min="0" max="100" low="35" high="75" optimum="90" value="78">78%</meter>
        </article>

        <article class="max-panel demo-maximalist-family" data-testid="maximalist-specimen-status-feedback">
          <h3 class="max-heading"><span class="max-kicker">Status &amp; feedback</span></h3>
          <div class="demo-badge-row">
            <span class="max-badge">Neutral</span><span class="max-badge max-badge-success">Success</span><span class="max-badge max-badge-warning">Review</span><span class="max-badge max-badge-secondary">Info</span><span class="max-badge max-badge-danger">Danger</span>
          </div>
          <ul class="demo-maximalist-status-list">
            <li><span class="demo-maximalist-status-dot is-success"></span>Ready to make noise</li>
            <li><span class="demo-maximalist-status-dot is-info"></span>Assets syncing</li>
            <li><span class="demo-maximalist-status-dot is-warning"></span>Needs one more review</li>
            <li><span class="demo-maximalist-status-dot is-danger"></span>Big energy detected</li>
          </ul>
          <ol class="demo-maximalist-steps" aria-label="Launch progress">
            <li class="is-complete"><strong>Connect</strong><span>Completed</span></li>
            <li class="is-current"><strong>Build</strong><span>In progress</span></li>
            <li><strong>Launch</strong><span>Pending</span></li>
          </ol>
          <dialog class="max-panel demo-maximalist-dialog" open aria-labelledby="max-dialog-title">
            <button class="max-icon-button" type="button" aria-label="Close dialog">${icon("trash-2")}</button>
            <h4 class="max-heading" id="max-dialog-title">Delete draft?</h4>
            <p class="max-copy">This will remove the saved draft.</p>
            <div class="max-cluster"><button class="max-button" type="button">Keep it</button><button class="max-button max-button-danger" type="button">Delete</button></div>
          </dialog>
          <details class="max-well"><summary>System details</summary><p class="max-copy">Disclosure rows retain a crisp information hierarchy.</p></details>
        </article>

        <article class="max-panel demo-maximalist-family demo-maximalist-data" data-testid="maximalist-specimen-data-product">
          <h3 class="max-heading"><span class="max-kicker">Data table</span></h3>
          <div class="max-table-wrap">
            <table class="max-table">
              <thead><tr><th>Collection</th><th>Status</th><th>Owner</th><th>Launch</th></tr></thead>
              <tbody>
                <tr><td>Neon Drop</td><td><span class="max-badge max-badge-success">Live</span></td><td>M. Cruz</td><td>Sep 06</td></tr>
                <tr><td>Street Type</td><td><span class="max-badge max-badge-secondary">Building</span></td><td>J. Kim</td><td>Sep 08</td></tr>
                <tr><td>Noise Makers</td><td><span class="max-badge max-badge-warning">Review</span></td><td>A. Lee</td><td>Sep 11</td></tr>
                <tr><td>Sticker Pack</td><td><span class="max-badge max-badge-danger">Draft</span></td><td>R. Chen</td><td>Sep 13</td></tr>
              </tbody>
            </table>
          </div>
          <section class="max-card max-card-service demo-maximalist-product-card">
            <span class="max-sticker">Limited drop</span>
            <div class="max-icon-medallion">${icon("circle-check")}</div>
            <p class="max-kicker">Product card</p>
            <h4 class="max-heading">Noise Maker Kit</h4>
            <p class="max-copy">A loud little launch system for teams that refuse to blend in.</p>
            <div class="max-feature-strip">
              <div class="max-feature-item"><strong>12 pop-ready blocks</strong></div>
              <div class="max-feature-item"><strong>Accessible interactions</strong></div>
            </div>
            <div class="demo-maximalist-price"><strong>$29</strong><span>/ drop</span><button class="max-button max-button-primary" type="button">Grab the kit</button></div>
          </section>
        </article>

        <article class="max-panel demo-maximalist-family demo-maximalist-foundations" data-testid="maximalist-specimen-navigation-foundations">
          <h3 class="max-heading"><span class="max-kicker">Navigation patterns</span></h3>
          <nav class="max-nav" aria-label="Maximalist reference navigation">
            <a class="max-nav-link is-active" href="#components" aria-current="page">Summary</a>
            <a class="max-nav-link" href="#native">Activity</a>
            <a class="max-nav-link" href="#usage">Assets</a>
          </nav>
          <nav class="demo-maximalist-pagination" aria-label="Collection pages">
            <a class="max-button" href="#components" aria-label="Previous page">Previous</a>
            <a class="max-button max-button-secondary" href="#components" aria-current="page">1</a>
            <a class="max-button" href="#components">2</a>
            <a class="max-button" href="#components" aria-label="Next page">Next</a>
          </nav>
          <hr class="max-divider">
          <p class="max-kicker">Palette &amp; typography</p>
          <div class="demo-maximalist-palette" aria-label="Semantic palette">
            <span data-color="primary">Primary</span><span data-color="secondary">Secondary</span><span data-color="accent">Accent</span><span data-color="success">Success</span><span data-color="warning">Warning</span><span data-color="danger">Danger</span>
          </div>
          <div class="max-well"><h4 class="max-heading">Signal heading</h4><p class="max-copy">Readable system copy carries the supporting context.</p></div>
          <div class="max-callout-bar"><span class="max-icon-medallion">${icon("info")}</span><div><strong>Visible focus</strong><p class="max-copy">Text and color reinforce every state.</p></div><button class="max-button max-button-outline-heavy" type="button">Review</button></div>
        </article>
      </div>
    </section>`;
}

/**
 * Renders a licensed Lucide icon for the retained Tactile workspace specimen.
 *
 * @param {string} name - Vendored Lucide icon name.
 * @returns {string} Decorative icon markup supplied by the local icon bundle.
 */
function tactileWorkspaceIcon(name) {
  return `<span class="tactile-workspace-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS?.[name] || ""}</span>`;
}

/**
 * Renders the retained Tactile workspace as reusable public tactile-* elements.
 * The specimen intentionally relies on the preset's material tokens so an
 * explicit library theme repaints it without changing its physical geometry.
 *
 * @param {string} ui - Active preset identifier.
 * @returns {string} Complete Tactile workspace markup or an empty string.
 */
function renderTactileTemplateSpecimen(ui) {
  if (ui !== "tactile") return "";

  const icon = tactileWorkspaceIcon;

  return `
    <section class="tactile-workspace-shell demo-tactile-specimen" data-testid="tactile-template-specimen" aria-label="Tactile workspace reference">
      <aside class="tactile-workspace-sidebar">
        <a class="tactile-workspace-brand" href="#overview" aria-label="Northfield workspace home">
          <span class="tactile-workspace-brand-mark" aria-hidden="true">N</span>
          <span><strong>Northfield</strong><small>Workspace</small></span>
        </a>
        <nav class="tactile-workspace-menu" aria-label="Workspace settings navigation">
          <a class="tactile-workspace-link is-active" href="#tactile-profile" aria-current="page">${icon("settings")}<span>Account</span><small>01</small></a>
          <a class="tactile-workspace-link" href="#tactile-preferences">${icon("circle-check")}<span>Preferences</span><small>02</small></a>
          <a class="tactile-workspace-link" href="#tactile-security">${icon("paperclip")}<span>Security</span><small>03</small></a>
          <a class="tactile-workspace-link" href="#tactile-readiness">${icon("info")}<span>Readiness</span><small>04</small></a>
        </nav>
        <div class="tactile-workspace-sidebar-note">
          <span class="tactile-badge tactile-badge-success">Operational</span>
          <p>All workspace systems are available.</p>
        </div>
      </aside>

      <div class="tactile-workspace-main">
        <header class="tactile-workspace-header">
          <div>
            <p class="tactile-kicker">Account controls</p>
            <h2 class="tactile-workspace-title">Workspace settings</h2>
            <p class="tactile-copy">Manage the details and operating preferences for Northfield Studio.</p>
          </div>
          <button class="tactile-icon-button" type="button" aria-label="Search workspace">${icon("search")}</button>
        </header>

        <div class="tactile-workspace-body">
          <section class="tactile-workspace-settings" id="tactile-profile" aria-label="Workspace configuration">
            <div class="tactile-workspace-row" data-testid="tactile-setting-row">
              <div><h3>Profile</h3><p>Public workspace identity.</p></div>
              <div class="tactile-workspace-fields">
                <label class="tactile-field"><span class="tactile-label">Workspace name</span><input class="tactile-input" value="Northfield Studio"></label>
                <label class="tactile-field"><span class="tactile-label">Contact email</span><input class="tactile-input" type="email" value="studio@northfield.co"></label>
              </div>
            </div>

            <div class="tactile-workspace-row" data-testid="tactile-setting-row">
              <div><h3>Locale</h3><p>Language and working time.</p></div>
              <div class="tactile-workspace-fields">
                <label class="tactile-field"><span class="tactile-label">Language</span><select class="tactile-select"><option>English (US)</option><option>English (UK)</option></select></label>
                <label class="tactile-field"><span class="tactile-label">Time zone</span><select class="tactile-select"><option>Central Time (UTC-6)</option><option>Eastern Time (UTC-5)</option></select></label>
              </div>
            </div>

            <div class="tactile-workspace-row" id="tactile-preferences" data-testid="tactile-setting-row">
              <div><h3>Preferences</h3><p>Mechanical display controls.</p></div>
              <div class="tactile-workspace-switches">
                <label class="tactile-switch"><input type="checkbox" role="switch" aria-label="Compact density"><span class="tactile-switch-track" aria-hidden="true"><span class="tactile-switch-thumb"></span></span><span><strong>Compact density</strong><small>Fit more controls on each panel.</small></span></label>
                <label class="tactile-switch"><input type="checkbox" role="switch" aria-label="Status sounds" checked><span class="tactile-switch-track" aria-hidden="true"><span class="tactile-switch-thumb"></span></span><span><strong>Status sounds</strong><small>Play a subtle completion cue.</small></span></label>
              </div>
            </div>

            <div class="tactile-workspace-row" id="tactile-security" data-testid="tactile-setting-row">
              <div><h3>Security</h3><p>Current session protection.</p></div>
              <div class="tactile-workspace-security">
                <div><span class="tactile-badge tactile-badge-success">Verified</span><strong>Two-step verification is active</strong><small>Last reviewed today at 09:30.</small></div>
                <button class="tactile-button tactile-button-secondary" type="button">Review access</button>
              </div>
            </div>
          </section>

          <aside class="tactile-workspace-readiness" id="tactile-readiness">
            <p class="tactile-label">Workspace readiness</p>
            <div class="tactile-workspace-gauge" role="meter" aria-label="Workspace readiness" aria-valuemin="0" aria-valuemax="100" aria-valuenow="78">
              <span><strong>78</strong><small>Ready</small></span>
            </div>
            <div class="tactile-workspace-gauge-key"><span>Setup</span><span>Operational</span></div>
            <div class="tactile-alert tactile-alert-warning">
              <strong class="tactile-alert-title">One item needs review</strong>
              <p class="tactile-alert-body">Confirm recovery access before inviting the wider team.</p>
            </div>
          </aside>
        </div>

        <footer class="tactile-workspace-shelf" data-testid="tactile-action-shelf">
          <div class="tactile-workspace-progress">
            <span><strong>Configuration progress</strong><small>Six of eight checks complete</small></span>
            <div class="tactile-progress" role="progressbar" aria-label="Configuration progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="75"><div class="tactile-progress-bar" style="width: 75%"></div></div>
          </div>
          <div class="tactile-cluster">
            <button class="tactile-button tactile-button-secondary" type="button">Discard</button>
            <button class="tactile-button tactile-button-primary" type="button">Save changes</button>
          </div>
        </footer>
      </div>
    </section>`;
}

/**
 * Renders the retained Cyberpunk template specimen with public cyber-* classes.
 * @param {string} ui - Active style preset identifier.
 * @param {string} p - Active style prefix.
 * @returns {string} Cyberpunk specimen markup or an empty string for other presets.
 */
function renderCyberpunkTemplateSpecimen(ui, p) {
  if (ui !== "cyberpunk") return "";

  return `
        <section class="${p}-card demo-cyberpunk-specimen" data-preset-only="cyberpunk" data-testid="cyberpunk-template-specimen">
          <p class="${p}-overline">Retained template surface</p>
          <h2 class="${p}-section-title">Cyberpunk control board</h2>
          <p class="${p}-copy demo-section-lede">The Cyberpunk preset exposes the retained template as first-class <code>cyber-*</code> components that keep identical geometry across light, dark, contrast, and custom token themes.</p>

          <div class="demo-cyberpunk-grid">
            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-action-states">
              <h3 class="${p}-section-title">Action states</h3>
              <div class="demo-cyberpunk-state-grid">
                <button class="${p}-button ${p}-button-primary">Primary</button>
                <button class="${p}-button ${p}-button-secondary">Secondary</button>
                <button class="${p}-button ${p}-button-ghost">Ghost</button>
                <button class="${p}-button ${p}-button-danger">Danger</button>
                <button class="${p}-button is-hover">Hover</button>
                <button class="${p}-button is-pressed" aria-pressed="true">Pressed</button>
                <button class="${p}-button ${p}-button-primary is-loading" aria-busy="true">Loading</button>
                <button class="${p}-button is-disabled" disabled>Disabled</button>
                <button class="${p}-icon-button" aria-label="Open command palette">CMD</button>
              </div>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-form-inputs">
              <h3 class="${p}-section-title">Form inputs</h3>
              <div class="demo-cyberpunk-form-grid">
                <label class="${p}-field">
                  <span class="${p}-label">Operator</span>
                  <span class="${p}-input-wrap">
                    <input class="${p}-input" value="Case Vega">
                    <span class="${p}-input-icon" aria-hidden="true">@</span>
                  </span>
                  <span class="${p}-helper">Use the active shift identifier.</span>
                </label>
                <label class="${p}-field">
                  <span class="${p}-label">Access code</span>
                  <span class="${p}-input-wrap">
                    <input class="${p}-input" aria-invalid="true" value="VX-04">
                    <span class="${p}-input-icon" aria-hidden="true">#</span>
                  </span>
                  <span class="${p}-error-text">Sector code is locked.</span>
                </label>
                <label class="${p}-field demo-cyberpunk-wide">
                  <span class="${p}-label">Dispatch note</span>
                  <textarea class="${p}-textarea">Hold lane three until the signal clears.</textarea>
                  <span class="${p}-helper">Helper and error states use non-color cues.</span>
                </label>
              </div>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-choices-tags">
              <h3 class="${p}-section-title">Choices and tags</h3>
              <div class="demo-cyberpunk-choice-grid">
                <label class="${p}-choice">
                  <input type="checkbox" checked>
                  <span><strong>Route active</strong><span>Telemetry lane is accepting updates.</span></span>
                </label>
                <label class="${p}-choice">
                  <input type="radio" name="cyber-template-route" checked>
                  <span><strong>North relay</strong><span>Primary connection selected.</span></span>
                </label>
                <label class="${p}-switch">
                  <input type="checkbox" role="switch" checked>
                  <span class="${p}-switch-track"><span class="${p}-switch-thumb"></span></span>
                  <span>Auto sync</span>
                </label>
              </div>
              <div class="${p}-tags" aria-label="Cyberpunk status tags">
                <span class="${p}-chip">Online</span>
                <span class="${p}-chip" style="--cyber-chip-color: var(--cyber-warning)">Review</span>
                <span class="${p}-chip" style="--cyber-chip-color: var(--cyber-danger)">Critical</span>
              </div>
              <div class="${p}-segmented" role="group" aria-label="Density mode">
                <button class="${p}-segment is-active" type="button" aria-pressed="true">Dense</button>
                <button class="${p}-segment" type="button" aria-pressed="false">Scan</button>
                <button class="${p}-segment" type="button" aria-pressed="false">Quiet</button>
              </div>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-select-upload">
              <h3 class="${p}-section-title">Select and upload</h3>
              <label class="${p}-field">
                <span class="${p}-label">Relay channel</span>
                <span class="${p}-input-wrap">
                  <select class="${p}-select">
                    <option>East perimeter</option>
                    <option>South freight lane</option>
                    <option>Archive uplink</option>
                  </select>
                  <span class="${p}-input-icon" aria-hidden="true">v</span>
                </span>
              </label>
              <label class="${p}-file">
                <input class="${p}-sr-only" type="file" aria-label="Upload manifest">
                <span><strong>Upload manifest</strong><span>CSV, JSON, or TXT up to 8 MB</span></span>
              </label>
              <div class="${p}-dropdown" role="listbox" aria-label="Cyberpunk dropdown sample">
                <button class="${p}-option is-active" type="button" role="option" aria-selected="true">Sync queue <span>42ms</span></button>
                <button class="${p}-option" type="button" role="option">Manual review <span>3</span></button>
                <button class="${p}-option" type="button" role="option">Archive lane <span>Idle</span></button>
              </div>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-range-progress">
              <h3 class="${p}-section-title">Range, progress, meter, stepper</h3>
              <label class="${p}-field">
                <span class="${p}-label">Signal load</span>
                <input class="${p}-range" type="range" min="0" max="100" value="64" aria-label="Signal load">
              </label>
              <label class="${p}-field">
                <span class="${p}-label">Critical threshold</span>
                <input class="${p}-range ${p}-range-critical" type="range" min="0" max="100" value="82" aria-label="Critical threshold">
              </label>
              <div class="${p}-progress ${p}-progress-magenta" role="progressbar" aria-label="Queue progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="74"><div class="${p}-progress-bar" style="--${p}-progress-value: 74%"></div></div>
              <div class="${p}-meter" role="meter" aria-label="Thermal load" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68" style="--cyber-meter-value: 68%"></div>
              <ol class="${p}-stepper" aria-label="Cyberpunk stepper">
                <li class="${p}-step is-active" data-step="01"><span><strong>Scan</strong><span class="${p}-text-muted">Read live status.</span></span></li>
                <li class="${p}-step" data-step="02"><span><strong>Route</strong><span class="${p}-text-muted">Assign operator lane.</span></span></li>
                <li class="${p}-step" data-step="03"><span><strong>Commit</strong><span class="${p}-text-muted">Lock dispatch batch.</span></span></li>
              </ol>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-alerts-loading">
              <h3 class="${p}-section-title">Alerts, toasts, loading</h3>
              <div class="${p}-alert ${p}-alert-warning" role="status"><p class="${p}-alert-title">Warning</p><p class="${p}-alert-body">Power draw is above shift target.</p></div>
              <div class="${p}-toast" role="status">
                <strong>Toast notification</strong>
                <span class="${p}-text-muted">Routing table refreshed 12 seconds ago.</span>
              </div>
              <span class="${p}-spinner" role="status" aria-label="Cyberpunk loading spinner"></span>
              <span class="${p}-skeleton" style="min-block-size: 2.75rem" aria-hidden="true"></span>
              <span class="${p}-skeleton" style="inline-size: 72%" aria-hidden="true"></span>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-navigation">
              <h3 class="${p}-section-title">Navigation</h3>
              <nav class="${p}-breadcrumb" aria-label="Cyberpunk breadcrumb">
                <a href="#overview">Grid</a>
                <a href="#components">Console</a>
                <span>Relay 04</span>
              </nav>
              <div class="${p}-tabs" role="tablist" aria-label="Cyberpunk tabs">
                <button class="${p}-tab is-active" type="button" role="tab" aria-selected="true">Live</button>
                <button class="${p}-tab" type="button" role="tab" aria-selected="false">Logs</button>
                <button class="${p}-tab" type="button" role="tab" aria-selected="false">Audit</button>
              </div>
              <nav class="${p}-pagination" aria-label="Cyberpunk pagination">
                <a class="${p}-pagination-page" href="#components" aria-label="Previous page">Prev</a>
                <a class="${p}-pagination-page is-active" href="#components" aria-current="page">1</a>
                <a class="${p}-pagination-page" href="#components">2</a>
                <a class="${p}-pagination-page" href="#components" aria-label="Next page">Next</a>
              </nav>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-data-display">
              <h3 class="${p}-section-title">Data display</h3>
              <div class="${p}-avatar-group" aria-label="Assigned operators">
                <span class="${p}-avatar">CV</span>
                <span class="${p}-avatar">RJ</span>
                <span class="${p}-avatar">MS</span>
              </div>
              <div class="demo-badge-row">
                <span class="${p}-badge">Neutral</span>
                <span class="${p}-badge ${p}-badge-success">Ready</span>
                <span class="${p}-badge ${p}-badge-warning">Hold</span>
                <span class="${p}-badge ${p}-badge-danger">Fault</span>
              </div>
              <ul class="${p}-list">
                <li><span>Telemetry packet received</span></li>
                <li><span>Manual override available</span></li>
                <li><span>Audit hash queued</span></li>
              </ul>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-overlays-disclosure">
              <h3 class="${p}-section-title">Overlays and disclosure</h3>
              <div class="${p}-popover" role="dialog" aria-label="Cyberpunk popover">
                <strong>Popover</strong>
                <p class="${p}-text-muted">Compact contextual controls stay clipped and token aware.</p>
              </div>
              <div class="${p}-modal" role="dialog" aria-labelledby="cyber-template-modal-title" aria-modal="false">
                <h4 id="cyber-template-modal-title" class="${p}-heading">Modal panel</h4>
                <p class="${p}-copy">Actions follow the same 36 px control rhythm and focus treatment.</p>
                <div class="${p}-modal-actions">
                  <button class="${p}-button ${p}-button-ghost" type="button">Dismiss</button>
                  <button class="${p}-button ${p}-button-primary" type="button">Confirm</button>
                </div>
              </div>
              <details class="${p}-accordion" open>
                <summary>Accordion disclosure</summary>
                <div>Disclosure content uses the same border, cut, and muted text system.</div>
              </details>
            </article>

            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-foundations">
              <h3 class="${p}-section-title">Foundations</h3>
              <pre class="${p}-code"><code><span class="token-key">--cyber-primary</span>: <span class="token-value">var(--usk-primary)</span>;
<span class="token-key">--cyber-danger</span>: <span class="token-value">var(--usk-danger)</span>;</code></pre>
              <blockquote class="${p}-quote">Operational cyberpunk keeps the glow restrained and lets clipped geometry, mono labels, and status color do the work.</blockquote>
              <div class="demo-cyberpunk-token-grid">
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-primary)"><i aria-hidden="true"></i><span><strong>Primary</strong><span>Focus and navigation</span></span></div>
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-danger)"><i aria-hidden="true"></i><span><strong>Danger</strong><span>Critical action</span></span></div>
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-warning)"><i aria-hidden="true"></i><span><strong>Warning</strong><span>Needs review</span></span></div>
              </div>
            </article>
          </div>
        </section>`;
}

/**
 * Renders a local Lucide icon from the vendored, licensed source artwork.
 * @param {string} name - Lucide icon name.
 * @returns {string} Decorative icon markup; its control supplies the accessible name.
 */
function retroGlassIcon(name) {
  return `<span class="demo-rg-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS[name]}</span>`;
}

/** Hydrates stable semantic demo icons once, without replacing their controls on preset changes. */
function hydrateDemoIcons() {
  document.querySelectorAll('[data-demo-icon]').forEach((element) => {
    const icon = window.UI_STYLE_KIT_ICONS[element.dataset.demoIcon];
    if (icon) element.innerHTML = icon;
  });
}

/**
 * Renders every retained RetroGlass template group using the public rg-* API.
 * @param {string} ui - Active preset identifier.
 * @returns {string} The complete reference board, only for Retro Glass.
 */
function renderRetroGlassTemplateSpecimen(ui) {
  if (ui !== "retro-glass") return "";
  const icon = retroGlassIcon;
  const swatches = (roles) => roles.map(([role, label]) =>
    `<span class="rg-token-swatch" style="--rg-token-swatch-color: var(--rg-${role})"><i aria-hidden="true"></i><span>${label}</span></span>`).join("");
  const board = (id, title, content) => `${id === "range-progress" ? "<!--demo-style-feature-->" : ""}<article class="rg-panel demo-rg-board" data-testid="retro-glass-specimen-${id}"><h3 class="rg-section-title">${title}</h3>${content}</article>${id === "range-progress" ? "<!--/demo-style-feature-->" : ""}`;
  const actionStates = ["Default", "Hover", "Pressed", "Loading", "Disabled"];
  const actionRows = [["primary", "Apply"], ["secondary", "Preview"], ["ghost", "Details"], ["danger", "Delete"]];
  const actions = `<div class="demo-rg-state-scroll"><div class="demo-rg-state-grid" data-action-states>
    <span></span>${actionStates.map((state) => `<span class="rg-overline">${state}</span>`).join("")}
    ${actionRows.map(([variant, label]) => `<span class="rg-overline">${variant}</span>${actionStates.map((state) =>
      `<button type="button" class="rg-button rg-button-${variant}${state === "Default" ? "" : ` is-${state.toLowerCase()}`}"${state === "Disabled" ? " disabled" : ""}${state === "Loading" ? ' aria-busy="true"' : ""}${state === "Pressed" ? ' aria-pressed="true"' : ""}>${state === "Loading" ? "Saving" : label}</button>`).join("")}`).join("")}
    </div></div><hr class="rg-divider"><div class="demo-rg-row">
      <button class="rg-icon-button" aria-label="Add document" title="Add document">${icon("plus")}</button>
      <button class="rg-icon-button rg-button-ghost" aria-label="Settings" title="Settings">${icon("settings")}</button>
      <button class="rg-icon-button rg-button-danger" aria-label="Remove document" title="Remove document">${icon("x")}</button>
      <button class="rg-button" aria-label="Open settings" title="Open settings">${icon("settings")}Settings</button>
    </div>`;
  const input = (type, label, value, extra = "") => `<label class="rg-field"><span class="rg-label">${label}</span><input class="rg-input" type="${type}" value="${value}" ${extra}></label>`;
  const forms = `<div class="demo-rg-form-grid">
      ${input("text", "Text / default", "RetroGlass workspace")}
      <label class="rg-field"><span class="rg-label">Email / hover</span><input class="rg-input is-hover" type="email" value="designer@example.com"></label>
      ${input("password", "Password", "samplepass")}
      <label class="rg-field"><span class="rg-label">Search / focus</span><span class="rg-input-wrap"><input class="rg-input is-focus" type="search" placeholder="Search library..."><span class="rg-input-icon">${icon("search")}</span></span></label>
      ${input("number", "Number / helper", "42", 'aria-describedby="rg-number-help"')}
      ${input("date", "Date", "2027-05-24")}
      ${input("time", "Time", "09:47")}
      <label class="rg-field"><span class="rg-label">URL / error</span><input class="rg-input is-error" type="url" value="invalid://path" aria-invalid="true" aria-describedby="rg-url-error"><span class="rg-error-text" id="rg-url-error">Enter a valid web address.</span></label>
      <label class="rg-field demo-rg-wide"><span class="rg-label">Textarea</span><textarea class="rg-textarea">Notes: Preserve translucency while keeping labels crisp and readable.</textarea></label>
    </div><span class="rg-helper rg-sr-only" id="rg-number-help">Document limit: 1 to 100.</span>`;
  /** Demonstrates mutually exclusive radio states without changing native semantics. */
  const densityChoices = [
    { label: "Compact", state: "selected", checked: true },
    { label: "Comfortable", state: "available" },
    { label: "Spacious", state: "keyboard focus", focus: true },
    { label: "Locked", state: "disabled", disabled: true }
  ];
  /** Contrasts enabled and disabled switch states with explicit visible descriptions. */
  const switchExamples = [
    { label: "Wi-Fi", state: "on", checked: true },
    { label: "Sound", state: "off" },
    { label: "Auto sync", state: "disabled on", checked: true, disabled: true },
    { label: "Locked", state: "disabled off", disabled: true }
  ];
  const choices = `<div class="demo-rg-choice-grid">
    <div><p class="rg-overline">Checkboxes</p>${[[true, false, "Checked"], [false, false, "Unchecked"], [true, true, "Disabled on"], [false, true, "Disabled off"]].map(([checked, disabled, label]) => `<label class="rg-choice"><input type="checkbox"${checked ? " checked" : ""}${disabled ? " disabled" : ""}>${label}</label>`).join("")}</div>
    <div role="radiogroup" aria-label="Workspace density"><p class="rg-overline">Workspace density</p>${densityChoices.map(({ label, state, checked, disabled, focus }) => `<label class="rg-choice"><input type="radio" name="rg-density"${focus ? ' class="is-focus"' : ""}${checked ? " checked" : ""}${disabled ? " disabled" : ""}>${label}<span aria-hidden="true"> — ${state}</span></label>`).join("")}</div>
    <div><p class="rg-overline">Switches</p>${switchExamples.map(({ label, state, checked, disabled }) => `<label class="rg-switch"><input type="checkbox" role="switch"${checked ? " checked" : ""}${disabled ? " disabled" : ""}><span class="rg-switch-track"><span class="rg-switch-thumb"></span></span><span>${label}<span aria-hidden="true"> — ${state}</span></span></label>`).join("")}</div>
    </div><hr class="rg-divider"><div class="rg-segmented" role="group" aria-label="Library view">
      ${["Grid", "List", "Map", "Feed"].map((label, i) => `<button class="rg-segment${i === 0 ? " is-active" : ""}" aria-pressed="${i === 0}" data-rg-segment>${label}</button>`).join("")}
    </div><div class="demo-rg-row"><button class="rg-chip" data-remove-tag aria-label="Remove Active filter">Active ${icon("x")}</button><button class="rg-chip rg-chip-danger" data-remove-tag aria-label="Remove Urgent filter">Urgent ${icon("x")}</button><button class="rg-chip rg-chip-warning" data-remove-tag aria-label="Remove Recent filter">Recent ${icon("x")}</button><button class="rg-chip" data-add-filter>${icon("plus")}Add filter</button></div>`;
  const selects = `<div class="demo-rg-form-grid"><div>
    <label class="rg-field"><span class="rg-label">Select / closed</span><select class="rg-select"><option>Recent Documents</option><option>Design Projects</option><option>Shared Library</option><option disabled>Archived Items</option></select></label>
    <p class="rg-overline demo-rg-gap">Select / expanded</p><div class="rg-dropdown">
      <label class="rg-sr-only" for="rg-collection-search">Search collections</label><input class="rg-input" id="rg-collection-search" type="search" placeholder="Search collections..." data-collection-search>
      <div role="listbox" aria-label="Collections">${["Recent Documents", "Design Projects", "Shared Library", "Archived Items"].map((label, i) => `<button class="rg-option${i === 0 ? " is-selected" : ""}" role="option" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"${i === 3 ? " disabled" : ""}>${label}<span data-option-check${i === 0 ? "" : " hidden"}>${icon("check")}</span></button>`).join("")}</div>
    </div></div><div><p class="rg-overline">Multi-select / tags</p><div class="rg-tags" aria-label="Selected categories">${["Design", "Favorite", "Research"].map((label, i) => `<button class="rg-chip${i === 1 ? " rg-chip-danger" : ""}" data-remove-tag aria-label="Remove ${label} category">${label}${icon("x")}</button>`).join("")}</div>
    <p class="rg-overline demo-rg-gap">File upload</p><label class="rg-file"><input type="file" aria-label="Upload files" multiple>${icon("upload")}<strong>Drop files here</strong><span data-file-status aria-live="polite">or browse device</span><span class="rg-helper">JSON, CSV, ZIP</span></label></div></div>`;
  const range = (id, label, value, critical = false) => `<label class="rg-field" for="rg-${id}"><span class="demo-rg-row"><span class="rg-label">${label}</span><output for="rg-${id}">${value}</output></span><input id="rg-${id}" class="rg-range${critical ? " rg-range-critical" : ""}" type="range" min="0" max="100" value="${value}" style="--rg-value: ${value}%"></label>`;
  const progress = (label, value, danger = false) => `<div><p class="demo-rg-row"><span class="rg-overline">${label}</span><span>${value}%</span></p><div class="rg-progress${danger ? " rg-progress-danger" : ""}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="rg-progress-bar" style="--rg-progress-value: ${value}%"></span></div></div>`;
  const ranges = `<div class="demo-rg-form-grid"><div class="demo-rg-stack">${range("volume", "Volume", 68)}${range("brightness", "Brightness", 76, true)}<div><p class="demo-rg-row"><span class="rg-overline">Storage</span><span>72%</span></p><div class="rg-meter" role="meter" aria-label="Storage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" style="--rg-value: 72%"></div><span class="rg-helper">Free / caution / full</span></div></div><div class="demo-rg-stack">${progress("Continuous", 64)}${progress("Transfer", 38, true)}<ol class="rg-stepper" aria-label="Document workflow">${["Choose", "Edit", "Preview", "Save"].map((label, i) => `<li class="rg-step${i < 2 ? " is-complete" : i === 2 ? " is-active" : ""}"${i === 2 ? ' aria-current="step"' : ""}><b>${i < 2 ? `${icon("check")}<span class="rg-sr-only">Completed</span>` : i + 1}</b><span>${label}</span></li>`).join("")}</ol></div></div>`;
  const alerts = `<div class="demo-rg-form-grid">${[["", "info", "Info: A software update is ready"], ["success", "circle-check", "Success: Document saved"], ["warning", "triangle-alert", "Warning: Storage is almost full"], ["danger", "circle-x", "Error: Connection interrupted"]].map(([variant, symbol, label]) => `<div class="rg-alert${variant ? ` rg-alert-${variant}` : ""}" role="status">${icon(symbol)}<span>${label}</span></div>`).join("")}</div>
    <div class="rg-toast" role="status">${icon("check")}<div><strong>Changes saved</strong><p data-rg-status>Your RetroGlass preferences are up to date.</p></div></div><hr class="rg-divider"><div class="demo-rg-loading"><span class="rg-spinner" role="status" aria-label="Loading"></span><div class="demo-rg-stack"><span class="rg-skeleton" aria-hidden="true"></span><span class="rg-skeleton" style="width: 70%" aria-hidden="true"></span></div><span class="rg-overline">Loading / skeleton</span></div>`;
  const navigation = `<nav class="rg-breadcrumb" aria-label="Document breadcrumb"><a href="#overview">Home</a><span aria-hidden="true">/</span><a href="#components">Library</a><span aria-hidden="true">/</span><span aria-current="page">Project Phoenix</span></nav>
    <div class="rg-tabs" role="tablist" aria-label="Project views">${["Overview", "Activity", "Files", "Settings"].map((label, i) => `<button id="rg-tab-${i}" class="rg-tab${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" aria-controls="rg-project-panel" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join("")}</div><div id="rg-project-panel" role="tabpanel" aria-labelledby="rg-tab-0" tabindex="0">Overview: Project Phoenix</div>
    <nav class="rg-nav" aria-label="Library sections">${["Home", "Library", "Projects", "Archive"].map((label, i) => `<a class="rg-nav-link${i === 0 ? " is-active" : ""}" href="#retro-glass-template"${i === 0 ? ' aria-current="page"' : ""} data-rg-navigation>${label}</a>`).join("")}</nav>
    <p class="rg-helper" data-pagination-status>Showing 21-40 of 114</p><nav class="rg-pagination" aria-label="Document pagination"><button class="rg-pagination-page" aria-label="Previous page" data-page-delta="-1">${icon("chevron-left")}</button>${[1, 2, 3, 4, 5, 6].map((page) => `<button class="rg-pagination-page" data-page="${page}"${page === 2 ? ' aria-current="page"' : ""}>${page}</button>`).join("")}<button class="rg-pagination-page" aria-label="Next page" data-page-delta="1">${icon("chevron-right")}</button></nav>`;
  const data = `<div class="demo-rg-table-scroll"><table class="rg-table"><caption class="rg-sr-only">Project documents</caption><thead><tr><th scope="col">File</th><th scope="col">Owner</th><th scope="col">Status</th><th scope="col">Type</th><th scope="col">Size</th></tr></thead><tbody>${[["Sketch", "Alex Morgan", "Synced", "success", "Design", "4.2 MB"], ["Notes", "M. Sato", "Editing", "primary", "Text", "28 KB"], ["Photos", "A. Reyes", "Uploading", "warning", "Media", "86 MB"], ["Archive", "Jamie Lee", "Failed", "danger", "Backup", "1.4 GB"]].map(([file, owner, status, variant, type, size]) => `<tr><td>${file}</td><td>${owner}</td><td><span class="rg-badge rg-badge-${variant}">${status}</span></td><td>${type}</td><td>${size}</td></tr>`).join("")}</tbody></table></div>
    <div class="demo-rg-data-footer"><div class="demo-rg-row"><span class="rg-badge rg-badge-primary">New</span><span class="rg-badge rg-badge-success">Complete</span><span class="rg-badge rg-badge-warning">Warning</span><span class="rg-badge rg-badge-danger">Blocked</span><span class="rg-badge">Archived</span></div><div class="demo-rg-row"><div class="rg-avatar-group" aria-label="Project members"><span class="rg-avatar" aria-label="D7">D7</span><span class="rg-avatar rg-avatar-danger" aria-label="M. Sato">MS</span><span class="rg-avatar rg-avatar-neutral" aria-label="Three more members">+3</span></div><span class="rg-quote"><strong>83%</strong> storage used</span></div></div>`;
  const overlays = `<div class="demo-rg-form-grid"><div class="demo-rg-stack"><span class="rg-tooltip" role="tooltip" id="rg-detail-tooltip">Tooltip: Helpful detail</span><div class="rg-popover"><strong>File actions</strong><p>Choose an operation for the selected document.</p><button class="rg-button" data-rg-menu-toggle aria-expanded="false" aria-haspopup="menu" aria-controls="rg-file-menu" aria-describedby="rg-detail-tooltip">Open menu</button><div class="rg-dropdown" id="rg-file-menu" role="menu" aria-label="File actions" hidden><button class="rg-option" role="menuitem">Duplicate document</button><button class="rg-option" role="menuitem">Move to archive</button></div></div></div><div class="demo-rg-stack"><div class="rg-modal"><h4>Delete document?</h4><p>This action cannot be undone.<br>Move this file to the trash?</p><div class="rg-modal-actions"><button class="rg-button rg-button-ghost" data-rg-cancel>Cancel</button><button class="rg-button rg-button-danger" data-rg-modal-open>Confirm</button></div></div><details class="rg-accordion" open><summary>System details</summary><p>Project Phoenix is synced. Last saved at 09:47.</p></details></div></div>
    <dialog class="rg-modal" data-rg-dialog aria-labelledby="rg-dialog-title"><form method="dialog"><h3 id="rg-dialog-title">Delete document?</h3><p>Move the sample document to the trash?</p><div class="rg-modal-actions"><button class="rg-button" value="cancel" autofocus>Cancel deletion</button><button class="rg-button rg-button-danger" value="confirm">Delete document</button></div></form></dialog>`;
  const foundations = `<div class="demo-rg-foundations"><div><p class="rg-overline">Typography / DejaVu Sans + Mono</p><h4 class="rg-title">Retro heading</h4><h5 class="rg-section-title">Section title</h5><p class="rg-copy">Readable text stays crisp above translucent surfaces.</p></div><div><p class="rg-overline">Semantic color tokens</p><div class="demo-rg-swatches">${swatches([["primary", "Primary"], ["danger", "Danger"], ["warning", "Warning"], ["success", "Success"], ["text", "Text"], ["text-muted", "Muted"]])}</div><pre class="rg-code"><code>--rg-radius-sm: 6px;
--rg-radius-md: 10px;
--rg-control-height: 36px;</code></pre></div><div><p class="rg-overline">Spacing / geometry / states</p><div class="demo-rg-spacing" aria-label="Spacing: 4, 8, 12, 16, 24, 32 pixels">${[4, 8, 12, 16, 24, 32].map((size) => `<span style="--demo-rg-space: ${size}px">${size}</span>`).join("")}</div><div class="demo-rg-row"><span class="rg-badge">Default</span><span class="rg-badge rg-badge-primary">Hover</span><span class="rg-badge rg-badge-primary">Focus</span><span class="rg-badge rg-badge-warning">Pressed</span><span class="rg-badge rg-badge-danger">Error</span></div><blockquote class="rg-quote">Highlights and inset shadows communicate depth.</blockquote></div><div><p class="rg-overline">Design rules</p><ol class="rg-list"><li>Cobalt glass: navigation, focus, primary action.</li><li>Red glass: destructive or failed state.</li><li>Highlights and inset shadows communicate depth.</li><li>Keep content calm and text readable.</li></ol><pre class="rg-console"><code>glass.surface.ready()</code></pre></div></div>`;
  return `<section id="retro-glass-template" class="demo-retro-glass-specimen" data-preset-only="retro-glass" data-testid="retro-glass-template-specimen" aria-label="Retro Glass reference board">
    <div class="demo-rg-header"><header class="rg-toolbar demo-rg-brand"><span class="rg-avatar" aria-hidden="true">RG</span><div><h2>RetroGlass <span>UI preset</span></h2><p class="rg-overline">UI Style Kit CSS / element reference / ${escapeHtml(modeSelect.value)}</p></div></header><div class="rg-toolbar"><p class="rg-overline">Core material palette</p><div class="demo-rg-swatches">${swatches([["bg", "Canvas"], ["surface", "Glass"], ["text", "Text"], ["primary", "Cobalt"], ["danger", "Danger"], ["warning", "Warning"], ["success", "Success"]])}</div></div><div class="rg-toolbar demo-rg-profile"><div><p class="rg-overline">Material profile</p><strong>Glass / tactile</strong><p class="rg-helper">Brushed chrome framing<br>Inset and raised depth</p></div><button class="rg-button rg-button-primary rg-button-pill" data-rg-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">${escapeHtml(modeSelect.value)}</button></div></div>
    <div class="demo-rg-grid">${board("action-states", "Buttons & action states", actions)}${board("form-inputs", "Form inputs", forms)}${board("choices-tags", "Choices, toggles & tags", choices)}${board("select-upload", "Select, multiselect & upload", selects)}${board("range-progress", "Sliders, progress & meters", ranges)}${board("alerts-loading", "Alerts, toasts & loading", alerts)}${board("navigation", "Navigation", navigation)}${board("data-display", "Data display, badges & avatars", data)}${board("overlays-disclosure", "Overlays & disclosure", overlays)}${board("foundations", "Foundations, tokens & rules", foundations)}</div></section>`;
}

/**
 * Keeps every preset-only demo region synchronized with the active style.
 * @returns {void}
 */
function syncPresetSpecificVisibility() {
  document.querySelectorAll("[data-preset-only]").forEach((element) => {
    element.hidden = element.dataset.presetOnly !== uiSelect.value;
  });
}

/**
 * Binds specimen controls using native inputs and dialog focus management.
 * @returns {void}
 */
function bindRetroGlassSpecimen() {
  const root = document.querySelector('[data-testid="retro-glass-template-specimen"]');
  if (!root) return;
  const status = root.querySelector("[data-rg-status]");
  const announce = (message) => { status.textContent = message; };
  root.querySelector("[data-rg-reference]").addEventListener("click", () => {
    selectReferencePalette();
    document.querySelector("[data-rg-reference]").focus({ preventScroll: true });
  });
  root.querySelectorAll(".rg-range").forEach((range) => {
    range.addEventListener("input", () => {
      range.style.setProperty("--rg-value", `${range.value}%`);
      root.querySelector(`output[for="${range.id}"]`).value = range.value;
    });
  });
  root.querySelectorAll("[data-rg-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll("[data-rg-segment]").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === button));
        other.classList.toggle("is-active", other === button);
      });
      announce(`${button.textContent} view selected.`);
    });
  });
  const bindRoving = (container, selector, activate) => {
    container.addEventListener("click", (event) => {
      const item = event.target.closest(selector);
      if (item && !item.disabled) activate(item);
    });
    container.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const items = [...container.querySelectorAll(selector)].filter((item) => !item.disabled && !item.hidden);
      const current = items.indexOf(document.activeElement);
      if (current < 0 || !items.length) return;
      event.preventDefault();
      const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 :
        (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + items.length) % items.length;
      activate(items[index]);
      items[index].focus();
    });
  };
  const tabs = root.querySelector('[role="tablist"]');
  bindRoving(tabs, '[role="tab"]', (tab) => {
    tabs.querySelectorAll('[role="tab"]').forEach((other) => {
      other.setAttribute("aria-selected", String(other === tab));
      other.classList.toggle("is-active", other === tab);
      other.tabIndex = other === tab ? 0 : -1;
    });
    const panel = root.querySelector('[role="tabpanel"]');
    panel.setAttribute("aria-labelledby", tab.id);
    panel.textContent = `${tab.textContent}: Project Phoenix`;
  });
  const options = root.querySelector('[role="listbox"]');
  bindRoving(options, '[role="option"]', (option) => {
    options.querySelectorAll('[role="option"]').forEach((other) => {
      other.setAttribute("aria-selected", String(other === option));
      other.classList.toggle("is-selected", other === option);
      other.tabIndex = other === option ? 0 : -1;
      other.querySelector('[data-option-check]').hidden = other !== option;
    });
    announce(`${option.textContent.trim()} selected.`);
  });
  root.querySelector("[data-collection-search]").addEventListener("input", (event) => {
    options.querySelectorAll('[role="option"]').forEach((option) => {
      option.hidden = !option.textContent.toLowerCase().includes(event.target.value.toLowerCase());
    });
    const visible = [...options.querySelectorAll('[role="option"]')].filter((option) => !option.hidden && !option.disabled);
    visible.forEach((option, i) => { option.tabIndex = i === 0 ? 0 : -1; });
  });
  root.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-remove-tag]");
    if (tag) {
      const next = tag.nextElementSibling || tag.previousElementSibling;
      announce(`${tag.textContent.trim()} removed.`);
      tag.remove();
      next?.focus();
    }
  });
  root.querySelector("[data-add-filter]").addEventListener("click", (event) => {
    const button = document.createElement("button");
    button.className = "rg-chip";
    button.dataset.removeTag = "";
    button.setAttribute("aria-label", "Remove Assigned filter");
    button.innerHTML = `Assigned ${retroGlassIcon("x")}`;
    event.currentTarget.before(button);
    button.focus();
    announce("Assigned filter added.");
  });
  const fileInput = root.querySelector('input[type="file"]');
  const showFiles = (files) => { root.querySelector("[data-file-status]").textContent = [...files].map((file) => file.name).join(", ") || "or browse device"; };
  fileInput.addEventListener("change", () => showFiles(fileInput.files));
  const fileWell = fileInput.closest(".rg-file");
  fileWell.addEventListener("dragover", (event) => event.preventDefault());
  fileWell.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      fileInput.files = event.dataTransfer.files;
      showFiles(fileInput.files);
    }
  });
  const pagination = root.querySelector(".rg-pagination");
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const current = Number(pagination.querySelector('[aria-current="page"]').dataset.page);
    const page = Math.max(1, Math.min(6, button.dataset.page ? Number(button.dataset.page) : current + Number(button.dataset.pageDelta)));
    pagination.querySelectorAll("[data-page]").forEach((item) => {
      if (Number(item.dataset.page) === page) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    root.querySelector("[data-pagination-status]").textContent = `Showing ${(page - 1) * 20 + 1}-${Math.min(page * 20, 114)} of 114`;
  });
  root.querySelectorAll("[data-rg-navigation]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      root.querySelectorAll("[data-rg-navigation]").forEach((other) => {
        other.classList.toggle("is-active", other === link);
        if (other === link) other.setAttribute("aria-current", "page");
        else other.removeAttribute("aria-current");
      });
      announce(`${link.textContent} selected.`);
    });
  });
  const menu = root.querySelector('[role="menu"]');
  const menuToggle = root.querySelector("[data-rg-menu-toggle]");
  const closeMenu = () => { menu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); menuToggle.focus(); };
  menuToggle.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    menuToggle.setAttribute("aria-expanded", String(!menu.hidden));
    if (!menu.hidden) menu.querySelector("button").focus();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
    if (event.key === "Tab") { menu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); }
  });
  bindRoving(menu, '[role="menuitem"]', (item) => item.focus());
  menu.addEventListener("click", (event) => {
    if (event.target.closest("button")) { announce(`${event.target.closest("button").textContent} complete.`); closeMenu(); }
  });
  const dialog = root.querySelector("[data-rg-dialog]");
  const opener = root.querySelector("[data-rg-modal-open]");
  opener.addEventListener("click", () => dialog.showModal());
  root.querySelector("[data-rg-cancel]").addEventListener("click", () => announce("Deletion cancelled."));
  dialog.addEventListener("close", () => {
    announce(dialog.returnValue === "confirm" ? "Sample document moved to trash." : "Deletion cancelled.");
    opener.focus();
  });
}

/**
 * Returns a vendored Lucide icon for the drafting specimen.
 * @param {string} name - Registry icon identifier.
 * @returns {string} Decorative, consistently sized SVG wrapper.
 */
function blueprintIcon(name) {
  return `<span class="demo-blueprint-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS?.[name] || ""}</span>`;
}

/**
 * Renders every retained Technical Blueprint template group using the public blueprint-* API.
 * @param {string} ui - Active preset identifier.
 * @returns {string} The complete reference board, only for Technical Blueprint.
 */
/** Renders only the active Industrial Utility preset using the retained element-board layout. */
function renderIndustrialTemplateSpecimen(ui) {
  if (ui !== "industrial-utility") return "";
  return `<section id="industrial-utility-template" class="demo-industrial-utility-specimen" data-preset-only="industrial-utility" data-testid="industrial-utility-template-specimen" aria-label="Industrial Utility UI element reference sheet">
    <header class="demo-iu-specimen-header">
      <section class="demo-iu-header-zone demo-iu-brand-zone">
        <div class="utility-nameplate"><span>PLC D14</span></div>
        <div class="demo-iu-brand-copy">
          <h2>Industrial Utility</h2>
          <p>PLC / SCADA operator interface / element system 01</p>
        </div>
      </section>

      <section class="demo-iu-header-zone demo-iu-palette-zone" aria-label="Core palette">
        <div class="utility-token"><i style="background:var(--utility-material-safety-amber)"></i><span>SAFETY</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-lamp-green)"></i><span>RUN</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-hazard-red)"></i><span>ALARM</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-lamp-blue)"></i><span>INFO</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-steel)"></i><span>STEEL</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-header)"></i><span>PANEL</span></div>
      </section>

      <section class="demo-iu-header-zone demo-iu-mode-zone">
        <div class="demo-iu-mode-meta">
          <span class="utility-overline">System style mode</span>
          <strong><span class="utility-pilot-light" aria-hidden="true"></span> <span id="utility-mode-name">${escapeHtml(modeSelect.value)} console</span></strong>
          <small>OPERATOR UI / SAFETY-CRITICAL HIERARCHY</small>
          <button class="utility-button utility-button-ghost" type="button" data-utility-reference aria-label="Use reference palette" title="Use reference palette">Reference palette</button>
        </div>
        <div class="demo-iu-clock"><output>09:42:18</output><small>Local / line A</small></div>
      </section>
    </header>

    <div class="demo-iu-specimen-grid">
      <section class="utility-panel demo-iu-panel-buttons" data-component="buttons">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Buttons <small>states + priority</small></header>
        <div class="utility-panel-body utility-control-grid demo-iu-button-grid">
          <div class="demo-iu-button-sample"><span class="utility-label">Primary</span><button class="utility-button utility-button-primary" type="button">Execute</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Secondary</span><button class="utility-button utility-button-secondary" type="button">Manual</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Outline</span><button class="utility-button utility-button-ghost" type="button">Inspect</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Hover</span><button class="utility-button is-hover" type="button">Hover</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Pressed</span><button class="utility-button is-pressed" aria-pressed="true" type="button">Pressed</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Destructive</span><button class="utility-button utility-button-danger" type="button">Delete</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Loading</span><button class="utility-button is-loading" aria-busy="true" type="button">Sending</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Disabled</span><button class="utility-button" type="button" disabled>Locked</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Guarded</span><button class="utility-button utility-button-guarded" type="button"><span>Reset</span></button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Small</span><button class="utility-button utility-button-primary" type="button">Start</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Link</span><a class="utility-button utility-button-ghost" href="#utility-navigation">Open log</a></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Emergency</span><button class="utility-button utility-button-danger" type="button">Trip</button></div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-inputs" data-component="inputs">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Inputs <small>native form coverage</small></header>
        <div class="utility-panel-body demo-iu-input-grid">
          <label class="utility-field"><span class="utility-label">Text</span><input class="utility-input" type="text" value="Pump 04"></label>
          <label class="utility-field"><span class="utility-label">Password</span><input class="utility-input" type="password" value="interlock"></label>
          <label class="utility-field"><span class="utility-label">Search</span><input class="utility-input" type="search" placeholder="Search assets"></label>
          <label class="utility-field"><span class="utility-label">Number</span><input class="utility-input" type="number" value="72.6" step="0.1"></label>
          <label class="utility-field"><span class="utility-label">Date</span><input class="utility-input" type="date" value="2026-09-05"></label>
          <label class="utility-field"><span class="utility-label">Time</span><input class="utility-input" type="time" value="09:42"></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">File upload</span><input class="utility-file" type="file"></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">Validation error</span><input class="utility-input is-error" aria-invalid="true" type="text" value="PT-201 out of range"><small class="utility-help is-error">Enter a value from 0-150 PSI.</small></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">Textarea</span><textarea class="utility-textarea" rows="1" placeholder="Maintenance note"></textarea></label>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-status" data-component="status">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">System status <small>live semantics</small></header>
        <div class="utility-panel-body demo-iu-status-layout">
          <div class="demo-iu-status-bank">
            <div class="demo-iu-status-line"><span class="utility-pilot-light" aria-hidden="true"></span><b>Running</b><small>RUN</small></div>
            <div class="demo-iu-status-line"><span class="utility-pilot-light is-blue" aria-hidden="true"></span><b>Remote</b><small>REM</small></div>
            <div class="demo-iu-status-line"><span class="utility-pilot-light is-red" aria-hidden="true"></span><b>Alarm</b><small>ALM</small></div>
            <div class="demo-iu-status-line"><span class="utility-pilot-light is-off" aria-hidden="true"></span><b>Offline</b><small>OFF</small></div>
          </div>
          <div class="demo-iu-status-badges">
            <span class="utility-badge utility-badge-success">Open</span>
            <span class="utility-badge utility-badge-primary">Active</span>
            <span class="utility-badge utility-badge-warning">Warning</span>
            <span class="utility-badge utility-badge-danger">Critical</span>
            <span class="utility-badge utility-badge-success">Safe</span>
            <span class="utility-badge">Planned</span>
          </div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-selection" data-component="selection">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Selection controls <small>single + multi</small></header>
        <div class="utility-panel-body demo-iu-selection-layout">
          <div>
            <label class="utility-field"><span class="utility-label">Closed select</span><select class="utility-select"><option>Line A</option><option>Line B</option><option>Line C</option></select></label>
            <div class="utility-label" style="margin-top:8px">Expanded select</div>
            <div class="utility-dropdown" role="listbox" aria-label="Production lines"><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Line A</button><button type="button" class="utility-option" role="option" aria-selected="true" tabindex="0">Line B</button><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Line C - maintenance</button><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Utilities</button></div>
          </div>
          <div class="demo-iu-selection-groups">
            <div class="demo-iu-option-stack">
              <span class="utility-label">Checkboxes</span>
              <label class="utility-check"><input type="checkbox"> Unchecked</label>
              <label class="utility-check"><input type="checkbox" checked> Checked</label>
              <label class="utility-check is-disabled"><input type="checkbox" disabled> Disabled</label>
            </div>
            <div class="demo-iu-option-stack">
              <span class="utility-label">Radio group</span>
              <label class="utility-radio"><input type="radio" name="utility-operating-mode" checked> Auto</label>
              <label class="utility-radio"><input type="radio" name="utility-operating-mode"> Manual</label>
              <label class="utility-radio is-disabled"><input type="radio" name="utility-operating-mode" disabled> Local</label>
            </div>
            <div class="demo-iu-chip-row" aria-label="Multi-select values">
              <span class="utility-badge utility-badge-primary">Pump 04</span><span class="utility-badge utility-badge-primary">Pump 05</span><span class="utility-badge">Valve 201</span>
            </div>
          </div>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-toggles" data-component="toggles">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Switchgear <small>semi-tactile controls</small></header>
        <div class="utility-panel-body demo-iu-toggle-layout">
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Toggle off</span><label class="utility-toggle"><input type="checkbox"><span>Off</span></label></div>
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Toggle on</span><label class="utility-toggle"><input type="checkbox" checked><span>On</span></label></div>
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Key switch</span><button class="utility-key-switch" type="button" aria-label="Key switch: Auto" data-position="auto" data-utility-key></button><small class="utility-help">OFF / AUTO / ON</small></div>
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Guarded stop</span><button class="utility-emergency-stop" type="button" id="utility-estop" aria-pressed="false">E-STOP</button></div>
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Pilot bank</span><div class="demo-iu-lamp-row"><span class="utility-pilot-light" aria-hidden="true"></span><span class="utility-pilot-light is-blue" aria-hidden="true"></span><span class="utility-pilot-light is-warning" aria-hidden="true"></span><span class="utility-pilot-light is-red" aria-hidden="true"></span><span class="utility-pilot-light is-off" aria-hidden="true"></span></div><small class="utility-help">RUN / REM / WARN / ALM / OFF</small></div>
          <div class="utility-control-cell demo-iu-toggle-well"><span class="utility-control-name">Three position</span><div class="utility-three-position"><button type="button">Jog</button><button type="button" class="is-active">Auto</button><button type="button">Hand</button></div></div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-instruments" data-component="sliders">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Sliders + meters <small>process values</small></header>
        <div class="utility-panel-body demo-iu-instrument-layout">
          <div class="demo-iu-instrument-block">
            <span class="utility-label utility-readout-label">Discharge pressure</span>
            <div class="utility-readout"><output id="utility-pressure-value">72.6</output><small>PSI</small></div>
            <div class="utility-ticks"><span>0</span><span>50</span><span>100</span><span>150</span></div>
            <input class="utility-slider" id="utility-pressure" aria-label="Discharge pressure" type="range" min="0" max="150" step=".1" value="72.6">
          </div>
          <div class="demo-iu-instrument-block">
            <span class="utility-label">Linear progress</span>
            <div class="demo-iu-meter-line"><div class="utility-meter" role="meter" aria-label="Linear progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65"><span style="width:65%"></span></div><output>65%</output></div>
            <span class="utility-label" style="margin-top:12px">Batch transfer</span>
            <progress class="utility-progress" aria-label="Batch transfer" max="100" value="78">78%</progress>
          </div>
          <div class="demo-iu-instrument-block demo-iu-wide">
            <span class="utility-label">Threshold meter</span>
            <div class="utility-ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
            <input class="utility-slider" aria-label="Threshold meter" type="range" min="0" max="100" value="61">
            <div class="utility-stage-track" aria-label="Process stages">
              <div class="utility-stage is-complete"><b>1</b>Request</div>
              <div class="utility-stage is-complete"><b>2</b>Validate</div>
              <div class="utility-stage is-current" aria-current="step"><b>3</b>Execute</div>
              <div class="utility-stage"><b>4</b>Complete</div>
            </div>
          </div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-navigation" data-component="navigation" id="utility-navigation">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Navigation <small>wayfinding</small></header>
        <div class="utility-panel-body demo-iu-nav-stack">
          <nav class="utility-breadcrumb" aria-label="Breadcrumb"><span>Plant West</span><i>/</i><span>Unit 02</span><i>/</i><b>Line A</b></nav>
          <div class="utility-tabs" role="tablist" aria-label="Operating views">
            <button class="utility-tab is-active" role="tab" aria-selected="true" type="button">Overview</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">Alarms</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">History</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">Service</button>
          </div>
          <div class="demo-iu-nav-row"><span class="utility-label">Pagination</span><div class="utility-pagination"><button type="button">Prev</button><button class="is-active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">Next</button></div></div>
          <div class="demo-iu-nav-row"><span class="utility-label">Segmented</span><div class="utility-segmented"><button class="is-active" type="button">1H</button><button type="button">6H</button><button type="button">12H</button><button type="button">24H</button></div></div>
          <div class="demo-iu-link-row"><a href="#industrial-utility-template">Default link</a><a href="#industrial-utility-template" class="is-hover">Hover link</a><span>Disabled link</span></div>
          <details class="utility-details" open><summary>Maintenance details</summary><p>Interlock verified / last service 08:15.</p></details>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-table" data-component="table">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Work orders <small>dense operational data</small></header>
        <div class="utility-panel-body">
          <div class="demo-iu-table-toolbar">
            <select class="utility-select" aria-label="Status filter"><option>All status</option><option>Open</option><option>Complete</option></select>
            <select class="utility-select" aria-label="Area filter"><option>All areas</option><option>Line A</option><option>Utilities</option></select>
            <input class="utility-input" type="search" aria-label="Search work orders" placeholder="Search work orders">
            <button class="utility-button utility-button-primary" type="button" data-utility-new>New work order</button>
          </div>
          <div class="utility-table-wrap">
            <table class="utility-table">
              <thead><tr><th>WO #</th><th>Status</th><th>Priority</th><th>Description</th><th>Asset</th><th>Area</th><th>Assigned</th></tr></thead>
              <tbody>
                <tr><td>WO-24817</td><td><span class="utility-badge utility-badge-success">Open</span></td><td><span class="utility-badge utility-badge-danger">High</span></td><td>Inspect feed pump vibration</td><td>P-04</td><td>Line A</td><td>M. Johnson</td></tr>
                <tr><td>WO-24815</td><td><span class="utility-badge utility-badge-primary">In progress</span></td><td><span class="utility-badge utility-badge-warning">Medium</span></td><td>Replace cartridge filters</td><td>F-02</td><td>Line A</td><td>T. Williams</td></tr>
                <tr><td>WO-24814</td><td><span class="utility-badge utility-badge-success">Open</span></td><td><span class="utility-badge utility-badge-warning">Medium</span></td><td>Calibrate pressure transmitter</td><td>PT-201</td><td>Line A</td><td>R. Anderson</td></tr>
                <tr><td>WO-24813</td><td><span class="utility-badge">Planned</span></td><td><span class="utility-badge utility-badge-primary">Low</span></td><td>Quarterly valve maintenance</td><td>XV-201</td><td>Line A</td><td>J. Davis</td></tr>
                <tr><td>WO-24810</td><td><span class="utility-badge utility-badge-success">Complete</span></td><td><span class="utility-badge utility-badge-primary">Low</span></td><td>Inspect tank level switch</td><td>LS-101</td><td>Tank Farm</td><td>S. Miller</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-alerts" data-component="alerts">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Alerts + feedback <small>alarm hierarchy</small></header>
        <div class="utility-panel-body demo-iu-alerts-layout">
          <div class="utility-alert utility-alert-danger" data-utility-critical role="status"><span class="utility-pilot-light is-red" aria-hidden="true"></span><div><strong>Critical / HH pressure</strong>PT-201 exceeded 145 PSI. Immediate action required.</div><span class="utility-badge utility-badge-danger">Unacked</span></div>
          <div class="utility-alert utility-alert-warning"><span class="utility-pilot-light is-warning" aria-hidden="true"></span><div><strong>Warning / filter differential</strong>F-02 pressure drop is approaching the service limit.</div><span class="utility-badge utility-badge-warning">Active</span></div>
          <div class="utility-alert utility-alert-success"><span class="utility-pilot-light" aria-hidden="true"></span><div><strong>Normal / process stable</strong>Line A is operating inside the configured envelope.</div><span class="utility-badge utility-badge-success">Normal</span></div>
          <div class="utility-alert"><span class="utility-pilot-light is-blue" aria-hidden="true"></span><div><strong>Advisory / scheduled service</strong>Pump 05 inspection is due in 18 operating hours.</div><span class="utility-badge utility-badge-primary">Info</span></div>
          <div class="demo-iu-alert-controls"><button class="utility-button utility-button-ghost" type="button" data-utility-silence aria-pressed="false">Silence horn</button><button class="utility-button utility-button-primary" type="button" data-utility-ack-open>Acknowledge</button></div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-overlays" data-component="overlays">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Overlays + loading <small>blocking states</small></header>
        <div class="utility-panel-body demo-iu-overlay-layout">
          <div class="utility-dialog" role="group" aria-labelledby="utility-dialog-title">
            <header id="utility-dialog-title">Confirm acknowledge</header>
            <p>Acknowledge all unhandled Line A alarms? This sample changes acknowledgment only.</p>
            <footer><button class="utility-button utility-button-ghost" type="button" data-utility-cancel>Cancel</button><button class="utility-button utility-button-primary" type="button" data-utility-ack-open>Acknowledge</button></footer>
          </div>
          <div class="demo-iu-overlay-stack">
            <div><span class="utility-label">Tooltip</span><div class="utility-tooltip" role="tooltip">Discharge pressure at end of Line A.</div></div>
            <div class="demo-iu-loading-well"><span class="utility-spinner" role="status" aria-label="Loading process history"></span><span>Loading process history</span></div>
            <div class="utility-card utility-popover"><h3>Popover card</h3><p>Controller P-04 is in automatic mode at 45.2 Hz.</p></div>
          </div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-tokens" data-component="tokens">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Tokens + type <small>foundation</small></header>
        <div class="utility-panel-body demo-iu-tokens-layout">
          <div class="utility-token-row">
            <div class="utility-token"><i style="background:var(--utility-material-safety-amber)"></i><span>AMBER</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-lamp-green)"></i><span>GREEN</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-hazard-red)"></i><span>RED</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-lamp-blue)"></i><span>BLUE</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-steel)"></i><span>STEEL</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-surface-low)"></i><span>WELL</span></div>
          </div>
          <div class="demo-iu-type-sample"><span class="demo-iu-display">Process HMI</span><span class="demo-iu-body">Condensed body copy for dense operational interfaces.</span><span class="demo-iu-mono">AI-204 / 72.6 PSI / AUTO</span></div>
          <div class="demo-iu-spacing-key">
            <div><span>04</span><i style="width:16px"></i></div>
            <div><span>08</span><i style="width:32px"></i></div>
            <div><span>16</span><i style="width:64px"></i></div>
            <div><span>24</span><i style="width:96px"></i></div>
          </div>
          <div class="utility-skeleton"></div><div class="utility-skeleton" style="width:72%"></div>
          <div class="utility-empty-state"><span class="utility-pilot-light is-off" aria-hidden="true"></span>No active bypasses</div>
        </div>
      </section>
    </div>
  <!--demo-style-support-->
  <div class="utility-toast-stack demo-iu-extra-feedback"><div class="utility-toast" role="status" data-utility-feedback>Console ready</div></div>
<dialog class="utility-dialog demo-iu-confirm-dialog" aria-labelledby="utility-confirm-title"><header id="utility-confirm-title">Confirm acknowledge</header><p>Acknowledge the displayed sample alarm? Its critical condition remains active.</p><footer><button type="button" class="utility-button utility-button-ghost" data-utility-dialog-cancel>Cancel</button><button type="button" class="utility-button utility-button-primary" data-utility-dialog-confirm>Acknowledge</button></footer></dialog>
<!--/demo-style-support-->
</section>`;
}

/** Renders the eleven-folio field manual using public Paper Editorial components. */
function renderPaperEditorialTemplateSpecimen(ui) {
  if (ui !== "paper-editorial") return "";
  const icon = (name) => `<span class="demo-pe-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS[name] || ""}</span>`;
  const button = (label, variant = "", attrs = "") => `<button type="button" class="paper-button ${variant ? `paper-button-${variant}` : ""}" ${attrs}>${label}</button>`;
  const field = (id, label, type = "text", value = "", attrs = "") => `<label class="paper-field" for="${id}"><span class="paper-label">${label}</span><input class="paper-input" id="${id}" type="${type}" value="${value}" ${attrs}></label>`;
  const heading = (n, title) => `<h3 class="paper-section-title"><b>${n}</b>${title}</h3>`;
  const panel = (n, name, title, content) => `<section class="paper-folio-section demo-pe-${name}" id="paper-folio-${n}" data-component="${name}" data-folio="FOLIO ${String(n).padStart(2, "0")}">${heading(n, title)}${content}</section>`;
  const pages = [1, 2, 3, 4, 5].map((n) => `<button type="button" ${n === 3 ? 'aria-current="page"' : ""} data-paper-page="${n}">${n}</button>`).join("");
  const badges = [["primary", "New"], ["success", "Verified"], ["warning", "Fact check"], ["danger", "Restricted"], ["", "Archived"]].map(([kind, label]) => `<span class="paper-badge ${kind ? `paper-badge-${kind}` : ""}">${label}</span>`).join("");
  const alerts = [["", "Information", "New source attached."], ["success", "Verified", "Story saved successfully."], ["warning", "Warning", "Two citations need review."], ["danger", "Error", "Headline is required."]].map(([kind, label, copy]) => `<div class="paper-alert ${kind ? `paper-alert-${kind}` : ""}"><strong>${label}</strong><button type="button" data-paper-dismiss aria-label="Dismiss ${label}" title="Dismiss ${label}">${icon("x")}</button><p>${copy}</p></div>`).join("");
  const swatches = [["primary", "Oxblood"], ["accent", "Press blue"], ["success", "Forest"], ["warning", "Ochre"], ["bg", "Paper"], ["text", "Ink"]].map(([token, label]) => `<div class="paper-swatch"><i style="background:var(--paper-${token})"></i><code>${label}</code></div>`).join("");
  const rows = [["26-1187", "09/03/26", "City Contracts Under Review", "Invest.", "In review", "primary", "9:14 AM"], ["26-1186", "09/03/26", "Parks Maintenance Audit", "Metro", "Assigned", "warning", "8:47 AM"], ["26-1185", "09/01/26", "Transit Equity Report", "Metro", "Editing", "", "7:32 PM"], ["26-1184", "08/31/26", "Vendor No-Bid Contracts", "Invest.", "Published", "success", "6:05 PM"]];
  const dialogFields = `<div class="demo-pe-two">${field("paper-record", "Record ID", "text", "26-1185")}${field("paper-action", "Action", "text", "Revise")}</div><label class="paper-field" for="paper-reason"><span class="paper-label">Reason / notes</span><textarea class="paper-textarea" id="paper-reason">Clarify headline, update figures, and add source attribution.</textarea></label><div class="demo-pe-two">${field("paper-author", "Authorized by", "text", "A. Thompson")}${field("paper-signed", "Date", "text", "Sep 03")}</div>`;
  return `<section id="paper-editorial-template" class="paper-sheet demo-paper-editorial-specimen" data-preset-only="paper-editorial" data-testid="paper-editorial-template-specimen" aria-label="Paper Editorial field manual">
    <div class="paper-binding" aria-hidden="true"><i></i><i></i><i></i><span>Pressroom reference / field manual / PM-FM-26A</span></div>
    <header class="paper-masthead demo-pe-masthead"><div class="paper-manual-meta"><span class="paper-label">Manual no.</span><b>PM-FM-26A</b><p>REVISION &nbsp; C</p><span class="paper-label">Date</span><em>SEP 03 2026</em></div><div class="demo-pe-title"><p class="paper-kicker">Paper Editorial</p><h2 class="paper-masthead-title">Pressroom Field Manual</h2><p class="paper-caption">${escapeHtml(modeSelect.value)} mode component reference</p></div><div class="paper-property-stamp">Property of<br>Reference library<br>Field office<strong>Document control</strong></div><div class="paper-edition-stamp">REVISED<b>SEP 03<br>2026</b><span>ED. C</span></div></header>
    <nav class="paper-section-index demo-pe-index" aria-label="Field manual index">${["Navigation", "Buttons", "Inputs", "Select", "Checks", "Slider", "Progress", "Feedback", "Overlay", "Table", "Editorial"].map((label, i) => `<button type="button" data-paper-folio="${i + 1}" ${i === 0 ? 'class="is-active"' : ""}>${String(i + 1).padStart(2, "0")} ${label}</button>`).join("")}</nav>
    <div class="demo-pe-grid">
    ${panel(1, "navigation", "Navigation, breadcrumbs, tabs & pagination", `<p class="paper-label">Primary navigation</p><nav class="paper-nav demo-pe-nav" aria-label="Newsroom">${["Home", "Editions", "Desk", "Reports", "Archive", "Settings"].map((name) => `<button type="button" class="paper-nav-link ${name === "Desk" ? "is-active" : ""}" data-paper-nav>${name}</button>`).join("")}</nav><p class="paper-label">Breadcrumb</p><nav class="paper-breadcrumb" aria-label="Story breadcrumb"><a href="#paper-folio-1">Home</a><span>Editions</span><span>City desk</span><span>Investigation / 26-1185</span></nav><p class="paper-label">Tabs</p><div class="paper-tabs" role="tablist" aria-label="Story views">${["Story", "Notes", "Sources 3", "Files", "Activity"].map((name, i) => `<button type="button" class="paper-tab" role="tab" id="paper-tab-${i}" aria-controls="paper-story-view" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join("")}</div><div id="paper-story-view" role="tabpanel" aria-labelledby="paper-tab-0" class="paper-help" tabindex="0">Story / City Contracts Under Review</div><p class="paper-label">Pagination</p><nav class="paper-pagination" aria-label="Record pages"><button type="button" data-paper-prev aria-label="Previous page" title="Previous page">${icon("chevron-left")}</button>${pages}<button type="button" data-paper-next aria-label="Next page" title="Next page">${icon("chevron-right")}</button></nav>`)}
    ${panel(2, "buttons", "Buttons & actions", `<div class="demo-pe-state-scroll"><div class="demo-pe-state-grid">${["Default", "Hover", "Pressed", "Disabled"].map((state) => `<span class="paper-label">${state}</span>`).join("")}${[["primary", "Authorize"], ["secondary", "Revise"], ["danger", "Reject"]].map(([variant, label]) => ["", "is-hovered", "is-pressed", "disabled"].map((state) => `<button type="button" class="paper-button paper-button-${variant} ${state === "disabled" ? "" : state}" ${state === "disabled" ? "disabled" : "data-paper-authorize"}>${label}</button>`).join("")).join("")}</div></div><hr class="paper-rule"><p class="paper-label">Compact actions</p><div class="demo-pe-row">${button(icon("search"), "", 'class="unused" data-paper-search aria-label="Search records" title="Search records"')}${button(icon("plus"), "", 'data-paper-new aria-label="New record" title="New record"')}<button type="button" class="paper-button paper-icon-button" data-paper-authorize aria-label="Record settings" title="Record settings">${icon("settings")}</button>${button("Edit", "", "data-paper-authorize")}${button("Print", "", "data-paper-print")}${button("Read proofs", "primary", "data-paper-authorize")}</div><div class="demo-pe-row demo-pe-small-gap"><button type="button" class="paper-button paper-button-loading" aria-busy="true">Checking</button>${button("Export CSV", "text", "data-paper-export")}</div>`)}
    ${panel(3, "inputs", "Text input, search, upload & validation", `<div class="demo-pe-input-grid"><div class="demo-pe-stack">${field("paper-headline", "Text input", "text", "", 'maxlength="60" placeholder="Headline (60 characters max)"')}<label class="paper-field" for="paper-search"><span class="paper-label">Search</span><span class="paper-search"><span class="paper-input-icon">${icon("search")}</span><input class="paper-input" id="paper-search" type="search" placeholder="Search records, names, IDs..."></span></label><label class="paper-field" for="paper-summary"><span class="paper-label">Textarea</span><textarea class="paper-textarea" id="paper-summary" maxlength="300">Summary of the story. Include key facts and context for the newsroom.</textarea><span class="paper-help" id="paper-summary-count">71/300</span></label></div><div class="demo-pe-stack"><span class="paper-label">File upload</span><label class="paper-file-upload" for="paper-upload">${icon("upload")}<strong>FILE</strong><span data-paper-filename>Drop file here or browse</span><small>PDF, DOCX, XLSX / 25 MB</small><input class="paper-file" id="paper-upload" type="file" accept=".pdf,.docx,.xlsx"></label>${field("paper-date", "Date", "date", "2026-09-03")}</div><div class="demo-pe-stack">${field("paper-saved", "Validation states", "text", "Saved.", 'readonly aria-label="Saved validation state"')}${field("paper-required", "Required", "text", "", 'aria-invalid="true" aria-describedby="paper-required-help" placeholder="Required."')}<span class="paper-help paper-help-error" id="paper-required-help">Headline is required.</span>${field("paper-disabled", "Disabled", "text", "Disabled", "disabled")}${field("paper-time", "Time", "time", "09:14")}</div></div>`)}
    ${panel(4, "selection", "Select & tokens", `<div class="demo-pe-two"><div class="demo-pe-stack"><label class="paper-field" for="paper-desk"><span class="paper-label">Native select</span><span class="paper-select-wrap"><select class="paper-select" id="paper-desk"><optgroup label="Newsroom desks"><option>Investigations Unit</option><option>Metro Desk</option><option>City Hall Bureau</option></optgroup><optgroup label="Features"><option>Opinion Desk</option><option>Arts & Culture</option></optgroup></select></span></label><p class="paper-label">Multi-select tokens / tags</p><div class="demo-pe-row" data-paper-tags>${["City Contracts", "Transit Equity", "FY 2026", "Public Records"].map((tag) => `<span class="paper-chip">${tag}<button type="button" aria-label="Remove ${tag}" title="Remove ${tag}" data-paper-remove>${icon("x")}</button></span>`).join("")}</div><label class="paper-field" for="paper-add-tag"><span class="paper-label">Add tag</span><input class="paper-input" id="paper-add-tag" placeholder="Add tag..."></label></div><div class="demo-pe-stack"><span class="paper-label">Checkbox</span>${[["Checked", "checked"], ["Unchecked", ""], ["Disabled", "checked disabled"]].map(([label, attrs]) => `<label class="paper-check"><input type="checkbox" ${attrs}>${label}</label>`).join("")}<span class="paper-label">Radio</span>${["Morning", "Evening"].map((label, i) => `<label class="paper-radio"><input type="radio" name="paper-edition" ${i === 0 ? "checked" : ""}>${label}</label>`).join("")}</div></div>`)}
    ${panel(5, "toggles", "Toggles & focus", `<div class="demo-pe-two"><div class="demo-pe-stack"><span class="paper-label">Switch</span>${[["Live edition", "checked"], ["Fact checked", ""], ["Locked", "checked disabled"]].map(([label, attrs]) => `<label class="paper-switch"><input type="checkbox" role="switch" ${attrs}><span>${label}</span></label>`).join("")}</div><div class="demo-pe-stack"><span class="paper-label">Focus states</span><label class="paper-check demo-pe-focus"><input type="checkbox" aria-label="Focus checkbox"></label><label class="paper-radio demo-pe-focus"><input type="radio" name="paper-focus" aria-label="Focus radio"></label>${button("Keyboard focus", "secondary", 'data-paper-focus')}</div></div>`)}
    ${panel(6, "range", "Range slider & measurement control", `<div class="demo-pe-range-grid"><div><label class="paper-label" for="paper-measure">Measurement ruler</label><div class="demo-pe-scale" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div><input class="paper-slider" id="paper-measure" type="range" min="0" max="100" value="68"><div class="paper-ruler" aria-hidden="true"></div><div class="demo-pe-row demo-pe-measure"><span class="paper-label">Measurement (mm)</span><output class="paper-metric-value" id="paper-measure-output" for="paper-measure">68</output><span class="paper-help">mm</span></div></div><div class="demo-pe-stack"><span class="paper-label">Secondary ranges</span><label class="paper-label" for="paper-opacity">Opacity</label><input class="paper-slider" id="paper-opacity" type="range" value="35"><label class="paper-label" for="paper-column">Column width</label><input class="paper-slider" id="paper-column" type="range" value="75"><span class="paper-footnote">Measurement units: millimeters</span></div></div>`)}
    ${panel(7, "progress", "Progress, meters & workflow", `<div class="demo-pe-two"><label class="paper-field"><span class="paper-label">Continuous bar / 68%</span><progress class="paper-progress" value="68" max="100" aria-label="Editorial completion">68%</progress></label><label class="paper-field"><span class="paper-label">Threshold meter</span><meter class="paper-meter" min="0" max="100" low="40" high="70" optimum="20" value="65" aria-label="Citation review threshold">65%</meter></label></div><p class="paper-label">Editorial workflow</p><div class="paper-stage-track" aria-label="Editorial workflow">${["Report", "Review", "Edit", "Authorize", "Publish"].map((name, i) => `<span class="paper-stage ${i === 1 ? "is-active" : ""}" ${i === 1 ? 'aria-current="step"' : ""}>${i + 1}<br>${name}</span>`).join("")}</div><div class="demo-pe-row demo-pe-loading"><span class="paper-label">Loading / indeterminate</span><span class="paper-spinner" role="status" aria-label="Checking citations"></span><span class="paper-help">Checking citations...</span></div>`)}
    ${panel(8, "feedback", "Badges, alerts, tooltips & loading", `<div class="demo-pe-row">${badges}</div><div class="demo-pe-alert-grid">${alerts}</div><div class="demo-pe-two"><div class="demo-pe-stack" aria-hidden="true"><div class="paper-skeleton"></div><div class="paper-skeleton demo-pe-skeleton-short"></div></div><div class="paper-tooltip" role="tooltip">Helpful context appears here.</div></div>`)}
    ${panel(9, "overlays", "Dialog, empty state & style legend", `<div class="paper-dialog demo-pe-dialog-preview" role="group" aria-label="Revision authorization form"><header><h4>Revision authorization</h4><span class="paper-badge paper-badge-danger">Requires signature</span></header><div class="paper-dialog-body demo-pe-stack">${dialogFields}</div><footer>${button("Cancel", "", "data-paper-reset")}${button("Submit", "primary", "data-paper-authorize")}</footer></div><p class="paper-label">Empty state</p><div class="paper-empty-state">No archived proofs for this edition.</div><hr class="paper-rule"><p class="paper-label">Spot-ink palette</p><div class="demo-pe-swatches">${swatches}</div><div class="paper-metric demo-pe-row"><span class="paper-metric-label">Typography</span><span class="paper-metric-value">H1</span><span class="paper-help">Display / Serif / Sans / Mono</span></div><details class="paper-details"><summary>Document notes</summary><div class="paper-popover">Reference copy / City Desk / revision C.</div></details>`)}
    ${panel(10, "records", "Data table / dense records", `<div class="paper-table-wrap"><table class="paper-table"><caption class="paper-caption">City desk records</caption><thead><tr>${["ID", "Date", "Headline", "Desk", "Status", "Updated"].map((name) => `<th scope="col">${name}</th>`).join("")}</tr></thead><tbody>${rows.map(([id, date, headline, desk, status, kind, time]) => `<tr><td>${id}</td><td>${date}</td><td>${headline}</td><td>${desk}</td><td><span class="paper-badge ${kind ? `paper-badge-${kind}` : ""}">${status}</span></td><td>${time}</td></tr>`).join("")}</tbody></table></div><div class="demo-pe-row demo-pe-record-footer"><span class="paper-footnote" data-paper-record-count>Showing 1 to 4 of 128 entries</span>${button("Export CSV", "text", "data-paper-export")}</div>`)}
    ${panel(11, "editorial", "Editorial voice & composition", `<div class="demo-pe-two"><article><p class="paper-kicker">Investigations</p><p class="paper-article-deck">Public records reveal a city system caught between policy and practice.</p><p class="paper-byline">By A. Thompson / City Desk</p><p class="paper-dropcap">Documents tell a story in margins, corrections and patient lines of type. Editorial controls should feel composed, not mechanical.</p><p class="paper-footnote">1. City budget records, fiscal year 2026.</p></article><aside><blockquote class="paper-pullquote">&ldquo;Clarity earns<br>the reader's trust.&rdquo;<cite>Copy Desk Manual</cite></blockquote><p class="paper-marginalia">Margin note: confirm figures, names and source attribution.</p><div class="paper-segmented" aria-label="Edition format">${["Print", "Digital"].map((label, i) => `<button type="button" aria-pressed="${i === 0}">${label}</button>`).join("")}</div></aside></div>`)}
    </div><hr class="paper-rule paper-rule-double"><footer class="demo-pe-footer"><span class="paper-folio">Print method: risograph 2-3 color / uncoated paper stock</span><span class="paper-footnote" role="status" data-paper-feedback>Designed for newsrooms, journals & archives</span><button type="button" class="paper-button paper-button-text" data-paper-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">Rev C / ${escapeHtml(modeSelect.value)}</button></footer>
    <dialog class="paper-dialog" aria-labelledby="paper-confirm-title"><header><h3 id="paper-confirm-title">Revision authorization</h3></header><div class="paper-dialog-body"><p>Confirm this sample revision for record 26-1185?</p><p class="paper-help">This preview does not submit records to a newsroom.</p></div><footer>${button("Cancel", "", "data-paper-cancel")}${button("Authorize", "primary", "data-paper-confirm")}</footer></dialog>
  </section>`;
}

/** Binds scoped, keyboard-accessible sample interactions without external data writes. */
function bindPaperEditorialSpecimen() {
  const root = document.getElementById("paper-editorial-template");
  if (!root) return;
  const report = (message) => { root.querySelector("[data-paper-feedback]").textContent = message; };
  root.querySelectorAll(".paper-slider").forEach((input) => {
    const paint = () => input.style.setProperty("--paper-slider-value", `${input.value}%`);
    paint();
    input.addEventListener("input", paint);
  });
  root.querySelector("[data-paper-reference]").addEventListener("click", selectReferencePalette);
  root.querySelector("#paper-measure").addEventListener("input", (event) => { root.querySelector("#paper-measure-output").value = event.target.value; });
  root.querySelectorAll("[data-paper-dismiss]").forEach((button) => button.addEventListener("click", () => { button.closest(".paper-alert").hidden = true; }));
  root.querySelector("[data-paper-tags]").addEventListener("click", (event) => { event.target.closest("[data-paper-remove]")?.closest(".paper-chip").remove(); });
  root.querySelector("#paper-add-tag").addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.value.trim()) return;
    event.preventDefault();
    const label = event.target.value.trim();
    const chip = document.createElement("span");
    chip.className = "paper-chip";
    chip.textContent = label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.paperRemove = "";
    remove.setAttribute("aria-label", `Remove ${label}`);
    remove.title = `Remove ${label}`;
    remove.textContent = "\u00d7";
    chip.append(remove);
    root.querySelector("[data-paper-tags]").append(chip);
    event.target.value = "";
  });
  root.querySelectorAll(".paper-tabs, .paper-segmented").forEach((group) => {
    const tabs = [...group.querySelectorAll("button")];
    const attribute = group.matches(".paper-tabs") ? "aria-selected" : "aria-pressed";
    const activate = (button) => {
      tabs.forEach((tab) => { tab.setAttribute(attribute, String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
      if (attribute === "aria-selected") {
        const panel = root.querySelector("#paper-story-view");
        panel.setAttribute("aria-labelledby", button.id);
        panel.textContent = `${button.textContent} / City Contracts Under Review`;
      }
    };
    group.addEventListener("click", (event) => { const button = event.target.closest("button"); if (button) activate(button); });
    group.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const index = tabs.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next]); tabs[next].focus();
    });
  });
  root.querySelectorAll("[data-paper-nav]").forEach((button) => button.addEventListener("click", () => {
    root.querySelectorAll("[data-paper-nav]").forEach((item) => item.classList.toggle("is-active", item === button)); report(`${button.textContent} desk selected`);
  }));
  root.querySelectorAll("[data-paper-folio]").forEach((button) => button.addEventListener("click", () => {
    root.querySelectorAll("[data-paper-folio]").forEach((item) => item.classList.toggle("is-active", item === button));
    root.querySelector(`#paper-folio-${button.dataset.paperFolio}`).scrollIntoView({ block: "start" });
  }));
  root.querySelector(".paper-pagination").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const current = Number(root.querySelector("[aria-current='page']").dataset.paperPage);
    const next = Math.max(1, Math.min(5, Number(button.dataset.paperPage) || current + (button.hasAttribute("data-paper-next") ? 1 : -1)));
    root.querySelectorAll("[data-paper-page]").forEach((item) => { if (Number(item.dataset.paperPage) === next) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current"); });
    report(`Record page ${next} selected`);
  });
  const dialog = root.querySelector("dialog");
  let opener;
  root.querySelectorAll("[data-paper-authorize]").forEach((button) => button.addEventListener("click", () => { opener = button; dialog.showModal(); }));
  root.querySelector("[data-paper-cancel]").addEventListener("click", () => dialog.close());
  root.querySelector("[data-paper-confirm]").addEventListener("click", () => { dialog.close(); report("Sample revision authorized locally."); });
  dialog.addEventListener("close", () => opener?.focus());
  root.querySelector("[data-paper-focus]").addEventListener("click", () => root.querySelector(".demo-pe-focus input").focus());
  root.querySelector("[data-paper-search]").addEventListener("click", () => root.querySelector("#paper-search").focus());
  root.querySelector("[data-paper-new]").addEventListener("click", () => { root.querySelector("#paper-headline").value = ""; root.querySelector("#paper-headline").focus(); });
  root.querySelector("[data-paper-print]").addEventListener("click", () => window.print());
  root.querySelector("[data-paper-reset]").addEventListener("click", () => { root.querySelectorAll(".demo-pe-dialog-preview input, .demo-pe-dialog-preview textarea").forEach((input) => { input.value = input.defaultValue; }); report("Revision draft reset."); });
  root.querySelector("#paper-upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    root.querySelector("[data-paper-filename]").textContent = file ? file.name : "Drop file here or browse";
    report(file ? `${file.name} selected locally; not uploaded.` : "No file selected.");
  });
  root.querySelector("#paper-summary").addEventListener("input", (event) => { root.querySelector("#paper-summary-count").textContent = `${event.target.value.length}/300`; });
  root.querySelector("#paper-search").addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const rows = [...root.querySelectorAll(".paper-table tbody tr")];
    rows.forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(query); });
    root.querySelector("[data-paper-record-count]").textContent = `${rows.filter((row) => !row.hidden).length} sample records shown`;
  });
  root.querySelectorAll("[data-paper-export]").forEach((button) => button.addEventListener("click", () => {
    const csv = [...root.querySelectorAll(".paper-table tr")].filter((row) => !row.hidden).map((row) => [...row.cells].map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "paper-editorial-sample.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); report("Sample records exported.");
  }));
}

/** Binds inert console interactions inside the active preset, without affecting other styles. */
function bindIndustrialSpecimen() {
  const root = document.getElementById("industrial-utility-template");
  if (!root) return;
  const feedback = root.querySelector("[data-utility-feedback]");
  const report = (message) => { feedback.textContent = message; };
  root.querySelector("[data-utility-reference]")?.addEventListener("click", selectReferencePalette);
  const pressure = root.querySelector("#utility-pressure");
  pressure.addEventListener("input", () => { root.querySelector("#utility-pressure-value").value = Number(pressure.value).toFixed(1); });
  root.querySelectorAll(".utility-toggle input").forEach((input) => {
    input.addEventListener("change", () => { input.nextElementSibling.textContent = input.checked ? "On" : "Off"; });
  });
  const key = root.querySelector("[data-utility-key]");
  key.addEventListener("click", () => {
    const positions = ["off", "auto", "on"];
    const next = positions[(positions.indexOf(key.dataset.position) + 1) % positions.length];
    key.dataset.position = next;
    const label = next[0].toUpperCase() + next.slice(1);
    key.setAttribute("aria-label", `Key switch: ${label}`);
    key.nextElementSibling.textContent = `OFF / AUTO / ON: ${label}`;
    report(`Sample key switch: ${label}`);
  });
  root.querySelector("#utility-estop").addEventListener("click", (event) => {
    const pressed = event.currentTarget.getAttribute("aria-pressed") !== "true";
    event.currentTarget.setAttribute("aria-pressed", String(pressed));
    event.currentTarget.classList.toggle("is-pressed", pressed);
    event.currentTarget.textContent = pressed ? "RESET" : "E-STOP";
    report(pressed ? "Sample stop latched. No equipment is connected." : "Sample stop reset.");
  });
  const dialog = root.querySelector("dialog");
  let opener;
  root.querySelectorAll("[data-utility-ack-open]").forEach((button) => button.addEventListener("click", () => {
    opener = button;
    dialog.showModal();
  }));
  dialog.querySelector("[data-utility-dialog-cancel]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-utility-dialog-confirm]").addEventListener("click", () => {
    const alarm = root.querySelector("[data-utility-critical]");
    alarm.querySelector(".utility-badge").textContent = "Acknowledged";
    report("Sample acknowledgment recorded locally. Critical pressure remains active.");
    dialog.close();
  });
  dialog.addEventListener("close", () => opener?.focus());
  root.querySelector("[data-utility-silence]").addEventListener("click", (event) => {
    const muted = event.currentTarget.getAttribute("aria-pressed") !== "true";
    event.currentTarget.setAttribute("aria-pressed", String(muted));
    event.currentTarget.textContent = muted ? "Restore horn" : "Silence horn";
    report(muted ? "Sample horn muted; alarms remain visible." : "Sample horn restored.");
  });

  // Use one roving-focus model for tabs, the listbox, and mutually exclusive modes.
  root.querySelectorAll(".utility-tabs, .utility-dropdown, .utility-segmented, .utility-three-position").forEach((group) => {
    const buttons = [...group.querySelectorAll("button")];
    const attribute = group.matches(".utility-tabs, .utility-dropdown") ? "aria-selected" : "aria-pressed";
    const select = (button, focus = false) => {
      buttons.forEach((item) => {
        const active = item === button;
        item.setAttribute(attribute, String(active));
        item.classList.toggle("is-active", active);
        item.tabIndex = active ? 0 : -1;
      });
      if (focus) button.focus();
    };
    select(buttons.find((button) => button.getAttribute(attribute) === "true" || button.classList.contains("is-active")) || buttons[0]);
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!buttons.includes(button)) return;
      select(button);
      report(`${button.textContent.trim()} selected`);
    });
    group.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const index = buttons.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
      select(buttons[next], true);
    });
  });
  const table = root.querySelector(".utility-table tbody");
  const search = root.querySelector('[aria-label="Search work orders"]');
  const status = root.querySelector('[aria-label="Status filter"]');
  const area = root.querySelector('[aria-label="Area filter"]');
  const filter = () => {
    [...table.rows].forEach((row) => {
      row.hidden = !row.textContent.toLowerCase().includes(search.value.toLowerCase()) || (status.selectedIndex > 0 && row.cells[1].textContent.trim() !== status.value) || (area.selectedIndex > 0 && row.cells[5].textContent.trim() !== area.value);
    });
    report(`${[...table.rows].filter((row) => !row.hidden).length} sample work orders shown`);
  };
  // Work-order controls are intentionally present only in the complete reference fixture.
  search?.addEventListener("input", filter);
  status?.addEventListener("change", filter);
  area?.addEventListener("change", filter);
  root.querySelector("[data-utility-new]")?.addEventListener("click", () => {
    const row = table.rows[0].cloneNode(true);
    row.cells[0].textContent = `WO-DEMO-${table.rows.length + 1}`;
    row.cells[3].textContent = "New local inspection draft";
    table.prepend(row);
    filter();
  });
  const pages = root.querySelector(".utility-pagination");
  let currentPage = 1;
  pages?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const label = button.textContent.trim();
    currentPage = label === "Prev" ? Math.max(1, currentPage - 1) : label === "Next" ? Math.min(3, currentPage + 1) : Number(label);
    pages.querySelectorAll("button").forEach((item) => {
      const active = item.textContent.trim() === String(currentPage);
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current");
    });
    report(`Sample navigation page ${currentPage} selected`);
  });
  root.querySelectorAll(".demo-iu-button-grid button, [data-utility-cancel]").forEach((button) => {
    button.addEventListener("click", () => report(`${button.textContent.trim()} sample selected. No equipment is connected.`));
  });
}

function renderBlueprintTemplateSpecimen(ui) {
  if (ui !== "technical-blueprint") return "";
  const icon = blueprintIcon;
  const swatches = (roles) => roles.map(([role, label]) =>
    `<span class="blueprint-token-swatch" style="--blueprint-token-swatch-color: var(--blueprint-${role})"><i aria-hidden="true"></i><span>${label}</span></span>`).join("");
  const board = (id, title, content) => `${id === "range-progress" ? "<!--demo-style-feature-->" : ""}<article class="blueprint-panel demo-blueprint-board" data-testid="technical-blueprint-specimen-${id}"><h3 class="blueprint-section-title">${title}</h3>${content}</article>${id === "range-progress" ? "<!--/demo-style-feature-->" : ""}`;
  const actionStates = ["Default", "Hover", "Pressed", "Loading", "Disabled"];
  const actionRows = [["primary", "Execute"], ["secondary", "Save"], ["ghost", "Export"], ["danger", "Revise"]];
  const actions = `<div class="demo-blueprint-state-scroll"><div class="demo-blueprint-state-grid" data-action-states>
    <span></span>${actionStates.map((state) => `<span class="blueprint-overline">${state}</span>`).join("")}
    ${actionRows.map(([variant, label]) => `<span class="blueprint-overline">${({ ghost: "Outline", danger: "Revision" })[variant] || variant}</span>${actionStates.map((state) =>
      `<button type="button" class="blueprint-button blueprint-button-${variant}${state === "Default" ? "" : ` is-${state.toLowerCase()}`}"${state === "Disabled" ? " disabled" : ""}${state === "Loading" ? ' aria-busy="true"' : ""}${state === "Pressed" ? ' aria-pressed="true"' : ""}>${state === "Loading" ? "Loading" : label}</button>`).join("")}`).join("")}
    </div></div><hr class="blueprint-divider"><div class="demo-blueprint-row">
      <button class="blueprint-icon-button" aria-label="Add document" title="Add document">${icon("plus")}</button>
      <button class="blueprint-icon-button blueprint-button-ghost" aria-label="Settings" title="Settings">${icon("settings")}</button>
      <button class="blueprint-icon-button blueprint-button-danger" aria-label="Remove document" title="Remove document">${icon("x")}</button>
      <button class="blueprint-button">${icon("arrow-right")}Icon + text</button>
    </div>`;
  const input = (type, label, value, extra = "") => `<label class="blueprint-field"><span class="blueprint-label">${label}</span><input class="blueprint-input" type="${type}" value="${value}" ${extra}></label>`;
  const forms = `<div class="demo-blueprint-form-grid">
      ${input("text", "Part / default", "M-204 modular actuator")}
      <label class="blueprint-field"><span class="blueprint-label">Email / hover</span><input class="blueprint-input is-hover" type="email" value="engineer@example.com"></label>
      ${input("password", "Password", "samplepass")}
      <label class="blueprint-field"><span class="blueprint-label">Search / focus</span><span class="blueprint-input-wrap"><input class="blueprint-input is-focus" type="search" placeholder="Search drawings, parts, notes..."><span class="blueprint-input-icon">${icon("search")}</span></span></label>
      ${input("number", "Number / tolerance", "25.400", 'step="0.001" aria-describedby="blueprint-number-help"')}
      ${input("date", "Date", "2026-09-02")}
      ${input("time", "Time", "09:47")}
      <label class="blueprint-field"><span class="blueprint-label">Drawing / error</span><input class="blueprint-input is-error" type="text" value="M-204-XX" aria-invalid="true" aria-describedby="blueprint-url-error"><span class="blueprint-error-text" id="blueprint-url-error">Enter a released drawing number.</span></label>
      <label class="blueprint-field demo-blueprint-wide"><span class="blueprint-label">Textarea</span><textarea class="blueprint-textarea">Engineer notes: verify dimensions, tolerances, materials, and release status.</textarea></label>
    </div><span class="blueprint-helper blueprint-sr-only" id="blueprint-number-help">Tolerance: plus or minus 0.050 millimeters.</span>`;
  const choices = `<div class="demo-blueprint-choice-grid">
    <div><p class="blueprint-overline">Checkboxes</p>${[[true, false, "Checked"], [false, false, "Unchecked"], [true, true, "Disabled on"], [false, true, "Disabled off"]].map(([checked, disabled, label]) => `<label class="blueprint-choice"><input type="checkbox"${checked ? " checked" : ""}${disabled ? " disabled" : ""}>${label}</label>`).join("")}</div>
    <div role="radiogroup" aria-label="Reference datum"><p class="blueprint-overline">Radio group</p>${["Primary", "Secondary", "Detail bubble", "Disabled"].map((label, i) => `<label class="blueprint-choice"><input type="radio" name="blueprint-density"${i === 0 ? " checked" : ""}${i === 3 ? " disabled" : ""}>${label}</label>`).join("")}</div>
    <div><p class="blueprint-overline">Switches</p>${["Grid", "Snap", "Auto Dim", "Locked"].map((label, i) => `<label class="blueprint-switch"><input type="checkbox" role="switch"${i % 2 === 0 ? " checked" : ""}${i === 3 ? " disabled" : ""}><span class="blueprint-switch-track"><span class="blueprint-switch-thumb"></span></span><span>${label}</span></label>`).join("")}</div>
    </div><hr class="blueprint-divider"><div class="blueprint-segmented" role="group" aria-label="Drawing view">
      ${["Plan", "Front", "Side", "3D"].map((label, i) => `<button class="blueprint-segment${i === 0 ? " is-active" : ""}" aria-pressed="${i === 0}" data-blueprint-segment>${label}</button>`).join("")}
    </div><div class="demo-blueprint-row"><button class="blueprint-chip" data-remove-tag aria-label="Remove M-204 filter">M-204 ${icon("x")}</button><button class="blueprint-chip blueprint-chip-danger" data-remove-tag aria-label="Remove Rev D filter">Rev D ${icon("x")}</button><button class="blueprint-chip blueprint-chip-warning" data-remove-tag aria-label="Remove tolerance filter">+/-0.05 ${icon("x")}</button><button class="blueprint-chip" data-add-filter>${icon("plus")}Add layer</button></div>`;
  const selects = `<div class="demo-blueprint-form-grid"><div>
    <label class="blueprint-field"><span class="blueprint-label">Select / closed</span><select class="blueprint-select"><option>Mechanical / M-204</option><option>Architectural</option><option>Electrical</option><option disabled>Released drawings</option></select></label>
    <p class="blueprint-overline demo-blueprint-gap">Select / expanded</p><div class="blueprint-dropdown">
      <div role="listbox" aria-label="Disciplines">${["Architectural", "Electrical", "Mechanical / M-204", "Structural", "Released drawings"].map((label, i) => `<button class="blueprint-option${i === 2 ? " is-selected" : ""}" role="option" aria-selected="${i === 2}" tabindex="${i === 2 ? 0 : -1}"${i === 4 ? " disabled" : ""}>${label}<span data-option-check${i === 2 ? "" : " hidden"}>${icon("check")}</span></button>`).join("")}</div>
    </div></div><div><p class="blueprint-overline">Multi-select / tags</p><div class="blueprint-tags" aria-label="Selected drawing layers">${["10-STEEL", "20-PIPING", "30-DIMS"].map((label, i) => `<button class="blueprint-chip${i === 1 ? " blueprint-chip-danger" : ""}" data-remove-tag aria-label="Remove ${label} layer">${label}${icon("x")}</button>`).join("")}</div>
    <p class="blueprint-overline demo-blueprint-gap">File upload</p><label class="blueprint-file"><input type="file" aria-label="Upload drawing files" multiple>${icon("upload")}<strong>Drop drawing files</strong><span data-file-status aria-live="polite">or browse device</span><span class="blueprint-helper">PDF, DWG, DXF / 50 MB max</span></label></div></div>`;
  const range = (id, label, value, critical = false) => `<label class="blueprint-field" for="blueprint-${id}"><span class="demo-blueprint-row"><span class="blueprint-label">${label}</span><output for="blueprint-${id}">${value}</output></span><input id="blueprint-${id}" class="blueprint-range${critical ? " blueprint-range-critical" : ""}" type="range" min="0" max="100" value="${value}" style="--blueprint-value: ${value}%"></label>`;
  const progress = (label, value, danger = false) => `<div><p class="demo-blueprint-row"><span class="blueprint-overline">${label}</span><span>${value}%</span></p><div class="blueprint-progress${danger ? " blueprint-progress-danger" : ""}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="blueprint-progress-bar" style="--blueprint-progress-value: ${value}%"></span></div></div>`;
  const ranges = `<div class="demo-blueprint-form-grid"><div class="demo-blueprint-stack">${range("dimension", "Dimension", 62)}${range("tolerance", "Tolerance", 76, true)}<div><p class="demo-blueprint-row"><span class="blueprint-overline">Load limit</span><span>72%</span></p><div class="blueprint-meter" role="meter" aria-label="Load limit" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" style="--blueprint-value: 72%"></div><span class="blueprint-helper">Nominal / review / exceeded</span></div></div><div class="demo-blueprint-stack">${progress("Linear completion", 64)}${progress("Revision progress", 38, true)}<ol class="blueprint-stepper" aria-label="Drawing workflow">${["Draft", "Review", "Approval", "Published"].map((label, i) => `<li class="blueprint-step${i < 2 ? " is-complete" : i === 2 ? " is-active" : ""}"${i === 2 ? ' aria-current="step"' : ""}><b>${i < 2 ? `${icon("check")}<span class="blueprint-sr-only">Completed</span>` : i + 1}</b><span>${label}</span></li>`).join("")}</ol></div></div>`;
  const alerts = `<div class="demo-blueprint-form-grid">${[["", "info", "Info: Revision D is ready for review"], ["success", "circle-check", "Success: Tolerance check complete"], ["warning", "triangle-alert", "Warning: Dimension exceeds nominal"], ["danger", "circle-x", "Error: Material callout unresolved"]].map(([variant, symbol, label]) => `<div class="blueprint-alert${variant ? ` blueprint-alert-${variant}` : ""}" role="status">${icon(symbol)}<span>${label}</span></div>`).join("")}</div>
    <div class="blueprint-toast" role="status">${icon("check")}<div><strong>Drawing package synchronized</strong><p data-blueprint-status>Sheet A2 and its references are current.</p></div></div><hr class="blueprint-divider"><div class="demo-blueprint-loading"><span class="blueprint-spinner" role="status" aria-label="Loading"></span><div class="demo-blueprint-stack"><span class="blueprint-skeleton" aria-hidden="true"></span><span class="blueprint-skeleton" style="width: 70%" aria-hidden="true"></span></div><span class="blueprint-overline">Loading / skeleton</span></div>`;
  const navigation = `<nav class="blueprint-breadcrumb" aria-label="Drawing breadcrumb"><a href="#overview">Project</a><span aria-hidden="true">/</span><a href="#components">M-204</a><span aria-hidden="true">/</span><span aria-current="page">Sheet A2</span></nav>
    <div class="blueprint-tabs" role="tablist" aria-label="Project views">${["Drawing", "Details", "Notes", "Specs"].map((label, i) => `<button id="blueprint-tab-${i}" class="blueprint-tab${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" aria-controls="blueprint-project-panel" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join("")}</div><div id="blueprint-project-panel" role="tabpanel" aria-labelledby="blueprint-tab-0" tabindex="0">Drawing: Sheet A2</div>
    <nav class="blueprint-nav" aria-label="Drawing sheets">${["Sheet", "Split H", "Split V", "3D view"].map((label, i) => `<a class="blueprint-nav-link${i === 0 ? " is-active" : ""}" href="#technical-blueprint-template"${i === 0 ? ' aria-current="page"' : ""} data-blueprint-navigation>${label}</a>`).join("")}</nav>
    <p class="blueprint-helper" data-pagination-status>Showing 21-40 of 114</p><nav class="blueprint-pagination" aria-label="Sheet pagination"><button class="blueprint-pagination-page" aria-label="Previous page" data-page-delta="-1">${icon("chevron-left")}</button>${[1, 2, 3, 4, 5, 6].map((page) => `<button class="blueprint-pagination-page" data-page="${page}"${page === 2 ? ' aria-current="page"' : ""}>${page}</button>`).join("")}<button class="blueprint-pagination-page" aria-label="Next page" data-page-delta="1">${icon("chevron-right")}</button></nav>`;
  const data = `<div class="demo-blueprint-table-scroll"><table class="blueprint-table"><caption class="blueprint-sr-only">Bill of materials</caption><thead><tr><th scope="col">Item</th><th scope="col">Part no.</th><th scope="col">Status</th><th scope="col">Material</th><th scope="col">Qty</th></tr></thead><tbody>${[["01", "M-204-01", "Released", "success", "6061-T6", "1"], ["02", "M-204-02", "Review", "primary", "NBR 70A", "2"], ["03", "M-204-03", "Hold", "warning", "12.9", "4"], ["04", "M-204-07", "Revision", "danger", "9310", "1"]].map(([file, owner, status, variant, type, size]) => `<tr><td>${file}</td><td>${owner}</td><td><span class="blueprint-badge blueprint-badge-${variant}">${status}</span></td><td>${type}</td><td>${size}</td></tr>`).join("")}</tbody></table></div>
    <div class="demo-blueprint-data-footer"><div class="demo-blueprint-row"><span class="blueprint-badge blueprint-badge-primary">New</span><span class="blueprint-badge blueprint-badge-success">Complete</span><span class="blueprint-badge blueprint-badge-warning">Warning</span><span class="blueprint-badge blueprint-badge-danger">Blocked</span><span class="blueprint-badge">Archived</span></div><div class="demo-blueprint-row"><div class="blueprint-avatar-group" aria-label="Reference datums"><span class="blueprint-avatar" aria-label="Datum A">A</span><span class="blueprint-avatar blueprint-avatar-danger" aria-label="Datum B">B</span><span class="blueprint-avatar blueprint-avatar-neutral" aria-label="Three more members">+3</span></div><span class="blueprint-quote"><strong>83%</strong> assembly complete</span></div></div>`;
  const overlays = `<div class="demo-blueprint-form-grid"><div class="demo-blueprint-stack"><span class="blueprint-tooltip" role="tooltip" id="blueprint-detail-tooltip">Leader callout: Detail A</span><div class="blueprint-popover"><strong>Detail A / scale 2:1</strong><p>Choose an operation for the selected drawing.</p><button class="blueprint-button" data-blueprint-menu-toggle aria-expanded="false" aria-haspopup="menu" aria-controls="blueprint-file-menu" aria-describedby="blueprint-detail-tooltip">Open menu</button><div class="blueprint-dropdown" id="blueprint-file-menu" role="menu" aria-label="Detail A / scale 2:1" hidden><button class="blueprint-option" role="menuitem">Duplicate document</button><button class="blueprint-option" role="menuitem">Move to archive</button></div></div></div><div class="demo-blueprint-stack"><div class="blueprint-modal"><h4>Release package?</h4><p>Issue sheet A2 and references<br>for manufacturer review?</p><div class="blueprint-modal-actions"><button class="blueprint-button blueprint-button-ghost" data-blueprint-cancel>Cancel</button><button class="blueprint-button blueprint-button-danger" data-blueprint-modal-open>Confirm</button></div></div><details class="blueprint-accordion" open><summary>Drawing details</summary><p>Disclosure rows retain a crisp information hierarchy.</p></details></div></div>
    <dialog class="blueprint-modal" data-blueprint-dialog aria-labelledby="blueprint-dialog-title"><form method="dialog"><h3 id="blueprint-dialog-title">Release package?</h3><p>Release the sample drawing package for review?</p><div class="blueprint-modal-actions"><button class="blueprint-button" value="cancel" autofocus>Cancel release</button><button class="blueprint-button blueprint-button-danger" value="confirm">Release package</button></div></form></dialog>`;
  const foundations = `<div class="demo-blueprint-foundations"><div><p class="blueprint-overline">Typography / DejaVu Sans + Mono</p><h4 class="blueprint-title">Drawing heading</h4><h5 class="blueprint-section-title">Section callout</h5><p class="blueprint-copy">Measured notes align to the construction grid.</p></div><div><p class="blueprint-overline">Semantic color tokens</p><div class="demo-blueprint-swatches">${swatches([["primary", "Primary"], ["danger", "Revision"], ["warning", "Tolerance"], ["success", "Approved"], ["text", "Text"], ["text-muted", "Muted"]])}</div></div><div><p class="blueprint-overline">Spacing / line weight / states</p><div class="demo-blueprint-spacing" aria-label="Spacing: 4, 8, 12, 16, 24, 32 pixels">${[4, 8, 12, 16, 24, 32].map((size) => `<span style="--demo-blueprint-space: ${size}px">${size}</span>`).join("")}</div><div class="demo-blueprint-lines" aria-label="Line weights: 1, 1.5, and 2 pixels">${[1, 1.5, 2].map((weight) => `<span class="blueprint-line-swatch" style="--blueprint-line-weight: ${weight}px" aria-hidden="true"></span>`).join("")}<span class="blueprint-helper">1 / 1.5 / 2 px</span></div><div class="demo-blueprint-row"><span class="blueprint-badge">Default</span><span class="blueprint-badge blueprint-badge-primary">Hover</span><span class="blueprint-badge blueprint-badge-primary">Focus</span><span class="blueprint-badge blueprint-badge-warning">Pressed</span><span class="blueprint-badge blueprint-badge-danger">Error</span></div></div><div><p class="blueprint-overline">Design rules</p><ol class="blueprint-list"><li>Primary blue: selection, focus, measured values.</li><li>Revision red: destructive or changed state.</li><li>Use square geometry and a 16px construction grid.</li><li>Keep condensed labels precise and readable.</li></ol></div></div>`;
  return `<section id="technical-blueprint-template" class="blueprint-sheet demo-technical-blueprint-specimen" data-preset-only="technical-blueprint" data-testid="technical-blueprint-template-specimen" aria-label="Technical Blueprint reference board">
    <div class="demo-blueprint-header"><header class="blueprint-toolbar demo-blueprint-brand"><span class="blueprint-datum" aria-hidden="true">TB</span><div><h2>Technical Blueprint <span>UI preset / control library</span></h2><p class="blueprint-overline">Element reference v1.0 / Rev A / ${escapeHtml(modeSelect.value)}</p></div></header><div class="blueprint-toolbar"><p class="blueprint-overline">Drawing ink palette</p><div class="demo-blueprint-swatches">${swatches([["bg", "Paper"], ["surface", "Panel"], ["text", "Ink"], ["primary", "Primary"], ["danger", "Revision"], ["warning", "Tolerance"], ["success", "Approved"]])}</div></div><div class="blueprint-toolbar demo-blueprint-profile"><div><p class="blueprint-overline">Drawing profile</p><strong>Measured / drafted</strong><p class="blueprint-helper">16px construction grid<br>Thin / standard / heavy</p></div><button class="blueprint-button blueprint-button-secondary" data-blueprint-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">${escapeHtml(modeSelect.value)}</button></div></div>
    <div class="demo-blueprint-grid">${board("action-states", "Buttons & action states", actions)}${board("form-inputs", "Form inputs", forms)}${board("choices-tags", "Choices, toggles & tags", choices)}${board("select-upload", "Select, multiselect & upload", selects)}${board("range-progress", "Sliders, progress & meters", ranges)}${board("alerts-loading", "Alerts, toasts & loading", alerts)}${board("navigation", "Navigation", navigation)}${board("data-display", "Data display, badges & avatars", data)}${board("overlays-disclosure", "Overlays & disclosure", overlays)}${board("foundations", "Foundations, tokens & rules", foundations)}</div></section>`;
}

/**
 * Binds specimen controls using native inputs and dialog focus management.
 * @returns {void}
 */
function bindBlueprintSpecimen() {
  const root = document.querySelector('[data-testid="technical-blueprint-template-specimen"]');
  if (!root) return;
  const status = root.querySelector("[data-blueprint-status]");
  const announce = (message) => { status.textContent = message; };
  root.querySelector("[data-blueprint-reference]").addEventListener("click", () => {
    selectReferencePalette();
    document.querySelector("[data-blueprint-reference]").focus({ preventScroll: true });
  });
  root.querySelectorAll(".blueprint-range").forEach((range) => {
    range.addEventListener("input", () => {
      range.style.setProperty("--blueprint-value", `${range.value}%`);
      root.querySelector(`output[for="${range.id}"]`).value = range.value;
    });
  });
  root.querySelectorAll("[data-blueprint-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll("[data-blueprint-segment]").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === button));
        other.classList.toggle("is-active", other === button);
      });
      announce(`${button.textContent} view selected.`);
    });
  });
  const bindRoving = (container, selector, activate) => {
    container.addEventListener("click", (event) => {
      const item = event.target.closest(selector);
      if (item && !item.disabled) activate(item);
    });
    container.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const items = [...container.querySelectorAll(selector)].filter((item) => !item.disabled && !item.hidden);
      const current = items.indexOf(document.activeElement);
      if (current < 0 || !items.length) return;
      event.preventDefault();
      const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 :
        (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + items.length) % items.length;
      activate(items[index]);
      items[index].focus();
    });
  };
  const tabs = root.querySelector('[role="tablist"]');
  bindRoving(tabs, '[role="tab"]', (tab) => {
    tabs.querySelectorAll('[role="tab"]').forEach((other) => {
      other.setAttribute("aria-selected", String(other === tab));
      other.classList.toggle("is-active", other === tab);
      other.tabIndex = other === tab ? 0 : -1;
    });
    const panel = root.querySelector('[role="tabpanel"]');
    panel.setAttribute("aria-labelledby", tab.id);
    panel.textContent = `${tab.textContent}: Sheet A2`;
  });
  const options = root.querySelector('[role="listbox"]');
  bindRoving(options, '[role="option"]', (option) => {
    options.querySelectorAll('[role="option"]').forEach((other) => {
      other.setAttribute("aria-selected", String(other === option));
      other.classList.toggle("is-selected", other === option);
      other.tabIndex = other === option ? 0 : -1;
      other.querySelector('[data-option-check]').hidden = other !== option;
    });
    announce(`${option.textContent.trim()} selected.`);
  });
  root.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-remove-tag]");
    if (tag) {
      const next = tag.nextElementSibling || tag.previousElementSibling;
      announce(`${tag.textContent.trim()} removed.`);
      tag.remove();
      next?.focus();
    }
  });
  root.querySelector("[data-add-filter]").addEventListener("click", (event) => {
    const button = document.createElement("button");
    button.className = "blueprint-chip";
    button.dataset.removeTag = "";
    button.setAttribute("aria-label", "Remove Assigned filter");
    button.innerHTML = `Assigned ${blueprintIcon("x")}`;
    event.currentTarget.before(button);
    button.focus();
    announce("Assigned filter added.");
  });
  const fileInput = root.querySelector('input[type="file"]');
  const showFiles = (files) => { root.querySelector("[data-file-status]").textContent = [...files].map((file) => file.name).join(", ") || "or browse device"; };
  fileInput.addEventListener("change", () => showFiles(fileInput.files));
  const fileWell = fileInput.closest(".blueprint-file");
  fileWell.addEventListener("dragover", (event) => event.preventDefault());
  fileWell.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      fileInput.files = event.dataTransfer.files;
      showFiles(fileInput.files);
    }
  });
  const pagination = root.querySelector(".blueprint-pagination");
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const current = Number(pagination.querySelector('[aria-current="page"]').dataset.page);
    const page = Math.max(1, Math.min(6, button.dataset.page ? Number(button.dataset.page) : current + Number(button.dataset.pageDelta)));
    pagination.querySelectorAll("[data-page]").forEach((item) => {
      if (Number(item.dataset.page) === page) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    root.querySelector("[data-pagination-status]").textContent = `Showing ${(page - 1) * 20 + 1}-${Math.min(page * 20, 114)} of 114`;
  });
  root.querySelectorAll("[data-blueprint-navigation]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      root.querySelectorAll("[data-blueprint-navigation]").forEach((other) => {
        other.classList.toggle("is-active", other === link);
        if (other === link) other.setAttribute("aria-current", "page");
        else other.removeAttribute("aria-current");
      });
      announce(`${link.textContent} selected.`);
    });
  });
  const menu = root.querySelector('[role="menu"]');
  const menuToggle = root.querySelector("[data-blueprint-menu-toggle]");
  const closeMenu = () => { menu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); menuToggle.focus(); };
  menuToggle.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    menuToggle.setAttribute("aria-expanded", String(!menu.hidden));
    if (!menu.hidden) menu.querySelector("button").focus();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
    if (event.key === "Tab") { menu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); }
  });
  bindRoving(menu, '[role="menuitem"]', (item) => item.focus());
  menu.addEventListener("click", (event) => {
    if (event.target.closest("button")) { announce(`${event.target.closest("button").textContent} complete.`); closeMenu(); }
  });
  const dialog = root.querySelector("[data-blueprint-dialog]");
  const opener = root.querySelector("[data-blueprint-modal-open]");
  opener.addEventListener("click", () => dialog.showModal());
  root.querySelector("[data-blueprint-cancel]").addEventListener("click", () => announce("Release cancelled."));
  dialog.addEventListener("close", () => {
    announce(dialog.returnValue === "confirm" ? "Sample drawing package released for review." : "Release cancelled.");
    opener.focus();
  });
}

function getSurfaceVariant(element) {
  const className = element.getAttribute("class") || "";
  const inputType = element.getAttribute("type");

  if (element.matches("[aria-current='page'], [aria-pressed='true'], .is-active")) return "primary";
  if (className.includes("-button-danger") || inputType === "reset") return "danger";
  if (className.includes("-button-secondary")) return "secondary";
  if (className.includes("-button-primary") || inputType === "submit" || inputType === "button") return "primary";

  return "subtle";
}

function getSurfaceLevel(element) {
  const inputType = element.getAttribute("type");

  if (element.matches("[aria-current='page'], [aria-pressed='true'], .is-active, [aria-busy='true']")) return "3";
  if (element.matches("button, select, summary, audio[controls], video[controls]")) return "2";
  if (["button", "submit", "reset"].includes(inputType)) return "2";

  return "1";
}

function syncInteractiveSurfaceHooks(isAttached) {
  const elements = document.querySelectorAll(interactiveSurfaceSelector);

  elements.forEach((element) => {
    if (!isAttached) {
      element.classList.remove("interactive-surface");
      delete element.dataset.surfaceVariant;
      delete element.dataset.surfaceLevel;
      return;
    }

    element.classList.add("interactive-surface");
    element.dataset.surfaceVariant = getSurfaceVariant(element);
    element.dataset.surfaceLevel = getSurfaceLevel(element);
  });
}

function updateBridge() {
  const bridgeToggle = document.getElementById("bridgeToggle");
  const bridgeStatus = document.querySelector("[data-testid='bridge-status']");
  const isAttached = bridgeToggle ? bridgeToggle.checked : bridgeAttached;

  bridgeAttached = isAttached;

  document.body.dataset.bridge = isAttached ? "attached" : "detached";
  styleKitStylesheet.setAttribute("href", isAttached ? bridgeAwareBundle : defaultBundle);
  if (bridgeStatus) {
    bridgeStatus.textContent = isAttached
      ? "Attached - using with-bridge bundle"
      : "Detached - default bundle";
  }
  // The bridge stylesheet owns the surface visuals; the demo only attaches the expected hooks.
  syncInteractiveSurfaceHooks(isAttached);
}

/**
 * Keeps feature deep links within their owning top-level navigation section.
 * @param {string} targetId Current in-page anchor.
 * @returns {void}
 */
function syncPrimaryNavCurrent(targetId = "overview") {
  const nav = main.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;
  const sectionId = targetId === "style-specific" ? "components" : targetId;

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isCurrent);

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function bindPrimaryNav() {
  const nav = main.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      syncPrimaryNavCurrent(link.getAttribute("href").slice(1));
    });
  });
}

function drawDemoCanvas() {
  const canvas = document.querySelector("[data-demo-canvas]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const styles = getComputedStyle(document.body);
  const primary = styles.getPropertyValue(`--${stylePrefixes[uiSelect.value]}-primary`).trim() || "#6f8cff";
  const accent = styles.getPropertyValue(`--${stylePrefixes[uiSelect.value]}-accent`).trim() || "#ffcc66";

  // Canvas is drawn after render so the native canvas element is visibly represented.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(canvas.width * .72, canvas.height * .46, canvas.height * .28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, .72)";
  ctx.fillRect(canvas.width * .08, canvas.height * .2, canvas.width * .42, canvas.height * .12);
  ctx.fillRect(canvas.width * .08, canvas.height * .42, canvas.width * .3, canvas.height * .12);
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
  if (ui === "organic-modern") return window.ORGANIC_PHOSPHOR_ICONS[name];
  if (ui === "retro-glass" && name === "check") return retroGlassIcon(name);
  if (ui === "clay"
    || (ui === "neo-noir" && name === "arrow-right")
    || (ui === "maximalist" && ["star", "check", "arrow-right"].includes(name))) {
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
          <p class="${p}-subtitle demo-section-lede">A CSS-only style kit with 20 UI systems, 20 shared color themes, light/dark/contrast modes, component classes, native HTML coverage, and an optional Interactive Surface bridge.</p>
          <p class="${p}-copy"><a href="${isTemplateReferenceView() ? "#components" : "#style-specific"}">Explore ${title}’s distinctive components</a></p>
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

          <div class="demo-showcase-grid demo-component-grid">
            <article class="${p}-card demo-control-card" data-testid="component-controls">
              <p class="${p}-kicker">Controls</p>
              <h3 class="${p}-heading">Buttons, progress, loading, and tooltips</h3>
              <div class="demo-control-showcase">
                <section class="demo-control-panel" data-testid="component-buttons">
                  <h4>Button variants</h4>
                  <div class="demo-button-row">
                    <button class="${p}-button ${p}-button-primary">Primary</button>
                    <button class="${p}-button ${p}-button-secondary">Secondary</button>
                    <button class="${p}-button">Neutral</button>
                    <button class="${p}-button ${p}-button-warning">Warning</button>
                    <button class="${p}-button ${p}-button-danger${p === 'utility' ? ' is-alarm' : ''}">Danger</button>
                    <button class="${p}-button ${p}-button-ghost">Ghost</button>
                    <button class="${p}-icon-button" aria-label="Icon action">?</button>
                  </div>
                </section>

                <section class="demo-control-panel" data-testid="component-progress">
                  <h4>Progress</h4>
                  <div class="demo-progress-stack">
                    <div class="${p}-progress" role="progressbar" aria-label="Component progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68"><div class="${p}-progress-bar" style="--${p}-progress-value: 68%"></div></div>
                    <div class="${p}-progress" role="progressbar" aria-label="Secondary progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="34"><div class="${p}-progress-bar" style="--${p}-progress-value: 34%"></div></div>
                  </div>
                </section>

                <section class="demo-control-panel" data-testid="component-spinner">
                  <h4>Loading</h4>
                  <div class="demo-button-row">
                    <span class="${p}-spinner ${p}-spinner-sm" role="status" aria-label="Small loading spinner"></span>
                    <span class="${p}-spinner" role="status" aria-label="Loading spinner"></span>
                    <span class="${p}-spinner ${p}-spinner-lg" role="status" aria-label="Large loading spinner"></span>
                    <span class="ui-spinner" data-loading-spinner role="status" aria-label="Native loading spinner"></span>
                  </div>
                </section>

                <section class="demo-control-panel" data-testid="component-tooltips">
                  <h4>Visible tooltips</h4>
                  <div class="demo-tooltip-row">
                    <span class="${p}-tooltip ${p}-tooltip-top" role="tooltip" data-testid="tooltip-primary">Primary tip<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                    <span class="${p}-tooltip ${p}-tooltip-right" role="tooltip" data-testid="tooltip-secondary">Context cue<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                    <span class="${p}-tooltip ${p}-tooltip-bottom" role="tooltip" data-testid="tooltip-accent">Action hint<span class="${p}-tooltip-arrow" aria-hidden="true"></span></span>
                  </div>
                </section>
              </div>
            </article>

            <article class="${p}-card" data-testid="component-buttons-states">
              <p class="${p}-kicker">States</p>
              <h3 class="${p}-heading">Interactive states</h3>
              <div class="demo-state-grid">
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
              <div class="demo-form-grid">
                <label class="${p}-field"><span class="${p}-label">Text input</span><input class="${p}-input" value="Styled input"><span class="${p}-help-text">Help text</span></label>
                <label class="${p}-field"><span class="${p}-label">Select</span><select class="${p}-select"><option>Default</option><option>Alternate</option></select></label>
                <label class="${p}-field"><span class="${p}-label">Textarea</span><textarea class="${p}-textarea">Styled textarea content.</textarea></label>
              </div>
              ${renderChoiceControls(ui, p)}
            </article>

            <article class="${p}-card" data-testid="component-badges">
              <p class="${p}-kicker">Badges</p>
              <h3 class="${p}-heading">Status badges</h3>
              <div class="demo-badge-showcase">
                <div class="demo-badge-group">
                  <p class="demo-badge-label">Color roles</p>
                  <div class="demo-badge-row">
                    <span class="${p}-badge">Neutral</span>
                    <span class="${p}-badge ${p}-badge-primary">Primary</span>
                    <span class="${p}-badge ${p}-badge-secondary">Secondary</span>
                    <span class="${p}-badge ${p}-badge-success">Success</span>
                    <span class="${p}-badge ${p}-badge-warning">Warning</span>
                    <span class="${p}-badge ${p}-badge-danger">Danger</span>
                  </div>
                </div>
                <div class="demo-badge-group">
                  <p class="demo-badge-label">Workflow</p>
                  <div class="demo-badge-row">
                    <span class="${p}-badge ${p}-badge-primary">Draft</span>
                    <span class="${p}-badge ${p}-badge-secondary">Review</span>
                    <span class="${p}-badge ${p}-badge-success">Ready</span>
                    <span class="${p}-badge ${p}-badge-warning">Blocked</span>
                  </div>
                </div>
                <div class="demo-badge-group">
                  <p class="demo-badge-label">Counts</p>
                  <div class="demo-badge-row">
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

            <article class="${p}-table-wrap demo-table-card" data-testid="component-table">
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
            <div class="demo-marketing-grid">
              <article class="${p}-card ${p}-card-service">
                <img class="${p}-card-media demo-theme-art demo-theme-art-service" style="--demo-art-primary: var(--${p}-primary); --demo-art-secondary: var(--${p}-secondary); --demo-art-accent: var(--${p}-accent); --demo-art-surface: var(--${p}-surface-strong)" alt="Abstract service preview using the active theme" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cpath d='M0 290L220 120l120 82 128-110 172 150v118H0z' fill='%23ffffff' fill-opacity='.24'/%3E%3Ccircle cx='510' cy='95' r='58' fill='%23ffffff' fill-opacity='.68'/%3E%3C/svg%3E">
                <span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, "star", "★")}</span>
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
              <div class="${p}-feature-item"><span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, "check", "✓")}</span><div><strong>Trusted</strong><p>Compact proof point.</p></div></div>
              <div class="${p}-feature-item"><span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, "diamond", "◆")}</span><div><strong>Quality</strong><p>Theme-aware treatment.</p></div></div>
              <div class="${p}-feature-item"><span class="${p}-badge-seal"><strong>15</strong><small>YEARS</small></span><div><strong>Established</strong><p>Seal-style trust mark.</p></div></div>
            </div>

            <aside class="${p}-callout-bar">
              <span class="${p}-icon-medallion" aria-hidden="true">${renderMedallionIcon(ui, "arrow-right", "→")}</span>
              <div><p class="${p}-eyebrow">Call to action</p><strong>Give important next steps a dedicated visual lane.</strong></div>
              <a data-testid="marketing-secondary-cta" class="${p}-button ${p}-button-outline-heavy" href="#usage">View Usage</a>
            </aside>
          </article>
        </section>


        <section class="${p}-card" data-testid="utility-classes">
          <p class="${p}-kicker">Utilities</p>
          <h2 class="${p}-heading">Text, surfaces, layout, and style-specific utilities</h2>
          <div class="demo-token-grid">
            <div class="demo-token-sample" data-testid="utility-color-grid">
              <p class="demo-utility-label">Color utilities</p>
              <div class="demo-color-chip-grid">
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-primary)"><span class="demo-color-swatch"></span><span><strong>Primary</strong><small>Action emphasis</small></span></div>
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-secondary)"><span class="demo-color-swatch"></span><span><strong>Secondary</strong><small>Supporting action</small></span></div>
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-accent)"><span class="demo-color-swatch"></span><span><strong>Accent</strong><small>Highlight note</small></span></div>
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-success)"><span class="demo-color-swatch"></span><span><strong>Success</strong><small>Positive state</small></span></div>
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-warning)"><span class="demo-color-swatch"></span><span><strong>Warning</strong><small>Needs review</small></span></div>
                <div class="demo-color-chip" data-testid="utility-color-chip" style="--demo-token-color: var(--${p}-danger)"><span class="demo-color-swatch"></span><span><strong>Danger</strong><small>Blocking state</small></span></div>
              </div>
            </div>
            <div class="demo-token-sample" data-testid="utility-surface-grid">
              <p class="demo-utility-label">Surface utilities</p>
              <div class="demo-utility-surface-grid">
                <div class="${p}-well demo-utility-surface"><strong>Inset content</strong><span class="${p}-text-muted">Well utility</span></div>
                <div class="${p}-well ${p}-surface-sm demo-utility-surface"><strong>Compact inset</strong><span class="${p}-text-muted">Small surface</span></div>
                <div class="${p}-bg-primary ${p}-rounded-lg demo-utility-surface"><strong>Primary fill</strong><span>Background utility</span></div>
              </div>
            </div>
            <div class="demo-token-sample" data-testid="utility-layout-sample">
              <p class="demo-utility-label">Shape and layout utilities</p>
              <div class="demo-utility-shape-grid">
                <div class="${p}-pill demo-utility-shape"><code>.${p}-pill</code><span>Pill shape</span></div>
                <div class="${p}-rounded demo-utility-shape"><code>.${p}-rounded</code><span>Rounded corners</span></div>
                <div class="${p}-border demo-utility-shape"><code>.${p}-border</code><span>Border utility</span></div>
              </div>
              <span class="${p}-text-muted">Muted annotation</span>
              <hr class="${p}-divider">
              ${isTemplateReferenceView() ? renderStyleSpecificSurface(ui, p) : ""}
            </div>
          </div>
        </section>

        <section id="native" class="${p}-stack">
          <div class="demo-section-lede">
            <p class="${p}-kicker">Native HTML</p>
            <h2 class="${p}-heading">Unclassed elements styled by <code>data-ui</code></h2>
            <p class="${p}-copy">These samples use semantic HTML without UI Style Kit component classes, so the native fallback selectors are visible.</p>
          </div>

          <div class="demo-native-grid">
            <section class="${p}-panel demo-native-sample" data-testid="native-text">
              <h1>Native heading h1</h1>
              <h2>Native heading h2</h2>
              <h3>Native heading h3</h3>
              <p>Paragraph text with a <a href="#native">link</a>, <mark>mark</mark>, <code>code</code>, <kbd>Ctrl</kbd>, <samp>sample</samp>, <abbr title="Accessible Rich Internet Applications">ARIA</abbr>, <small>small text</small>, <strong>strong</strong>, <em>emphasis</em>, <q>quote</q>, <ins>inserted</ins>, <del>deleted</del>, H<sub>2</sub>O, x<sup>2</sup>, <time datetime="2026-06-22">June 22, 2026</time>, <data value="20">20 tokens</data>, and <dfn>definition</dfn>.</p>
              <p><ruby>UI<rt>style</rt></ruby> <output>Output value</output></p>
              <blockquote>Native blockquote styling is part of the fallback surface.</blockquote>
              ${renderCodeBlock(`button:not([class]) {
  color: var(--${p}-on-primary);
}`, "css")}
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

            <section class="${p}-panel demo-native-sample" data-testid="native-forms">
              <h3>Forms</h3>
              <fieldset>
                <legend>Native fieldset</legend>
                <div class="demo-form-grid">
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
                <div class="demo-inline-row">
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
              <div class="demo-button-row">
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
              <div class="demo-native-table-scroll">
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
          <label class="demo-switch-control" data-testid="bridge-switch">
            <input id="bridgeToggle" type="checkbox" role="switch" />
            <span class="demo-switch-track" data-testid="bridge-switch-track" aria-hidden="true">
              <span class="demo-switch-thumb" data-testid="bridge-switch-thumb"></span>
            </span>
            <span class="demo-switch-copy">
              <strong>Attach interactive surface bridge</strong>
              <span data-testid="bridge-status">Detached - default bundle</span>
            </span>
          </label>
          <div class="demo-bridge-grid">
            <div class="interactive-surface" data-surface-variant="subtle" data-surface-level="1" data-testid="bridge-level-1"><strong>Level 1 surface</strong><small>Subtle rest layer for quiet inline interactions.</small></div>
            <div class="interactive-surface" data-surface-variant="secondary" data-surface-level="2" data-testid="bridge-level-2"><strong>Level 2 surface</strong><small>Raised state for controls, selects, and grouped actions.</small></div>
            <div class="interactive-surface" data-surface-variant="primary" data-surface-level="3" data-testid="bridge-level-3"><strong>Level 3 surface</strong><small>Prominent active state with the strongest state layer.</small></div>
          </div>
        </section>

        <section id="usage" class="${p}-card" data-testid="usage-imports">
          <p class="${p}-kicker">Usage</p>
          <h2 class="${p}-heading">Import paths and data attributes</h2>
          <div class="demo-showcase-grid">
            ${renderCodeBlock(`import "ui-style-kit-css";

document.body.dataset.ui = "${ui}";
${getThemeUsageStatement()}
document.body.dataset.mode = "${modeSelect.value}";`, "js")}
            ${renderCodeBlock(`import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/native-elements.css";
import "ui-style-kit-css/${ui}.css";`, "js")}
            ${renderCodeBlock(`import "ui-style-kit-css/with-bridge.css";
import "ui-style-kit-css/interactive-surface-bridge.css";`, "js")}
          </div>
          <p class="${p}-copy">Choose <strong>None — style defaults</strong> to omit <code>data-theme</code> and use the preset’s native colors. Keep <code>data-ui</code> and <code>data-mode</code> set. A named theme overrides colors without replacing component classes; the theme-colors import is optional for standalone native-palette usage.</p>
        </section>
      </div>
    </section>`;

  const bridgeToggle = document.getElementById("bridgeToggle");
  bindPrimaryNav();
  bindThemeTokenControls();
  bindCodeCopyButtons();
  bindNativeDialogDemo();
  bindNativeSemanticStates();
  syncPresetSpecificVisibility();
  bindRetroGlassSpecimen();
  bindBlueprintSpecimen();
  bindIndustrialSpecimen();
  bindStyleSpecificGallery();
  bindPaperEditorialSpecimen();
  window.OrganicSpecimen.bind(selectReferencePalette, (mode) => {
    modeSelect.value = mode;
    render();
  });
  window.ClaySpecimen.bind((mode) => {
    modeSelect.value = mode;
    render();
  });
  window.BentoSpecimen.bind(selectReferencePalette, (mode) => {
    modeSelect.value = mode;
    render();
  });
  window.BauhausSpecimen.bind(selectReferencePalette, (mode) => {
    modeSelect.value = mode;
    render();
  });
  window.EditorialLuxSpecimen.bind(selectReferencePalette);
  window.NeoNoirSpecimen.bind(selectReferencePalette);
  window.ArtDecoSpecimen.bind(selectReferencePalette);
  syncPrimaryNavCurrent(window.location.hash.slice(1) || "overview");
  if (bridgeToggle) {
    bridgeToggle.checked = bridgeAttached;
    bridgeToggle.addEventListener("change", updateBridge);
  }
  drawDemoCanvas();
  updateBridge();
}

syncManifestSelectOptions();
applyDemoQuerySelection();
hydrateDemoIcons();

uiSelect.addEventListener("change", () => { render(); });
themeSelect.addEventListener("change", render);
modeSelect.addEventListener("change", render);
window.addEventListener("hashchange", () => syncPrimaryNavCurrent(window.location.hash.slice(1) || "overview"));
render();
