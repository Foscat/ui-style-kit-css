/**
 * Sculpted Product Studio reference sheet. All actions affect local demo state only.
 * @namespace ClaySpecimen
 */
window.ClaySpecimen = (() => {
  const portraits = new URL('./assets/clay-avatars.png', document.currentScript.src).href;
  /** @param {string} name Licensed icon name. @returns {string} Decorative icon. */
  const icon = (name) => '<span aria-hidden="true">' + (window.UI_STYLE_KIT_ICONS[name] || '') + '</span>';
  /** @param {string} text Authored label. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. */
  const button = (text, variant = '', attrs = '') => `<button type="button" class="clay-button ${variant ? 'clay-button-' + variant : ''}" ${attrs}>${text}</button>`;
  /** @param {string} name Icon name. @param {string} label Accessible name. @param {string} attrs Authored attributes. @returns {string} Icon button. */
  const tool = (name, label, attrs = '') => `<button type="button" class="clay-icon-button" aria-label="${label}" title="${label}" ${attrs}>${icon(name)}</button>`;
  /** @param {string} id Stable group id. @param {string} title Group title. @param {string} body Authored content. @returns {string} Reference group. */
  const group = (id, title, body) => `${id === 'controls' ? '<!--demo-style-feature-->' : ''}<section class="clay-reference-section" id="clay-${id}" data-clay-group="${id}"><h3 class="clay-section-title">${title}</h3>${body}</section>${id === 'controls' ? '<!--/demo-style-feature-->' : ''}`;
  /** @param {string} type Native field type. @param {string} label Field label. @param {string} value Sample value. @returns {string} Labeled field. */
  function field(type, label, value) {
    if (type === 'search' || type === 'number') {
      const id = 'clay-field-' + type;
      const control = `<input class="clay-input" type="${type}" id="${id}" value="${value}" ${type === 'search' ? 'placeholder="Search components..."' : 'min="0" max="999"'}>`;
      const actions = type === 'search' ? tool('x', 'Clear component search', 'data-clay-search-clear') : tool('minus', 'Decrease number', 'data-clay-number="-1"') + tool('plus', 'Increase number', 'data-clay-number="1"');
      return `<div class="clay-field-row"><label for="${id}">${label}</label><div class="clay-input-wrap">${type === 'search' ? icon('search') : ''}${control}${actions}</div></div>`;
    }
    return `<label class="clay-field-row"><span>${label}</span><input class="clay-input" type="${type}" value="${value}"></label>`;
  }
  /** @param {string} type Native choice type. @param {string} label Visible label. @param {string} attrs Authored state. @returns {string} Native choice. */
  function choice(type, label, attrs = '') {
    const kind = type === 'radio' ? 'radio' : 'check';
    return `<label class="clay-${kind}"><input type="${type}" ${attrs}><span class="clay-${kind}-control" aria-hidden="true"></span><span>${label}</span></label>`;
  }
  /** @param {string} label Visible switch label. @param {string} attrs Native state. @returns {string} Switch. */
  const toggle = (label, attrs = '') => `<label class="clay-switch"><span>${label}</span><input type="checkbox" role="switch" ${attrs}><span class="clay-switch-track" aria-hidden="true"><span class="clay-switch-thumb"></span></span></label>`;
  /** @param {string} label Progress name. @param {number} value Percentage. @returns {string} Progress bar. */
  const progress = (label, value) => `<div class="clay-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="clay-progress-bar" style="width:${value}%"></span></div>`;
  const disciplines = ['Design Systems', 'Product Design', 'Engineering', 'Research', 'Marketing'];
  const palette = [['Chalk', '#e4ddd3'], ['Mist Gray', '#c6c2bb'], ['Lavender', '#b6aec5'], ['Dusty Indigo', '#777991'], ['Mineral Blue', '#748d9d'], ['Warm Sand', '#d0b88f'], ['Charcoal', '#494946'], ['Coral', '#cc8066'], ['Sage', '#a0ab91'], ['Cobalt', '#66859c']];
  /** Shared role swatches remain live when the demo's RGB token editor changes theme paint. */
  const themedPalette = [['Surface', 'surface'], ['Inset', 'surface-soft'], ['Raised', 'surface-strong'], ['Primary', 'primary'], ['Secondary', 'secondary'], ['Warning', 'warning'], ['Text', 'text'], ['Danger', 'danger'], ['Success', 'success'], ['Accent', 'accent']].map(([name, role]) => [name, `rgb(var(--clay-${role}-rgb))`]);
  const rows = [
    ['Research user needs', 'Product Lab', 'In Progress', 'High', 'May 28, 2025'],
    ['Define roadmap', 'Product Lab', 'In Progress', 'Medium', 'Jun 04, 2025'],
    ['Design system v1', 'Design Team', 'Complete', 'Low', 'May 20, 2025'],
    ['Build components', 'Dev Team', 'On Hold', 'High', 'Jun 10, 2025']
  ];
  /** @returns {string} Shared confirmation copy. */
  const confirmation = () => `<div>${icon('triangle-alert')}<strong>Confirm Action</strong></div><p>This action cannot be undone.<br>Are you sure you want to proceed?</p>`;

  /**
   * Renders only for Clay; material and responsive geometry belong to the library CSS.
   * @param {string} ui Active style.
   * @param {string} mode Active color mode.
   * @param {boolean} referencePalette Whether the original mineral palette is selected.
   * @returns {string} Complete reference sheet or empty markup.
   */
  function render(ui, mode = 'light', referencePalette = false) {
    if (ui !== 'clay') return '';
    const safeMode = ['light', 'dark', 'contrast'].includes(mode) ? mode : 'light';
    const states = ['Default', 'Hover', 'Pressed', 'Loading', 'Disabled'];
    return `<section class="clay-sheet" id="clay-template" data-preset-only="clay" aria-label="Clay Sculpted Product Studio reference sheet">
      <aside class="clay-rail" aria-label="Studio navigation">
        <div class="clay-studio-mark" aria-label="Sculpted Product Studio">SP<br>ST</div>
        <nav>${[['Overview', 'house', 'masthead'], ['Foundations', 'layers', 'palette'], ['Components', 'lock-keyhole', 'buttons'], ['Patterns', 'external-link', 'navigation'], ['Data Display', 'list', 'table'], ['Feedback', 'messages-square', 'alerts'], ['Utilities', 'settings', 'controls']].map(([label, name, id], i) => `<a class="clay-rail-link" href="#clay-${id}" ${i === 0 ? 'aria-current="page"' : ''}>${icon(name)}${label}</a>`).join('')}</nav>
        <div data-clay-rail-bottom><label class="clay-inset">Theme<select class="clay-select" aria-label="Clay theme mode" data-clay-mode>${['light', 'dark', 'contrast'].map((value) => `<option value="${value}" ${safeMode === value ? 'selected' : ''}>Clay ${value}</option>`).join('')}</select></label>
        <div class="clay-inset">Version<br><span>1.0.0</span></div>
        <div class="clay-inset"><p>A handcrafted component system for modern product experiences.</p><span class="clay-badge-seal">SCULPTED<br>PRODUCT<br>STUDIO</span></div></div>
      </aside>
      <div data-clay-main>
        <header class="clay-masthead" id="clay-masthead"><div><h2>CLAY CSS PRESET</h2><p>SCULPTED PRODUCT STUDIO &mdash; UI REFERENCE SYSTEM v1.0 &mdash; ${safeMode.toUpperCase()}</p></div>
          <div class="clay-palette" id="clay-palette"><h3 class="clay-section-title">Palette</h3><div class="clay-palette-grid">${(referencePalette ? palette : themedPalette).map(([name, color]) => `<figure><span class="clay-swatch" style="--clay-swatch-color:${color}"></span><figcaption>${name}</figcaption></figure>`).join('')}</div></div>
          <div class="clay-studio">${icon('flask-conical')}<div><strong>SCULPTED PRODUCT STUDIO</strong><p>Thoughtful tools for building products with clarity and craft.</p></div></div>
        </header>
        <div class="clay-component-matrix">
          ${group('buttons', 'Buttons', `<div class="clay-button-matrix"><span></span>${states.map((state) => `<span>${state}</span>`).join('')}${[['Primary', 'primary'], ['Secondary', 'secondary'], ['Outline', 'outline'], ['Destructive', 'danger']].map(([label, variant]) => `<span>${label}</span>${states.map((state) => button(state === 'Loading' ? 'Loading' : state === 'Disabled' ? 'Disabled' : variant === 'danger' ? 'Delete' : 'Button', variant, `data-clay-state="${state.toLowerCase()}" ${state === 'Disabled' ? 'disabled' : state === 'Loading' ? 'aria-busy="true" disabled' : 'data-clay-action'}`)).join('')}`).join('')}<span>Pressed</span>${['primary', 'secondary', 'outline'].map((variant) => button('Pressed', variant, 'data-clay-state="pressed" data-clay-action')).join('')}<span></span><span></span><span>Loading</span>${button('Loading', 'primary', 'aria-busy="true" disabled')}${button('Loading', 'secondary', 'aria-busy="true" disabled')}<span class="clay-loading-track">${progress('Loading', 30)}</span></div>`)}
          ${group('inputs', 'Inputs', `${field('text', 'Text', 'Sculpted product studio')}<div class="clay-field-row"><label for="clay-password">Password</label><div class="clay-input-wrap"><input class="clay-input" id="clay-password" type="password" value="sculpted">${tool('eye', 'Show password', 'data-clay-password aria-pressed="false"')}</div></div>${field('search', 'Search', '')}${field('number', 'Number', '42')}${field('date', 'Date', '2025-05-24')}${field('time', 'Time', '09:30')}${field('datetime-local', 'Date & Time', '2025-05-24T09:30')}<label class="clay-field-row"><span>Textarea</span><textarea class="clay-textarea" rows="2">Clay interfaces bring digital experiences back to earth.</textarea></label><div class="clay-field-row"><span>File Upload</span><label class="clay-file-zone">${icon('upload')}<span data-clay-file-label>Drop files here or</span><span class="clay-button clay-button-secondary">Browse Files</span><small>PDF, DOCX, XLSX, PNG up to 10MB</small><input type="file" aria-label="Upload file" accept=".pdf,.docx,.xlsx,.png"></label></div>`)}
          ${group('select', 'Select (closed)', `<select class="clay-select" aria-label="Discipline"><option value="">Select an option</option>${disciplines.map((item) => `<option>${item}</option>`).join('')}</select><h4 class="clay-section-title">Select (expanded)</h4><div class="clay-select-menu"><input class="clay-input" type="search" placeholder="Search or select..." aria-label="Search disciplines"><div role="listbox" aria-label="Disciplines">${[...disciplines, 'Disabled option'].map((name, i) => `<button type="button" class="clay-option" role="option" aria-selected="${i === 1}" tabindex="${i === 1 ? 0 : -1}" ${i === 5 ? 'disabled aria-disabled="true"' : ''}>${name}${icon('check')}</button>`).join('')}</div></div>`)}
          <div class="clay-choice-stack">
            ${group('tags', 'Multi-select (tags)', `<form class="clay-tags"><div>${['Design', 'Research', 'Development'].map((name) => `<span class="clay-chip"><span>${name}</span>${tool('x', 'Remove ' + name, 'data-clay-remove')}</span>`).join('')}</div><label class="clay-sr-only" for="clay-new-tag">Add tag</label><input class="clay-input" id="clay-new-tag" placeholder="Add a tag..." maxlength="40"><button class="clay-sr-only" type="submit">Add</button></form>`)}
            ${group('choices', 'Choices', `<div class="clay-choices"><div><h4 class="clay-section-title">Checkboxes</h4>${choice('checkbox', 'Checked', 'checked')}${choice('checkbox', 'Unchecked')}${choice('checkbox', 'Indeterminate', 'data-clay-mixed')}${choice('checkbox', 'Disabled checked', 'checked disabled')}${choice('checkbox', 'Disabled unchecked', 'disabled')}</div><div><h4 class="clay-section-title">Radios</h4>${choice('radio', 'Selected', 'name="clay-choice" checked')}${choice('radio', 'Unselected', 'name="clay-choice"')}${choice('radio', 'Disabled selected', 'name="clay-disabled-a" checked disabled')}${choice('radio', 'Disabled unselected', 'name="clay-disabled-b" disabled')}</div><div><h4 class="clay-section-title">Switches</h4>${toggle('On', 'checked')}${toggle('Off')}${toggle('Disabled on', 'checked disabled')}${toggle('Disabled off', 'disabled')}</div></div>`)}
          </div>
        </div>
        ${group('controls', 'Controls', `<div class="clay-control-band"><div><h4 class="clay-section-title">Range slider</h4><div class="clay-range" style="--clay-value:68%"><output class="clay-value-flag" for="clay-range-input">68</output><input type="range" id="clay-range-input" min="0" max="100" value="68" aria-label="Clay range"><div class="clay-range-scale" aria-hidden="true">${[0, 25, 50, 75, 100].map((n) => `<span>${n}</span>`).join('')}</div></div></div><div><h4 class="clay-section-title">Continuous progress</h4><div data-clay-progress-line>${progress('Continuous progress', 68)}<span>68%</span></div><h4 class="clay-section-title">Segmented progress</h4><div data-clay-progress-line><div class="clay-segments" role="progressbar" aria-label="Segmented progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow="3">${[1, 2, 3, 4, 5].map((n) => `<span ${n <= 3 ? 'data-filled' : ''}></span>`).join('')}</div><span>3 / 5</span></div></div><div><h4 class="clay-section-title">Milestone progress</h4><ol class="clay-milestones">${['Research', 'Design', 'Build', 'Launch'].map((name, i) => `<li class="clay-milestone" ${i === 2 ? 'aria-current="step"' : ''}><span>${i < 2 ? icon('check') : i + 1}</span>${name}</li>`).join('')}</ol></div><div><h4 class="clay-section-title">Threshold meter</h4><div class="clay-threshold" style="--clay-value:72%" role="meter" aria-label="Threshold" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72"><span class="clay-value-flag">72</span><div class="clay-threshold-scale"><span>Safe</span><span>Caution</span><span>Danger</span></div></div></div><ol class="clay-vertical-progress" aria-label="Vertical progress">${['Discovery', 'Design', 'Build', 'Launch'].map((name, i) => `<li ${i === 2 ? 'aria-current="step"' : ''}><span>${i < 2 ? icon('check') : ''}</span>${name}</li>`).join('')}</ol></div>`)}
        <div class="clay-feedback-band">
          ${group('navigation', 'Navigation', `<div class="clay-navigation-band"><div><div class="clay-tabs" role="tablist" aria-label="Clay views">${['Overview', 'Activity', 'Files', 'Settings'].map((name, i) => `<button class="clay-tab" type="button" id="clay-tab-${i}" role="tab" aria-controls="clay-tab-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join('')}</div><div class="clay-tab-panel" id="clay-tab-panel" role="tabpanel" aria-labelledby="clay-tab-0" tabindex="0"><strong>Overview</strong><p>This is the active tab panel. Content is organized, readable, and purposeful.</p><span class="clay-tab-media" aria-hidden="true">${icon('image')}</span></div></div><div><h4 class="clay-section-title">Pagination</h4><nav class="clay-pagination" aria-label="Clay pages">${tool('chevron-left', 'Previous Clay page', 'data-clay-page="prev"')}${[1, 2, 3, 4, 5, 12].map((n) => `<button type="button" data-clay-page="${n}" ${n === 2 ? 'aria-current="page"' : ''}>${n}</button>`).join('')}${tool('chevron-right', 'Next Clay page', 'data-clay-page="next"')}</nav><p data-clay-page-label>Showing 11 to 20 of 114 results</p></div><div><h4 class="clay-section-title">Segmented control</h4><div class="clay-segmented" role="group" aria-label="Clay view layout">${['list', 'layout-grid', 'calendar', 'chart-no-axes-column'].map((name, i) => tool(name, name + ' view', 'aria-pressed="' + (i === 0) + '"')).join('')}</div></div><div><h4 class="clay-section-title">Quantity stepper</h4><div class="clay-quantity">${tool('minus', 'Decrease quantity', 'data-clay-quantity="-1"')}<output aria-label="Quantity">3</output>${tool('plus', 'Increase quantity', 'data-clay-quantity="1"')}</div></div></div>`)}
          ${group('alerts', 'Alerts', [['success', 'circle-check', 'Success! Your changes have been saved.'], ['info', 'info', 'Info message goes here.'], ['warning', 'triangle-alert', 'This action could have consequences.'], ['danger', 'circle-x', 'Something went wrong. Please try again.']].map(([variant, name, copy]) => `<div class="clay-alert clay-alert-${variant}">${icon(name)}<span>${copy}</span><button class="clay-alert-close" type="button" aria-label="Dismiss ${variant}" title="Dismiss ${variant}" data-clay-dismiss>${icon('x')}</button></div>`).join(''))}
          ${group('feedback', 'Tooltip', `<span class="clay-tooltip clay-tooltip-bottom" role="tooltip">Clay is intentional.<br>Every edge, depth,<br>and seam serves<br>a purpose.</span><h4 class="clay-section-title">Spinner</h4><span class="clay-spinner clay-spinner-lg" role="status" aria-label="Loading"></span>`)}
        </div>
        <div class="clay-data-band">
          ${group('badges', 'Data display', `<h4 class="clay-section-title">Badges</h4><div data-clay-badges>${[['New', 'primary'], ['In Progress', 'secondary'], ['Complete', 'success'], ['Blocked', 'danger']].map(([name, variant]) => `<span class="clay-badge clay-badge-${variant}">${name}</span>`).join('')}</div><div data-clay-badges><span class="clay-badge">Design</span><span class="clay-badge">v1.0.0</span><span class="clay-badge">12</span><span class="clay-badge">99+</span></div>`)}
          ${group('table', 'Data table', `<div class="clay-table-wrap" tabindex="0" role="region" aria-label="Studio tasks"><table class="clay-table"><thead><tr>${['Task', 'Owner', 'Status', 'Priority', 'Due Date', ''].map((name) => `<th scope="col">${name || '<span class="clay-sr-only">Actions</span>'}</th>`).join('')}</tr></thead><tbody>${rows.map((row, i) => `<tr>${row.map((value, j) => `<td>${j === 2 || j === 3 ? `<span class="clay-badge clay-badge-${j === 2 ? (i === 2 ? 'success' : i === 3 ? 'warning' : 'secondary') : (value === 'High' ? 'danger' : value === 'Medium' ? 'warning' : 'primary')}">${value}</span>` : value}</td>`).join('')}<td>${tool('ellipsis', 'Actions for ' + row[0], 'data-clay-row="' + i + '"')}</td></tr>`).join('')}</tbody></table></div>`)}
          ${group('avatars', 'Avatars', `<div class="clay-avatar-group" aria-label="Project team">${['Alex', 'James', 'Sam'].map((name, i) => `<span class="clay-avatar" style="--clay-avatar-position:${i * 50}%"><img src="${portraits}" alt="${name}, fictional team member" width="30" height="30"></span>`).join('')}<span class="clay-avatar" aria-label="3 more team members">+3</span></div><h4 class="clay-section-title">Text</h4><h3>Heading 1</h3><h4>Heading 2</h4>`)}
          ${group('text', 'Text', `<div class="clay-inset"><h3>Heading 1</h3><h4>Heading 2</h4><p>Body text</p><small>Caption &middot; Supporting text</small></div>`)}
          ${group('confirmation', 'Confirmation dialog', `<div class="clay-dialog">${confirmation()}<div class="clay-dialog-actions">${button('Cancel', '', 'data-clay-cancel')}${button('Confirm', 'primary', 'data-clay-open')}</div></div>`)}
        </div>
      </div>
      <dialog class="clay-dialog" aria-labelledby="clay-modal-title"><form method="dialog"><h3 id="clay-modal-title">Confirm Action</h3><p data-clay-modal-copy>This is a local demonstration. No project data will be changed.</p><div class="clay-dialog-actions"><button class="clay-button" value="cancel">Cancel</button><button class="clay-button clay-button-primary" value="confirm">Confirm action</button></div></form></dialog>
      <output class="clay-sr-only" aria-live="polite" data-clay-status></output>
    </section>`;
  }

  /**
   * Binds a freshly rendered sheet; the outer renderer replaces its DOM on mode changes.
   * @param {Function} changeMode Callback for the shared mode selector.
   * @returns {void}
   */
  function bind(changeMode) {
    const root = document.querySelector('#clay-template');
    if (!root) return;
    const status = root.querySelector('[data-clay-status]');
    const report = (message) => { status.textContent = message; };
    const modal = root.querySelector('dialog');
    let opener;
    root.querySelector('[data-clay-mode]').addEventListener('change', (event) => changeMode(event.target.value));
    root.querySelector('[data-clay-mixed]').indeterminate = true;
    root.querySelector('.clay-range input').addEventListener('input', (event) => {
      event.target.parentElement.style.setProperty('--clay-value', event.target.value + '%');
      event.target.parentElement.querySelector('output').value = event.target.value;
    });
    root.addEventListener('click', (event) => {
      const target = event.target.closest('button, a.clay-rail-link');
      if (!target || target.disabled) return;
      if (target.matches('[data-clay-remove]')) target.closest('.clay-chip').remove();
      if (target.matches('[data-clay-dismiss]')) target.closest('.clay-alert').remove();
      if (target.matches('[data-clay-action]')) report('Button activated.');
      if (target.matches('[data-clay-cancel]')) report('Action cancelled.');
      if (target.matches('[data-clay-search-clear]')) { const input = root.querySelector('#clay-field-search'); input.value = ''; input.focus(); }
      if (target.matches('[data-clay-number]')) {
        const input = root.querySelector('#clay-field-number');
        if (Number(target.dataset.clayNumber) > 0) input.stepUp(); else input.stepDown();
      }
      if (target.matches('[data-clay-open], [data-clay-row]')) { opener = target; modal.showModal(); }
      if (target.matches('[data-clay-password]')) {
        const input = root.querySelector('#clay-password');
        input.type = input.type === 'password' ? 'text' : 'password';
        target.setAttribute('aria-pressed', String(input.type === 'text'));
        target.setAttribute('aria-label', input.type === 'text' ? 'Hide password' : 'Show password');
        target.title = target.getAttribute('aria-label');
      }
      if (target.matches('[data-clay-quantity]')) {
        const output = root.querySelector('.clay-quantity output');
        output.value = String(Math.max(0, Math.min(99, Number(output.value) + Number(target.dataset.clayQuantity))));
      }
      if (target.matches('.clay-segmented button')) {
        root.querySelectorAll('.clay-segmented button').forEach((node) => node.setAttribute('aria-pressed', String(node === target)));
        report(target.getAttribute('aria-label') + ' selected.');
      }
      if (target.matches('.clay-rail-link')) {
        root.querySelectorAll('.clay-rail-link').forEach((node) => node.removeAttribute('aria-current'));
        target.setAttribute('aria-current', 'page');
      }
      if (target.matches('[data-clay-page]')) {
        const current = Number(root.querySelector('.clay-pagination [aria-current]').dataset.clayPage);
        const value = target.dataset.clayPage;
        const next = Math.max(1, Math.min(12, value === 'prev' ? current - 1 : value === 'next' ? current + 1 : Number(value)));
        const numbered = [...root.querySelectorAll('.clay-pagination [data-clay-page]')].filter((node) => /^\d+$/.test(node.dataset.clayPage));
        if (!numbered.some((node) => Number(node.dataset.clayPage) === next)) {
          numbered[4].dataset.clayPage = String(next); numbered[4].textContent = String(next);
        }
        numbered.forEach((node) => { if (Number(node.dataset.clayPage) === next) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current'); });
        root.querySelector('[data-clay-page-label]').textContent = `Showing ${(next - 1) * 10 + 1} to ${Math.min(next * 10, 114)} of 114 results`;
      }
    });
    modal.addEventListener('close', () => { report(modal.returnValue === 'confirm' ? 'Action confirmed.' : 'Action cancelled.'); opener?.focus(); });
    /** @param {string} selector Selector for roving focus. @param {Function} change Selection callback. @returns {void} */
    function roving(selector, change) {
      const items = [...root.querySelectorAll(selector)];
      const choose = (item) => {
        items.forEach((node) => { node.setAttribute('aria-selected', String(node === item)); node.tabIndex = node === item ? 0 : -1; });
        change(item);
      };
      items.forEach((item) => {
        item.addEventListener('click', () => choose(item));
        item.addEventListener('keydown', (event) => {
          const available = items.filter((node) => !node.disabled && !node.hidden);
          const index = available.indexOf(item);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % available.length : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + available.length - 1) % available.length : null;
          if (next === null) return;
          event.preventDefault(); choose(available[next]); available[next].focus();
        });
      });
    }
    roving('.clay-tab', (item) => {
      const panel = root.querySelector('.clay-tab-panel');
      panel.setAttribute('aria-labelledby', item.id); panel.querySelector('strong').textContent = item.textContent;
      panel.querySelector('p').textContent = { Overview: 'This is the active tab panel. Content is organized, readable, and purposeful.', Activity: 'Design review completed. Component build is in progress.', Files: 'Clay reference images and component specifications.', Settings: 'Studio workspace preferences.' }[item.textContent];
    });
    const select = root.querySelector('[aria-label="Discipline"]');
    roving('.clay-option:not(:disabled)', (item) => { select.value = item.textContent.trim(); report(select.value + ' selected.'); });
    select.addEventListener('change', () => {
      root.querySelectorAll('.clay-option').forEach((node) => { const selected = node.textContent.trim() === select.value; node.setAttribute('aria-selected', String(selected)); node.tabIndex = selected ? 0 : -1; });
    });
    root.querySelector('[aria-label="Search disciplines"]').addEventListener('input', (event) => {
      root.querySelectorAll('.clay-option').forEach((node) => { node.hidden = !node.textContent.toLowerCase().includes(event.target.value.toLowerCase()); });
    });
    root.querySelector('.clay-tags').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = root.querySelector('#clay-new-tag');
      const value = input.value.trim();
      if (!value) return;
      const chip = document.createElement('span'); chip.className = 'clay-chip';
      const label = document.createElement('span'); label.textContent = value;
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'clay-icon-button'; remove.dataset.clayRemove = '';
      remove.setAttribute('aria-label', 'Remove ' + value); remove.title = 'Remove ' + value; remove.innerHTML = icon('x');
      chip.append(label, remove); root.querySelector('.clay-tags > div').append(chip); input.value = ''; input.focus();
    });
    const upload = root.querySelector('input[type="file"]');
    const zone = upload.closest('.clay-file-zone');
    /** @param {File} file Local selection. @returns {void} */
    const showFile = (file) => {
      const accepted = file && /\.(pdf|docx|xlsx|png)$/i.test(file.name) && file.size <= 10 * 1024 * 1024;
      const message = !file ? 'Drop files here or' : accepted ? file.name : 'Choose a supported file under 10MB.';
      zone.querySelector('[data-clay-file-label]').textContent = message; report(message);
    };
    upload.addEventListener('change', () => showFile(upload.files[0]));
    zone.addEventListener('dragover', (event) => event.preventDefault());
    zone.addEventListener('drop', (event) => { event.preventDefault(); showFile(event.dataTransfer.files[0]); });
  }
  return { render, bind };
})();
