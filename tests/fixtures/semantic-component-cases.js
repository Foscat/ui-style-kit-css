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
  <button class="ui-switch" role="switch" aria-checked="false"><span class="ui-switch-track"><span class="ui-switch-thumb"></span></span></button>
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
  <progress class="ui-progress" value="50" max="100">50%</progress>
  <span class="ui-progress-bar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></span>
  <div class="ui-toolbar" role="toolbar" aria-label="Contract toolbar"></div>
  <span class="ui-spinner" aria-label="Loading"></span>
  <span class="ui-tooltip" role="tooltip">Tooltip</span>
  <dialog>Native modal and dialog fallback</dialog>
</section>`;

// Task 11 can consume these cases directly; only the preset root value changes.
export function semanticRuntimeCases(manifest) {
  return manifest.presets.map(({ id }) => ({
    preset: id,
    rootAttributes: { 'data-ui': id },
    markup: semanticComponentMarkup
  }));
}
