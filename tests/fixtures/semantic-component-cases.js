export const semanticComponentMarkup = `
<section aria-label="Semantic component contract">
  <button class="ui-button">Neutral button</button>
  <button class="ui-button" data-ui-variant="primary">Primary button</button>
  <button class="ui-button" data-ui-variant="secondary">Secondary button</button>
  <button class="ui-button" data-ui-variant="danger">Danger button</button>
  <button class="ui-button" data-ui-variant="ghost">Ghost button</button>
  <button class="ui-icon-button" aria-label="Settings">&#9881;</button>
  <article class="ui-card">Card</article>
  <div class="ui-field">
    <label class="ui-label" for="semantic-name">Name</label>
    <input class="ui-input" id="semantic-name" />
    <span class="ui-help-text">Helpful text</span>
  </div>
  <select class="ui-select" aria-label="Choice"><option>Choice</option></select>
  <textarea class="ui-textarea" aria-label="Notes"></textarea>
  <label class="ui-check"><input type="checkbox" /><span class="ui-check-control"></span>Check</label>
  <label class="ui-radio"><input type="radio" name="semantic-radio" /><span class="ui-radio-control"></span>Radio</label>
  <label class="ui-switch"><input type="checkbox" checked /><span class="ui-switch-track"><span class="ui-switch-thumb"></span></span><span>Switch</span></label>
  <span class="ui-badge">Neutral badge</span>
  <span class="ui-badge" data-ui-variant="primary">Primary badge</span>
  <span class="ui-badge" data-ui-variant="secondary">Secondary badge</span>
  <span class="ui-badge" data-ui-variant="success">Success badge</span>
  <span class="ui-badge" data-ui-variant="warning">Warning badge</span>
  <span class="ui-badge" data-ui-variant="danger">Danger badge</span>
  <aside class="ui-alert"><strong class="ui-alert-title">Neutral alert</strong><span class="ui-alert-body">Alert body</span></aside>
  <aside class="ui-alert" data-ui-variant="success">Success alert</aside>
  <aside class="ui-alert" data-ui-variant="warning">Warning alert</aside>
  <aside class="ui-alert" data-ui-variant="danger">Danger alert</aside>
  <nav class="ui-nav" aria-label="Contract navigation"><a class="ui-nav-link" href="#semantic-table">Table</a></nav>
  <div class="ui-table-wrap"><table class="ui-table" id="semantic-table"><tbody><tr><td>Cell</td></tr></tbody></table></div>
  <div class="ui-progress" role="progressbar" aria-label="Contract progress" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><div class="ui-progress-bar"></div></div>
  <div class="ui-toolbar" role="toolbar" aria-label="Contract toolbar"></div>
  <span class="ui-spinner" aria-label="Loading"></span>
  <span class="ui-tooltip">Tooltip</span>
  <div class="ui-tabs">
    <div class="ui-tab-list" role="tablist"><button class="ui-tab" role="tab" aria-selected="true">Overview</button></div>
    <section class="ui-tab-panel" role="tabpanel">Tab panel</section>
  </div>
  <nav aria-label="Pagination"><ul class="ui-pagination"><li class="ui-pagination-item"><a class="ui-pagination-link" href="#semantic-table" aria-current="page">1</a></li></ul></nav>
  <nav class="ui-breadcrumb" aria-label="Breadcrumb"><ol class="ui-breadcrumb-list"><li class="ui-breadcrumb-item"><a class="ui-breadcrumb-link" href="#semantic-table">Home</a><span class="ui-breadcrumb-separator" aria-hidden="true">/</span></li></ol></nav>
  <span class="ui-skeleton" data-shape="text" aria-hidden="true"></span>
  <section class="ui-empty-state"><span class="ui-empty-state-icon" aria-hidden="true">&#9734;</span><h2 class="ui-empty-state-title">Empty state</h2><p class="ui-empty-state-body">No records</p><div class="ui-empty-state-actions"></div></section>
  <article class="ui-metric"><span class="ui-metric-label">Requests</span><strong class="ui-metric-value">24</strong><span class="ui-metric-detail">Today</span></article>
  <div class="ui-chip-group"><span class="ui-chip" data-ui-variant="primary">Primary chip</span></div>
  <div class="ui-avatar-group"><span class="ui-avatar" aria-label="Alex">A</span></div>
  <ol class="ui-stepper"><li class="ui-step" data-state="current"><span class="ui-step-marker">1</span><span class="ui-step-label">Current step</span></li></ol>
  <div class="ui-toast-stack"><aside class="ui-toast" data-ui-variant="info"><strong class="ui-toast-title">Toast</strong><p class="ui-toast-body">Saved</p><div class="ui-toast-actions"></div></aside></div>
  <div class="ui-popover">Popover</div>
  <div class="ui-menu" role="menu"><div class="ui-menu-group"><button class="ui-menu-item" role="menuitem">Action</button></div><div class="ui-menu-separator" role="separator"></div></div>
  <div class="ui-segmented-control"><button class="ui-segment" aria-pressed="true">Grid</button></div>
  <div class="ui-file-upload"><label class="ui-dropzone">Upload<input type="file" /></label></div>
  <div class="ui-listbox" role="listbox"><div class="ui-listbox-option" role="option" aria-selected="true">Option</div></div>
  <dialog open>Native modal and dialog fallback</dialog>
</section>`;

/**
 * Produces deterministic semantic markup for every runtime-selectable preset.
 *
 * @param {{presets: {id: string}[]}} manifest Public UI Style Kit manifest.
 * @returns {{preset: string, rootAttributes: {'data-ui': string}, markup: string}[]} Runtime cases.
 */
export function semanticRuntimeCases(manifest) {
  return manifest.presets.map(({ id }) => ({
    preset: id,
    rootAttributes: { 'data-ui': id },
    markup: semanticComponentMarkup
  }));
}
