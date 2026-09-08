/**
 * @file Bento-only Soft Mosaic specimen. All visual rules belong to the library.
 * Interactions operate on local sample data and never contact a service.
 */
(function () {
  'use strict';

  let nativeObserver;
  let nativeFrame = 0;

  /**
   * Packs the demo's unequal native samples into responsive grid tracks.
   * Observed content dimensions keep expanded details, fonts, and resizing in sync.
   * @returns {void}
   */
  function bindNativeSamples() {
    const grid = document.querySelector('.demo-native-grid');
    if (!grid) return;
    grid.setAttribute('data-bento-layout', '');
    const samples = [...grid.children];
    const measure = () => {
      if (!grid.isConnected) return;
      const style = getComputedStyle(grid);
      const row = parseFloat(style.gridAutoRows);
      const gap = parseFloat(style.rowGap);
      const spans = samples.map(sample => Math.ceil((sample.getBoundingClientRect().height + gap) / (row + gap)));
      samples.forEach((sample, index) => {
        const span = `span ${spans[index]}`;
        if (sample.style.gridRowEnd !== span) sample.style.gridRowEnd = span;
      });
    };
    const schedule = () => {
      if (nativeFrame) return;
      nativeFrame = requestAnimationFrame(() => { nativeFrame = 0; measure(); });
    };
    measure();
    nativeObserver = new ResizeObserver(schedule);
    samples.forEach(sample => nativeObserver.observe(sample));
    nativeObserver.observe(grid);
    document.fonts.ready.then(schedule);
  }

  /** @param {string} name Licensed Lucide identifier. @returns {string} Decorative icon markup. */
  function icon(name) {
    return (window.UI_STYLE_KIT_ICONS[name] || '').replace('<svg', '<svg aria-hidden="true"');
  }

  /** @param {string} title Panel title. @param {string} name Icon name. @returns {string} Panel heading. */
  function header(title, name = 'layout-grid') {
    return `<header><h2>${title}</h2>${icon(name)}</header>`;
  }

  /** @param {string} title Field label. @param {string} control Control markup. @returns {string} Labeled field. */
  function field(title, control) {
    return `<label class="bento-field"><span>${title}</span>${control}</label>`;
  }

  /** @param {string} ui Selected preset. @param {string} mode Selected mode. @returns {string} Preset-only specimen. */
  function render(ui, mode) {
    if (ui !== 'bento') return '';
    const assets = location.pathname.includes('/demo/') ? 'assets/' : 'demo/assets/';
    return `<section class="bento-sheet" data-mode="${mode}" aria-label="Bento Soft Mosaic">
      <aside class="bento-sidebar">
        <div class="bento-brand"><span class="bento-brand-mark">${icon('layout-grid')}</span><span><strong>Soft Mosaic</strong><small>Bento UI</small></span></div>
        <nav aria-label="Bento sections">
          <button type="button" class="is-active" data-bento-go="bento-overview">${icon('house')}Overview</button>
          <button type="button" data-bento-go="bento-controls">${icon('settings')}Components</button>
          <button type="button" data-bento-go="bento-data">${icon('list')}Data</button>
        </nav>
        <div class="bento-sidebar-spacer"></div>
        <div class="bento-sidebar-note"><strong>Workspace</strong><p>Personal sandbox</p></div>
        <button type="button" class="bento-button bento-button-secondary" data-bento-reference>Use reference palette</button>
        <button type="button" class="bento-theme-toggle" data-bento-mode>${icon('eye')}<span>${mode === 'light' ? 'Light' : 'Dark'} mode</span><span class="bento-switch ${mode !== 'light' ? 'is-on' : ''}" aria-hidden="true"><span></span></span></button>
      </aside>
      <div class="bento-canvas">
        <div class="bento-top-grid" id="bento-overview">
          <article class="bento-panel bento-hero"><div class="bento-hero-copy"><span class="bento-eyebrow">Component library</span><h1>Bento UI<br><span>Soft Mosaic</span></h1><div class="bento-inline-actions"><button type="button" class="bento-button bento-button-primary" data-bento-go="bento-controls">Components ${icon('arrow-right')}</button></div></div><div class="bento-hero-art" aria-hidden="true"><img src="${assets}bento-reference-${mode === 'light' ? 'light' : 'dark'}.png" alt=""></div></article>
          <article class="bento-panel bento-actions">${header('Quick actions', 'plus')}
            <button type="button" class="bento-button bento-button-primary" data-bento-notice="Primary action selected">Primary</button>
            <button type="button" class="bento-button is-hover" data-bento-notice="Hover action selected">Hover state</button>
            <button type="button" class="bento-button is-busy" aria-busy="true" disabled>Busy state</button>
            <button type="button" class="bento-button bento-button-secondary" data-bento-notice="Secondary action selected">Secondary</button>
            <button type="button" class="bento-button bento-button-danger" data-bento-show>Danger</button>
            <button type="button" class="bento-button bento-button-warning" data-bento-notice="Warning acknowledged">Warning</button>
            <button type="button" class="bento-button bento-button-ghost" data-bento-notice="Ghost action selected">Ghost</button>
            <button type="button" class="bento-button" disabled>Disabled</button>
          </article>
          <article class="bento-panel bento-system">${header('System status', 'layers')}<p><span class="bento-live-dot"></span>All systems operational</p>
            ${[['API Gateway', '99.98'], ['Data Service', '99.91'], ['Web App', '100']].map(([name, value]) => `<div class="bento-service-row"><span><strong>${name}</strong><small>${value}%</small></span><progress value="${value}" max="100" aria-label="${name} availability"></progress></div>`).join('')}
            <small>Sample service metrics</small><button type="button" data-bento-go="bento-service">View service ${icon('arrow-right')}</button>
          </article>
          <div class="bento-metrics-stack"><article class="bento-panel bento-usage">${header('Usage this month', 'chart-no-axes-column')}<strong>12.4K</strong><span>API requests</span><div><span class="bento-status is-warning">+18.6%</span><small>vs last month</small></div><progress value="72" max="100" aria-label="Monthly usage"></progress></article><article class="bento-panel bento-quota"><div class="bento-quota-copy"><h2>Quota remaining</h2><strong>68%</strong><span>6.8K of 10K requests left</span></div><meter value="68" max="100" aria-label="Remaining quota"></meter></article></div>
        </div>
        <div class="bento-middle-grid" id="bento-controls">
          <article class="bento-panel bento-form-panel">${header('Inputs', 'pencil')}<div class="bento-form-grid">
            ${field('Text', '<input type="text" placeholder="Type something...">')}
            ${field('Search', '<input type="search" placeholder="Search here...">')}
            ${field('Email', '<input type="email" value="team@example.com">')}
            ${field('Password', `<span class="bento-input-icon is-end"><input name="password" type="password" value="mosaic-demo"><button type="button" aria-label="Show password" data-bento-password>${icon('eye')}</button></span>`)}
            ${field('URL', '<input type="url" placeholder="https://">')}
            ${field('Select', '<select><option>Choose option</option><option>Personal</option><option>Team</option></select>')}
            ${field('Date', '<input type="date" value="2026-09-06">')}
            ${field('Time', '<input type="time" value="09:30">')}
            ${field('Number', '<input type="number" value="12" min="0">')}
            ${field('Color', '<input type="color" value="#3157dc">')}
            <label class="bento-field bento-file"><span>File</span><input type="file" aria-label="Upload file"><span>${icon('upload')}<span data-bento-file-label>Upload file</span></span></label>
            ${field('Textarea', '<textarea placeholder="Write a short note..."></textarea>')}
          </div></article>
          <article class="bento-panel bento-choices">${header('Choices', 'check')}<fieldset><legend>Checkboxes</legend><label><input type="checkbox" checked>Enable feature</label><label><input type="checkbox">Send email updates</label></fieldset><fieldset><legend>Radio buttons</legend><label><input type="radio" name="bento-choice" checked>Option one</label><label><input type="radio" name="bento-choice">Option two</label></fieldset><h3>Switches</h3><div class="bento-switch-row"><span>Notifications</span><button type="button" class="bento-switch" role="switch" aria-checked="true" aria-label="Notifications"><span></span></button></div><div class="bento-switch-row"><span>Unavailable</span><button type="button" class="bento-switch" role="switch" aria-checked="false" aria-label="Unavailable" disabled><span></span></button></div></article>
          <article class="bento-panel bento-sliders">${header('Sliders & meters', 'settings')}<label><span>Slider <output data-bento-range-value>72</output></span><input type="range" min="0" max="100" value="72" data-bento-range></label><label><span>Progress <span>3 of 5</span></span><progress value="3" max="5" aria-label="Setup progress"></progress></label><label><span>Meter <span>64%</span></span><meter value="64" max="100" aria-label="Capacity"></meter></label><div class="bento-stepper" aria-label="Setup: step 2 of 4"><span class="is-complete">${icon('check')}</span><i></i><span class="is-current">2</span><i></i><span>3</span><i></i><span>4</span></div><div class="bento-segment" role="group" aria-label="Billing period">${['Weekly', 'Monthly', 'Yearly'].map(name => `<button type="button" aria-pressed="${name === 'Monthly'}" class="${name === 'Monthly' ? 'is-active' : ''}">${name}</button>`).join('')}</div></article>
          <article class="bento-panel">${header('Badges & feedback', 'info')}<div class="bento-badges">${[['success', 'New'], ['violet', 'Beta'], ['success', 'Updated'], ['warning', 'Warning'], ['danger', 'Error'], ['info', 'Info']].map(([state, name]) => `<span class="bento-status is-${state}">${name}</span>`).join('')}</div><div class="bento-alert bento-alert-danger">${icon('triangle-alert')}<span><strong>Payment failed</strong><small>Your card was declined.</small></span><button type="button" aria-label="Dismiss error" data-bento-dismiss>${icon('x')}</button></div><div class="bento-toast" role="status">${icon('circle-check')}<span><strong>Changes saved</strong><small>Your settings are current.</small></span><button type="button" aria-label="Dismiss confirmation" data-bento-dismiss>${icon('x')}</button></div></article>
          <article class="bento-panel bento-tooltip">${header('Tooltip', 'info')}<button type="button" aria-label="Information" aria-describedby="bento-tip">${icon('info')}</button><span id="bento-tip" role="tooltip">Helpful context for this control.</span></article>
          <article class="bento-panel bento-loading">${header('Loading', 'ellipsis')}<span class="bento-spinner" role="status" aria-label="Loading"></span><div class="bento-skeleton" aria-hidden="true"><span></span><span></span><span></span></div></article>
        </div>
        <div class="bento-bottom-grid" id="bento-data">
          <article class="bento-panel bento-table-panel">${header('Data table', 'list')}<div class="bento-table-tools"><label class="bento-field"><span>Filter customers</span><input type="search" data-bento-filter placeholder="Customer name"></label></div><div class="bento-table-wrap" tabindex="0" role="region" aria-label="Customer subscriptions"><table><caption class="bento-visually-hidden">Sample customer subscriptions</caption><thead><tr><th scope="col">Customer</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">Usage</th></tr></thead><tbody>
            ${[['Acme Corp', 'Pro', 'Active', 78], ['Northwind', 'Team', 'Active', 61], ['Globex Inc.', 'Pro', 'Suspended', 24], ['Initech', 'Starter', 'Invited', 8]].map(([name, plan, state, usage]) => `<tr data-bento-customer="${name.toLowerCase()}"><td>${name}</td><td>${plan}</td><td><span class="bento-status is-${state === 'Active' ? 'success' : state === 'Suspended' ? 'warning' : 'info'}">${state}</span></td><td><div class="bento-usage-cell"><span>${usage}%</span><progress value="${usage}" max="100" aria-label="${name} usage"></progress></div></td></tr>`).join('')}
          </tbody></table></div><footer><span data-bento-count>4 customers</span></footer></article>
          <article class="bento-panel bento-service-card" id="bento-service"><header><div class="bento-service-icon">${icon('messages-square')}</div><h2>Email Service</h2></header><p>Transactional and marketing messages</p><dl><div><dt>Status</dt><dd>Operational</dd></div><div><dt>Region</dt><dd>us-east-1</dd></div><div><dt>SLA</dt><dd>99.9%</dd></div></dl><div class="bento-listbox" role="listbox" aria-label="Environment"><button type="button" role="option" aria-selected="true" tabindex="0">Production</button><button type="button" role="option" aria-selected="false" tabindex="-1">Staging</button></div><details><summary>Service notes ${icon('plus')}</summary><p>Automatic failover is enabled.</p></details><button type="button" class="bento-button bento-button-secondary" data-bento-details>View details</button></article>
          <article class="bento-panel bento-dialog-zone"><div class="bento-dialog-toolbar"><div class="bento-tabs" role="tablist" aria-label="Service views">${['Overview', 'Activity', 'Settings'].map((name, i) => `<button type="button" role="tab" id="bento-tab-${i}" aria-controls="bento-view" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="${i === 0 ? 'is-active' : ''}" data-bento-tab="${i}">${name}</button>`).join('')}</div><button type="button" data-bento-show>Show dialog</button></div><div class="bento-dialog-surface" id="bento-view" role="tabpanel" aria-labelledby="bento-tab-0"><p data-bento-view hidden></p><dialog open aria-labelledby="bento-dialog-title"><button type="button" class="bento-dialog-close" aria-label="Close dialog" data-bento-close>${icon('x')}</button><span class="bento-dialog-icon">${icon('layers')}</span><h2 id="bento-dialog-title">Confirm action</h2><p>Apply the sample workspace changes?</p><div><button type="button" class="bento-button bento-button-secondary" data-bento-close>Cancel</button><button type="button" class="bento-button bento-button-primary" data-bento-confirm>Confirm</button></div></dialog></div></article>
        </div>
        <p class="bento-live-status" aria-live="polite" data-bento-live></p>
      </div>
    </section>`;
  }

  /**
   * Binds local specimen behavior after the demo replaces its content.
   * @param {Function} onReference Select the preset fallback palette.
   * @param {Function} onMode Select the shared light/dark mode.
   * @returns {void}
   */
  function bind(onReference, onMode) {
    nativeObserver?.disconnect();
    cancelAnimationFrame(nativeFrame);
    nativeFrame = 0;
    // Native examples also need packing when the full reference board is not displayed.
    if (document.body.dataset.ui === 'bento') bindNativeSamples();
    const root = document.querySelector('.bento-sheet');
    if (!root) return;
    const dialog = root.querySelector('dialog');
    const announce = message => { root.querySelector('[data-bento-live]').textContent = message; };
    root.querySelector('[data-bento-reference]').onclick = onReference;
    root.querySelector('[data-bento-mode]').onclick = () => onMode(root.dataset.mode === 'light' ? 'dark' : 'light');
    root.querySelectorAll('[data-bento-go]').forEach(button => {
      button.onclick = () => {
        root.querySelector(`#${button.dataset.bentoGo}`).scrollIntoView({ block: 'center' });
        root.querySelectorAll('.bento-sidebar nav button').forEach(item => item.classList.toggle('is-active', item.dataset.bentoGo === button.dataset.bentoGo));
      };
    });
    root.querySelector('[data-bento-password]').onclick = event => {
      const input = root.querySelector('[name="password"]');
      input.type = input.type === 'password' ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    };
    root.querySelector('[data-bento-range]').oninput = event => { root.querySelector('[data-bento-range-value]').textContent = event.target.value; };
    root.querySelector('input[type="file"]').onchange = event => { root.querySelector('[data-bento-file-label]').textContent = event.target.files[0]?.name || 'Upload file'; };
    root.querySelectorAll('button[role="switch"]').forEach(button => { button.onclick = () => button.setAttribute('aria-checked', String(button.getAttribute('aria-checked') !== 'true')); });
    root.querySelectorAll('[data-bento-notice]').forEach(button => { button.onclick = () => announce(button.dataset.bentoNotice); });
    root.querySelectorAll('[data-bento-dismiss]').forEach(button => { button.onclick = () => { button.parentElement.hidden = true; announce('Message dismissed'); }; });
    root.querySelectorAll('[data-bento-show]').forEach(button => { button.onclick = () => { dialog.show(); dialog.querySelector('[data-bento-close]').focus(); }; });
    root.querySelectorAll('[data-bento-close], [data-bento-confirm]').forEach(button => { button.onclick = () => { dialog.close(); announce(button.hasAttribute('data-bento-confirm') ? 'Sample changes confirmed' : 'Action cancelled'); root.querySelector('[data-bento-show]').focus(); }; });
    root.querySelector('[data-bento-details]').onclick = () => { root.querySelector('.bento-service-card details').open = !root.querySelector('.bento-service-card details').open; };
    root.querySelector('[data-bento-filter]').oninput = event => {
      let count = 0;
      root.querySelectorAll('[data-bento-customer]').forEach(row => { row.hidden = !row.dataset.bentoCustomer.includes(event.target.value.trim().toLowerCase()); if (!row.hidden) count += 1; });
      root.querySelector('[data-bento-count]').textContent = `${count} customers`;
    };
    for (const selector of ['.bento-listbox button', '.bento-tabs button', '.bento-segment button']) {
      const buttons = [...root.querySelectorAll(selector)];
      buttons.forEach((button, index) => {
        button.onclick = () => {
          buttons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute(selector.includes('segment') ? 'aria-pressed' : 'aria-selected', String(active)); if (!selector.includes('segment')) item.tabIndex = active ? 0 : -1; });
          if (button.hasAttribute('data-bento-tab')) {
            const panel = root.querySelector('#bento-view');
            const text = root.querySelector('[data-bento-view]');
            panel.setAttribute('aria-labelledby', button.id);
            text.textContent = ['Workspace overview', 'No recent activity', 'Notifications are managed in Choices'][index];
            text.hidden = false;
            dialog.close();
          }
        };
        button.onkeydown = event => {
          const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
          if (!direction && !['Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + direction + buttons.length) % buttons.length;
          buttons[next].focus(); buttons[next].click();
        };
      });
    }
  }

  window.BentoSpecimen = { render, bind };
}());
