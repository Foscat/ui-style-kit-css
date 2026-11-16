/**
 * @module studio/authored/tactile
 * @description Canonical tactile specimen shared by Studio and reference consumers.
 */

import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} context Owned specimen configuration.
 * @returns {Object} Authored renderer and binder.
 */
function create(context) {
  /**
   * Renders the retained Tactile workspace as reusable public tactile-* elements.
   * The specimen intentionally relies on the preset's material tokens so an
   * explicit library theme repaints it without changing its physical geometry.
   *
   * @param {string} ui - Active preset identifier.
   * @returns {string} Complete Tactile workspace markup or an empty string.
   */
  function renderTactileTemplateSpecimen(ui) {
    if (ui !== 'tactile') return '';

    const icon = tactileWorkspaceIcon;

    return `
    <section class="tactile-workspace-shell demo-tactile-specimen ly-grid ly-stack ly-gap-4" data-testid="tactile-template-specimen" aria-label="Tactile workspace reference">
      <aside class="tactile-workspace-sidebar">
        <a class="tactile-workspace-brand" href="#overview" aria-label="Northfield workspace home">
          <span class="tactile-workspace-brand-mark" aria-hidden="true">N</span>
          <span><strong>Northfield</strong><small>Workspace</small></span>
        </a>
        <nav class="tactile-workspace-menu" aria-label="Workspace settings navigation">
          <a class="tactile-workspace-link is-active" href="#tactile-profile" aria-current="page">${icon('settings')}<span>Account</span><small>01</small></a>
          <a class="tactile-workspace-link" href="#tactile-preferences">${icon('circle-check')}<span>Preferences</span><small>02</small></a>
          <a class="tactile-workspace-link" href="#tactile-security">${icon('paperclip')}<span>Security</span><small>03</small></a>
          <a class="tactile-workspace-link" href="#tactile-readiness">${icon('info')}<span>Readiness</span><small>04</small></a>
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
          <button class="tactile-icon-button" type="button" aria-label="Search workspace">${icon('search')}</button>
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
   * Renders a licensed Lucide icon for the retained Tactile workspace specimen.
   *
   * @param {string} name - Vendored Lucide icon name.
   * @returns {string} Decorative icon markup supplied by the local icon bundle.
   */
  function tactileWorkspaceIcon(name) {
    return `<span class="tactile-workspace-icon" aria-hidden="true">${context.icons?.[name] || ''}</span>`;
  }
  return { render: renderTactileTemplateSpecimen, bind: undefined };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'tactile') return '';
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
  window.StudioAuthored['tactile'] = { render, bind };
}
