export const semanticComponentMarkup = `
<section aria-label="Semantic component contract">
  <button class="usk-button">Neutral button</button>
  <button class="usk-button" data-ui-variant="primary">Primary button</button>
  <button class="usk-button" data-ui-variant="secondary">Secondary button</button>
  <button class="usk-button" data-ui-variant="danger">Danger button</button>
  <button class="usk-button" data-ui-variant="ghost">Ghost button</button>
  <button class="usk-icon-button" aria-label="Settings">&#9881;</button>
  <article class="usk-card">Card</article>
  <div class="usk-field">
    <label class="usk-label" for="semantic-name">Name</label>
    <input class="usk-input" id="semantic-name" />
    <span class="usk-help-text">Helpful text</span>
  </div>
  <select class="usk-select" aria-label="Choice"><option>Choice</option></select>
  <textarea class="usk-textarea" aria-label="Notes"></textarea>
  <label class="usk-check"><input type="checkbox" /><span class="usk-check-control"></span>Check</label>
  <label class="usk-radio"><input type="radio" name="semantic-radio" /><span class="usk-radio-control"></span>Radio</label>
  <label class="usk-switch"><input type="checkbox" checked /><span class="usk-switch-track"><span class="usk-switch-thumb"></span></span><span>Switch</span></label>
  <span class="usk-badge">Neutral badge</span>
  <span class="usk-badge" data-ui-variant="primary">Primary badge</span>
  <span class="usk-badge" data-ui-variant="secondary">Secondary badge</span>
  <span class="usk-badge" data-ui-variant="success">Success badge</span>
  <span class="usk-badge" data-ui-variant="warning">Warning badge</span>
  <span class="usk-badge" data-ui-variant="danger">Danger badge</span>
  <aside class="usk-alert"><strong class="usk-alert-title">Neutral alert</strong><span class="usk-alert-body">Alert body</span></aside>
  <aside class="usk-alert" data-ui-variant="success">Success alert</aside>
  <aside class="usk-alert" data-ui-variant="warning">Warning alert</aside>
  <aside class="usk-alert" data-ui-variant="danger">Danger alert</aside>
  <nav class="usk-nav" aria-label="Contract navigation"><a class="usk-nav-link" href="#semantic-table">Table</a></nav>
  <div class="usk-table-wrap"><table class="usk-table" id="semantic-table"><tbody><tr><td>Cell</td></tr></tbody></table></div>
  <div class="usk-progress" role="progressbar" aria-label="Contract progress" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><div class="usk-progress-bar"></div></div>
  <div class="usk-toolbar" role="toolbar" aria-label="Contract toolbar"></div>
  <span class="usk-spinner" aria-label="Loading"></span>
  <span class="usk-tooltip">Tooltip</span>
  <div class="usk-tabs">
    <div class="usk-tab-list" role="tablist"><button class="usk-tab" role="tab" aria-selected="true">Overview</button></div>
    <section class="usk-tab-panel" role="tabpanel">Tab panel</section>
  </div>
  <nav aria-label="Pagination"><ul class="usk-pagination"><li class="usk-pagination-item"><a class="usk-pagination-link" href="#semantic-table" aria-current="page">1</a></li></ul></nav>
  <nav class="usk-breadcrumb" aria-label="Breadcrumb"><ol class="usk-breadcrumb-list"><li class="usk-breadcrumb-item"><a class="usk-breadcrumb-link" href="#semantic-table">Home</a><span class="usk-breadcrumb-separator" aria-hidden="true">/</span></li></ol></nav>
  <span class="usk-skeleton" data-shape="text" aria-hidden="true"></span>
  <section class="usk-empty-state"><span class="usk-empty-state-icon" aria-hidden="true">&#9734;</span><h2 class="usk-empty-state-title">Empty state</h2><p class="usk-empty-state-body">No records</p><div class="usk-empty-state-actions"></div></section>
  <article class="usk-metric"><span class="usk-metric-label">Requests</span><strong class="usk-metric-value">24</strong><span class="usk-metric-detail">Today</span></article>
  <div class="usk-chip-group"><span class="usk-chip" data-ui-variant="primary">Primary chip</span></div>
  <div class="usk-avatar-group"><span class="usk-avatar" aria-label="Alex">A</span></div>
  <ol class="usk-stepper"><li class="usk-step" data-state="current"><span class="usk-step-marker">1</span><span class="usk-step-label">Current step</span></li></ol>
  <div class="usk-toast-stack"><aside class="usk-toast" data-ui-variant="info"><strong class="usk-toast-title">Toast</strong><p class="usk-toast-body">Saved</p><div class="usk-toast-actions"></div></aside></div>
  <div class="usk-popover">Popover</div>
  <div class="usk-menu" role="menu"><div class="usk-menu-group"><button class="usk-menu-item" role="menuitem">Action</button></div><div class="usk-menu-separator" role="separator"></div></div>
  <div class="usk-segmented-control"><button class="usk-segment" aria-pressed="true">Grid</button></div>
  <div class="usk-file-upload"><label class="usk-dropzone">Upload<input type="file" /></label></div>
  <div class="usk-listbox" role="listbox"><div class="usk-listbox-option" role="option" aria-selected="true">Option</div></div>
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
