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
const stylesWithCustomChoices = new Set([
  "minimal-saas",
  "bento",
  "maximalist",
  "bauhaus",
  "tactile",
  "neumorphism",
  "retrofuturism"
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

function syncManifestSelectOptions() {
  const currentUi = uiSelect.value || "minimal-saas";
  const currentTheme = themeSelect.value || "arctic-indigo";
  const currentMode = modeSelect.value || "light";

  uiSelect.replaceChildren(...demoManifest.presets.map(({ id, label, prefix }) => {
    const option = document.createElement("option");
    option.value = id;
    option.dataset.prefix = prefix;
    option.textContent = label;
    option.selected = id === currentUi;
    return option;
  }));

  themeSelect.replaceChildren(...demoManifest.themes.map((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme;
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

function getThemeOverrideKey() {
  return `${themeSelect.value}|${modeSelect.value}`;
}

function getThemeOverrideSelector() {
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
  colorTokenRoles.forEach((role) => {
    document.body.style.removeProperty(`--usk-${role}-rgb`);
  });
}

function applyActiveTokenOverrides() {
  clearInlineColorTokens();

  getStoredTokenOverrides().forEach((value, role) => {
    document.body.style.setProperty(`--usk-${role}-rgb`, value);
  });
}


/**
 * Get the currently active color tokens from the computed styles of the document body.
 * @returns {Array<{role: string, name: string, value: string}>} - An array of active color token objects.
 */
function getActiveColorTokens() {
  const computedStyles = getComputedStyle(document.body);

  return colorTokenRoles
    .map((role) => {
      const value = normalizeRgbChannels(computedStyles.getPropertyValue(`--usk-${role}-rgb`));

      return value && rgbChannelPattern.test(value)
        ? { role, name: `--usk-${role}-rgb`, value }
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
  if (!normalized) return "";

  getStoredTokenOverrides().set(role, normalized);
  document.body.style.setProperty(`--usk-${role}-rgb`, normalized);
  updateThemeOverridePreview();

  return normalized;
}

/**
 * Reset a color token override for the current theme and mode, updating the document's inline styles and the stored overrides.
 * @param {string} role - The role of the color token to reset.
 */
function resetTokenOverride(role) {
  getStoredTokenOverrides().delete(role);
  document.body.style.removeProperty(`--usk-${role}-rgb`);
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

  return `
    <section id="tokens" class="demo-token-workbench" data-testid="theme-token-workbench">
      <div class="demo-section-lede">
        <p class="demo-token-kicker">Tokens</p>
        <h2>Active theme override workbench</h2>
        <p>Computed RGB channel tokens for <code>${escapeHtml(themeSelect.value)}</code> / <code>${escapeHtml(modeSelect.value)}</code>. Edit values live, then copy a drop-in override block.</p>
      </div>
      <div class="demo-token-actions">
        <button type="button" class="demo-token-copy" data-testid="copy-theme-override">Copy theme override</button>
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
                    <input class="demo-token-input" type="text" inputmode="numeric" value="${escapeHtml(token.value)}" aria-label="${escapeHtml(token.name)} RGB channels">
                  </label>
                  <input class="demo-token-color" type="color" value="${escapeHtml(hexValue)}" aria-label="${escapeHtml(token.name)} color picker">
                  <button type="button" class="demo-token-reset" data-token-reset>Reset</button>
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
    };

    textInput.addEventListener("input", () => {
      const value = setTokenOverride(role, textInput.value);
      syncVisuals(value);
    });

    colorInput.addEventListener("input", () => {
      const value = setTokenOverride(role, hexToRgbChannels(colorInput.value));
      syncVisuals(value);
    });

    row.querySelector("[data-token-reset]").addEventListener("click", () => {
      resetTokenOverride(role);
      const token = getActiveColorTokens().find((item) => item.role === role);
      if (token) syncVisuals(token.value);
    });
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
    brutalism: `
      <button class="${p}-button ${p}-pressed">Pressed block</button>`,
    cyberpunk: `
      <div class="${p}-console"><code>console.surface.ready()</code></div>`,
    y2k: `
      <div class="${p}-bubble">Bubble surface</div>`,
    "retro-glass": `
      <div class="${p}-console"><code>glass.surface.ready()</code></div>`
  };

  return extras[ui] || `<div class="${p}-well">Core surfaces carry this style preset.</div>`;
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

function syncPrimaryNavCurrent(targetId = "overview") {
  const nav = main.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${targetId}`;
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

function render() {
  const ui = uiSelect.value;
  const p = stylePrefixes[ui];
  const title = styleTitles[ui];

  document.body.dataset.ui = ui;
  document.body.dataset.theme = themeSelect.value;
  document.body.dataset.mode = modeSelect.value;
  skip.className = `${p}-skip-link`;
  applyActiveTokenOverrides();

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

        <header id="overview" class="${p}-card ${p}-hover-lift">
          <p class="${p}-kicker">${title}</p>
          <h1 class="${p}-title">UI Style Kit CSS</h1>
          <p class="${p}-subtitle demo-section-lede">A CSS-only style kit with 11 UI systems, 10 shared color themes, light/dark/contrast modes, component classes, native HTML coverage, and an optional Interactive Surface bridge.</p>
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

          <div class="demo-showcase-grid">
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
                    <button class="${p}-button ${p}-button-danger">Danger</button>
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
              <div class="demo-utility-layout-sample">
                <span class="${p}-badge ${p}-pill">Pill shape</span>
                <span class="${p}-badge ${p}-rounded">Rounded</span>
                <span class="${p}-badge ${p}-border">Border utility</span>
                <span class="${p}-text-muted">Muted annotation</span>
              </div>
              <hr class="${p}-divider">
              ${renderStyleSpecificSurface(ui, p)}
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
                  <label>Textarea <textarea>Native textarea</textarea></label>
                  <label>Select <select><optgroup label="Group"><option>Option A</option><option>Option B</option></optgroup></select></label>
                  <label>Invalid <input required aria-invalid="true" placeholder="Required"></label>
                  <label>Disabled <input disabled value="Disabled"></label>
                  <label>Color <input type="color" value="#6f8cff"></label>
                  <label>File <input type="file"></label>
                </div>
                <div class="demo-inline-row">
                  <label><input type="checkbox" checked> Checked</label>
                  <label><input type="checkbox"> Unchecked</label>
                  <label><input type="radio" name="native-radio-${ui}" checked> Radio A</label>
                  <label><input type="radio" name="native-radio-${ui}"> Radio B</label>
                </div>
                <label>Range <input type="range" value="62"></label>
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
              <label>Progress <progress value="72" max="100">72%</progress></label>
              <label>Meter <meter value=".68">68%</meter></label>
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
document.body.dataset.theme = "${themeSelect.value}";
document.body.dataset.mode = "${modeSelect.value}";`, "js")}
            ${renderCodeBlock(`import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/native-elements.css";
import "ui-style-kit-css/${ui}.css";`, "js")}
            ${renderCodeBlock(`import "ui-style-kit-css/with-bridge.css";
import "ui-style-kit-css/interactive-surface-bridge.css";`, "js")}
          </div>
        </section>
      </div>
    </section>`;

  const bridgeToggle = document.getElementById("bridgeToggle");
  bindPrimaryNav();
  bindThemeTokenControls();
  bindCodeCopyButtons();
  bindNativeDialogDemo();
  syncPrimaryNavCurrent(window.location.hash.slice(1) || "overview");
  if (bridgeToggle) {
    bridgeToggle.checked = bridgeAttached;
    bridgeToggle.addEventListener("change", updateBridge);
  }
  drawDemoCanvas();
  updateBridge();
}

syncManifestSelectOptions();

uiSelect.addEventListener("change", render);
themeSelect.addEventListener("change", render);
modeSelect.addEventListener("change", render);
window.addEventListener("hashchange", () => syncPrimaryNavCurrent(window.location.hash.slice(1) || "overview"));
render();
