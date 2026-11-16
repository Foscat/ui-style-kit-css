/**
 * @module studio/catalog
 * @description Canonical component examples and a compact, searchable copy catalog.
 */

export { componentInventory } from './inventory.js';

/** @type {Array<{id:string,family:string,label:string,html:string}>} Public copyable examples. */
export const componentOptions = [];

/** Registers trusted authored markup once for preview, filtering and copying.
 * @param {string} id Stable option identifier.
 * @param {string} family Navigation group.
 * @param {string} label Visible option name.
 * @param {string} html Canonical public markup.
 * @returns {void}
 */
function add(id, family, label, html) {
  componentOptions.push({ id, family, label, html });
}

for (const variant of ['primary', 'secondary', 'warning', 'danger', 'ghost', 'neutral']) {
  const title = variant[0].toUpperCase() + variant.slice(1);
  const role = variant === 'neutral' ? '' : ' data-ui-variant="' + variant + '"';
  add(
    'button-' + variant,
    'buttons',
    title + ' button',
    '<button class="usk-button"' +
      role +
      ' type="button"' +
      (variant === 'primary' ? ' data-action="component-save"' : '') +
      '>' +
      (variant === 'primary' ? 'Save changes' : title) +
      '</button>',
  );
}
add(
  'button-disabled',
  'buttons',
  'Disabled button',
  '<button class="usk-button" type="button" disabled>Unavailable</button>',
);
add(
  'button-loading',
  'buttons',
  'Loading button',
  '<button class="usk-button" data-ui-variant="primary" type="button" aria-busy="true" disabled>Saving</button>',
);
add(
  'icon-button',
  'buttons',
  'Icon button',
  '<button class="usk-icon-button" type="button" aria-label="Settings"><span class="usk-button__icon" data-studio-icon="settings" aria-hidden="true"></span></button>',
);
add(
  'toolbar',
  'buttons',
  'Action toolbar',
  '<div class="usk-toolbar" role="toolbar" aria-label="Document actions"><button class="usk-button" type="button">Edit</button><button class="usk-button" type="button">Share</button></div>',
);

add(
  'input-text',
  'fields',
  'Text input',
  '<label class="usk-field"><span class="usk-label">Project name</span><input class="usk-input" type="text" placeholder="A new idea" data-action="component-input"><small class="usk-help-text">Choose a useful name.</small></label>',
);
add(
  'input-email',
  'fields',
  'Email input',
  '<label class="usk-field"><span class="usk-label">Email address</span><input class="usk-input" type="email" autocomplete="email" placeholder="alex@example.com"></label>',
);
add(
  'input-search',
  'fields',
  'Search input',
  '<label class="usk-field"><span class="usk-label">Search</span><input class="usk-input" type="search" placeholder="Find a record"></label>',
);
add(
  'input-number',
  'fields',
  'Number input',
  '<label class="usk-field"><span class="usk-label">Quantity</span><input class="usk-input" type="number" min="1" max="99" value="4"></label>',
);
add(
  'input-date',
  'fields',
  'Date input',
  '<label class="usk-field"><span class="usk-label">Due date</span><input class="usk-input" type="date"></label>',
);
add(
  'input-readonly',
  'fields',
  'Read-only input',
  '<label class="usk-field"><span class="usk-label">Workspace ID</span><input class="usk-input" value="Workspace 042" readonly></label>',
);
add(
  'input-disabled',
  'fields',
  'Disabled input',
  '<label class="usk-field"><span class="usk-label">Restricted field</span><input class="usk-input" value="Unavailable" disabled></label>',
);
add(
  'input-invalid',
  'fields',
  'Invalid input',
  '<label class="usk-field"><span class="usk-label">Project code</span><input class="usk-input" aria-invalid="true" aria-describedby="catalog-field-error" value="An invalid example"><small class="usk-form-error" id="catalog-field-error">This value needs your attention.</small></label>',
);
add(
  'select',
  'fields',
  'Select field',
  '<label class="usk-field"><span class="usk-label">Team</span><select class="usk-select"><option>Design team</option><option>Engineering</option><option>Operations</option></select></label>',
);
add(
  'textarea',
  'fields',
  'Text area',
  '<label class="usk-field"><span class="usk-label">Notes</span><textarea class="usk-textarea" rows="3" placeholder="What should the team know?"></textarea></label>',
);
add(
  'range',
  'fields',
  'Range control',
  '<label class="usk-field"><span class="usk-label">Capacity</span><input type="range" min="0" max="100" value="62"></label>',
);
add(
  'file-upload',
  'fields',
  'File upload',
  '<div class="usk-file-upload"><label class="usk-dropzone">Attach a document<input type="file"></label></div>',
);

