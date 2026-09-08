/**
 * Art Deco specimen renderer and local-only interactions.
 * @namespace ArtDecoSpecimen
 */
window.ArtDecoSpecimen = (() => {
  /** @param {string} name Licensed icon name. @returns {string} Decorative icon markup. */
  const icon = (name) => `<span class="demo-ad-icon" aria-hidden="true">${window.UI_STYLE_KIT_ICONS[name] || ''}</span>`;
  /** @param {string} label Button copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. */
  const button = (label, variant = '', attrs = '') => `<button type="button" class="deco-button ${variant ? `deco-button-${variant}` : ''}" ${attrs}>${label}</button>`;
  /** @param {number} n Group number. @param {string} id Group key. @param {string} title Heading. @param {string} body Authored content. @returns {string} Specimen group. */
  const group = (n, id, title, body) => `${['meter', 'progress', 'stages'].includes(id) ? '<!--demo-style-feature-->' : ''}<section class="demo-ad-group demo-ad-${id}" id="deco-group-${n}" data-component="${id}"><h3 class="deco-section-title"><span class="deco-number">${String(n).padStart(2, '0')}.</span>${title}</h3>${body}</section>${['meter', 'progress', 'stages'].includes(id) ? '<!--/demo-style-feature-->' : ''}`;
  /** @param {string} type Native input type. @param {string} label Field name. @param {string} value Sample value. @param {string} attrs Authored attributes. @returns {string} Labeled field. */
  const field = (type, label, value, attrs = '') => `<label class="demo-ad-field"><span class="deco-label">${label}</span><input type="${type}" class="deco-input" value="${value}" ${attrs}></label>`;
  /** @param {string} type Choice type. @param {string} label Visible name. @param {string} attrs Native attributes. @returns {string} Accessible choice. */
  const choice = (type, label, attrs = '') => `<label class="deco-${type === 'checkbox' ? 'check' : 'radio'}"><input type="${type}" ${attrs}><span class="deco-${type === 'checkbox' ? 'check' : 'radio'}-control" aria-hidden="true"></span><span>${label}</span></label>`;

/**
 * Renders all seventeen reference groups only for the selected preset.
 * @param {string} ui Active preset.
 * @param {string} mode Active mode.
 * @param {boolean} reference Whether the native reference palette is active.
 * @returns {string} Functional specimen HTML or an empty string.
 */
function render(ui, mode, reference) {
  if (ui !== 'art-deco') return '';
  const safeMode = ['light', 'dark', 'contrast'].includes(mode) ? mode : 'light';
  const actions = [['Primary', 'Primary action', 'primary', ''], ['Secondary', 'Secondary action', 'secondary', ''], ['Outline', 'Outline action', 'ghost', ''], ['Pressed', 'Pressed action', 'primary', 'is-pressed'], ['Danger', 'Destructive action', 'danger', ''], ['Processing', 'Processing...', 'secondary', 'loading'], ['Disabled', 'Disabled action', '', 'disabled']];
  const badges = [['primary', 'New'], ['secondary', 'Active'], ['success', 'Verified'], ['warning', 'Pending'], ['danger', 'On hold'], ['danger', 'Critical'], ['danger', 'Error'], ['warning', 'Warning'], ['info', 'Info']];
  const alerts = [['success', 'Success', 'Your changes have been saved.'], ['warning', 'Warning', 'Please review the information.'], ['danger', 'Error', 'Something went wrong. Try again.'], ['info', 'Info', 'This is an informational message.']];
  const tabs = ['Overview', 'Details', 'History', 'Settings'];
  const stages = ['Plan', 'Design', 'Build', 'Test', 'Deploy'];
  const swatches = [['bg', 'Canvas'], ['primary', 'Navy'], ['secondary', 'Teal'], ['metal', 'Gold'], ['warning', 'Highlight'], ['danger', 'Burgundy'], ['surface', 'Surface'], ['text-muted', 'Muted']];
  return `<section id="art-deco-template" class="deco-sheet demo-art-deco-specimen" data-preset-only="art-deco" data-testid="art-deco-template-specimen" aria-label="Art Deco UI Element System">
    <i class="deco-fan demo-ad-tl" aria-hidden="true"></i><i class="deco-fan demo-ad-tr" aria-hidden="true"></i><i class="deco-fan demo-ad-bl" aria-hidden="true"></i><i class="deco-fan demo-ad-br" aria-hidden="true"></i>
    <header class="deco-masthead"><div><h2 class="deco-masthead-title">Art Deco UI Element System</h2><p class="deco-kicker">Metropolitan Moderne / Reference system v1.0 / ${safeMode}</p></div></header>
    <div class="demo-ad-overview">
      <div class="deco-frame deco-frame-navy"><h3 class="deco-section-title">System overview</h3><div class="demo-ad-stat-grid"><span class="deco-monogram" aria-hidden="true"></span>${[['128','Components'],['24','Patterns'],['08','Categories']].map(([value, label]) => `<div class="deco-stat"><span class="deco-stat-value">${value}</span><span class="deco-stat-label">${label}</span></div>`).join('')}<div class="deco-health" role="meter" aria-label="Overall health" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"><span>72%</span><small>Overall health</small></div></div></div>
      <div class="deco-frame deco-meta-grid"><div class="deco-meta"><span class="deco-label">Status</span><span><i class="deco-status-dot" aria-hidden="true"></i>Operational</span></div><div class="deco-meta"><span class="deco-label">Last update</span><span>May 24, 1936<br>10:30 AM</span></div><div class="deco-meta"><span class="deco-label">Environment</span><span>Production</span></div><div class="deco-meta"><span class="deco-label">Performance</span><div class="deco-performance" role="img" aria-label="Performance increasing across five samples">${[8,12,18,24,32].map((height) => `<i style="--deco-bar:${height}px"></i>`).join('')}</div></div></div>
    </div>
    <div class="demo-ad-main">
      <div class="demo-ad-lane">
        ${group(1, 'buttons', 'Buttons', `<div class="demo-ad-actions">${actions.map(([label, text, variant, state]) => `<span class="deco-label">${label}</span><button type="button" class="deco-button ${variant ? `deco-button-${variant}` : ''} ${state === 'loading' ? 'deco-button-loading' : state}" ${state === 'disabled' ? 'disabled' : state === 'loading' ? 'aria-busy="true" aria-disabled="true"' : 'data-deco-open'}>${text}</button><button type="button" class="deco-icon-button ${variant ? `deco-button-${variant}` : ''}" aria-label="${label} icon action" title="${label} icon action" ${state === 'disabled' ? 'disabled' : state === 'loading' ? 'aria-busy="true" aria-disabled="true"' : 'data-deco-open'}>${state === 'loading' ? '' : icon(variant === 'danger' ? 'x' : 'chevron-right')}</button>`).join('')}</div>`)}
        ${group(2, 'navigation', 'Navigation', `<nav class="deco-breadcrumb" aria-label="Art Deco breadcrumb"><a href="#deco-group-16">Library</a><span>/</span><a href="#deco-group-12">Patterns</a><span>/</span><span aria-current="page">Controls</span></nav><nav class="deco-pagination" aria-label="Component pages">${[1,2,3].map((n) => `<button type="button" data-deco-page="${n}" ${n === 2 ? 'aria-current="page"' : ''}>${n}</button>`).join('')}</nav><div class="demo-ad-row">${button('Text button', 'ghost', 'data-deco-open')}<span class="deco-badge deco-badge-primary">New</span><span class="deco-badge deco-badge-secondary">Active</span></div>`)}
      </div>
      <div class="demo-ad-lane">
        ${group(3, 'fields', 'Form fields', `<div class="demo-ad-stack"><label class="demo-ad-field"><span class="deco-label">Text</span><input class="deco-input deco-input-valid" value="Metropolitan Moderne" aria-label="Text"></label>${field('password','Password','metromoderne')}${field('search','Search','', 'placeholder="Search components..." id="deco-search"')}${field('number','Number','1928', 'step="1"')}${field('date','Date','1936-05-24')}${field('time','Time','10:30')}${field('email','Email','invalid@metro', 'aria-invalid="true" aria-describedby="deco-email-error"')}<span class="deco-help-error" id="deco-email-error">Use an approved address.</span><label class="demo-ad-field"><span class="deco-label">Textarea</span><textarea class="deco-textarea">A refined system of components and patterns for elegant interfaces.</textarea></label><span class="deco-label">File upload</span><label class="deco-file-upload">${icon('upload')}<span data-deco-filename>Drag & drop file here</span><small>or click to browse</small><input class="deco-file" type="file" id="deco-upload" aria-label="Upload reference file"></label>${button('Browse', 'ghost', 'data-deco-browse')}</div>`)}
      </div>
      <div class="demo-ad-lane">
        ${group(4, 'select', 'Select & choice', `<div class="demo-ad-stack"><select class="deco-select" aria-label="Choose a section" id="deco-select"><option value="">Choose an option</option><optgroup label="Navigation"><option>Dashboard</option><option>Analytics</option><option>Reports</option></optgroup></select><div class="deco-select-panel" role="listbox" aria-label="Expanded navigation choices"><span class="deco-group-label" role="presentation">Navigation</span>${['Dashboard','Analytics','Reports'].map((name, i) => `<button type="button" class="deco-option" role="option" aria-selected="${i === 1}" tabindex="${i === 1 ? 0 : -1}">${name}<span aria-hidden="true">${i === 1 ? '&#10003;' : ''}</span></button>`).join('')}</div><span class="deco-label">Multi-select</span><div class="deco-multi">${['Design','Development','Testing'].map((name) => `<span class="deco-chip">${name}<button type="button" data-deco-remove aria-label="Remove ${name}" title="Remove ${name}">${icon('x')}</button></span>`).join('')}</div></div>`)}
        <div class="demo-ad-two">
          ${group(5, 'checks', 'Checkboxes', `${choice('checkbox','Checked','checked')}${choice('checkbox','Unchecked')}${choice('checkbox','Disabled checked','checked disabled')}`)}
          ${group(6, 'radios', 'Radios', `${choice('radio','Selected','name="deco-radio" checked')}${choice('radio','Unselected','name="deco-radio"')}${choice('radio','Disabled','name="deco-radio" disabled')}`)}
          ${group(7, 'switches', 'Switches', ['On','Off','Disabled'].map((name,i) => `<label class="deco-switch"><input type="checkbox" role="switch" aria-label="${name} switch" ${i === 0 ? 'checked' : i === 2 ? 'disabled' : ''}><span class="deco-switch-track" aria-hidden="true"><span class="deco-switch-thumb"></span></span><span>${name}</span></label>`).join(''))}
          ${group(8, 'empty', 'Empty & loading', `<div class="deco-empty-state">No results<br>Adjust filters</div><span class="deco-spinner" role="status" aria-label="Loading results"></span>`)}
        </div>
      </div>
      <div class="demo-ad-lane">
        ${group(9, 'range', 'Range slider', `<div class="deco-slider-wrap" style="--deco-value:68"><output class="deco-slider-output" id="deco-range-value" for="deco-range">68</output><input class="deco-slider" type="range" id="deco-range" min="0" max="100" value="68" aria-label="Range value"></div><div class="demo-ad-ticks" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>`)}
        ${group(10, 'meter', 'Threshold meter', `<div class="deco-meter" role="meter" aria-label="Threshold" aria-valuenow="55" aria-valuemin="0" aria-valuemax="100" aria-valuetext="55, caution" style="--deco-value:55"></div><div class="demo-ad-ticks"><span>Safe</span><span>Caution</span><span>Danger</span></div>`)}
        ${group(11, 'progress', 'Progress bars', `<div class="demo-ad-progress-row"><div class="deco-progress" role="progressbar" aria-label="Continuous completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72"><span class="deco-progress-bar" style="width:72%"></span></div><span>72%</span></div><div class="deco-step-progress" role="progressbar" aria-label="Segmented completion" aria-valuemin="0" aria-valuemax="6" aria-valuenow="4">${[0,1,2,3,4,5].map((i) => `<i class="${i < 4 ? 'is-done' : ''}"></i>`).join('')}</div>`)}
        ${group(12, 'tabs', 'Tabs & segmented', `<div class="deco-tabs"><div class="deco-tab-list" role="tablist" aria-label="Component views">${tabs.map((name,i) => `<button type="button" class="deco-tab" role="tab" id="deco-tab-${i}" aria-selected="${i === 0}" aria-controls="deco-tab-panel" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join('')}</div><div class="deco-tab-panel" id="deco-tab-panel" role="tabpanel" aria-labelledby="deco-tab-0" tabindex="0">Active tab content appears here.<br>Stepped edges establish hierarchy.</div></div><div class="deco-segmented" role="group" aria-label="Reporting period">${['Day','Week','Month','Year'].map((name,i) => `<button type="button" class="deco-segment" aria-pressed="${i === 1}">${name}</button>`).join('')}</div>`)}
        ${group(13, 'quantity', 'Quantity stepper', `<div class="deco-stepper"><button type="button" data-deco-decrease aria-label="Decrease quantity" title="Decrease quantity">${icon('minus')}</button><output id="deco-quantity" aria-label="Quantity" aria-live="polite">2</output><button type="button" data-deco-increase aria-label="Increase quantity" title="Increase quantity">${icon('plus')}</button></div>`)}
      </div>
      <div class="demo-ad-lane">${group(14, 'stages', 'Stages', `<ol class="deco-stage-list" aria-label="Project stages">${stages.map((name,i) => `<li class="deco-stage ${i < 2 ? 'is-done' : ''}" ${i === 2 ? 'aria-current="step"' : ''}><span class="deco-stage-number"><span>0${i+1}</span></span><div><strong>${name}</strong><small>${i < 2 ? 'Complete' : i === 2 ? 'In progress' : 'Pending'}</small></div></li>`).join('')}</ol>`)}</div>
    </div>
    <div class="demo-ad-lower">
      ${group(15, 'feedback', 'Status badges & alerts', `<div class="demo-ad-row">${badges.map(([kind, name]) => `<span class="deco-badge deco-badge-${kind}">${name}</span>`).join('')}</div><div class="demo-ad-stack">${alerts.map(([kind, name, text]) => `<div class="deco-alert deco-alert-${kind}"><span class="deco-alert-icon" aria-hidden="true"></span><div class="deco-alert-body"><strong class="deco-alert-title">${name}:</strong>${text}</div><button type="button" class="deco-alert-close" data-deco-dismiss aria-label="Dismiss ${name}" title="Dismiss ${name}">${icon('x')}</button></div>`).join('')}</div>`)}
      ${group(16, 'table', 'Data table', `<div class="deco-table-wrap"><table class="deco-table"><caption class="deco-sr-only">Component inventory</caption><thead><tr>${['ID','Component','Category','Status','Updated'].map((name) => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${['Buttons','Select','Slider','Tabs','Alerts'].map((name,i) => `<tr><td>00${i+1}</td><td>${name}</td><td>${['Forms','Forms','Inputs','Navigation','Feedback'][i]}</td><td><span class="deco-status-dot" aria-hidden="true"></span>${i < 4 ? 'Active' : 'In review'}</td><td>May ${i < 3 ? 24 : 23}, 1936</td></tr>`).join('')}</tbody></table></div>`)}
      ${group(17, 'overlays', 'Tooltip, loading & dialog', `<div class="deco-dialog" role="group" aria-label="Confirmation specimen"><div class="demo-ad-two"><div class="deco-tooltip" role="tooltip" id="deco-tooltip">Helpful context about<br>an interface element.</div><span class="deco-spinner deco-spinner-lg" role="status" aria-label="Loading confirmation"></span></div><h4>Confirm action</h4><p>Proceed with this action?<br>The archive records the decision.</p><div class="deco-dialog-actions">${button('Cancel', 'ghost', 'data-deco-preview-cancel')}${button('Review', 'secondary', 'data-deco-open aria-describedby="deco-tooltip"')}${button('Confirm', 'primary', 'data-deco-open')}</div></div>`)}
    </div>
    <footer class="demo-ad-footer"><div class="deco-divider"></div><div class="deco-palette">${swatches.map(([token,name]) => `<div class="deco-swatch"><i style="--deco-swatch-color:var(--deco-${token})"></i><span>${name}</span></div>`).join('')}</div></footer>
    <div class="demo-ad-supplement"><details class="deco-details"><summary>System details</summary><p>Reference system v1.0 / Metropolitan Moderne</p><div class="deco-skeleton" aria-hidden="true"></div><span class="deco-badge deco-badge-outline">Archived</span></details><span class="deco-help-text" role="status" data-deco-feedback>System ready</span>${button(safeMode, 'ghost', `data-deco-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${reference}"`)}</div>
    <dialog class="deco-dialog" aria-labelledby="deco-dialog-title"><h3 id="deco-dialog-title">Confirm action</h3><p>Update this local specimen? No data is sent.</p><div class="deco-dialog-actions">${button('Cancel','ghost','data-deco-cancel')}${button('Confirm','primary','data-deco-confirm')}</div></dialog>
  </section>`;
}

/**
 * Binds keyboard and native controls to inert local specimen data.
 * @param {Function} useReference Switches the host demo to its reference palette.
 * @returns {void}
 */
function bind(useReference) {
  const root = document.getElementById('art-deco-template');
  if (!root) return;
  const report = (message) => { root.querySelector('[data-deco-feedback]').textContent = message; };
  root.querySelector('[data-deco-reference]').addEventListener('click', useReference);
  const dialog = root.querySelector('dialog');
  let opener;
  root.querySelectorAll('[data-deco-open]').forEach((control) => control.addEventListener('click', () => { opener = control; dialog.showModal(); }));
  root.querySelector('[data-deco-cancel]').addEventListener('click', () => dialog.close());
  root.querySelector('[data-deco-confirm]').addEventListener('click', () => { dialog.close(); report('Sample action confirmed locally.'); });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  root.querySelector('[data-deco-preview-cancel]').addEventListener('click', () => report('Sample action cancelled.'));
  root.querySelectorAll('[data-deco-dismiss]').forEach((control) => control.addEventListener('click', () => { control.closest('.deco-alert').hidden = true; report('Notification dismissed.'); }));
  root.querySelectorAll('[data-deco-remove]').forEach((control) => control.addEventListener('click', () => { const next = control.closest('.deco-chip').nextElementSibling?.querySelector('button'); control.closest('.deco-chip').remove(); (next || root.querySelector('#deco-select')).focus(); report('Tag removed.'); }));
  const slider = root.querySelector('#deco-range');
  slider.addEventListener('input', () => { slider.parentElement.style.setProperty('--deco-value', slider.value); root.querySelector('#deco-range-value').value = slider.value; });
  const quantity = root.querySelector('#deco-quantity');
  root.querySelectorAll('[data-deco-decrease], [data-deco-increase]').forEach((control) => control.addEventListener('click', () => {
    quantity.value = String(Math.min(99, Math.max(0, Number(quantity.value) + (control.hasAttribute('data-deco-increase') ? 1 : -1))));
    root.querySelector('[data-deco-decrease]').disabled = Number(quantity.value) === 0;
    root.querySelector('[data-deco-increase]').disabled = Number(quantity.value) === 99;
  }));
  root.querySelectorAll('[data-deco-page]').forEach((control) => control.addEventListener('click', () => {
    root.querySelectorAll('[data-deco-page]').forEach((item) => item.removeAttribute('aria-current'));
    control.setAttribute('aria-current', 'page'); report(`Page ${control.dataset.decoPage} selected.`);
  }));
  root.querySelectorAll('.deco-tab-list, .deco-segmented, .deco-select-panel').forEach((container) => {
    const controls = [...container.querySelectorAll('button')];
    const isTabs = container.matches('.deco-tab-list');
    const isOptions = container.matches('.deco-select-panel');
    const attr = isTabs || isOptions ? 'aria-selected' : 'aria-pressed';
    const activate = (control) => {
      controls.forEach((item) => { item.setAttribute(attr, String(item === control)); if (isTabs || isOptions) item.tabIndex = item === control ? 0 : -1; if (isOptions) item.lastElementChild.textContent = item === control ? '\u2713' : ''; });
      if (isTabs) { const panel = root.querySelector('#deco-tab-panel'); panel.setAttribute('aria-labelledby', control.id); panel.textContent = `${control.textContent.trim()} / Metropolitan Moderne component archive.`; }
      if (isOptions) root.querySelector('#deco-select').value = control.firstChild.textContent.trim();
    };
    controls.forEach((control, index) => {
      control.addEventListener('click', () => activate(control));
      control.addEventListener('keydown', (event) => {
        const direction = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 0;
        if (!direction && !['Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = controls[event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : (index + direction + controls.length) % controls.length];
        next.focus(); activate(next);
      });
    });
  });
  root.querySelector('#deco-select').addEventListener('change', (event) => {
    const selected = [...root.querySelectorAll('.deco-option')].find((item) => item.firstChild.textContent.trim() === event.target.value);
    if (selected) selected.click();
  });
  const upload = root.querySelector('#deco-upload');
  root.querySelector('[data-deco-browse]').addEventListener('click', () => upload.click());
  upload.addEventListener('change', () => { root.querySelector('[data-deco-filename]').textContent = upload.files[0]?.name || 'Drag & drop file here'; });
  root.querySelector('#deco-search').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const rows = [...root.querySelectorAll('.deco-table tbody tr')];
    rows.forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(query); });
    report(`${rows.filter((row) => !row.hidden).length} matching components.`);
  });
}

return { render, bind };
})();
