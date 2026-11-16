/**
 * @module studio/authored/maximalist
 * @description Canonical maximalist specimen shared by Studio and reference consumers.
 */

import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} context Owned specimen configuration.
 * @returns {Object} Authored renderer and binder.
 */
function create(context) {
  /**
   * Renders the retained Maximalist component board with public max-* classes.
   * The board groups every supported component family while leaving color paint
   * on semantic tokens so explicit library themes continue to take priority.
   *
   * @param {string} ui Active preset identifier.
   * @returns {string} Complete Maximalist specimen markup or an empty string.
   */
  function renderMaximalistTemplateSpecimen(ui) {
    if (ui !== 'maximalist') return '';

    const icon = maximalistIcon;

    return `
    <section class="max-card demo-maximalist-specimen ly-grid ly-stack ly-gap-4" data-testid="maximalist-template-specimen" aria-labelledby="maximalist-specimen-title">
      <header class="demo-maximalist-masthead ly-cluster ly-items-center ly-justify-between">
        <div>
          <span class="max-sticker">Component collection / 01</span>
          <h2 class="max-title" id="maximalist-specimen-title">Make some UI noise!</h2>
          <p class="max-copy">A dense pop-collage reference board for the complete Maximalist component surface.</p>
        </div>
        <span class="max-badge-seal">Maximal<br>energy</span>
      </header>

      <div class="demo-maximalist-board ly-grid">
        <article class="max-panel demo-maximalist-family ly-grid" data-testid="maximalist-specimen-actions-buttons">
          <h3 class="max-heading"><span class="max-kicker">Actions &amp; buttons</span></h3>
          <div class="demo-maximalist-action-stack ly-grid">
            <button class="max-button max-button-primary" type="button">Launch it ${icon('arrow-right')}</button>
            <button class="max-button max-button-secondary" type="button">Make a draft ${icon('arrow-right')}</button>
            <button class="max-button max-button-danger" type="button">Delete draft ${icon('trash-2')}</button>
            <button class="max-button" type="button">Neutral action</button>
            <button class="max-button max-button-ghost" type="button">Ghost action</button>
            <button class="max-button max-button-primary" type="button" aria-busy="true" data-max-state="busy">Syncing</button>
            <button class="max-button" type="button" disabled data-max-state="disabled">Disabled</button>
            <button class="max-icon-button" type="button" aria-label="Search collection">${icon('search')}</button>
          </div>
          <div class="demo-maximalist-state-grid ly-grid" aria-label="Button state examples">
            <button class="max-button" type="button">Default</button>
            <button class="max-button is-hover" type="button" data-max-state="hover">Hover</button>
            <button class="max-button is-focus" type="button" data-max-state="focus">Focus</button>
            <button class="max-button" type="button" aria-pressed="true" data-max-state="pressed">Pressed</button>
          </div>
          <hr class="max-divider">
          <div class="demo-badge-row ly-cluster ly-items-center" aria-label="Badge examples">
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
          <div class="demo-maximalist-loading ly-cluster ly-items-center"><span class="max-spinner max-spinner-lg" role="status" aria-label="Loading"></span><span class="max-sticker">78% ready</span></div>
        </article>

        <article class="max-panel demo-maximalist-family ly-grid" data-testid="maximalist-specimen-forms-choices">
          <h3 class="max-heading"><span class="max-kicker">Form controls</span></h3>
          <div class="demo-maximalist-form-grid ly-grid">
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
          <div class="demo-maximalist-choice-grid ly-cluster ly-items-center">
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

        <article class="max-panel demo-maximalist-family ly-grid" data-testid="maximalist-specimen-status-feedback">
          <h3 class="max-heading"><span class="max-kicker">Status &amp; feedback</span></h3>
          <div class="demo-badge-row ly-cluster ly-items-center">
            <span class="max-badge">Neutral</span><span class="max-badge max-badge-success">Success</span><span class="max-badge max-badge-warning">Review</span><span class="max-badge max-badge-secondary">Info</span><span class="max-badge max-badge-danger">Danger</span>
          </div>
          <ul class="demo-maximalist-status-list ly-grid">
            <li><span class="demo-maximalist-status-dot is-success"></span>Ready to make noise</li>
            <li><span class="demo-maximalist-status-dot is-info"></span>Assets syncing</li>
            <li><span class="demo-maximalist-status-dot is-warning"></span>Needs one more review</li>
            <li><span class="demo-maximalist-status-dot is-danger"></span>Big energy detected</li>
          </ul>
          <ol class="demo-maximalist-steps ly-grid" aria-label="Launch progress">
            <li class="is-complete"><strong>Connect</strong><span>Completed</span></li>
            <li class="is-current"><strong>Build</strong><span>In progress</span></li>
            <li><strong>Launch</strong><span>Pending</span></li>
          </ol>
          <dialog class="max-panel demo-maximalist-dialog" open aria-labelledby="max-dialog-title">
            <button class="max-icon-button" type="button" aria-label="Close dialog">${icon('trash-2')}</button>
            <h4 class="max-heading" id="max-dialog-title">Delete draft?</h4>
            <p class="max-copy">This will remove the saved draft.</p>
            <div class="max-cluster"><button class="max-button" type="button">Keep it</button><button class="max-button max-button-danger" type="button">Delete</button></div>
          </dialog>
          <details class="max-well"><summary>System details</summary><p class="max-copy">Disclosure rows retain a crisp information hierarchy.</p></details>
        </article>

        <article class="max-panel demo-maximalist-family demo-maximalist-data ly-grid" data-testid="maximalist-specimen-data-product">
          <h3 class="max-heading"><span class="max-kicker">Data table</span></h3>
          <div class="max-table-wrap" tabindex="0">
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
            <div class="max-icon-medallion">${icon('circle-check')}</div>
            <p class="max-kicker">Product card</p>
            <h4 class="max-heading">Noise Maker Kit</h4>
            <p class="max-copy">A loud little launch system for teams that refuse to blend in.</p>
            <div class="max-feature-strip">
              <div class="max-feature-item"><strong>12 pop-ready blocks</strong></div>
              <div class="max-feature-item"><strong>Accessible interactions</strong></div>
            </div>
            <div class="demo-maximalist-price ly-cluster ly-items-center ly-justify-between"><strong>$29</strong><span>/ drop</span><button class="max-button max-button-primary" type="button">Grab the kit</button></div>
          </section>
        </article>

        <article class="max-panel demo-maximalist-family demo-maximalist-foundations ly-grid" data-testid="maximalist-specimen-navigation-foundations">
          <h3 class="max-heading"><span class="max-kicker">Navigation patterns</span></h3>
          <nav class="max-nav" aria-label="Maximalist reference navigation">
            <a class="max-nav-link is-active" href="#components" aria-current="page">Summary</a>
            <a class="max-nav-link" href="#native">Activity</a>
            <a class="max-nav-link" href="#usage">Assets</a>
          </nav>
          <nav class="demo-maximalist-pagination ly-cluster ly-items-center" aria-label="Collection pages">
            <a class="max-button" href="#components" aria-label="Previous page">Previous</a>
            <a class="max-button max-button-secondary" href="#components" aria-current="page">1</a>
            <a class="max-button" href="#components">2</a>
            <a class="max-button" href="#components" aria-label="Next page">Next</a>
          </nav>
          <hr class="max-divider">
          <p class="max-kicker">Palette &amp; typography</p>
          <div class="demo-maximalist-palette ly-cluster ly-items-center" aria-label="Semantic palette">
            <span data-color="primary">Primary</span><span data-color="secondary">Secondary</span><span data-color="accent">Accent</span><span data-color="success">Success</span><span data-color="warning">Warning</span><span data-color="danger">Danger</span>
          </div>
          <div class="max-well"><h4 class="max-heading">Signal heading</h4><p class="max-copy">Readable system copy carries the supporting context.</p></div>
          <div class="max-callout-bar"><span class="max-icon-medallion">${icon('info')}</span><div><strong>Visible focus</strong><p class="max-copy">Text and color reinforce every state.</p></div><button class="max-button max-button-outline-heavy" type="button">Review</button></div>
        </article>
      </div>
    </section>`;
  }

  /**
   * Renders a vendored Lucide icon for the Maximalist reference specimen.
   *
   * @param {string} name Vendored Lucide icon name.
   * @returns {string} Decorative SVG wrapper or an empty wrapper when unavailable.
   */
  function maximalistIcon(name) {
    return `<span class="demo-maximalist-icon" aria-hidden="true">${context.icons?.[name] || ''}</span>`;
  }
  return { render: renderMaximalistTemplateSpecimen, bind: undefined };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'maximalist') return '';
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
  window.StudioAuthored['maximalist'] = { render, bind };
}
