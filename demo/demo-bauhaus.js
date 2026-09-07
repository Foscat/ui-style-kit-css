/**
 * @file Bauhaus-only Workshop Components specimen. All visual rules belong to the library.
 * Interactions operate on local sample data and never contact a service.
 */
(function () {
  'use strict';

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
    return `<label class="bau-field"><span>${title}</span>${control}</label>`;
  }

  /** @param {string} ui Selected preset. @param {string} mode Selected mode. @returns {string} Preset-only specimen. */
  function render(ui, mode) {
    if (ui !== 'bauhaus') return '';
    const assets = location.pathname.includes('/demo/') ? 'assets/' : 'demo/assets/';
    return `<section class="bau-sheet" data-mode="${mode}" aria-label="Bauhaus Workshop Components">
      <aside class="bau-sidebar">
        <div class="bau-brand"><span class="bau-brand-mark">${icon('layout-grid')}</span><span><strong>Workshop Components</strong><small>Bauhaus UI</small></span></div>
        <nav aria-label="Bauhaus sections">
          <button type="button" class="is-active" data-bau-go="bau-overview">${icon('house')}Overview</button>
          <button type="button" data-bau-go="bau-controls">${icon('settings')}Components</button>
          <button type="button" data-bau-go="bau-data">${icon('list')}Data</button>
        </nav>
        <div class="bau-sidebar-spacer"></div>
        <div class="bau-sidebar-note"><strong>Workspace</strong><p>Personal sandbox</p></div>
        <button type="button" class="bau-button bau-button-secondary" data-bau-reference>Use reference palette</button>
        <button type="button" class="bau-theme-toggle" data-bau-mode>${icon('eye')}<span>${mode === 'light' ? 'Light' : 'Dark'} mode</span><span class="bau-compact-switch ${mode !== 'light' ? 'is-on' : ''}" aria-hidden="true"><span></span></span></button>
      </aside>
      <div class="bau-canvas">
        <div class="bau-top-grid" id="bau-overview">
          <article class="bau-panel bau-hero"><div class="bau-hero-copy"><span class="bau-eyebrow">Component library</span><h1>Bauhaus<br><span>Workshop Components</span></h1><div class="bau-inline-actions"><button type="button" class="bau-button bau-button-primary" data-bau-go="bau-controls">Components ${icon('arrow-right')}</button></div></div></article>
          <article class="bau-panel bau-actions">${header('Quick actions', 'plus')}
            <button type="button" class="bau-button bau-button-primary" data-bau-notice="Primary action selected">Primary</button>
            <button type="button" class="bau-button bau-button-primary is-hover" data-bau-notice="Hover action selected">Hover state</button>
            <button type="button" class="bau-button bau-button-primary is-busy" aria-busy="true" disabled>Busy state</button>
            <button type="button" class="bau-button bau-button-secondary" data-bau-notice="Secondary action selected">Secondary</button>
            <button type="button" class="bau-button bau-button-danger" data-bau-show>Danger</button>
            <button type="button" class="bau-button bau-button-warning" data-bau-notice="Warning acknowledged">Warning</button>
            <button type="button" class="bau-button bau-button-ghost" data-bau-notice="Ghost action selected">Ghost</button>
            <button type="button" class="bau-button" disabled>Disabled</button>
          </article>
          <article class="bau-panel bau-system">${header('System status', 'layers')}<p><span class="bau-live-dot"></span>All systems operational</p>
            ${[['API Gateway', '99.98'], ['Data Service', '99.91'], ['Web App', '100']].map(([name, value]) => `<div class="bau-service-row"><span><strong>${name}</strong><small>${value}%</small></span><progress value="${value}" max="100" aria-label="${name} availability"></progress></div>`).join('')}
            <small>Sample service metrics</small><button type="button" data-bau-go="bau-service">View service ${icon('arrow-right')}</button>
          </article>
          <div class="bau-metrics-stack"><article class="bau-panel bau-usage">${header('Usage this month', 'chart-no-axes-column')}<strong>12.4K</strong><span>API requests</span><div><span class="bau-status is-warning">+18.6%</span><small>vs last month</small></div><progress value="72" max="100" aria-label="Monthly usage"></progress></article><article class="bau-panel bau-quota"><div class="bau-quota-copy"><h2>Quota remaining</h2><strong>68%</strong><span>6.8K of 10K requests left</span></div><meter value="68" max="100" aria-label="Remaining quota"></meter></article></div>
        </div>
        <div class="bau-middle-grid" id="bau-controls">
          <article class="bau-panel bau-form-panel">${header('Inputs', 'pencil')}<div class="bau-form-grid">
            ${field('Text', '<input type="text" placeholder="Type something...">')}
            ${field('Search', '<input type="search" placeholder="Search here...">')}
            ${field('Email', '<input type="email" value="team@example.com">')}
            ${field('Password', `<span class="bau-input-icon is-end"><input name="password" type="password" value="mosaic-demo"><button type="button" aria-label="Show password" data-bau-password>${icon('eye')}</button></span>`)}
            ${field('URL', '<input type="url" placeholder="https://">')}
            ${field('Select', '<select><option>Choose option</option><option>Personal</option><option>Team</option></select>')}
            ${field('Date', '<input type="date" value="2026-09-06">')}
            ${field('Time', '<input type="time" value="09:30">')}
            ${field('Number', '<input type="number" value="12" min="0">')}
            ${field('Color', '<input type="color" value="#3157dc">')}
            <label class="bau-field bau-file"><span>File</span><input type="file" aria-label="Upload file"><span>${icon('upload')}<span data-bau-file-label>Upload file</span></span></label>
            ${field('Textarea', '<textarea placeholder="Write a short note..."></textarea>')}
          </div></article>
          <article class="bau-panel bau-choices">${header('Choices', 'check')}<fieldset><legend>Checkboxes</legend><label><input type="checkbox" checked>Enable feature</label><label><input type="checkbox">Send email updates</label></fieldset><fieldset><legend>Radio buttons</legend><label><input type="radio" name="bau-choice" checked>Option one</label><label><input type="radio" name="bau-choice">Option two</label></fieldset><h3>Switches</h3><div class="bau-switch-row"><span>Notifications</span><button type="button" class="bau-compact-switch" role="switch" aria-checked="true" aria-label="Notifications"><span></span></button></div><div class="bau-switch-row"><span>Unavailable</span><button type="button" class="bau-compact-switch" role="switch" aria-checked="false" aria-label="Unavailable" disabled><span></span></button></div></article>
          <article class="bau-panel bau-sliders">${header('Sliders & meters', 'settings')}<label><span>Slider <output data-bau-range-value>72</output></span><input type="range" min="0" max="100" value="72" data-bau-range></label><label><span>Progress <span>3 of 5</span></span><progress value="3" max="5" aria-label="Setup progress"></progress></label><label><span>Meter <span>64%</span></span><meter value="64" max="100" aria-label="Capacity"></meter></label><div class="bau-stepper" aria-label="Setup: step 2 of 4"><span class="is-complete">${icon('check')}</span><i></i><span class="is-current">2</span><i></i><span>3</span><i></i><span>4</span></div><div class="bau-segment" role="group" aria-label="Billing period">${['Weekly', 'Monthly', 'Yearly'].map(name => `<button type="button" aria-pressed="${name === 'Monthly'}" class="${name === 'Monthly' ? 'is-active' : ''}">${name}</button>`).join('')}</div></article>
          <article class="bau-panel">${header('Badges & feedback', 'info')}<div class="bau-badges">${[['success', 'New'], ['violet', 'Beta'], ['success', 'Updated'], ['warning', 'Warning'], ['danger', 'Error'], ['info', 'Info']].map(([state, name]) => `<span class="bau-status is-${state}">${name}</span>`).join('')}</div><div class="bau-alert bau-alert-danger">${icon('triangle-alert')}<span><strong>Payment failed</strong><small>Your card was declined.</small></span><button type="button" aria-label="Dismiss error" data-bau-dismiss>${icon('x')}</button></div><div class="bau-toast" role="status">${icon('circle-check')}<span><strong>Changes saved</strong><small>Your settings are current.</small></span><button type="button" aria-label="Dismiss confirmation" data-bau-dismiss>${icon('x')}</button></div></article>
          <div class="bau-utility-stack"><article class="bau-panel bau-tooltip-panel">${header('Tooltip', 'info')}<button type="button" aria-label="Information" aria-describedby="bau-tip">${icon('info')}</button><span id="bau-tip" role="tooltip">Helpful context for this control.</span></article>
          <article class="bau-panel bau-loading">${header('Loading', 'ellipsis')}<span class="bau-spinner" role="status" aria-label="Loading"></span><div class="bau-skeleton" aria-hidden="true"><span></span><span></span><span></span></div></article></div>
        </div>
        <div class="bau-bottom-grid" id="bau-data">
          <article class="bau-panel bau-table-panel">${header('Data table', 'list')}<div class="bau-table-tools"><label class="bau-field"><span>Filter customers</span><input type="search" data-bau-filter placeholder="Customer name"></label></div><div class="bau-table-wrap" tabindex="0" role="region" aria-label="Customer subscriptions"><table><caption class="bau-visually-hidden">Sample customer subscriptions</caption><thead><tr><th scope="col">Customer</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">Usage</th></tr></thead><tbody>
            ${[['Acme Corp', 'Pro', 'Active', 78], ['Northwind', 'Team', 'Active', 61], ['Globex Inc.', 'Pro', 'Suspended', 24], ['Initech', 'Starter', 'Invited', 8]].map(([name, plan, state, usage]) => `<tr data-bau-customer="${name.toLowerCase()}"><td>${name}</td><td>${plan}</td><td><span class="bau-status is-${state === 'Active' ? 'success' : state === 'Suspended' ? 'warning' : 'info'}">${state}</span></td><td><div class="bau-usage-cell"><span>${usage}%</span><progress value="${usage}" max="100" aria-label="${name} usage"></progress></div></td></tr>`).join('')}
          </tbody></table></div><footer><span data-bau-count>4 customers</span></footer></article>
          <article class="bau-panel bau-service-card" id="bau-service"><header><div class="bau-service-icon">${icon('messages-square')}</div><h2>Email Service</h2></header><p>Transactional and marketing messages</p><dl><div><dt>Status</dt><dd>Operational</dd></div><div><dt>Region</dt><dd>us-east-1</dd></div><div><dt>SLA</dt><dd>99.9%</dd></div></dl><div class="bau-listbox" role="listbox" aria-label="Environment"><button type="button" role="option" aria-selected="true" tabindex="0">Production</button><button type="button" role="option" aria-selected="false" tabindex="-1">Staging</button></div><details><summary>Service notes ${icon('plus')}</summary><p>Automatic failover is enabled.</p></details><button type="button" class="bau-button bau-button-secondary" data-bau-details>View details</button></article>
          <article class="bau-panel bau-dialog-zone"><div class="bau-dialog-toolbar"><div class="bau-tabs" role="tablist" aria-label="Service views">${['Overview', 'Activity', 'Settings'].map((name, i) => `<button type="button" role="tab" id="bau-tab-${i}" aria-controls="bau-view" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="${i === 0 ? 'is-active' : ''}" data-bau-tab="${i}">${name}</button>`).join('')}</div><button type="button" data-bau-show>Show dialog</button></div><div class="bau-dialog-surface" id="bau-view" role="tabpanel" aria-labelledby="bau-tab-0"><p data-bau-view hidden></p><dialog open aria-labelledby="bau-dialog-title"><button type="button" class="bau-dialog-close" aria-label="Close dialog" data-bau-close>${icon('x')}</button><span class="bau-dialog-icon">${icon('layers')}</span><h2 id="bau-dialog-title">Confirm action</h2><p>Apply the sample workspace changes?</p><div><button type="button" class="bau-button bau-button-secondary" data-bau-close>Cancel</button><button type="button" class="bau-button bau-button-primary" data-bau-confirm>Confirm</button></div></dialog></div></article>
        </div>
        <details class="bau-reference"><summary>Reference board</summary><img class="bau-hero-art" src="${assets}bauhaus-reference-${mode === 'light' ? 'light' : 'dark'}.png" alt="Bauhaus source component board"></details><p class="bau-live-status" aria-live="polite" data-bau-live></p>
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
    const root = document.querySelector('.bau-sheet');
    if (!root) return;
    const dialog = root.querySelector('dialog');
    const announce = message => { root.querySelector('[data-bau-live]').textContent = message; };
    root.querySelector('[data-bau-reference]').onclick = onReference;
    root.querySelector('[data-bau-mode]').onclick = () => onMode(root.dataset.mode === 'light' ? 'dark' : 'light');
    root.querySelectorAll('[data-bau-go]').forEach(button => {
      button.onclick = () => {
        root.querySelector(`#${button.dataset.bauGo}`).scrollIntoView({ block: 'center' });
        root.querySelectorAll('.bau-sidebar nav button').forEach(item => item.classList.toggle('is-active', item.dataset.bauGo === button.dataset.bauGo));
      };
    });
    root.querySelector('[data-bau-password]').onclick = event => {
      const input = root.querySelector('[name="password"]');
      input.type = input.type === 'password' ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    };
    root.querySelector('[data-bau-range]').oninput = event => { root.querySelector('[data-bau-range-value]').textContent = event.target.value; };
    root.querySelector('input[type="file"]').onchange = event => { root.querySelector('[data-bau-file-label]').textContent = event.target.files[0]?.name || 'Upload file'; };
    root.querySelectorAll('button[role="switch"]').forEach(button => { button.onclick = () => button.setAttribute('aria-checked', String(button.getAttribute('aria-checked') !== 'true')); });
    root.querySelectorAll('[data-bau-notice]').forEach(button => { button.onclick = () => announce(button.dataset.bauNotice); });
    root.querySelectorAll('[data-bau-dismiss]').forEach(button => { button.onclick = () => { button.parentElement.hidden = true; announce('Message dismissed'); }; });
    root.querySelectorAll('[data-bau-show]').forEach(button => { button.onclick = () => { dialog.show(); dialog.querySelector('[data-bau-close]').focus(); }; });
    root.querySelectorAll('[data-bau-close], [data-bau-confirm]').forEach(button => { button.onclick = () => { dialog.close(); announce(button.hasAttribute('data-bau-confirm') ? 'Sample changes confirmed' : 'Action cancelled'); root.querySelector('[data-bau-show]').focus(); }; });
    root.querySelector('[data-bau-details]').onclick = () => { root.querySelector('.bau-service-card details').open = !root.querySelector('.bau-service-card details').open; };
    root.querySelector('[data-bau-filter]').oninput = event => {
      let count = 0;
      root.querySelectorAll('[data-bau-customer]').forEach(row => { row.hidden = !row.dataset.bauCustomer.includes(event.target.value.trim().toLowerCase()); if (!row.hidden) count += 1; });
      root.querySelector('[data-bau-count]').textContent = `${count} customers`;
    };
    for (const selector of ['.bau-listbox button', '.bau-tabs button', '.bau-segment button']) {
      const buttons = [...root.querySelectorAll(selector)];
      buttons.forEach((button, index) => {
        button.onclick = () => {
          buttons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute(selector.includes('segment') ? 'aria-pressed' : 'aria-selected', String(active)); if (!selector.includes('segment')) item.tabIndex = active ? 0 : -1; });
          if (button.hasAttribute('data-bau-tab')) {
            const panel = root.querySelector('#bau-view');
            const text = root.querySelector('[data-bau-view]');
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

  window.BauhausSpecimen = { render, bind };
}());