for (const checked of [false, true]) {
  add(
    'checkbox-' + (checked ? 'checked' : 'unchecked'),
    'choices',
    checked ? 'Checked checkbox' : 'Checkbox',
    '<label class="usk-check"><input type="checkbox"' +
      (checked ? ' checked' : ' data-action="component-check"') +
      '><span class="usk-check-control" aria-hidden="true"></span><span>Notify the team</span></label>',
  );
  add(
    'switch-' + (checked ? 'on' : 'off'),
    'choices',
    checked ? 'Switch on' : 'Switch off',
    '<label class="usk-switch"><input type="checkbox" role="switch"' +
      (checked ? ' checked' : '') +
      '><span class="usk-switch-track" aria-hidden="true"><span class="usk-switch-thumb"></span></span><span>Automatic updates</span></label>',
  );
}
add(
  'checkbox-disabled',
  'choices',
  'Disabled checkbox',
  '<label class="usk-check"><input type="checkbox" disabled><span class="usk-check-control" aria-hidden="true"></span><span>Restricted option</span></label>',
);
add(
  'radio-group',
  'choices',
  'Radio group',
  '<fieldset><legend>Visibility</legend><label class="usk-radio"><input type="radio" name="catalog-visibility" value="team" checked><span class="usk-radio-control" aria-hidden="true"></span><span>Team only</span></label><label class="usk-radio"><input type="radio" name="catalog-visibility" value="everyone"><span class="usk-radio-control" aria-hidden="true"></span><span>Everyone</span></label></fieldset>',
);
add(
  'listbox',
  'choices',
  'Listbox',
  '<label class="usk-field"><span class="usk-label">Project teams</span><select class="usk-listbox" multiple size="3"><option class="usk-listbox-option" selected>Design</option><option class="usk-listbox-option">Engineering</option><option class="usk-listbox-option">Operations</option></select></label>',
);

for (const variant of ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']) {
  const title = variant[0].toUpperCase() + variant.slice(1);
  add(
    'badge-' + variant,
    'feedback',
    title + ' badge',
    '<span class="usk-badge"' +
      (variant === 'neutral' ? '' : ' data-ui-variant="' + variant + '"') +
      '>' +
      title +
      '</span>',
  );
}
for (const variant of ['neutral', 'success', 'warning', 'danger']) {
  const title = variant[0].toUpperCase() + variant.slice(1);
  add(
    'alert-' + variant,
    'feedback',
    title + ' alert',
    '<aside class="usk-alert"' +
      (variant === 'neutral' ? '' : ' data-ui-variant="' + variant + '"') +
      '><strong class="usk-alert-title">' +
      (variant === 'success'
        ? 'Changes saved'
        : variant === 'warning'
          ? 'Review needed'
          : variant === 'danger'
            ? 'Unable to connect'
            : 'Workspace update') +
      '</strong><p class="usk-alert-body">Useful context and a clear next step.</p></aside>',
  );
}
for (const variant of ['info', 'success', 'warning', 'danger'])
  add(
    'toast-' + variant,
    'feedback',
    variant[0].toUpperCase() + variant.slice(1) + ' toast',
    '<aside class="usk-toast" data-ui-variant="' +
      variant +
      '"><strong class="usk-toast-title">Workspace update</strong><p class="usk-toast-body">Your latest result appears here.</p><div class="usk-toast-actions"><button class="usk-button" type="button">View</button></div></aside>',
  );
