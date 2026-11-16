/**
 * @module studio/authored/cyberpunk
 * @description Canonical cyberpunk specimen shared by Studio and reference consumers.
 */

import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} _context Unused context; this specimen renders from explicit arguments.
 * @returns {Object} Authored renderer and binder.
 */
function create(_context) {
  /**
   * Renders the retained Cyberpunk template specimen with public cyber-* classes.
   * @param {string} ui - Active style preset identifier.
   * @param {string} p - Active style prefix.
   * @returns {string} Cyberpunk specimen markup or an empty string for other presets.
   */
  function renderCyberpunkTemplateSpecimen(ui, p) {
    if (ui !== 'cyberpunk') return '';

    return `
        <section class="${p}-card demo-cyberpunk-specimen" data-preset-only="cyberpunk" data-testid="cyberpunk-template-specimen">
          <p class="${p}-overline">Retained template surface</p>
          <h2 class="${p}-section-title">Cyberpunk control board</h2>
          <p class="${p}-copy demo-section-lede">The Cyberpunk preset exposes the retained template as first-class <code>cyber-*</code> components that keep identical geometry across light, dark, contrast, and custom token themes.</p>

          <div class="demo-cyberpunk-grid ly-grid">
            <article class="${p}-panel demo-cyberpunk-board" data-testid="cyberpunk-specimen-action-states">
              <h3 class="${p}-section-title">Action states</h3>
              <div class="demo-cyberpunk-state-grid ly-cluster ly-items-center">
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
              <div class="demo-cyberpunk-form-grid ly-grid">
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
              <div class="demo-cyberpunk-choice-grid ly-cluster ly-items-center">
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
              <div class="demo-badge-row ly-cluster ly-items-center">
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
              <div class="demo-cyberpunk-token-grid ly-grid">
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-primary)"><i aria-hidden="true"></i><span><strong>Primary</strong><span>Focus and navigation</span></span></div>
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-danger)"><i aria-hidden="true"></i><span><strong>Danger</strong><span>Critical action</span></span></div>
                <div class="${p}-token-swatch" style="--cyber-token-swatch-color: var(--${p}-warning)"><i aria-hidden="true"></i><span><strong>Warning</strong><span>Needs review</span></span></div>
              </div>
            </article>
          </div>
        </section>`;
  }
  return { render: renderCyberpunkTemplateSpecimen, bind: undefined };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'cyberpunk') return '';
  return create(context).render(context.appearance.ui, context.prefix);
}

/** Binds one mounted specimen and returns its complete resource cleanup.
 * @param {HTMLElement} root Owned content container.
 * @param {Object} context Appearance and callbacks.
 * @param {AbortSignal} signal Parent mount lifetime.
 * @returns {Function} Idempotent cleanup.
 */
export function bind(root, context, signal) {
  const lifetime = createLifetime(signal);
  const owned = { ...context, ...lifetime, root, document: root.ownerDocument };
  try {
    const instance = create(owned);
    instance.bind?.();
  } catch (error) {
    lifetime.dispose();
    throw error;
  }
  return lifetime.dispose;
}

if (typeof window !== 'undefined') {
  window.StudioAuthored ??= {};
  window.StudioAuthored['cyberpunk'] = { render, bind };
}
