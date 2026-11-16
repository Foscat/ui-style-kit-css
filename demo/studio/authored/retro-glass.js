import { retroGlassIcon as sharedRetroGlassIcon } from '../specimen-icons.js';
/**
 * @module studio/authored/retro-glass
 * @description Canonical retro-glass specimen shared by Studio and reference consumers.
 */
import { escapeHtml } from '../html.js';
import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} context Owned specimen configuration.
 * @returns {Object} Authored renderer and binder.
 */
function create(context) {
  const referencePalette = context.referencePalette;
  const selectReferencePalette = () => context.onAppearance({ theme: '' });
  /**
   * Renders every retained RetroGlass template group using the public rg-* API.
   * @param {string} ui - Active preset identifier.
   * @returns {string} The complete reference board, only for Retro Glass.
   */
  function renderRetroGlassTemplateSpecimen(ui) {
    if (ui !== 'retro-glass') return '';
    const icon = retroGlassIcon;
    const swatches = (roles) =>
      roles
        .map(
          ([role, label]) =>
            `<span class="rg-token-swatch" style="--rg-token-swatch-color: var(--rg-${role})"><i aria-hidden="true"></i><span>${label}</span></span>`,
        )
        .join('');
    const board = (id, title, content) =>
      `${id === 'range-progress' ? '<!--demo-style-feature-->' : ''}<article class="rg-panel demo-rg-board" data-testid="retro-glass-specimen-${id}"><h3 class="rg-section-title">${title}</h3>${content}</article>${id === 'range-progress' ? '<!--/demo-style-feature-->' : ''}`;
    const actionStates = ['Default', 'Hover', 'Pressed', 'Loading', 'Disabled'];
    const actionRows = [
      ['primary', 'Apply'],
      ['secondary', 'Preview'],
      ['ghost', 'Details'],
      ['danger', 'Delete'],
    ];
    const actions = `<div class="demo-rg-state-scroll ly-overflow-auto" tabindex="0"><div class="demo-rg-state-grid ly-grid ly-items-center" data-action-states>
    <span></span>${actionStates.map((state) => `<span class="rg-overline">${state}</span>`).join('')}
    ${actionRows
      .map(
        ([variant, label]) =>
          `<span class="rg-overline">${variant}</span>${actionStates
            .map(
              (state) =>
                `<button type="button" class="rg-button rg-button-${variant}${state === 'Default' ? '' : ` is-${state.toLowerCase()}`}"${state === 'Disabled' ? ' disabled' : ''}${state === 'Loading' ? ' aria-busy="true"' : ''}${state === 'Pressed' ? ' aria-pressed="true"' : ''}>${state === 'Loading' ? 'Saving' : label}</button>`,
            )
            .join('')}`,
      )
      .join('')}
    </div></div><hr class="rg-divider"><div class="demo-rg-row ly-cluster ly-items-center">
      <button class="rg-icon-button" aria-label="Add document" title="Add document">${icon('plus')}</button>
      <button class="rg-icon-button rg-button-ghost" aria-label="Settings" title="Settings">${icon('settings')}</button>
      <button class="rg-icon-button rg-button-danger" aria-label="Remove document" title="Remove document">${icon('x')}</button>
      <button class="rg-button" aria-label="Open settings" title="Open settings">${icon('settings')}Settings</button>
    </div>`;
    const input = (type, label, value, extra = '') =>
      `<label class="rg-field"><span class="rg-label">${label}</span><input class="rg-input" type="${type}" value="${value}" ${extra}></label>`;
    const forms = `<div class="demo-rg-form-grid ly-grid">
      ${input('text', 'Text / default', 'RetroGlass workspace')}
      <label class="rg-field"><span class="rg-label">Email / hover</span><input class="rg-input is-hover" type="email" value="designer@example.com"></label>
      ${input('password', 'Password', 'samplepass')}
      <label class="rg-field"><span class="rg-label">Search / focus</span><span class="rg-input-wrap"><input class="rg-input is-focus" type="search" placeholder="Search library..."><span class="rg-input-icon">${icon('search')}</span></span></label>
      ${input('number', 'Number / helper', '42', 'aria-describedby="rg-number-help"')}
      ${input('date', 'Date', '2027-05-24')}
      ${input('time', 'Time', '09:47')}
      <label class="rg-field"><span class="rg-label">URL / error</span><input class="rg-input is-error" type="url" value="invalid://path" aria-invalid="true" aria-describedby="rg-url-error"><span class="rg-error-text" id="rg-url-error">Enter a valid web address.</span></label>
      <label class="rg-field demo-rg-wide"><span class="rg-label">Textarea</span><textarea class="rg-textarea">Notes: Preserve translucency while keeping labels crisp and readable.</textarea></label>
    </div><span class="rg-helper rg-sr-only" id="rg-number-help">Document limit: 1 to 100.</span>`;
    /** Demonstrates mutually exclusive radio states without changing native semantics. */
    const densityChoices = [
      { label: 'Compact', state: 'selected', checked: true },
      { label: 'Comfortable', state: 'available' },
      { label: 'Spacious', state: 'keyboard focus', focus: true },
      { label: 'Locked', state: 'disabled', disabled: true },
    ];
    /** Contrasts enabled and disabled switch states with explicit visible descriptions. */
    const switchExamples = [
      { label: 'Wi-Fi', state: 'on', checked: true },
      { label: 'Sound', state: 'off' },
      { label: 'Auto sync', state: 'disabled on', checked: true, disabled: true },
      { label: 'Locked', state: 'disabled off', disabled: true },
    ];
    const choices = `<div class="demo-rg-choice-grid ly-grid">
    <div><p class="rg-overline">Checkboxes</p>${[
      [true, false, 'Checked'],
      [false, false, 'Unchecked'],
      [true, true, 'Disabled on'],
      [false, true, 'Disabled off'],
    ]
      .map(
        ([checked, disabled, label]) =>
          `<label class="rg-choice"><input type="checkbox"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>${label}</label>`,
      )
      .join('')}</div>
    <div role="radiogroup" aria-label="Workspace density"><p class="rg-overline">Workspace density</p>${densityChoices.map(({ label, state, checked, disabled, focus }) => `<label class="rg-choice"><input type="radio" name="rg-density"${focus ? ' class="is-focus"' : ''}${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>${label}<span aria-hidden="true"> — ${state}</span></label>`).join('')}</div>
    <div><p class="rg-overline">Switches</p>${switchExamples.map(({ label, state, checked, disabled }) => `<label class="rg-switch"><input type="checkbox" role="switch"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}><span class="rg-switch-track"><span class="rg-switch-thumb"></span></span><span>${label}<span aria-hidden="true"> — ${state}</span></span></label>`).join('')}</div>
    </div><hr class="rg-divider"><div class="rg-segmented" role="group" aria-label="Library view">
      ${['Grid', 'List', 'Map', 'Feed'].map((label, i) => `<button class="rg-segment${i === 0 ? ' is-active' : ''}" aria-pressed="${i === 0}" data-rg-segment>${label}</button>`).join('')}
    </div><div class="demo-rg-row ly-cluster ly-items-center"><button class="rg-chip" data-remove-tag aria-label="Remove Active filter">Active ${icon('x')}</button><button class="rg-chip rg-chip-danger" data-remove-tag aria-label="Remove Urgent filter">Urgent ${icon('x')}</button><button class="rg-chip rg-chip-warning" data-remove-tag aria-label="Remove Recent filter">Recent ${icon('x')}</button><button class="rg-chip" data-add-filter>${icon('plus')}Add filter</button></div>`;
    const selects = `<div class="demo-rg-form-grid ly-grid"><div>
    <label class="rg-field"><span class="rg-label">Select / closed</span><select class="rg-select"><option>Recent Documents</option><option>Design Projects</option><option>Shared Library</option><option disabled>Archived Items</option></select></label>
    <p class="rg-overline demo-rg-gap">Select / expanded</p><div class="rg-dropdown">
      <label class="rg-sr-only" for="rg-collection-search">Search collections</label><input class="rg-input" id="rg-collection-search" type="search" placeholder="Search collections..." data-collection-search>
      <div role="listbox" aria-label="Collections">${['Recent Documents', 'Design Projects', 'Shared Library', 'Archived Items'].map((label, i) => `<button class="rg-option${i === 0 ? ' is-selected' : ''}" role="option" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"${i === 3 ? ' disabled' : ''}>${label}<span data-option-check${i === 0 ? '' : ' hidden'}>${icon('check')}</span></button>`).join('')}</div>
    </div></div><div><p class="rg-overline">Multi-select / tags</p><div class="rg-tags" aria-label="Selected categories">${['Design', 'Favorite', 'Research'].map((label, i) => `<button class="rg-chip${i === 1 ? ' rg-chip-danger' : ''}" data-remove-tag aria-label="Remove ${label} category">${label}${icon('x')}</button>`).join('')}</div>
    <p class="rg-overline demo-rg-gap">File upload</p><label class="rg-file"><input type="file" aria-label="Upload files" multiple>${icon('upload')}<strong>Drop files here</strong><span data-file-status aria-live="polite">or browse device</span><span class="rg-helper">JSON, CSV, ZIP</span></label></div></div>`;
    const range = (id, label, value, critical = false) =>
      `<label class="rg-field" for="rg-${id}"><span class="demo-rg-row ly-cluster ly-items-center"><span class="rg-label">${label}</span><output for="rg-${id}">${value}</output></span><input id="rg-${id}" class="rg-range${critical ? ' rg-range-critical' : ''}" type="range" min="0" max="100" value="${value}" style="--rg-value: ${value}%"></label>`;
    const progress = (label, value, danger = false) =>
      `<div><p class="demo-rg-row ly-cluster ly-items-center"><span class="rg-overline">${label}</span><span>${value}%</span></p><div class="rg-progress${danger ? ' rg-progress-danger' : ''}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="rg-progress-bar" style="--rg-progress-value: ${value}%"></span></div></div>`;
    const ranges = `<div class="demo-rg-form-grid ly-grid"><div class="demo-rg-stack ly-stack">${range('volume', 'Volume', 68)}${range('brightness', 'Brightness', 76, true)}<div><p class="demo-rg-row ly-cluster ly-items-center"><span class="rg-overline">Storage</span><span>72%</span></p><div class="rg-meter" role="meter" aria-label="Storage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" style="--rg-value: 72%"></div><span class="rg-helper">Free / caution / full</span></div></div><div class="demo-rg-stack ly-stack">${progress('Continuous', 64)}${progress('Transfer', 38, true)}<ol class="rg-stepper" aria-label="Document workflow">${['Choose', 'Edit', 'Preview', 'Save'].map((label, i) => `<li class="rg-step${i < 2 ? ' is-complete' : i === 2 ? ' is-active' : ''}"${i === 2 ? ' aria-current="step"' : ''}><b>${i < 2 ? `${icon('check')}<span class="rg-sr-only">Completed</span>` : i + 1}</b><span>${label}</span></li>`).join('')}</ol></div></div>`;
    const alerts = `<div class="demo-rg-form-grid ly-grid">${[
      ['', 'info', 'Info: A software update is ready'],
      ['success', 'circle-check', 'Success: Document saved'],
      ['warning', 'triangle-alert', 'Warning: Storage is almost full'],
      ['danger', 'circle-x', 'Error: Connection interrupted'],
    ]
      .map(
        ([variant, symbol, label]) =>
          `<div class="rg-alert${variant ? ` rg-alert-${variant}` : ''}" role="status">${icon(symbol)}<span>${label}</span></div>`,
      )
      .join('')}</div>
    <div class="rg-toast" role="status">${icon('check')}<div><strong>Changes saved</strong><p data-rg-status>Your RetroGlass preferences are up to date.</p></div></div><hr class="rg-divider"><div class="demo-rg-loading ly-grid ly-items-center"><span class="rg-spinner" role="status" aria-label="Loading"></span><div class="demo-rg-stack ly-stack"><span class="rg-skeleton" aria-hidden="true"></span><span class="rg-skeleton" style="width: 70%" aria-hidden="true"></span></div><span class="rg-overline">Loading / skeleton</span></div>`;
    const navigation = `<nav class="rg-breadcrumb" aria-label="Document breadcrumb"><a href="#overview">Home</a><span aria-hidden="true">/</span><a href="#components">Library</a><span aria-hidden="true">/</span><span aria-current="page">Project Phoenix</span></nav>
    <div class="rg-tabs" role="tablist" aria-label="Project views">${['Overview', 'Activity', 'Files', 'Settings'].map((label, i) => `<button id="rg-tab-${i}" class="rg-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" aria-controls="rg-project-panel" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}</div><div id="rg-project-panel" role="tabpanel" aria-labelledby="rg-tab-0" tabindex="0">Overview: Project Phoenix</div>
    <nav class="rg-nav" aria-label="Library sections">${['Home', 'Library', 'Projects', 'Archive'].map((label, i) => `<a class="rg-nav-link${i === 0 ? ' is-active' : ''}" href="#retro-glass-template"${i === 0 ? ' aria-current="page"' : ''} data-rg-navigation>${label}</a>`).join('')}</nav>
    <p class="rg-helper" data-pagination-status>Showing 21-40 of 114</p><nav class="rg-pagination" aria-label="Document pagination"><button class="rg-pagination-page" aria-label="Previous page" data-page-delta="-1">${icon('chevron-left')}</button>${[1, 2, 3, 4, 5, 6].map((page) => `<button class="rg-pagination-page" data-page="${page}"${page === 2 ? ' aria-current="page"' : ''}>${page}</button>`).join('')}<button class="rg-pagination-page" aria-label="Next page" data-page-delta="1">${icon('chevron-right')}</button></nav>`;
    const data = `<div class="demo-rg-table-scroll ly-overflow-auto" tabindex="0"><table class="rg-table"><caption class="rg-sr-only">Project documents</caption><thead><tr><th scope="col">File</th><th scope="col">Owner</th><th scope="col">Status</th><th scope="col">Type</th><th scope="col">Size</th></tr></thead><tbody>${[
      ['Sketch', 'Alex Morgan', 'Synced', 'success', 'Design', '4.2 MB'],
      ['Notes', 'M. Sato', 'Editing', 'primary', 'Text', '28 KB'],
      ['Photos', 'A. Reyes', 'Uploading', 'warning', 'Media', '86 MB'],
      ['Archive', 'Jamie Lee', 'Failed', 'danger', 'Backup', '1.4 GB'],
    ]
      .map(
        ([file, owner, status, variant, type, size]) =>
          `<tr><td>${file}</td><td>${owner}</td><td><span class="rg-badge rg-badge-${variant}">${status}</span></td><td>${type}</td><td>${size}</td></tr>`,
      )
      .join('')}</tbody></table></div>
    <div class="demo-rg-data-footer ly-cluster ly-items-center ly-justify-between"><div class="demo-rg-row ly-cluster ly-items-center"><span class="rg-badge rg-badge-primary">New</span><span class="rg-badge rg-badge-success">Complete</span><span class="rg-badge rg-badge-warning">Warning</span><span class="rg-badge rg-badge-danger">Blocked</span><span class="rg-badge">Archived</span></div><div class="demo-rg-row ly-cluster ly-items-center"><div class="rg-avatar-group" aria-label="Project members"><span class="rg-avatar" aria-label="D7">D7</span><span class="rg-avatar rg-avatar-danger" aria-label="M. Sato">MS</span><span class="rg-avatar rg-avatar-neutral" aria-label="Three more members">+3</span></div><span class="rg-quote"><strong>83%</strong> storage used</span></div></div>`;
    const overlays = `<div class="demo-rg-form-grid ly-grid"><div class="demo-rg-stack ly-stack"><span class="rg-tooltip" role="tooltip" id="rg-detail-tooltip">Tooltip: Helpful detail</span><div class="rg-popover"><strong>File actions</strong><p>Choose an operation for the selected document.</p><button class="rg-button" data-rg-menu-toggle aria-expanded="false" aria-haspopup="menu" aria-controls="rg-file-menu" aria-describedby="rg-detail-tooltip">Open menu</button><div class="rg-dropdown" id="rg-file-menu" role="menu" aria-label="File actions" hidden><button class="rg-option" role="menuitem">Duplicate document</button><button class="rg-option" role="menuitem">Move to archive</button></div></div></div><div class="demo-rg-stack ly-stack"><div class="rg-modal"><h4>Delete document?</h4><p>This action cannot be undone.<br>Move this file to the trash?</p><div class="rg-modal-actions"><button class="rg-button rg-button-ghost" data-rg-cancel>Cancel</button><button class="rg-button rg-button-danger" data-rg-modal-open>Confirm</button></div></div><details class="rg-accordion" open><summary>System details</summary><p>Project Phoenix is synced. Last saved at 09:47.</p></details></div></div>
    <dialog class="rg-modal" data-rg-dialog aria-labelledby="rg-dialog-title"><form method="dialog"><h3 id="rg-dialog-title">Delete document?</h3><p>Move the sample document to the trash?</p><div class="rg-modal-actions"><button class="rg-button" value="cancel" autofocus>Cancel deletion</button><button class="rg-button rg-button-danger" value="confirm">Delete document</button></div></form></dialog>`;
    const foundations = `<div class="demo-rg-foundations ly-grid"><div><p class="rg-overline">Typography / DejaVu Sans + Mono</p><h4 class="rg-title">Retro heading</h4><h5 class="rg-section-title">Section title</h5><p class="rg-copy">Readable text stays crisp above translucent surfaces.</p></div><div><p class="rg-overline">Semantic color tokens</p><div class="demo-rg-swatches ly-cluster ly-justify-between">${swatches(
      [
        ['primary', 'Primary'],
        ['danger', 'Danger'],
        ['warning', 'Warning'],
        ['success', 'Success'],
        ['text', 'Text'],
        ['text-muted', 'Muted'],
      ],
    )}</div><pre class="rg-code"><code>--rg-radius-sm: 6px;
--rg-radius-md: 10px;
--rg-control-height: 36px;</code></pre></div><div><p class="rg-overline">Spacing / geometry / states</p><div class="demo-rg-spacing ly-cluster" aria-label="Spacing: 4, 8, 12, 16, 24, 32 pixels">${[4, 8, 12, 16, 24, 32].map((size) => `<span style="--demo-rg-space: ${size}px">${size}</span>`).join('')}</div><div class="demo-rg-row ly-cluster ly-items-center"><span class="rg-badge">Default</span><span class="rg-badge rg-badge-primary">Hover</span><span class="rg-badge rg-badge-primary">Focus</span><span class="rg-badge rg-badge-warning">Pressed</span><span class="rg-badge rg-badge-danger">Error</span></div><blockquote class="rg-quote">Highlights and inset shadows communicate depth.</blockquote></div><div><p class="rg-overline">Design rules</p><ol class="rg-list"><li>Cobalt glass: navigation, focus, primary action.</li><li>Red glass: destructive or failed state.</li><li>Highlights and inset shadows communicate depth.</li><li>Keep content calm and text readable.</li></ol><pre class="rg-console"><code>glass.surface.ready()</code></pre></div></div>`;
    return `<section id="retro-glass-template" class="demo-retro-glass-specimen ly-stack ly-gap-4" data-preset-only="retro-glass" data-testid="retro-glass-template-specimen" aria-label="Retro Glass reference board">
    <div class="demo-rg-header ly-grid"><header class="rg-toolbar demo-rg-brand"><span class="rg-avatar" aria-hidden="true">RG</span><div><h2>RetroGlass <span>UI preset</span></h2><p class="rg-overline">UI Style Kit CSS / element reference / ${escapeHtml(context.appearance.mode)}</p></div></header><div class="rg-toolbar"><p class="rg-overline">Core material palette</p><div class="demo-rg-swatches ly-cluster ly-justify-between">${swatches(
      [
        ['bg', 'Canvas'],
        ['surface', 'Glass'],
        ['text', 'Text'],
        ['primary', 'Cobalt'],
        ['danger', 'Danger'],
        ['warning', 'Warning'],
        ['success', 'Success'],
      ],
    )}</div></div><div class="rg-toolbar demo-rg-profile"><div><p class="rg-overline">Material profile</p><strong>Glass / tactile</strong><p class="rg-helper">Brushed chrome framing<br>Inset and raised depth</p></div><button class="rg-button rg-button-primary rg-button-pill" data-rg-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">${escapeHtml(context.appearance.mode)}</button></div></div>
    <div class="demo-rg-grid ly-grid">${board('action-states', 'Buttons & action states', actions)}${board('form-inputs', 'Form inputs', forms)}${board('choices-tags', 'Choices, toggles & tags', choices)}${board('select-upload', 'Select, multiselect & upload', selects)}${board('range-progress', 'Sliders, progress & meters', ranges)}${board('alerts-loading', 'Alerts, toasts & loading', alerts)}${board('navigation', 'Navigation', navigation)}${board('data-display', 'Data display, badges & avatars', data)}${board('overlays-disclosure', 'Overlays & disclosure', overlays)}${board('foundations', 'Foundations, tokens & rules', foundations)}</div></section>`;
  }

  /**
   * Renders a local Lucide icon from the vendored, licensed source artwork.
   * @param {string} name - Lucide icon name.
   * @returns {string} Decorative icon markup; its control supplies the accessible name.
   */
  const retroGlassIcon = (name) => sharedRetroGlassIcon(name, context.icons);

  /**
   * Binds specimen controls using native inputs and dialog focus management.
   * @returns {void}
   */
  function bindRetroGlassSpecimen() {
    const root = context.root.querySelector('[data-testid="retro-glass-template-specimen"]');
    if (!root) return;
    const status = root.querySelector('[data-rg-status]');
    const announce = (message) => {
      status.textContent = message;
    };
    context.listen(root.querySelector('[data-rg-reference]'), 'click', () => {
      selectReferencePalette();
      context.root.querySelector('[data-rg-reference]').focus({ preventScroll: true });
    });
    root.querySelectorAll('.rg-range').forEach((range) => {
      context.listen(range, 'input', () => {
        range.style.setProperty('--rg-value', `${range.value}%`);
        root.querySelector(`output[for="${range.id}"]`).value = range.value;
      });
    });
    root.querySelectorAll('[data-rg-segment]').forEach((button) => {
      context.listen(button, 'click', () => {
        root.querySelectorAll('[data-rg-segment]').forEach((other) => {
          other.setAttribute('aria-pressed', String(other === button));
          other.classList.toggle('is-active', other === button);
        });
        announce(`${button.textContent} view selected.`);
      });
    });
    const bindRoving = (container, selector, activate) => {
      context.listen(container, 'click', (event) => {
        const item = event.target.closest(selector);
        if (item && !item.disabled) activate(item);
      });
      context.listen(container, 'keydown', (event) => {
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        const items = [...container.querySelectorAll(selector)].filter(
          (item) => !item.disabled && !item.hidden,
        );
        const current = items.indexOf(context.document.activeElement);
        if (current < 0 || !items.length) return;
        event.preventDefault();
        const index =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : (current +
                  (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
                  items.length) %
                items.length;
        activate(items[index]);
        items[index].focus();
      });
    };
    const tabs = root.querySelector('[role="tablist"]');
    bindRoving(tabs, '[role="tab"]', (tab) => {
      tabs.querySelectorAll('[role="tab"]').forEach((other) => {
        other.setAttribute('aria-selected', String(other === tab));
        other.classList.toggle('is-active', other === tab);
        other.tabIndex = other === tab ? 0 : -1;
      });
      const panel = root.querySelector('[role="tabpanel"]');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.textContent = `${tab.textContent}: Project Phoenix`;
    });
    const options = root.querySelector('[role="listbox"]');
    bindRoving(options, '[role="option"]', (option) => {
      options.querySelectorAll('[role="option"]').forEach((other) => {
        other.setAttribute('aria-selected', String(other === option));
        other.classList.toggle('is-selected', other === option);
        other.tabIndex = other === option ? 0 : -1;
        other.querySelector('[data-option-check]').hidden = other !== option;
      });
      announce(`${option.textContent.trim()} selected.`);
    });
    context.listen(root.querySelector('[data-collection-search]'), 'input', (event) => {
      options.querySelectorAll('[role="option"]').forEach((option) => {
        option.hidden = !option.textContent
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      });
      const visible = [...options.querySelectorAll('[role="option"]')].filter(
        (option) => !option.hidden && !option.disabled,
      );
      visible.forEach((option, i) => {
        option.tabIndex = i === 0 ? 0 : -1;
      });
    });
    context.listen(root, 'click', (event) => {
      const tag = event.target.closest('[data-remove-tag]');
      if (tag) {
        const next = tag.nextElementSibling || tag.previousElementSibling;
        announce(`${tag.textContent.trim()} removed.`);
        tag.remove();
        next?.focus();
      }
    });
    context.listen(root.querySelector('[data-add-filter]'), 'click', (event) => {
      const button = context.document.createElement('button');
      button.className = 'rg-chip';
      button.dataset.removeTag = '';
      button.setAttribute('aria-label', 'Remove Assigned filter');
      button.innerHTML = `Assigned ${retroGlassIcon('x')}`;
      event.currentTarget.before(button);
      button.focus();
      announce('Assigned filter added.');
    });
    const fileInput = root.querySelector('input[type="file"]');
    const showFiles = (files) => {
      root.querySelector('[data-file-status]').textContent =
        [...files].map((file) => file.name).join(', ') || 'or browse device';
    };
    context.listen(fileInput, 'change', () => showFiles(fileInput.files));
    const fileWell = fileInput.closest('.rg-file');
    context.listen(fileWell, 'dragover', (event) => event.preventDefault());
    context.listen(fileWell, 'drop', (event) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        fileInput.files = event.dataTransfer.files;
        showFiles(fileInput.files);
      }
    });
    const pagination = root.querySelector('.rg-pagination');
    context.listen(pagination, 'click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const current = Number(pagination.querySelector('[aria-current="page"]').dataset.page);
      const page = Math.max(
        1,
        Math.min(
          6,
          button.dataset.page
            ? Number(button.dataset.page)
            : current + Number(button.dataset.pageDelta),
        ),
      );
      pagination.querySelectorAll('[data-page]').forEach((item) => {
        if (Number(item.dataset.page) === page) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      root.querySelector('[data-pagination-status]').textContent =
        `Showing ${(page - 1) * 20 + 1}-${Math.min(page * 20, 114)} of 114`;
    });
    root.querySelectorAll('[data-rg-navigation]').forEach((link) => {
      context.listen(link, 'click', (event) => {
        event.preventDefault();
        root.querySelectorAll('[data-rg-navigation]').forEach((other) => {
          other.classList.toggle('is-active', other === link);
          if (other === link) other.setAttribute('aria-current', 'page');
          else other.removeAttribute('aria-current');
        });
        announce(`${link.textContent} selected.`);
      });
    });
    const menu = root.querySelector('[role="menu"]');
    const menuToggle = root.querySelector('[data-rg-menu-toggle]');
    const closeMenu = () => {
      menu.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    };
    context.listen(menuToggle, 'click', () => {
      menu.hidden = !menu.hidden;
      menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) menu.querySelector('button').focus();
    });
    context.listen(menu, 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
      if (event.key === 'Tab') {
        menu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    bindRoving(menu, '[role="menuitem"]', (item) => item.focus());
    context.listen(menu, 'click', (event) => {
      if (event.target.closest('button')) {
        announce(`${event.target.closest('button').textContent} complete.`);
        closeMenu();
      }
    });
    const dialog = root.querySelector('[data-rg-dialog]');
    const opener = root.querySelector('[data-rg-modal-open]');
    context.listen(opener, 'click', () => dialog.showModal());
    context.listen(root.querySelector('[data-rg-cancel]'), 'click', () =>
      announce('Deletion cancelled.'),
    );
    context.listen(dialog, 'close', () => {
      announce(
        dialog.returnValue === 'confirm'
          ? 'Sample document moved to trash.'
          : 'Deletion cancelled.',
      );
      opener.focus();
    });
  }
  return { render: renderRetroGlassTemplateSpecimen, bind: bindRetroGlassSpecimen };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'retro-glass') return '';
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
  window.StudioAuthored['retro-glass'] = { render, bind };
}