add(
  'progress',
  'feedback',
  'Progress',
  '<progress class="usk-progress" max="100" value="62" aria-label="Task progress">62%</progress>',
);
add(
  'progress-indeterminate',
  'feedback',
  'Indeterminate progress',
  '<progress class="usk-progress" aria-label="Loading records"></progress>',
);
add(
  'spinner',
  'feedback',
  'Loading spinner',
  '<span class="usk-spinner" role="status" aria-label="Loading"></span>',
);
add(
  'skeleton',
  'feedback',
  'Skeleton',
  '<span class="usk-skeleton" data-shape="text" aria-hidden="true"></span>',
);

add(
  'tabs',
  'navigation',
  'Tabs',
  '<div class="usk-tabs"><div class="usk-tab-list" role="tablist" aria-label="Example tabs"><button class="usk-tab" role="tab" id="tab-overview" aria-controls="tab-panel" aria-selected="true" data-action="tab-overview">Overview</button><button class="usk-tab" role="tab" id="tab-activity" aria-controls="tab-panel" aria-selected="false" tabindex="-1" data-action="tab-activity">Activity</button></div><div class="usk-tab-panel" id="tab-panel" role="tabpanel" aria-labelledby="tab-overview" tabindex="0">Overview of the workspace.</div></div>',
);
add(
  'navigation',
  'navigation',
  'Navigation links',
  '<nav class="usk-nav" aria-label="Sample navigation"><a class="usk-nav-link" href="#catalog-table" aria-current="page">Overview</a><a class="usk-nav-link" href="#catalog-table">Records</a></nav>',
);
add(
  'breadcrumbs',
  'navigation',
  'Breadcrumbs',
  '<nav class="usk-breadcrumb" aria-label="Breadcrumb"><ol class="usk-breadcrumb-list"><li class="usk-breadcrumb-item"><a class="usk-breadcrumb-link" href="#catalog-table">Workspace</a><span class="usk-breadcrumb-separator" aria-hidden="true">/</span></li><li class="usk-breadcrumb-item" aria-current="page">Projects</li></ol></nav>',
);
add(
  'pagination',
  'navigation',
  'Pagination',
  '<nav aria-label="Example pagination"><ul class="usk-pagination"><li class="usk-pagination-item"><button class="usk-pagination-link" aria-current="page" data-action="page-one">1</button></li><li class="usk-pagination-item"><button class="usk-pagination-link" data-action="page-two">2</button></li></ul></nav>',
);
add(
  'segmented-control',
  'navigation',
  'Segmented control',
  '<div class="usk-segmented-control" role="group" aria-label="View"><button class="usk-segment" type="button" aria-pressed="true" data-catalog-segment>Grid</button><button class="usk-segment" type="button" aria-pressed="false" data-catalog-segment>List</button></div>',
);
add(
  'menu',
  'navigation',
  'Action menu',
  '<div class="usk-menu" role="group" aria-label="Project actions"><div class="usk-menu-group"><button class="usk-menu-item" type="button">Open project</button><button class="usk-menu-item" type="button">Duplicate</button></div><hr class="usk-menu-separator"><button class="usk-menu-item" type="button">Archive</button></div>',
);
add(
  'stepper',
  'navigation',
  'Stepper',
  '<ol class="usk-stepper" aria-label="Setup progress"><li class="usk-step" data-state="complete"><span class="usk-step-marker">1</span><span class="usk-step-label">Plan</span></li><li class="usk-step" data-state="current" aria-current="step"><span class="usk-step-marker">2</span><span class="usk-step-label">Build</span></li><li class="usk-step"><span class="usk-step-marker">3</span><span class="usk-step-label">Launch</span></li></ol>',
);

