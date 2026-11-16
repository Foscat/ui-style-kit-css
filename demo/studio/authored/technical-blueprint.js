/**
 * @module studio/authored/technical-blueprint
 * @description Canonical technical-blueprint specimen shared by Studio and reference consumers.
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
  function renderBlueprintTemplateSpecimen(ui) {
    if (ui !== 'technical-blueprint') return '';
    const icon = blueprintIcon;
    const swatches = (roles) =>
      roles
        .map(
          ([role, label]) =>
            `<span class="blueprint-token-swatch" style="--blueprint-token-swatch-color: var(--blueprint-${role})"><i aria-hidden="true"></i><span>${label}</span></span>`,
        )
        .join('');
    const board = (id, title, content) =>
      `${id === 'range-progress' ? '<!--demo-style-feature-->' : ''}<article class="blueprint-panel demo-blueprint-board" data-testid="technical-blueprint-specimen-${id}"><h3 class="blueprint-section-title">${title}</h3>${content}</article>${id === 'range-progress' ? '<!--/demo-style-feature-->' : ''}`;
    const actionStates = ['Default', 'Hover', 'Pressed', 'Loading', 'Disabled'];
    const actionRows = [
      ['primary', 'Execute'],
      ['secondary', 'Save'],
      ['ghost', 'Export'],
      ['danger', 'Revise'],
    ];
    const actions = `<div class="demo-blueprint-state-scroll ly-overflow-auto" tabindex="0"><div class="demo-blueprint-state-grid ly-grid ly-items-center" data-action-states>
    <span></span>${actionStates.map((state) => `<span class="blueprint-overline">${state}</span>`).join('')}
    ${actionRows
      .map(
        ([variant, label]) =>
          `<span class="blueprint-overline">${{ ghost: 'Outline', danger: 'Revision' }[variant] || variant}</span>${actionStates
            .map(
              (state) =>
                `<button type="button" class="blueprint-button blueprint-button-${variant}${state === 'Default' ? '' : ` is-${state.toLowerCase()}`}"${state === 'Disabled' ? ' disabled' : ''}${state === 'Loading' ? ' aria-busy="true"' : ''}${state === 'Pressed' ? ' aria-pressed="true"' : ''}>${state === 'Loading' ? 'Loading' : label}</button>`,
            )
            .join('')}`,
      )
      .join('')}
    </div></div><hr class="blueprint-divider"><div class="demo-blueprint-row ly-cluster ly-items-center">
      <button class="blueprint-icon-button" aria-label="Add document" title="Add document">${icon('plus')}</button>
      <button class="blueprint-icon-button blueprint-button-ghost" aria-label="Settings" title="Settings">${icon('settings')}</button>
      <button class="blueprint-icon-button blueprint-button-danger" aria-label="Remove document" title="Remove document">${icon('x')}</button>
      <button class="blueprint-button">${icon('arrow-right')}Icon + text</button>
    </div>`;
    const input = (type, label, value, extra = '') =>
      `<label class="blueprint-field"><span class="blueprint-label">${label}</span><input class="blueprint-input" type="${type}" value="${value}" ${extra}></label>`;
    const forms = `<div class="demo-blueprint-form-grid ly-grid">
      ${input('text', 'Part / default', 'M-204 modular actuator')}
      <label class="blueprint-field"><span class="blueprint-label">Email / hover</span><input class="blueprint-input is-hover" type="email" value="engineer@example.com"></label>
      ${input('password', 'Password', 'samplepass')}
      <label class="blueprint-field"><span class="blueprint-label">Search / focus</span><span class="blueprint-input-wrap"><input class="blueprint-input is-focus" type="search" placeholder="Search drawings, parts, notes..."><span class="blueprint-input-icon">${icon('search')}</span></span></label>
      ${input('number', 'Number / tolerance', '25.400', 'step="0.001" aria-describedby="blueprint-number-help"')}
      ${input('date', 'Date', '2026-09-02')}
      ${input('time', 'Time', '09:47')}
      <label class="blueprint-field"><span class="blueprint-label">Drawing / error</span><input class="blueprint-input is-error" type="text" value="M-204-XX" aria-invalid="true" aria-describedby="blueprint-url-error"><span class="blueprint-error-text" id="blueprint-url-error">Enter a released drawing number.</span></label>
      <label class="blueprint-field demo-blueprint-wide"><span class="blueprint-label">Textarea</span><textarea class="blueprint-textarea">Engineer notes: verify dimensions, tolerances, materials, and release status.</textarea></label>
    </div><span class="blueprint-helper blueprint-sr-only" id="blueprint-number-help">Tolerance: plus or minus 0.050 millimeters.</span>`;
    const choices = `<div class="demo-blueprint-choice-grid ly-grid">
    <div><p class="blueprint-overline">Checkboxes</p>${[
      [true, false, 'Checked'],
      [false, false, 'Unchecked'],
      [true, true, 'Disabled on'],
      [false, true, 'Disabled off'],
    ]
      .map(
        ([checked, disabled, label]) =>
          `<label class="blueprint-choice"><input type="checkbox"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>${label}</label>`,
      )
      .join('')}</div>
    <div role="radiogroup" aria-label="Reference datum"><p class="blueprint-overline">Radio group</p>${['Primary', 'Secondary', 'Detail bubble', 'Disabled'].map((label, i) => `<label class="blueprint-choice"><input type="radio" name="blueprint-density"${i === 0 ? ' checked' : ''}${i === 3 ? ' disabled' : ''}>${label}</label>`).join('')}</div>
    <div><p class="blueprint-overline">Switches</p>${['Grid', 'Snap', 'Auto Dim', 'Locked'].map((label, i) => `<label class="blueprint-switch"><input type="checkbox" role="switch"${i % 2 === 0 ? ' checked' : ''}${i === 3 ? ' disabled' : ''}><span class="blueprint-switch-track"><span class="blueprint-switch-thumb"></span></span><span>${label}</span></label>`).join('')}</div>
    </div><hr class="blueprint-divider"><div class="blueprint-segmented" role="group" aria-label="Drawing view">
      ${['Plan', 'Front', 'Side', '3D'].map((label, i) => `<button class="blueprint-segment${i === 0 ? ' is-active' : ''}" aria-pressed="${i === 0}" data-blueprint-segment>${label}</button>`).join('')}
    </div><div class="demo-blueprint-row ly-cluster ly-items-center"><button class="blueprint-chip" data-remove-tag aria-label="Remove M-204 filter">M-204 ${icon('x')}</button><button class="blueprint-chip blueprint-chip-danger" data-remove-tag aria-label="Remove Rev D filter">Rev D ${icon('x')}</button><button class="blueprint-chip blueprint-chip-warning" data-remove-tag aria-label="Remove tolerance filter">+/-0.05 ${icon('x')}</button><button class="blueprint-chip" data-add-filter>${icon('plus')}Add layer</button></div>`;
    const selects = `<div class="demo-blueprint-form-grid ly-grid"><div>
    <label class="blueprint-field"><span class="blueprint-label">Select / closed</span><select class="blueprint-select"><option>Mechanical / M-204</option><option>Architectural</option><option>Electrical</option><option disabled>Released drawings</option></select></label>
    <p class="blueprint-overline demo-blueprint-gap">Select / expanded</p><div class="blueprint-dropdown">
      <div role="listbox" aria-label="Disciplines">${['Architectural', 'Electrical', 'Mechanical / M-204', 'Structural', 'Released drawings'].map((label, i) => `<button class="blueprint-option${i === 2 ? ' is-selected' : ''}" role="option" aria-selected="${i === 2}" tabindex="${i === 2 ? 0 : -1}"${i === 4 ? ' disabled' : ''}>${label}<span data-option-check${i === 2 ? '' : ' hidden'}>${icon('check')}</span></button>`).join('')}</div>
    </div></div><div><p class="blueprint-overline">Multi-select / tags</p><div class="blueprint-tags" aria-label="Selected drawing layers">${['10-STEEL', '20-PIPING', '30-DIMS'].map((label, i) => `<button class="blueprint-chip${i === 1 ? ' blueprint-chip-danger' : ''}" data-remove-tag aria-label="Remove ${label} layer">${label}${icon('x')}</button>`).join('')}</div>
    <p class="blueprint-overline demo-blueprint-gap">File upload</p><label class="blueprint-file"><input type="file" aria-label="Upload drawing files" multiple>${icon('upload')}<strong>Drop drawing files</strong><span data-file-status aria-live="polite">or browse device</span><span class="blueprint-helper">PDF, DWG, DXF / 50 MB max</span></label></div></div>`;
    const range = (id, label, value, critical = false) =>
      `<label class="blueprint-field" for="blueprint-${id}"><span class="demo-blueprint-row ly-cluster ly-items-center"><span class="blueprint-label">${label}</span><output for="blueprint-${id}">${value}</output></span><input id="blueprint-${id}" class="blueprint-range${critical ? ' blueprint-range-critical' : ''}" type="range" min="0" max="100" value="${value}" style="--blueprint-value: ${value}%"></label>`;
    const progress = (label, value, danger = false) =>
      `<div><p class="demo-blueprint-row ly-cluster ly-items-center"><span class="blueprint-overline">${label}</span><span>${value}%</span></p><div class="blueprint-progress${danger ? ' blueprint-progress-danger' : ''}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="blueprint-progress-bar" style="--blueprint-progress-value: ${value}%"></span></div></div>`;
    const ranges = `<div class="demo-blueprint-form-grid ly-grid"><div class="demo-blueprint-stack ly-stack">${range('dimension', 'Dimension', 62)}${range('tolerance', 'Tolerance', 76, true)}<div><p class="demo-blueprint-row ly-cluster ly-items-center"><span class="blueprint-overline">Load limit</span><span>72%</span></p><div class="blueprint-meter" role="meter" aria-label="Load limit" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" style="--blueprint-value: 72%"></div><span class="blueprint-helper">Nominal / review / exceeded</span></div></div><div class="demo-blueprint-stack ly-stack">${progress('Linear completion', 64)}${progress('Revision progress', 38, true)}<ol class="blueprint-stepper" aria-label="Drawing workflow">${['Draft', 'Review', 'Approval', 'Published'].map((label, i) => `<li class="blueprint-step${i < 2 ? ' is-complete' : i === 2 ? ' is-active' : ''}"${i === 2 ? ' aria-current="step"' : ''}><b>${i < 2 ? `${icon('check')}<span class="blueprint-sr-only">Completed</span>` : i + 1}</b><span>${label}</span></li>`).join('')}</ol></div></div>`;
    const alerts = `<div class="demo-blueprint-form-grid ly-grid">${[
      ['', 'info', 'Info: Revision D is ready for review'],
      ['success', 'circle-check', 'Success: Tolerance check complete'],
      ['warning', 'triangle-alert', 'Warning: Dimension exceeds nominal'],
      ['danger', 'circle-x', 'Error: Material callout unresolved'],
    ]
      .map(
        ([variant, symbol, label]) =>
          `<div class="blueprint-alert${variant ? ` blueprint-alert-${variant}` : ''}" role="status">${icon(symbol)}<span>${label}</span></div>`,
      )
      .join('')}</div>
    <div class="blueprint-toast" role="status">${icon('check')}<div><strong>Drawing package synchronized</strong><p data-blueprint-status>Sheet A2 and its references are current.</p></div></div><hr class="blueprint-divider"><div class="demo-blueprint-loading ly-grid ly-items-center"><span class="blueprint-spinner" role="status" aria-label="Loading"></span><div class="demo-blueprint-stack ly-stack"><span class="blueprint-skeleton" aria-hidden="true"></span><span class="blueprint-skeleton" style="width: 70%" aria-hidden="true"></span></div><span class="blueprint-overline">Loading / skeleton</span></div>`;
    const navigation = `<nav class="blueprint-breadcrumb" aria-label="Drawing breadcrumb"><a href="#overview">Project</a><span aria-hidden="true">/</span><a href="#components">M-204</a><span aria-hidden="true">/</span><span aria-current="page">Sheet A2</span></nav>
    <div class="blueprint-tabs" role="tablist" aria-label="Project views">${['Drawing', 'Details', 'Notes', 'Specs'].map((label, i) => `<button id="blueprint-tab-${i}" class="blueprint-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" aria-controls="blueprint-project-panel" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}</div><div id="blueprint-project-panel" role="tabpanel" aria-labelledby="blueprint-tab-0" tabindex="0">Drawing: Sheet A2</div>
    <nav class="blueprint-nav" aria-label="Drawing sheets">${['Sheet', 'Split H', 'Split V', '3D view'].map((label, i) => `<a class="blueprint-nav-link${i === 0 ? ' is-active' : ''}" href="#technical-blueprint-template"${i === 0 ? ' aria-current="page"' : ''} data-blueprint-navigation>${label}</a>`).join('')}</nav>
    <p class="blueprint-helper" data-pagination-status>Showing 21-40 of 114</p><nav class="blueprint-pagination" aria-label="Sheet pagination"><button class="blueprint-pagination-page" aria-label="Previous page" data-page-delta="-1">${icon('chevron-left')}</button>${[1, 2, 3, 4, 5, 6].map((page) => `<button class="blueprint-pagination-page" data-page="${page}"${page === 2 ? ' aria-current="page"' : ''}>${page}</button>`).join('')}<button class="blueprint-pagination-page" aria-label="Next page" data-page-delta="1">${icon('chevron-right')}</button></nav>`;
    const data = `<div class="demo-blueprint-table-scroll ly-overflow-auto" tabindex="0"><table class="blueprint-table"><caption class="blueprint-sr-only">Bill of materials</caption><thead><tr><th scope="col">Item</th><th scope="col">Part no.</th><th scope="col">Status</th><th scope="col">Material</th><th scope="col">Qty</th></tr></thead><tbody>${[
      ['01', 'M-204-01', 'Released', 'success', '6061-T6', '1'],
      ['02', 'M-204-02', 'Review', 'primary', 'NBR 70A', '2'],
      ['03', 'M-204-03', 'Hold', 'warning', '12.9', '4'],
      ['04', 'M-204-07', 'Revision', 'danger', '9310', '1'],
    ]
      .map(
        ([file, owner, status, variant, type, size]) =>
          `<tr><td>${file}</td><td>${owner}</td><td><span class="blueprint-badge blueprint-badge-${variant}">${status}</span></td><td>${type}</td><td>${size}</td></tr>`,
      )
      .join('')}</tbody></table></div>
    <div class="demo-blueprint-data-footer ly-cluster ly-items-center ly-justify-between"><div class="demo-blueprint-row ly-cluster ly-items-center"><span class="blueprint-badge blueprint-badge-primary">New</span><span class="blueprint-badge blueprint-badge-success">Complete</span><span class="blueprint-badge blueprint-badge-warning">Warning</span><span class="blueprint-badge blueprint-badge-danger">Blocked</span><span class="blueprint-badge">Archived</span></div><div class="demo-blueprint-row ly-cluster ly-items-center"><div class="blueprint-avatar-group" aria-label="Reference datums"><span class="blueprint-avatar" aria-label="Datum A">A</span><span class="blueprint-avatar blueprint-avatar-danger" aria-label="Datum B">B</span><span class="blueprint-avatar blueprint-avatar-neutral" aria-label="Three more members">+3</span></div><span class="blueprint-quote"><strong>83%</strong> assembly complete</span></div></div>`;
    const overlays = `<div class="demo-blueprint-form-grid ly-grid"><div class="demo-blueprint-stack ly-stack"><span class="blueprint-tooltip" role="tooltip" id="blueprint-detail-tooltip">Leader callout: Detail A</span><div class="blueprint-popover"><strong>Detail A / scale 2:1</strong><p>Choose an operation for the selected drawing.</p><button class="blueprint-button" data-blueprint-menu-toggle aria-expanded="false" aria-haspopup="menu" aria-controls="blueprint-file-menu" aria-describedby="blueprint-detail-tooltip">Open menu</button><div class="blueprint-dropdown" id="blueprint-file-menu" role="menu" aria-label="Detail A / scale 2:1" hidden><button class="blueprint-option" role="menuitem">Duplicate document</button><button class="blueprint-option" role="menuitem">Move to archive</button></div></div></div><div class="demo-blueprint-stack ly-stack"><div class="blueprint-modal"><h4>Release package?</h4><p>Issue sheet A2 and references<br>for manufacturer review?</p><div class="blueprint-modal-actions"><button class="blueprint-button blueprint-button-ghost" data-blueprint-cancel>Cancel</button><button class="blueprint-button blueprint-button-danger" data-blueprint-modal-open>Confirm</button></div></div><details class="blueprint-accordion" open><summary>Drawing details</summary><p>Disclosure rows retain a crisp information hierarchy.</p></details></div></div>
    <dialog class="blueprint-modal" data-blueprint-dialog aria-labelledby="blueprint-dialog-title"><form method="dialog"><h3 id="blueprint-dialog-title">Release package?</h3><p>Release the sample drawing package for review?</p><div class="blueprint-modal-actions"><button class="blueprint-button" value="cancel" autofocus>Cancel release</button><button class="blueprint-button blueprint-button-danger" value="confirm">Release package</button></div></form></dialog>`;
    const foundations = `<div class="demo-blueprint-foundations ly-grid"><div><p class="blueprint-overline">Typography / DejaVu Sans + Mono</p><h4 class="blueprint-title">Drawing heading</h4><h5 class="blueprint-section-title">Section callout</h5><p class="blueprint-copy">Measured notes align to the construction grid.</p></div><div><p class="blueprint-overline">Semantic color tokens</p><div class="demo-blueprint-swatches ly-cluster ly-justify-between">${swatches(
      [
        ['primary', 'Primary'],
        ['danger', 'Revision'],
        ['warning', 'Tolerance'],
        ['success', 'Approved'],
        ['text', 'Text'],
        ['text-muted', 'Muted'],
      ],
    )}</div></div><div><p class="blueprint-overline">Spacing / line weight / states</p><div class="demo-blueprint-spacing ly-cluster" aria-label="Spacing: 4, 8, 12, 16, 24, 32 pixels">${[4, 8, 12, 16, 24, 32].map((size) => `<span style="--demo-blueprint-space: ${size}px">${size}</span>`).join('')}</div><div class="demo-blueprint-lines ly-cluster ly-items-center" aria-label="Line weights: 1, 1.5, and 2 pixels">${[1, 1.5, 2].map((weight) => `<span class="blueprint-line-swatch" style="--blueprint-line-weight: ${weight}px" aria-hidden="true"></span>`).join('')}<span class="blueprint-helper">1 / 1.5 / 2 px</span></div><div class="demo-blueprint-row ly-cluster ly-items-center"><span class="blueprint-badge">Default</span><span class="blueprint-badge blueprint-badge-primary">Hover</span><span class="blueprint-badge blueprint-badge-primary">Focus</span><span class="blueprint-badge blueprint-badge-warning">Pressed</span><span class="blueprint-badge blueprint-badge-danger">Error</span></div></div><div><p class="blueprint-overline">Design rules</p><ol class="blueprint-list"><li>Primary blue: selection, focus, measured values.</li><li>Revision red: destructive or changed state.</li><li>Use square geometry and a 16px construction grid.</li><li>Keep condensed labels precise and readable.</li></ol></div></div>`;
    return `<section id="technical-blueprint-template" class="blueprint-sheet demo-technical-blueprint-specimen ly-stack ly-gap-4" data-preset-only="technical-blueprint" data-testid="technical-blueprint-template-specimen" aria-label="Technical Blueprint reference board">
    <div class="demo-blueprint-header ly-grid"><header class="blueprint-toolbar demo-blueprint-brand"><span class="blueprint-datum" aria-hidden="true">TB</span><div><h2>Technical Blueprint <span>UI preset / control library</span></h2><p class="blueprint-overline">Element reference v1.0 / Rev A / ${escapeHtml(context.appearance.mode)}</p></div></header><div class="blueprint-toolbar"><p class="blueprint-overline">Drawing ink palette</p><div class="demo-blueprint-swatches ly-cluster ly-justify-between">${swatches(
      [
        ['bg', 'Paper'],
        ['surface', 'Panel'],
        ['text', 'Ink'],
        ['primary', 'Primary'],
        ['danger', 'Revision'],
        ['warning', 'Tolerance'],
        ['success', 'Approved'],
      ],
    )}</div></div><div class="blueprint-toolbar demo-blueprint-profile"><div><p class="blueprint-overline">Drawing profile</p><strong>Measured / drafted</strong><p class="blueprint-helper">16px construction grid<br>Thin / standard / heavy</p></div><button class="blueprint-button blueprint-button-secondary" data-blueprint-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">${escapeHtml(context.appearance.mode)}</button></div></div>
    <div class="demo-blueprint-grid ly-grid">${board('action-states', 'Buttons & action states', actions)}${board('form-inputs', 'Form inputs', forms)}${board('choices-tags', 'Choices, toggles & tags', choices)}${board('select-upload', 'Select, multiselect & upload', selects)}${board('range-progress', 'Sliders, progress & meters', ranges)}${board('alerts-loading', 'Alerts, toasts & loading', alerts)}${board('navigation', 'Navigation', navigation)}${board('data-display', 'Data display, badges & avatars', data)}${board('overlays-disclosure', 'Overlays & disclosure', overlays)}${board('foundations', 'Foundations, tokens & rules', foundations)}</div></section>`;
  }

  /**
   * Returns a vendored Lucide icon for the drafting specimen.
   * @param {string} name - Registry icon identifier.
   * @returns {string} Decorative, consistently sized SVG wrapper.
   */
  function blueprintIcon(name) {
    return `<span class="demo-blueprint-icon ly-cluster" aria-hidden="true">${context.icons?.[name] || ''}</span>`;
  }

  /**
   * Binds specimen controls using native inputs and dialog focus management.
   * @returns {void}
   */
  function bindBlueprintSpecimen() {
    const root = context.root.querySelector(
      '[data-testid="technical-blueprint-template-specimen"]',
    );
    if (!root) return;
    const status = root.querySelector('[data-blueprint-status]');
    const announce = (message) => {
      status.textContent = message;
    };
    context.listen(root.querySelector('[data-blueprint-reference]'), 'click', () => {
      selectReferencePalette();
      context.root.querySelector('[data-blueprint-reference]').focus({ preventScroll: true });
    });
    root.querySelectorAll('.blueprint-range').forEach((range) => {
      context.listen(range, 'input', () => {
        range.style.setProperty('--blueprint-value', `${range.value}%`);
        root.querySelector(`output[for="${range.id}"]`).value = range.value;
      });
    });
    root.querySelectorAll('[data-blueprint-segment]').forEach((button) => {
      context.listen(button, 'click', () => {
        root.querySelectorAll('[data-blueprint-segment]').forEach((other) => {
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
      panel.textContent = `${tab.textContent}: Sheet A2`;
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
      button.className = 'blueprint-chip';
      button.dataset.removeTag = '';
      button.setAttribute('aria-label', 'Remove Assigned filter');
      button.innerHTML = `Assigned ${blueprintIcon('x')}`;
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
    const fileWell = fileInput.closest('.blueprint-file');
    context.listen(fileWell, 'dragover', (event) => event.preventDefault());
    context.listen(fileWell, 'drop', (event) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        fileInput.files = event.dataTransfer.files;
        showFiles(fileInput.files);
      }
    });
    const pagination = root.querySelector('.blueprint-pagination');
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
    root.querySelectorAll('[data-blueprint-navigation]').forEach((link) => {
      context.listen(link, 'click', (event) => {
        event.preventDefault();
        root.querySelectorAll('[data-blueprint-navigation]').forEach((other) => {
          other.classList.toggle('is-active', other === link);
          if (other === link) other.setAttribute('aria-current', 'page');
          else other.removeAttribute('aria-current');
        });
        announce(`${link.textContent} selected.`);
      });
    });
    const menu = root.querySelector('[role="menu"]');
    const menuToggle = root.querySelector('[data-blueprint-menu-toggle]');
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
    const dialog = root.querySelector('[data-blueprint-dialog]');
    const opener = root.querySelector('[data-blueprint-modal-open]');
    context.listen(opener, 'click', () => dialog.showModal());
    context.listen(root.querySelector('[data-blueprint-cancel]'), 'click', () =>
      announce('Release cancelled.'),
    );
    context.listen(dialog, 'close', () => {
      announce(
        dialog.returnValue === 'confirm'
          ? 'Sample drawing package released for review.'
          : 'Release cancelled.',
      );
      opener.focus();
    });
  }
  return { render: renderBlueprintTemplateSpecimen, bind: bindBlueprintSpecimen };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'technical-blueprint') return '';
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
  window.StudioAuthored['technical-blueprint'] = { render, bind };
}
