/**
 * Interactive Organic Modern reference. Only authored specimen content is interpolated.
 * Component paint and geometry live in the distributed preset, not demo CSS.
 * @namespace OrganicSpecimen
 */
(() => {
  const assets = new URL('./assets/', document.currentScript.src);
  const reference = new URL('organic-reference-light.png', assets).href;
  const materials = ['Lime Plaster', 'Western Red Cedar', 'Reclaimed Oak', 'Hempcrete', 'Cork', 'Weathered Steel'];
  const projects = ['Riverside House', 'Cedar Retreat', 'Coastal Pavilions', 'Cliff House', 'Community Hall'];
  const rows = materials.slice(0, 5).map((material, i) => [`A-10${i + 1}`, ['Exterior wall', 'Cladding', 'Flooring', 'Insulation', 'Roof'][i], material, i === 2 ? 'In review' : i === 4 ? 'Pending' : 'Approved', ['$4,500', '$7,850', '$6,230', '$3,110', '$8,950'][i]]);

  /** @param {string} name Phosphor regular glyph. @returns {string} Current-color icon. */
  const icon = (name) => `<span class="organic-icon" aria-hidden="true">${window.ORGANIC_PHOSPHOR_ICONS?.[name] || ''}</span>`;
  /** @param {string} name Icon. @param {string} label Accessible name. @param {string} attrs Authored attributes. @returns {string} Tool button. */
  const tool = (name, label, attrs = '') => `<button type="button" class="organic-icon-button" aria-label="${label}" title="${label}" ${attrs}>${icon(name)}</button>`;
  /** @param {string} text Authored label. @param {string} variant Visual suffix. @param {string} attrs Authored attributes. @returns {string} Button. */
  const button = (text, variant = '', attrs = '') => `<button type="button" class="organic-button ${variant ? `organic-button-${variant}` : ''}" ${attrs}>${text}</button>`;
  /**
   * Windows only photographic regions from the supplied board, never interface pixels.
   * Coordinates use its 1920x1280 presentation scale; the full retained PNG stays unchanged.
   * @param {number[]} region Photo-only x/y/width/height rectangle.
   * @param {string} alt Image description.
   * @returns {string} Clipped, locally retained photograph.
   */
  function photo([x, y, w, h], alt) {
    return `<span class="organic-photo"><img src="${reference}" alt="${alt}" loading="lazy" style="width:${1920 / w * 100}%;height:${1280 / h * 100}%;left:${-x / w * 100}%;top:${-y / h * 100}%"></span>`;
  }
  /** @param {string} title Heading. @param {string} body Section body. @param {string} id Anchor. @returns {string} Control family. */
  const section = (title, body, id) => `<section id="organic-${id}"><h4 class="organic-section-heading">${title}</h4>${body}</section>`;
  /** @param {string} type Native type. @param {string} name Label. @param {string} value Authored value. @returns {string} Labeled field. */
  function field(type, name, value = '') {
    const input = `<input class="organic-input" id="organic-${type}" type="${type}" value="${value}" ${type === 'number' ? 'min="0"' : ''}>`;
    return `<label class="organic-field" for="organic-${type}">${name}</label>${type === 'password' ? `<div class="organic-input-action">${input}${tool('eye', 'Show Organic password', 'data-organic-password aria-pressed="false"')}</div>` : input}`;
  }
  /** @param {string} label Choice name. @param {string} type Native type. @param {string} attrs Authored state. @returns {string} Choice. */
  const choice = (label, type = 'checkbox', attrs = '') => `<label><input type="${type}" ${attrs}>${label}</label>`;
  /** @param {string} name Name. @param {string} id Unique id. @param {number} value Initial value. @param {string} prefix Unit prefix. @returns {string} Range. */
  const range = (name, id, value, prefix = '') => `<label class="organic-range" for="organic-${id}"><span>${name}<output class="organic-value" for="organic-${id}">${prefix}${value}</output></span><input type="range" id="organic-${id}" min="0" max="100" value="${value}" data-organic-unit="${prefix}" style="--organic-value:${value}%"></label>`;
  /** @param {string} name Accessible name. @returns {string} Page navigation. */
  const pages = (name) => `<nav class="organic-pagination" aria-label="${name}">${tool('caret-left', `Previous ${name}`, 'data-organic-page="prev" disabled')}${[1, 2, 3, 4].map((n) => `<button type="button" data-organic-page="${n}" ${n === 1 ? 'aria-current="page"' : ''}>${n}</button>`).join('')}${tool('caret-right', `Next ${name}`, 'data-organic-page="next"')}</nav>`;

  /**
   * @param {string} ui Active preset.
   * @param {string} mode Active mode, independent of color theme.
   * @returns {string} Complete public-component specimen or empty markup.
   */
  function render(ui, mode = 'light') {
    if (ui !== 'organic-modern') return '';
    return `<section class="organic-sheet" id="organic-template" data-preset-only="organic-modern" aria-label="Organic Modern reference">
      <header class="organic-masthead"><div class="organic-brand"><div><strong>ORGANIC MODERN</strong><small>SUSTAINABLE INTERFACE SYSTEM</small></div>${icon('leaf')}</div>
        <nav class="organic-tabs" aria-label="Project sections" style="width:auto">${['Projects', 'Materials', 'Library', 'Resources', 'Journal'].map((label) => `<a class="organic-tab" href="#organic-${label === 'Materials' ? 'materials' : label === 'Projects' ? 'workspace' : 'controls'}">${label}</a>`).join('')}</nav>
        <label class="organic-search"><input class="organic-input" type="search" aria-label="Search Organic projects" placeholder="Search projects..." data-organic-search>${icon('magnifying-glass')}</label>
        <div>${tool('palette', 'Use Organic reference palette', 'data-organic-reference')}${tool('sun', `Switch Organic ${mode === 'dark' ? 'light' : 'dark'} mode`, 'data-organic-mode')}${tool('bell', 'Project notifications', 'data-organic-notifications')}<span class="organic-avatar">${photo([32, 730, 23, 24], 'Fictional studio member')}</span></div>
      </header>
      <div class="organic-workspace" id="organic-workspace">
        <div class="organic-sidebar"><section><h4 class="organic-section-heading">Projects</h4><div class="organic-project-list">${projects.map((name, i) => `<button type="button" class="organic-project-item" data-organic-project="${i}" aria-pressed="${i === 0}">${photo(i === 0 ? [295, 105, 620, 330] : i === 2 ? [20, 860, 237, 115] : [405 + (i % 3) * 103, 524, 78, 112], name + ' material study')}<span><strong>${name}</strong><small>${['Portland, OR', 'Bend, OR', 'Mendocino, CA', 'San Diego, CA', 'Eugene, OR'][i]}</small></span></button>`).join('')}</div>${button(`${icon('plus')} New project`, 'ghost', 'data-organic-new-project')}</section>
          <section class="organic-status-card"><h4 class="organic-section-heading">Project status</h4><h3 data-organic-project-title>Riverside House</h3><small>Schematic design</small><div class="organic-score" role="progressbar" aria-label="Project completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="62"><strong>62%</strong><small>Complete</small></div><p><small>Planning / Design / Documentation / Construction</small></p></section>
          <section><h4 class="organic-section-heading">Team</h4><div class="organic-avatar-row">${[0, 1, 2, 3].map((i) => photo([32 + i * 34, 730, 23, 24], 'Fictional project team member')).join('')}${tool('plus', 'Add team member', 'data-organic-invite')}</div></section>
          <section><h4 class="organic-section-heading">Shared with</h4><div class="organic-avatar-row">${[0, 1, 2].map((i) => photo([32 + i * 34, 730, 23, 24], 'Fictional collaborator')).join('')}${tool('plus', 'Invite collaborator', 'data-organic-invite')}</div></section>
          <figure class="organic-quote-card">${photo([22, 865, 225, 113], 'River winding through a forested valley')}<blockquote>Designing spaces that connect people and place.</blockquote><figcaption>Studio journal</figcaption></figure>
        </div>
        <div class="organic-project-canvas">
          <div class="organic-hero-card">${photo([290, 98, 635, 355], 'Timber living room opening onto a forest and river')}<div class="organic-hero-overlay"><small>FEATURED PROJECT</small><h3 data-organic-project-title>Riverside House</h3><p>Portland, Oregon</p><small>${icon('leaf')} Living with nature</small><div class="organic-dialog-actions">${button(`View project ${icon('arrow-right')}`, 'primary', 'data-organic-view-project')}</div></div></div>
          <div class="organic-overview-row"><section class="organic-panel" id="organic-materials"><h4 class="organic-section-heading">Material palette</h4><div class="organic-materials">${materials.map((name, i) => `<button type="button" class="organic-material" aria-pressed="${i === 0}" data-organic-material="${i}"><span class="organic-material-image">${photo([303 + i * 103, 524, 80, 112], name + ' texture')}</span><strong>${name}</strong><small>${['Walls', 'Cladding', 'Flooring', 'Insulation', 'Underlayment', 'Accents'][i]}</small></button>`).join('')}</div></section>
          <section class="organic-panel organic-impact"><h4 class="organic-section-heading">Project impact</h4><dl>${[['Embodied carbon', '320'], ['Energy use intensity', '24'], ['Water use', '1,240']].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></section></div>
          <div class="organic-data-row"><section class="organic-panel"><h4 class="organic-section-heading">Schedule</h4><div class="organic-table-wrap" tabindex="0" role="region" aria-label="Material schedule"><table class="organic-table"><thead><tr>${['ID', 'Element', 'Material', 'Status', 'Cost'].map((name) => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody data-organic-rows>${tableRows(1)}</tbody></table></div><div class="organic-dialog-actions">${pages('schedule pages')}</div><small data-organic-page-summary>Showing 1 to 5 of 19 materials</small></section>
          <section class="organic-panel organic-performance"><h4 class="organic-section-heading">Performance</h4>${[['Carbon threshold', 50, '320'], ['Thermal comfort', 28, '8%'], ['Daylight autonomy', 72, '72%']].map(([name, value, label]) => `<label>${name} <strong>${label}</strong><meter min="0" max="100" value="${value}">${value}%</meter><small>0% / 50% / 100%</small></label>`).join('')}</section></div>
          <div class="organic-notices">${[['check-circle', 'Data saved', 'Your changes were saved.'], ['info', 'Material update', 'Hempcrete specification updated.'], ['warning', 'Threshold alert', 'Carbon limit approaching.']].map(([name, title, copy]) => `<div class="organic-notice">${icon(name)}<div><strong>${title}</strong><small>${copy}</small></div></div>`).join('')}</div>
          <form class="organic-add-material"><h4 class="organic-section-heading">Add material</h4><div class="organic-input-grid"><label class="organic-field">Material name<input class="organic-input" name="material" placeholder="e.g. Rammed earth" required maxlength="60"></label><label class="organic-field">Category<select class="organic-select" name="category"><option>Structural</option><option>Finishes</option><option>Insulation</option></select></label><label class="organic-field">Supplier<select class="organic-select" name="supplier" required><option value="">Select supplier</option><option>Local materials studio</option><option>Regional cooperative</option></select></label></div><div class="organic-dialog-actions"><button class="organic-button" type="reset">Cancel</button><button class="organic-button organic-button-primary" type="submit">Add material</button></div></form>
        </div>
        <section class="organic-control-lab" id="organic-controls"><header><h3>CONTROL LAB</h3><small>Native elements / Organic Modern</small></header>
          ${section('Buttons', `<div class="organic-button-grid">${button(`Primary ${icon('leaf')}`, 'primary', 'data-organic-action')}${button('Secondary', 'secondary', 'data-organic-action')}${button('Outline', 'outline', 'data-organic-action')}${button('Pressed', '', 'aria-pressed="true" data-organic-pressed')}${button(`${icon('trash')} Destructive`, 'danger', 'data-organic-modal')}${button('Loading', '', 'aria-busy="true" disabled')}${button('Disabled', '', 'disabled')}</div>`, 'buttons')}
          ${section('Inputs', `<div class="organic-input-grid">${[['text', 'Text', ''], ['email', 'Email', 'studio@example.com'], ['password', 'Password', 'organic'], ['search', 'Search', ''], ['url', 'Website', 'https://example.com'], ['number', 'Number', '1240']].map(([type, name, value]) => `<div>${field(type, name, value)}</div>`).join('')}<label class="organic-field organic-field-wide">Textarea<textarea class="organic-textarea" rows="3">Notes about material selection, site conditions, or design intent.</textarea></label><label class="organic-field">File upload<span class="organic-file-drop">${icon('upload-simple')}<strong data-organic-file-name>Drop files here</strong><small>or browse</small><input type="file" aria-label="Upload material file"></span></label></div>`, 'inputs')}
          ${section('Selects', `<div class="organic-input-grid"><label class="organic-field">Single select<select class="organic-select"><option>Material category</option>${materials.map((name) => `<option>${name}</option>`).join('')}</select></label><div class="organic-field"><span>Multi select</span><div class="organic-token-input">${['Vases &amp; vessels', 'Dried botanicals'].map((name) => `<span class="organic-token">${name}${tool('x', `Remove ${name}`, 'data-organic-remove')}</span>`).join('')}<select class="organic-select" aria-label="Add material tag" data-organic-tag><option value="">Add tag</option><option>Planters</option><option>Textiles</option></select></div></div><div class="organic-expanded-select"><span class="organic-field">Expanded select</span><button type="button" class="organic-button" aria-haspopup="listbox" aria-expanded="true" aria-controls="organic-options" data-organic-options><span data-organic-selection>Dried botanicals</span>${icon('caret-down')}</button><div id="organic-options" role="listbox" aria-label="Material type">${['Vases &amp; vessels', 'Bowls &amp; trays', 'Planters', 'Botanicals', 'Dried botanicals', 'Fresh botanicals', 'Textiles'].map((name, i) => `<button type="button" role="option" class="organic-option" aria-selected="${i === 4}" tabindex="${i === 4 ? 0 : -1}"><span>${name}</span>${i === 4 ? icon('check') : ''}</button>`).join('')}</div></div></div>`, 'selects')}
          ${section('Choices', `<div class="organic-choice-columns"><div><small>Checkboxes</small>${choice('Checked', 'checkbox', 'checked')}${choice('Unchecked')}${choice('Indeterminate', 'checkbox', 'data-organic-mixed')}${choice('Disabled', 'checkbox', 'disabled')}</div><div><small>Radio buttons</small>${choice('Selected option', 'radio', 'name="organic-choice" checked')}${choice('Unselected option', 'radio', 'name="organic-choice"')}${choice('Disabled option', 'radio', 'disabled')}</div><div><small>Switches</small>${choice('On', 'checkbox', 'role="switch" checked')}${choice('Off', 'checkbox', 'role="switch"')}${choice('Disabled', 'checkbox', 'role="switch" disabled')}</div></div>`, 'choices')}
          ${section('Sliders &amp; progress', `<div class="organic-input-grid"><div class="organic-field-wide">${range('Price range', 'price', 75, '$')}${range('Quantity', 'quantity-range', 52)}${range('Intensity', 'intensity', 3)}</div><div class="organic-field"><span>Linear progress <output data-organic-progress-label>65%</output></span><div class="organic-progress" role="progressbar" aria-label="Linear progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" data-organic-progress><span class="organic-progress-bar" style="width:65%"></span></div><span>Segmented progress</span><ol class="organic-progress-steps" aria-label="Project milestones"><li data-complete aria-label="Planning complete">${icon('check')}</li><li data-complete aria-label="Design complete">${icon('check')}</li><li aria-current="step" aria-label="Documentation current">3</li><li aria-label="Construction pending">4</li></ol></div></div>`, 'sliders')}
          ${section('Navigation', `<div class="organic-tabs" role="tablist" aria-label="Organic views">${['Overview', 'Details', 'Analysis'].map((name, i) => `<button type="button" class="organic-tab" id="organic-tab-${i}" role="tab" aria-controls="organic-tab-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join('')}</div><div id="organic-tab-panel" role="tabpanel" aria-labelledby="organic-tab-0" tabindex="0"><p>Overview / Riverside House material study.</p></div><div class="organic-dialog-actions">${pages('Organic pages')}<div class="organic-segmented" role="group" aria-label="Reporting interval">${['Day', 'Week', 'Month', 'Year'].map((name, i) => `<button type="button" aria-pressed="${i === 1}">${name}</button>`).join('')}</div></div>`, 'navigation')}
          ${section('Quantity &amp; status', `<div class="organic-stepper">${tool('minus', 'Decrease Organic quantity', 'data-organic-quantity="-1"')}<output aria-label="Organic quantity">1</output>${tool('plus', 'Increase Organic quantity', 'data-organic-quantity="1"')}</div><div class="organic-dialog-actions"><span class="organic-badge organic-badge-success">Approved</span><span class="organic-badge organic-badge-warning">In review</span><span class="organic-badge organic-badge-danger">High impact</span></div>`, 'status')}
          ${section('Feedback', `<div class="organic-feedback-stack">${[['success', 'check-circle', 'Material saved.'], ['info', 'info', 'Specification updated.'], ['warning', 'warning', 'Carbon threshold approaching.'], ['danger', 'trash', 'Material could not be saved.']].map(([kind, glyph, text]) => `<div class="organic-alert organic-alert-${kind}">${icon(glyph)}<span>${text}</span>${tool('x', `Dismiss ${kind}`, 'data-organic-dismiss')}</div>`).join('')}</div><div class="organic-dialog-actions"><span class="organic-spinner" role="status" aria-label="Loading material"></span>${tool('info', 'Material help', 'aria-describedby="organic-help"')}<span class="organic-tooltip" role="tooltip" id="organic-help">Material data belongs to the current project.</span></div>`, 'feedback')}
          ${section('Material details', `<div class="organic-panel"><h3 data-organic-selected-material>Lime Plaster</h3><p>Selected for the current project.</p><div class="organic-dialog-actions">${button('Cancel', 'secondary', 'data-organic-cancel')}${button('Confirm', 'primary', 'data-organic-modal')}</div></div>`, 'dialog-sample')}
          <p role="status" aria-live="polite" data-organic-status></p>
        </section>
      </div>
      <dialog class="organic-dialog" id="organic-modal" aria-labelledby="organic-dialog-title"><form method="dialog"><h3 id="organic-dialog-title">Material details</h3><p>Confirm the selected material for this project.</p><div class="organic-dialog-actions"><button class="organic-button" value="cancel">Cancel</button><button class="organic-button organic-button-primary" value="confirm">Confirm</button></div></form></dialog>
    </section>`;
  }

  /** @param {number} page One-based page. @returns {string} Authored sample rows. */
  function tableRows(page) {
    return rows.slice(0, page === 4 ? 4 : 5).map((row, i) => `<tr>${row.map((value, j) => `<td>${j === 0 ? `A-${100 + (page - 1) * 5 + i + 1}` : j === 3 ? `${icon('check-circle')} ${value}` : value}</td>`).join('')}</tr>`).join('');
  }

  /**
   * Attaches interactions only to the current Organic sheet.
   * @param {Function} useReference Select original palette without changing mode.
   * @param {Function} setMode Update the shared demo's mode.
   * @returns {void}
   */
  function bind(useReference, setMode) {
    const root = document.getElementById('organic-template');
    if (!root) return;
    const status = root.querySelector('[data-organic-status]');
    const tell = (text) => { status.textContent = text; };
    root.querySelector('[data-organic-reference]').addEventListener('click', useReference);
    root.querySelector('[data-organic-mode]').addEventListener('click', () => setMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark'));
    root.querySelector('[data-organic-mixed]').indeterminate = true;
    root.querySelector('[data-organic-search]').addEventListener('input', (event) => {
      const query = event.target.value.trim().toLowerCase();
      root.querySelectorAll('[data-organic-project]').forEach((node) => { node.hidden = !node.textContent.toLowerCase().includes(query); });
    });
    root.querySelector('[data-organic-password]').addEventListener('click', (event) => {
      const input = root.querySelector('#organic-password');
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-pressed', String(visible));
      event.currentTarget.setAttribute('aria-label', `${visible ? 'Hide' : 'Show'} Organic password`);
    });
    root.querySelectorAll('.organic-range input').forEach((input) => input.addEventListener('input', () => {
      input.style.setProperty('--organic-value', `${input.value}%`);
      root.querySelector(`output[for="${input.id}"]`).textContent = input.dataset.organicUnit + input.value;
      if (input.id === 'organic-price') {
        root.querySelector('[data-organic-progress]').setAttribute('aria-valuenow', input.value);
        root.querySelector('[data-organic-progress] span').style.width = `${input.value}%`;
        root.querySelector('[data-organic-progress-label]').textContent = `${input.value}%`;
      }
    }));
    root.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-organic-remove')) { button.closest('.organic-token').remove(); root.querySelector('[data-organic-tag]').focus(); }
      if (button.hasAttribute('data-organic-dismiss')) { button.closest('.organic-alert').remove(); tell('Message dismissed.'); }
      if (button.hasAttribute('data-organic-action')) tell(`${button.textContent.trim()} selected.`);
      if (button.hasAttribute('data-organic-pressed')) button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
      if (button.hasAttribute('data-organic-modal')) root.querySelector('dialog').showModal();
      if (button.hasAttribute('data-organic-cancel')) tell('Material selection cancelled.');
      if (button.hasAttribute('data-organic-invite')) tell('Invitation draft opened for this sample project.');
      if (button.hasAttribute('data-organic-notifications')) tell('No unread project notifications.');
      if (button.hasAttribute('data-organic-new-project')) { root.querySelector('.organic-add-material input').focus(); tell('Start by adding a project material.'); }
      if (button.hasAttribute('data-organic-view-project')) root.querySelector('#organic-materials').scrollIntoView({ block: 'center' });
      if (button.hasAttribute('data-organic-material')) {
        root.querySelectorAll('[data-organic-material]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
        root.querySelector('[data-organic-selected-material]').textContent = materials[Number(button.dataset.organicMaterial)];
      }
      if (button.hasAttribute('data-organic-project')) {
        root.querySelectorAll('[data-organic-project]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
        root.querySelectorAll('[data-organic-project-title]').forEach((node) => { node.textContent = projects[Number(button.dataset.organicProject)]; });
      }
      if (button.hasAttribute('data-organic-quantity')) {
        const output = root.querySelector('.organic-stepper output');
        output.textContent = String(Math.max(0, Math.min(99, Number(output.textContent) + Number(button.dataset.organicQuantity))));
      }
      if (button.closest('.organic-segmented')) button.parentElement.querySelectorAll('button').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
      if (button.hasAttribute('data-organic-page')) {
        const nav = button.closest('nav');
        const current = Number(nav.querySelector('[aria-current]').dataset.organicPage);
        const action = button.dataset.organicPage;
        const next = Math.max(1, Math.min(4, action === 'prev' ? current - 1 : action === 'next' ? current + 1 : Number(action)));
        nav.querySelectorAll('[data-organic-page]').forEach((node) => { node.removeAttribute('aria-current'); if (Number(node.dataset.organicPage) === next) node.setAttribute('aria-current', 'page'); });
        nav.querySelector('[data-organic-page="prev"]').disabled = next === 1;
        nav.querySelector('[data-organic-page="next"]').disabled = next === 4;
        if (nav.getAttribute('aria-label') === 'schedule pages') {
          root.querySelector('[data-organic-rows]').innerHTML = tableRows(next);
          root.querySelector('[data-organic-page-summary]').textContent = `Showing ${(next - 1) * 5 + 1} to ${Math.min(19, next * 5)} of 19 materials`;
        } else tell(`Page ${next} selected.`);
      }
    });
    const listbox = root.querySelector('[role="listbox"]');
    const trigger = root.querySelector('[data-organic-options]');
    trigger.addEventListener('click', () => { listbox.hidden = !listbox.hidden; trigger.setAttribute('aria-expanded', String(!listbox.hidden)); if (!listbox.hidden) listbox.querySelector('[aria-selected="true"]').focus(); });
    listbox.querySelectorAll('[role="option"]').forEach((option) => option.addEventListener('click', () => {
      listbox.querySelectorAll('[role="option"]').forEach((node) => { node.setAttribute('aria-selected', String(node === option)); node.tabIndex = node === option ? 0 : -1; node.querySelector('.organic-icon')?.remove(); });
      option.insertAdjacentHTML('beforeend', icon('check'));
      root.querySelector('[data-organic-selection]').textContent = option.textContent.trim();
      listbox.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }));
    listbox.addEventListener('keydown', (event) => {
      const options = [...listbox.querySelectorAll('[role="option"]')];
      const index = options.indexOf(document.activeElement);
      if (event.key === 'Escape') { listbox.hidden = true; trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        options[event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
      }
    });
    root.querySelectorAll('[role="tab"]').forEach((tab) => {
      tab.addEventListener('click', () => {
        root.querySelectorAll('[role="tab"]').forEach((node) => { node.setAttribute('aria-selected', String(node === tab)); node.tabIndex = node === tab ? 0 : -1; });
        const panel = root.querySelector('#organic-tab-panel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.textContent = `${tab.textContent} / ${tab.textContent === 'Analysis' ? 'Material impact and lifecycle assessment.' : tab.textContent === 'Details' ? 'Material specifications and supplier records.' : 'Riverside House material study.'}`;
      });
      tab.addEventListener('keydown', (event) => {
        const tabs = [...root.querySelectorAll('[role="tab"]')];
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = tabs[event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
          next.focus(); next.click();
        }
      });
    });
    root.querySelector('[data-organic-tag]').addEventListener('change', (event) => {
      if (!event.target.value) return;
      const chip = document.createElement('span');
      chip.className = 'organic-token';
      chip.textContent = event.target.value;
      chip.insertAdjacentHTML('beforeend', tool('x', `Remove ${event.target.value}`, 'data-organic-remove'));
      event.target.before(chip);
      event.target.value = '';
    });
    root.querySelector('[type="file"]').addEventListener('change', (event) => { root.querySelector('[data-organic-file-name]').textContent = event.target.files[0]?.name || 'Drop files here'; });
    root.querySelector('.organic-add-material').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = new FormData(event.target).get('material');
      const row = root.querySelector('[data-organic-rows]').insertRow();
      ['New', 'Material', name, 'Pending', '-'].forEach((value) => { row.insertCell().textContent = value; });
      tell(`${name} added to the sample schedule.`);
      event.target.reset();
    });
    root.querySelector('dialog').addEventListener('close', (event) => tell(event.target.returnValue === 'confirm' ? 'Material confirmed.' : 'Confirmation cancelled.'));
  }
  window.OrganicSpecimen = { render, bind };
})();