add(
  'table',
  'data',
  'Table',
  '<div class="usk-table-wrap" tabindex="0" role="region" aria-label="Sample project records"><table class="usk-table" id="catalog-table"><caption>Project status</caption><thead><tr><th scope="col">Project</th><th scope="col">Status</th></tr></thead><tbody><tr><th scope="row">Field guide</th><td>Active</td></tr><tr><th scope="row">Customer portal</th><td>Review</td></tr></tbody></table></div>',
);
add(
  'metric',
  'data',
  'Metric',
  '<article class="usk-metric"><span class="usk-metric-label">Active projects</span><strong class="usk-metric-value">24</strong><span class="usk-metric-detail">6 due this week</span></article>',
);
for (const variant of ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'])
  add(
    'chip-' + variant,
    'data',
    variant[0].toUpperCase() + variant.slice(1) + ' chip',
    '<span class="usk-chip"' +
      (variant === 'neutral' ? '' : ' data-ui-variant="' + variant + '"') +
      '><span class="usk-chip__label">Design team</span></span>',
  );
add(
  'chip-group',
  'data',
  'Chip group',
  '<div class="usk-chip-group"><span class="usk-chip" data-ui-variant="primary">Design</span><span class="usk-chip" data-ui-variant="secondary">Engineering</span></div>',
);
add(
  'avatar',
  'data',
  'Avatar',
  '<span class="usk-avatar" role="img" aria-label="Alex Morgan"><span class="usk-avatar__fallback">AM</span></span>',
);
add(
  'avatar-group',
  'data',
  'Avatar group',
  '<div class="usk-avatar-group"><span class="usk-avatar" role="img" aria-label="Alex">A</span><span class="usk-avatar" role="img" aria-label="Sam">S</span></div>',
);

add(
  'dialog',
  'overlays',
  'Confirmation dialog',
  '<button class="usk-button" data-ui-variant="primary" type="button" data-action="open-dialog">Open confirmation</button><dialog class="usk-modal" id="sample-dialog" aria-labelledby="dialog-title"><form method="dialog"><h2 id="dialog-title">Archive this project?</h2><p>This is a local interaction example. No records will be changed.</p><div class="ly-cluster"><button class="usk-button" value="cancel" autofocus>Cancel</button><button class="usk-button" data-ui-variant="primary" value="confirm">Archive project</button></div></form></dialog>',
);
add(
  'details',
  'overlays',
  'Disclosure',
  '<details><summary>What happens when I archive a project?</summary><p>Archived projects remain available to your team.</p></details>',
);
add(
  'popover',
  'overlays',
  'Native popover',
  '<button class="usk-button" type="button" popovertarget="catalog-popover">Show details</button><div class="usk-popover" popover id="catalog-popover"><strong>Project details</strong><p>Useful context, close to the action.</p></div>',
);
for (const variant of ['primary', 'secondary', 'accent'])
  add(
    'tooltip-' + variant,
    'overlays',
    variant[0].toUpperCase() + variant.slice(1) + ' tooltip',
    '<details class="usk-tooltip-anchor"><summary>About this option</summary><span class="usk-tooltip" role="tooltip" data-ui-variant="' +
      variant +
      '">Helpful context for this control.</span></details>',
  );

add(
  'card',
  'media',
  'Card',
  '<article class="usk-card" data-card-spacing="normal"><h3>A clear starting point</h3><p>Content, context and an obvious next step.</p><button class="usk-button" type="button">View details</button></article>',
);
add(
  'empty-state',
  'media',
  'Empty state',
  '<section class="usk-empty-state"><span class="usk-empty-state-icon" aria-hidden="true" data-studio-icon="folder"></span><h3 class="usk-empty-state-title">No projects yet</h3><p class="usk-empty-state-body">Your next project will appear here.</p><div class="usk-empty-state-actions"><button class="usk-button" data-ui-variant="primary" type="button">Create a project</button></div></section>',
);
add(
  'typography',
  'media',
  'Typography',
  '<article><h3>Make room for what matters.</h3><p>Useful interfaces give content a clear hierarchy.</p><blockquote>Clarity is a series of small, deliberate choices.</blockquote><ul><li>Readable text</li><li>Connected actions</li><li>Useful feedback</li></ul></article>',
);

/** Converts only component classes; optional Layout classes retain their structural meaning.
 * @param {string} html Trusted canonical markup.
 * @param {string} model Semantic, prefixed or native representation.
 * @param {string} prefix Validated preset prefix.
 * @returns {string} Equivalent public representation.
 */
function representation(html, model, prefix) {
  if (model === 'native')
    return html
      .replace(/\sclass="([^"]*)"/g, (_, value) => {
        const names = value.split(/\s+/).filter((name) => !name.startsWith('usk-'));
        return names.length ? ' class="' + names.join(' ') + '"' : '';
      })
      .replace(/\sdata-ui-variant="[^"]*"/g, '');
  if (model !== 'prefixed') return html;
  const owner = /^[a-z][a-z0-9-]*$/.test(prefix) ? prefix : 'saas';
  return html.replace(/class="([^"]*)"(?: data-ui-variant="([^"]*)")?/g, (_, value, variant) => {
    const names = value
      .split(/\s+/)
      .map((name) =>
        name.startsWith('usk-') &&
        !/^usk-(?:.*__|modal(?:--|$)|form-error$|tooltip-anchor$|icons-)/.test(name)
          ? owner + '-' + name.slice(4)
          : name,
      );
    if (variant) {
      const base = names.find((name) => /-(?:button|badge|alert|chip|toast|tooltip)$/.test(name));
      if (base) names.push(base + '-' + variant);
    }
    return 'class="' + names.join(' ') + '"';
  });
}

