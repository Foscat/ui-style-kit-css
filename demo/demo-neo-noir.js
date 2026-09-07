/**
 * Complete Midnight Cut reference specimen with local-only production controls.
 * @namespace NeoNoirSpecimen
 */
window.NeoNoirSpecimen = (() => {
  /** @param {string} name Licensed icon. @returns {string} Decorative SVG. */
  const icon = (name) => '<span aria-hidden="true">' + (window.UI_STYLE_KIT_ICONS[name] || '') + '</span>';
  /** @param {string} text Button copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button. */
  const button = (text, variant = 'outline', attrs = '') => '<button type="button" class="noir-button noir-button-' + variant + '" ' + attrs + '>' + text + '</button>';
  /** @param {number} n Group index. @param {string} title Heading. @param {string} body Authored content. @returns {string} Numbered group. */
  const group = (n, title, body) => ([7, 8].includes(n) ? '<!--demo-style-feature-->' : '') + '<section class="demo-nn-group" id="noir-group-' + n + '" data-component="' + n + '"><h3 class="noir-section-title"><span class="noir-section-number">' + String(n).padStart(2, '0') + '.</span>' + title + '</h3>' + body + '</section>' + ([7, 8].includes(n) ? '<!--/demo-style-feature-->' : '');
  /** @param {string} type Native type. @param {string} state Visible state. @param {string} value Sample value. @returns {string} Native labeled field. */
  function field(type, state, value) {
    const attrs = state === 'error' ? 'aria-invalid="true"' : state === 'disabled' ? 'disabled' : '';
    const label = type.replace('-local', '') + ' / ' + state;
    return '<label class="noir-field-row" data-noir-state="' + state + '"><span>' + state + '</span>' +
      (type === 'textarea' ? '<textarea class="noir-textarea" rows="3" aria-label="' + label + '" ' + attrs + '>' + value + '</textarea>' :
        '<input class="noir-input" type="' + type + '" value="' + value + '" aria-label="' + label + '" ' + attrs + '>') + '</label>';
  }
  /** @param {string} label Column title. @param {string} type Native type. @param {string[]} states Shown states. @param {string} value Sample value. @returns {string} Field family. */
  const fields = (label, type, states, value) => '<p class="noir-label">' + label + '</p>' + states.map((state) => field(type, state, value)).join('');
  /** @param {string} type Native choice. @param {string} label Copy. @param {string} attrs Authored attributes. @returns {string} Choice. */
  function choice(type, label, attrs = '') {
    const name = type === 'radio' ? 'radio' : 'check';
    return '<label class="noir-' + name + '"><input type="' + type + '" ' + attrs + '><span class="noir-' + name + '-control" aria-hidden="true"></span><span>' + label + '</span></label>';
  }
  /** @param {number} value Percentage. @param {string} label Accessible label. @returns {string} Progress. */
  const progress = (value, label) => '<div class="noir-progress" role="progressbar" aria-label="' + label + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value + '"><span class="noir-progress-bar" style="width:' + value + '%"></span></div>';
  const records = [
    ['PRJ-8421', 'Midnight Sequence', 'Project', 'In progress', 'J. Mercer', 72],
    ['SEQ-0303', 'City Exteriors / Night', 'Sequence', 'Review', 'A. Chen', 45],
    ['SEQ-0298', 'Interior / Warehouse', 'Sequence', 'In progress', 'R. Patel', 65],
    ['SHOT-056', 'Wide / Alley Entrance', 'Shot', 'Approved', 'L. Park', 100],
    ['SHOT-057', 'Close / Door Handle', 'Shot', 'Pending', 'L. Park', 20],
    ['SHOT-058', 'Insert / Key Turn', 'Shot', 'Blocked', 'L. Park', 0]
  ];
  /** @returns {string} Reusable confirmation anatomy. */
  const dialogBody = () => '<h3>Confirm action</h3><p>Approve this item for delivery?</p><dl class="noir-dialog-meta"><dt>Item</dt><dd>City Exteriors / Night</dd><dt>Duration</dt><dd>00:01:22:08</dd></dl>';

  /**
   * Returns no preset-specific markup for other styles.
   * @param {string} ui Active preset.
   * @param {string} mode Color mode.
   * @param {boolean} reference Reference-palette selection.
   * @returns {string} Complete reference specimen.
   */
  function render(ui, mode, reference) {
    if (ui !== 'neo-noir') return '';
    const safeMode = ['light', 'dark', 'contrast'].includes(mode) ? mode : 'light';
    const states = ['default', 'hover', 'pressed', 'focus', 'disabled'];
    const stages = ['Ingest', 'Assemble', 'Grade', 'Review', 'Deliver'];
    const tabs = ['Overview', 'Assets', 'Timeline', 'Review', 'Deliverables'];
    return '<section class="noir-sheet demo-neo-noir-specimen" id="neo-noir-template" data-testid="neo-noir-template-specimen" data-preset-only="neo-noir" aria-label="Neo Noir Midnight Cut UI Element System">' +
      '<div class="demo-nn-top"><header class="noir-identity"><div class="noir-brand-line"><h2 class="noir-title">Neo-Noir</h2><span class="noir-edition">Midnight Cut</span></div><p class="noir-subtitle">' + safeMode + ' mode component reference</p></header>' +
      group(1, 'Navigation & structure', '<div class="demo-nn-nav-top"><nav class="noir-breadcrumbs" aria-label="Production breadcrumb"><span>Projects</span><span>/</span><span>Sequence 03</span><span>/</span><span>Scene 12</span><span>/</span><span>Shot 05</span></nav>' +
        button(safeMode, 'outline', 'data-noir-reference aria-label="Use reference palette" aria-pressed="' + reference + '" title="Use reference palette"') + '</div><div class="noir-tabs" role="tablist" aria-label="Production views">' +
        tabs.map((name, i) => '<button type="button" class="noir-tab" role="tab" id="noir-tab-' + i + '" aria-controls="noir-tab-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + name + '</button>').join('') +
        '</div><div class="noir-tab-panel" id="noir-tab-panel" role="tabpanel" aria-labelledby="noir-tab-0" tabindex="0">Overview / Midnight Sequence</div><div class="demo-nn-nav-lower"><div><p class="noir-label">Pagination</p><nav class="noir-pagination" aria-label="Sequence pages"><button type="button" aria-label="Previous page">Prev</button>' +
        [1, 2, 3, 4].map((n) => '<button type="button" ' + (n === 2 ? 'aria-current="page"' : '') + '>' + n + '</button>').join('') +
        '<button type="button" aria-label="Next page">Next</button></nav></div><div><p class="noir-label">Segmented control</p><div class="noir-segmented" role="group" aria-label="Asset filters">' +
        ['All', 'Video', 'Audio', 'Images', 'Docs'].map((name, i) => '<button type="button" aria-pressed="' + (i === 0) + '">' + name + '</button>').join('') +
        '</div></div><div><p class="noir-label">Stepper</p><ol class="noir-stepper-track">' + stages.map((name, i) => '<li class="noir-step" ' + (i === 0 ? 'aria-current="step"' : '') + '><span class="noir-step-marker"><span>' + (i + 1) + '</span></span><span>' + name + '</span></li>').join('') + '</ol></div></div>') + '</div>' +
      '<div class="demo-nn-main">' +
      group(2, 'Buttons', ['primary', 'secondary', 'outline', 'danger'].map((variant) => '<p class="noir-label">' + (variant === 'danger' ? 'Destructive' : variant) + '</p><div class="demo-nn-button-matrix">' +
        states.map((state) => '<div><span class="noir-label">' + state + '</span>' + button(variant === 'primary' ? 'Action' : variant === 'danger' ? 'Delete' : variant, variant, 'data-noir-state="' + state + '" ' + (state === 'disabled' ? 'disabled' : variant === 'danger' ? 'data-noir-open' : 'data-noir-action')) + '</div>').join('') + '</div>').join('') +
        '<p class="noir-label">Icon actions</p><div class="demo-nn-icons">' + [['plus', 'Add'], ['pencil', 'Edit'], ['trash-2', 'Delete'], ['download', 'Download'], ['upload', 'Upload'], ['external-link', 'Open'], ['star', 'Favorite'], ['layout-grid', 'Grid'], ['list', 'List'], ['ellipsis', 'More']].map(([glyph, label]) => '<button type="button" class="noir-icon-button" aria-label="' + label + '" title="' + label + '" data-noir-action>' + icon(glyph) + '</button>').join('') +
        '</div><div class="demo-nn-busy">' + button('Processing', 'secondary', 'aria-busy="true" disabled') + '</div>') +
      group(3, 'Form fields', '<div class="demo-nn-form-columns"><div>' +
        fields('Text input', 'text', ['default', 'focus', 'success', 'error', 'disabled'], 'Sequence Title') +
        fields('Textarea', 'textarea', ['default', 'focus', 'error', 'disabled'], 'Scene notes go here...') + '</div><div>' +
        fields('Password', 'password', ['default', 'focus', 'error', 'disabled'], 'midnight') +
        fields('Search', 'search', ['default', 'focus'], '') +
        fields('Number', 'number', ['default', 'focus', 'error', 'disabled'], '1280') + '</div><div>' +
        fields('Date', 'date', ['default', 'focus', 'error', 'disabled'], '2026-09-03') +
        fields('Time', 'time', ['default', 'focus', 'error'], '14:30') +
        fields('Datetime', 'datetime-local', ['default', 'focus', 'error', 'disabled'], '2026-09-03T14:30') +
        '</div><div><p class="noir-label">File upload</p><label class="noir-file-zone"><input type="file" aria-label="Upload production asset"><span>' + icon('upload') + '<br>Drag file here or<br><strong>Browse</strong></span></label>' +
        [['grade_v1.cube', '12.4 MB', 'success'], ['reference.mov', '1.2 GB / error', 'error'], ['locked_reference.mov', 'Locked', 'locked']].map(([name, size, status]) => '<div class="noir-file-state" data-status="' + status + '"><span>' + name + '</span><span>' + size + '</span></div>').join('') +
        '<p class="noir-label" data-noir-file-result role="status">No file selected</p></div></div>') + '</div>' +
      '<div class="demo-nn-mid">' +
      group(4, 'Select', '<p class="noir-label">Closed</p><select class="noir-select" aria-label="Delivery resolution"><optgroup label="Video formats">' + ['1080p Full HD', '2160p 4K UHD', '4320p 8K UHD', '720p HD'].map((name, i) => '<option ' + (i === 1 ? 'selected' : '') + '>' + name + '</option>').join('') + '</optgroup></select><p class="noir-label">Open / grouped</p><div class="noir-listbox" role="listbox" aria-label="Video formats">' + ['1080p Full HD', '2160p 4K UHD', '4320p 8K UHD', '720p HD'].map((name, i) => '<button type="button" class="noir-option" role="option" aria-selected="' + (i === 1) + '" tabindex="' + (i === 1 ? 0 : -1) + '">' + name + '</button>').join('') + '</div>') +
      '<div class="demo-nn-selection">' + group(5, 'Multi-select', '<div class="noir-chips">' + ['Drama', 'Night Exteriors', 'Tungsten'].map((name) => '<span class="noir-chip"><span>' + name + '</span><button type="button" aria-label="Remove ' + name + '" title="Remove ' + name + '" data-noir-remove-tag>' + icon('x') + '</button></span>').join('') +
        '</div><form class="demo-nn-tag-form"><input class="noir-input" aria-label="New production tag" placeholder="Add tag..." maxlength="32"><button type="submit" class="noir-icon-button" aria-label="Add tag" title="Add tag">' + icon('plus') + '</button></form>') +
      group(6, 'Controls', '<div class="demo-nn-choices"><div><p class="noir-label">Checkbox</p>' + choice('checkbox', 'Unchecked') + choice('checkbox', 'Checked', 'checked') + choice('checkbox', 'Disabled', 'disabled') + '</div><div><p class="noir-label">Radio</p>' + choice('radio', 'Unselected', 'name="noir-edition"') + choice('radio', 'Selected', 'name="noir-edition" checked') + choice('radio', 'Disabled', 'name="noir-edition" disabled') +
        '</div><div><p class="noir-label">Switch</p>' + ['On', 'Off', 'Disabled'].map((name, i) => '<label class="noir-switch"><input type="checkbox" role="switch" aria-label="' + name + ' switch" ' + (i === 0 ? 'checked' : i === 2 ? 'disabled' : '') + '><span class="noir-switch-track"><span class="noir-switch-thumb"></span></span><span>' + name + '</span></label>').join('') + '</div></div>') + '</div>' +
      group(7, 'Range slider (exposure / timeline)', '<div class="demo-nn-range" style="--noir-value:63%"><output class="noir-slider-value" for="noir-exposure">+1.3</output><input class="noir-range" type="range" id="noir-exposure" aria-label="Exposure" min="-5" max="5" step=".1" value="1.3"><div class="noir-range-scale">' +
        Array.from({ length: 11 }, (_, i) => '<span>' + (i - 5) + '</span>').join('') + '</div><div class="noir-range-legend"><span>Track</span><span>Filled span</span><span>Ticks</span><span>Aperture thumb</span><span>Value flag</span></div></div>') +
      group(8, 'Progress systems', '<div class="demo-nn-progress-row"><span>Continuous</span>' + progress(72, 'Continuous completion') + '<span>72%</span></div><div class="demo-nn-progress-row"><span>Segmented</span><div class="noir-segments" role="progressbar" aria-label="Segments completed" aria-valuemin="0" aria-valuemax="10" aria-valuenow="7">' + Array.from({ length: 10 }, (_, i) => '<i class="' + (i < 7 ? 'is-done' : '') + '"></i>').join('') + '</div><span>7 / 10</span></div><p class="noir-label">Workflow</p><div class="noir-workflow">' +
        ['Ingest', 'Edit', 'Grade', 'Review', 'Deliver'].map((name, i) => button(name, i < 2 ? 'primary' : i === 2 ? 'secondary' : 'outline', 'data-noir-workflow aria-pressed="' + (i === 2) + '"')).join('') +
        '</div><div class="demo-nn-progress-row"><span>Indeterminate</span><div class="noir-progress" role="progressbar" aria-label="Active processing"><span class="noir-progress-bar"></span></div><span>Active</span></div><div class="noir-threshold" role="meter" aria-label="Memory threshold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" aria-valuetext="72, critical"></div><div class="noir-threshold-labels"><span>Safe</span><span>Caution</span><span>Critical</span></div>') + '</div>' +
      '<div class="demo-nn-low">' +
      group(9, 'Status & feedback', '<div class="demo-nn-badges">' + [['New', ''], ['Updated', ''], ['Review', 'review'], ['Approved', 'success'], ['Pending', 'warning'], ['Error', 'danger'], ['Live', 'review']].map(([name, variant]) => '<span class="noir-badge' + (variant ? ' noir-badge-' + variant : '') + '">' + name + '</span>').join('') + '</div><div class="demo-nn-feedback"><div class="demo-nn-alerts">' +
        [['success', 'Success / Changes saved'], ['warning', 'Warning / Memory threshold'], ['danger', 'Error / Timeline unavailable'], ['info', 'Info / New version available']].map(([variant, name]) => '<div class="noir-alert' + (variant === 'info' ? '' : ' noir-alert-' + variant) + '"><span>' + name + '</span><button type="button" class="noir-alert-close" aria-label="Dismiss ' + variant + '" title="Dismiss ' + variant + '" data-noir-dismiss>' + icon('x') + '</button></div>').join('') +
        '</div><div><div class="noir-tooltip" role="tooltip" id="noir-context">Contextual production guidance appears without breaking rhythm.</div><details class="noir-details"><summary>More context</summary>Sequence 03 / Scene 12 / Shot 05</details></div><div class="noir-processing" role="status"><strong>75%</strong><span>Rendering</span></div></div>') +
      group(10, 'Data table', '<div class="noir-table-wrap" tabindex="0" role="region" aria-label="Production records"><table class="noir-table"><caption class="noir-sr-only">Production records</caption><thead><tr>' + ['ID', 'Title', 'Type', 'Status', 'Owner', 'Updated', 'Progress'].map((name) => '<th scope="col">' + name + '</th>').join('') + '</tr></thead><tbody>' +
        records.map(([id, title, type, status, owner, value]) => '<tr><td>' + id + '</td><td>' + title + '</td><td>' + type + '</td><td><span class="noir-badge noir-badge-' + (status === 'Review' ? 'review' : status === 'Approved' ? 'success' : status === 'Blocked' ? 'danger' : 'warning') + '">' + status + '</span></td><td>' + owner + '</td><td>Sep ' + (value === 0 ? '1' : value > 65 ? '3' : '2') + '</td><td><div class="noir-progress-cell">' + progress(value, title + ' completion') + '<span>' + value + '%</span></div></td></tr>').join('') + '</tbody></table></div>') +
      group(11, 'Confirmation dialog', '<div class="noir-dialog" role="group" aria-label="Confirmation preview">' + dialogBody() + '<div class="noir-dialog-actions">' + button('Cancel', 'secondary', 'data-noir-action') + button('Approve', 'primary', 'data-noir-open aria-describedby="noir-context"') + '</div></div>') + '</div>' +
      '<div class="demo-nn-footer">' +
      group(12, 'Palette', '<p class="noir-label">Neutrals & accents</p><div class="noir-swatches">' + ['bg', 'surface-strong', 'text-muted', 'border', 'text', 'primary', 'secondary', 'danger', 'success', 'accent'].map((name) => '<span class="noir-swatch" role="img" style="background:var(--noir-' + name + ')" title="' + name + '" aria-label="' + name + '"></span>').join('') + '</div><p class="noir-label">Signal colors</p><div class="noir-range-legend"><span>Primary</span><span>Focus</span><span>Fault</span><span>Success</span><span>Review</span></div>') +
      group(13, 'Typography', '<div class="demo-nn-type"><div><p class="noir-display-sample">Display<br>Condensed</p><p class="noir-edition">Midnight Cut</p></div><div><p class="noir-label">Heading</p><p class="noir-alpha">ABCDEFGHIJKLM<br>NOPQRSTUVWXYZ<br>0123456789</p></div><div><p class="noir-label">Mono</p><p class="noir-mono-sample">IBM Plex Mono<br>0123456789<br>01:23:45:12<br>24.000 FPS</p></div></div>') +
      group(14, 'Geometry & texture', '<div class="demo-nn-geometry"><div><p class="noir-label">Shapes</p><div class="noir-geometry-row"><i class="noir-shape"></i><i class="noir-shape"></i><i class="noir-shape"></i></div></div><div><p class="noir-label">Lines & dividers</p><div class="noir-line-samples"><i></i><i></i><i></i><i></i></div></div></div><p class="noir-label">Texture overlay</p><div class="noir-texture-sample"></div>') +
      group(15, 'Accessibility', '<div class="demo-nn-access"><div><p class="noir-label">Contrast targets</p><span class="noir-ratio">AA 4.5:1</span><span class="noir-ratio">AAA 7:1</span></div><div><p class="noir-label">Focus</p><button type="button" class="noir-focus-sample">Visible</button></div><div><p class="noir-label">Color safe</p><div class="noir-color-safe" role="img" aria-label="Warning, error, success, review signals"><i></i><i></i><i></i><i></i></div></div></div>') +
      '</div><div class="demo-nn-supplement"><div class="noir-metric"><span class="noir-metric-label">Sequence runtime</span><strong class="noir-metric-value">00:01:22:08</strong></div><div class="noir-empty-state">No archived deliveries</div></div><p class="demo-nn-status" role="status" data-noir-status>Sequence 03 / Page 2 / All assets</p><dialog class="noir-dialog" aria-label="Approve delivery">' + dialogBody() + '<div class="noir-dialog-actions">' + button('Cancel', 'secondary', 'data-noir-cancel') + button('Approve', 'primary', 'data-noir-confirm') + '</div></dialog></section>';
  }

  /**
   * Binds keyboard-equivalent, local-only sample interactions.
   * @param {Function} useReference Host reference palette callback.
   * @returns {void}
   */
  function bind(useReference) {
    const root = document.getElementById('neo-noir-template');
    if (!root) return;
    const report = (text) => { root.querySelector('[data-noir-status]').textContent = text; };
    root.querySelector('[data-noir-reference]').addEventListener('click', useReference);
    const modal = root.querySelector('dialog');
    let opener;
    root.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target || target.disabled) return;
      if (target.hasAttribute('data-noir-open')) { opener = target; modal.showModal(); }
      if (target.hasAttribute('data-noir-cancel')) modal.close('cancel');
      if (target.hasAttribute('data-noir-confirm')) { report('Delivery approved in this local preview.'); modal.close('approve'); }
      if (target.hasAttribute('data-noir-dismiss')) target.closest('.noir-alert').remove();
      if (target.hasAttribute('data-noir-remove-tag')) { target.closest('.noir-chip').remove(); root.querySelector('.demo-nn-tag-form input').focus(); }
      if (target.hasAttribute('data-noir-action')) report((target.getAttribute('aria-label') || target.textContent).trim() + ' selected.');
      if (target.closest('.noir-segmented')) {
        target.parentElement.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
        report(target.textContent + ' assets selected.');
      }
      if (target.hasAttribute('data-noir-workflow')) {
        target.parentElement.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === target)));
        root.querySelectorAll('.noir-step').forEach((item, i) => {
          if (i === [...target.parentElement.children].indexOf(target)) item.setAttribute('aria-current', 'step');
          else item.removeAttribute('aria-current');
        });
        report(target.textContent + ' stage selected.');
      }
    });
    modal.addEventListener('close', () => opener?.focus());
    const range = root.querySelector('.noir-range');
    range.addEventListener('input', () => {
      const value = Number(range.value);
      range.parentElement.style.setProperty('--noir-value', ((value + 5) * 10) + '%');
      range.parentElement.style.setProperty('--noir-position', (value + 5) / 10);
      range.parentElement.querySelector('output').value = (value > 0 ? '+' : '') + value.toFixed(1);
    });
    /** @param {string} selector Item selector. @param {string} attribute Selection attribute. @param {Function} selected Selection side effect. @returns {void} */
    function roving(selector, attribute, selected) {
      const items = [...root.querySelectorAll(selector)];
      const choose = (item) => {
        items.forEach((node) => { node.setAttribute(attribute, String(node === item)); node.tabIndex = node === item ? 0 : -1; });
        selected(item);
      };
      items.forEach((item, index) => {
        item.addEventListener('click', () => choose(item));
        item.addEventListener('keydown', (event) => {
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % items.length : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + items.length - 1) % items.length : null;
          if (next === null) return;
          event.preventDefault(); choose(items[next]); items[next].focus();
        });
      });
    }
    roving('.noir-tab', 'aria-selected', (item) => {
      const panel = root.querySelector('.noir-tab-panel');
      panel.setAttribute('aria-labelledby', item.id);
      panel.textContent = item.textContent + ' / Midnight Sequence';
    });
    roving('.noir-option', 'aria-selected', (item) => {
      root.querySelector('select').value = item.textContent;
      report(item.textContent + ' delivery selected.');
    });
    root.querySelector('select').addEventListener('change', (event) => {
      root.querySelectorAll('.noir-option').forEach((item) => {
        const selected = item.textContent === event.target.value;
        item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
      });
    });
    root.querySelector('.noir-pagination').addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (!target) return;
      const current = Number(root.querySelector('[aria-current="page"]').textContent);
      const label = target.getAttribute('aria-label');
      const next = Math.max(1, Math.min(4, label === 'Previous page' ? current - 1 : label === 'Next page' ? current + 1 : Number(target.textContent)));
      root.querySelectorAll('.noir-pagination button').forEach((item) => {
        if (Number(item.textContent) === next) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      report('Sequence page ' + next + ' selected.');
    });
    root.querySelector('.demo-nn-tag-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      const value = input.value.trim();
      if (!value) return;
      const chip = document.createElement('span'); chip.className = 'noir-chip';
      const text = document.createElement('span'); text.textContent = value;
      const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.noirRemoveTag = '';
      remove.setAttribute('aria-label', 'Remove ' + value); remove.title = 'Remove ' + value; remove.innerHTML = icon('x');
      chip.append(text, remove); root.querySelector('.noir-chips').append(chip); input.value = ''; input.focus();
    });
    const upload = root.querySelector('input[type="file"]');
    const zone = upload.closest('.noir-file-zone');
    const fileResult = (file) => { root.querySelector('[data-noir-file-result]').textContent = file ? file.name + ' / ' + (file.size / 1024).toFixed(1) + ' KB / ready' : 'No file selected'; };
    upload.addEventListener('change', () => fileResult(upload.files[0]));
    zone.addEventListener('dragover', (event) => event.preventDefault());
    zone.addEventListener('drop', (event) => { event.preventDefault(); fileResult(event.dataTransfer.files[0]); });
  }
  return { render, bind };
})();