/** Renders one family without studio chrome for reusable exported examples.
 * @param {string} id Family or all.
 * @param {string} [model='semantic'] Public markup model.
 * @param {string} [prefix='saas'] Selected preset prefix.
 * @returns {string} Component blocks.
 */
export function renderComponent(id, model = 'semantic', prefix = 'saas') {
  return componentOptions
    .filter((option) => id === 'all' || option.family === id)
    .map((option) => representation(option.html, model, prefix))
    .join('\n');
}

/** Renders the dense catalog with one copy affordance per public element block.
 * @param {string} family Selected group.
 * @param {string} query Case-insensitive name or class search.
 * @param {string} model Public markup model.
 * @param {string} prefix Selected preset prefix.
 * @returns {string} Trusted catalog markup.
 */
export function renderCatalog(family = 'all', query = '', model = 'semantic', prefix = 'saas') {
  const search = query.trim().toLowerCase();
  const options = componentOptions.filter(
    (option) =>
      (family === 'all' || option.family === family) &&
      (option.label + ' ' + option.family + ' ' + option.html).toLowerCase().includes(search),
  );
  return (
    '<div data-ui-structure="neutral" class="ly-stack"><header data-ui-structure="neutral" class="ly-cluster ly-justify-between"><h1>Components</h1><span class="usk-badge" data-catalog-count>' +
    options.length +
    ' options</span></header><p class="usk-help-text">Try each option. Copy its element block with the selected class names.</p><p role="status" data-example-notice hidden></p><div data-ui-structure="neutral" class="studio-component-grid ly-grid ly-items-start ly-gap-2">' +
    options
      .map(
        (option) =>
          '<article class="usk-card ly-stack" data-card-spacing="compact" data-component-option="' +
          option.id +
          '"><header data-ui-structure="neutral" class="ly-cluster ly-justify-between"><h2 class="usk-label" data-option-label>' +
          option.label +
          '</h2><button class="usk-icon-button" type="button" data-copy-option="' +
          option.id +
          '" aria-label="Copy ' +
          option.label +
          '"><span class="usk-button__icon" aria-hidden="true" data-studio-icon="copy"></span></button></header><div data-ui-structure="neutral" class="ly-stack" data-component-preview>' +
          representation(option.html, model, prefix) +
          '</div></article>',
      )
      .join('') +
    '</div>' +
    '<p class="usk-help-text" data-catalog-empty' +
    (options.length ? ' hidden' : '') +
    '>No matching components. Try another name or class.</p>' +
    '</div>'
  );
}
